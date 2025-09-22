// src/services/notificationService.ts

/**
 * Service for handling notifications
 */
class NotificationService {
  /**
   * Show success notification
   */
  static showSuccess(message: string): void {
    // In a real implementation, this would integrate with a notification library
    console.log(`SUCCESS: ${message}`);
  }

  /**
   * Show error notification
   */
  static showError(message: string): void {
    // In a real implementation, this would integrate with a notification library
    console.error(`ERROR: ${message}`);
  }

  /**
   * Show warning notification
   */
  static showWarning(message: string): void {
    // In a real implementation, this would integrate with a notification library
    console.warn(`WARNING: ${message}`);
  }

  /**
   * Show info notification
   */
  static showInfo(message: string): void {
    // In a real implementation, this would integrate with a notification library
    console.info(`INFO: ${message}`);
  }

  /**
   * Schedule a notification
   */
  static scheduleNotification(message: string, delayMs: number): void {
    setTimeout(() => {
      this.showInfo(message);
    }, delayMs);
  }

  /**
   * Request notification permissions (for browser notifications)
   */
  static async requestNotificationPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Show browser notification
   */
  static showBrowserNotification(title: string, options?: NotificationOptions): void {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, options);
      }
    }
  }
}

export default NotificationService;