/**
 * Tournament Management Component
 * Handles tournament creation, editing, and participant management
 */

class TournamentManagement {
  constructor() {
    this.tournaments = [];
    this.currentTournament = null;
    this.participants = [];
    this.filters = {
      status: 'all',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    this.pagination = { page: 1, limit: 10, total: 0 };
  }

  async init() {
    try {
      await this.render();

      // Wait a bit for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      this.bindEvents();
      await this.loadTournaments();
    } catch (error) {
      console.error('Failed to initialize Tournament Management:', error);
    }
  }

  async render() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
      <div class="animate-fade-in">
        <!-- Tournament Management Header -->
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-starlight mb-2">Tournament Management</h2>
          <p class="text-starlight-muted">View and manage your tournaments</p>
        </div>

        <!-- Filters and Search -->
        <div class="bg-transparent rounded-xl p-6 mb-6">
          <div class="flex flex-col lg:flex-row gap-4">
            <div class="flex-1">
              <input type="text" id="tournament-search" placeholder="Search tournaments..." 
                class="w-full px-4 py-2 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none">
            </div>
            <select id="status-filter" class="px-4 py-2 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none">
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="registration_open">Registration Open</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <!-- Tournament List -->
        <div id="tournament-list" class="space-y-4">
          <!-- Tournament cards will be rendered here -->
        </div>

        <!-- Loading State -->
        <div id="tournaments-loading" class="hidden text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-cyan"></div>
          <p class="mt-4 text-starlight-muted">Loading tournaments...</p>
        </div>

        <!-- Empty State -->
        <div id="tournaments-empty" class="hidden text-center py-12">
          <i class="fas fa-trophy text-6xl text-starlight-muted mb-4"></i>
          <h3 class="text-xl font-semibold text-starlight mb-2">No Tournaments Yet</h3>
          <p class="text-starlight-muted">No tournaments have been created yet</p>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Search functionality
    const searchInput = document.getElementById('tournament-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value;
        this.pagination.page = 1;
        this.loadTournaments();
      });
    }

    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.filters.status = e.target.value;
        this.pagination.page = 1;
        this.loadTournaments();
      });
    }
  }

  async loadTournaments() {
    try {
      this.showLoading(true);
      const params = {
        page: this.pagination.page,
        limit: this.pagination.limit,
        search: this.filters.search,
        sort_by: this.filters.sortBy,
        sort_order: this.filters.sortOrder
      };

      // Only add status filter if it's not 'all'
      if (this.filters.status && this.filters.status !== 'all') {
        params.status = this.filters.status;
      }

      const response = await window.apiClient.getTournaments(params);

      if (response.success) {
        this.tournaments = response.data.tournaments || [];
        this.pagination.total = response.data.total || 0;
        this.renderTournamentList();
      } else {
        throw new Error(response.message || 'Failed to load tournaments');
      }
    } catch (error) {
      console.error('Error loading tournaments:', error);
      this.showError('Failed to load tournaments: ' + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  showLoading(show) {
    const loadingElement = document.getElementById('tournaments-loading');
    const listElement = document.getElementById('tournament-list');
    const emptyElement = document.getElementById('tournaments-empty');

    if (show) {
      loadingElement?.classList.remove('hidden');
      listElement?.classList.add('hidden');
      emptyElement?.classList.add('hidden');
    } else {
      loadingElement?.classList.add('hidden');
      listElement?.classList.remove('hidden');
    }
  }

  renderTournamentList() {
    const listElement = document.getElementById('tournament-list');
    const emptyElement = document.getElementById('tournaments-empty');

    // Check if elements exist
    if (!listElement) {
      console.error('Tournament list element not found');
      return;
    }

    if (!this.tournaments || this.tournaments.length === 0) {
      listElement.classList.add('hidden');
      emptyElement?.classList.remove('hidden');
      return;
    }

    listElement.classList.remove('hidden');
    emptyElement?.classList.add('hidden');

    listElement.innerHTML = this.tournaments.map(tournament => this.renderTournamentCard(tournament)).join('');
  }

  renderTournamentCard(tournament) {
    const statusColors = {
      upcoming: 'bg-blue-500/20 text-blue-400',
      registration_open: 'bg-green-500/20 text-green-400',
      ongoing: 'bg-yellow-500/20 text-yellow-400',
      completed: 'bg-gray-500/20 text-gray-400'
    };

    // Use same logic as tournaments page
    const participantCount = tournament.participants?.length || 0;
    const maxTeams = tournament.maxTeams || 16;
    const entryFee = tournament.entryFee || 0;
    const prizePool = tournament.prizePool || 0;
    const statusClass = statusColors[tournament.status] || 'bg-gray-500/20 text-gray-400';

    // Format prize pool same as tournaments page
    const prizePoolFormatted = prizePool ? `₹${prizePool.toLocaleString()}` : 'TBD';
    const entryFeeFormatted = entryFee ? `₹${entryFee.toLocaleString()}` : 'Free';

    return `
      <div class="glass rounded-xl p-6 hover:border-cyber-cyan/50 transition-all duration-300">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-xl font-semibold text-starlight">${tournament.title || 'Untitled Tournament'}</h3>
              <span class="px-3 py-1 rounded-full text-xs font-medium ${statusClass}">
                ${tournament.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
            <p class="text-starlight-muted mb-3">${tournament.description || 'No description available'}</p>
            <div class="flex flex-wrap gap-4 text-sm text-starlight-muted">
              <span><i class="fas fa-gamepad mr-1"></i> ${tournament.game || 'Unknown Game'}</span>
              <span><i class="fas fa-users mr-1"></i> ${participantCount}/${maxTeams} teams</span>
              <span><i class="fas fa-coins mr-1"></i> ${entryFeeFormatted} entry fee</span>
              <span><i class="fas fa-trophy mr-1"></i> ${prizePoolFormatted} prize pool</span>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-4 lg:mt-0">
            <button onclick="window.tournamentManagement.manageParticipants('${tournament._id}')" 
              class="px-4 py-2 bg-cyber-indigo/20 text-cyber-indigo rounded-lg hover:bg-cyber-indigo/30 transition-colors">
              <i class="fas fa-users mr-1"></i> Participants
            </button>
            <button onclick="window.tournamentManagement.changeStatus('${tournament._id}', '${tournament.status}')" 
              class="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors">
              <i class="fas fa-toggle-on mr-1"></i> Status
            </button>
            <button onclick="window.tournamentManagement.manageEvents('${tournament._id}')" 
              class="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors">
              <i class="fas fa-calendar-plus mr-1"></i> Events
            </button>
            <button onclick="window.tournamentManagement.editTournament('${tournament._id}')" 
              class="px-4 py-2 bg-cyber-cyan/20 text-cyber-cyan rounded-lg hover:bg-cyber-cyan/30 transition-colors">
              <i class="fas fa-edit mr-1"></i> Edit
            </button>
            <button onclick="window.tournamentManagement.deleteTournament('${tournament._id}')" 
              class="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
              <i class="fas fa-trash mr-1"></i> Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  async manageEvents(tournamentId) {
    this.currentTournament = this.tournaments.find(t => t._id === tournamentId);
    if (!this.currentTournament) {
      this.showError('Tournament not found');
      return;
    }

    this.showEventManagementModal();
  }

  showEventManagementModal() {
    const tournament = this.currentTournament;
    
    const modalHtml = `
      <div id="event-management-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="glass rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center p-6 border-b border-cyber-border">
            <h3 class="text-2xl font-semibold text-starlight">Manage Events - ${tournament.title}</h3>
            <button id="close-event-modal" class="text-starlight-muted hover:text-starlight">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <div class="p-6">
            <!-- Add New Event Form -->
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-starlight mb-4">Add New Event</h4>
              <form id="add-event-form" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-group">
                    <label for="event-title" class="block text-sm font-medium text-starlight-muted mb-2">Event Title *</label>
                    <input type="text" id="event-title" name="title" placeholder="e.g., Match 1, Semi-Finals" 
                           class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none" required>
                  </div>
                  <div class="form-group">
                    <label for="event-datetime" class="block text-sm font-medium text-starlight-muted mb-2">Date & Time *</label>
                    <input type="datetime-local" id="event-datetime" name="datetime" 
                           class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none datetime-white-icons" required>
                  </div>
                </div>
                <div class="form-group">
                  <label for="event-description" class="block text-sm font-medium text-starlight-muted mb-2">Description</label>
                  <textarea id="event-description" name="description" rows="3" placeholder="Event details..." 
                            class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none resize-vertical"></textarea>
                </div>
                <button type="submit" class="w-full px-4 py-3 bg-cyber-cyan text-dark-matter rounded-lg font-semibold hover:bg-cyber-cyan/90 transition-colors">
                  <i class="fas fa-plus mr-2"></i>Add Event
                </button>
              </form>
            </div>

            <!-- Existing Events -->
            <div>
              <h4 class="text-lg font-semibold text-starlight mb-4">Existing Events</h4>
              <div id="existing-events" class="space-y-3">
                <!-- Events will be populated here -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Initialize modal
    this.initializeEventModal();
  }

  initializeEventModal() {
    // Populate existing events
    this.populateExistingEvents();

    // Bind events
    document.getElementById('close-event-modal').addEventListener('click', () => {
      this.hideEventModal();
    });

    document.getElementById('add-event-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddEvent();
    });

    // Close modal on outside click
    document.getElementById('event-management-modal').addEventListener('click', (e) => {
      if (e.target.id === 'event-management-modal') {
        this.hideEventModal();
      }
    });
  }

  populateExistingEvents() {
    const eventsContainer = document.getElementById('existing-events');
    const events = this.currentTournament.scheduleEvents || [];

    if (events.length === 0) {
      eventsContainer.innerHTML = `
        <div class="text-center py-8 text-starlight-muted">
          <i class="fas fa-calendar-times text-4xl mb-2"></i>
          <p>No events added yet</p>
        </div>
      `;
      return;
    }

    eventsContainer.innerHTML = events.map(event => `
      <div class="bg-dark-matter/30 border border-cyber-border/30 rounded-lg p-4">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h5 class="font-semibold text-starlight mb-1">${event.title}</h5>
            <p class="text-sm text-starlight-muted mb-2">
              <i class="fas fa-calendar mr-1"></i>
              ${event.date} at ${event.time}
            </p>
            ${event.description ? `<p class="text-sm text-starlight-muted">${event.description}</p>` : ''}
          </div>
          <button onclick="this.closest('.bg-dark-matter\\/30').remove()" 
                  class="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  async handleAddEvent() {
    try {
      const form = document.getElementById('add-event-form');
      const formData = new FormData(form);
      
      const title = formData.get('title').trim();
      const datetime = formData.get('datetime');
      const description = formData.get('description').trim();

      if (!title || !datetime) {
        throw new Error('Please fill in all required fields');
      }

      // Convert datetime to separate date and time
      const eventDate = new Date(datetime);
      const date = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const time = eventDate.toTimeString().split(' ')[0]; // HH:MM:SS

      const eventData = {
        title,
        date,
        time,
        description,
        type: 'match'
      };

      // Show loading state
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Adding...';
      submitButton.disabled = true;

      // Add event via API
      const response = await window.apiClient.addTournamentEvent(this.currentTournament.slug, eventData);

      if (response.success) {
        this.showNotification('Event added successfully!', 'success');
        
        // Update current tournament data
        if (!this.currentTournament.scheduleEvents) {
          this.currentTournament.scheduleEvents = [];
        }
        this.currentTournament.scheduleEvents.push(response.data);
        
        // Refresh the existing events display
        this.populateExistingEvents();
        
        // Reset form
        form.reset();
      } else {
        throw new Error(response.message || 'Failed to add event');
      }

      // Restore button
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;

    } catch (error) {
      console.error('Error adding event:', error);
      this.showError('Failed to add event: ' + error.message);
      
      // Restore button
      const submitButton = document.getElementById('add-event-form').querySelector('button[type="submit"]');
      submitButton.innerHTML = '<i class="fas fa-plus mr-2"></i>Add Event';
      submitButton.disabled = false;
    }
  }

  hideEventModal() {
    const modal = document.getElementById('event-management-modal');
    if (modal) {
      modal.remove();
    }
  }

  // Placeholder methods for other functionality
  async manageParticipants(tournamentId) {
    this.showNotification('Participant management coming soon!', 'info');
  }

  async changeStatus(tournamentId, currentStatus) {
    this.currentTournament = this.tournaments.find(t => t._id === tournamentId);
    if (!this.currentTournament) {
      this.showError('Tournament not found');
      return;
    }

    this.showStatusChangeModal(currentStatus);
  }

  showStatusChangeModal(currentStatus) {
    const tournament = this.currentTournament;
    const statusOptions = [
      { value: 'upcoming', label: 'Upcoming', description: 'Tournament is scheduled but not yet open for registration' },
      { value: 'registration_open', label: 'Registration Open', description: 'Players can register for the tournament' },
      { value: 'registration_closed', label: 'Registration Closed', description: 'Registration period has ended' },
      { value: 'ongoing', label: 'Ongoing', description: 'Tournament is currently in progress' },
      { value: 'ended', label: 'Ended', description: 'Tournament has completed' }
    ];

    const modalHtml = `
      <div id="status-change-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="glass rounded-xl max-w-md w-full">
          <div class="flex justify-between items-center p-6 border-b border-cyber-border">
            <h3 class="text-xl font-semibold text-starlight">Change Tournament Status</h3>
            <button id="close-status-modal" class="text-starlight-muted hover:text-starlight">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <div class="p-6">
            <div class="mb-4">
              <p class="text-starlight-muted mb-2">Tournament: <span class="text-starlight font-semibold">${tournament.title}</span></p>
              <p class="text-starlight-muted">Current Status: <span class="text-cyber-cyan font-semibold">${currentStatus?.replace('_', ' ').toUpperCase()}</span></p>
            </div>

            <form id="status-change-form" class="space-y-4">
              <div class="form-group">
                <label for="new-status" class="block text-sm font-medium text-starlight-muted mb-3">Select New Status:</label>
                <div class="space-y-2">
                  ${statusOptions.map(option => `
                    <label class="flex items-start space-x-3 p-3 rounded-lg border border-cyber-border/30 hover:border-cyber-cyan/50 cursor-pointer transition-colors ${option.value === currentStatus ? 'bg-cyber-cyan/10 border-cyber-cyan' : ''}">
                      <input type="radio" name="status" value="${option.value}" 
                             class="mt-1 text-cyber-cyan focus:ring-cyber-cyan" 
                             ${option.value === currentStatus ? 'checked' : ''}>
                      <div class="flex-1">
                        <div class="font-medium text-starlight">${option.label}</div>
                        <div class="text-sm text-starlight-muted">${option.description}</div>
                      </div>
                    </label>
                  `).join('')}
                </div>
              </div>

              <div class="flex justify-end space-x-3 pt-4 border-t border-cyber-border">
                <button type="button" id="cancel-status-change" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" class="px-4 py-2 bg-cyber-cyan text-dark-matter rounded-lg hover:bg-cyber-cyan/90 transition-colors font-semibold">
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Initialize modal
    this.initializeStatusModal();
  }

  initializeStatusModal() {
    // Bind events
    document.getElementById('close-status-modal').addEventListener('click', () => {
      this.hideStatusModal();
    });

    document.getElementById('cancel-status-change').addEventListener('click', () => {
      this.hideStatusModal();
    });

    document.getElementById('status-change-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleStatusChange();
    });

    // Close modal on outside click
    document.getElementById('status-change-modal').addEventListener('click', (e) => {
      if (e.target.id === 'status-change-modal') {
        this.hideStatusModal();
      }
    });
  }

  async handleStatusChange() {
    try {
      const form = document.getElementById('status-change-form');
      const formData = new FormData(form);
      const newStatus = formData.get('status');

      if (!newStatus) {
        throw new Error('Please select a status');
      }

      // Show loading state
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Updating...';
      submitButton.disabled = true;

      // Update status via API
      const response = await window.apiClient.updateTournamentStatus(this.currentTournament.slug, newStatus);

      if (response.success) {
        this.showNotification('Tournament status updated successfully!', 'success');
        
        // Update current tournament data
        this.currentTournament.status = newStatus;
        
        // Refresh the tournament list
        await this.loadTournaments();
        
        // Hide modal
        this.hideStatusModal();
      } else {
        throw new Error(response.message || 'Failed to update status');
      }

    } catch (error) {
      console.error('Error updating status:', error);
      this.showError('Failed to update status: ' + error.message);
      
      // Restore button
      const submitButton = document.getElementById('status-change-form').querySelector('button[type="submit"]');
      submitButton.innerHTML = 'Update Status';
      submitButton.disabled = false;
    }
  }

  hideStatusModal() {
    const modal = document.getElementById('status-change-modal');
    if (modal) {
      modal.remove();
    }
  }

  async editTournament(tournamentId) {
    this.showNotification('Tournament editing coming soon!', 'info');
  }

  async deleteTournament(tournamentId) {
    if (confirm('Are you sure you want to delete this tournament?')) {
      this.showNotification('Tournament deletion coming soon!', 'info');
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    
    switch (type) {
      case 'success':
        notification.classList.add('bg-green-600', 'text-white');
        notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
        break;
      case 'error':
        notification.classList.add('bg-red-600', 'text-white');
        notification.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`;
        break;
      default:
        notification.classList.add('bg-cyber-cyan', 'text-dark-matter');
        notification.innerHTML = `<i class="fas fa-info-circle mr-2"></i>${message}`;
    }

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  destroy() {
    this.tournaments = [];
    this.currentTournament = null;
    this.participants = [];
  }
}