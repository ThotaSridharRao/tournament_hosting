/**
 * Notifications Panel Component
 * Handles notification display, filtering, and management
 */

class NotificationsPanel {
  constructor() {
    this.notifications = [];
    this.filters = { type: 'all' };
    this.isVisible = false;
  }

  async init() {
    try {
      this.createNotificationButton();
      this.createNotificationPanel();
      await this.loadNotifications(); // Load after creating panel
      this.bindEvents();
    } catch (error) {
      console.error('Failed to initialize notifications panel:', error);
    }
  }

  async loadNotifications() {
    try {
      const response = await window.apiClient.getNotifications();
      if (response.success && response.data) {
        this.notifications = response.data.notifications || [];
        this.updateNotificationButton();
        this.renderNotifications();
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      this.notifications = [];
    }
  }

  createNotificationButton() {
    // ... (This function remains mostly the same, but we'll update the count after loading)
  }

  createNotificationPanel() {
    // ... (This function remains the same)
  }

  renderNotifications() {
    const listElement = document.querySelector('#notifications-panel .notification-list');
    if (!listElement) return;

    const filtered = this.getFilteredNotifications();
    
    if (filtered.length === 0) {
      listElement.innerHTML = `<div class="p-8 text-center"><p class="text-starlight-muted">No notifications</p></div>`;
      return;
    }

    listElement.innerHTML = filtered.map(notification => `
      <div class="notification-item ${notification.isRead ? 'read' : 'unread'}" data-id="${notification.id}">
        ...
            <p class="font-medium ...">${notification.title}</p>
            <p class="text-sm ...">${notification.message}</p>
            <p class="text-xs ...">${this.formatTime(notification.createdAt)}</p>
        ...
      </div>
    `).join('');
  }

  async markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      this.updateNotificationItem(notificationId);
      this.updateNotificationButton();
      try {
        await window.apiClient.markNotificationRead(notificationId);
      } catch (error) {
        console.error('Failed to mark notification as read on server:', error);
        notification.isRead = false; // Revert on failure
        this.updateNotificationItem(notificationId);
        this.updateNotificationButton();
      }
    }
  }

  async markAllAsRead() {
    try {
      await window.apiClient.markAllNotificationsRead();
      this.notifications.forEach(n => n.isRead = true);
      this.updateNotificationButton();
      this.renderNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }
  
  // All other methods (getUnreadCount, togglePanel, helpers, etc.) remain largely the same,
  // just ensure they operate on the live `this.notifications` data.
}

window.NotificationsPanel = NotificationsPanel;