/**
 * E2E Tests - Push Notifications System
 * Playwright end-to-end tests for notification flows
 * 
 * Run with: npx playwright test
 */

import { test, expect } from '@playwright/test';

test.describe('Push Notifications E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    
    // Login as test user
    await page.fill('[data-testid="email-input"]', 'test@playsportpro.com');
    await page.fill('[data-testid="password-input"]', 'test-password');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard
    await page.waitForSelector('[data-testid="dashboard"]');
  });

  test('should request push notification permission', async ({ page, context }) => {
    // Navigate to notification settings
    await page.click('[data-testid="settings-menu"]');
    await page.click('[data-testid="notifications-link"]');
    
    // Grant notification permission
    await context.grantPermissions(['notifications']);
    
    // Click enable push notifications
    await page.click('[data-testid="enable-push-button"]');
    
    // Wait for success message
    const successMessage = await page.waitForSelector('[data-testid="push-enabled-success"]');
    await expect(successMessage).toBeVisible();
    
    // Verify push toggle is enabled
    const pushToggle = await page.locator('[data-testid="push-toggle"]');
    await expect(pushToggle).toBeChecked();
  });

  test('should receive test notification', async ({ page, context }) => {
    // Grant notification permission
    await context.grantPermissions(['notifications']);
    
    // Navigate to notification settings
    await page.goto('/settings/notifications');
    
    // Enable push notifications
    await page.click('[data-testid="enable-push-button"]');
    await page.waitForSelector('[data-testid="push-enabled-success"]');
    
    // Send test notification
    await page.click('[data-testid="send-test-notification"]');
    
    // Wait for notification to be sent
    await page.waitForSelector('[data-testid="test-notification-sent"]');
    
    // Verify notification appears (in browser notification center)
    // Note: Browser notifications are hard to test directly
    // We verify the request was made successfully
    const notificationStatus = await page.locator('[data-testid="notification-status"]');
    await expect(notificationStatus).toHaveText(/sent successfully/i);
  });

  test('should show notification in analytics dashboard', async ({ page }) => {
    // Navigate to analytics dashboard
    await page.goto('/admin/notifications/analytics');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="analytics-dashboard"]');
    
    // Verify summary cards are visible
    await expect(page.locator('[data-testid="sent-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="delivered-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="clicked-count"]')).toBeVisible();
    
    // Verify charts are rendered
    await expect(page.locator('[data-testid="funnel-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="channel-chart"]')).toBeVisible();
    
    // Check that data is being displayed
    const sentCount = await page.locator('[data-testid="sent-count"]').textContent();
    expect(parseInt(sentCount || '0')).toBeGreaterThan(0);
  });

  test('should create user segment', async ({ page }) => {
    // Navigate to segments page
    await page.goto('/admin/notifications/segments');
    
    // Click create new segment
    await page.click('[data-testid="create-segment-button"]');
    
    // Fill segment details
    await page.fill('[data-testid="segment-name"]', 'E2E Test Segment');
    await page.fill('[data-testid="segment-description"]', 'Test segment for E2E tests');
    
    // Add filters
    await page.click('[data-testid="add-filter-button"]');
    await page.selectOption('[data-testid="filter-type"]', 'bookingCount');
    await page.fill('[data-testid="filter-value"]', '10');
    
    // Save segment
    await page.click('[data-testid="save-segment-button"]');
    
    // Verify segment was created
    await page.waitForSelector('[data-testid="segment-created-success"]');
    
    // Verify segment appears in list
    const segmentList = await page.locator('[data-testid="segment-list"]');
    await expect(segmentList).toContainText('E2E Test Segment');
  });

  test('should send notification to segment', async ({ page }) => {
    // Navigate to send notification page
    await page.goto('/admin/notifications/send');
    
    // Select segment
    await page.selectOption('[data-testid="recipient-segment"]', 'VIP Users');
    
    // Select template
    await page.selectOption('[data-testid="notification-template"]', 'PROMOTIONAL');
    
    // Fill notification details
    await page.fill('[data-testid="notification-title"]', 'Special Offer!');
    await page.fill('[data-testid="notification-body"]', '20% off for VIP members');
    
    // Select channels
    await page.check('[data-testid="channel-push"]');
    await page.check('[data-testid="channel-email"]');
    
    // Send notification
    await page.click('[data-testid="send-notification-button"]');
    
    // Verify confirmation
    await page.waitForSelector('[data-testid="notification-sent-success"]');
    
    // Check sent count
    const sentCount = await page.locator('[data-testid="sent-count"]').textContent();
    expect(parseInt(sentCount || '0')).toBeGreaterThan(0);
  });

  test('should schedule notification', async ({ page }) => {
    // Navigate to schedule page
    await page.goto('/admin/notifications/schedule');
    
    // Fill notification details
    await page.fill('[data-testid="notification-title"]', 'Scheduled Notification');
    await page.fill('[data-testid="notification-body"]', 'This is a scheduled message');
    
    // Set schedule time (tomorrow at 10 AM)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0);
    
    await page.fill('[data-testid="schedule-date"]', tomorrow.toISOString().split('T')[0]);
    await page.fill('[data-testid="schedule-time"]', '10:00');
    
    // Enable smart scheduling
    await page.check('[data-testid="smart-scheduling"]');
    
    // Save schedule
    await page.click('[data-testid="schedule-button"]');
    
    // Verify schedule created
    await page.waitForSelector('[data-testid="schedule-created-success"]');
    
    // Verify appears in scheduled list
    const scheduledList = await page.locator('[data-testid="scheduled-list"]');
    await expect(scheduledList).toContainText('Scheduled Notification');
  });

  test('should display notification templates', async ({ page }) => {
    // Navigate to templates page
    await page.goto('/admin/notifications/templates');
    
    // Verify templates are listed
    await expect(page.locator('[data-testid="template-CERTIFICATE_EXPIRING"]')).toBeVisible();
    await expect(page.locator('[data-testid="template-BOOKING_CONFIRMED"]')).toBeVisible();
    await expect(page.locator('[data-testid="template-PAYMENT_DUE"]')).toBeVisible();
    
    // Click on a template to view details
    await page.click('[data-testid="template-CERTIFICATE_EXPIRING"]');
    
    // Verify template details are shown
    await expect(page.locator('[data-testid="template-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="template-body"]')).toBeVisible();
    await expect(page.locator('[data-testid="template-preview"]')).toBeVisible();
  });

  test('should test template with variables', async ({ page }) => {
    // Navigate to templates page
    await page.goto('/admin/notifications/templates');
    
    // Select template
    await page.click('[data-testid="template-CERTIFICATE_EXPIRING"]');
    
    // Fill variable values
    await page.fill('[data-testid="var-daysLeft"]', '7');
    await page.fill('[data-testid="var-expiryDate"]', '2025-10-25');
    
    // Click preview
    await page.click('[data-testid="preview-button"]');
    
    // Verify preview renders correctly
    const preview = await page.locator('[data-testid="template-preview"]');
    await expect(preview).toContainText('7 giorni');
    await expect(preview).toContainText('2025-10-25');
  });

  test('should handle notification click', async ({ page, context }) => {
    // This test simulates clicking a notification
    // In real scenario, notification would be triggered externally
    
    // Grant notification permission
    await context.grantPermissions(['notifications']);
    
    // Navigate to a page that would trigger notification
    await page.goto('/certificates');
    
    // Wait for certificate expiring notification
    // (In real test, this would be triggered by backend)
    
    // Simulate notification click by navigating to deep link
    await page.goto('/certificates/renew?id=cert-123&from=notification');
    
    // Verify landing page
    await expect(page.locator('[data-testid="renew-certificate-page"]')).toBeVisible();
    
    // Verify notification click was tracked
    // (Would check analytics in backend)
  });

  test('should respect user notification preferences', async ({ page }) => {
    // Navigate to settings
    await page.goto('/settings/notifications');
    
    // Disable promotional notifications
    await page.uncheck('[data-testid="pref-promotional"]');
    
    // Disable social notifications
    await page.uncheck('[data-testid="pref-social"]');
    
    // Keep critical notifications enabled
    await expect(page.locator('[data-testid="pref-critical"]')).toBeChecked();
    
    // Save preferences
    await page.click('[data-testid="save-preferences"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="preferences-saved"]')).toBeVisible();
    
    // Reload page and verify preferences persisted
    await page.reload();
    await expect(page.locator('[data-testid="pref-promotional"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="pref-social"]')).not.toBeChecked();
    await expect(page.locator('[data-testid="pref-critical"]')).toBeChecked();
  });

  test('should show circuit breaker status', async ({ page }) => {
    // Navigate to system health page
    await page.goto('/admin/system/health');
    
    // Verify circuit breaker status is displayed
    const circuitStatus = await page.locator('[data-testid="circuit-breaker-status"]');
    await expect(circuitStatus).toBeVisible();
    
    // Should be CLOSED in healthy state
    await expect(circuitStatus).toContainText('CLOSED');
    
    // Verify metrics are displayed
    await expect(page.locator('[data-testid="delivery-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="p95-latency"]')).toBeVisible();
  });

  test('should export analytics data', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/admin/notifications/analytics');
    
    // Wait for data to load
    await page.waitForSelector('[data-testid="analytics-dashboard"]');
    
    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-csv"]');
    const download = await downloadPromise;
    
    // Verify file was downloaded
    expect(download.suggestedFilename()).toMatch(/analytics.*\.csv/);
    
    // Verify file contains data
    const path = await download.path();
    expect(path).toBeDefined();
  });

  test('should handle offline mode gracefully', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    
    // Try to send notification
    await page.goto('/admin/notifications/send');
    await page.fill('[data-testid="notification-title"]', 'Offline Test');
    await page.click('[data-testid="send-notification-button"]');
    
    // Should show offline error
    await expect(page.locator('[data-testid="offline-error"]')).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
    
    // Retry sending
    await page.click('[data-testid="send-notification-button"]');
    
    // Should succeed
    await expect(page.locator('[data-testid="notification-sent-success"]')).toBeVisible();
  });

  test('should auto-refresh analytics dashboard', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/admin/notifications/analytics');
    
    // Get initial sent count
    const initialCount = await page.locator('[data-testid="sent-count"]').textContent();
    
    // Wait for auto-refresh (30 seconds)
    await page.waitForTimeout(31000);
    
    // Count should be updated (or same if no new notifications)
    const updatedCount = await page.locator('[data-testid="sent-count"]').textContent();
    expect(updatedCount).toBeDefined();
    
    // Verify last update timestamp changed
    const lastUpdate = await page.locator('[data-testid="last-update"]').textContent();
    expect(lastUpdate).toMatch(/few seconds ago|just now/i);
  });

  test('should filter analytics by time range', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/admin/notifications/analytics');
    
    // Select 24h time range
    await page.selectOption('[data-testid="time-range"]', '1440');
    
    // Wait for data to reload
    await page.waitForTimeout(1000);
    
    // Verify data updated
    const periodLabel = await page.locator('[data-testid="period-label"]');
    await expect(periodLabel).toContainText('Last 24 hours');
    
    // Change to 1h
    await page.selectOption('[data-testid="time-range"]', '60');
    await page.waitForTimeout(1000);
    
    // Verify period changed
    await expect(periodLabel).toContainText('Last 60 minutes');
  });
});

test.describe('Mobile Notifications E2E', () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
  });

  test('should work on mobile devices', async ({ page, context }) => {
    await page.goto('/');
    
    // Login
    await page.fill('[data-testid="email-input"]', 'test@playsportpro.com');
    await page.fill('[data-testid="password-input"]', 'test-password');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to notifications
    await page.click('[data-testid="mobile-menu"]');
    await page.click('[data-testid="notifications-link"]');
    
    // Enable push (if supported on mobile)
    await context.grantPermissions(['notifications']);
    await page.click('[data-testid="enable-push-button"]');
    
    // Verify mobile UI
    await expect(page.locator('[data-testid="mobile-notification-settings"]')).toBeVisible();
  });
});
