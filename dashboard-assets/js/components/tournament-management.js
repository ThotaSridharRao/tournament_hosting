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
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h2 class="text-3xl font-bold text-starlight mb-2">Tournament Management</h2>
            <p class="text-starlight-muted">Create and manage your tournaments</p>
          </div>
          <button id="create-tournament-btn" class="mt-4 lg:mt-0 px-6 py-3 bg-cyber-cyan text-dark-matter rounded-lg font-semibold hover:bg-cyber-cyan/90 transition-colors">
            <i class="fas fa-plus mr-2"></i>
            Create Tournament
          </button>
        </div>

        <!-- Filters and Search -->
        <div class="glass rounded-xl p-6 mb-6">
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
          <p class="text-starlight-muted mb-6">Create your first tournament to get started</p>
          <button class="px-6 py-3 bg-cyber-cyan text-dark-matter rounded-lg font-semibold hover:bg-cyber-cyan/90 transition-colors">
            <i class="fas fa-plus mr-2"></i>
            Create Tournament
          </button>
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
    const createBtn = document.getElementById('create-tournament-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => {
        this.showCreateModal();
      });
    }
  }

  async loadTournaments() {
    try {
      this.showLoading(true);
      const params = {
        page: this.pagination.page,
        limit: this.pagination.limit,
        status: this.filters.status,
        search: this.filters.search,
        sort_by: this.filters.sortBy,
        sort_order: this.filters.sortOrder
      };
      
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
    
    const participantCount = tournament.participant_count || 0;
    const maxParticipants = tournament.max_participants || 0;
    const statusClass = statusColors[tournament.status] || 'bg-gray-500/20 text-gray-400';
    
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
              <span><i class="fas fa-users mr-1"></i> ${participantCount}/${maxParticipants} participants</span>
              <span><i class="fas fa-coins mr-1"></i> ₹${tournament.entry_fee || 0} entry fee</span>
              <span><i class="fas fa-trophy mr-1"></i> ₹${tournament.prize_pool || 0} prize pool</span>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-4 lg:mt-0">
            <button onclick="window.tournamentManagement.manageParticipants('${tournament._id}')" 
              class="px-4 py-2 bg-cyber-indigo/20 text-cyber-indigo rounded-lg hover:bg-cyber-indigo/30 transition-colors">
              <i class="fas fa-users mr-1"></i> Participants
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

  showCreateModal() {
    // Placeholder for create tournament modal
    alert('Create tournament functionality will be implemented soon!');
  }

  async editTournament(tournamentId) {
    this.currentTournament = this.tournaments.find(t => t._id === tournamentId);
    alert('Edit tournament functionality will be implemented soon!');
  }

  async manageParticipants(tournamentId) {
    const tournament = this.tournaments.find(t => t._id === tournamentId);
    if (!tournament) return;
    
    alert(`Managing participants for: ${tournament.title}\nThis functionality will be implemented soon!`);
  }

  async loadParticipants(tournamentId) {
    const response = await window.apiClient.getTournamentParticipants(tournamentId);
    if (response.success) {
      this.participants = response.data.participants || [];
      this.renderParticipantList();
    }
  }

  renderParticipantList() {
    // Placeholder for participant list rendering
    console.log('Rendering participant list:', this.participants);
  }

  async updateParticipantStatus(participantId, status) {
    const response = await window.apiClient.updateParticipantStatus(
      this.currentTournament._id, 
      participantId, 
      status
    );
    
    if (response.success) {
      this.showSuccess('Participant status updated!');
      await this.loadParticipants(this.currentTournament._id);
    } else {
      this.showError('Failed to update participant status');
    }
  }

  async exportParticipants(tournamentId) {
    try {
      this.showInfo('Generating participant list...');
      const tournament = this.tournaments.find(t => t._id === tournamentId);
      const blob = await window.apiClient.exportParticipantsCSV(tournamentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${tournament.title}_participants.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      this.showSuccess('Participant list downloaded!');
    } catch (error) {
      this.showError('Failed to export participants');
    }
  }

  async deleteTournament(tournamentId) {
    if (!confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) return;
    
    try {
      const response = await window.apiClient.deleteTournament(tournamentId);
      if (response.success) {
        this.showSuccess('Tournament deleted successfully!');
        await this.loadTournaments();
      } else {
        this.showError('Failed to delete tournament');
      }
    } catch (error) {
      this.showError('Failed to delete tournament: ' + error.message);
    }
  }

  showSuccess(message) {
    console.log('Success:', message);
    // TODO: Implement proper notification system
  }

  showError(message) {
    console.error('Error:', message);
    // TODO: Implement proper notification system
  }

  showInfo(message) {
    console.log('Info:', message);
    // TODO: Implement proper notification system
  }

  destroy() {
    this.tournaments = [];
    this.currentTournament = null;
    this.participants = [];
  }
}

// Export for use throughout the application
window.TournamentManagement = TournamentManagement;