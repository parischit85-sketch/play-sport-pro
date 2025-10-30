/**
 * Feature Flags & A/B Testing Framework - CHK-304
 *
 * Sistema completo per A/B testing e feature flags.
 * Features:
 * - Feature flag management (on/off per feature)
 * - A/B testing con variant assignment
 * - Custom percentage splits (50/50, 70/30, etc.)
 * - Gradual rollout (0% → 100%)
 * - User segmentation (target specific users)
 * - Analytics tracking per variant
 * - localStorage persistence
 * - Admin override capability
 */

import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase';

// Variant types
export const VariantType = {
  CONTROL: 'control', // Original version
  VARIANT_A: 'variantA', // Test version A
  VARIANT_B: 'variantB', // Test version B
  VARIANT_C: 'variantC', // Test version C (optional)
};

// Experiment status
export const ExperimentStatus = {
  DRAFT: 'draft', // Not yet started
  RUNNING: 'running', // Currently active
  PAUSED: 'paused', // Temporarily stopped
  COMPLETED: 'completed', // Finished, winner selected
  ARCHIVED: 'archived', // Old experiment
};

/**
 * FeatureFlagManager Class
 * Singleton per gestire feature flags e A/B experiments
 */
class FeatureFlagManager {
  constructor() {
    if (FeatureFlagManager.instance) {
      return FeatureFlagManager.instance;
    }

    this.flags = new Map();
    this.experiments = new Map();
    this.userVariants = new Map(); // User → Experiment → Variant
    this.overrides = new Map(); // Admin overrides
    this.loadPersistedData();

    FeatureFlagManager.instance = this;
  }

  /**
   * Initialize with default flags and experiments
   */
  initialize(config = {}) {
    const { flags = [], experiments = [] } = config;

    // Load feature flags
    flags.forEach((flag) => {
      this.flags.set(flag.key, {
        key: flag.key,
        enabled: flag.enabled ?? false,
        description: flag.description || '',
        createdAt: flag.createdAt || Date.now(),
      });
    });

    // Load experiments
    experiments.forEach((exp) => {
      this.experiments.set(exp.key, {
        key: exp.key,
        name: exp.name,
        description: exp.description || '',
        status: exp.status || ExperimentStatus.DRAFT,
        variants: exp.variants || [
          { key: VariantType.CONTROL, name: 'Control', percentage: 50 },
          { key: VariantType.VARIANT_A, name: 'Variant A', percentage: 50 },
        ],
        startDate: exp.startDate || null,
        endDate: exp.endDate || null,
        targetUsers: exp.targetUsers || null, // null = all users
        createdAt: exp.createdAt || Date.now(),
        metrics: exp.metrics || {},
      });
    });

    this.persistData();
  }

  /**
   * Check if feature flag is enabled
   */
  isEnabled(flagKey, userId = null) {
    // Check admin override first
    const override = this.overrides.get(flagKey);
    if (override !== undefined) {
      return override;
    }

    const flag = this.flags.get(flagKey);
    if (!flag) {
      console.warn(`[FeatureFlags] Flag "${flagKey}" not found`);
      return false;
    }

    return flag.enabled;
  }

  /**
   * Set feature flag enabled/disabled
   */
  setFlag(flagKey, enabled) {
    const flag = this.flags.get(flagKey);
    if (!flag) {
      // Create new flag
      this.flags.set(flagKey, {
        key: flagKey,
        enabled,
        description: '',
        createdAt: Date.now(),
      });
    } else {
      flag.enabled = enabled;
    }

    this.persistData();
    this.trackEvent('feature_flag_changed', {
      flag: flagKey,
      enabled,
    });
  }

  /**
   * Get variant for user in experiment
   */
  getVariant(experimentKey, userId) {
    // Check admin override
    const overrideKey = `${experimentKey}:${userId}`;
    const override = this.overrides.get(overrideKey);
    if (override) {
      return override;
    }

    // Check if user already has assigned variant
    if (!this.userVariants.has(userId)) {
      this.userVariants.set(userId, new Map());
    }

    const userExperiments = this.userVariants.get(userId);
    if (userExperiments.has(experimentKey)) {
      return userExperiments.get(experimentKey);
    }

    // Get experiment
    const experiment = this.experiments.get(experimentKey);
    if (!experiment) {
      console.warn(`[FeatureFlags] Experiment "${experimentKey}" not found`);
      return VariantType.CONTROL;
    }

    // Check if experiment is running
    if (experiment.status !== ExperimentStatus.RUNNING) {
      return VariantType.CONTROL;
    }

    // Check target users (if specified)
    if (experiment.targetUsers && !experiment.targetUsers.includes(userId)) {
      return VariantType.CONTROL;
    }

    // Assign variant based on percentage split
    const variant = this.assignVariant(userId, experiment);
    userExperiments.set(experimentKey, variant);

    // Persist assignment
    this.persistData();

    // Track assignment
    this.trackEvent('experiment_assignment', {
      experiment: experimentKey,
      variant,
      userId,
    });

    return variant;
  }

  /**
   * Assign variant to user based on percentage split
   */
  assignVariant(userId, experiment) {
    // Deterministic assignment based on user ID
    const hash = this.hashString(`${userId}:${experiment.key}`);
    const percentage = hash % 100;

    let cumulativePercentage = 0;
    for (const variant of experiment.variants) {
      cumulativePercentage += variant.percentage;
      if (percentage < cumulativePercentage) {
        return variant.key;
      }
    }

    // Fallback to control
    return VariantType.CONTROL;
  }

  /**
   * Simple string hash function (deterministic)
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Track event for experiment
   */
  trackExperimentEvent(experimentKey, eventName, userId, metadata = {}) {
    const variant = this.getVariant(experimentKey, userId);

    this.trackEvent('experiment_event', {
      experiment: experimentKey,
      variant,
      event: eventName,
      userId,
      ...metadata,
    });

    // Update experiment metrics
    const experiment = this.experiments.get(experimentKey);
    if (experiment) {
      if (!experiment.metrics[variant]) {
        experiment.metrics[variant] = {};
      }
      if (!experiment.metrics[variant][eventName]) {
        experiment.metrics[variant][eventName] = 0;
      }
      experiment.metrics[variant][eventName]++;
      this.persistData();
    }
  }

  /**
   * Create new experiment
   */
  createExperiment(config) {
    const {
      key,
      name,
      description = '',
      variants = [
        { key: VariantType.CONTROL, name: 'Control', percentage: 50 },
        { key: VariantType.VARIANT_A, name: 'Variant A', percentage: 50 },
      ],
      targetUsers = null,
    } = config;

    // Validate percentages sum to 100
    const totalPercentage = variants.reduce((sum, v) => sum + v.percentage, 0);
    if (totalPercentage !== 100) {
      throw new Error(`Variant percentages must sum to 100 (got ${totalPercentage})`);
    }

    const experiment = {
      key,
      name,
      description,
      status: ExperimentStatus.DRAFT,
      variants,
      startDate: null,
      endDate: null,
      targetUsers,
      createdAt: Date.now(),
      metrics: {},
    };

    this.experiments.set(key, experiment);
    this.persistData();

    this.trackEvent('experiment_created', { experiment: key });

    return experiment;
  }

  /**
   * Update experiment
   */
  updateExperiment(key, updates) {
    const experiment = this.experiments.get(key);
    if (!experiment) {
      throw new Error(`Experiment "${key}" not found`);
    }

    // Validate percentages if variants updated
    if (updates.variants) {
      const totalPercentage = updates.variants.reduce((sum, v) => sum + v.percentage, 0);
      if (totalPercentage !== 100) {
        throw new Error(`Variant percentages must sum to 100 (got ${totalPercentage})`);
      }
    }

    Object.assign(experiment, updates);
    this.persistData();

    this.trackEvent('experiment_updated', { experiment: key, updates });
  }

  /**
   * Start experiment
   */
  startExperiment(key) {
    const experiment = this.experiments.get(key);
    if (!experiment) {
      throw new Error(`Experiment "${key}" not found`);
    }

    experiment.status = ExperimentStatus.RUNNING;
    experiment.startDate = Date.now();
    this.persistData();

    this.trackEvent('experiment_started', { experiment: key });
  }

  /**
   * Pause experiment
   */
  pauseExperiment(key) {
    const experiment = this.experiments.get(key);
    if (!experiment) {
      throw new Error(`Experiment "${key}" not found`);
    }

    experiment.status = ExperimentStatus.PAUSED;
    this.persistData();

    this.trackEvent('experiment_paused', { experiment: key });
  }

  /**
   * Complete experiment (select winner)
   */
  completeExperiment(key, winner = null) {
    const experiment = this.experiments.get(key);
    if (!experiment) {
      throw new Error(`Experiment "${key}" not found`);
    }

    experiment.status = ExperimentStatus.COMPLETED;
    experiment.endDate = Date.now();
    if (winner) {
      experiment.winner = winner;
    }
    this.persistData();

    this.trackEvent('experiment_completed', { experiment: key, winner });
  }

  /**
   * Get experiment stats
   */
  getExperimentStats(key) {
    const experiment = this.experiments.get(key);
    if (!experiment) {
      return null;
    }

    const stats = {
      key: experiment.key,
      name: experiment.name,
      status: experiment.status,
      startDate: experiment.startDate,
      endDate: experiment.endDate,
      variants: experiment.variants,
      participants: 0,
      metrics: {},
    };

    // Count participants
    this.userVariants.forEach((experiments) => {
      if (experiments.has(key)) {
        stats.participants++;
      }
    });

    // Calculate metrics per variant
    experiment.variants.forEach((variant) => {
      const variantKey = variant.key;
      stats.metrics[variantKey] = experiment.metrics[variantKey] || {};
    });

    return stats;
  }

  /**
   * Get all experiments
   */
  getAllExperiments() {
    return Array.from(this.experiments.values());
  }

  /**
   * Get all feature flags
   */
  getAllFlags() {
    return Array.from(this.flags.values());
  }

  /**
   * Set admin override
   */
  setOverride(key, value) {
    this.overrides.set(key, value);
    this.persistData();
  }

  /**
   * Clear admin override
   */
  clearOverride(key) {
    this.overrides.delete(key);
    this.persistData();
  }

  /**
   * Clear all overrides
   */
  clearAllOverrides() {
    this.overrides.clear();
    this.persistData();
  }

  /**
   * Track event to Firebase Analytics
   */
  trackEvent(eventName, params = {}) {
    try {
      if (analytics) {
        logEvent(analytics, eventName, params);
      }
    } catch (err) {
      console.error('[FeatureFlags] Failed to track event:', err);
    }
  }

  /**
   * Persist data to localStorage
   */
  persistData() {
    try {
      const data = {
        flags: Array.from(this.flags.entries()),
        experiments: Array.from(this.experiments.entries()),
        userVariants: Array.from(this.userVariants.entries()).map(([userId, experiments]) => [
          userId,
          Array.from(experiments.entries()),
        ]),
        overrides: Array.from(this.overrides.entries()),
        timestamp: Date.now(),
      };
      localStorage.setItem('featureFlags_data', JSON.stringify(data));
    } catch (err) {
      console.error('[FeatureFlags] Failed to persist data:', err);
    }
  }

  /**
   * Load persisted data from localStorage
   */
  loadPersistedData() {
    try {
      const data = localStorage.getItem('featureFlags_data');
      if (!data) return;

      const parsed = JSON.parse(data);

      // Load flags
      if (parsed.flags) {
        this.flags = new Map(parsed.flags);
      }

      // Load experiments
      if (parsed.experiments) {
        this.experiments = new Map(parsed.experiments);
      }

      // Load user variants
      if (parsed.userVariants) {
        this.userVariants = new Map(
          parsed.userVariants.map(([userId, experiments]) => [userId, new Map(experiments)])
        );
      }

      // Load overrides
      if (parsed.overrides) {
        this.overrides = new Map(parsed.overrides);
      }
    } catch (err) {
      console.error('[FeatureFlags] Failed to load persisted data:', err);
    }
  }

  /**
   * Export data as JSON
   */
  exportJSON() {
    const data = {
      exportDate: new Date().toISOString(),
      flags: Array.from(this.flags.values()),
      experiments: Array.from(this.experiments.values()),
      stats: this.getAllExperiments().map((exp) => this.getExperimentStats(exp.key)),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feature-flags-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Reset all data (use with caution)
   */
  reset() {
    this.flags.clear();
    this.experiments.clear();
    this.userVariants.clear();
    this.overrides.clear();
    localStorage.removeItem('featureFlags_data');
  }
}

// Singleton instance
export const featureFlagManager = new FeatureFlagManager();

/**
 * Helper function: Check if flag is enabled
 */
export function isFeatureEnabled(flagKey, userId = null) {
  return featureFlagManager.isEnabled(flagKey, userId);
}

/**
 * Helper function: Get experiment variant
 */
export function getExperimentVariant(experimentKey, userId) {
  return featureFlagManager.getVariant(experimentKey, userId);
}

/**
 * Helper function: Track experiment event
 */
export function trackExperimentEvent(experimentKey, eventName, userId, metadata = {}) {
  featureFlagManager.trackExperimentEvent(experimentKey, eventName, userId, metadata);
}

/**
 * React hook for feature flags
 */
export function useFeatureFlag(flagKey, userId = null) {
  const isEnabled = featureFlagManager.isEnabled(flagKey, userId);
  return isEnabled;
}

/**
 * React hook for A/B testing
 */
export function useExperiment(experimentKey, userId) {
  const variant = featureFlagManager.getVariant(experimentKey, userId);

  const trackEvent = (eventName, metadata = {}) => {
    featureFlagManager.trackExperimentEvent(experimentKey, eventName, userId, metadata);
  };

  return {
    variant,
    isControl: variant === VariantType.CONTROL,
    isVariantA: variant === VariantType.VARIANT_A,
    isVariantB: variant === VariantType.VARIANT_B,
    isVariantC: variant === VariantType.VARIANT_C,
    trackEvent,
  };
}

/**
 * Higher-order component for A/B testing
 */
export function withExperiment(experimentKey, Component) {
  return function ExperimentWrapper(props) {
    const { userId, ...rest } = props;
    const experiment = useExperiment(experimentKey, userId);

    return <Component {...rest} experiment={experiment} />;
  };
}

export default featureFlagManager;
