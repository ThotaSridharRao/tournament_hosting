/**
 * Bracket Management Component
 * Handles bracket generation and match result management for tournaments
 */

class BracketManagement {
  constructor() {
    this.tournaments = [];
    this.currentTournament = null;
    this.participants = [];
    this.matches = [];
    this.brackets = null;
  }

  async init() {
    try {
      await this.loadTournaments();
      this.render();
      this.bindEvents();
    } catch (error) {
      console.error('Failed to initialize Bracket Management:', error);
      this.renderError();
    }
  }

  async loadTournaments() {
    try {
      const response = await window.apiClient.getTournaments({ 
        status: 'ongoing,registration_closed',
        limit: 50 
      });
      
      if (response.success) {
        this.tournaments = response.data.tournaments || [];
      }
    } catch (error) {
      console.error('Failed to load tournaments:', error);
      this.tournaments = [];
    }
  }

  render() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
      <div class="animate-fade-in space-y-6">
        <!-- Tournament Selection -->
        <div class="glass rounded-xl p-6">
          <h3 class="text-lg font-semibold text-starlight mb-4">Select Tournament</h3>
          <div class="flex flex-col lg:flex-row gap-4">
            <select id="tournament-select" class="flex-1 px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight focus:border-cyber-cyan focus:outline-none">
              <option value="">Select a tournament to manage brackets...</option>
              ${this.tournaments.map(t => `
                <option value="${t._id}">${t.title} (${t.participants?.length || 0} teams)</option>
              `).join('')}
            </select>
            <button id="load-tournament-btn" class="px-6 py-3 bg-cyber-cyan text-dark-matter rounded-lg font-semibold hover:bg-cyber-cyan/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              Load Tournament
            </button>
          </div>
        </div>

        <!-- Tournament Info -->
        <div id="tournament-info" class="hidden glass rounded-xl p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-2xl font-semibold text-starlight" id="tournament-title">Tournament Title</h3>
              <p class="text-starlight-muted" id="tournament-format">Format: Single Elimination</p>
            </div>
            <div class="text-right">
              <div class="text-starlight-muted">Participants</div>
              <div class="text-2xl font-bold text-cyber-cyan" id="participant-count">0</div>
            </div>
          </div>
          
          <div class="flex gap-4">
            <button id="generate-brackets-btn" class="px-6 py-3 bg-gradient-to-r from-cyber-cyan to-cyber-indigo text-dark-matter rounded-lg font-semibold hover:from-cyber-cyan/90 hover:to-cyber-indigo/90 transition-all duration-300 flex items-center gap-2">
              <i class="fas fa-sitemap"></i>
              Generate Brackets
            </button>
            <button id="view-participants-btn" class="px-6 py-3 bg-cyber-indigo/20 text-cyber-indigo rounded-lg font-semibold hover:bg-cyber-indigo/30 transition-colors flex items-center gap-2">
              <i class="fas fa-users"></i>
              View Participants
            </button>
          </div>
        </div>

        <!-- Brackets Display -->
        <div id="brackets-container" class="hidden">
          <!-- Brackets will be rendered here -->
        </div>

        <!-- Match Results -->
        <div id="match-results-container" class="hidden">
          <!-- Match results interface will be rendered here -->
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Tournament selection
    const tournamentSelect = document.getElementById('tournament-select');
    const loadBtn = document.getElementById('load-tournament-btn');

    tournamentSelect.addEventListener('change', (e) => {
      loadBtn.disabled = !e.target.value;
    });

    loadBtn.addEventListener('click', () => {
      const tournamentId = tournamentSelect.value;
      if (tournamentId) {
        this.loadTournamentDetails(tournamentId);
      }
    });

    // Generate brackets button
    document.getElementById('generate-brackets-btn')?.addEventListener('click', () => {
      this.generateBrackets();
    });

    // View participants button
    document.getElementById('view-participants-btn')?.addEventListener('click', () => {
      this.showParticipants();
    });
  }

  async loadTournamentDetails(tournamentId) {
    try {
      // Show loading
      document.getElementById('tournament-info').classList.add('hidden');
      
      // Load tournament details
      const tournamentResponse = await window.apiClient.getTournament(tournamentId);
      if (!tournamentResponse.success) {
        throw new Error('Failed to load tournament details');
      }

      this.currentTournament = tournamentResponse.data;

      // Load participants
      const participantsResponse = await window.apiClient.getTournamentParticipants(tournamentId);
      if (participantsResponse.success) {
        this.participants = participantsResponse.data.participants || [];
      }

      // Update UI
      document.getElementById('tournament-title').textContent = this.currentTournament.title;
      document.getElementById('tournament-format').textContent = `Format: ${this.currentTournament.format || 'Single Elimination'}`;
      document.getElementById('participant-count').textContent = this.participants.length;

      document.getElementById('tournament-info').classList.remove('hidden');

      // Check if brackets already exist
      await this.checkExistingBrackets();

    } catch (error) {
      console.error('Error loading tournament:', error);
      this.showError('Failed to load tournament details: ' + error.message);
    }
  }

  async checkExistingBrackets() {
    try {
      const response = await window.apiClient.getTournamentBrackets(this.currentTournament._id);
      if (response.success && response.data) {
        this.brackets = response.data;
        this.renderBrackets();
      }
    } catch (error) {
      console.log('No existing brackets found');
    }
  }

  async generateBrackets() {
    try {
      if (!this.currentTournament || this.participants.length === 0) {
        this.showError('No participants found for bracket generation');
        return;
      }

      // Show loading
      const generateBtn = document.getElementById('generate-brackets-btn');
      const originalText = generateBtn.innerHTML;
      generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generating...';
      generateBtn.disabled = true;

      const format = this.currentTournament.format || 'single-elimination';
      const bracketData = this.createBracketStructure(format, this.participants);

      // Save brackets via API
      const response = await window.apiClient.createTournamentBrackets(this.currentTournament._id, bracketData);

      if (response.success) {
        this.brackets = response.data;
        this.renderBrackets();
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
      generateBtn.innerHTML = '<i class="fas fa-sitemap mr-2"></i>Generate Brackets';
      generateBtn.disabled = false;
    }
  }

  createBracketStructure(format, participants) {
    switch (format.toLowerCase()) {
      case 'single-elimination':
      case 'single_elimination':
        return this.createSingleEliminationBrackets(participants);
      case 'double-elimination':
      case 'double_elimination':
        return this.createDoubleEliminationBrackets(participants);
      case 'round-robin':
      case 'round_robin':
        return this.createRoundRobinBrackets(participants);
      default:
        return this.createSingleEliminationBrackets(participants);
    }
  }

  createSingleEliminationBrackets(participants) {
    const numTeams = participants.length;
    const numRounds = Math.ceil(Math.log2(numTeams));
    const matches = [];
    let matchId = 1;

    // Generate matches for all rounds
    for (let round = 1; round <= numRounds; round++) {
      const matchesInRound = Math.pow(2, numRounds - round);

      for (let matchInRound = 1; matchInRound <= matchesInRound; matchInRound++) {
        let team1 = null, team2 = null;
        let status = 'scheduled';

        if (round === 1) {
          // First round - assign actual teams
          const team1Index = (matchInRound - 1) * 2;
          const team2Index = (matchInRound - 1) * 2 + 1;

          if (participants[team1Index]) {
            team1 = {
              id: participants[team1Index]._id,
              name: participants[team1Index].teamName,
              seed: team1Index + 1
            };
          }
          if (participants[team2Index]) {
            team2 = {
              id: participants[team2Index]._id,
              name: participants[team2Index].teamName,
              seed: team2Index + 1
            };
          }

          if (!team1 && !team2) {
            status = 'no_teams';
          } else if (!team1 || !team2) {
            status = 'bye';
          }
        } else {
          status = 'awaiting';
        }

        matches.push({
          matchId: matchId++,
          round: round,
          matchInRound: matchInRound,
          team1: team1,
          team2: team2,
          status: status,
          winner: null,
          scheduledTime: null,
          result: null
        });
      }
    }

    return {
      format: 'single-elimination',
      rounds: numRounds,
      matches: matches,
      createdAt: new Date().toISOString()
    };
  }

  createDoubleEliminationBrackets(participants) {
    // Simplified double elimination - can be expanded
    return {
      format: 'double-elimination',
      rounds: Math.ceil(Math.log2(participants.length)) * 2,
      matches: [],
      createdAt: new Date().toISOString(),
      note: 'Double elimination brackets require more complex logic'
    };
  }

  createRoundRobinBrackets(participants) {
    const matches = [];
    let matchId = 1;

    // Generate all possible matches (each team plays every other team once)
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        matches.push({
          matchId: matchId++,
          round: 1, // All matches are in round 1 for round robin
          team1: {
            id: participants[i]._id,
            name: participants[i].teamName,
            seed: i + 1
          },
          team2: {
            id: participants[j]._id,
            name: participants[j].teamName,
            seed: j + 1
          },
          status: 'scheduled',
          winner: null,
          scheduledTime: null,
          result: null
        });
      }
    }

    return {
      format: 'round-robin',
      rounds: 1,
      matches: matches,
      createdAt: new Date().toISOString()
    };
  }

  renderBrackets() {
    const container = document.getElementById('brackets-container');
    
    if (!this.brackets || !this.brackets.matches) {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');

    if (this.brackets.format === 'single-elimination') {
      this.renderSingleEliminationBrackets(container);
    } else if (this.brackets.format === 'round-robin') {
      this.renderRoundRobinBrackets(container);
    } else {
      container.innerHTML = `
        <div class="glass rounded-xl p-6 text-center">
          <i class="fas fa-construction text-6xl text-yellow-400 mb-4"></i>
          <h3 class="text-xl font-semibold text-starlight mb-2">Bracket View Under Development</h3>
          <p class="text-starlight-muted">${this.brackets.format} brackets are not yet supported in the visual interface.</p>
        </div>
      `;
    }
  }

  renderSingleEliminationBrackets(container) {
    const matches = this.brackets.matches;
    const numRounds = this.brackets.rounds;

    let html = `
      <div class="glass rounded-xl p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-semibold text-starlight">Single Elimination Brackets</h3>
          <button id="enter-results-btn" class="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2">
            <i class="fas fa-edit"></i>
            Enter Results
          </button>
        </div>

        <!-- Visual Bracket -->
        <div class="rounds-container overflow-x-auto">
          <div class="flex gap-8 pb-4">
    `;

    // Render each round
    for (let round = 1; round <= numRounds; round++) {
      const roundMatches = matches.filter(m => m.round === round);
      
      html += `
        <div class="bracket-round min-w-[250px]">
          <div class="round-title text-center font-semibold mb-4 text-cyber-cyan">
            ${this.getRoundName(round, numRounds)}
          </div>
      `;

      roundMatches.forEach(match => {
        html += `
          <div class="bracket-match bg-dark-matter/30 border border-cyber-border rounded-lg p-4 mb-4">
            <div class="match-header text-center text-sm text-starlight-muted mb-2">
              Match ${match.matchId}
            </div>
            <div class="match-teams space-y-2">
              <div class="team flex justify-between items-center p-2 bg-dark-matter/50 rounded ${match.winner === match.team1?.id ? 'border border-green-400' : ''}">
                <span class="team-name">${match.team1?.name || 'TBD'}</span>
                ${match.team1 ? `<span class="seed-number bg-cyber-indigo text-white px-2 py-1 rounded text-xs">#${match.team1.seed}</span>` : ''}
              </div>
              <div class="team flex justify-between items-center p-2 bg-dark-matter/50 rounded ${match.winner === match.team2?.id ? 'border border-green-400' : ''}">
                <span class="team-name">${match.team2?.name || 'TBD'}</span>
                ${match.team2 ? `<span class="seed-number bg-cyber-indigo text-white px-2 py-1 rounded text-xs">#${match.team2.seed}</span>` : ''}
              </div>
            </div>
            <div class="match-status text-center mt-2 text-sm">
              <span class="status-badge ${this.getStatusClass(match.status)}">${this.getStatusText(match.status)}</span>
            </div>
          </div>
        `;
      });

      html += `</div>`;
    }

    html += `
          </div>
        </div>

        <!-- Match Results Table -->
        <div class="mt-8">
          <h4 class="text-lg font-semibold text-starlight mb-4">Match Schedule & Results</h4>
          <div class="overflow-x-auto">
            <table class="w-full bg-dark-matter/30 border border-cyber-border rounded-lg">
              <thead>
                <tr class="bg-dark-matter/50">
                  <th class="px-4 py-3 text-left text-starlight">Match</th>
                  <th class="px-4 py-3 text-left text-starlight">Round</th>
                  <th class="px-4 py-3 text-left text-starlight">Teams</th>
                  <th class="px-4 py-3 text-left text-starlight">Status</th>
                  <th class="px-4 py-3 text-left text-starlight">Winner</th>
                  <th class="px-4 py-3 text-left text-starlight">Actions</th>
                </tr>
              </thead>
              <tbody>
    `;

    matches.forEach(match => {
      html += `
        <tr class="border-t border-cyber-border/30 hover:bg-dark-matter/20">
          <td class="px-4 py-3 font-semibold text-cyber-cyan">M${match.matchId}</td>
          <td class="px-4 py-3 text-starlight">${this.getRoundName(match.round, numRounds)}</td>
          <td class="px-4 py-3 text-starlight">
            ${match.team1?.name || 'TBD'} vs ${match.team2?.name || 'TBD'}
          </td>
          <td class="px-4 py-3">
            <span class="status-badge ${this.getStatusClass(match.status)}">${this.getStatusText(match.status)}</span>
          </td>
          <td class="px-4 py-3 text-starlight">${match.winner ? matches.find(m => m.team1?.id === match.winner || m.team2?.id === match.winner)?.team1?.id === match.winner ? match.team1?.name : match.team2?.name : '-'}</td>
          <td class="px-4 py-3">
            ${match.status === 'scheduled' && match.team1 && match.team2 ? `
              <button onclick="window.bracketManagement.enterMatchResult('${match.matchId}')" class="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-sm">
                Enter Result
              </button>
            ` : ''}
          </td>
        </tr>
      `;
    });

    html += `
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Bind enter results button
    document.getElementById('enter-results-btn')?.addEventListener('click', () => {
      this.showMatchResultsInterface();
    });
  }

  renderRoundRobinBrackets(container) {
    const matches = this.brackets.matches;

    let html = `
      <div class="glass rounded-xl p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-semibold text-starlight">Round Robin Tournament</h3>
          <button id="enter-results-btn" class="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2">
            <i class="fas fa-edit"></i>
            Enter Results
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full bg-dark-matter/30 border border-cyber-border rounded-lg">
            <thead>
              <tr class="bg-dark-matter/50">
                <th class="px-4 py-3 text-left text-starlight">Match</th>
                <th class="px-4 py-3 text-left text-starlight">Team 1</th>
                <th class="px-4 py-3 text-center text-starlight">vs</th>
                <th class="px-4 py-3 text-left text-starlight">Team 2</th>
                <th class="px-4 py-3 text-left text-starlight">Status</th>
                <th class="px-4 py-3 text-left text-starlight">Winner</th>
                <th class="px-4 py-3 text-left text-starlight">Actions</th>
              </tr>
            </thead>
            <tbody>
    `;

    matches.forEach(match => {
      html += `
        <tr class="border-t border-cyber-border/30 hover:bg-dark-matter/20">
          <td class="px-4 py-3 font-semibold text-cyber-cyan">M${match.matchId}</td>
          <td class="px-4 py-3 text-starlight">${match.team1?.name}</td>
          <td class="px-4 py-3 text-center text-starlight-muted">VS</td>
          <td class="px-4 py-3 text-starlight">${match.team2?.name}</td>
          <td class="px-4 py-3">
            <span class="status-badge ${this.getStatusClass(match.status)}">${this.getStatusText(match.status)}</span>
          </td>
          <td class="px-4 py-3 text-starlight">${match.winner ? (match.winner === match.team1?.id ? match.team1?.name : match.team2?.name) : '-'}</td>
          <td class="px-4 py-3">
            ${match.status === 'scheduled' ? `
              <button onclick="window.bracketManagement.enterMatchResult('${match.matchId}')" class="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors text-sm">
                Enter Result
              </button>
            ` : ''}
          </td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Bind enter results button
    document.getElementById('enter-results-btn')?.addEventListener('click', () => {
      this.showMatchResultsInterface();
    });
  }

  getRoundName(round, totalRounds) {
    if (round === totalRounds) return 'Final';
    if (round === totalRounds - 1) return 'Semi-Final';
    if (round === totalRounds - 2) return 'Quarter-Final';
    return `Round ${round}`;
  }

  getStatusClass(status) {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400';
      case 'ongoing': return 'bg-yellow-500/20 text-yellow-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'bye': return 'bg-gray-500/20 text-gray-400';
      case 'awaiting': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  }

  getStatusText(status) {
    switch (status) {
      case 'scheduled': return 'Scheduled';
      case 'ongoing': return 'Ongoing';
      case 'completed': return 'Completed';
      case 'bye': return 'Bye';
      case 'awaiting': return 'Awaiting';
      default: return 'Unknown';
    }
  }

  async enterMatchResult(matchId) {
    const match = this.brackets.matches.find(m => m.matchId == matchId);
    if (!match) return;

    this.showMatchResultModal(match);
  }

  showMatchResultModal(match) {
    const modalHtml = `
      <div id="match-result-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="glass rounded-xl max-w-md w-full animate-slide-in">
          <div class="flex justify-between items-center p-6 border-b border-cyber-border">
            <h3 class="text-xl font-semibold text-starlight">Enter Match Result</h3>
            <button id="close-result-modal" class="text-starlight-muted hover:text-starlight">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <div class="p-6">
            <div class="mb-4">
              <h4 class="text-lg font-semibold text-starlight mb-2">Match ${match.matchId}</h4>
              <p class="text-starlight-muted">${match.team1?.name} vs ${match.team2?.name}</p>
            </div>

            <form id="match-result-form" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-starlight mb-2">Winner</label>
                <div class="space-y-2">
                  <label class="flex items-center gap-3 p-3 bg-dark-matter/50 rounded-lg cursor-pointer hover:bg-dark-matter/70 transition-colors">
                    <input type="radio" name="winner" value="${match.team1?.id}" class="text-cyber-cyan">
                    <span class="text-starlight">${match.team1?.name}</span>
                  </label>
                  <label class="flex items-center gap-3 p-3 bg-dark-matter/50 rounded-lg cursor-pointer hover:bg-dark-matter/70 transition-colors">
                    <input type="radio" name="winner" value="${match.team2?.id}" class="text-cyber-cyan">
                    <span class="text-starlight">${match.team2?.name}</span>
                  </label>
                </div>
              </div>

              <div>
                <label for="match-notes" class="block text-sm font-medium text-starlight mb-2">Notes (Optional)</label>
                <textarea id="match-notes" rows="3" placeholder="Match notes, score details, etc..."
                          class="w-full px-4 py-3 bg-dark-matter/50 border border-cyber-border rounded-lg text-starlight placeholder-starlight-muted focus:border-cyber-cyan focus:outline-none resize-vertical"></textarea>
              </div>

              <div class="flex gap-3 pt-4">
                <button type="button" onclick="window.bracketManagement.hideMatchResultModal()" 
                        class="flex-1 px-4 py-3 bg-dark-matter/50 text-starlight-muted rounded-lg hover:bg-dark-matter/70 transition-colors">
                  Cancel
                </button>
                <button type="submit" 
                        class="flex-1 px-4 py-3 bg-cyber-cyan text-dark-matter rounded-lg hover:bg-cyber-cyan/90 transition-colors font-semibold">
                  Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Bind events
    document.getElementById('close-result-modal').addEventListener('click', () => {
      this.hideMatchResultModal();
    });

    document.getElementById('match-result-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitMatchResult(match);
    });

    // Close on outside click
    document.getElementById('match-result-modal').addEventListener('click', (e) => {
      if (e.target.id === 'match-result-modal') {
        this.hideMatchResultModal();
      }
    });
  }

  async submitMatchResult(match) {
    try {
      const form = document.getElementById('match-result-form');
      const formData = new FormData(form);
      const winner = formData.get('winner');
      const notes = formData.get('notes') || '';

      if (!winner) {
        this.showError('Please select a winner');
        return;
      }

      // Show loading
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
      submitBtn.disabled = true;

      // Update match result via API
      const response = await window.apiClient.updateMatchResult(this.currentTournament._id, match.matchId, {
        winner: winner,
        notes: notes,
        status: 'completed'
      });

      if (response.success) {
        // Update local data
        match.winner = winner;
        match.status = 'completed';
        match.result = { winner, notes };

        // Advance winner to next round if applicable
        this.advanceWinner(match);

        // Re-render brackets
        this.renderBrackets();

        this.hideMatchResultModal();
        this.showNotification('Match result saved successfully!', 'success');
      } else {
        throw new Error(response.message || 'Failed to save match result');
      }

    } catch (error) {
      console.error('Error saving match result:', error);
      this.showError('Failed to save match result: ' + error.message);
    } finally {
      // Restore button
      const submitBtn = document.getElementById('match-result-form')?.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = 'Save Result';
        submitBtn.disabled = false;
      }
    }
  }

  advanceWinner(completedMatch) {
    if (this.brackets.format !== 'single-elimination') return;

    const { round, matchInRound, winner } = completedMatch;
    const nextRound = round + 1;
    
    // Find the next match this winner should advance to
    const nextMatchInRound = Math.ceil(matchInRound / 2);
    const nextMatch = this.brackets.matches.find(m => 
      m.round === nextRound && m.matchInRound === nextMatchInRound
    );

    if (nextMatch) {
      const winnerTeam = completedMatch.team1?.id === winner ? completedMatch.team1 : completedMatch.team2;
      
      // Determine if winner goes to team1 or team2 slot
      if (matchInRound % 2 === 1) {
        // Odd match number -> winner goes to team1 slot
        nextMatch.team1 = winnerTeam;
      } else {
        // Even match number -> winner goes to team2 slot
        nextMatch.team2 = winnerTeam;
      }

      // Update match status if both teams are now assigned
      if (nextMatch.team1 && nextMatch.team2) {
        nextMatch.status = 'scheduled';
      }
    }
  }

  hideMatchResultModal() {
    const modal = document.getElementById('match-result-modal');
    if (modal) {
      modal.classList.add('animate-fade-out');
      setTimeout(() => modal.remove(), 250);
    }
  }

  showMatchResultsInterface() {
    // Show a dedicated interface for entering multiple match results
    const container = document.getElementById('match-results-container');
    container.classList.remove('hidden');
    
    const pendingMatches = this.brackets.matches.filter(m => 
      m.status === 'scheduled' && m.team1 && m.team2
    );

    container.innerHTML = `
      <div class="glass rounded-xl p-6">
        <h3 class="text-xl font-semibold text-starlight mb-4">Enter Match Results</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${pendingMatches.map(match => `
            <div class="bg-dark-matter/30 border border-cyber-border rounded-lg p-4">
              <div class="text-center mb-3">
                <span class="text-cyber-cyan font-semibold">Match ${match.matchId}</span>
                <span class="text-starlight-muted ml-2">(${this.getRoundName(match.round, this.brackets.rounds)})</span>
              </div>
              <div class="text-center mb-4">
                <div class="text-starlight font-medium">${match.team1?.name}</div>
                <div class="text-starlight-muted my-1">vs</div>
                <div class="text-starlight font-medium">${match.team2?.name}</div>
              </div>
              <button onclick="window.bracketManagement.enterMatchResult('${match.matchId}')" 
                      class="w-full px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                Enter Result
              </button>
            </div>
          `).join('')}
        </div>
        ${pendingMatches.length === 0 ? `
          <div class="text-center py-8 text-starlight-muted">
            <i class="fas fa-check-circle text-4xl mb-2"></i>
            <p>No pending matches to update</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  showParticipants() {
    const modalHtml = `
      <div id="participants-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div class="glass rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-in">
          <div class="flex justify-between items-center p-6 border-b border-cyber-border">
            <h3 class="text-2xl font-semibold text-starlight">Tournament Participants</h3>
            <button id="close-participants-modal" class="text-starlight-muted hover:text-starlight">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              ${this.participants.map((participant, index) => `
                <div class="bg-dark-matter/30 border border-cyber-border rounded-lg p-4">
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-semibold text-starlight">${participant.teamName}</h4>
                    <span class="bg-cyber-indigo text-white px-2 py-1 rounded text-xs">Seed #${index + 1}</span>
                  </div>
                  <p class="text-starlight-muted text-sm mb-2">
                    <i class="fas fa-users mr-1"></i>
                    ${participant.players?.length || 0} players
                  </p>
                  <p class="text-starlight-muted text-sm">
                    <i class="fas fa-envelope mr-1"></i>
                    ${participant.captainEmail || 'No email'}
                  </p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('close-participants-modal').addEventListener('click', () => {
      document.getElementById('participants-modal').remove();
    });
  }

  showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 max-w-sm w-full glass rounded-lg p-4 transform translate-x-full opacity-0 transition-all duration-300`;
    
    switch (type) {
      case 'success':
        toast.classList.add('border-green-500/30', 'bg-green-500/10');
        break;
      case 'error':
        toast.classList.add('border-red-500/30', 'bg-red-500/10');
        break;
      default:
        toast.classList.add('border-blue-500/30', 'bg-blue-500/10');
    }
    
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} text-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue'}-400"></i>
        <span class="text-starlight">${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.remove('translate-x-full', 'opacity-0');
    }, 100);
    
    setTimeout(() => {
      toast.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  renderError() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
      <div class="text-center py-20">
        <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
        <h2 class="text-2xl font-bold mb-2 text-starlight">Failed to Load Bracket Management</h2>
        <p class="text-starlight-muted mb-4">There was an error loading the bracket management interface.</p>
        <button onclick="window.bracketManagement.init()" class="btn-primary">
          Try Again
        </button>
      </div>
    `;
  }

  destroy() {
    this.tournaments = [];
    this.currentTournament = null;
    this.participants = [];
    this.matches = [];
    this.brackets = null;
  }
}

window.BracketManagement = BracketManagement;