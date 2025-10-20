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
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
      <div class="animate-fade-in">
        <!-- Create Tournament Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-3xl font-bold text-starlight mb-2">Create Tournament</h2>
            <p class="text-starlight-muted">Set up a new tournament for your community</p>
          </div>
          <button onclick="window.tournamentManagement.init()" class="px-4 py-2 bg-starlight-muted/20 text-starlight-muted rounded-lg hover:bg-starlight-muted/30 transition-colors">
            <i class="fas fa-arrow-left mr-2"></i>
            Back to Tournaments
          </button>
        </div>

        <!-- Create Tournament Form -->
        <div class="glass rounded-xl p-8">
          <form id="create-tournament-form" class="space-y-6">
            <!-- Basic Information -->
            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-starlight border-b border-cyber-border pb-2">Basic Information</h3>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="form-group">
                  <label for="tournament-name" class="block text-sm font-medium text-starlight-muted mb-2">Tournament Name *</label>
                  <input type="text" id="tournament-name" name="title" class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none" placeholder="Enter tournament name" required>
                </div>
                
                <div class="form-group">
                  <label for="tournament-game" class="block text-sm font-medium text-starlight-muted mb-2">Game *</label>
                  <input type="text" id="tournament-game" name="game" class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none" placeholder="e.g., Valorant, CS2, PUBG" required>
                </div>
              </div>

              <div class="form-group">
                <label for="tournament-description" class="block text-sm font-medium text-starlight-muted mb-2">Description *</label>
                <textarea id="tournament-description" name="description" rows="4" class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none resize-vertical" placeholder="Describe your tournament..." required></textarea>
              </div>
            </div>

            <!-- Schedule -->
            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-starlight border-b border-cyber-border pb-2">Schedule</h3>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="form-group">
                  <label for="reg-start-date" class="block text-sm font-medium text-starlight-muted mb-2">Registration Start *</label>
                  <input type="datetime-local" id="reg-start-date" name="registrationStart" class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none datetime-white-icons" required>
                </div>
                
                <div class="form-group">
                  <label for="reg-end-date" class="block text-sm font-medium text-starlight-muted mb-2">Registration End *</label>
                  <input type="datetime-local" id="reg-end-date" name="registrationEnd" class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none datetime-white-icons" required>
                </div>
                
                <div class="form-group">
                  <label for="tournament-start-date" class="block text-sm font-medium text-starlight-muted mb-2">Tournament Start *</label>
                  <input type="datetime-local" id="tournament-start-date" name="tournamentStart" class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none datetime-white-icons" required>
                </div>
                
                <div class="form-group">
                  <label for="tournament-end-date" class="block text-sm font-medium text-starlight-muted mb-2">Tournament End *</label>
                  <input type="datetime-local" id="tournament-end-date" name="tournamentEnd" class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none datetime-white-icons" required>
                </div>
              </div>
            </div>

            <!-- Tournament Settings -->
            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-starlight border-b border-cyber-border pb-2">Tournament Settings</h3>
              
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div class="form-group">
                  <label for="prize-pool" class="block text-sm font-medium text-starlight-muted mb-2">Prize Pool (₹) *</label>
                  <input type="number" id="prize-pool" name="prizePool" min="0" class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none" placeholder="0" required>
                </div>
                
                <div class="form-group">
                  <label for="entry-fee" class="block text-sm font-medium text-starlight-muted mb-2">Entry Fee (₹)</label>
                  <input type="number" id="entry-fee" name="entryFee" min="0" value="0" class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none" placeholder="0">
                </div>
                
                <div class="form-group">
                  <label for="max-teams" class="block text-sm font-medium text-starlight-muted mb-2">Max Teams *</label>
                  <input type="number" id="max-teams" name="maxTeams" min="2" class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none" placeholder="16" required>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div class="form-group">
                  <label for="max-players" class="block text-sm font-medium text-starlight-muted mb-2">Max Players per Team *</label>
                  <input type="number" id="max-players" name="maxPlayersPerTeam" min="1" value="4" class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none" required>
                </div>
                
                <div class="form-group">
                  <label for="tournament-format" class="block text-sm font-medium text-starlight-muted mb-2">Format *</label>
                  <select id="tournament-format" name="format" class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none" required>
                    <option value="">Select Format</option>
                    <option value="single-elimination">Single Elimination</option>
                    <option value="double-elimination">Double Elimination</option>
                    <option value="round-robin">Round Robin</option>
                    <option value="kp">KP Format</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Poster Image -->
            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-starlight border-b border-cyber-border pb-2">Tournament Poster</h3>
              
              <div class="form-group">
                <label for="tournament-poster" class="block text-sm font-medium text-starlight-muted mb-2">Poster Image</label>
                <input type="file" id="tournament-poster" name="posterImage" accept="image/*" class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-cyber-cyan file:text-dark-matter hover:file:bg-cyber-cyan/90 focus:border-cyber-cyan focus:outline-none">
                <p class="text-xs text-starlight-muted mt-1">Upload a poster image for your tournament (optional)</p>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex items-center justify-end space-x-4 pt-6 border-t border-cyber-border">
              <button type="button" onclick="window.tournamentManagement.init()" class="px-6 py-3 bg-starlight-muted/20 text-starlight-muted rounded-lg hover:bg-starlight-muted/30 transition-colors">
                Cancel
              </button>
              <button type="submit" class="px-6 py-3 bg-cyber-cyan text-dark-matter rounded-lg font-semibold hover:bg-cyber-cyan/90 transition-colors">
                <i class="fas fa-plus mr-2"></i>
                Create Tournament
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Bind form submission
    const form = document.getElementById('create-tournament-form');
    if (form) {
      form.addEventListener('submit', this.handleCreateFormSubmit.bind(this));
    }
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
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showInfo(message) {
    this.showNotification(message, 'info');
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;

    // Set type-specific styles
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

    // Add to DOM
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // Auto remove after 4 seconds
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 4000);
  }

  async handleCreateFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    try {
      // Show loading state
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating...';
      submitBtn.disabled = true;

      // Create FormData object with exact backend format
      const formData = new FormData();

      // Get form values and validate
      const title = form.querySelector('[name="title"]').value.trim();
      const game = form.querySelector('[name="game"]').value.trim();
      const description = form.querySelector('[name="description"]').value.trim();
      const registrationStart = form.querySelector('[name="registrationStart"]').value;
      const registrationEnd = form.querySelector('[name="registrationEnd"]').value;
      const tournamentStart = form.querySelector('[name="tournamentStart"]').value;
      const tournamentEnd = form.querySelector('[name="tournamentEnd"]').value;
      const prizePool = form.querySelector('[name="prizePool"]').value;
      const entryFee = form.querySelector('[name="entryFee"]').value || '0';
      const maxTeams = form.querySelector('[name="maxTeams"]').value;
      const maxPlayersPerTeam = form.querySelector('[name="maxPlayersPerTeam"]').value;
      const format = form.querySelector('[name="format"]').value;
      const posterImage = form.querySelector('[name="posterImage"]').files[0];

      // Validate required fields
      if (!title || !game || !description || !registrationStart || !registrationEnd ||
        !tournamentStart || !tournamentEnd || !prizePool || !maxTeams ||
        !maxPlayersPerTeam || !format) {
        throw new Error('Please fill in all required fields');
      }

      // Add fields to FormData (matching backend expectations)
      formData.append('title', title);
      formData.append('game', game);
      formData.append('description', description);
      formData.append('registrationStart', registrationStart);
      formData.append('registrationEnd', registrationEnd);
      formData.append('tournamentStart', tournamentStart);
      formData.append('tournamentEnd', tournamentEnd);
      formData.append('prizePool', prizePool);
      formData.append('entryFee', entryFee);
      formData.append('maxTeams', maxTeams);
      formData.append('maxPlayersPerTeam', maxPlayersPerTeam);
      formData.append('format', format);

      // Add poster image if selected
      if (posterImage && posterImage.size > 0) {
        formData.append('posterImage', posterImage);
      }

      // Debug log
      console.log('Form data being sent:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Make API call
      const response = await window.apiClient.createTournament(formData);

      if (response.success) {
        this.showSuccess('Tournament created successfully!');
        // Redirect back to tournament list
        setTimeout(() => {
          this.init();
        }, 1500);
      } else {
        throw new Error(response.message || 'Failed to create tournament');
      }

    } catch (error) {
      console.error('Error creating tournament:', error);

      // Better error message handling
      let errorMessage = 'Failed to create tournament';
      if (error.data && error.data.detail) {
        if (Array.isArray(error.data.detail)) {
          // Handle validation errors array
          const validationErrors = error.data.detail.map(err =>
            `${err.loc ? err.loc.join('.') : 'Field'}: ${err.msg}`
          ).join(', ');
          errorMessage = `Validation errors: ${validationErrors}`;
        } else {
          errorMessage = error.data.detail;
        }
      } else if (error.message && error.message !== '[object Object]') {
        errorMessage = error.message;
      }

      this.showError(errorMessage);
    } finally {
      // Reset button state
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  destroy() {
    this.tournaments = [];
    this.currentTournament = null;
    this.participants = [];
  }
}

// Export for use throughout the application
window.TournamentManagement = TournamentManagement;