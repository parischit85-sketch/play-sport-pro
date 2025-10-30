/**
 * OnboardingProvider - CHK-306
 *
 * Context provider for managing onboarding state across the app.
 * Handles:
 * - Current active tour
 * - Auto-start tours based on user role
 * - Tour completion tracking
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@contexts/AuthContext';
import OnboardingWizard from '@components/onboarding/OnboardingWizard';
import { ONBOARDING_TOURS, shouldShowOnboarding, hasCompletedTour } from '@lib/onboardingSteps';

const OnboardingContext = createContext();

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeTour, setActiveTour] = useState(null);
  const [tourSteps, setTourSteps] = useState([]);

  // Auto-start onboarding for new users
  useEffect(() => {
    if (!user) return;

    const userRole = user.role || 'user';

    // Check if should show new user tour
    if (shouldShowOnboarding(userRole, 'newUser')) {
      setTimeout(() => {
        startTour('newUser');
      }, 1000); // Delay to allow DOM to render
    }
  }, [user]);

  const startTour = (tourName) => {
    const steps = ONBOARDING_TOURS[tourName];
    if (steps && !hasCompletedTour(tourName)) {
      setActiveTour(tourName);
      setTourSteps(steps);
    }
  };

  const stopTour = () => {
    setActiveTour(null);
    setTourSteps([]);
  };

  const handleTourComplete = () => {
    stopTour();
  };

  const handleTourSkip = () => {
    stopTour();
  };

  const value = {
    activeTour,
    startTour,
    stopTour,
    hasCompletedTour,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      {activeTour && tourSteps.length > 0 && (
        <OnboardingWizard
          steps={tourSteps}
          tourName={activeTour}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}
    </OnboardingContext.Provider>
  );
};

