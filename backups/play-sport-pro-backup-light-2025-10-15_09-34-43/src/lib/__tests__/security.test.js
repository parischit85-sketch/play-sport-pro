// =============================================
// FILE: src/lib/__tests__/security.test.js
// SECURITY LIBRARY UNIT TESTS
// =============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  sanitizeHTML,
  sanitizeText,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  RateLimiter,
  CSRFProtection,
  SecureSession,
  performSecurityAudit,
} from '../security.js';

describe('Security Library', () => {
  describe('Input Sanitization', () => {
    describe('sanitizeHTML', () => {
      it('should remove script tags', () => {
        const input = '<p>Hello</p><script>alert("xss")</script>';
        const result = sanitizeHTML(input);
        expect(result).toBe('<p>Hello</p>');
        expect(result).not.toContain('<script>');
      });

      it('should remove dangerous attributes', () => {
        const input = '<img src="test.jpg" onerror="alert(1)" onload="malicious()">';
        const result = sanitizeHTML(input);
        expect(result).not.toContain('onerror');
        expect(result).not.toContain('onload');
      });

      it('should preserve safe HTML', () => {
        const input = '<p><strong>Bold text</strong> and <em>italic</em></p>';
        const result = sanitizeHTML(input);
        expect(result).toContain('<strong>');
        expect(result).toContain('<em>');
      });

      it('should handle malformed HTML', () => {
        const input = '<p>Unclosed tag <div>';
        const result = sanitizeHTML(input);
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      });
    });

    describe('sanitizeText', () => {
      it('should remove HTML tags', () => {
        const input = '<p>Hello <strong>World</strong></p>';
        const result = sanitizeText(input);
        expect(result).toBe('Hello World');
      });

      it('should decode HTML entities', () => {
        const input = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
        const result = sanitizeText(input);
        expect(result).toBe('<script>alert("xss")</script>');
      });

      it('should trim whitespace', () => {
        const input = '  Hello World  ';
        const result = sanitizeText(input);
        expect(result).toBe('Hello World');
      });
    });
  });

  describe('Input Validation', () => {
    describe('validateEmail', () => {
      it('should accept valid emails', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'user+tag@example.org',
          'test123@test-domain.com',
        ];

        validEmails.forEach((email) => {
          expect(validateEmail(email)).toBe(true);
        });
      });

      it('should reject invalid emails', () => {
        const invalidEmails = [
          'invalid-email',
          '@example.com',
          'test@',
          'test.example.com',
          'test @example.com',
          '',
          null,
          undefined,
        ];

        invalidEmails.forEach((email) => {
          expect(validateEmail(email)).toBe(false);
        });
      });
    });

    describe('validatePassword', () => {
      it('should accept strong passwords', () => {
        const strongPasswords = ['StrongPass123!', 'MySecure#Password2024', 'Complex$Pass9'];

        strongPasswords.forEach((password) => {
          const result = validatePassword(password);
          expect(result.isValid).toBe(true);
          expect(result.strength).toBeGreaterThanOrEqual(80);
        });
      });

      it('should reject weak passwords', () => {
        const weakPasswords = ['weak', '12345678', 'password', 'PASSWORD', 'Pass123'];

        weakPasswords.forEach((password) => {
          const result = validatePassword(password);
          expect(result.isValid).toBe(false);
          expect(result.strength).toBeLessThan(70);
        });
      });

      it('should provide helpful feedback', () => {
        const result = validatePassword('weak');
        expect(result.feedback).toContain('at least 8 characters');
        expect(result.feedback).toContain('uppercase');
        expect(result.feedback).toContain('number');
        expect(result.feedback).toContain('special character');
      });
    });

    describe('validatePhoneNumber', () => {
      it('should accept valid international phone numbers', () => {
        const validNumbers = [
          '+1234567890',
          '+39 123 456 7890',
          '+44 20 1234 5678',
          '+86 138 0013 8000',
        ];

        validNumbers.forEach((number) => {
          expect(validatePhoneNumber(number)).toBe(true);
        });
      });

      it('should reject invalid phone numbers', () => {
        const invalidNumbers = ['123', 'not-a-number', '+', '+123', '', null];

        invalidNumbers.forEach((number) => {
          expect(validatePhoneNumber(number)).toBe(false);
        });
      });
    });
  });

  describe('Rate Limiting', () => {
    let rateLimiter;

    beforeEach(() => {
      rateLimiter = new RateLimiter(5, 60000); // 5 requests per minute
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should allow requests within limit', () => {
      const key = 'test-user';

      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.isAllowed(key)).toBe(true);
      }
    });

    it('should block requests exceeding limit', () => {
      const key = 'test-user';

      // Use up the limit
      for (let i = 0; i < 5; i++) {
        rateLimiter.isAllowed(key);
      }

      // Next request should be blocked
      expect(rateLimiter.isAllowed(key)).toBe(false);
    });

    it('should reset after time window', () => {
      const key = 'test-user';

      // Use up the limit
      for (let i = 0; i < 5; i++) {
        rateLimiter.isAllowed(key);
      }

      expect(rateLimiter.isAllowed(key)).toBe(false);

      // Advance time past the window
      vi.advanceTimersByTime(61000);

      expect(rateLimiter.isAllowed(key)).toBe(true);
    });

    it('should track remaining requests', () => {
      const key = 'test-user';

      expect(rateLimiter.getRemainingRequests(key)).toBe(5);

      rateLimiter.isAllowed(key);
      expect(rateLimiter.getRemainingRequests(key)).toBe(4);

      rateLimiter.isAllowed(key);
      expect(rateLimiter.getRemainingRequests(key)).toBe(3);
    });

    it('should clean up old entries', () => {
      const key = 'test-user';
      rateLimiter.isAllowed(key);

      expect(rateLimiter.requests.has(key)).toBe(true);

      // Advance time and trigger cleanup
      vi.advanceTimersByTime(61000);
      rateLimiter.cleanup();

      expect(rateLimiter.requests.has(key)).toBe(false);
    });
  });

  describe('CSRF Protection', () => {
    let csrfProtection;

    beforeEach(() => {
      csrfProtection = new CSRFProtection();
    });

    it('should generate valid tokens', () => {
      const token = csrfProtection.generateToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(10);
    });

    it('should validate correct tokens', () => {
      const token = csrfProtection.generateToken();
      expect(csrfProtection.validateToken(token)).toBe(true);
    });

    it('should reject invalid tokens', () => {
      expect(csrfProtection.validateToken('invalid-token')).toBe(false);
      expect(csrfProtection.validateToken('')).toBe(false);
      expect(csrfProtection.validateToken(null)).toBe(false);
    });

    it('should reject expired tokens', () => {
      vi.useFakeTimers();

      const token = csrfProtection.generateToken();
      expect(csrfProtection.validateToken(token)).toBe(true);

      // Advance time past expiration
      vi.advanceTimersByTime(16 * 60 * 1000); // 16 minutes

      expect(csrfProtection.validateToken(token)).toBe(false);

      vi.useRealTimers();
    });

    it('should store and retrieve tokens', () => {
      const token = csrfProtection.generateToken();
      csrfProtection.storeToken(token);

      const retrieved = csrfProtection.getStoredToken();
      expect(retrieved).toBe(token);
    });
  });

  describe('Secure Session', () => {
    let secureSession;

    beforeEach(() => {
      secureSession = new SecureSession();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should start and track session', () => {
      const sessionData = { userId: 'test-123' };
      secureSession.startSession(sessionData);

      expect(secureSession.isActive()).toBe(true);
      expect(secureSession.getSessionData()).toEqual(sessionData);
    });

    it('should detect timeout', () => {
      secureSession.startSession({ userId: 'test-123' });

      expect(secureSession.isActive()).toBe(true);
      expect(secureSession.isNearTimeout()).toBe(false);

      // Advance time to near timeout
      vi.advanceTimersByTime(25 * 60 * 1000); // 25 minutes

      expect(secureSession.isNearTimeout()).toBe(true);
      expect(secureSession.isActive()).toBe(true);

      // Advance to timeout
      vi.advanceTimersByTime(6 * 60 * 1000); // 6 more minutes

      expect(secureSession.isActive()).toBe(false);
    });

    it('should extend session on activity', () => {
      secureSession.startSession({ userId: 'test-123' });

      // Advance time
      vi.advanceTimersByTime(20 * 60 * 1000); // 20 minutes

      secureSession.updateActivity();

      // Should not be near timeout anymore
      expect(secureSession.isNearTimeout()).toBe(false);
    });

    it('should end session properly', () => {
      secureSession.startSession({ userId: 'test-123' });
      expect(secureSession.isActive()).toBe(true);

      secureSession.endSession();
      expect(secureSession.isActive()).toBe(false);
      expect(secureSession.getSessionData()).toBeNull();
    });
  });

  describe('Security Audit', () => {
    it('should perform comprehensive security audit', () => {
      const mockElement = {
        innerHTML: '<p>Safe content</p>',
        getAttribute: vi.fn(),
        getElementsByTagName: vi.fn(() => []),
      };

      global.document = {
        body: mockElement,
        getElementsByTagName: vi.fn(() => []),
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(() => []),
      };

      const auditResult = performSecurityAudit();

      expect(auditResult).toHaveProperty('score');
      expect(auditResult).toHaveProperty('issues');
      expect(auditResult).toHaveProperty('recommendations');
      expect(auditResult.score).toBeGreaterThanOrEqual(0);
      expect(auditResult.score).toBeLessThanOrEqual(100);
    });

    it('should detect security issues', () => {
      // Mock a page with security issues
      global.document = {
        body: {
          innerHTML: '<script>alert("xss")</script>',
          getAttribute: vi.fn(),
          getElementsByTagName: vi.fn((tag) => {
            if (tag === 'script') return [{ src: 'http://evil.com/script.js' }];
            return [];
          }),
        },
        getElementsByTagName: vi.fn((tag) => {
          if (tag === 'script') return [{ src: 'http://evil.com/script.js' }];
          return [];
        }),
        querySelector: vi.fn(),
        querySelectorAll: vi.fn(() => []),
      };

      const auditResult = performSecurityAudit();

      expect(auditResult.score).toBeLessThan(90);
      expect(auditResult.issues.length).toBeGreaterThan(0);
      expect(auditResult.recommendations.length).toBeGreaterThan(0);
    });
  });
});
