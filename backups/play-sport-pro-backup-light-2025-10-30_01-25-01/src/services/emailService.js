// Lightweight emailService wrapper for NotificationCascade
// In app runtime, we don't send emails directly from the client.
// For tests and local usage, this stub simulates a successful send and can be
// swapped with a real implementation if needed.

export const emailService = {
  async send(userId, { to, subject, body, html, metadata }) {
    if (!to) {
      return { success: false, error: 'Missing recipient email' };
    }
    // Simulate async delivery
    return Promise.resolve({
      success: true,
      userId,
      to,
      subject,
      id: `email_${Date.now()}`,
      metadata,
    });
  },
};

export default emailService;
