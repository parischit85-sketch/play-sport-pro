// Lightweight in-app notification service used by NotificationCascade
// Self-contained stub to avoid external module dependencies in tests

export const inAppNotificationService = {
  async send(userId, { title, body, icon, data, priority, timestamp }) {
    try {
      // Generate a synthetic ID and simulate success
      const id = `inapp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      // Optionally: store to an in-memory log in tests
      if (typeof globalThis !== 'undefined') {
        globalThis.__inAppNotifications = globalThis.__inAppNotifications || [];
        globalThis.__inAppNotifications.push({ userId, title, body, data, priority, timestamp, id });
      }
      return { success: true, id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};

export default inAppNotificationService;
