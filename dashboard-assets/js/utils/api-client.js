/**
 * Centralized API Client for Host Dashboard
 * Handles all API communications with proper error handling and retry logic
 */

class ApiClient {
  constructor() {
    this.baseURL = this.getBaseURL();
    this.token = localStorage.getItem('auth_token');
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
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Get default headers
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Make HTTP request with retry logic
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Use a mutable config object
    let config = {
      headers: this.getHeaders(),
      ...options,
    };
    
    // For FormData, let the browser set the Content-Type header
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, config);
        
        if (response.status === 401) {
          this.clearToken();
          window.location.href = '/auth.html';
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
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
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

  async getTournaments(params = {}) {
    // <-- CHANGED
    return this.get('/api/host/tournaments', params);
  }

  async createTournament(tournamentData) {
    const formData = new FormData();
    for (const key in tournamentData) {
        if (tournamentData[key] !== null && tournamentData[key] !== undefined) {
             formData.append(key, tournamentData[key]);
        }
    }
    // <-- CHANGED to point to the correct creation endpoint that accepts FormData
    return this.post('/api/tournaments', formData);
  }

  async updateTournament(tournamentId, tournamentData) {
    // <-- CHANGED
    return this.put(`/api/host/tournaments/${tournamentId}`, tournamentData);
  }

  async deleteTournament(tournamentId) {
    // <-- CHANGED
    return this.delete(`/api/host/tournaments/${tournamentId}`);
  }

 // In dashboard-assets/js/utils/api-client.js

  /**
   * Get tournament participants
   */
  async getTournamentParticipants(tournamentId) {
    // <-- CHANGED
    return this.get(`/api/host/tournaments/${tournamentId}/participants`);
  }

  /**
   * Approve/reject participant
   */
  async updateParticipantStatus(tournamentId, participantId, status) {
    // <-- CHANGED
    return this.put(`/api/host/tournaments/${tournamentId}/participants/${participantId}/status`, { status });
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
  
  async generateInviteLink(tournamentId) {
    // <-- CHANGED to use the new host-specific path
    return this.post(`/api/host/tournaments/${tournamentId}/invite-link`);
  }
  
  // Other methods (getSchedule, getAnalytics, getProfile, etc.) remain the same
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

// Export for use throughout the application
window.ApiClient = ApiClient;
window.ApiError = ApiError;
window.apiClient = apiClient;