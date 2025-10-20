/**
 * Tournament Participants View Component
 * Provides a dedicated page for hosts to view, manage, and export participants for a specific tournament.
 */
class TournamentParticipantsView {
  constructor(tournamentManagementInstance) {
    this.tmInstance = tournamentManagementInstance; // Reference to the parent component
    this.tournament = null;
    this.participants = [];
    this.pendingRemoval = null;
  }

  /**
   * Initialize the participants view by loading data and rendering.
   * @param {string} tournamentId The ID of the tournament to manage.
   */
  async init(tournamentId) {
    this.tournamentId = tournamentId;
    try {
      this.renderLoading();
      await this.loadTournamentData();
      await this.loadParticipants();
      this.render();
      this.bindEvents();
    } catch (error) {
      console.error('Failed to initialize participants view:', error);
      this.renderError(error.message);
    }
  }

  /**
   * Load the specific tournament's details.
   */
  async loadTournamentData() {
    // Note: Since API client doesn't have a specific getTournamentById, 
    // we use getTournaments and filter, or assume one exists for a robust component.
    // Assuming a temporary endpoint for fetching single tournament details for clean page title.
    try {
        const response = await window.apiClient.get(`/api/host/tournaments/${this.tournamentId}`);
        if (response.success && response.data) {
            this.tournament = response.data;
        } else {
            // Fallback: Use parent component's data if available
            this.tournament = this.tmInstance.tournaments.find(t => t._id === this.tournamentId) || null;
            if (!this.tournament) {
              throw new Error("Tournament not found.");
            }
        }
    } catch (error) {
        console.warn('Could not fetch specific tournament data, falling back to cached info.');
        this.tournament = this.tmInstance.tournaments.find(t => t._id === this.tournamentId) || null;
        if (!this.tournament) {
          throw new Error("Tournament not found or unauthorized access.");
        }
    }
  }

  /**
   * Load participant history from API.
   */
  async loadParticipants() {
    try {
      const response = await window.apiClient.getTournamentParticipants(this.tournamentId);
      if (response.success && response.data) {
        this.participants = response.data.participants || [];
      } else {
        throw new Error(response.message || 'Failed to load participants list');
      }
    } catch (error) {
      console.error('Failed to load participants:', error);
      window.tournamentManagement.showError('Failed to load participants list: ' + error.message);
      this.participants = [];
    }
  }

  /**
   * Render the participants management interface.
   */
  render() {
    if (!this.tournament) {
      this.renderError('Missing tournament data.');
      return;
    }
    const contentArea = document.getElementById('content-area');
    const participantCount = this.participants.length;

    contentArea.innerHTML = `
      <div class="animate-fade-in space-y-6">
        <!-- Back Button -->
        <div class="mb-4">
          <button id="back-to-tournaments-btn" title="Back to Tournaments" class="flex items-center justify-center w-10 h-10 bg-dark-matter/50 hover:bg-cyber-cyan/20 border border-cyber-border hover:border-cyber-cyan rounded-lg transition-all duration-200 group">
            <i class="fas fa-arrow-left text-starlight-muted group-hover:text-cyber-cyan transition-colors"></i>
          </button>
        </div>

        <!-- Header Section -->
        <div class="flex items-center justify-between mb-8 border-b border-cyber-border pb-4">
          <div>
            <h2 class="text-3xl font-bold text-starlight mb-2">Participants: ${this.tournament.title}</h2>
            <p class="text-starlight-muted">Total Teams: ${participantCount}/${this.tournament.maxTeams}</p>
          </div>
          <div>
            <button id="export-pdf-btn" class="btn-secondary flex items-center space-x-2">
                <i class="fas fa-file-pdf"></i>
                <span>Download PDF</span>
            </button>
          </div>
        </div>

        <div class="table-container">
          <div id="participants-table-wrapper" class="overflow-x-auto">
            ${this.renderParticipantsTable(this.participants)}
          </div>
        </div>
      </div>

      ${this.renderConfirmationModal()}
    `;
  }

  renderParticipantsTable(participants) {
    if (participants.length === 0) {
      return `
        <div class="text-center py-12">
          <i class="fas fa-users-slash text-6xl text-starlight-muted mb-4"></i>
          <h3 class="text-xl font-semibold text-starlight">No Participants Registered Yet</h3>
        </div>
      `;
    }

    return `
      <table class="table">
        <thead>
          <tr class="table-header">
            <th class="table-header-cell">#</th>
            <th class="table-header-cell">Team Name</th>
            <th class="table-header-cell">Captain Email</th>
            <th class="table-header-cell">Players</th>
            <th class="table-header-cell">Status</th>
            <th class="table-header-cell">Registration Date</th>
            <th class="table-header-cell text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${participants.map((p, index) => this.renderParticipantRow(p, index + 1)).join('')}
        </tbody>
      </table>
    `;
  }

  renderParticipantRow(participant, index) {
    const statusClass = participant.status === 'approved' ? 'badge-success' : 
                        (participant.status === 'pending' ? 'badge-warning' : 'badge-danger');
    const teamId = participant._id || participant.id;

    return `
      <tr class="table-row hover:bg-dark-matter/20" data-team-id="${teamId}">
        <td class="table-cell match-number">${index}</td>
        <td class="table-cell font-semibold text-cyber-cyan">${participant.teamName || 'N/A'}</td>
        <td class="table-cell text-starlight-muted">${participant.captainEmail || 'N/A'}</td>
        <td class="table-cell">${participant.players?.length || 0} / ${this.tournament.maxPlayersPerTeam}</td>
        <td class="table-cell">
          <span class="badge ${statusClass}">
            ${participant.status?.toUpperCase() || 'UNKNOWN'}
          </span>
        </td>
        <td class="table-cell">${this.formatDate(participant.registrationDate)}</td>
        <td class="table-cell text-right">
          <button onclick="window.tournamentParticipantsView.showConfirmationModal('${teamId}')" 
            class="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
            <i class="fas fa-trash-alt"></i> Remove
          </button>
        </td>
      </tr>
    `;
  }

  renderConfirmationModal() {
    return `
      <div id="participant-removal-modal" class="modal-overlay hidden">
        <div class="modal-content max-w-lg">
          <div class="modal-header">
            <h3 class="modal-title text-red-400"><i class="fas fa-exclamation-triangle mr-2"></i> Confirm Team Removal</h3>
            <button id="close-removal-modal" class="modal-close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body space-y-4">
            <p class="text-starlight">Are you sure you want to remove team <strong id="team-name-to-remove" class="text-cyber-cyan"></strong> from this tournament?</p>
            <p class="text-red-400 text-sm italic">This action will permanently cancel their registration and cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button id="cancel-removal-btn" class="btn-secondary">Cancel</button>
            <button id="confirm-removal-btn" class="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
              <i class="fas fa-trash-alt mr-2"></i>
              Remove Team
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Back to Tournaments button
    document.getElementById('back-to-tournaments-btn')?.addEventListener('click', () => {
      this.tmInstance.init(); // Re-initialize the parent component to show list
    });

    // Export PDF button
    document.getElementById('export-pdf-btn')?.addEventListener('click', () => {
      this.downloadPDF();
    });

    // Modal Events
    document.getElementById('close-removal-modal')?.addEventListener('click', () => this.hideConfirmationModal());
    document.getElementById('cancel-removal-btn')?.addEventListener('click', () => this.hideConfirmationModal());
    document.getElementById('confirm-removal-btn')?.addEventListener('click', () => this.confirmTeamRemoval());
  }
  
  showConfirmationModal(teamId) {
    const team = this.participants.find(p => (p._id || p.id) === teamId);
    if (!team) return;

    this.pendingRemoval = teamId;
    document.getElementById('team-name-to-remove').textContent = team.teamName || 'Unknown Team';
    document.getElementById('participant-removal-modal').classList.remove('hidden');
  }

  hideConfirmationModal() {
    this.pendingRemoval = null;
    document.getElementById('participant-removal-modal').classList.add('hidden');
    
    // Reset button state
    const confirmBtn = document.getElementById('confirm-removal-btn');
    confirmBtn.innerHTML = '<i class="fas fa-trash-alt mr-2"></i> Remove Team';
    confirmBtn.disabled = false;
  }
  
  async confirmTeamRemoval() {
    if (!this.pendingRemoval) return;
    const teamId = this.pendingRemoval;
    const teamName = document.getElementById('team-name-to-remove').textContent;

    const confirmBtn = document.getElementById('confirm-removal-btn');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Removing...';

    try {
      // API client does not have a dedicated deleteParticipant endpoint, so we use the pattern from tournament-brackets.html,
      // which uses the general DELETE on the participant endpoint.
      const response = await fetch(`${window.apiClient.baseURL}/api/tournaments/${this.tournament.slug}/participants/${teamId}`, {
          method: 'DELETE',
          headers: {
              'Authorization': `Bearer ${window.apiClient.getTokenFromSession()}`,
              'Content-Type': 'application/json',
          }
      });

      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.detail || 'Failed to remove team');
      }

      window.tournamentManagement.showSuccess(`Team "${teamName}" removed successfully.`);
      this.hideConfirmationModal();
      
      // Reload view
      await this.init(this.tournamentId);

    } catch (error) {
      window.tournamentManagement.showError(error.message || 'Error processing removal request.');
      this.hideConfirmationModal();
    }
  }

  async downloadPDF() {
    const exportBtn = document.getElementById('export-pdf-btn');
    const originalText = exportBtn.innerHTML;
    exportBtn.disabled = true;
    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';

    try {
        // Generate PDF using jsPDF with autoTable
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.setTextColor(15, 133, 211); // Primary color
        doc.text(`${this.tournament.title}`, 20, 25);
        
        doc.setFontSize(14);
        doc.setTextColor(93, 63, 211); // Secondary color
        doc.text('Tournament Participants', 20, 35);
        
        // Add tournament info
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Total Teams: ${this.participants.length}/${this.tournament.maxTeams || 'Unlimited'}`, 20, 45);
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`, 20, 52);
        
        // Prepare table data
        const tableData = this.participants.map((participant, index) => [
            index + 1,
            participant.teamName || 'N/A',
            participant.captainEmail || 'N/A',
            `${participant.players?.length || 0}/${this.tournament.maxPlayersPerTeam || 'N/A'}`,
            (participant.status || 'UNKNOWN').toUpperCase(),
            this.formatDate(participant.registrationDate)
        ]);
        
        // Generate table using autoTable
        doc.autoTable({
            head: [['#', 'Team Name', 'Captain Email', 'Players', 'Status', 'Registration Date']],
            body: tableData,
            startY: 60,
            theme: 'grid',
            headStyles: {
                fillColor: [15, 133, 211],
                textColor: [255, 255, 255],
                fontSize: 10,
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [50, 50, 50]
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                1: { cellWidth: 40 },
                2: { cellWidth: 50 },
                3: { cellWidth: 25, halign: 'center' },
                4: { cellWidth: 25, halign: 'center' },
                5: { cellWidth: 35, halign: 'center' }
            },
            margin: { left: 20, right: 20 },
            styles: {
                overflow: 'linebreak',
                cellPadding: 3
            }
        });
        
        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
            doc.text('Generated by Uni Games Tournament System', 20, doc.internal.pageSize.height - 10);
        }
        
        // Save the PDF
        const fileName = `${this.tournament.slug || 'tournament'}_participants_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        window.tournamentManagement.showSuccess('Participant list PDF downloaded successfully!');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        window.tournamentManagement.showError('Failed to generate PDF: ' + error.message);
    } finally {
        exportBtn.disabled = false;
        exportBtn.innerHTML = originalText;
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  renderLoading() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
      <div class="flex items-center justify-center py-20">
        <div class="loading-spinner"></div>
        <span class="ml-3 text-starlight-muted">Loading participants...</span>
      </div>
    `;
  }

  renderError(message) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
      <div class="text-center py-20">
        <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
        <h2 class="text-2xl font-bold mb-2 text-starlight">Failed to Load Participants</h2>
        <p class="text-starlight-muted mb-4">${message}</p>
        <button onclick="window.tournamentParticipantsView.init('${this.tournamentId}')" class="btn-primary">
          Try Again
        </button>
      </div>
    `;
  }
}

window.TournamentParticipantsView = TournamentParticipantsView;