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
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, config);
        
        // Handle authentication errors
        if (response.status === 401) {
          this.clearToken();
          throw new ApiError('Authentication required', 401);
        }

        // Handle other HTTP errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData
          );
        }

        return await response.json();
      } catch (error) {
        // Don't retry on authentication errors or client errors (4xx)
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          throw error;
        }

        // Retry on network errors or server errors (5xx)
        if (attempt === this.retryAttempts) {
          throw error instanceof ApiError ? error : new ApiError('Network error', 0, { originalError: error });
        }

        // Wait before retrying
        await this.delay(this.retryDelay * attempt);
      }
    }
  }

  /**
   * GET request
   */
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload file
   */
  async upload(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return this.request(endpoint, {
      method: 'POST',
      headers,
      body: formData,
    });
  }

  /**
   * Delay utility for retry logic
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === HOST DASHBOARD SPECIFIC ENDPOINTS ===

  /**
   * Get host dashboard metrics
   */
  async getDashboardMetrics() {
    return this.get('/api/host/dashboard/metrics');
  }

  /**
   * Get host tournaments
   */
  async getTournaments(params = {}) {
    return this.get('/api/user-tournaments', params);
  }

  /**
   * Create new tournament
   */
  async createTournament(tournamentData) {
    return this.post('/api/user-tournaments', tournamentData);
  }

  /**
   * Update tournament
   */
  async updateTournament(tournamentId, tournamentData) {
    return this.put(`/api/user-tournaments/${tournamentId}`, tournamentData);
  }

  /**
   * Delete tournament
   */
  async deleteTournament(tournamentId) {
    return this.delete(`/api/user-tournaments/${tournamentId}`);
  }

  /**
   * Get tournament participants
   */
  async getTournamentParticipants(tournamentId) {
    return this.get(`/api/user-tournaments/${tournamentId}/participants`);
  }

  /**
   * Approve/reject participant
   */
  async updateParticipantStatus(tournamentId, participantId, status) {
    return this.put(`/api/user-tournaments/${tournamentId}/participants/${participantId}`, { status });
  }

  /**
   * Get wallet information
   */
  async getWalletInfo() {
    return this.get('/api/host/wallet');
  }

  /**
   * Get transaction history
   */
  async getTransactions(params = {}) {
    return this.get('/api/host/wallet/transactions', params);
  }

  /**
   * Request withdrawal
   */
  async requestWithdrawal(withdrawalData) {
    return this.post('/api/host/wallet/withdraw', withdrawalData);
  }

  /**
   * Get schedule/calendar data
   */
  async getSchedule(params = {}) {
    return this.get('/api/host/schedule', params);
  }

  /**
   * Get analytics data
   */
  async getAnalytics(params = {}) {
    return this.get('/api/host/analytics', params);
  }

  /**
   * Get host profile
   */
  async getProfile() {
    return this.get('/api/host/profile');
  }

  /**
   * Update host profile
   */
  async updateProfile(profileData) {
    return this.put('/api/host/profile', profileData);
  }

  /**
   * Get notifications
   */
  async getNotifications(params = {}) {
    return this.get('/api/host/notifications', params);
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId) {
    return this.put(`/api/host/notifications/${notificationId}/read`);
  }

  /**
   * Upload tournament banner
   */
  async uploadTournamentBanner(file) {
    return this.upload('/api/host/tournaments/upload-banner', file);
  }

  /**
   * Generate tournament invite link
   */
  async generateInviteLink(tournamentId) {
    return this.post(`/api/user-tournaments/${tournamentId}/invite-link`);
  }

  /**
   * Get bracket data
   */
  async getBracket(tournamentId) {
    return this.get(`/api/user-tournaments/${tournamentId}/bracket`);
  }

  /**
   * Update match result
   */
  async updateMatchResult(tournamentId, matchId, resultData) {
    return this.put(`/api/user-tournaments/${tournamentId}/matches/${matchId}`, resultData);
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

// Export for use throughout the application
window.ApiClient = ApiClient;
window.ApiError = ApiError;
window.apiClient = apiClient;