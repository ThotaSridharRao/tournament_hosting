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
      sortBy: 'createdAt', // Corrected to match backend field
      sortOrder: 'desc'
    };
    this.pagination = { page: 1, limit: 10, total: 0 };
  }

  async init() {
    try {
      await this.render();
      await this.loadTournaments();
      this.bindEvents();
    } catch (error) {
      console.error('Failed to initialize Tournament Management:', error);
    }
  }

  async render() {
    // The render method remains largely the same
    // ...
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
    } finally {
      this.showLoading(false);
    }
  }
  
  renderTournamentList() {
    // This method remains largely the same
    // ...
  }

  renderTournamentCard(tournament) {
    // ... (statusColors, etc.)
    const participantCount = tournament.participant_count || 0;
    
    // CORRECTED: Use `_id` instead of `id`
    return `
      <div class="glass rounded-xl p-6 ...">
        ...
        <div class="flex items-center space-x-2">
          <button class="btn-secondary flex-1 ..." 
                  onclick="window.tournamentManagement.editTournament('${tournament._id}')">
            <i class="fas fa-edit mr-1"></i> Edit
          </button>
          <button class="btn-primary flex-1 ..." 
                  onclick="window.tournamentManagement.manageParticipants('${tournament._id}')">
            <i class="fas fa-users mr-1"></i> Participants
          </button>
          <button class="btn-secondary p-2" 
                  onclick="window.tournamentManagement.showTournamentMenu('${tournament._id}', event)">
            <i class="fas fa-ellipsis-v"></i>
          </button>
        </div>
      </div>
    `;
  }
  
  // ... (renderPagination, showCreateModal, etc. remain the same)

  async editTournament(tournamentId) {
    this.currentTournament = this.tournaments.find(t => t._id === tournamentId);
    this.renderTournamentForm();
    this.showModal('tournament-modal');
    document.getElementById('modal-title').textContent = 'Edit Tournament';
  }

  async manageParticipants(tournamentId) {
    const tournament = this.tournaments.find(t => t._id === tournamentId);
    if (!tournament) return;
    this.currentTournament = tournament;
    await this.loadParticipants(tournamentId);
    this.renderParticipantManagement();
    this.showModal('participant-modal');
  }

  async loadParticipants(tournamentId) {
    const response = await apiClient.getTournamentParticipants(tournamentId);
    if (response.success) {
      this.participants = response.data.participants || [];
    } else {
      this.participants = [];
    }
  }

  renderParticipantManagement() {
    // This method remains largely the same
    // ...
  }

  renderParticipantCard(participant) {
    // CORRECTED: The participant object from the backend is flat
    const players = participant.players || [];
    return `
      <div class="glass rounded-lg p-4">
        <div class="flex ...">
          <div>
            <h4 class="text-lg font-semibold ...">${this.escapeHtml(participant.teamName || 'Unknown Team')}</h4>
            ...
            <div class="grid ...">
              ${players.map(player => `...`).join('')}
            </div>
            ...
          </div>
          <div class="flex flex-col ...">
              <button ... onclick="window.tournamentManagement.updateParticipantStatus('${participant._id}', 'approved')">Approve</button>
              <button ... onclick="window.tournamentManagement.updateParticipantStatus('${participant._id}', 'rejected')">Reject</button>
          </div>
        </div>
      </div>
    `;
  }

  async updateParticipantStatus(participantId, status) {
    const response = await apiClient.updateParticipantStatus(
      this.currentTournament._id, 
      participantId, 
      status
    );
    if (response.success) {
      const participant = this.participants.find(p => p._id === participantId);
      if (participant) participant.status = status;
      this.renderParticipantManagement();
      this.showSuccess(`Participant ${status} successfully`);
    } else {
      this.showError(`Failed to ${status} participant.`);
    }
  }
  
  showTournamentMenu(tournamentId, event) {
    // ...
    // REMOVED "Duplicate" button from innerHTML as it's not implemented
    menu.innerHTML = `
      <button ... onclick="window.tournamentManagement.generateInviteLink('${tournamentId}')">Generate Invite Link</button>
      <button ... onclick="window.tournamentManagement.exportParticipants('${tournamentId}')">Export Participants</button>
      <hr ...>
      <button ... onclick="window.tournamentManagement.deleteTournament('${tournamentId}')">Delete</button>
    `;
    // ...
  }

  generateInviteLink(tournamentId) {
    // CORRECTED: Generate a public link directly, no API call needed.
    const tournament = this.tournaments.find(t => t._id === tournamentId);
    if (tournament && tournament.slug) {
        const inviteLink = `${window.location.origin}/tournament-details.html?slug=${tournament.slug}`;
        navigator.clipboard.writeText(inviteLink).then(() => {
            this.showSuccess('Invite link copied to clipboard!');
        });
    } else {
        this.showError('Could not generate invite link.');
    }
  }

  async exportParticipants(tournamentId) {
    // CORRECTED: Use the backend endpoint for CSV export
    try {
        this.showInfo('Generating participant list...');
        const tournament = this.tournaments.find(t => t._id === tournamentId);
        const blob = await apiClient.exportParticipantsCSV(tournamentId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tournament.slug || 'tournament'}_participants.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting participants:', error);
        this.showError('Failed to export participants.');
    }
  }

  async deleteTournament(tournamentId) {
    // CORRECTED: Use _id
    if (!confirm('Are you sure?')) return;
    const response = await apiClient.deleteTournament(tournamentId);
    if (response.success) {
      this.showSuccess('Tournament deleted!');
      await this.loadTournaments();
    } else {
      this.showError(response.message || 'Failed to delete tournament.');
    }
  }
  
  // All other utility methods (showModal, hideModal, etc.) remain the same
}

window.TournamentManagement = TournamentManagement;