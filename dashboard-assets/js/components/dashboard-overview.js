/**
 * Dashboard Overview Component
 * Handles the main dashboard metrics and overview functionality
 */

class DashboardOverview {
  constructor() {
    this.metrics = {
      totalTournaments: 0,
      activeTournaments: 0,
      totalParticipants: 0,
      totalEarnings: 0,
    };
    this.recentTournaments = [];
    this.charts = {};
  }

  /**
   * Initialize the dashboard overview
   */
  async init() {
    try {
      // Load all data in parallel for faster loading
      await Promise.all([
        this.loadMetrics(),
        this.loadRecentTournaments()
      ]);
      
      this.render();
      this.initializeCharts(); // Charts still use mock data for now
    } catch (error) {
      console.error('Failed to initialize dashboard overview:', error);
      this.renderError(error.message);
    }
  }

  /**
   * Load metrics data from API
   */
  async loadMetrics() {
    try {
      const response = await window.apiClient.get('/api/host/dashboard/metrics');
      if (response.success && response.data) {
        this.metrics = response.data;
      }
    } catch (error) {
      console.error('Failed to load metrics from API:', error);
      // Keep default zeroed-out metrics on failure
      throw new Error('Could not load dashboard metrics.');
    }
  }

  /**
   * Load recent tournaments data from API
   */
  async loadRecentTournaments() {
    try {
      const response = await window.apiClient.get('/api/host/tournaments/recent');
      if (response.success && Array.isArray(response.data)) {
        this.recentTournaments = response.data;
      }
    } catch (error) {
      console.error('Failed to load recent tournaments from API:', error);
      // It's okay if this fails, the component will just show an empty list.
      this.recentTournaments = [];
    }
  }

  /**
   * Render the dashboard overview HTML
   */
  render() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
      <div class="animate-fade-in space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${this.renderMetricCard('Total Tournaments', this.metrics.totalTournaments, 'fas fa-trophy', 'cyber-cyan')}
          ${this.renderMetricCard('Active Tournaments', this.metrics.activeTournaments, 'fas fa-play-circle', 'green-400')}
          ${this.renderMetricCard('Total Participants', this.metrics.totalParticipants, 'fas fa-users', 'cyber-indigo')}
          ${this.renderMetricCard('Total Earnings', `₹${this.metrics.totalEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 'fas fa-wallet', 'yellow-400')}
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="glass rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4 text-starlight">Revenue Over Time (Sample)</h3>
            <div class="h-64"><canvas id="revenue-chart"></canvas></div>
          </div>
          <div class="glass rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4 text-starlight">Participant Growth (Sample)</h3>
            <div class="h-64"><canvas id="participant-chart"></canvas></div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-3 glass rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4 text-starlight">Recent Tournaments</h3>
            <div id="recent-tournaments-list" class="space-y-3">
              ${this.renderRecentTournaments()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderMetricCard(title, value, icon, color) {
    return `
      <div class="glass rounded-xl p-6 hover:border-cyber-cyan transition-all duration-300 group">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-starlight-muted text-sm font-medium">${title}</p>
            <p class="text-2xl font-bold text-starlight mt-1">${value}</p>
          </div>
          <div class="w-12 h-12 bg-${color}/20 rounded-lg flex items-center justify-center group-hover:bg-${color}/30 transition-colors">
            <i class="${icon} text-${color} text-xl"></i>
          </div>
        </div>
      </div>
    `;
  }

  renderRecentTournaments() {
    if (this.recentTournaments.length === 0) {
      return `
        <div class="text-center py-8">
          <i class="fas fa-trophy text-4xl text-starlight-muted mb-4"></i>
          <p class="text-starlight-muted">No recent tournaments found. Create one to get started!</p>
        </div>
      `;
    }

    return this.recentTournaments.map(tournament => `
      <div class="flex items-center justify-between p-3 bg-dark-matter/30 rounded-lg hover:bg-dark-matter/50 transition-colors">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-cyber-cyan to-cyber-indigo rounded-lg flex items-center justify-center">
            <i class="fas fa-gamepad text-dark-matter text-sm"></i>
          </div>
          <div>
            <p class="font-medium text-starlight">${tournament.title}</p>
            <p class="text-sm text-starlight-muted">${tournament.participant_count} participants • ₹${tournament.entryFee}</p>
          </div>
        </div>
        <span class="px-2 py-1 text-xs rounded-full font-medium ${this.getStatusColor(tournament.status)}">
          ${tournament.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>
    `).join('');
  }

  initializeCharts() {
    this.initRevenueChart();
    this.initParticipantChart();
  }

  initRevenueChart() { /* ... Chart code remains the same ... */ }
  initParticipantChart() { /* ... Chart code remains the same ... */ }

  getStatusColor(status) {
    const colors = {
      'upcoming': 'bg-yellow-500/20 text-yellow-400',
      'registration_open': 'bg-green-500/20 text-green-400',
      'ongoing': 'bg-blue-500/20 text-blue-400',
      'ended': 'bg-purple-500/20 text-purple-400',
      'completed': 'bg-purple-500/20 text-purple-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  }

  renderError(message = 'There was an error loading your dashboard data.') {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
      <div class="text-center py-20">
        <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
        <h2 class="text-2xl font-bold mb-2 text-starlight">Failed to Load Dashboard</h2>
        <p class="text-starlight-muted mb-4">${message}</p>
        <button onclick="window.dashboardOverview.init()" class="btn-primary">
          Try Again
        </button>
      </div>
    `;
  }

  destroy() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    this.charts = {};
  }
}

// Attach to window for global access
window.DashboardOverview = DashboardOverview;