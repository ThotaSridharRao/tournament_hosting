/**
 * Notifications Panel Component
 * Handles notification display, filtering, and management
 */

class NotificationsPanel {
  constructor() {
    this.notifications = [];
    this.filters = {
      all: true,
      approval: false,
      payment: false,
      message: false,
      system: false
    };
    this.isVisible = false;
  }

  /**
   * Initialize the notifications panel
   */
  async init() {
    try {
      await this.loadNotifications();
      this.createNotificationButton();
      this.createNotificationPanel();
      this.bindEvents();
    } catch (error) {
      console.error('Failed to initialize notifications panel:', error);
    }
  }

  /**
   * Load notifications from API
   */
  async loadNotifications() {
    try {
      // In real implementation, this would use apiClient.getNotifications()
      // For now, using mock data
      this.notifications = [
        {
          id: 1,
          type: 'approval',
          title: 'Tournament Approval Pending',
          message: 'Your "Valorant Championship" tournament is pending admin approval.',
          time: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
          read: false,
          priority: 'high'
        },
        {
          id: 2,
          type: 'payment',
          title: 'Payment Received',
          message: 'Received $25 entry fee from player "ProGamer123".',
          time: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          read: false,
          priority: 'medium'
        },
        {
          id: 3,
          type: 'message',
          title: 'New Message',
          message: 'Player "SkillzMaster" sent you a message about tournament rules.',
          time: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          read: false,
          priority: 'medium'
        },
        {
          id: 4,
          type: 'system',
          title: 'Tournament Started',
          message: 'Your "CS:GO Weekly" tournament has started successfully.',
          time: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          read: true,
          priority: 'low'
        },
        {
          id: 5,
          type: 'approval',
          title: 'Participant Approved',
          message: 'You approved "ElitePlayer" for "Apex Legends Cup".',
          time: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          read: true,
          priority: 'low'
        }
      ];
    } catch (error) {
      console.error('Failed to load notifications:', error);
      this.notifications = [];
    }
  }

  /**
   * Create notification button in header
   */
  createNotificationButton() {
    const existingButton = document.querySelector('.notification-btn');
    if (existingButton) {
      existingButton.remove();
    }

    const headerActions = document.querySelector('.flex.items-center.space-x-4');
    if (!headerActions) return;

    const unreadCount = this.getUnreadCount();
    const button = document.createElement('button');
    button.className = 'notification-btn relative p-2 rounded-lg hover:bg-cyber-cyan/10 transition-colors';
    button.innerHTML = `
      <i class="fas fa-bell text-starlight-muted hover:text-cyber-cyan transition-colors"></i>
      ${unreadCount > 0 ? `<span class="absolute -top-1 -right-1 w-5 h-5 bg-cyber-cyan text-dark-matter text-xs rounded-full flex items-center justify-center font-semibold">${unreadCount > 9 ? '9+' : unreadCount}</span>` : ''}
    `;

    // Insert before the "New Tournament" button
    const newTournamentBtn = headerActions.querySelector('button:last-child');
    headerActions.insertBefore(button, newTournamentBtn);

    button.addEventListener('click', () => this.togglePanel());
  }

  /**
   * Create notification panel
   */
  createNotificationPanel() {
    // Remove existing panel
    const existingPanel = document.getElementById('notifications-panel');
    if (existingPanel) {
      existingPanel.remove();
    }

    const panel = document.createElement('div');
    panel.id = 'notifications-panel';
    panel.className = 'fixed top-16 right-4 w-96 max-w-[calc(100vw-2rem)] glass-card z-50 transform translate-x-full transition-transform duration-300 max-h-[80vh] flex flex-col';
    
    panel.innerHTML = `
      <div class="flex items-center justify-between p-4 border-b border-cyber-border">
        <h3 class="text-lg font-semibold text-starlight">Notifications</h3>
        <div class="flex items-center space-x-2">
          <button class="mark-all-read-btn text-xs text-cyber-cyan hover:text-cyber-cyan/80 transition-colors">
            Mark all read
          </button>
          <button class="close-panel-btn w-8 h-8 flex items-center justify-center rounded-lg text-starlight-muted hover:text-starlight hover:bg-dark-matter/50 transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div class="notification-filters p-4 border-b border-cyber-border">
        <div class="flex flex-wrap gap-2">
          <button class="filter-btn active" data-filter="all">All</button>
          <button class="filter-btn" data-filter="approval">Approvals</button>
          <button class="filter-btn" data-filter="payment">Payments</button>
          <button class="filter-btn" data-filter="message">Messages</button>
          <button class="filter-btn" data-filter="system">System</button>
        </div>
      </div>
      
      <div class="notification-list flex-1 overflow-y-auto">
        ${this.renderNotifications()}
      </div>
      
      <div class="p-4 border-t border-cyber-border">
        <button class="w-full text-center text-sm text-cyber-cyan hover:text-cyber-cyan/80 transition-colors">
          View All Notifications
        </button>
      </div>
    `;

    document.body.appendChild(panel);
    this.bindPanelEvents();
  }

  /**
   * Render notifications list
   */
  renderNotifications() {
    const filteredNotifications = this.getFilteredNotifications();
    
    if (filteredNotifications.length === 0) {
      return `
        <div class="p-8 text-center">
          <i class="fas fa-bell-slash text-4xl text-starlight-muted mb-3"></i>
          <p class="text-starlight-muted">No notifications found</p>
        </div>
      `;
    }

    return filteredNotifications.map(notification => `
      <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}" data-type="${notification.type}">
        <div class="flex items-start space-x-3 p-4 hover:bg-dark-matter/20 transition-colors cursor-pointer">
          <div class="notification-icon w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${this.getNotificationIconBg(notification.type)}">
            <i class="fas fa-${this.getNotificationIcon(notification.type)} ${this.getNotificationIconColor(notification.type)} text-sm"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="font-medium text-starlight text-sm ${!notification.read ? 'font-semibold' : ''}">${notification.title}</p>
                <p class="text-sm text-starlight-muted mt-1 line-clamp-2">${notification.message}</p>
                <p class="text-xs text-starlight-muted mt-2">${this.formatTime(notification.time)}</p>
              </div>
              <div class="flex items-center space-x-2 ml-2">
                ${this.getPriorityIndicator(notification.priority)}
                ${!notification.read ? '<div class="w-2 h-2 bg-cyber-cyan rounded-full"></div>' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Get filtered notifications based on current filter
   */
  getFilteredNotifications() {
    if (this.filters.all) {
      return this.notifications;
    }

    return this.notifications.filter(notification => 
      this.filters[notification.type]
    );
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Toggle notification panel visibility
   */
  togglePanel() {
    const panel = document.getElementById('notifications-panel');
    if (!panel) return;

    this.isVisible = !this.isVisible;
    
    if (this.isVisible) {
      panel.classList.remove('translate-x-full');
      panel.classList.add('translate-x-0');
      document.addEventListener('click', this.handleOutsideClick.bind(this));
    } else {
      panel.classList.add('translate-x-full');
      panel.classList.remove('translate-x-0');
      document.removeEventListener('click', this.handleOutsideClick.bind(this));
    }
  }

  /**
   * Handle clicks outside the panel
   */
  handleOutsideClick(event) {
    const panel = document.getElementById('notifications-panel');
    const button = document.querySelector('.notification-btn');
    
    if (panel && !panel.contains(event.target) && !button.contains(event.target)) {
      this.togglePanel();
    }
  }

  /**
   * Bind panel events
   */
  bindPanelEvents() {
    const panel = document.getElementById('notifications-panel');
    if (!panel) return;

    // Close button
    panel.querySelector('.close-panel-btn').addEventListener('click', () => {
      this.togglePanel();
    });

    // Mark all read button
    panel.querySelector('.mark-all-read-btn').addEventListener('click', () => {
      this.markAllAsRead();
    });

    // Filter buttons
    panel.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setFilter(e.target.dataset.filter);
      });
    });

    // Notification items
    panel.addEventListener('click', (e) => {
      const notificationItem = e.target.closest('.notification-item');
      if (notificationItem) {
        const notificationId = parseInt(notificationItem.dataset.id);
        this.markAsRead(notificationId);
        this.handleNotificationClick(notificationId);
      }
    });
  }

  /**
   * Set active filter
   */
  setFilter(filter) {
    // Reset all filters
    Object.keys(this.filters).forEach(key => {
      this.filters[key] = false;
    });
    
    // Set active filter
    this.filters[filter] = true;

    // Update filter buttons
    const panel = document.getElementById('notifications-panel');
    panel.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.filter === filter) {
        btn.classList.add('active');
      }
    });

    // Re-render notifications
    const notificationList = panel.querySelector('.notification-list');
    notificationList.innerHTML = this.renderNotifications();
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        notification.read = true;
        
        // In real implementation, call API
        // await apiClient.markNotificationRead(notificationId);
        
        this.updateNotificationButton();
        this.updateNotificationItem(notificationId);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      this.notifications.forEach(notification => {
        notification.read = true;
      });
      
      // In real implementation, call API
      // await apiClient.markAllNotificationsRead();
      
      this.updateNotificationButton();
      this.refreshPanel();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  /**
   * Handle notification click
   */
  handleNotificationClick(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) return;

    // Handle different notification types
    switch (notification.type) {
      case 'approval':
        // Navigate to tournaments section
        if (window.dashboardState) {
          window.dashboardState.setCurrentSection('tournaments');
          loadSectionContent('tournaments');
        }
        break;
      case 'payment':
        // Navigate to wallet section
        if (window.dashboardState) {
          window.dashboardState.setCurrentSection('wallet');
          loadSectionContent('wallet');
        }
        break;
      case 'message':
        // Open messages or navigate to communication
        console.log('Opening message:', notification.message);
        break;
      case 'system':
        // Handle system notifications
        console.log('System notification:', notification.message);
        break;
    }

    this.togglePanel();
  }

  /**
   * Update notification button
   */
  updateNotificationButton() {
    const button = document.querySelector('.notification-btn');
    if (!button) return;

    const unreadCount = this.getUnreadCount();
    const badge = button.querySelector('span');
    
    if (unreadCount > 0) {
      if (badge) {
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      } else {
        const newBadge = document.createElement('span');
        newBadge.className = 'absolute -top-1 -right-1 w-5 h-5 bg-cyber-cyan text-dark-matter text-xs rounded-full flex items-center justify-center font-semibold';
        newBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        button.appendChild(newBadge);
      }
    } else {
      if (badge) {
        badge.remove();
      }
    }
  }

  /**
   * Update notification item appearance
   */
  updateNotificationItem(notificationId) {
    const panel = document.getElementById('notifications-panel');
    if (!panel) return;

    const item = panel.querySelector(`[data-id="${notificationId}"]`);
    if (item) {
      item.classList.remove('unread');
      item.classList.add('read');
      
      const unreadDot = item.querySelector('.w-2.h-2.bg-cyber-cyan');
      if (unreadDot) {
        unreadDot.remove();
      }
      
      const title = item.querySelector('.font-semibold');
      if (title) {
        title.classList.remove('font-semibold');
      }
    }
  }

  /**
   * Refresh the entire panel
   */
  refreshPanel() {
    if (this.isVisible) {
      const notificationList = document.getElementById('notifications-panel')?.querySelector('.notification-list');
      if (notificationList) {
        notificationList.innerHTML = this.renderNotifications();
      }
    }
  }

  /**
   * Bind global events
   */
  bindEvents() {
    // Listen for new notifications (would be WebSocket in real implementation)
    // For demo, we'll simulate new notifications
    setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every interval
        this.simulateNewNotification();
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Simulate new notification (for demo purposes)
   */
  simulateNewNotification() {
    const types = ['approval', 'payment', 'message', 'system'];
    const messages = {
      approval: ['New tournament pending approval', 'Participant approval required'],
      payment: ['Payment received', 'Withdrawal processed'],
      message: ['New message from participant', 'Tournament inquiry received'],
      system: ['Tournament started', 'System maintenance scheduled']
    };

    const type = types[Math.floor(Math.random() * types.length)];
    const typeMessages = messages[type];
    const message = typeMessages[Math.floor(Math.random() * typeMessages.length)];

    const newNotification = {
      id: Date.now(),
      type,
      title: message,
      message: `${message}. Click to view details.`,
      time: new Date(),
      read: false,
      priority: 'medium'
    };

    this.notifications.unshift(newNotification);
    this.updateNotificationButton();
    
    if (this.isVisible) {
      this.refreshPanel();
    }

    // Show toast notification
    this.showToast(newNotification);
  }

  /**
   * Show toast notification
   */
  showToast(notification) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 z-50 max-w-sm w-full glass-card p-4 transform translate-x-full transition-transform duration-300';
    
    toast.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${this.getNotificationIconBg(notification.type)}">
          <i class="fas fa-${this.getNotificationIcon(notification.type)} ${this.getNotificationIconColor(notification.type)} text-sm"></i>
        </div>
        <div class="flex-1">
          <p class="font-medium text-starlight text-sm">${notification.title}</p>
          <p class="text-xs text-starlight-muted mt-1">${notification.message}</p>
        </div>
        <button class="text-starlight-muted hover:text-starlight">
          <i class="fas fa-times text-xs"></i>
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);

    // Auto hide after 5 seconds
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 5000);

    // Close button
    toast.querySelector('button').addEventListener('click', () => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        toast.remove();
      }, 300);
    });
  }

  /**
   * Helper methods
   */
  getNotificationIcon(type) {
    const icons = {
      approval: 'clock',
      payment: 'dollar-sign',
      message: 'envelope',
      system: 'cog'
    };
    return icons[type] || 'bell';
  }

  getNotificationIconColor(type) {
    const colors = {
      approval: 'text-yellow-400',
      payment: 'text-green-400',
      message: 'text-blue-400',
      system: 'text-purple-400'
    };
    return colors[type] || 'text-gray-400';
  }

  getNotificationIconBg(type) {
    const backgrounds = {
      approval: 'bg-yellow-500/20',
      payment: 'bg-green-500/20',
      message: 'bg-blue-500/20',
      system: 'bg-purple-500/20'
    };
    return backgrounds[type] || 'bg-gray-500/20';
  }

  getPriorityIndicator(priority) {
    const indicators = {
      high: '<i class="fas fa-exclamation text-red-400 text-xs"></i>',
      medium: '<i class="fas fa-circle text-yellow-400 text-xs"></i>',
      low: ''
    };
    return indicators[priority] || '';
  }

  formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  }

  /**
   * Cleanup method
   */
  destroy() {
    const panel = document.getElementById('notifications-panel');
    if (panel) {
      panel.remove();
    }
    
    const button = document.querySelector('.notification-btn');
    if (button) {
      button.remove();
    }
    
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  }
}

// Export for use in main dashboard
window.NotificationsPanel = NotificationsPanel;