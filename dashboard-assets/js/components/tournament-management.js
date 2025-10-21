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
        <div class="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 class="text-3xl font-bold text-starlight mb-2">Tournament Management</h2>
            <p class="text-starlight-muted">View and manage your tournaments</p>
          </div>
          <button id="create-tournament-btn" class="mt-4 lg:mt-0 px-6 py-3 bg-gradient-to-r from-cyber-cyan to-cyber-indigo text-dark-matter rounded-lg font-semibold hover:from-cyber-cyan/90 hover:to-cyber-indigo/90 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyber-cyan/25 flex items-center gap-2">
            <i class="fas fa-plus"></i>
            Create Tournament
          </button>
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
        <div id="tournaments-empty" class="hidden">
          <div class="glass rounded-xl p-12 text-center">
            <div class="mb-8">
              <div class="w-24 h-24 bg-cyber-cyan/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-trophy text-4xl text-cyber-cyan"></i>
              </div>
              <h3 class="text-2xl font-bold text-starlight mb-3">Ready to Host Your First Tournament?</h3>
              <p class="text-starlight-muted text-lg mb-2">Create engaging gaming competitions and build your community</p>
              <p class="text-starlight-muted">Set up tournaments, manage participants, and track your success</p>
            </div>
            
            <button id="create-first-tournament-btn" class="px-8 py-4 bg-gradient-to-r from-cyber-cyan to-cyber-indigo text-dark-matter rounded-lg font-bold text-lg hover:from-cyber-cyan/90 hover:to-cyber-indigo/90 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-cyber-cyan/30 flex items-center gap-3 mx-auto">
              <i class="fas fa-plus-circle text-xl"></i>
              Create Your First Tournament
            </button>
            
            <div class="mt-8 pt-8 border-t border-cyber-border/30">
              <p class="text-sm text-starlight-muted mb-4">Need help getting started?</p>
              <div class="flex flex-wrap justify-center gap-4 text-sm">
                <span class="flex items-center gap-2 text-starlight-muted">
                  <i class="fas fa-check text-cyber-cyan"></i>
                  Easy tournament setup
                </span>
                <span class="flex items-center gap-2 text-starlight-muted">
                  <i class="fas fa-check text-cyber-cyan"></i>
                  Automated participant management
                </span>
                <span class="flex items-center gap-2 text-starlight-muted">
                  <i class="fas fa-check text-cyber-cyan"></i>
                  Real-time analytics
                </span>
              </div>
            </div>
          </div>
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

    // Create tournament button
    const createTournamentBtn = document.getElementById('create-tournament-btn');
    if (createTournamentBtn) {
      createTournamentBtn.addEventListener('click', () => {
        this.showCreateTournamentModal();
      });
    }

    // Create first tournament button (empty state)
    const createFirstTournamentBtn = document.getElementById('create-first-tournament-btn');
    if (createFirstTournamentBtn) {
      createFirstTournamentBtn.addEventListener('click', () => {
        this.showCreateTournamentModal();
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
            <button onclick="window.tournamentManagement.manageBrackets('${tournament._id}')" 
              class="w-10 h-10 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors flex items-center justify-center" 
              title="Manage Brackets">
              <i class="fas fa-sitemap"></i>
            </button>
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
    this.smoothCloseModal('event-management-modal');
  }

  async manageBrackets(tournamentId) {
    this.currentTournament = this.tournaments.find(t => t._id === tournamentId);
    if (!this.currentTournament) {
      this.showError('Tournament not found');
      return;
    }

    await this.showBracketsModal();
  }

  async showBracketsModal() {
    const tournament = this.currentTournament;

    // Load participants first
    try {
      const response = await window.apiClient.getTournamentParticipants(tournament._id);
      if (response.success) {
        this.participants = response.data.participants || [];
      }
    } catch (error) {
      console.error('Failed to load participants:', error);
      this.participants = [];
    }

    const modalHtml = `
      <div id="brackets-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="glass rounded-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto animate-slide-in">
          <div class="flex justify-between items-center p-6 border-b border-cyber-border">
            <div>
              <h3 class="text-2xl font-semibold text-starlight">Tournament Brackets</h3>
              <p class="text-starlight-muted mt-1">${tournament.title}</p>
            </div>
            <button id="close-brackets-modal" class="text-starlight-muted hover:text-starlight">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <div class="p-6">
            <!-- Tournament Info -->
            <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="bg-dark-matter/30 border border-cyber-border rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-cyber-cyan">${this.participants.length}</div>
                <div class="text-starlight-muted text-sm">Teams</div>
              </div>
              <div class="bg-dark-matter/30 border border-cyber-border rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-green-400">${tournament.format || 'Single Elimination'}</div>
                <div class="text-starlight-muted text-sm">Format</div>
              </div>
              <div class="bg-dark-matter/30 border border-cyber-border rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-yellow-400">${tournament.status?.replace('_', ' ').toUpperCase()}</div>
                <div class="text-starlight-muted text-sm">Status</div>
              </div>
              <div class="bg-dark-matter/30 border border-cyber-border rounded-lg p-4 text-center">
                <button id="generate-brackets-btn" class="w-full px-4 py-2 bg-gradient-to-r from-cyber-cyan to-cyber-indigo text-dark-matter rounded-lg font-semibold hover:from-cyber-cyan/90 hover:to-cyber-indigo/90 transition-all duration-300">
                  Generate Brackets
                </button>
              </div>
            </div>

            <!-- Loading State -->
            <div id="brackets-loading" class="hidden text-center py-12">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-cyan"></div>
              <p class="mt-4 text-starlight-muted">Loading brackets...</p>
            </div>

            <!-- Brackets Content -->
            <div id="brackets-content">
              <!-- Brackets will be populated here -->
            </div>

            <!-- Empty State -->
            <div id="brackets-empty" class="text-center py-12">
              <i class="fas fa-sitemap text-6xl text-starlight-muted mb-4"></i>
              <h4 class="text-xl font-semibold text-starlight mb-2">No Brackets Generated</h4>
              <p class="text-starlight-muted mb-4">Generate brackets to organize matches and track tournament progress</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    await this.initializeBracketsModal();
  }

  async initializeBracketsModal() {
    // Bind events
    document.getElementById('close-brackets-modal').addEventListener('click', () => {
      this.hideBracketsModal();
    });

    document.getElementById('generate-brackets-btn').addEventListener('click', () => {
      this.generateTournamentBrackets();
    });

    // Close modal on outside click
    document.getElementById('brackets-modal').addEventListener('click', (e) => {
      if (e.target.id === 'brackets-modal') {
        this.hideBracketsModal();
      }
    });

    // Check if brackets already exist
    await this.loadExistingBrackets();
  }

  async loadExistingBrackets() {
    try {
      const response = await window.apiClient.getTournamentBrackets(this.currentTournament._id);
      if (response.success && response.data) {
        this.renderBracketsContent(response.data);
      }
    } catch (error) {
      console.log('No existing brackets found');
    }
  }

  async generateTournamentBrackets() {
    try {
      if (this.participants.length === 0) {
        this.showError('No participants found. Cannot generate brackets.');
        return;
      }

      // Show loading
      const generateBtn = document.getElementById('generate-brackets-btn');
      const originalText = generateBtn.innerHTML;
      generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';
      generateBtn.disabled = true;

      // Create bracket structure based on tournament format
      const format = this.currentTournament.format || 'single-elimination';
      const bracketData = this.createBracketStructure(format);

      // Save brackets via API
      const response = await window.apiClient.createTournamentBrackets(this.currentTournament._id, bracketData);

      if (response.success) {
        this.renderBracketsContent(response.data);
        this.showNotification('Brackets generated successfully!', 'success');
      } else {
        throw new Error(response.message || 'Failed to generate brackets');
      }

    } catch (error) {
      console.error('Error generating brackets:', error);
      this.showError('Failed to generate brackets: ' + error.message);
    } finally {
      // Restore button
      const generateBtn = document.getElementById('generate-brackets-btn');
      if (generateBtn) {
        generateBtn.innerHTML = 'Generate Brackets';
        generateBtn.disabled = false;
      }
    }
  }

  createBracketStructure(format) {
    // Create bracket structure similar to tournament-brackets.html
    const participants = this.participants;
    const kpSettings = this.currentTournament.kpSettings || {};

    if (format === 'free_fire' || this.currentTournament.game?.toLowerCase().includes('free fire')) {
      return this.createFreeFireBrackets(participants, kpSettings);
    } else {
      return this.createGenericBrackets(participants, format);
    }
  }

  createFreeFireBrackets(participants, kpSettings) {
    const numberOfGroups = kpSettings.numberOfGroups || 4;
    const teamsPerMatch = kpSettings.teamsPerMatch || 10;
    const qualifiersPerGroup = kpSettings.qualifiersPerGroup || 4;

    const qualifierMatches = Math.ceil(participants.length / teamsPerMatch);
    const qualifierTables = [];

    // Create qualifier matches
    for (let i = 1; i <= qualifierMatches; i++) {
      qualifierTables.push({
        name: `Qualifier Match ${i}`,
        type: 'free_fire_qualifier',
        teamsPerMatch: teamsPerMatch,
        totalMatches: 1,
        qualifiers: 2,
        matchNumber: i
      });
    }

    return {
      title: 'Free Fire Tournament',
      description: 'Battle Royale tournament with qualifier matches leading to grand finals.',
      stages: [
        {
          name: 'Qualifier Matches',
          description: `${qualifierMatches} qualifier matches, top 2 teams from each qualify for finals`,
          tables: qualifierTables
        },
        {
          name: 'Grand Finals',
          description: 'Final battle with top teams',
          tables: [
            {
              name: 'Grand Finals',
              type: 'free_fire_finals',
              teamsPerMatch: qualifierMatches * 2,
              totalMatches: 1,
              qualifiers: 1
            }
          ]
        }
      ]
    };
  }

  createGenericBrackets(participants, format) {
    const numberOfGroups = 4;
    const qualifiersPerGroup = 4;

    return {
      title: `${format.charAt(0).toUpperCase() + format.slice(1)} Tournament`,
      description: `Tournament using ${format} format with ${participants.length} teams.`,
      stages: [
        {
          name: 'Group Stage',
          description: `${numberOfGroups} groups, top ${qualifiersPerGroup} from each advance`,
          tables: Array.from({ length: numberOfGroups }, (_, i) => ({
            name: `Group ${String.fromCharCode(65 + i)}`,
            type: 'qualifier',
            teamsPerMatch: Math.ceil(participants.length / numberOfGroups),
            totalMatches: 1,
            qualifiers: qualifiersPerGroup
          }))
        },
        {
          name: 'Finals',
          description: `Final stage with top ${numberOfGroups * qualifiersPerGroup} teams`,
          tables: [
            {
              name: 'Finals',
              type: 'final',
              teamsPerMatch: numberOfGroups * qualifiersPerGroup,
              totalMatches: 1,
              qualifiers: 1
            }
          ]
        }
      ]
    };
  }

  renderBracketsContent(bracketData) {
    const contentElement = document.getElementById('brackets-content');
    const emptyElement = document.getElementById('brackets-empty');

    emptyElement.classList.add('hidden');
    contentElement.classList.remove('hidden');

    let html = '';

    if (bracketData.stages) {
      bracketData.stages.forEach((stage, stageIndex) => {
        html += `
          <div class="stage-section mb-8">
            <div class="stage-header bg-gradient-to-r from-cyber-cyan to-cyber-indigo text-dark-matter rounded-t-xl p-4">
              <h4 class="text-xl font-bold">${stage.name}</h4>
              <p class="opacity-90">${stage.description}</p>
            </div>
            
            <div class="stage-tables space-y-6 bg-dark-matter/30 border border-cyber-border rounded-b-xl p-6">
              ${stage.tables.map((table, tableIndex) => this.renderMatchTable(table, stageIndex, tableIndex)).join('')}
            </div>
          </div>
        `;
      });
    }

    contentElement.innerHTML = html;
  }

  renderMatchTable(tableConfig, stageIndex, tableIndex) {
    const tableId = `stage-${stageIndex}-table-${tableIndex}`;

    // Calculate team distribution for this table
    const totalParticipants = this.participants.length;
    const numberOfTables = tableConfig.type === 'qualifier' ? 4 : 1;

    let teamsForThisTable = [];
    if (tableConfig.type === 'qualifier') {
      const baseTeamsPerTable = Math.floor(totalParticipants / numberOfTables);
      const extraTeams = totalParticipants % numberOfTables;

      let startIndex;
      if (tableIndex < extraTeams) {
        const teamsInThisTable = baseTeamsPerTable + 1;
        startIndex = tableIndex * teamsInThisTable;
        teamsForThisTable = this.participants.slice(startIndex, startIndex + teamsInThisTable);
      } else {
        const teamsInThisTable = baseTeamsPerTable;
        startIndex = (extraTeams * (baseTeamsPerTable + 1)) + ((tableIndex - extraTeams) * baseTeamsPerTable);
        teamsForThisTable = this.participants.slice(startIndex, startIndex + teamsInThisTable);
      }
    } else if (tableConfig.type === 'free_fire_qualifier') {
      const teamsPerMatch = tableConfig.teamsPerMatch || 10;
      const matchNumber = tableConfig.matchNumber || 1;
      const startIndex = (matchNumber - 1) * teamsPerMatch;
      teamsForThisTable = this.participants.slice(startIndex, startIndex + teamsPerMatch);
    }

    let html = `
      <div class="match-table-container bg-dark-matter/50 border border-cyber-border rounded-lg overflow-hidden">
        <div class="match-table-header bg-dark-matter/70 p-4 flex justify-between items-center">
          <h5 class="text-lg font-semibold text-starlight">${tableConfig.name}</h5>
          <div class="flex items-center gap-3">
            <span class="bg-cyber-cyan text-dark-matter px-3 py-1 rounded-full text-sm font-semibold">
              ${teamsForThisTable.length} Teams
            </span>
            <button onclick="window.tournamentManagement.updateFinalists('${tableId}', '${tableConfig.name}')" 
                    class="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-semibold">
              Update Results
            </button>
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-dark-matter/30">
    `;

    // Table headers based on type
    if (tableConfig.type === 'free_fire_qualifier' || tableConfig.type === 'free_fire_finals') {
      html += `
        <tr>
          <th class="px-4 py-3 text-left text-starlight">Slot</th>
          <th class="px-4 py-3 text-left text-starlight">Team Name</th>
          <th class="px-4 py-3 text-left text-starlight">Captain</th>
          <th class="px-4 py-3 text-left text-starlight">Players</th>
        </tr>
      `;
    } else {
      html += `
        <tr>
          <th class="px-4 py-3 text-left text-starlight">S.No</th>
          <th class="px-4 py-3 text-left text-starlight">Team Name</th>
          <th class="px-4 py-3 text-left text-starlight">Captain</th>
          <th class="px-4 py-3 text-left text-starlight">S.No</th>
          <th class="px-4 py-3 text-left text-starlight">Team Name</th>
          <th class="px-4 py-3 text-left text-starlight">Captain</th>
        </tr>
      `;
    }

    html += `</thead><tbody>`;

    // Table rows based on type
    if (tableConfig.type === 'free_fire_qualifier' || tableConfig.type === 'free_fire_finals') {
      const maxSlots = tableConfig.teamsPerMatch || 10;
      for (let slot = 1; slot <= maxSlots; slot++) {
        const team = teamsForThisTable[slot - 1];
        html += `
          <tr class="border-t border-cyber-border/30 hover:bg-dark-matter/20">
            <td class="px-4 py-3 font-semibold text-cyber-cyan">${slot}</td>
            <td class="px-4 py-3 text-starlight">${team ? team.teamName : 'Open Slot'}</td>
            <td class="px-4 py-3 text-starlight-muted">${team ? (team.captainEmail || 'No Captain') : '-'}</td>
            <td class="px-4 py-3 text-starlight-muted">${team ? (team.players?.length || 0) + ' players' : '-'}</td>
          </tr>
        `;
      }
    } else {
      // Two-column layout for qualifier/final tables
      const maxRows = Math.ceil(teamsForThisTable.length / 2);
      for (let row = 0; row < maxRows; row++) {
        const team1 = teamsForThisTable[row * 2];
        const team2 = teamsForThisTable[row * 2 + 1];

        html += `
          <tr class="border-t border-cyber-border/30 hover:bg-dark-matter/20">
            <td class="px-4 py-3 font-semibold text-cyber-cyan">${row * 2 + 1}</td>
            <td class="px-4 py-3 text-starlight">${team1 ? team1.teamName : 'Open Slot'}</td>
            <td class="px-4 py-3 text-starlight-muted">${team1 ? (team1.captainEmail || 'No Captain') : '-'}</td>
            <td class="px-4 py-3 font-semibold text-cyber-cyan">${team2 ? row * 2 + 2 : ''}</td>
            <td class="px-4 py-3 text-starlight">${team2 ? team2.teamName : ''}</td>
            <td class="px-4 py-3 text-starlight-muted">${team2 ? (team2.captainEmail || 'No Captain') : ''}</td>
          </tr>
        `;
      }
    }

    html += `</tbody></table></div></div>`;
    return html;
  }

  async updateFinalists(tableId, tableName) {
    // Show modal to update finalists/results for this table
    this.showUpdateFinalistsModal(tableId, tableName);
  }

  showUpdateFinalistsModal(tableId, tableName) {
    const modalHtml = `
      <div id="update-finalists-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="glass rounded-xl max-w-md w-full animate-slide-in">
          <div class="flex justify-between items-center p-6 border-b border-cyber-border">
            <h3 class="text-xl font-semibold text-starlight">Update Results</h3>
            <button id="close-finalists-modal" class="text-starlight-muted hover:text-starlight">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <div class="p-6">
            <div class="mb-4">
              <h4 class="text-lg font-semibold text-starlight mb-2">${tableName}</h4>
              <p class="text-starlight-muted">Update match results and finalists</p>
            </div>

            <form id="finalists-form" class="space-y-4">
              <div>
                <label for="match-status" class="block text-sm font-medium text-starlight mb-2">Match Status</label>
                <select id="match-status" name="status" class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none">
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label for="match-notes" class="block text-sm font-medium text-starlight mb-2">Match Notes</label>
                <textarea id="match-notes" name="notes" rows="3" placeholder="Match results, scores, finalists..."
                          class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none resize-vertical"></textarea>
              </div>

              <div class="flex gap-3 pt-4">
                <button type="button" onclick="window.tournamentManagement.hideUpdateFinalistsModal()" 
                        class="flex-1 px-4 py-3 bg-dark-matter/50 text-starlight-muted rounded-lg hover:bg-dark-matter/70 transition-colors">
                  Cancel
                </button>
                <button type="submit" 
                        class="flex-1 px-4 py-3 bg-cyber-cyan text-dark-matter rounded-lg hover:bg-cyber-cyan/90 transition-colors font-semibold">
                  Update Results
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Bind events
    document.getElementById('close-finalists-modal').addEventListener('click', () => {
      this.hideUpdateFinalistsModal();
    });

    document.getElementById('finalists-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitFinalistsUpdate(tableId, tableName);
    });
  }

  async submitFinalistsUpdate(tableId, tableName) {
    try {
      const form = document.getElementById('finalists-form');
      const formData = new FormData(form);

      const updateData = {
        tableId: tableId,
        tableName: tableName,
        status: formData.get('status'),
        notes: formData.get('notes')
      };

      // Show loading
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Updating...';
      submitBtn.disabled = true;

      // Update via API
      const response = await window.apiClient.updateTournamentResults(this.currentTournament._id, updateData);

      if (response.success) {
        this.hideUpdateFinalistsModal();
        this.showNotification('Results updated successfully!', 'success');
        // Refresh brackets display
        await this.loadExistingBrackets();
      } else {
        throw new Error(response.message || 'Failed to update results');
      }

    } catch (error) {
      console.error('Error updating results:', error);
      this.showError('Failed to update results: ' + error.message);
    } finally {
      // Restore button
      const submitBtn = document.getElementById('finalists-form')?.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = 'Update Results';
        submitBtn.disabled = false;
      }
    }
  }

  hideUpdateFinalistsModal() {
    const modal = document.getElementById('update-finalists-modal');
    if (modal) {
      modal.classList.add('animate-fade-out');
      setTimeout(() => modal.remove(), 250);
    }
  }

  hideBracketsModal() {
    this.smoothCloseModal('brackets-modal');
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
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2">
                <button id="export-csv-btn" class="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2" title="Export as CSV">
                  <i class="fas fa-file-csv"></i>
                  <span class="hidden sm:inline">CSV</span>
                </button>
                <button id="export-excel-btn" class="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2" title="Export as Excel">
                  <i class="fas fa-file-excel"></i>
                  <span class="hidden sm:inline">Excel</span>
                </button>
              </div>
              <button id="close-participants-modal" class="text-starlight-muted hover:text-starlight">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
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
                  Click column headers to sort • Click actions to manage teams
                </div>
              </div>
              
              <div id="participants-list" class="overflow-x-auto">
                <!-- Participants table will be populated here -->
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

    // Export buttons
    document.getElementById('export-csv-btn').addEventListener('click', () => {
      this.exportParticipants('csv');
    });

    document.getElementById('export-excel-btn').addEventListener('click', () => {
      this.exportParticipants('xlsx');
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

    // Initialize sorting state if not exists
    if (!this.participantsSortState) {
      this.participantsSortState = {
        column: 'teamName',
        direction: 'asc'
      };
    }

    // Sort participants
    const sortedParticipants = this.sortParticipants(participants);

    // Render participants table
    listElement.innerHTML = this.renderParticipantsTable(sortedParticipants);
  }

  renderParticipantsTable(participants) {
    return `
      <div class="bg-dark-matter/30 border border-cyber-border/30 rounded-lg overflow-hidden">
        <table class="w-full">
          <thead class="bg-dark-matter/50 border-b border-cyber-border/30">
            <tr>
              <th class="px-4 py-3 text-left text-starlight font-semibold">#</th>
              <th class="px-4 py-3 text-left text-starlight font-semibold cursor-pointer hover:bg-cyber-cyan/10 transition-colors" 
                  onclick="window.tournamentManagement.sortParticipantsBy('teamName')">
                <div class="flex items-center gap-2">
                  Team Name
                  <i class="fas fa-sort${this.getSortIcon('teamName')} text-cyber-cyan"></i>
                </div>
              </th>
              <th class="px-4 py-3 text-left text-starlight font-semibold">Players</th>
              <th class="px-4 py-3 text-left text-starlight font-semibold cursor-pointer hover:bg-cyber-cyan/10 transition-colors" 
                  onclick="window.tournamentManagement.sortParticipantsBy('registrationDate')">
                <div class="flex items-center gap-2">
                  Registration Date
                  <i class="fas fa-sort${this.getSortIcon('registrationDate')} text-cyber-cyan"></i>
                </div>
              </th>
              <th class="px-4 py-3 text-center text-starlight font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-cyber-border/20">
            ${participants.map((participant, index) => this.renderParticipantRow(participant, index)).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderParticipantRow(participant, index) {
    const players = participant.players || [];
    const teamName = participant.teamName || 'Unknown Team';
    const teamId = participant._id;
    const registrationDate = participant.createdAt ? new Date(participant.createdAt).toLocaleDateString() : 'Unknown';

    return `
      <tr class="hover:bg-cyber-cyan/5 transition-colors">
        <td class="px-4 py-3 text-cyber-cyan font-semibold">${index + 1}</td>
        <td class="px-4 py-3">
          <div class="text-starlight font-medium">${teamName}</div>
        </td>
        <td class="px-4 py-3">
          <div class="text-starlight-muted">${players.length} ${players.length === 1 ? 'player' : 'players'}</div>
        </td>
        <td class="px-4 py-3">
          <div class="text-starlight-muted">${registrationDate}</div>
        </td>
        <td class="px-4 py-3">
          <div class="flex items-center justify-center gap-2">
            <button onclick="window.tournamentManagement.viewTeamDetails('${teamId}', '${teamName.replace(/'/g, "\\'")}', ${index})" 
                    class="w-8 h-8 bg-cyber-cyan/20 text-cyber-cyan rounded hover:bg-cyber-cyan/30 transition-colors flex items-center justify-center" 
                    title="View Team Details">
              <i class="fas fa-eye text-xs"></i>
            </button>
            <button onclick="window.tournamentManagement.removeParticipant('${teamId}', '${teamName.replace(/'/g, "\\'")}', ${index})" 
                    class="w-8 h-8 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors flex items-center justify-center" 
                    title="Remove Team">
              <i class="fas fa-trash text-xs"></i>
            </button>
          </div>
        </td>
      </tr>
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
    this.smoothCloseModal('team-details-modal');
  }

  sortParticipantsBy(column) {
    if (this.participantsSortState.column === column) {
      // Toggle direction if same column
      this.participantsSortState.direction = this.participantsSortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to ascending
      this.participantsSortState.column = column;
      this.participantsSortState.direction = 'asc';
    }

    // Re-render participants with new sort
    this.renderParticipants(this.participants);
  }

  sortParticipants(participants) {
    const { column, direction } = this.participantsSortState;

    return [...participants].sort((a, b) => {
      let aValue, bValue;

      switch (column) {
        case 'teamName':
          aValue = (a.teamName || '').toLowerCase();
          bValue = (b.teamName || '').toLowerCase();
          break;
        case 'registrationDate':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortIcon(column) {
    if (this.participantsSortState.column !== column) {
      return '';
    }
    return this.participantsSortState.direction === 'asc' ? '-up' : '-down';
  }

  async exportParticipants(format) {
    try {
      if (!this.participants || this.participants.length === 0) {
        this.showError('No participants to export');
        return;
      }

      // Show loading state on button
      const button = document.getElementById(`export-${format === 'xlsx' ? 'excel' : 'csv'}-btn`);
      const originalContent = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Exporting...';
      button.disabled = true;

      // Prepare export data
      const exportData = {
        tournamentId: this.currentTournament._id,
        tournamentTitle: this.currentTournament.title,
        format: format,
        participants: this.participants.map(participant => ({
          teamName: participant.teamName || 'Unknown Team',
          playerCount: participant.players ? participant.players.length : 0,
          players: participant.players || [],
          registrationDate: participant.createdAt,
          captainPhone: participant.phone || '',
          status: participant.status || 'registered'
        }))
      };

      // Make API request for file download
      const response = await fetch(`${window.apiClient.baseURL}/api/host/tournaments/${this.currentTournament._id}/participants/export`, {
        method: 'POST',
        headers: {
          ...window.apiClient.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format, data: exportData })
      });

      if (response.ok) {
        // Get the blob from response
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Set filename based on format
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${this.currentTournament.title.replace(/[^a-zA-Z0-9]/g, '_')}_participants_${timestamp}.${format}`;
        link.download = filename;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        window.URL.revokeObjectURL(url);

        this.showNotification(`Participants exported successfully as ${format.toUpperCase()}!`, 'success');
      } else {
        throw new Error('Failed to export participants');
      }

    } catch (error) {
      console.error('Export error:', error);

      // Fallback to client-side export if API fails
      if (format === 'csv') {
        this.exportParticipantsCSV();
      } else {
        this.showError('Excel export requires server support. Please try CSV format.');
      }
    } finally {
      // Restore button state
      const button = document.getElementById(`export-${format === 'xlsx' ? 'excel' : 'csv'}-btn`);
      if (button) {
        button.innerHTML = originalContent;
        button.disabled = false;
      }
    }
  }

  exportParticipantsCSV() {
    try {
      // Prepare CSV data
      const headers = ['Team Name', 'Player Count', 'Player Names', 'Player Emails', 'Game IDs', 'Registration Date', 'Captain Phone'];
      const rows = this.participants.map(participant => {
        const players = participant.players || [];
        const playerNames = players.map(p => p.name || 'Unknown').join('; ');
        const playerEmails = players.map(p => p.email || 'N/A').join('; ');
        const gameIds = players.map(p => p.inGameId || 'N/A').join('; ');
        const registrationDate = participant.createdAt ? new Date(participant.createdAt).toLocaleDateString() : 'Unknown';

        return [
          participant.teamName || 'Unknown Team',
          players.length,
          playerNames,
          playerEmails,
          gameIds,
          registrationDate,
          participant.phone || 'N/A'
        ];
      });

      // Create CSV content
      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${this.currentTournament.title.replace(/[^a-zA-Z0-9]/g, '_')}_participants_${timestamp}.csv`;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      this.showNotification('Participants exported successfully as CSV!', 'success');
    } catch (error) {
      console.error('CSV export error:', error);
      this.showError('Failed to export CSV file');
    }
  }

  hideParticipantsModal() {
    this.smoothCloseModal('participants-modal');
  }

  showCreateTournamentModal() {
    const modalHtml = `
      <div id="create-tournament-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="glass rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-in">
          <div class="flex justify-between items-center p-6 border-b border-cyber-border">
            <div>
              <h3 class="text-2xl font-semibold text-starlight flex items-center gap-3">
                <i class="fas fa-plus-circle text-cyber-cyan"></i>
                Create Tournament
              </h3>
              <p class="text-starlight-muted mt-1">Set up your gaming tournament and start building your community</p>
            </div>
            <button id="close-create-modal" class="text-starlight-muted hover:text-starlight transition-colors">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <form id="create-tournament-form" class="p-6 space-y-6">
            <!-- Basic Information -->
            <div class="bg-dark-matter/30 border border-cyber-border/30 rounded-lg p-6">
              <h4 class="text-lg font-semibold text-starlight mb-4 flex items-center gap-2">
                <i class="fas fa-info-circle text-cyber-cyan"></i>
                Basic Information
              </h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group">
                  <label for="tournament-title" class="block text-sm font-medium text-starlight mb-2">Tournament Title *</label>
                  <input type="text" id="tournament-title" name="title" required maxlength="100" 
                         placeholder="Enter tournament title"
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none transition-colors">
                  <p class="text-xs text-starlight-muted mt-1">Choose an engaging title for your tournament</p>
                </div>
                
                <div class="form-group">
                  <label for="tournament-game" class="block text-sm font-medium text-starlight mb-2">Game *</label>
                  <input type="text" id="tournament-game" name="game" required maxlength="50"
                         placeholder="e.g., BGMI, Free Fire, Valorant, CS:GO"
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none transition-colors">
                  <p class="text-xs text-starlight-muted mt-1">Enter the name of the game for this tournament</p>
                </div>
              </div>

              <div class="form-group mt-4">
                <label for="tournament-description" class="block text-sm font-medium text-starlight mb-2">Description *</label>
                <textarea id="tournament-description" name="description" required maxlength="2000" rows="4"
                          placeholder="Describe your tournament, rules, and any special instructions..."
                          class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none transition-colors resize-vertical"></textarea>
                <p class="text-xs text-starlight-muted mt-1">Provide clear information about rules, format, and requirements</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div class="form-group">
                  <label for="tournament-format" class="block text-sm font-medium text-starlight mb-2">Tournament Format *</label>
                  <select id="tournament-format" name="format" required
                          class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none transition-colors">
                    <option value="">Select Format</option>
                    <option value="single-elimination">Single Elimination</option>
                    <option value="double_elimination">Double Elimination</option>
                    <option value="round_robin">Round Robin</option>
                    <option value="swiss">Swiss System</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="max-teams" class="block text-sm font-medium text-starlight mb-2">Maximum Teams *</label>
                  <input type="number" id="max-teams" name="maxTeams" required min="2" max="500" value="16"
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none transition-colors">
                  <p class="text-xs text-starlight-muted mt-1">Between 2 and 500 teams</p>
                </div>
              </div>
            </div>

            <!-- Schedule & Timing -->
            <div class="bg-dark-matter/30 border border-cyber-border/30 rounded-lg p-6">
              <h4 class="text-lg font-semibold text-starlight mb-4 flex items-center gap-2">
                <i class="fas fa-calendar-alt text-cyber-cyan"></i>
                Schedule & Timing
              </h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group">
                  <label for="registration-start" class="block text-sm font-medium text-starlight mb-2">Registration Start *</label>
                  <input type="datetime-local" id="registration-start" name="registrationStart" required
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none transition-colors datetime-white-icons">
                </div>
                
                <div class="form-group">
                  <label for="registration-end" class="block text-sm font-medium text-starlight mb-2">Registration End *</label>
                  <input type="datetime-local" id="registration-end" name="registrationEnd" required
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none transition-colors datetime-white-icons">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div class="form-group">
                  <label for="tournament-start" class="block text-sm font-medium text-starlight mb-2">Tournament Start *</label>
                  <input type="datetime-local" id="tournament-start" name="tournamentStart" required
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none transition-colors datetime-white-icons">
                </div>
                
                <div class="form-group">
                  <label for="tournament-end" class="block text-sm font-medium text-starlight mb-2">Tournament End *</label>
                  <input type="datetime-local" id="tournament-end" name="tournamentEnd" required
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none transition-colors datetime-white-icons">
                </div>
              </div>
            </div>

            <!-- Pricing & Teams -->
            <div class="bg-dark-matter/30 border border-cyber-border/30 rounded-lg p-6">
              <h4 class="text-lg font-semibold text-starlight mb-4 flex items-center gap-2">
                <i class="fas fa-coins text-cyber-cyan"></i>
                Pricing & Teams
              </h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="form-group">
                  <label for="entry-fee" class="block text-sm font-medium text-starlight mb-2">Entry Fee (₹)</label>
                  <input type="number" id="entry-fee" name="entryFee" min="0" max="10000" value="0" required
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none transition-colors">
                  <p class="text-xs text-starlight-muted mt-1">Set to 0 for free tournaments</p>
                </div>
                
                <div class="form-group">
                  <label for="prize-pool" class="block text-sm font-medium text-starlight mb-2">Prize Pool (₹)</label>
                  <input type="number" id="prize-pool" name="prizePool" min="0" max="100000" value="0" required
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none transition-colors">
                  <p class="text-xs text-starlight-muted mt-1">Total prize money for winners</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div class="form-group">
                  <label for="max-players-per-team" class="block text-sm font-medium text-starlight mb-2">Max Players per Team *</label>
                  <input type="number" id="max-players-per-team" name="maxPlayersPerTeam" min="1" max="10" value="4" required
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none transition-colors">
                  <p class="text-xs text-starlight-muted mt-1">Maximum number of players allowed per team</p>
                </div>
                
                <div class="form-group">
                  <label for="tournament-poster" class="block text-sm font-medium text-starlight mb-2">Tournament Poster</label>
                  <input type="file" id="tournament-poster" name="poster" accept="image/*"
                         class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyber-cyan file:text-dark-matter hover:file:bg-cyber-cyan/90">
                  <p class="text-xs text-starlight-muted mt-1">Upload a poster image for your tournament (optional)</p>
                </div>
              </div>
            </div>

            <!-- Venue Information -->
            <div class="bg-dark-matter/30 border border-cyber-border/30 rounded-lg p-6">
              <h4 class="text-lg font-semibold text-starlight mb-4 flex items-center gap-2">
                <i class="fas fa-map-marker-alt text-cyber-cyan"></i>
                Venue Information
              </h4>
              
              <div class="form-group mb-4">
                <label for="venue-type" class="block text-sm font-medium text-starlight mb-2">Venue Type *</label>
                <select id="venue-type" name="venueType" required
                        class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none transition-colors">
                  <option value="online">Online</option>
                  <option value="physical">Physical Venue</option>
                </select>
              </div>

              <div id="physical-venue-fields" class="hidden space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="form-group">
                    <label for="venue-name" class="block text-sm font-medium text-starlight mb-2">Venue Name</label>
                    <input type="text" id="venue-name" name="venueName"
                           class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none transition-colors">
                  </div>
                  
                  <div class="form-group">
                    <label for="venue-capacity" class="block text-sm font-medium text-starlight mb-2">Venue Capacity</label>
                    <input type="number" id="venue-capacity" name="venueCapacity" min="1"
                           class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none transition-colors">
                  </div>
                </div>

                <div class="form-group">
                  <label for="venue-address" class="block text-sm font-medium text-starlight mb-2">Address</label>
                  <textarea id="venue-address" name="venueAddress" rows="3"
                            class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none transition-colors resize-vertical"></textarea>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-cyber-border">
              <button type="button" id="cancel-create-tournament" 
                      class="flex-1 px-6 py-3 bg-gray-600/20 text-gray-300 rounded-lg hover:bg-gray-600/30 transition-colors font-semibold">
                Cancel
              </button>
              <button type="submit" id="submit-create-tournament"
                      class="flex-1 px-6 py-3 bg-gradient-to-r from-cyber-cyan to-cyber-indigo text-dark-matter rounded-lg font-semibold hover:from-cyber-cyan/90 hover:to-cyber-indigo/90 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                <i class="fas fa-plus"></i>
                Create Tournament
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Initialize modal
    this.initializeCreateTournamentModal();
  }

  initializeCreateTournamentModal() {
    // Bind close events
    document.getElementById('close-create-modal').addEventListener('click', () => {
      this.hideCreateTournamentModal();
    });

    document.getElementById('cancel-create-tournament').addEventListener('click', () => {
      this.hideCreateTournamentModal();
    });

    // Close modal on outside click
    document.getElementById('create-tournament-modal').addEventListener('click', (e) => {
      if (e.target.id === 'create-tournament-modal') {
        this.hideCreateTournamentModal();
      }
    });

    // Venue type change handler
    document.getElementById('venue-type').addEventListener('change', (e) => {
      const physicalFields = document.getElementById('physical-venue-fields');
      if (e.target.value === 'physical') {
        physicalFields.classList.remove('hidden');
      } else {
        physicalFields.classList.add('hidden');
      }
    });

    // Form submission
    document.getElementById('create-tournament-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCreateTournament();
    });

    // Set default dates
    this.setDefaultDates();

    // Setup real-time validation
    this.setupCreateTournamentValidation();
  }

  setupCreateTournamentValidation() {
    const validationRules = {
      title: {
        required: true,
        minLength: 3,
        maxLength: 100
      },
      game: {
        required: true,
        minLength: 2,
        maxLength: 50
      },
      description: {
        required: true,
        minLength: 10,
        maxLength: 2000
      },
      format: {
        required: true
      },
      maxTeams: {
        required: true,
        min: 2,
        max: 500
      },
      registrationStart: {
        required: true,
        date: true,
        futureDate: false // Can be now or future
      },
      registrationEnd: {
        required: true,
        date: true,
        futureDate: true,
        custom: (value) => {
          const regStart = document.getElementById('registration-start').value;
          if (regStart && value && new Date(value) <= new Date(regStart)) {
            return 'Registration end must be after registration start';
          }
          return true;
        }
      },
      tournamentStart: {
        required: true,
        date: true,
        futureDate: true,
        custom: (value) => {
          const regEnd = document.getElementById('registration-end').value;
          if (regEnd && value && new Date(value) <= new Date(regEnd)) {
            return 'Tournament start must be after registration end';
          }
          return true;
        }
      },
      tournamentEnd: {
        required: true,
        date: true,
        futureDate: true,
        custom: (value) => {
          const tournamentStart = document.getElementById('tournament-start').value;
          if (tournamentStart && value && new Date(value) <= new Date(tournamentStart)) {
            return 'Tournament end must be after tournament start';
          }
          return true;
        }
      },
      entryFee: {
        required: true,
        min: 0,
        max: 10000
      },
      prizePool: {
        required: true,
        min: 0,
        max: 100000
      },
      maxPlayersPerTeam: {
        required: true,
        min: 1,
        max: 10
      },
      venueType: {
        required: true
      }
    };

    this.setupRealTimeValidation('create-tournament-form', validationRules);
  }

  setDefaultDates() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Format dates for datetime-local input
    const formatDateTime = (date) => {
      return date.toISOString().slice(0, 16);
    };

    // Set default values
    document.getElementById('registration-start').value = formatDateTime(now);
    document.getElementById('registration-end').value = formatDateTime(tomorrow);
    document.getElementById('tournament-start').value = formatDateTime(tomorrow);
    document.getElementById('tournament-end').value = formatDateTime(nextWeek);
  }

  async handleCreateTournament() {
    try {
      // Validate form before submission
      const validationRules = {
        title: { required: true, minLength: 3, maxLength: 100 },
        game: { required: true, minLength: 2, maxLength: 50 },
        description: { required: true, minLength: 10, maxLength: 2000 },
        format: { required: true },
        maxTeams: { required: true, min: 2, max: 500 },
        registrationStart: { required: true, date: true },
        registrationEnd: { required: true, date: true, futureDate: true },
        tournamentStart: { required: true, date: true, futureDate: true },
        tournamentEnd: { required: true, date: true, futureDate: true },
        entryFee: { required: true, min: 0, max: 10000 },
        prizePool: { required: true, min: 0, max: 100000 },
        maxPlayersPerTeam: { required: true, min: 1, max: 10 },
        venueType: { required: true }
      };

      const validation = this.validateForm('create-tournament-form', validationRules);

      if (!validation.isValid) {
        // Focus on first error field
        const firstErrorField = document.querySelector('.input-field.error');
        if (firstErrorField) {
          firstErrorField.focus();
          firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        this.showError('Please fix the errors in the form before submitting');
        return;
      }

      const form = document.getElementById('create-tournament-form');
      const formData = new FormData(form);

      // Show loading state
      const submitButton = document.getElementById('submit-create-tournament');
      const originalText = submitButton.innerHTML;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating...';
      submitButton.disabled = true;

      // Create tournament via API
      const response = await window.apiClient.createTournament(formData);

      if (response.success) {
        this.showNotification('Tournament created successfully!', 'success');
        this.hideCreateTournamentModal();

        // Refresh tournaments list
        await this.loadTournaments();
      } else {
        throw new Error(response.message || 'Failed to create tournament');
      }

    } catch (error) {
      console.error('Error creating tournament:', error);
      this.showError('Failed to create tournament: ' + error.message);
    } finally {
      // Restore button
      const submitButton = document.getElementById('submit-create-tournament');
      if (submitButton) {
        submitButton.innerHTML = '<i class="fas fa-plus mr-2"></i>Create Tournament';
        submitButton.disabled = false;
      }
    }
  }

  hideCreateTournamentModal() {
    this.smoothCloseModal('create-tournament-modal');
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
    this.smoothCloseModal('participants-modal');
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
    this.smoothCloseModal('status-change-modal');
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
    this.smoothCloseModal('edit-tournament-modal');
  }

  async deleteTournament(tournamentId) {
    if (confirm('Are you sure you want to delete this tournament?')) {
      this.showNotification('Tournament deletion coming soon!', 'info');
    }
  }

  // Helper method for smooth modal closing
  smoothCloseModal(modalId, callback = null) {
    const modal = document.getElementById(modalId);
    if (modal) {
      // Add exit animation
      modal.classList.add('animate-fade-out');
      const modalContent = modal.querySelector('.glass, .rounded-xl');
      if (modalContent) {
        modalContent.classList.remove('animate-slide-in');
        modalContent.classList.add('animate-slide-out');
      }

      // Remove after animation completes
      setTimeout(() => {
        modal.remove();
        if (callback) callback();
      }, 250); // Match the animation duration
    }
  }

  // Form validation system
  validateField(fieldId, value, rules = {}) {
    const field = document.getElementById(fieldId);
    const formGroup = field?.closest('.form-group');

    if (!field || !formGroup) return { isValid: true };

    // Remove existing validation states
    field.classList.remove('error', 'success');
    formGroup.classList.remove('has-error', 'has-success');

    // Remove existing error/success messages
    const existingError = formGroup.querySelector('.field-error');
    const existingSuccess = formGroup.querySelector('.field-success');
    if (existingError) existingError.remove();
    if (existingSuccess) existingSuccess.remove();

    const errors = [];

    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push('This field is required');
    }

    // Min length validation
    if (rules.minLength && value && value.length < rules.minLength) {
      errors.push(`Minimum ${rules.minLength} characters required`);
    }

    // Max length validation
    if (rules.maxLength && value && value.length > rules.maxLength) {
      errors.push(`Maximum ${rules.maxLength} characters allowed`);
    }

    // Min value validation
    if (rules.min !== undefined && value && parseFloat(value) < rules.min) {
      errors.push(`Minimum value is ${rules.min}`);
    }

    // Max value validation
    if (rules.max !== undefined && value && parseFloat(value) > rules.max) {
      errors.push(`Maximum value is ${rules.max}`);
    }

    // Email validation
    if (rules.email && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push('Please enter a valid email address');
      }
    }

    // Date validation
    if (rules.date && value) {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.push('Please enter a valid date');
      } else if (rules.futureDate && date <= new Date()) {
        errors.push('Date must be in the future');
      }
    }

    // Custom validation
    if (rules.custom && typeof rules.custom === 'function') {
      const customResult = rules.custom(value);
      if (customResult !== true) {
        errors.push(customResult);
      }
    }

    // Apply validation state
    if (errors.length > 0) {
      field.classList.add('input-field', 'error');
      formGroup.classList.add('has-error');

      const errorDiv = document.createElement('div');
      errorDiv.className = 'field-error';
      errorDiv.innerHTML = `<i class="fas fa-exclamation-circle validation-icon"></i>${errors[0]}`;

      // Insert after the field
      field.parentNode.insertBefore(errorDiv, field.nextSibling);

      // Trigger animation
      setTimeout(() => errorDiv.classList.add('show'), 10);

      return { isValid: false, errors };
    } else if (value && value.toString().trim() !== '') {
      field.classList.add('input-field', 'success');
      formGroup.classList.add('has-success');

      const successDiv = document.createElement('div');
      successDiv.className = 'field-success';
      successDiv.innerHTML = `<i class="fas fa-check-circle validation-icon"></i>Valid`;

      // Insert after the field
      field.parentNode.insertBefore(successDiv, field.nextSibling);

      // Trigger animation
      setTimeout(() => successDiv.classList.add('show'), 10);
    }

    return { isValid: true };
  }

  // Validate entire form
  validateForm(formId, validationRules) {
    const form = document.getElementById(formId);
    if (!form) return { isValid: false, errors: ['Form not found'] };

    const formData = new FormData(form);
    const errors = {};
    let isFormValid = true;

    // Validate each field
    for (const [fieldName, rules] of Object.entries(validationRules)) {
      const fieldValue = formData.get(fieldName);
      const fieldId = form.querySelector(`[name="${fieldName}"]`)?.id;

      if (fieldId) {
        const validation = this.validateField(fieldId, fieldValue, rules);
        if (!validation.isValid) {
          errors[fieldName] = validation.errors;
          isFormValid = false;
        }
      }
    }

    return { isValid: isFormValid, errors };
  }

  // Real-time validation setup
  setupRealTimeValidation(formId, validationRules) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Add event listeners for real-time validation
    Object.keys(validationRules).forEach(fieldName => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        // Validate on blur (when user leaves field)
        field.addEventListener('blur', () => {
          const value = field.value;
          this.validateField(field.id, value, validationRules[fieldName]);
        });

        // Clear validation on focus (when user starts typing)
        field.addEventListener('focus', () => {
          const formGroup = field.closest('.form-group');
          if (formGroup) {
            field.classList.remove('error', 'success');
            formGroup.classList.remove('has-error', 'has-success');

            const errorMsg = formGroup.querySelector('.field-error');
            const successMsg = formGroup.querySelector('.field-success');
            if (errorMsg) errorMsg.remove();
            if (successMsg) successMsg.remove();
          }
        });

        // Validate on input for certain field types
        if (field.type === 'email' || field.type === 'number') {
          field.addEventListener('input', () => {
            // Debounce validation
            clearTimeout(field.validationTimeout);
            field.validationTimeout = setTimeout(() => {
              const value = field.value;
              if (value.trim() !== '') {
                this.validateField(field.id, value, validationRules[fieldName]);
              }
            }, 500);
          });
        }
      }
    });
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';

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

    // Auto remove after 3 seconds with smooth animation
    setTimeout(() => {
      notification.classList.remove('animate-fade-in');
      notification.classList.add('animate-fade-out');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 250);
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
