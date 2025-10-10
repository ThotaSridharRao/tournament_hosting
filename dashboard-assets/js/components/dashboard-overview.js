/**
 * Dashboard Overview Component
 * Handles the main dashboard metrics and overview functionality
 */

class DashboardOverview {
  constructor() {
    this.metrics = {
      totalTournaments: 0,
      activeTournaments: 0,
      completedTournaments: 0,
      upcomingTournaments: 0,
      totalParticipants: 0,
      totalEarnings: 0,
      pendingWithdrawals: 0
    };
    this.charts = {};
  }

  /**
   * Initialize the dashboard overview
   */
  async init() {
    try {
      await this.loadMetrics();
      this.render();
      this.initializeCharts();
    } catch (error) {
      console.error('Failed to initialize dashboard overview:', error);
      this.renderError();
    }
  }

  /**
   * Load metrics data from API
   */
  async loadMetrics() {
    try {
      // Try to load from API first
      const response = await window.apiClient.getDashboardMetrics();
      if (response.success && response.data) {
        this.metrics = response.data;
        return;
      }
    } catch (error) {
      console.warn('Failed to load metrics from API, using mock data:', error);
    }
    
    // Fallback to mock data
    this.metrics = {
      totalTournaments: 12,
      activeTournaments: 3,
      completedTournaments: 8,
      upcomingTournaments: 1,
      totalParticipants: 245,
      totalEarnings: 15420.50,
      pendingWithdrawals: 2340.00
    };
  }

  /**
   * Render the dashboard overview HTML
   */
  render() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
      <div class="animate-fade-in space-y-6">
        <!-- Metrics Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${this.renderMetricCard('Total Tournaments', this.metrics.totalTournaments, 'fas fa-trophy', 'cyber-cyan')}
          ${this.renderMetricCard('Active Tournaments', this.metrics.activeTournaments, 'fas fa-play-circle', 'green-400')}
          ${this.renderMetricCard('Total Participants', this.metrics.totalParticipants, 'fas fa-users', 'cyber-indigo')}
          ${this.renderMetricCard('Total Earnings', `$${this.metrics.totalEarnings.toLocaleString()}`, 'fas fa-dollar-sign', 'yellow-400')}
        </div>

        <!-- Charts and Analytics -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Revenue Chart -->
          <div class="glass rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4 text-starlight">Revenue Over Time</h3>
            <div class="h-64">
              <canvas id="revenue-chart"></canvas>
            </div>
          </div>

          <!-- Participant Growth Chart -->
          <div class="glass rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4 text-starlight">Participant Growth</h3>
            <div class="h-64">
              <canvas id="participant-chart"></canvas>
            </div>
          </div>
        </div>

        <!-- Recent Activity and Notifications -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Recent Tournaments -->
          <div class="lg:col-span-2 glass rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4 text-starlight">Recent Tournaments</h3>
            <div class="space-y-3">
              ${this.renderRecentTournaments()}
            </div>
          </div>

          <!-- Notifications Panel -->
          <div class="glass rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4 text-starlight">Notifications</h3>
            <div class="space-y-3">
              ${this.renderNotifications()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render a metric card
   */
  renderMetricCard(title, value, icon, color) {
    return `
      <div class="glass rounded-xl p-6 hover:border-${color} transition-all duration-300 group">
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

  /**
   * Render recent tournaments list
   */
  renderRecentTournaments() {
    const tournaments = [
      { name: 'Valorant Championship', status: 'Active', participants: 32, prize: '$500' },
      { name: 'CS:GO Weekly', status: 'Completed', participants: 16, prize: '$200' },
      { name: 'Apex Legends Cup', status: 'Upcoming', participants: 24, prize: '$300' }
    ];

    return tournaments.map(tournament => `
      <div class="flex items-center justify-between p-3 bg-dark-matter/30 rounded-lg hover:bg-dark-matter/50 transition-colors">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-cyber-cyan to-cyber-indigo rounded-lg flex items-center justify-center">
            <i class="fas fa-trophy text-dark-matter text-sm"></i>
          </div>
          <div>
            <p class="font-medium text-starlight">${tournament.name}</p>
            <p class="text-sm text-starlight-muted">${tournament.participants} participants • ${tournament.prize}</p>
          </div>
        </div>
        <span class="px-2 py-1 text-xs rounded-full ${this.getStatusColor(tournament.status)}">${tournament.status}</span>
      </div>
    `).join('');
  }

  /**
   * Render notifications
   */
  renderNotifications() {
    const notifications = [
      { type: 'approval', message: 'New tournament pending approval', time: '2 min ago' },
      { type: 'payment', message: 'Payment received from participant', time: '1 hour ago' },
      { type: 'message', message: 'New message from player', time: '3 hours ago' }
    ];

    return notifications.map(notification => `
      <div class="flex items-start space-x-3 p-3 bg-dark-matter/30 rounded-lg hover:bg-dark-matter/50 transition-colors">
        <div class="w-8 h-8 bg-${this.getNotificationColor(notification.type)}/20 rounded-full flex items-center justify-center flex-shrink-0">
          <i class="fas fa-${this.getNotificationIcon(notification.type)} text-${this.getNotificationColor(notification.type)} text-sm"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-starlight">${notification.message}</p>
          <p class="text-xs text-starlight-muted mt-1">${notification.time}</p>
        </div>
      </div>
    `).join('');
  }

  /**
   * Initialize charts
   */
  initializeCharts() {
    this.initRevenueChart();
    this.initParticipantChart();
  }

  /**
   * Initialize revenue chart
   */
  initRevenueChart() {
    const ctx = document.getElementById('revenue-chart');
    if (!ctx) return;

    this.charts.revenue = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue',
          data: [1200, 1900, 3000, 2500, 3200, 4100],
          borderColor: '#0AFAD9',
          backgroundColor: 'rgba(10, 250, 217, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#F0F0F0'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#F0F0F0'
            }
          }
        }
      }
    });
  }

  /**
   * Initialize participant chart
   */
  initParticipantChart() {
    const ctx = document.getElementById('participant-chart');
    if (!ctx) return;

    this.charts.participant = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          label: 'Participants',
          data: [45, 62, 38, 55],
          backgroundColor: '#5D3FD3',
          borderColor: '#5D3FD3',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#F0F0F0'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#F0F0F0'
            }
          }
        }
      }
    });
  }

  /**
   * Helper methods
   */
  getStatusColor(status) {
    const colors = {
      'Active': 'bg-green-500/20 text-green-400',
      'Completed': 'bg-blue-500/20 text-blue-400',
      'Upcoming': 'bg-yellow-500/20 text-yellow-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  }

  getNotificationColor(type) {
    const colors = {
      'approval': 'yellow-400',
      'payment': 'green-400',
      'message': 'blue-400'
    };
    return colors[type] || 'gray-400';
  }

  getNotificationIcon(type) {
    const icons = {
      'approval': 'clock',
      'payment': 'dollar-sign',
      'message': 'envelope'
    };
    return icons[type] || 'bell';
  }

  /**
   * Render error state
   */
  renderError() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
      <div class="text-center py-20">
        <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
        <h2 class="text-2xl font-bold mb-2 text-starlight">Failed to Load Dashboard</h2>
        <p class="text-starlight-muted mb-4">There was an error loading your dashboard data.</p>
        <button onclick="dashboardOverview.init()" class="px-6 py-2 bg-cyber-cyan text-dark-matter rounded-lg font-semibold hover:bg-cyber-cyan/90 transition-colors">
          Try Again
        </button>
      </div>
    `;
  }

  /**
   * Cleanup method
   */
  destroy() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    this.charts = {};
  }
}

// Export for use in main dashboard
window.DashboardOverview = DashboardOverview;