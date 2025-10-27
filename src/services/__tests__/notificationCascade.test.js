/**
 * Unit Tests - NotificationCascade
 * Test suite for multi-channel notification fallback system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { notificationCascade, NOTIFICATION_TYPES } from '../notificationCascade';

describe('NotificationCascade', () => {
  beforeEach(() => {
    notificationCascade.resetStats();
    vi.clearAllMocks();
  });

  describe('send()', () => {
    it('should send via push as first priority', async () => {
      const userId = 'user-123';
      const notification = {
        title: 'Test Notification',
        body: 'Test body'
      };

      // Mock push success
      vi.spyOn(notificationCascade, '_sendPush')
        .mockResolvedValue({ success: true, latency: 1500 });

      const result = await notificationCascade.send(userId, notification);

      expect(result.success).toBe(true);
      expect(result.channel).toBe('push');
      expect(result.attempts).toHaveLength(1);
      expect(result.cost).toBe(0); // Push is free
    });

    it('should fallback to email when push fails', async () => {
      const userId = 'user-456';
      const notification = {
        title: 'Test Fallback',
        body: 'Test email fallback'
      };

      // Mock push failure, email success
      vi.spyOn(notificationCascade, '_getUserPreferences')
        .mockResolvedValue(null);
      vi.spyOn(notificationCascade, '_sendPush')
        .mockResolvedValue({ success: false, error: '410 Gone' });
      vi.spyOn(notificationCascade, '_sendEmail')
        .mockResolvedValue({ success: true, latency: 2300 });

      const result = await notificationCascade.send(userId, notification, {
        channels: ['push', 'email'],
      });

      expect(result.success).toBe(true);
      expect(result.channel).toBe('email');
      expect(result.attempts).toHaveLength(2);
      expect(result.attempts[0].channel).toBe('push');
      expect(result.attempts[0].success).toBe(false);
      expect(result.attempts[1].channel).toBe('email');
      expect(result.attempts[1].success).toBe(true);
      expect(result.cost).toBe(0.0001); // Email cost
    });

    it('should try all channels in cascade until success', async () => {
      const userId = 'user-789';
      const notification = {
        title: 'Test Full Cascade',
        body: 'Testing all channels'
      };

      // Mock push and email failure, SMS success
      vi.spyOn(notificationCascade, '_sendPush')
        .mockResolvedValue({ success: false, error: 'Push failed' });
      vi.spyOn(notificationCascade, '_sendEmail')
        .mockResolvedValue({ success: false, error: 'Email failed' });
      vi.spyOn(notificationCascade, '_sendSMS')
        .mockResolvedValue({ success: true, latency: 3100 });

      const result = await notificationCascade.send(userId, notification, {
        channels: ['push', 'email', 'sms']
      });

      expect(result.success).toBe(true);
      expect(result.channel).toBe('sms');
      expect(result.attempts).toHaveLength(3);
      expect(result.cost).toBe(0.05); // SMS cost
    });

    it('should fail if all channels fail', async () => {
      const userId = 'user-fail';
      const notification = {
        title: 'Test All Fail',
        body: 'All channels should fail'
      };

      // Mock all channels failing
      vi.spyOn(notificationCascade, '_sendPush')
        .mockResolvedValue({ success: false, error: 'Push failed' });
      vi.spyOn(notificationCascade, '_sendEmail')
        .mockResolvedValue({ success: false, error: 'Email failed' });
      vi.spyOn(notificationCascade, '_sendSMS')
        .mockResolvedValue({ success: false, error: 'SMS failed' });
      vi.spyOn(notificationCascade, '_sendInApp')
        .mockResolvedValue({ success: false, error: 'In-app failed' });

      const result = await notificationCascade.send(userId, notification, {
        channels: ['push', 'email', 'sms', 'in-app']
      });

      expect(result.success).toBe(false);
      expect(result.attempts).toHaveLength(4);
      expect(result.attempts.every(a => !a.success)).toBe(true);
    });

    it('should respect user preferences', async () => {
      const userId = 'user-prefs';
      const notification = {
        title: 'Test Preferences',
        body: 'Testing user preferences'
      };

      // Mock user preferences: email disabled
      vi.spyOn(notificationCascade, '_getUserPreferences')
        .mockResolvedValue({
          pushEnabled: true,
          emailEnabled: false,
          smsEnabled: true
        });

      vi.spyOn(notificationCascade, '_sendPush')
        .mockResolvedValue({ success: false, error: 'Push failed' });
      vi.spyOn(notificationCascade, '_sendSMS')
        .mockResolvedValue({ success: true, latency: 2800 });

      const result = await notificationCascade.send(userId, notification, {
        channels: ['push', 'email', 'sms'],
        respectUserPreferences: true
      });

      expect(result.success).toBe(true);
      expect(result.channel).toBe('sms');
      // Should skip email due to user preferences
      expect(result.attempts.find(a => a.channel === 'email')).toBeUndefined();
    });

    it('should respect maxCost threshold', async () => {
      const userId = 'user-cost';
      const notification = {
        title: 'Test Cost Limit',
        body: 'Testing cost threshold'
      };

      vi.spyOn(notificationCascade, '_getUserPreferences')
        .mockResolvedValue(null);
      vi.spyOn(notificationCascade, '_sendPush')
        .mockResolvedValue({ success: false, error: 'Push failed' });
      vi.spyOn(notificationCascade, '_sendEmail')
        .mockResolvedValue({ success: true, latency: 2100 });

      const result = await notificationCascade.send(userId, notification, {
        channels: ['push', 'email', 'sms'],
        maxCost: 0.01, // Max 1 cent (should skip SMS at €0.05)
      });

      expect(result.success).toBe(true);
      expect(result.channel).toBe('email');
      expect(result.cost).toBeLessThanOrEqual(0.01);
      // Should not attempt SMS due to cost limit
      expect(result.attempts.find(a => a.channel === 'sms')).toBeUndefined();
    });
  });

  describe('Type-Specific Routing', () => {
    it('should include SMS for PAYMENT_DUE', async () => {
      const userId = 'user-payment';
      const notification = {
        title: 'Payment Due',
        body: 'Your payment is due tomorrow'
      };

      vi.spyOn(notificationCascade, '_sendPush')
        .mockResolvedValue({ success: false, error: 'Failed' });
      vi.spyOn(notificationCascade, '_sendEmail')
        .mockResolvedValue({ success: false, error: 'Failed' });
      vi.spyOn(notificationCascade, '_sendSMS')
        .mockResolvedValue({ success: true, latency: 3200 });

      const result = await notificationCascade.send(userId, notification, {
        type: NOTIFICATION_TYPES.PAYMENT_DUE
      });

      expect(result.success).toBe(true);
      expect(result.channel).toBe('sms');
      // PAYMENT_DUE should automatically include SMS
    });

    it('should use push+email only for PROMOTIONAL', async () => {
      const userId = 'user-promo';
      const notification = {
        title: 'Flash Sale!',
        body: '50% off today only'
      };

      vi.spyOn(notificationCascade, '_sendPush')
        .mockResolvedValue({ success: true, latency: 1800 });

      const result = await notificationCascade.send(userId, notification, {
        type: NOTIFICATION_TYPES.PROMOTIONAL
      });

      expect(result.success).toBe(true);
      expect(result.channel).toBe('push');
      // PROMOTIONAL should NOT include SMS by default
    });

    it('should prioritize push+email for BOOKING_CONFIRMED', async () => {
      const userId = 'user-booking';
      const notification = {
        title: 'Booking Confirmed',
        body: 'Your court is booked for tomorrow 10:00 AM'
      };

      vi.spyOn(notificationCascade, '_sendPush')
        .mockResolvedValue({ success: true, latency: 1600 });

      const result = await notificationCascade.send(userId, notification, {
        type: NOTIFICATION_TYPES.BOOKING_CONFIRMED
      });

      expect(result.success).toBe(true);
      expect(result.channel).toBe('push');
    });
  });

  describe('getStats()', () => {
    it('should return correct statistics', async () => {
      const notification = { title: 'Test', body: 'Test' };

      // Send multiple notifications
      vi.spyOn(notificationCascade, '_sendPush')
        .mockResolvedValue({ success: true, latency: 1500 });

      for (let i = 0; i < 10; i++) {
        await notificationCascade.send(`user-${i}`, notification);
      }

      const stats = notificationCascade.getStats();

      expect(stats.total).toBe(10);
      expect(stats.succeeded).toBe(10);
      expect(stats.failed).toBe(0);
      expect(stats.successRate).toBe('100.00%');
      expect(stats.totalCost).toBe(0); // All push (free)
    });

    it('should calculate channel efficiency correctly', async () => {
      const notification = { title: 'Test', body: 'Test' };

      // Mock various channel results
      vi.spyOn(notificationCascade, '_sendPush')
        .mockResolvedValueOnce({ success: true, latency: 1500 })
        .mockResolvedValueOnce({ success: false, error: 'Failed' })
        .mockResolvedValueOnce({ success: true, latency: 1600 });

      vi.spyOn(notificationCascade, '_sendEmail')
        .mockResolvedValue({ success: true, latency: 2300 });

      // First notification: push success
      await notificationCascade.send('user-1', notification, {
        channels: ['push', 'email']
      });

      // Second notification: push fails, email succeeds
      await notificationCascade.send('user-2', notification, {
        channels: ['push', 'email']
      });

      const stats = notificationCascade.getStats();

      expect(stats.channelEfficiency).toBeDefined();
      expect(stats.channelEfficiency.length).toBeGreaterThan(0);

      const pushStats = stats.channelEfficiency.find(c => c.channel === 'push');
      const emailStats = stats.channelEfficiency.find(c => c.channel === 'email');

      expect(pushStats).toBeDefined();
      expect(emailStats).toBeDefined();
    });

    it('should track total cost accurately', async () => {
      const notification = { title: 'Test', body: 'Test' };

      // Mock cascade with different channels
      vi.spyOn(notificationCascade, '_getUserPreferences')
        .mockResolvedValue(null);
      vi.spyOn(notificationCascade, '_sendPush')
        .mockResolvedValue({ success: false, error: 'Failed' });
      vi.spyOn(notificationCascade, '_sendEmail')
        .mockResolvedValueOnce({ success: true, latency: 2300 })
        .mockResolvedValueOnce({ success: false, error: 'Failed' });
      vi.spyOn(notificationCascade, '_sendSMS')
        .mockResolvedValue({ success: true, latency: 3100 });

      // First: falls back to email (€0.0001)
      await notificationCascade.send('user-1', notification, {
        channels: ['push', 'email', 'sms'],
      });

      // Second: falls back to SMS (€0.05)
      await notificationCascade.send('user-2', notification, {
        channels: ['push', 'email', 'sms'],
      });

      const stats = notificationCascade.getStats();

      expect(stats.totalCost).toBeCloseTo(0.0501, 4); // 0.0001 + 0.05
      expect(stats.averageCost).toBeCloseTo(0.02505, 4); // Average of 2
    });
  });

  describe('Error Handling', () => {
    it('should handle channel timeout gracefully', async () => {
      const userId = 'user-timeout';
      const notification = { title: 'Test Timeout', body: 'Test' };

      const timeoutError = new Error('ETIMEDOUT');
      timeoutError.code = 'ETIMEDOUT';

      vi.spyOn(notificationCascade, '_sendPush')
        .mockRejectedValue(timeoutError);
      vi.spyOn(notificationCascade, '_sendEmail')
        .mockResolvedValue({ success: true, latency: 2200 });

      const result = await notificationCascade.send(userId, notification, {
        channels: ['push', 'email']
      });

      expect(result.success).toBe(true);
      expect(result.channel).toBe('email');
      expect(result.attempts[0].error).toContain('timeout');
    });

    it('should handle invalid user ID', async () => {
      const notification = { title: 'Test', body: 'Test' };

      const result = await notificationCascade.send(null, notification);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle missing notification data', async () => {
      const result = await notificationCascade.send('user-123', null);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should handle concurrent sends', async () => {
      const notification = { title: 'Test Concurrent', body: 'Test' };

      vi.spyOn(notificationCascade, '_sendPush')
        .mockResolvedValue({ success: true, latency: 1500 });

      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(notificationCascade.send(`user-${i}`, notification));
      }

      const results = await Promise.all(promises);

      expect(results.length).toBe(50);
      expect(results.every(r => r.success)).toBe(true);
    });

    it('should complete cascade quickly', async () => {
      const notification = { title: 'Test Speed', body: 'Test' };

      vi.spyOn(notificationCascade, '_sendPush')
        .mockResolvedValue({ success: true, latency: 1500 });

      const startTime = Date.now();
      await notificationCascade.send('user-123', notification);
      const duration = Date.now() - startTime;

      // Should complete in under 3 seconds for single channel
      expect(duration).toBeLessThan(3000);
    });
  });

  describe('Integration', () => {
    it('should log delivery to Firestore', async () => {
      // This would require Firestore emulator
      // Covered in integration tests
    });

    it('should track analytics events', async () => {
      // This would require analytics mock
      // Covered in integration tests
    });
  });
});

describe('Channel Cost Calculation', () => {
  it('should calculate push cost correctly', () => {
    const { calculateChannelCost } = require('../notificationCascade');
    
    const cost = calculateChannelCost('push');
    expect(cost).toBe(0);
  });

  it('should calculate email cost correctly', () => {
    const { calculateChannelCost } = require('../notificationCascade');
    
    const cost = calculateChannelCost('email');
    expect(cost).toBe(0.0001);
  });

  it('should calculate SMS cost correctly', () => {
    const { calculateChannelCost } = require('../notificationCascade');
    
    const cost = calculateChannelCost('sms');
    expect(cost).toBe(0.05);
  });

  it('should calculate in-app cost correctly', () => {
    const { calculateChannelCost } = require('../notificationCascade');
    
    const cost = calculateChannelCost('in-app');
    expect(cost).toBe(0);
  });
});
