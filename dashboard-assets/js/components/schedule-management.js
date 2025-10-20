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
    this.lastDataLoad = null;
    this.dataStaleThreshold = 30000; // 30 seconds
  }

  async init() {
    try {
      await this.render();
      await new Promise(resolve => setTimeout(resolve, 100));
      this.bindEvents();
      this.setupDataUpdateListener();
      await this.loadScheduleData();
    } catch (error) {
      console.error('Failed to initialize Schedule Management:', error);
    }
  }

  setupDataUpdateListener() {
    // Listen for tournament updates from other components
    if (window.dataUpdateNotifier) {
      this.tournamentUpdateListener = (data) => {
        console.log('🔄 Schedule component received tournament update notification:', data);
        console.log('📅 Refreshing schedule data due to tournament change...');
        this.refreshScheduleData();
      };

      window.dataUpdateNotifier.on('tournament-updated', this.tournamentUpdateListener);
      window.dataUpdateNotifier.on('tournament-created', this.tournamentUpdateListener);
      window.dataUpdateNotifier.on('tournament-deleted', this.tournamentUpdateListener);

      console.log('✅ Schedule component is now listening for tournament updates');
    } else {
      console.warn('⚠️ DataUpdateNotifier not available, schedule may not refresh automatically');
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
          <div class="flex flex-wrap justify-between items-center gap-2">
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
            <button id="refresh-schedule" class="px-4 py-2 bg-cyber-cyan/20 text-cyber-cyan rounded-lg hover:bg-cyber-cyan/30 transition-colors font-medium">
              <i class="fas fa-sync-alt mr-2"></i>Refresh
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

    // Manual refresh button
    const refreshButton = document.getElementById('refresh-schedule');
    if (refreshButton) {
      refreshButton.addEventListener('click', () => {
        console.log('🔄 Manual refresh requested by user');
        this.refreshScheduleData();
      });
    }
  }

  async loadScheduleData(forceRefresh = false) {
    try {
      this.showLoading(true);

      // Clear any cached data if force refresh is requested
      if (forceRefresh) {
        this.tournaments = [];
        this.events = [];
      }

      // Load tournaments data with all necessary parameters and cache busting
      const params = {
        sort_by: 'createdAt',
        sort_order: 'desc'
      };

      // Add cache busting parameter to ensure fresh data
      if (forceRefresh) {
        params._t = Date.now();
      }

      const response = await window.apiClient.getTournaments(params);

      if (response.success && response.data) {
        this.tournaments = response.data.tournaments || [];
        console.log('Loaded tournaments for schedule:', this.tournaments.length);

        // Validate tournament data
        this.tournaments = this.tournaments.filter(tournament => {
          if (!tournament._id || !tournament.title) {
            console.warn('Filtering out invalid tournament:', tournament);
            return false;
          }
          return true;
        });

        this.generateEvents();
        this.renderSchedule();
        this.lastDataLoad = Date.now();
      } else {
        throw new Error(response.message || 'Failed to load tournaments');
      }
    } catch (error) {
      console.error('Failed to load schedule data:', error);
      this.showError('Failed to load schedule data: ' + error.message);
    } finally {
      this.showLoading(false);
    }
  }

  generateEvents() {
    this.events = [];

    console.log('Generating events from tournaments:', this.tournaments.length);

    this.tournaments.forEach(tournament => {
      try {
        const events = this.extractTournamentEvents(tournament);
        console.log(`Generated ${events.length} events for tournament: ${tournament.title}`);
        this.events.push(...events);
      } catch (error) {
        console.error(`Error generating events for tournament ${tournament.title}:`, error);
      }
    });

    // Sort events by date
    this.events.sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log('Total events generated:', this.events.length);

    // Development fallback removed - only show actual events from tournaments
  }



  extractTournamentEvents(tournament) {
    const events = [];
    const now = new Date();

    // Only extract events from tournaments that have proper data
    if (!tournament || !tournament._id || !tournament.title) {
      console.warn('Invalid tournament data:', tournament);
      return events;
    }

    // Registration Open Event
    if (tournament.registrationStart) {
      try {
        const regStartDate = new Date(tournament.registrationStart);
        if (!isNaN(regStartDate.getTime())) {
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
      } catch (error) {
        console.warn('Invalid registrationStart date for tournament:', tournament.title, tournament.registrationStart);
      }
    }

    // Registration Close Event
    if (tournament.registrationEnd) {
      try {
        const regEndDate = new Date(tournament.registrationEnd);
        if (!isNaN(regEndDate.getTime())) {
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
      } catch (error) {
        console.warn('Invalid registrationEnd date for tournament:', tournament.title, tournament.registrationEnd);
      }
    }

    // Tournament Start Event
    if (tournament.tournamentStart || tournament.startDate) {
      try {
        const startDate = new Date(tournament.tournamentStart || tournament.startDate);
        if (!isNaN(startDate.getTime())) {
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
      } catch (error) {
        console.warn('Invalid tournament start date for tournament:', tournament.title, tournament.tournamentStart || tournament.startDate);
      }
    }

    // Finals Event (Tournament End Date shown as Finals)
    if (tournament.tournamentEnd || tournament.endDate) {
      try {
        const finalsDate = new Date(tournament.tournamentEnd || tournament.endDate);
        if (!isNaN(finalsDate.getTime())) {
          events.push({
            id: `${tournament._id}-finals`,
            tournamentId: tournament._id,
            tournamentTitle: tournament.title,
            type: 'finals',
            title: 'Finals',
            description: `Championship finals for ${tournament.title}`,
            date: finalsDate,
            time: this.formatTime(finalsDate),
            status: finalsDate <= now ? 'completed' : 'upcoming',
            icon: 'fas fa-trophy',
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/20',
            priority: 1
          });
        }
      } catch (error) {
        console.warn('Invalid tournament end date for tournament:', tournament.title, tournament.tournamentEnd || tournament.endDate);
      }
    }

    // Additional Finals Event (if tournament has specific separate finals date)
    if (tournament.finalsDate && tournament.finalsDate !== tournament.tournamentEnd && tournament.finalsDate !== tournament.endDate) {
      const specificFinalsDate = new Date(tournament.finalsDate);
      events.push({
        id: `${tournament._id}-specific-finals`,
        tournamentId: tournament._id,
        tournamentTitle: tournament.title,
        type: 'finals',
        title: 'Championship Finals',
        description: `Special championship finals for ${tournament.title}`,
        date: specificFinalsDate,
        time: this.formatTime(specificFinalsDate),
        status: specificFinalsDate <= now ? 'completed' : 'upcoming',
        icon: 'fas fa-crown',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        priority: 1
      });
    }

    // Bracket Generation Event (day before tournament starts) - only for tournaments that need brackets
    const tournamentStartDate = tournament.tournamentStart || tournament.startDate;
    if (tournamentStartDate && (tournament.status === 'registration_open' || tournament.status === 'registration_closed')) {
      const bracketDate = new Date(tournamentStartDate);
      bracketDate.setDate(bracketDate.getDate() - 1);
      bracketDate.setHours(18, 0, 0, 0); // 6 PM day before

      if (bracketDate > now || (bracketDate <= now && bracketDate.toDateString() === now.toDateString())) {
        events.push({
          id: `${tournament._id}-brackets`,
          tournamentId: tournament._id,
          tournamentTitle: tournament.title,
          type: 'bracket_generation',
          title: 'Brackets Generated',
          description: `Tournament brackets will be finalized for ${tournament.title}`,
          date: bracketDate,
          time: this.formatTime(bracketDate),
          status: bracketDate <= now ? 'completed' : 'upcoming',
          icon: 'fas fa-sitemap',
          color: 'text-cyber-indigo',
          bgColor: 'bg-cyber-indigo/20',
          priority: 4
        });
      }
    }

    // Check for custom events in both possible field names for backward compatibility
    const customEvents = tournament.scheduleEvents || tournament.events || [];

    if (customEvents.length > 0) {
      customEvents.forEach(customEvent => {
        try {
          let eventDate;
          let title;

          // Handle new format (scheduleEvents with separate date/time)
          if (customEvent.title && customEvent.date && customEvent.time) {
            const dateTimeStr = `${customEvent.date}T${customEvent.time}`;
            eventDate = new Date(dateTimeStr);
            title = customEvent.title;
          }
          // Handle old format (events with combined dateTime)
          else if (customEvent.name && customEvent.dateTime) {
            eventDate = new Date(customEvent.dateTime);
            title = customEvent.name;
          }
          else {
            return; // Skip invalid events
          }

          if (!isNaN(eventDate.getTime())) {
            events.push({
              id: `${tournament._id}-custom-${title.toLowerCase().replace(/\s+/g, '-')}`,
              tournamentId: tournament._id,
              tournamentTitle: tournament.title,
              type: 'custom_event',
              title: title,
              description: customEvent.description || `${title} for ${tournament.title}`,
              date: eventDate,
              time: this.formatTime(eventDate),
              status: eventDate <= now ? 'completed' : 'upcoming',
              icon: 'fas fa-calendar-check',
              color: 'text-purple-400',
              bgColor: 'bg-purple-500/20',
              priority: 2
            });
          }
        } catch (error) {
          console.warn('Invalid custom event date for tournament:', tournament.title, customEvent);
        }
      });
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
      empty.classList.add('hidden');
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

  isDataStale() {
    if (!this.lastDataLoad) return true;
    return (Date.now() - this.lastDataLoad) > this.dataStaleThreshold;
  }

  async refreshScheduleData() {
    console.log('Refreshing schedule data...');

    // Show a brief refresh indicator
    const timeline = document.getElementById('schedule-timeline');
    if (timeline) {
      const refreshIndicator = document.createElement('div');
      refreshIndicator.className = 'fixed top-4 right-4 bg-cyber-cyan text-dark-matter px-4 py-2 rounded-lg font-medium z-50 animate-fade-in';
      refreshIndicator.innerHTML = '<i class="fas fa-sync-alt fa-spin mr-2"></i>Refreshing schedule...';
      document.body.appendChild(refreshIndicator);

      setTimeout(() => {
        if (refreshIndicator.parentNode) {
          refreshIndicator.remove();
        }
      }, 2000);
    }

    await this.loadScheduleData(true);
  }

  destroy() {
    // Clean up event listeners
    if (window.dataUpdateNotifier && this.tournamentUpdateListener) {
      window.dataUpdateNotifier.off('tournament-updated', this.tournamentUpdateListener);
      window.dataUpdateNotifier.off('tournament-created', this.tournamentUpdateListener);
      window.dataUpdateNotifier.off('tournament-deleted', this.tournamentUpdateListener);
    }

    this.tournaments = [];
    this.events = [];
  }
}

window.ScheduleManagement = ScheduleManagement;