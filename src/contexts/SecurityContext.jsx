/**
 * Security Context for managing application-wide security features
 * Handles session management, security monitoring, and threat detection
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SecureSession, performSecurityAudit, setupCSP } from '../lib/security';
import analyticsModule from '../lib/analytics';

const SecurityContext = createContext();

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider = ({ children }) => {
  // Security state
  const [secureSession, setSecureSession] = useState(null);
  const [securityAudit, setSecurityAudit] = useState(null);
  const [threatLevel, setThreatLevel] = useState('low'); // low, medium, high, critical
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(null);
  const [isSecurityInitialized, setIsSecurityInitialized] = useState(false);

  // Security metrics
  const [securityMetrics, setSecurityMetrics] = useState({
    suspiciousActivities: 0,
    blockedRequests: 0,
    securityScans: 0,
    threatDetections: 0
  });

  /**
   * Initialize security systems
   */
  const initializeSecurity = useCallback(async () => {
    try {
      // Set up Content Security Policy
      setupCSP();

      // Initialize secure session management
      const session = new SecureSession();
      setSecureSession(session);

      // Perform initial security audit
      const audit = performSecurityAudit();
      setSecurityAudit(audit);

      // Set up security event listeners
      setupSecurityEventListeners();

      // Start security monitoring
      startSecurityMonitoring();

      setIsSecurityInitialized(true);

      // Track security initialization
      analyticsModule.trackEvent('security_initialization', {
        securityScore: audit.score,
        recommendations: audit.recommendations.length,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Security initialization failed:', error);
      addSecurityAlert('Security initialization failed', 'high');
    }
  }, []);

  /**
   * Set up security event listeners
   */
  const setupSecurityEventListeners = useCallback(() => {
    // Session timeout warning
    window.addEventListener('sessionTimeout', (event) => {
      const timeRemaining = event.detail.timeRemaining;
      setSessionTimeRemaining(timeRemaining);
      addSecurityAlert(
        `Session will expire in ${timeRemaining} minutes`,
        'medium',
        'session_timeout_warning'
      );
    });

    // Session expired
    window.addEventListener('sessionExpired', () => {
      addSecurityAlert('Session expired for security reasons', 'high', 'session_expired');
      handleSecurityLogout();
    });

    // Detect suspicious browser behavior
    let rapidClickCount = 0;
    let rapidClickTimer = null;

    document.addEventListener('click', () => {
      rapidClickCount++;
      
      if (rapidClickTimer) clearTimeout(rapidClickTimer);
      
      rapidClickTimer = setTimeout(() => {
        if (rapidClickCount > 20) { // More than 20 clicks in 5 seconds
          handleSuspiciousActivity('rapid_clicking', { clicks: rapidClickCount });
        }
        rapidClickCount = 0;
      }, 5000);
    });

    // Detect developer tools opening
    let devtools = { open: false };
    const threshold = 160;

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          handleSuspiciousActivity('devtools_opened');
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    // Detect multiple tab usage
    let tabCount = 1;
    window.addEventListener('focus', () => {
      tabCount++;
      if (tabCount > 5) { // More than 5 tabs opened
        handleSuspiciousActivity('multiple_tabs', { count: tabCount });
      }
    });

  }, []);

  /**
   * Start continuous security monitoring
   */
  const startSecurityMonitoring = useCallback(() => {
    // Periodic security scans
    setInterval(() => {
      const audit = performSecurityAudit();
      setSecurityAudit(audit);
      
      setSecurityMetrics(prev => ({
        ...prev,
        securityScans: prev.securityScans + 1
      }));

      // Check for security score degradation
      if (audit.score < 70) {
        setThreatLevel('medium');
        addSecurityAlert('Security score degraded', 'medium', 'security_degradation');
      }

      analyticsModule.trackEvent('security_scan', {
        score: audit.score,
        threats: audit.recommendations.length
      });
    }, 300000); // Every 5 minutes

    // Monitor for potential XSS attempts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check for potentially dangerous elements
              const dangerousElements = node.querySelectorAll('script, iframe, object, embed');
              if (dangerousElements.length > 0) {
                handleSuspiciousActivity('dom_injection', {
                  elements: dangerousElements.length,
                  nodeName: node.nodeName
                });
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

  }, []);

  /**
   * Handle suspicious activity detection
   * @param {string} type - Type of suspicious activity
   * @param {object} metadata - Additional metadata
   */
  const handleSuspiciousActivity = useCallback((type, metadata = {}) => {
    setSecurityMetrics(prev => ({
      ...prev,
      suspiciousActivities: prev.suspiciousActivities + 1
    }));

    const threatTypes = {
      rapid_clicking: 'medium',
      devtools_opened: 'low',
      multiple_tabs: 'low',
      dom_injection: 'high',
      unusual_requests: 'medium'
    };

    const threat = threatTypes[type] || 'medium';
    setThreatLevel(prev => threat === 'high' ? 'high' : prev);

    addSecurityAlert(
      `Suspicious activity detected: ${type}`,
      threat,
      `suspicious_${type}`
    );

    // Track security event
    analyticsModule.trackEvent('security_threat', {
      type,
      threat_level: threat,
      metadata,
      timestamp: Date.now()
    });

    // Auto-escalate if multiple high-threat activities
    if (threat === 'high') {
      setSecurityMetrics(prev => ({
        ...prev,
        threatDetections: prev.threatDetections + 1
      }));

      if (securityMetrics.threatDetections >= 3) {
        setThreatLevel('critical');
        handleCriticalThreat();
      }
    }
  }, [securityMetrics.threatDetections]);

  /**
   * Handle critical security threats
   */
  const handleCriticalThreat = useCallback(() => {
    addSecurityAlert(
      'Critical security threat detected. Session will be terminated.',
      'critical',
      'critical_threat'
    );

    // Force logout after 30 seconds
    setTimeout(() => {
      handleSecurityLogout();
    }, 30000);

    analyticsModule.trackEvent('critical_security_threat', {
      threat_level: 'critical',
      auto_logout: true,
      timestamp: Date.now()
    });
  }, []);

  /**
   * Add security alert
   * @param {string} message - Alert message
   * @param {string} severity - Alert severity
   * @param {string} type - Alert type
   */
  const addSecurityAlert = useCallback((message, severity = 'low', type = 'general') => {
    const alert = {
      id: Date.now() + Math.random(),
      message,
      severity,
      type,
      timestamp: new Date().toISOString(),
      dismissed: false
    };

    setSecurityAlerts(prev => [...prev.slice(-9), alert]); // Keep last 10 alerts

    // Auto-dismiss low severity alerts after 10 seconds
    if (severity === 'low') {
      setTimeout(() => {
        dismissSecurityAlert(alert.id);
      }, 10000);
    }
  }, []);

  /**
   * Dismiss security alert
   * @param {string} alertId - Alert ID
   */
  const dismissSecurityAlert = useCallback((alertId) => {
    setSecurityAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, dismissed: true }
          : alert
      )
    );
  }, []);

  /**
   * Handle security-related logout
   */
  const handleSecurityLogout = useCallback(() => {
    // Clear all security state
    setSecurityAlerts([]);
    setThreatLevel('low');
    setSecurityMetrics({
      suspiciousActivities: 0,
      blockedRequests: 0,
      securityScans: 0,
      threatDetections: 0
    });

    // Dispatch logout event for the app to handle
    window.dispatchEvent(new CustomEvent('securityLogout', {
      detail: { reason: 'security_threat' }
    }));
  }, []);

  /**
   * Extend current session
   */
  const extendSession = useCallback(() => {
    if (secureSession) {
      secureSession.extendSession();
      setSessionTimeRemaining(null);
      addSecurityAlert('Session extended successfully', 'low', 'session_extended');
    }
  }, [secureSession]);

  /**
   * Get security status summary
   */
  const getSecurityStatus = useCallback(() => {
    return {
      threatLevel,
      securityScore: securityAudit?.score || 0,
      activeAlerts: securityAlerts.filter(alert => !alert.dismissed).length,
      sessionTimeRemaining,
      isSecure: threatLevel === 'low' && (securityAudit?.score || 0) > 80,
      metrics: securityMetrics
    };
  }, [threatLevel, securityAudit, securityAlerts, sessionTimeRemaining, securityMetrics]);

  /**
   * Block suspicious request
   * @param {string} reason - Reason for blocking
   * @param {object} details - Request details
   */
  const blockRequest = useCallback((reason, details = {}) => {
    setSecurityMetrics(prev => ({
      ...prev,
      blockedRequests: prev.blockedRequests + 1
    }));

    addSecurityAlert(
      `Blocked suspicious request: ${reason}`,
      'medium',
      'blocked_request'
    );

    analyticsModule.trackEvent('security_block', {
      reason,
      details,
      timestamp: Date.now()
    });
  }, []);

  // Initialize security on mount
  useEffect(() => {
    initializeSecurity();
  }, [initializeSecurity]);

  // Update session time remaining
  useEffect(() => {
    if (secureSession) {
      const interval = setInterval(() => {
        if (!secureSession.isExpired()) {
          const timeUntilExpiry = secureSession.getTimeUntilExpiry();
          const minutesRemaining = Math.ceil(timeUntilExpiry / 60000);
          
          if (minutesRemaining <= 5 && minutesRemaining > 0) {
            setSessionTimeRemaining(minutesRemaining);
          } else {
            setSessionTimeRemaining(null);
          }
        }
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [secureSession]);

  const value = {
    // State
    isSecurityInitialized,
    threatLevel,
    securityAlerts: securityAlerts.filter(alert => !alert.dismissed),
    securityAudit,
    sessionTimeRemaining,
    securityMetrics,

    // Actions
    addSecurityAlert,
    dismissSecurityAlert,
    handleSuspiciousActivity,
    extendSession,
    blockRequest,
    getSecurityStatus,

    // Session management
    secureSession,

    // Utilities
    isSecure: threatLevel === 'low' && (securityAudit?.score || 0) > 80
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export default SecurityProvider;