/**
 * Tournament Management Component
 * Handles tournament creation, editing, and participant management
 */

class TournamentManagement {
  constructor() {
    this.tournaments = [];
    this.currentTournament = null;
    this.participants = [];
    this.currentView = 'list'; // list, create, edit, participants
    this.filters = {
      status: 'all',
      search: '',
      sortBy: 'created_date',
      sortOrder: 'desc'
    };
    this.pagination = {
      page: 1,
      limit: 10,
      total: 0
    };
  }

  /**
   * Initialize the tournament management component
   */
  async init() {
    try {
      await this.render();
      await this.loadTournaments();
      this.bindEvents();
      console.log('Tournament Management component initialized');
    } catch (error) {
      console.error('Failed to initialize Tournament Management:', error);
      this.showError('Failed to initialize tournament management');
    }
  }

  /**
   * Render the main tournament management interface
   */
  async render() {
    const contentArea = document.getElementById('content-area');
    
    contentArea.innerHTML = `
      <div class="tournament-management animate-fade-in">
        <!-- Header Section -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h2 class="text-3xl font-bold text-starlight mb-2">Tournament Management</h2>
            <p class="text-starlight-muted">Create and manage your tournaments</p>
          </div>
          <div class="flex items-center space-x-4 mt-4 lg:mt-0">
            <button id="create-tournament-btn" class="btn-primary">
              <i class="fas fa-plus mr-2"></i>
              Create Tournament
            </button>
          </div>
        </div>

        <!-- Filters and Search -->
        <div class="glass rounded-xl p-6 mb-6">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div class="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <!-- Search -->
              <div class="relative">
                <input 
                  type="text" 
                  id="tournament-search" 
                  placeholder="Search tournaments..." 
                  class="input-field pl-10 w-full sm:w-64"
                  value="${this.filters.search}"
                >
                <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-starlight-muted"></i>
              </div>
              
              <!-- Status Filter -->
              <select id="status-filter" class="input-field w-full sm:w-auto">
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="registration_open">Registration Open</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <!-- Sort Options -->
            <div class="flex items-center space-x-2">
              <select id="sort-by" class="input-field">
                <option value="created_date">Created Date</option>
                <option value="tournament_start">Start Date</option>
                <option value="title">Title</option>
                <option value="participants">Participants</option>
              </select>
              <button id="sort-order" class="btn-secondary p-2" title="Toggle sort order">
                <i class="fas fa-sort-amount-down"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div id="tournament-content">
          <!-- Tournament list will be loaded here -->
        </div>

        <!-- Loading State -->
        <div id="loading-state" class="hidden">
          <div class="flex items-center justify-center py-20">
            <div class="loading-spinner mr-3"></div>
            <span class="text-starlight-muted">Loading tournaments...</span>
          </div>
        </div>
      </div>

      <!-- Tournament Creation/Edit Modal -->
      <div id="tournament-modal" class="modal hidden">
        <div class="modal-overlay"></div>
        <div class="modal-content max-w-4xl">
          <div class="modal-header">
            <h3 id="modal-title" class="text-xl font-bold">Create Tournament</h3>
            <button id="close-modal" class="modal-close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <!-- Tournament form will be loaded here -->
          </div>
        </div>
      </div>

      <!-- Participant Management Modal -->
      <div id="participant-modal" class="modal hidden">
        <div class="modal-overlay"></div>
        <div class="modal-content max-w-6xl">
          <div class="modal-header">
            <h3 class="text-xl font-bold">Participant Management</h3>
            <button id="close-participant-modal" class="modal-close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <!-- Participant management content will be loaded here -->
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Load tournaments from API
   */
  async loadTournaments() {
    try {
      this.showLoading(true);
      
      const params = {
        page: this.pagination.page,
        limit: this.pagination.limit,
        status: this.filters.status !== 'all' ? this.filters.status : undefined,
        search: this.filters.search || undefined,
        sort_by: this.filters.sortBy,
        sort_order: this.filters.sortOrder
      };

      const response = await apiClient.getTournaments(params);
      
      if (response.success) {
        this.tournaments = response.data.tournaments || [];
        this.pagination.total = response.data.total || 0;
        this.renderTournamentList();
      } else {
        throw new Error(response.message || 'Failed to load tournaments');
      }
    } catch (error) {
      console.error('Error loading tournaments:', error);
      this.showError('Failed to load tournaments. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Render tournament list
   */
  renderTournamentList() {
    const contentArea = document.getElementById('tournament-content');
    
    if (this.tournaments.length === 0) {
      contentArea.innerHTML = `
        <div class="text-center py-20">
          <i class="fas fa-trophy text-6xl text-cyber-cyan mb-4"></i>
          <h3 class="text-2xl font-bold mb-2">No Tournaments Found</h3>
          <p class="text-starlight-muted mb-6">Create your first tournament to get started</p>
          <button class="btn-primary" onclick="window.tournamentManagement.showCreateModal()">
            <i class="fas fa-plus mr-2"></i>
            Create Tournament
          </button>
        </div>
      `;
      return;
    }

    const tournamentCards = this.tournaments.map(tournament => this.renderTournamentCard(tournament)).join('');
    
    contentArea.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        ${tournamentCards}
      </div>
      
      <!-- Pagination -->
      ${this.renderPagination()}
    `;
  }

  /**
   * Render individual tournament card
   */
  renderTournamentCard(tournament) {
    const statusColors = {
      draft: 'bg-gray-500/20 text-gray-400',
      published: 'bg-blue-500/20 text-blue-400',
      registration_open: 'bg-green-500/20 text-green-400',
      ongoing: 'bg-yellow-500/20 text-yellow-400',
      completed: 'bg-purple-500/20 text-purple-400'
    };

    const statusColor = statusColors[tournament.status] || 'bg-gray-500/20 text-gray-400';
    const participantCount = tournament.participants?.length || 0;
    const maxParticipants = tournament.maxParticipants || 0;

    return `
      <div class="glass rounded-xl p-6 hover:border-cyber-cyan transition-all duration-300 group">
        <!-- Tournament Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-bold text-starlight mb-1 group-hover:text-cyber-cyan transition-colors">
              ${this.escapeHtml(tournament.title)}
            </h3>
            <p class="text-sm text-starlight-muted">${this.escapeHtml(tournament.game)}</p>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-medium ${statusColor}">
            ${tournament.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <!-- Tournament Stats -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-cyber-cyan">${participantCount}</div>
            <div class="text-xs text-starlight-muted">Participants</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-cyber-indigo">₹${tournament.entryFee || 0}</div>
            <div class="text-xs text-starlight-muted">Entry Fee</div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="flex justify-between text-xs text-starlight-muted mb-1">
            <span>Registration Progress</span>
            <span>${participantCount}/${maxParticipants}</span>
          </div>
          <div class="w-full bg-dark-matter rounded-full h-2">
            <div class="bg-cyber-cyan h-2 rounded-full transition-all duration-300" 
                 style="width: ${maxParticipants > 0 ? (participantCount / maxParticipants) * 100 : 0}%"></div>
          </div>
        </div>

        <!-- Tournament Dates -->
        <div class="text-xs text-starlight-muted mb-4">
          <div class="flex items-center mb-1">
            <i class="fas fa-calendar-alt mr-2"></i>
            <span>Starts: ${this.formatDate(tournament.tournamentStart)}</span>
          </div>
          <div class="flex items-center">
            <i class="fas fa-clock mr-2"></i>
            <span>Registration: ${this.formatDate(tournament.registrationEnd)}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center space-x-2">
          <button class="btn-secondary flex-1 text-sm py-2" 
                  onclick="window.tournamentManagement.editTournament('${tournament.id}')">
            <i class="fas fa-edit mr-1"></i>
            Edit
          </button>
          <button class="btn-primary flex-1 text-sm py-2" 
                  onclick="window.tournamentManagement.manageParticipants('${tournament.id}')">
            <i class="fas fa-users mr-1"></i>
            Participants
          </button>
          <button class="btn-secondary p-2" 
                  onclick="window.tournamentManagement.showTournamentMenu('${tournament.id}', event)">
            <i class="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render pagination controls
   */
  renderPagination() {
    const totalPages = Math.ceil(this.pagination.total / this.pagination.limit);
    
    if (totalPages <= 1) return '';

    const currentPage = this.pagination.page;
    const pages = [];
    
    // Generate page numbers
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
      pages.push(i);
    }

    return `
      <div class="flex items-center justify-between">
        <div class="text-sm text-starlight-muted">
          Showing ${((currentPage - 1) * this.pagination.limit) + 1} to 
          ${Math.min(currentPage * this.pagination.limit, this.pagination.total)} of 
          ${this.pagination.total} tournaments
        </div>
        
        <div class="flex items-center space-x-2">
          <button class="btn-secondary p-2 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" 
                  onclick="window.tournamentManagement.changePage(${currentPage - 1})"
                  ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
          </button>
          
          ${pages.map(page => `
            <button class="btn-secondary p-2 px-3 ${page === currentPage ? 'bg-cyber-cyan text-dark-matter' : ''}" 
                    onclick="window.tournamentManagement.changePage(${page})">
              ${page}
            </button>
          `).join('')}
          
          <button class="btn-secondary p-2 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" 
                  onclick="window.tournamentManagement.changePage(${currentPage + 1})"
                  ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Show tournament creation modal
   */
  showCreateModal() {
    this.currentTournament = null;
    this.renderTournamentForm();
    this.showModal('tournament-modal');
    document.getElementById('modal-title').textContent = 'Create Tournament';
  }

  /**
   * Show tournament edit modal
   */
  async editTournament(tournamentId) {
    try {
      this.showLoading(true);
      
      // Find tournament in current list or fetch from API
      this.currentTournament = this.tournaments.find(t => t.id === tournamentId);
      
      if (!this.currentTournament) {
        // Fetch tournament details from API
        const response = await apiClient.get(`/api/user-tournaments/${tournamentId}`);
        if (response.success) {
          this.currentTournament = response.data;
        } else {
          throw new Error('Tournament not found');
        }
      }

      this.renderTournamentForm();
      this.showModal('tournament-modal');
      document.getElementById('modal-title').textContent = 'Edit Tournament';
    } catch (error) {
      console.error('Error loading tournament for edit:', error);
      this.showError('Failed to load tournament details');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Manage tournament participants
   */
  async manageParticipants(tournamentId) {
    try {
      this.showLoading(true);
      
      // Find tournament
      const tournament = this.tournaments.find(t => t.id === tournamentId);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      this.currentTournament = tournament;
      
      // Load participants
      await this.loadParticipants(tournamentId);
      
      this.renderParticipantManagement();
      this.showModal('participant-modal');
    } catch (error) {
      console.error('Error loading participants:', error);
      this.showError('Failed to load participants');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Load tournament participants
   */
  async loadParticipants(tournamentId) {
    try {
      const response = await apiClient.getTournamentParticipants(tournamentId);
      
      if (response.success) {
        this.participants = response.data.participants || [];
      } else {
        throw new Error(response.message || 'Failed to load participants');
      }
    } catch (error) {
      console.error('Error loading participants:', error);
      this.participants = [];
      throw error;
    }
  }

  /**
   * Render participant management interface
   */
  renderParticipantManagement() {
    const modalBody = document.querySelector('#participant-modal .modal-body');
    
    const pendingParticipants = this.participants.filter(p => p.status === 'pending');
    const approvedParticipants = this.participants.filter(p => p.status === 'approved');
    const rejectedParticipants = this.participants.filter(p => p.status === 'rejected');

    modalBody.innerHTML = `
      <div class="participant-management">
        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="glass rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-cyber-cyan">${this.participants.length}</div>
            <div class="text-sm text-starlight-muted">Total</div>
          </div>
          <div class="glass rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-yellow-400">${pendingParticipants.length}</div>
            <div class="text-sm text-starlight-muted">Pending</div>
          </div>
          <div class="glass rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-green-400">${approvedParticipants.length}</div>
            <div class="text-sm text-starlight-muted">Approved</div>
          </div>
          <div class="glass rounded-lg p-4 text-center">
            <div class="text-2xl font-bold text-red-400">${rejectedParticipants.length}</div>
            <div class="text-sm text-starlight-muted">Rejected</div>
          </div>
        </div>

        <!-- Participant Tabs -->
        <div class="mb-6">
          <div class="flex border-b border-cyber-border">
            <button class="participant-tab active" data-tab="pending">
              Pending Approval (${pendingParticipants.length})
            </button>
            <button class="participant-tab" data-tab="approved">
              Approved (${approvedParticipants.length})
            </button>
            <button class="participant-tab" data-tab="rejected">
              Rejected (${rejectedParticipants.length})
            </button>
          </div>
        </div>

        <!-- Participant Lists -->
        <div id="participant-content">
          ${this.renderParticipantTab('pending', pendingParticipants)}
        </div>
      </div>
    `;

    // Bind tab events
    this.bindParticipantTabEvents();
  }

  /**
   * Render participant tab content
   */
  renderParticipantTab(tabType, participants) {
    if (participants.length === 0) {
      return `
        <div class="text-center py-12">
          <i class="fas fa-users text-4xl text-starlight-muted mb-4"></i>
          <p class="text-starlight-muted">No ${tabType} participants</p>
        </div>
      `;
    }

    return `
      <div class="space-y-4">
        ${participants.map(participant => this.renderParticipantCard(participant, tabType)).join('')}
      </div>
    `;
  }

  /**
   * Render individual participant card
   */
  renderParticipantCard(participant, tabType) {
    const statusColors = {
      pending: 'text-yellow-400',
      approved: 'text-green-400',
      rejected: 'text-red-400'
    };

    const teamData = participant.teamData || {};
    const players = teamData.players || [];

    return `
      <div class="glass rounded-lg p-4">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- Team Info -->
            <div class="flex items-center mb-3">
              <h4 class="text-lg font-semibold text-starlight mr-3">
                ${this.escapeHtml(teamData.teamName || 'Unknown Team')}
              </h4>
              <span class="px-2 py-1 rounded text-xs font-medium ${statusColors[participant.status]}">
                ${participant.status.toUpperCase()}
              </span>
            </div>

            <!-- Players List -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              ${players.map(player => `
                <div class="flex items-center space-x-3 p-2 bg-dark-matter/50 rounded">
                  <div class="w-8 h-8 bg-cyber-indigo rounded-full flex items-center justify-center">
                    <span class="text-xs font-bold">${player.name?.charAt(0) || 'P'}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-medium text-starlight truncate">
                      ${this.escapeHtml(player.name || 'Unknown Player')}
                    </div>
                    <div class="text-xs text-starlight-muted truncate">
                      ${this.escapeHtml(player.email || '')}
                    </div>
                    <div class="text-xs text-cyber-cyan">
                      ID: ${this.escapeHtml(player.inGameId || 'N/A')}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Registration Details -->
            <div class="text-xs text-starlight-muted">
              <div class="flex items-center mb-1">
                <i class="fas fa-calendar mr-2"></i>
                Registered: ${this.formatDate(participant.registeredAt)}
              </div>
              ${participant.paymentStatus ? `
                <div class="flex items-center">
                  <i class="fas fa-credit-card mr-2"></i>
                  Payment: <span class="ml-1 ${participant.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}">
                    ${participant.paymentStatus.toUpperCase()}
                  </span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col space-y-2 ml-4">
            ${tabType === 'pending' ? `
              <button class="btn-success text-sm px-3 py-1" 
                      onclick="window.tournamentManagement.updateParticipantStatus('${participant.id}', 'approved')">
                <i class="fas fa-check mr-1"></i>
                Approve
              </button>
              <button class="btn-danger text-sm px-3 py-1" 
                      onclick="window.tournamentManagement.updateParticipantStatus('${participant.id}', 'rejected')">
                <i class="fas fa-times mr-1"></i>
                Reject
              </button>
            ` : tabType === 'approved' ? `
              <button class="btn-danger text-sm px-3 py-1" 
                      onclick="window.tournamentManagement.updateParticipantStatus('${participant.id}', 'rejected')">
                <i class="fas fa-ban mr-1"></i>
                Reject
              </button>
            ` : `
              <button class="btn-success text-sm px-3 py-1" 
                      onclick="window.tournamentManagement.updateParticipantStatus('${participant.id}', 'approved')">
                <i class="fas fa-check mr-1"></i>
                Approve
              </button>
            `}
            
            <button class="btn-secondary text-sm px-3 py-1" 
                    onclick="window.tournamentManagement.contactParticipant('${participant.id}')">
              <i class="fas fa-envelope mr-1"></i>
              Contact
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Update participant status
   */
  async updateParticipantStatus(participantId, status) {
    try {
      const response = await apiClient.updateParticipantStatus(
        this.currentTournament.id, 
        participantId, 
        status
      );

      if (response.success) {
        // Update local participant data
        const participant = this.participants.find(p => p.id === participantId);
        if (participant) {
          participant.status = status;
        }

        // Re-render participant management
        this.renderParticipantManagement();
        
        // Show success message
        this.showSuccess(`Participant ${status} successfully`);
      } else {
        throw new Error(response.message || `Failed to ${status} participant`);
      }
    } catch (error) {
      console.error(`Error updating participant status:`, error);
      this.showError(`Failed to ${status} participant. Please try again.`);
    }
  }

  /**
   * Contact participant (placeholder for future implementation)
   */
  contactParticipant(participantId) {
    // This would open a messaging interface
    this.showInfo('Messaging feature coming soon!');
  }

  /**
   * Bind participant tab events
   */
  bindParticipantTabEvents() {
    document.querySelectorAll('.participant-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabType = e.target.dataset.tab;
        
        // Update active tab
        document.querySelectorAll('.participant-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        // Filter and render participants
        let participants;
        switch (tabType) {
          case 'pending':
            participants = this.participants.filter(p => p.status === 'pending');
            break;
          case 'approved':
            participants = this.participants.filter(p => p.status === 'approved');
            break;
          case 'rejected':
            participants = this.participants.filter(p => p.status === 'rejected');
            break;
          default:
            participants = this.participants;
        }
        
        document.getElementById('participant-content').innerHTML = 
          this.renderParticipantTab(tabType, participants);
      });
    });
  }

  /**
   * Change page
   */
  async changePage(page) {
    if (page < 1 || page > Math.ceil(this.pagination.total / this.pagination.limit)) {
      return;
    }
    
    this.pagination.page = page;
    await this.loadTournaments();
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Search functionality
    const searchInput = document.getElementById('tournament-search');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.filters.search = e.target.value;
          this.pagination.page = 1;
          this.loadTournaments();
        }, 500);
      });
    }

    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
      statusFilter.value = this.filters.status;
      statusFilter.addEventListener('change', (e) => {
        this.filters.status = e.target.value;
        this.pagination.page = 1;
        this.loadTournaments();
      });
    }

    // Sort options
    const sortBy = document.getElementById('sort-by');
    if (sortBy) {
      sortBy.value = this.filters.sortBy;
      sortBy.addEventListener('change', (e) => {
        this.filters.sortBy = e.target.value;
        this.pagination.page = 1;
        this.loadTournaments();
      });
    }

    const sortOrder = document.getElementById('sort-order');
    if (sortOrder) {
      sortOrder.addEventListener('click', () => {
        this.filters.sortOrder = this.filters.sortOrder === 'desc' ? 'asc' : 'desc';
        const icon = sortOrder.querySelector('i');
        icon.className = this.filters.sortOrder === 'desc' ? 
          'fas fa-sort-amount-down' : 'fas fa-sort-amount-up';
        this.pagination.page = 1;
        this.loadTournaments();
      });
    }

    // Create tournament button
    const createBtn = document.getElementById('create-tournament-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => this.showCreateModal());
    }

    // Modal close buttons
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
      closeModal.addEventListener('click', () => this.hideModal('tournament-modal'));
    }

    const closeParticipantModal = document.getElementById('close-participant-modal');
    if (closeParticipantModal) {
      closeParticipantModal.addEventListener('click', () => this.hideModal('participant-modal'));
    }

    // Modal overlay clicks
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) {
          this.hideModal(modal.id);
        }
      });
    });
  }

  /**
   * Render tournament creation/edit form
   */
  renderTournamentForm() {
    const modalBody = document.querySelector('#tournament-modal .modal-body');
    const isEdit = !!this.currentTournament;
    const tournament = this.currentTournament || {};

    modalBody.innerHTML = `
      <form id="tournament-form" class="space-y-6">
        <!-- Basic Information -->
        <div class="form-section">
          <h4 class="text-lg font-semibold text-starlight mb-4">Basic Information</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Tournament Title *</label>
              <input type="text" name="title" class="input-field" 
                     value="${this.escapeHtml(tournament.title || '')}" 
                     placeholder="Enter tournament title" required>
            </div>
            
            <div>
              <label class="form-label">Game *</label>
              <select name="game" class="input-field" required>
                <option value="">Select Game</option>
                <option value="BGMI" ${tournament.game === 'BGMI' ? 'selected' : ''}>BGMI</option>
                <option value="Free Fire" ${tournament.game === 'Free Fire' ? 'selected' : ''}>Free Fire</option>
                <option value="Call of Duty Mobile" ${tournament.game === 'Call of Duty Mobile' ? 'selected' : ''}>Call of Duty Mobile</option>
                <option value="Valorant" ${tournament.game === 'Valorant' ? 'selected' : ''}>Valorant</option>
                <option value="CS:GO" ${tournament.game === 'CS:GO' ? 'selected' : ''}>CS:GO</option>
                <option value="Other" ${tournament.game === 'Other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label class="form-label">Description</label>
            <textarea name="description" class="input-field" rows="3" 
                      placeholder="Tournament description...">${this.escapeHtml(tournament.description || '')}</textarea>
          </div>
        </div>

        <!-- Tournament Format -->
        <div class="form-section">
          <h4 class="text-lg font-semibold text-starlight mb-4">Format & Rules</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="form-label">Format *</label>
              <select name="format" class="input-field" required>
                <option value="single_elimination" ${tournament.format === 'single_elimination' ? 'selected' : ''}>Single Elimination</option>
                <option value="double_elimination" ${tournament.format === 'double_elimination' ? 'selected' : ''}>Double Elimination</option>
                <option value="round_robin" ${tournament.format === 'round_robin' ? 'selected' : ''}>Round Robin</option>
                <option value="swiss" ${tournament.format === 'swiss' ? 'selected' : ''}>Swiss System</option>
              </select>
            </div>
            
            <div>
              <label class="form-label">Mode *</label>
              <select name="mode" class="input-field" required>
                <option value="solo" ${tournament.mode === 'solo' ? 'selected' : ''}>Solo</option>
                <option value="duo" ${tournament.mode === 'duo' ? 'selected' : ''}>Duo</option>
                <option value="squad" ${tournament.mode === 'squad' ? 'selected' : ''}>Squad</option>
              </select>
            </div>
            
            <div>
              <label class="form-label">Max Participants *</label>
              <input type="number" name="maxParticipants" class="input-field" 
                     value="${tournament.maxParticipants || ''}" 
                     min="4" max="1000" placeholder="e.g., 64" required>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Platform *</label>
              <input type="text" name="platform" class="input-field" 
                     value="${this.escapeHtml(tournament.platform || '')}" 
                     placeholder="e.g., Mobile, PC, Console" required>
            </div>
            
            <div>
              <label class="form-label">Region *</label>
              <input type="text" name="region" class="input-field" 
                     value="${this.escapeHtml(tournament.region || '')}" 
                     placeholder="e.g., Asia, India, Global" required>
            </div>
          </div>

          <div>
            <label class="form-label">Tournament Rules</label>
            <textarea name="rules" class="input-field" rows="4" 
                      placeholder="Enter tournament rules and regulations...">${this.escapeHtml(tournament.rules || '')}</textarea>
          </div>
        </div>

        <!-- Financial Settings -->
        <div class="form-section">
          <h4 class="text-lg font-semibold text-starlight mb-4">Financial Settings</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="form-label">Entry Fee (₹) *</label>
              <input type="number" name="entryFee" class="input-field" 
                     value="${tournament.entryFee || ''}" 
                     min="0" step="0.01" placeholder="0" required>
            </div>
            
            <div>
              <label class="form-label">Prize Pool (₹) *</label>
              <input type="number" name="prizePool" class="input-field" 
                     value="${tournament.prizePool || ''}" 
                     min="0" step="0.01" placeholder="0" required>
            </div>
            
            <div>
              <label class="form-label">Host Commission (%)</label>
              <input type="number" name="hostCommission" class="input-field" 
                     value="${tournament.hostCommission || 0}" 
                     min="0" max="50" step="0.1" placeholder="0">
            </div>
          </div>

          <div class="bg-dark-matter/50 rounded-lg p-4 mt-4">
            <div class="flex items-center text-sm text-starlight-muted">
              <i class="fas fa-info-circle mr-2"></i>
              <span>Prize pool will be automatically calculated based on entry fees and participants if left empty.</span>
            </div>
          </div>
        </div>

        <!-- Schedule -->
        <div class="form-section">
          <h4 class="text-lg font-semibold text-starlight mb-4">Schedule</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Registration Start *</label>
              <input type="datetime-local" name="registrationStart" class="input-field" 
                     value="${this.formatDateForInput(tournament.registrationStart)}" required>
            </div>
            
            <div>
              <label class="form-label">Registration End *</label>
              <input type="datetime-local" name="registrationEnd" class="input-field" 
                     value="${this.formatDateForInput(tournament.registrationEnd)}" required>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Tournament Start *</label>
              <input type="datetime-local" name="tournamentStart" class="input-field" 
                     value="${this.formatDateForInput(tournament.tournamentStart)}" required>
            </div>
            
            <div>
              <label class="form-label">Tournament End *</label>
              <input type="datetime-local" name="tournamentEnd" class="input-field" 
                     value="${this.formatDateForInput(tournament.tournamentEnd)}" required>
            </div>
          </div>
        </div>

        <!-- Additional Settings -->
        <div class="form-section">
          <h4 class="text-lg font-semibold text-starlight mb-4">Additional Settings</h4>
          
          <div class="space-y-4">
            <div class="flex items-center">
              <input type="checkbox" name="autoApproval" id="autoApproval" class="checkbox" 
                     ${tournament.autoApproval ? 'checked' : ''}>
              <label for="autoApproval" class="ml-2 text-sm text-starlight">
                Auto-approve participant registrations
              </label>
            </div>
            
            <div class="flex items-center">
              <input type="checkbox" name="isPrivate" id="isPrivate" class="checkbox" 
                     ${tournament.isPrivate ? 'checked' : ''}>
              <label for="isPrivate" class="ml-2 text-sm text-starlight">
                Private tournament (invite only)
              </label>
            </div>
          </div>

          <div>
            <label class="form-label">Tags (comma separated)</label>
            <input type="text" name="tags" class="input-field" 
                   value="${tournament.tags ? tournament.tags.join(', ') : ''}" 
                   placeholder="e.g., competitive, mobile, esports">
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end space-x-4 pt-6 border-t border-cyber-border">
          <button type="button" class="btn-secondary" onclick="window.tournamentManagement.hideModal('tournament-modal')">
            Cancel
          </button>
          
          ${isEdit ? `
            <button type="button" class="btn-secondary" onclick="window.tournamentManagement.saveDraft()">
              Save Draft
            </button>
            <button type="submit" class="btn-primary">
              Update Tournament
            </button>
          ` : `
            <button type="button" class="btn-secondary" onclick="window.tournamentManagement.saveDraft()">
              Save as Draft
            </button>
            <button type="submit" class="btn-primary">
              Create Tournament
            </button>
          `}
        </div>
      </form>
    `;

    // Bind form events
    this.bindFormEvents();
  }

  /**
   * Bind tournament form events
   */
  bindFormEvents() {
    const form = document.getElementById('tournament-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitTournamentForm();
    });

    // Auto-calculate prize pool
    const entryFeeInput = form.querySelector('[name="entryFee"]');
    const maxParticipantsInput = form.querySelector('[name="maxParticipants"]');
    const prizePoolInput = form.querySelector('[name="prizePool"]');

    const calculatePrizePool = () => {
      const entryFee = parseFloat(entryFeeInput.value) || 0;
      const maxParticipants = parseInt(maxParticipantsInput.value) || 0;
      
      if (entryFee > 0 && maxParticipants > 0 && !prizePoolInput.value) {
        const totalCollection = entryFee * maxParticipants;
        const hostCommission = parseFloat(form.querySelector('[name="hostCommission"]').value) || 0;
        const prizePool = totalCollection * (1 - hostCommission / 100);
        prizePoolInput.value = prizePool.toFixed(2);
      }
    };

    entryFeeInput?.addEventListener('input', calculatePrizePool);
    maxParticipantsInput?.addEventListener('input', calculatePrizePool);
    form.querySelector('[name="hostCommission"]')?.addEventListener('input', calculatePrizePool);
  }

  /**
   * Submit tournament form
   */
  async submitTournamentForm() {
    try {
      const form = document.getElementById('tournament-form');
      const formData = new FormData(form);
      
      // Convert form data to object
      const tournamentData = {};
      for (let [key, value] of formData.entries()) {
        if (key === 'tags') {
          tournamentData[key] = value.split(',').map(tag => tag.trim()).filter(tag => tag);
        } else if (key === 'autoApproval' || key === 'isPrivate') {
          tournamentData[key] = form.querySelector(`[name="${key}"]`).checked;
        } else if (['entryFee', 'prizePool', 'hostCommission', 'maxParticipants'].includes(key)) {
          tournamentData[key] = parseFloat(value) || 0;
        } else {
          tournamentData[key] = value;
        }
      }

      // Validate dates
      if (!this.validateTournamentDates(tournamentData)) {
        this.showError('Please check tournament dates. Registration must end before tournament starts.');
        return;
      }

      this.showLoading(true);

      let response;
      if (this.currentTournament) {
        // Update existing tournament
        response = await apiClient.updateTournament(this.currentTournament.id, tournamentData);
      } else {
        // Create new tournament
        response = await apiClient.createTournament(tournamentData);
      }

      if (response.success) {
        this.hideModal('tournament-modal');
        this.showSuccess(`Tournament ${this.currentTournament ? 'updated' : 'created'} successfully!`);
        await this.loadTournaments(); // Refresh the list
      } else {
        throw new Error(response.message || 'Failed to save tournament');
      }
    } catch (error) {
      console.error('Error submitting tournament form:', error);
      this.showError('Failed to save tournament. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Save tournament as draft
   */
  async saveDraft() {
    try {
      const form = document.getElementById('tournament-form');
      const formData = new FormData(form);
      
      // Convert form data to object
      const tournamentData = { status: 'draft' };
      for (let [key, value] of formData.entries()) {
        if (key === 'tags') {
          tournamentData[key] = value.split(',').map(tag => tag.trim()).filter(tag => tag);
        } else if (key === 'autoApproval' || key === 'isPrivate') {
          tournamentData[key] = form.querySelector(`[name="${key}"]`).checked;
        } else if (['entryFee', 'prizePool', 'hostCommission', 'maxParticipants'].includes(key)) {
          tournamentData[key] = parseFloat(value) || 0;
        } else {
          tournamentData[key] = value;
        }
      }

      this.showLoading(true);

      let response;
      if (this.currentTournament) {
        response = await apiClient.updateTournament(this.currentTournament.id, tournamentData);
      } else {
        response = await apiClient.createTournament(tournamentData);
      }

      if (response.success) {
        this.hideModal('tournament-modal');
        this.showSuccess('Tournament saved as draft!');
        await this.loadTournaments();
      } else {
        throw new Error(response.message || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      this.showError('Failed to save draft. Please try again.');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Validate tournament dates
   */
  validateTournamentDates(data) {
    try {
      const regStart = new Date(data.registrationStart);
      const regEnd = new Date(data.registrationEnd);
      const tournStart = new Date(data.tournamentStart);
      const tournEnd = new Date(data.tournamentEnd);
      const now = new Date();

      return regStart < regEnd && regEnd <= tournStart && tournStart < tournEnd && regStart >= now;
    } catch (error) {
      return false;
    }
  }

  /**
   * Format date for datetime-local input
   */
  formatDateForInput(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    } catch (error) {
      return '';
    }
  }

  /**
   * Show tournament context menu
   */
  showTournamentMenu(tournamentId, event) {
    event.stopPropagation();
    
    // Create context menu
    const menu = document.createElement('div');
    menu.className = 'tournament-context-menu glass rounded-lg p-2 absolute z-50';
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
    
    menu.innerHTML = `
      <button class="context-menu-item" onclick="window.tournamentManagement.duplicateTournament('${tournamentId}')">
        <i class="fas fa-copy mr-2"></i>
        Duplicate
      </button>
      <button class="context-menu-item" onclick="window.tournamentManagement.generateInviteLink('${tournamentId}')">
        <i class="fas fa-link mr-2"></i>
        Generate Invite Link
      </button>
      <button class="context-menu-item" onclick="window.tournamentManagement.exportParticipants('${tournamentId}')">
        <i class="fas fa-download mr-2"></i>
        Export Participants
      </button>
      <hr class="border-cyber-border my-1">
      <button class="context-menu-item text-red-400" onclick="window.tournamentManagement.deleteTournament('${tournamentId}')">
        <i class="fas fa-trash mr-2"></i>
        Delete
      </button>
    `;
    
    document.body.appendChild(menu);
    
    // Remove menu when clicking elsewhere
    const removeMenu = (e) => {
      if (!menu.contains(e.target)) {
        document.body.removeChild(menu);
        document.removeEventListener('click', removeMenu);
      }
    };
    
    setTimeout(() => document.addEventListener('click', removeMenu), 100);
  }

  /**
   * Duplicate tournament
   */
  async duplicateTournament(tournamentId) {
    try {
      const tournament = this.tournaments.find(t => t.id === tournamentId);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Create a copy with modified title and reset dates
      const duplicateData = {
        ...tournament,
        title: `${tournament.title} (Copy)`,
        status: 'draft',
        registrationStart: null,
        registrationEnd: null,
        tournamentStart: null,
        tournamentEnd: null
      };

      delete duplicateData.id;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;

      this.currentTournament = duplicateData;
      this.renderTournamentForm();
      this.showModal('tournament-modal');
      document.getElementById('modal-title').textContent = 'Duplicate Tournament';
    } catch (error) {
      console.error('Error duplicating tournament:', error);
      this.showError('Failed to duplicate tournament');
    }
  }

  /**
   * Generate invite link
   */
  async generateInviteLink(tournamentId) {
    try {
      const response = await apiClient.generateInviteLink(tournamentId);
      
      if (response.success) {
        // Copy to clipboard
        await navigator.clipboard.writeText(response.data.inviteLink);
        this.showSuccess('Invite link copied to clipboard!');
      } else {
        throw new Error(response.message || 'Failed to generate invite link');
      }
    } catch (error) {
      console.error('Error generating invite link:', error);
      this.showError('Failed to generate invite link');
    }
  }

  /**
   * Export participants
   */
  async exportParticipants(tournamentId) {
    try {
      await this.loadParticipants(tournamentId);
      
      if (this.participants.length === 0) {
        this.showInfo('No participants to export');
        return;
      }

      // Create CSV data
      const csvData = this.participants.map(participant => {
        const teamData = participant.teamData || {};
        const players = teamData.players || [];
        
        return {
          'Team Name': teamData.teamName || 'Unknown',
          'Status': participant.status,
          'Registration Date': this.formatDate(participant.registeredAt),
          'Payment Status': participant.paymentStatus || 'N/A',
          'Players': players.map(p => `${p.name} (${p.email})`).join('; ')
        };
      });

      // Convert to CSV and download
      this.downloadCSV(csvData, `tournament-${tournamentId}-participants.csv`);
      this.showSuccess('Participants exported successfully!');
    } catch (error) {
      console.error('Error exporting participants:', error);
      this.showError('Failed to export participants');
    }
  }

  /**
   * Delete tournament
   */
  async deleteTournament(tournamentId) {
    if (!confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiClient.deleteTournament(tournamentId);
      
      if (response.success) {
        this.showSuccess('Tournament deleted successfully');
        await this.loadTournaments();
      } else {
        throw new Error(response.message || 'Failed to delete tournament');
      }
    } catch (error) {
      console.error('Error deleting tournament:', error);
      this.showError('Failed to delete tournament');
    }
  }

  /**
   * Download CSV file
   */
  downloadCSV(data, filename) {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // === UTILITY METHODS ===

  /**
   * Show modal
   */
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Hide modal
   */
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  }

  /**
   * Show loading state
   */
  showLoading(show) {
    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
      loadingState.classList.toggle('hidden', !show);
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return 'Not set';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    this.showToast(message, 'success');
  }

  /**
   * Show error message
   */
  showError(message) {
    this.showToast(message, 'error');
  }

  /**
   * Show info message
   */
  showInfo(message) {
    this.showToast(message, 'info');
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="flex items-center">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
        <span>${message}</span>
      </div>
    `;

    // Add to page
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove toast after 5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 5000);
  }

  /**
   * Destroy component
   */
  destroy() {
    // Clean up any event listeners or intervals
    console.log('Tournament Management component destroyed');
  }
}

// Export for global use
window.TournamentManagement = TournamentManagement;