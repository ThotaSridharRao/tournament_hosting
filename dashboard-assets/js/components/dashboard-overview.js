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
    this.dateRange = 30; // Default to 30 days
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

        <!-- Date Range Selector -->
        <div class="glass rounded-xl p-4 mb-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 class="text-lg font-semibold text-starlight">Analytics Period</h3>
            <div class="flex flex-wrap gap-2">
              <button onclick="window.dashboardOverview.setDateRange(7)" 
                      class="date-range-btn px-4 py-2 rounded-lg text-sm font-medium transition-colors ${this.dateRange === 7 ? 'bg-cyber-cyan text-dark-matter' : 'bg-dark-matter/50 text-starlight-muted hover:bg-cyber-cyan/20 hover:text-starlight'}">
                Last 7 Days
              </button>
              <button onclick="window.dashboardOverview.setDateRange(30)" 
                      class="date-range-btn px-4 py-2 rounded-lg text-sm font-medium transition-colors ${this.dateRange === 30 ? 'bg-cyber-cyan text-dark-matter' : 'bg-dark-matter/50 text-starlight-muted hover:bg-cyber-cyan/20 hover:text-starlight'}">
                Last 30 Days
              </button>
              <button onclick="window.dashboardOverview.setDateRange(90)" 
                      class="date-range-btn px-4 py-2 rounded-lg text-sm font-medium transition-colors ${this.dateRange === 90 ? 'bg-cyber-cyan text-dark-matter' : 'bg-dark-matter/50 text-starlight-muted hover:bg-cyber-cyan/20 hover:text-starlight'}">
                Last 90 Days
              </button>
              <button onclick="window.dashboardOverview.showCustomDateModal()" 
                      class="date-range-btn px-4 py-2 rounded-lg text-sm font-medium bg-dark-matter/50 text-starlight-muted hover:bg-cyber-cyan/20 hover:text-starlight transition-colors">
                Custom Range
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="glass rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-starlight">Revenue Over Time</h3>
              <div id="revenue-loading" class="hidden">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-cyber-cyan"></div>
              </div>
            </div>
            <div class="h-64"><canvas id="revenue-chart"></canvas></div>
          </div>
          <div class="glass rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-starlight">Participant Growth</h3>
              <div id="participant-loading" class="hidden">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-cyber-cyan"></div>
              </div>
            </div>
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
        this.showChartLoading('revenue', true);
        const response = await window.apiClient.getRevenueAnalytics(this.dateRange);
        if (!response.success) throw new Error("Failed to fetch revenue data");

        const data = response.data;
        const labels = data.map(d => d.date);
        const revenueValues = data.map(d => d.revenue);

        const ctx = document.getElementById('revenue-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }
        
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
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#F0F0F0'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#F0F0F0'
                        },
                        grid: {
                            color: 'rgba(240, 240, 240, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#F0F0F0'
                        },
                        grid: {
                            color: 'rgba(240, 240, 240, 0.1)'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Could not initialize revenue chart:", error);
    } finally {
        this.showChartLoading('revenue', false);
    }
  }

  async initParticipantChart() {
    try {
        this.showChartLoading('participant', true);
        const response = await window.apiClient.getParticipantAnalytics(this.dateRange);
        if (!response.success) throw new Error("Failed to fetch participant data");

        const data = response.data;
        const labels = data.map(d => d.date);
        const participantValues = data.map(d => d.participants);

        const ctx = document.getElementById('participant-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (this.charts.participants) {
            this.charts.participants.destroy();
        }
        
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
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#F0F0F0'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#F0F0F0'
                        },
                        grid: {
                            color: 'rgba(240, 240, 240, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#F0F0F0'
                        },
                        grid: {
                            color: 'rgba(240, 240, 240, 0.1)'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Could not initialize participant chart:", error);
    } finally {
        this.showChartLoading('participant', false);
    }
  }
  
  getStatusColor(status) {
    // This function remains the same
    return '...';
  }

  renderError(message) {
    // This function remains the same
  }
  
  async setDateRange(days) {
    this.dateRange = days;
    this.updateDateRangeButtons();
    await this.refreshCharts();
  }

  updateDateRangeButtons() {
    document.querySelectorAll('.date-range-btn').forEach(btn => {
      btn.classList.remove('bg-cyber-cyan', 'text-dark-matter');
      btn.classList.add('bg-dark-matter/50', 'text-starlight-muted');
    });
    
    // Find and highlight active button
    const buttons = document.querySelectorAll('.date-range-btn');
    const buttonTexts = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'];
    const activeIndex = [7, 30, 90].indexOf(this.dateRange);
    
    if (activeIndex !== -1 && buttons[activeIndex]) {
      buttons[activeIndex].classList.remove('bg-dark-matter/50', 'text-starlight-muted');
      buttons[activeIndex].classList.add('bg-cyber-cyan', 'text-dark-matter');
    }
  }

  async refreshCharts() {
    await Promise.all([
      this.initRevenueChart(),
      this.initParticipantChart()
    ]);
  }

  showChartLoading(chartType, show) {
    const loadingElement = document.getElementById(`${chartType}-loading`);
    if (loadingElement) {
      if (show) {
        loadingElement.classList.remove('hidden');
      } else {
        loadingElement.classList.add('hidden');
      }
    }
  }

  showCustomDateModal() {
    const modalHtml = `
      <div id="custom-date-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="glass rounded-xl max-w-md w-full animate-slide-in">
          <div class="flex justify-between items-center p-6 border-b border-cyber-border">
            <h3 class="text-xl font-semibold text-starlight">Custom Date Range</h3>
            <button id="close-custom-date-modal" class="text-starlight-muted hover:text-starlight">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <div class="p-6">
            <form id="custom-date-form" class="space-y-4">
              <div>
                <label for="start-date" class="block text-sm font-medium text-starlight mb-2">Start Date</label>
                <input type="date" id="start-date" name="startDate" required
                       class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none datetime-white-icons">
              </div>
              <div>
                <label for="end-date" class="block text-sm font-medium text-starlight mb-2">End Date</label>
                <input type="date" id="end-date" name="endDate" required
                       class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none datetime-white-icons">
              </div>
              <div class="flex gap-3 pt-4">
                <button type="button" onclick="window.dashboardOverview.hideCustomDateModal()" 
                        class="flex-1 px-4 py-3 bg-dark-matter/50 text-starlight-muted rounded-lg hover:bg-dark-matter/70 transition-colors">
                  Cancel
                </button>
                <button type="submit" 
                        class="flex-1 px-4 py-3 bg-cyber-cyan text-dark-matter rounded-lg hover:bg-cyber-cyan/90 transition-colors font-semibold">
                  Apply Range
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    this.initCustomDateModal();
  }

  initCustomDateModal() {
    // Set default dates
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    document.getElementById('start-date').value = startDate.toISOString().split('T')[0];
    document.getElementById('end-date').value = endDate.toISOString().split('T')[0];

    // Bind events
    document.getElementById('close-custom-date-modal').addEventListener('click', () => {
      this.hideCustomDateModal();
    });

    document.getElementById('custom-date-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCustomDateSubmit();
    });

    // Close on outside click
    document.getElementById('custom-date-modal').addEventListener('click', (e) => {
      if (e.target.id === 'custom-date-modal') {
        this.hideCustomDateModal();
      }
    });
  }

  async handleCustomDateSubmit() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      alert('Start date must be before end date');
      return;
    }

    // Calculate days difference
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    this.dateRange = diffDays;
    this.customDateRange = { startDate, endDate };
    
    this.hideCustomDateModal();
    this.updateDateRangeButtons();
    await this.refreshCharts();
  }

  hideCustomDateModal() {
    const modal = document.getElementById('custom-date-modal');
    if (modal) {
      modal.classList.add('animate-fade-out');
      setTimeout(() => modal.remove(), 250);
    }
  }

  destroy() {
    // Destroy charts
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    this.charts = {};
  }
}

window.DashboardOverview = DashboardOverview;