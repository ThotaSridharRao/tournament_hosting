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
      await Promise.all([
        this.loadMetrics(),
        this.loadRecentTournaments()
      ]);
      
      this.render();
      // Fetch real data for charts
      await this.initializeCharts();
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
      const response = await window.apiClient.getDashboardMetrics();
      if (response.success && response.data) {
        this.metrics = response.data;
      }
    } catch (error) {
      console.error('Failed to load metrics from API:', error);
      throw new Error('Could not load dashboard metrics.');
    }
  }

  /**
   * Load recent tournaments data from API
   */
  async loadRecentTournaments() {
    try {
      const response = await window.apiClient.getRecentTournaments();
      if (response.success && Array.isArray(response.data)) {
        this.recentTournaments = response.data;
      }
    } catch (error) {
      console.error('Failed to load recent tournaments from API:', error);
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
            <h3 class="text-lg font-semibold mb-4 text-starlight">Revenue Over Time</h3>
            <div class="h-64"><canvas id="revenue-chart"></canvas></div>
          </div>
          <div class="glass rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4 text-starlight">Participant Growth</h3>
            <div class="h-64"><canvas id="participant-chart"></canvas></div>
          </div>
        </div>

        <div class="grid grid-cols-1">
          <div class="glass rounded-xl p-6">
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
    // This function remains the same
    return `...`;
  }

  renderRecentTournaments() {
    if (this.recentTournaments.length === 0) {
      return `<div class="text-center py-8"><p class="text-starlight-muted">No recent tournaments.</p></div>`;
    }

    return this.recentTournaments.map(tournament => `
      <div class="flex items-center justify-between p-3 bg-dark-matter/30 rounded-lg">
        <div>
          <p class="font-medium text-starlight">${tournament.title}</p>
          <p class="text-sm text-starlight-muted">${tournament.participant_count} participants • ₹${tournament.entryFee}</p>
        </div>
        <span class="px-2 py-1 text-xs rounded-full font-medium ${this.getStatusColor(tournament.status)}">
          ${tournament.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>
    `).join('');
  }

  async initializeCharts() {
    await this.initRevenueChart();
    await this.initParticipantChart();
  }

  async initRevenueChart() {
    try {
        const response = await window.apiClient.getRevenueAnalytics(30); // Fetch last 30 days
        if (!response.success) throw new Error("Failed to fetch revenue data");

        const data = response.data;
        const labels = data.map(d => d.date);
        const revenueValues = data.map(d => d.revenue);

        const ctx = document.getElementById('revenue-chart').getContext('2d');
        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Revenue',
                    data: revenueValues,
                    borderColor: '#0AFAD9',
                    backgroundColor: 'rgba(10, 250, 217, 0.1)',
                    fill: true,
                    tension: 0.4,
                }]
            },
            options: { /* Chart options remain the same */ }
        });
    } catch (error) {
        console.error("Could not initialize revenue chart:", error);
    }
  }

  async initParticipantChart() {
    try {
        const response = await window.apiClient.getParticipantAnalytics(30);
        if (!response.success) throw new Error("Failed to fetch participant data");

        const data = response.data;
        const labels = data.map(d => d.date);
        const participantValues = data.map(d => d.participants);

        const ctx = document.getElementById('participant-chart').getContext('2d');
        this.charts.participants = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'New Participants',
                    data: participantValues,
                    backgroundColor: '#5D3FD3',
                }]
            },
            options: { /* Chart options remain the same */ }
        });
    } catch (error) {
        console.error("Could not initialize participant chart:", error);
    }
  }
  
  getStatusColor(status) {
    // This function remains the same
    return '...';
  }

  renderError(message) {
    // This function remains the same
  }
  
  destroy() {
    // This function remains the same
  }
}

window.DashboardOverview = DashboardOverview;