// =============================================
// FILE: src/components/registration/SuccessAnimation.jsx
// Success animation with checkmark and redirect countdown
// =============================================
import React, { useEffect, useState } from 'react';

/**
 * Success animation component
 * @param {string} userName - User's name for personalized message
 * @param {Function} onComplete - Callback after animation (before redirect)
 * @param {number} redirectDelay - Seconds before redirect (default: 3)
 */
export default function SuccessAnimation({ userName = '', onComplete, redirectDelay = 3 }) {
  const [countdown, setCountdown] = useState(redirectDelay);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsVisible(true), 100);

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onComplete) onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className={`success-overlay ${isVisible ? 'visible' : ''}`}>
      <div className="success-container">
        {/* Animated checkmark */}
        <div className="checkmark-circle">
          <svg className="checkmark" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
            <circle className="checkmark-circle-path" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>

        {/* Success message */}
        <h2 className="success-title">Registrazione Completata!</h2>
        {userName && (
          <p className="success-message">
            Benvenuto{userName.includes(' ') ? ' ' : ', '}
            <strong>{userName}</strong>!
          </p>
        )}
        <p className="success-redirect">
          Reindirizzamento in <strong>{countdown}</strong> second{countdown !== 1 ? 'i' : 'o'}...
        </p>
      </div>

      <style jsx>{`
        .success-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .success-overlay.visible {
          opacity: 1;
        }

        .success-container {
          background-color: white;
          padding: 3rem 2rem;
          border-radius: 16px;
          text-align: center;
          max-width: 400px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .checkmark-circle {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
        }

        .checkmark {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }

        .checkmark-circle-path {
          stroke: #4caf50;
          stroke-width: 2;
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }

        .checkmark-check {
          stroke: #4caf50;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }

        .success-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 1rem;
        }

        .success-message {
          font-size: 1.125rem;
          color: #666;
          margin: 0 0 1.5rem;
        }

        .success-message strong {
          color: #333;
          font-weight: 600;
        }

        .success-redirect {
          font-size: 0.9375rem;
          color: #999;
          margin: 0;
        }

        .success-redirect strong {
          color: #4caf50;
          font-weight: 700;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .success-container {
            background-color: #2a2a2a;
          }

          .success-title {
            color: #f0f0f0;
          }

          .success-message {
            color: #b0b0b0;
          }

          .success-message strong {
            color: #e0e0e0;
          }

          .success-redirect {
            color: #808080;
          }
        }
      `}</style>
    </div>
  );
}

