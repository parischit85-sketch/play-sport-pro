// Lightweight smsService stub used by NotificationCascade
export const smsService = {
  async send(userId, { to, message, metadata }) {
    if (!to) {
      return { success: false, error: 'Missing phone number' };
    }
    if (!message) {
      return { success: false, error: 'Missing message' };
    }
    return Promise.resolve({
      success: true,
      userId,
      to,
      id: `sms_${Date.now()}`,
      metadata,
    });
  },
};

export default smsService;
