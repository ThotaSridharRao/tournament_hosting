/**
 * Schedule Management Component
 * Displays tournament events organized by date with timings
 */

class ScheduleManagement {
  constructor() {
    this.tournaments = [];
    this.events = [];
    this.currentDate = new Date();
    this.viewMode = 'upcoming'; // 'upcoming', 'all', 'past'
  }

  async init() {
    try {
      await this.render();
      await new Promise(resolve => setTimeout(resolve, 100));
      this.bindEvents();
      await this.loadScheduleData();
    } catch (error) {
      console.error('Failed to initialize Schedule Management:', error);
    }
  }

  async render() {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
      <div class="animate-fade-in">
        <!-- Schedule Management Header -->
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-starlight mb-2">Tournament Schedule</h2>
          <p class="text-starlight-muted">View upcoming tournament events and milestones</p>
        </div>

        <!-- View Mode Filters -->
        <div class="bg-transparent rounded-xl p-6 mb-6">
          <div class="flex flex-wrap gap-2">
            <button id="view-upcoming" class="view-mode-btn active px-4 py-2 rounded-lg font-medium transition-colors">
              <i class="fas fa-calendar-day mr-2"></i>Upcoming Events
            </button>
            <button id="view-all" class="view-mode-btn px-4 py-2 rounded-lg font-medium transition-colors">
              <i class="fas fa-calendar mr-2"></i>All Events
            </button>
            <button id="view-past" class="view-mode-btn px-4 py-2 rounded-lg font-medium transition-colors">
              <i class="fas fa-history mr-2"></i>Past Events
            </button>
          </div>
        </div>

        <!-- Schedule Timeline -->
        <div id="schedule-timeline" class="space-y-6">
          <!-- Timeline will be rendered here -->
        </div>

        <!-- Loading State -->
        <div id="schedule-loading" class="hidden text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-cyan"></div>
          <p class="mt-4 text-starlight-muted">Loading schedule...</p>
        </div>

        <!-- Empty State -->
        <div id="schedule-empty" class="hidden text-center py-12">
          <i class="fas fa-calendar-times text-6xl text-starlight-muted mb-4"></i>
          <h3 class="text-xl font-semibold text-starlight mb-2">No Events Found</h3>
          <p class="text-starlight-muted">No tournament events scheduled for the selected period</p>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // View mode buttons
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Update active state
        document.querySelectorAll('.view-mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        // Update view mode
        const mode = e.target.id.replace('view-', '');
        this.viewMode = mode;
        this.renderSchedule();
      });
    });
  }

  async loadScheduleData() {
    try {
      this.showLoading(true);
      
      // Load tournaments data
      const response = await window.apiClient.getTournaments();
      if (response.success && response.data) {
        this.tournaments = response.data.tournaments || [];
        this.generateEvents();
        this.renderSchedule();
      } else {
        throw new Error('Failed to load tournaments');
      }
    } catch (error) {
      console.error('Failed to load schedule data:', error);
      this.showError('Failed to load schedule data');
    } finally {
      this.showLoading(false);
    }
  }

  generateEvents() {
    this.events = [];
    
    this.tournaments.forEach(tournament => {
      const events = this.extractTournamentEvents(tournament);
      this.events.push(...events);
    });

    // Sort events by date
    this.events.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  extractTournamentEvents(tournament) {
    const events = [];
    const now = new Date();

    // Registration Open Event
    if (tournament.registrationStart) {
      const regStartDate = new Date(tournament.registrationStart);
      events.push({
        id: `${tournament._id}-reg-start`,
        tournamentId: tournament._id,
        tournamentTitle: tournament.title,
        type: 'registration_open',
        title: 'Registration Opens',
        description: `Registration period begins for ${tournament.title}`,
        date: regStartDate,
        time: this.formatTime(regStartDate),
        status: regStartDate <= now ? 'completed' : 'upcoming',
        icon: 'fas fa-door-open',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        priority: 3
      });
    }

    // Registration Close Event
    if (tournament.registrationEnd) {
      const regEndDate = new Date(tournament.registrationEnd);
      events.push({
        id: `${tournament._id}-reg-end`,
        tournamentId: tournament._id,
        tournamentTitle: tournament.title,
        type: 'registration_close',
        title: 'Registration Closes',
        description: `Last chance to register for ${tournament.title}`,
        date: regEndDate,
        time: this.formatTime(regEndDate),
        status: regEndDate <= now ? 'completed' : 'upcoming',
        icon: 'fas fa-door-closed',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        priority: 4
      });
    }

    // Tournament Start Event
    if (tournament.startDate) {
      const startDate = new Date(tournament.startDate);
      events.push({
        id: `${tournament._id}-start`,
        tournamentId: tournament._id,
        tournamentTitle: tournament.title,
        type: 'tournament_start',
        title: 'Tournament Begins',
        description: `${tournament.title} competition starts`,
        date: startDate,
        time: this.formatTime(startDate),
        status: startDate <= now ? 'completed' : 'upcoming',
        icon: 'fas fa-play-circle',
        color: 'text-cyber-cyan',
        bgColor: 'bg-cyber-cyan/20',
        priority: 5
      });
    }

    // Tournament End Event
    if (tournament.endDate) {
      const endDate = new Date(tournament.endDate);
      events.push({
        id: `${tournament._id}-end`,
        tournamentId: tournament._id,
        tournamentTitle: tournament.title,
        type: 'tournament_end',
        title: 'Tournament Ends',
        description: `${tournament.title} concludes`,
        date: endDate,
        time: this.formatTime(endDate),
        status: endDate <= now ? 'completed' : 'upcoming',
        icon: 'fas fa-flag-checkered',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
        priority: 2
      });
    }

    // Finals Event (if tournament has specific finals date)
    if (tournament.finalsDate) {
      const finalsDate = new Date(tournament.finalsDate);
      events.push({
        id: `${tournament._id}-finals`,
        tournamentId: tournament._id,
        tournamentTitle: tournament.title,
        type: 'finals',
        title: 'Finals',
        description: `Championship match for ${tournament.title}`,
        date: finalsDate,
        time: this.formatTime(finalsDate),
        status: finalsDate <= now ? 'completed' : 'upcoming',
        icon: 'fas fa-trophy',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        priority: 1
      });
    }

    // Bracket Generation Event (day before tournament starts)
    if (tournament.startDate && tournament.status === 'registration_open') {
      const bracketDate = new Date(tournament.startDate);
      bracketDate.setDate(bracketDate.getDate() - 1);
      bracketDate.setHours(18, 0, 0, 0); // 6 PM day before
      
      if (bracketDate > now) {
        events.push({
          id: `${tournament._id}-brackets`,
          tournamentId: tournament._id,
          tournamentTitle: tournament.title,
          type: 'bracket_generation',
          title: 'Brackets Generated',
          description: `Tournament brackets will be finalized`,
          date: bracketDate,
          time: this.formatTime(bracketDate),
          status: 'upcoming',
          icon: 'fas fa-sitemap',
          color: 'text-cyber-indigo',
          bgColor: 'bg-cyber-indigo/20',
          priority: 4
        });
      }
    }

    return events;
  }

  renderSchedule() {
    const timeline = document.getElementById('schedule-timeline');
    const filteredEvents = this.filterEventsByViewMode();

    if (filteredEvents.length === 0) {
      this.showEmpty(true);
      timeline.innerHTML = '';
      return;
    }

    this.showEmpty(false);

    // Group events by date
    const eventsByDate = this.groupEventsByDate(filteredEvents);
    
    let html = '';
    Object.keys(eventsByDate).forEach(dateKey => {
      const events = eventsByDate[dateKey];
      const date = new Date(dateKey);
      
      html += this.renderDateSection(date, events);
    });

    timeline.innerHTML = html;
  }

  filterEventsByViewMode() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (this.viewMode) {
      case 'upcoming':
        return this.events.filter(event => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= now;
        });
      case 'past':
        return this.events.filter(event => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate < now;
        });
      case 'all':
      default:
        return this.events;
    }
  }

  groupEventsByDate(events) {
    const grouped = {};
    
    events.forEach(event => {
      const dateKey = event.date.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    // Sort events within each date by priority (higher priority first) then by time
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => {
        // First sort by priority (higher priority first)
        if (a.priority !== b.priority) {
          return (b.priority || 0) - (a.priority || 0);
        }
        // Then sort by time
        return new Date(a.date) - new Date(b.date);
      });
    });

    return grouped;
  }

  renderDateSection(date, events) {
    const isToday = this.isToday(date);
    const isPast = date < new Date().setHours(0, 0, 0, 0);
    
    return `
      <div class="date-section ${isPast ? 'opacity-75' : ''}">
        <div class="flex items-center mb-4">
          <div class="date-header ${isToday ? 'bg-cyber-cyan text-dark-matter' : 'bg-dark-matter/50 text-starlight'} px-4 py-2 rounded-lg font-semibold">
            <div class="text-sm">${this.formatDateHeader(date)}</div>
            ${isToday ? '<div class="text-xs opacity-80">Today</div>' : ''}
          </div>
          <div class="flex-1 h-px bg-cyber-border ml-4"></div>
        </div>
        
        <div class="space-y-3 ml-4">
          ${events.map(event => this.renderEventCard(event)).join('')}
        </div>
      </div>
    `;
  }

  renderEventCard(event) {
    const isPast = event.status === 'completed';
    const isToday = this.isToday(event.date);
    const isUrgent = this.isWithinHours(event.date, 24) && !isPast;
    
    return `
      <div class="event-card glass-card p-4 hover:border-cyber-cyan/50 transition-all duration-200 ${isPast ? 'opacity-75' : ''} ${isToday ? 'ring-2 ring-cyber-cyan/50' : ''} ${isUrgent ? 'border-yellow-400/50' : ''}">
        <div class="flex items-start space-x-4">
          <div class="event-icon ${event.bgColor} ${event.color} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
            <i class="${event.icon}"></i>
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-starlight truncate">${event.tournamentTitle}</h4>
                <p class="text-sm ${event.color} font-medium">${event.title}</p>
              </div>
              <div class="text-right flex-shrink-0 ml-4">
                <span class="text-sm ${event.color} font-medium">${event.time}</span>
                ${isUrgent ? '<div class="text-xs text-yellow-400 mt-1"><i class="fas fa-exclamation-triangle mr-1"></i>Soon</div>' : ''}
              </div>
            </div>
            
            ${event.description ? `<p class="text-starlight-muted text-sm mb-2">${event.description}</p>` : ''}
            
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                ${isPast ? '<span class="text-xs text-green-400"><i class="fas fa-check mr-1"></i>Completed</span>' : ''}
                ${isToday ? '<span class="text-xs text-cyber-cyan"><i class="fas fa-calendar-day mr-1"></i>Today</span>' : ''}
              </div>
              
              <button onclick="window.scheduleManagement.viewTournament('${event.tournamentId}')" 
                class="px-3 py-1 text-sm bg-cyber-indigo/20 text-cyber-indigo rounded-lg hover:bg-cyber-indigo/30 transition-colors">
                <i class="fas fa-eye mr-1"></i>View
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  formatDateHeader(date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today • ' + date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow • ' + date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday • ' + date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  formatTime(date) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isWithinHours(date, hours) {
    const now = new Date();
    const diffInHours = (date - now) / (1000 * 60 * 60);
    return diffInHours > 0 && diffInHours <= hours;
  }

  viewTournament(tournamentId) {
    // Switch to tournaments section and highlight the specific tournament
    if (window.dashboardState) {
      window.dashboardState.setCurrentSection('tournaments');
      loadSectionContent('tournaments').then(() => {
        // Highlight the tournament after loading
        setTimeout(() => {
          const tournamentCard = document.querySelector(`[data-tournament-id="${tournamentId}"]`);
          if (tournamentCard) {
            tournamentCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            tournamentCard.classList.add('ring-2', 'ring-cyber-cyan');
            setTimeout(() => {
              tournamentCard.classList.remove('ring-2', 'ring-cyber-cyan');
            }, 3000);
          }
        }, 500);
      });
    }
  }

  showLoading(show) {
    const loading = document.getElementById('schedule-loading');
    const timeline = document.getElementById('schedule-timeline');
    
    if (show) {
      loading.classList.remove('hidden');
      timeline.classList.add('hidden');
    } else {
      loading.classList.add('hidden');
      timeline.classList.remove('hidden');
    }
  }

  showEmpty(show) {
    const empty = document.getElementById('schedule-empty');
    const timeline = document.getElementById('schedule-timeline');
    
    if (show) {
      empty.classList.remove('hidden');
      timeline.classList.add('hidden');
    } else {
      empty.classList.remove('hidden');
      timeline.classList.remove('hidden');
    }
  }

  showError(message) {
    const timeline = document.getElementById('schedule-timeline');
    timeline.innerHTML = `
      <div class="text-center py-20">
        <i class="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
        <h2 class="text-2xl font-bold mb-2 text-starlight">Failed to Load Schedule</h2>
        <p class="text-starlight-muted mb-4">${message}</p>
        <button onclick="window.scheduleManagement.loadScheduleData()" class="btn-primary">
          Try Again
        </button>
      </div>
    `;
  }

  destroy() {
    this.tournaments = [];
    this.events = [];
  }
}

window.ScheduleManagement = ScheduleManagement;