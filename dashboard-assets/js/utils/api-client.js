/**
 * Centralized API Client for Host Dashboard
 * Handles all API communications with proper error handling and retry logic
 */

class ApiClient {
  constructor() {
    this.baseURL = this.getBaseURL();
    this.token = this.getTokenFromSession();
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Get base URL based on environment
   */
  getBaseURL() {
    const isLocal = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' || 
                   window.location.protocol === 'file:';
    return isLocal ? 'http://localhost:8000' : 'https://t2-237c.onrender.com';
  }

  /**
   * Get session data (same pattern as other pages)
   */
  getSessionData() {
    const session = localStorage.getItem('nexus_session') || sessionStorage.getItem('nexus_session');
    try {
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error parsing session data:', error);
      localStorage.removeItem('nexus_session');
      sessionStorage.removeItem('nexus_session');
      return null;
    }
  }

  /**
   * Get token from session data
   */
  getTokenFromSession() {
    const sessionData = this.getSessionData();
    return sessionData?.token || null;
  }

  /**
   * Set authentication token (updates session)
   */
  setToken(token) {
    this.token = token;
    const sessionData = this.getSessionData();
    if (sessionData) {
      sessionData.token = token;
      localStorage.setItem('nexus_session', JSON.stringify(sessionData));
    }
  }

  /**
   * Clear authentication token (same pattern as other pages)
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('nexus_session');
    sessionStorage.removeItem('nexus_session');
  }

  /**
   * Get default headers
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Always get fresh token from session
    const currentToken = this.getTokenFromSession();
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
      this.token = currentToken; // Update cached token
    }

    return headers;
  }

  /**
   * Make HTTP request with retry logic
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    let config = {
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {})
      },
      ...options,
    };
    
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, config);
        
        if (response.status === 401) {
          this.clearToken();
          window.location.href = 'auth.html';
          throw new ApiError('Authentication required. Please log in again.', 401);
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(
            errorData.detail || errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData
          );
        }
        
        // Handle responses that might not have a body (like CSV download)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/csv")) {
            return response.blob();
        }
        
        if (response.status === 204) {
            return { success: true, data: null };
        }

        return await response.json();
      } catch (error) {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          throw error;
        }

        if (attempt === this.retryAttempts) {
          throw error instanceof ApiError ? error : new ApiError('Network error or server is unavailable.', 0, { originalError: error });
        }

        await this.delay(this.retryDelay * attempt);
      }
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(Object.entries(params).filter(([_, v]) => v != null)).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    // Add cache control headers for GET requests
    const options = { 
      method: 'GET',
      headers: {
        ...this.getHeaders(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    };
    
    return this.request(url, options);
  }

  async post(endpoint, data) {
    if (data instanceof FormData) {
        return this.request(endpoint, {
            method: 'POST',
            body: data,
        });
    }
    return this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    });
  }
  
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === HOST DASHBOARD SPECIFIC ENDPOINTS ===

  async getDashboardMetrics() {
    return this.get('/api/host/dashboard/metrics');
  }

  async getRecentTournaments() {
    return this.get('/api/host/tournaments/recent');
  }
  
  async getHostProfile() {
    return this.get('/api/host/profile');
  }

  async getTournaments(params = {}) {
    return this.get('/api/host/tournaments', params);
  }

  async createTournament(formData) {
    // FormData is already prepared by the component
    return this.post('/api/tournaments', formData);
  }

  async updateTournament(tournamentId, tournamentData) {
    return this.put(`/api/host/tournaments/${tournamentId}`, tournamentData);
  }

  async updateTournamentStatus(tournamentId, statusData) {
    return this.put(`/api/host/tournaments/${tournamentId}/status`, statusData);
  }

  async deleteTournament(tournamentId) {
    return this.delete(`/api/host/tournaments/${tournamentId}`);
  }

  async getTournamentParticipants(tournamentId) {
    return this.get(`/api/host/tournaments/${tournamentId}/participants`);
  }

  async updateParticipantStatus(tournamentId, participantId, status) {
    return this.put(`/api/host/tournaments/${tournamentId}/participants/${participantId}/status`, { status });
  }

  async addTournamentEvent(tournamentSlug, eventData) {
    return this.post(`/api/tournaments/${tournamentSlug}/updates`, eventData);
  }

  async updateTournamentStatus(tournamentSlug, status) {
    return this.patch(`/api/tournaments/${tournamentSlug}/status`, { status });
  }

  async updateTournamentDetails(tournamentSlug, formData) {
    // Use FormData for file uploads
    return this.patch(`/api/tournaments/${tournamentSlug}`, formData);
  }


  
  async getWalletInfo() {
    return this.get('/api/host/wallet');
  }

  async getTransactions(params = {}) {
    return this.get('/api/host/wallet/transactions', params);
  }

  async requestWithdrawal(withdrawalData) {
    return this.post('/api/host/wallet/withdraw', withdrawalData);
  }

  // --- ANALYTICS ---
  async getRevenueAnalytics(days = 90) {
    return this.get('/api/host/analytics/revenue', { days });
  }

  async getParticipantAnalytics(days = 90) {
    return this.get('/api/host/analytics/participants', { days });
  }

  // --- NOTIFICATIONS ---
  async getNotifications(params = {}) {
    return this.get('/api/notifications', params);
  }
  
  async markNotificationRead(notificationId) {
    return this.patch(`/api/notifications/${notificationId}/read`);
  }
  
  async markAllNotificationsRead() {
    return this.patch('/api/notifications/read-all');
  }
}

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, status = 0, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Global event system for data updates
class DataUpdateNotifier {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }
}

const dataUpdateNotifier = new DataUpdateNotifier();

// Export for use throughout the application
window.ApiClient = ApiClient;
window.ApiError = ApiError;
window.apiClient = apiClient;
window.dataUpdateNotifier = dataUpdateNotifier;