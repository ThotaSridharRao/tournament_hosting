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
              class="w-10 h-10 bg-cyber-indigo/20 text-cyber-indigo rounded-lg hover:bg-cyber-indigo/30 transition-colors flex items-center justify-center" 
              title="Manage Participants">
              <i class="fas fa-users"></i>
            </button>
            <button onclick="window.tournamentManagement.changeStatus('${tournament._id}', '${tournament.status}')" 
              class="w-10 h-10 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors flex items-center justify-center" 
              title="Change Status">
              <i class="fas fa-toggle-on"></i>
            </button>
            <button onclick="window.tournamentManagement.manageEvents('${tournament._id}')" 
              class="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center justify-center" 
              title="Manage Events">
              <i class="fas fa-calendar-plus"></i>
            </button>
            <button onclick="window.tournamentManagement.editTournament('${tournament._id}')" 
              class="w-10 h-10 bg-cyber-cyan/20 text-cyber-cyan rounded-lg hover:bg-cyber-cyan/30 transition-colors flex items-center justify-center" 
              title="Edit Tournament">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="window.tournamentManagement.deleteTournament('${tournament._id}')" 
              class="w-10 h-10 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center" 
              title="Delete Tournament">
              <i class="fas fa-trash"></i>
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
      <div id="event-management-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="glass rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in">
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
    this.currentTournament = this.tournaments.find(t => t._id === tournamentId);
    if (!this.currentTournament) {
      this.showError('Tournament not found');
      return;
    }

    await this.showParticipantsModal();
  }

  async showParticipantsModal() {
    const tournament = this.currentTournament;
    
    const modalHtml = `
      <div id="participants-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="glass rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto animate-slide-in">
          <div class="flex justify-between items-center p-6 border-b border-cyber-border">
            <div>
              <h3 class="text-2xl font-semibold text-starlight">Tournament Participants</h3>
              <p class="text-starlight-muted mt-1">${tournament.title}</p>
            </div>
            <button id="close-participants-modal" class="text-starlight-muted hover:text-starlight">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <div class="p-6">
            <!-- Loading State -->
            <div id="participants-loading" class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-cyan"></div>
              <p class="mt-4 text-starlight-muted">Loading participants...</p>
            </div>

            <!-- Participants List -->
            <div id="participants-content" class="hidden">
              <div class="mb-4 flex justify-between items-center">
                <div class="text-starlight-muted">
                  <span id="participants-count">0</span> teams registered
                </div>
                <div class="text-sm text-starlight-muted">
                  Click the trash icon to remove a team
                </div>
              </div>
              
              <div id="participants-list" class="space-y-4">
                <!-- Participants will be populated here -->
              </div>
            </div>

            <!-- Empty State -->
            <div id="participants-empty" class="hidden text-center py-12">
              <i class="fas fa-users-slash text-6xl text-starlight-muted mb-4"></i>
              <h4 class="text-xl font-semibold text-starlight mb-2">No Participants Yet</h4>
              <p class="text-starlight-muted">No teams have registered for this tournament</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Initialize modal
    await this.initializeParticipantsModal();
  }

  async initializeParticipantsModal() {
    // Bind events
    document.getElementById('close-participants-modal').addEventListener('click', () => {
      this.hideParticipantsModal();
    });

    // Close modal on outside click
    document.getElementById('participants-modal').addEventListener('click', (e) => {
      if (e.target.id === 'participants-modal') {
        this.hideParticipantsModal();
      }
    });

    // Load participants
    await this.loadParticipants();
  }

  async loadParticipants() {
    try {
      const response = await window.apiClient.getTournamentParticipants(this.currentTournament._id);

      if (response.success) {
        const participants = response.data.participants || [];
        this.participants = participants; // Store for team details view
        this.renderParticipants(participants);
      } else {
        throw new Error(response.message || 'Failed to load participants');
      }
    } catch (error) {
      console.error('Error loading participants:', error);
      this.showError('Failed to load participants: ' + error.message);
      this.hideParticipantsModal();
    }
  }

  renderParticipants(participants) {
    const loadingElement = document.getElementById('participants-loading');
    const contentElement = document.getElementById('participants-content');
    const emptyElement = document.getElementById('participants-empty');
    const listElement = document.getElementById('participants-list');
    const countElement = document.getElementById('participants-count');

    // Hide loading
    loadingElement.classList.add('hidden');

    if (!participants || participants.length === 0) {
      emptyElement.classList.remove('hidden');
      contentElement.classList.add('hidden');
      return;
    }

    // Show content
    contentElement.classList.remove('hidden');
    emptyElement.classList.add('hidden');

    // Update count
    countElement.textContent = participants.length;

    // Render participants list
    listElement.innerHTML = participants.map((participant, index) => this.renderParticipantCard(participant, index)).join('');
  }

  renderParticipantCard(participant, index) {
    const players = participant.players || [];
    const teamName = participant.teamName || 'Unknown Team';
    const teamId = participant._id;

    return `
      <div class="bg-dark-matter/30 border border-cyber-border/30 rounded-lg p-4 hover:border-cyber-cyan/50 transition-colors">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4 flex-1">
            <span class="text-cyber-cyan font-semibold text-lg w-8">${index + 1}.</span>
            <div class="flex-1">
              <h5 class="text-lg font-semibold text-starlight">${teamName}</h5>
              <span class="text-sm text-starlight-muted">${players.length} ${players.length === 1 ? 'player' : 'players'}</span>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <button onclick="window.tournamentManagement.viewTeamDetails('${teamId}', '${teamName.replace(/'/g, "\\'")}', ${index})" 
                    class="w-10 h-10 bg-cyber-cyan/20 text-cyber-cyan rounded-lg hover:bg-cyber-cyan/30 transition-colors flex items-center justify-center" 
                    title="View Team Details">
              <i class="fas fa-eye"></i>
            </button>
            <button onclick="window.tournamentManagement.removeParticipant('${teamId}', '${teamName.replace(/'/g, "\\'")}', ${index})" 
                    class="w-10 h-10 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center" 
                    title="Remove Team">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  async viewTeamDetails(teamId, teamName, teamIndex) {
    const participant = this.participants.find(p => p._id === teamId);
    if (!participant) {
      this.showError('Team not found');
      return;
    }

    this.showTeamDetailsModal(participant, teamIndex + 1);
  }

  showTeamDetailsModal(participant, teamNumber) {
    const players = participant.players || [];
    const teamName = participant.teamName || 'Unknown Team';

    const modalHtml = `
      <div id="team-details-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="glass rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-in">
          <div class="flex justify-between items-center p-6 border-b border-cyber-border">
            <div>
              <h3 class="text-2xl font-semibold text-starlight">Team #${teamNumber} - ${teamName}</h3>
              <p class="text-starlight-muted mt-1">${players.length} ${players.length === 1 ? 'player' : 'players'}</p>
            </div>
            <button id="close-team-details-modal" class="text-starlight-muted hover:text-starlight">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${players.map((player, index) => `
                <div class="bg-dark-matter/50 border border-cyber-border/20 rounded-lg p-4">
                  <div class="flex items-center gap-2 mb-3">
                    <span class="w-8 h-8 bg-cyber-cyan/20 text-cyber-cyan rounded-full flex items-center justify-center text-sm font-semibold">
                      ${index + 1}
                    </span>
                    <div>
                      <h4 class="font-semibold text-starlight">${player.name || 'Unknown Player'}</h4>
                      <span class="text-xs text-starlight-muted">${player.role || 'Player'}</span>
                    </div>
                  </div>
                  
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <i class="fas fa-gamepad text-cyber-cyan text-sm w-4"></i>
                      <span class="text-starlight text-sm">${player.inGameId || 'No Game ID'}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <i class="fas fa-envelope text-starlight-muted text-sm w-4"></i>
                      <span class="text-starlight-muted text-sm">${player.email || 'No email'}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            ${participant.phone ? `
              <div class="mt-6 p-4 bg-dark-matter/30 border border-cyber-border/20 rounded-lg">
                <div class="flex items-center gap-2">
                  <i class="fas fa-phone text-cyber-cyan"></i>
                  <span class="text-starlight font-medium">Captain Contact:</span>
                  <span class="text-starlight-muted">${participant.phone}</span>
                </div>
              </div>
            ` : ''}

            <div class="flex justify-end mt-6 pt-4 border-t border-cyber-border">
              <button onclick="window.tournamentManagement.hideTeamDetailsModal()" 
                      class="px-6 py-3 bg-cyber-cyan text-dark-matter rounded-lg hover:bg-cyber-cyan/90 transition-colors font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Bind close events
    document.getElementById('close-team-details-modal').addEventListener('click', () => {
      this.hideTeamDetailsModal();
    });

    // Close modal on outside click
    document.getElementById('team-details-modal').addEventListener('click', (e) => {
      if (e.target.id === 'team-details-modal') {
        this.hideTeamDetailsModal();
      }
    });
  }

  hideTeamDetailsModal() {
    const modal = document.getElementById('team-details-modal');
    if (modal) {
      modal.remove();
    }
  }

  async removeParticipant(teamId, teamName, teamIndex) {
    if (!confirm(`Are you sure you want to remove team "${teamName}" from this tournament?`)) {
      return;
    }

    try {
      const response = await window.apiClient.removeParticipant(this.currentTournament.slug, teamId);

      if (response.success) {
        this.showNotification(`Team "${teamName}" removed successfully!`, 'success');
        
        // Reload participants
        await this.loadParticipants();
        
        // Update tournament list to reflect new participant count
        await this.loadTournaments();
      } else {
        throw new Error(response.message || 'Failed to remove participant');
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      this.showError('Failed to remove participant: ' + error.message);
    }
  }

  hideParticipantsModal() {
    const modal = document.getElementById('participants-modal');
    if (modal) {
      modal.remove();
    }
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
    this.currentTournament = this.tournaments.find(t => t._id === tournamentId);
    if (!this.currentTournament) {
      this.showError('Tournament not found');
      return;
    }

    this.showEditTournamentModal();
  }

  showEditTournamentModal() {
    const tournament = this.currentTournament;
    
    const modalHtml = `
      <div id="edit-tournament-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="glass rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center p-6 border-b border-cyber-border">
            <h3 class="text-2xl font-semibold text-starlight">Edit Tournament - ${tournament.title}</h3>
            <button id="close-edit-modal" class="text-starlight-muted hover:text-starlight">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <form id="edit-tournament-form" class="p-6 space-y-6">
            <!-- Basic Information -->
            <div class="space-y-4">
              <h4 class="text-lg font-semibold text-starlight border-b border-cyber-border pb-2">Basic Information</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group">
                  <label for="edit-title" class="block text-sm font-medium text-starlight-muted mb-2">Tournament Title *</label>
                  <input type="text" id="edit-title" name="title" value="${tournament.title || ''}" 
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none" required>
                </div>
                <div class="form-group">
                  <label for="edit-game" class="block text-sm font-medium text-starlight-muted mb-2">Game *</label>
                  <input type="text" id="edit-game" name="game" value="${tournament.game || ''}" 
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none" required>
                </div>
              </div>

              <div class="form-group">
                <label for="edit-description" class="block text-sm font-medium text-starlight-muted mb-2">Description</label>
                <textarea id="edit-description" name="description" rows="3" 
                          class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none resize-vertical">${tournament.description || ''}</textarea>
              </div>
            </div>

            <!-- Tournament Settings -->
            <div class="space-y-4">
              <h4 class="text-lg font-semibold text-starlight border-b border-cyber-border pb-2">Tournament Settings</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="form-group">
                  <label for="edit-prize-pool" class="block text-sm font-medium text-starlight-muted mb-2">Prize Pool (₹) *</label>
                  <input type="number" id="edit-prize-pool" name="prizePool" min="0" 
                         value="${tournament.prizePool || 0}" 
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none" required>
                </div>
                <div class="form-group">
                  <label for="edit-entry-fee" class="block text-sm font-medium text-starlight-muted mb-2">Entry Fee (₹)</label>
                  <input type="number" id="edit-entry-fee" name="entryFee" min="0" 
                         value="${tournament.entryFee || 0}" 
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none">
                </div>
                <div class="form-group">
                  <label for="edit-max-teams" class="block text-sm font-medium text-starlight-muted mb-2">Max Teams *</label>
                  <input type="number" id="edit-max-teams" name="maxTeams" min="2" 
                         value="${tournament.maxTeams || 16}" 
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none" required>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group">
                  <label for="edit-max-players" class="block text-sm font-medium text-starlight-muted mb-2">Max Players per Team *</label>
                  <input type="number" id="edit-max-players" name="maxPlayersPerTeam" min="1" 
                         value="${tournament.maxPlayersPerTeam || 4}" 
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none" required>
                </div>
                <div class="form-group">
                  <label for="edit-format" class="block text-sm font-medium text-starlight-muted mb-2">Format *</label>
                  <select id="edit-format" name="format" 
                          class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none" required>
                    <option value="single_elimination" ${tournament.format === 'single_elimination' ? 'selected' : ''}>Single Elimination</option>
                    <option value="double_elimination" ${tournament.format === 'double_elimination' ? 'selected' : ''}>Double Elimination</option>
                    <option value="round_robin" ${tournament.format === 'round_robin' ? 'selected' : ''}>Round Robin</option>
                    <option value="kp" ${tournament.format === 'kp' ? 'selected' : ''}>KP Format</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Tournament Dates -->
            <div class="space-y-4">
              <h4 class="text-lg font-semibold text-starlight border-b border-cyber-border pb-2">Tournament Dates</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group">
                  <label for="edit-reg-start" class="block text-sm font-medium text-starlight-muted mb-2">Registration Start *</label>
                  <input type="datetime-local" id="edit-reg-start" name="registrationStart" 
                         value="${this.formatDateForInput(tournament.registrationStart)}" 
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none datetime-white-icons" required>
                </div>
                <div class="form-group">
                  <label for="edit-reg-end" class="block text-sm font-medium text-starlight-muted mb-2">Registration End *</label>
                  <input type="datetime-local" id="edit-reg-end" name="registrationEnd" 
                         value="${this.formatDateForInput(tournament.registrationEnd)}" 
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none datetime-white-icons" required>
                </div>
                <div class="form-group">
                  <label for="edit-tournament-start" class="block text-sm font-medium text-starlight-muted mb-2">Tournament Start *</label>
                  <input type="datetime-local" id="edit-tournament-start" name="tournamentStart" 
                         value="${this.formatDateForInput(tournament.tournamentStart)}" 
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none datetime-white-icons" required>
                </div>
                <div class="form-group">
                  <label for="edit-tournament-end" class="block text-sm font-medium text-starlight-muted mb-2">Tournament End *</label>
                  <input type="datetime-local" id="edit-tournament-end" name="tournamentEnd" 
                         value="${this.formatDateForInput(tournament.tournamentEnd)}" 
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none datetime-white-icons" required>
                </div>
              </div>
            </div>

            <!-- Poster Image -->
            <div class="space-y-4">
              <h4 class="text-lg font-semibold text-starlight border-b border-cyber-border pb-2">Tournament Poster</h4>
              
              <div class="form-group">
                <label for="edit-poster" class="block text-sm font-medium text-starlight-muted mb-2">Poster Image</label>
                <input type="file" id="edit-poster" name="posterImage" accept="image/*" 
                       class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyber-cyan file:text-dark-matter hover:file:bg-cyber-cyan/90 focus:border-cyber-cyan focus:outline-none">
                <p class="text-xs text-starlight-muted mt-1">Upload a new poster image (optional). Current poster will be kept if no new image is selected.</p>
                ${tournament.posterImage ? `
                  <div class="mt-3">
                    <p class="text-sm text-starlight-muted mb-2">Current poster:</p>
                    <img src="${tournament.posterImage}" alt="Current poster" class="w-32 h-20 object-cover rounded-lg border border-cyber-border">
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-cyber-border">
              <button type="button" id="cancel-edit" class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button type="submit" class="px-6 py-3 bg-cyber-cyan text-dark-matter rounded-lg hover:bg-cyber-cyan/90 transition-colors font-semibold">
                <i class="fas fa-save mr-2"></i>Update Tournament
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Initialize modal
    this.initializeEditTournamentModal();
  }

  initializeEditTournamentModal() {
    // Bind events
    document.getElementById('close-edit-modal').addEventListener('click', () => {
      this.hideEditTournamentModal();
    });

    document.getElementById('cancel-edit').addEventListener('click', () => {
      this.hideEditTournamentModal();
    });

    document.getElementById('edit-tournament-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleEditTournament();
    });

    // Close modal on outside click
    document.getElementById('edit-tournament-modal').addEventListener('click', (e) => {
      if (e.target.id === 'edit-tournament-modal') {
        this.hideEditTournamentModal();
      }
    });
  }

  async handleEditTournament() {
    try {
      const form = document.getElementById('edit-tournament-form');
      const formData = new FormData(form);

      // Validate required fields
      const title = formData.get('title').trim();
      const game = formData.get('game').trim();
      const prizePool = formData.get('prizePool');
      const maxTeams = formData.get('maxTeams');
      const maxPlayersPerTeam = formData.get('maxPlayersPerTeam');
      const format = formData.get('format');

      if (!title || !game || !prizePool || !maxTeams || !maxPlayersPerTeam || !format) {
        throw new Error('Please fill in all required fields');
      }

      // Show loading state
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Updating...';
      submitButton.disabled = true;

      // Update tournament via API
      const response = await window.apiClient.updateTournamentDetails(this.currentTournament.slug, formData);

      if (response.success) {
        this.showNotification('Tournament updated successfully!', 'success');
        
        // Update current tournament data
        Object.assign(this.currentTournament, response.data);
        
        // Refresh the tournament list
        await this.loadTournaments();
        
        // Hide modal
        this.hideEditTournamentModal();
      } else {
        throw new Error(response.message || 'Failed to update tournament');
      }

    } catch (error) {
      console.error('Error updating tournament:', error);
      this.showError('Failed to update tournament: ' + error.message);
      
      // Restore button
      const submitButton = document.getElementById('edit-tournament-form').querySelector('button[type="submit"]');
      submitButton.innerHTML = '<i class="fas fa-save mr-2"></i>Update Tournament';
      submitButton.disabled = false;
    }
  }

  formatDateForInput(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      // Format for datetime-local input (YYYY-MM-DDTHH:MM)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  hideEditTournamentModal() {
    const modal = document.getElementById('edit-tournament-modal');
    if (modal) {
      modal.remove();
    }
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