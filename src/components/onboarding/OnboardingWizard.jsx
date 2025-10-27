/**
 * OnboardingWizard Component - CHK-306
 *
 * Interactive step-by-step tour with spotlight effect.
 * Features:
 * - Scrolls to target element
 * - Highlights with spotlight (darkens background)
 * - Progress indicator
 * - Skip, Previous, Next, Finish actions
 * - Auto-save progress to localStorage
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, ArrowRight, Check, SkipForward } from 'lucide-react';
import { saveOnboardingProgress } from '@lib/onboardingSteps';

const OnboardingWizard = ({ steps, tourName, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState(null);
  const [targetRect, setTargetRect] = useState(null);
  const tooltipRef = useRef(null);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Find and highlight target element
  useEffect(() => {
    if (!currentStepData?.target) return;

    const element = document.querySelector(currentStepData.target);
    if (element) {
      setTargetElement(element);

      // Scroll element into view
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });

      // Get element position for spotlight
      const updatePosition = () => {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    } else {
      setTargetElement(null);
      setTargetRect(null);
    }
  }, [currentStep, currentStepData]);

  // Save progress
  useEffect(() => {
    if (tourName) {
      saveOnboardingProgress(tourName, currentStep, false);
    }
  }, [currentStep, tourName]);

  // Navigation handlers
  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (tourName) {
      saveOnboardingProgress(tourName, currentStep, true);
    }
    if (onSkip) onSkip();
  };

  const handleComplete = () => {
    if (tourName) {
      saveOnboardingProgress(tourName, steps.length - 1, true);
    }
    if (onComplete) onComplete();
  };

  // Calculate tooltip position
  const getTooltipStyle = () => {
    if (!targetRect || !tooltipRef.current) return {};

    const tooltip = tooltipRef.current.getBoundingClientRect();
    const padding = currentStepData.highlightPadding || 10;
    const placement = currentStepData.placement || 'bottom';

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = targetRect.top - tooltip.height - padding - 20;
        left = targetRect.left + targetRect.width / 2 - tooltip.width / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + padding + 20;
        left = targetRect.left + targetRect.width / 2 - tooltip.width / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltip.height / 2;
        left = targetRect.left - tooltip.width - padding - 20;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltip.height / 2;
        left = targetRect.right + padding + 20;
        break;
      default:
        top = targetRect.bottom + padding + 20;
        left = targetRect.left + targetRect.width / 2 - tooltip.width / 2;
    }

    // Keep tooltip in viewport
    const maxLeft = window.innerWidth - tooltip.width - 20;
    const maxTop = window.innerHeight - tooltip.height - 20;
    left = Math.max(20, Math.min(left, maxLeft));
    top = Math.max(20, Math.min(top, maxTop));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 10002,
    };
  };

  // Spotlight style
  const getSpotlightStyle = () => {
    if (!targetRect) return {};

    const padding = currentStepData.highlightPadding || 10;

    return {
      position: 'fixed',
      top: `${targetRect.top - padding}px`,
      left: `${targetRect.left - padding}px`,
      width: `${targetRect.width + padding * 2}px`,
      height: `${targetRect.height + padding * 2}px`,
      borderRadius: '8px',
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
      pointerEvents: 'none',
      zIndex: 10000,
      transition: 'all 0.3s ease',
    };
  };

  if (!currentStepData) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]" />

      {/* Spotlight */}
      {targetRect && (
        <div style={getSpotlightStyle()} className="animate-fade-in">
          {/* Pulsing ring effect */}
          <div className="absolute inset-0 border-4 border-blue-500 rounded-lg animate-pulse" />
        </div>
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={getTooltipStyle()}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {currentStepData.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Passo {currentStep + 1} di {steps.length}
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
          {currentStepData.content}
        </p>

        {/* Action hint */}
        {currentStepData.action && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
              💡 {currentStepData.action}
            </p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handlePrevious}
            disabled={isFirstStep}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              isFirstStep
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Indietro
          </button>

          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors flex items-center gap-2"
          >
            <SkipForward className="w-5 h-5" />
            Salta
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {isLastStep ? (
              <>
                <Check className="w-5 h-5" />
                Finito!
              </>
            ) : (
              <>
                Avanti
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Step indicator dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-blue-600 w-8'
                  : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label={`Vai al passo ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default OnboardingWizard;
