// =============================================
// FILE: src/components/registration/LoadingStates.jsx
// Loading states and skeleton loaders for registration
// =============================================
import React from 'react';

/**
 * Generic loading spinner
 */
export function Spinner({ size = 'medium', color = 'primary' }) {
  const sizeClass = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large',
  }[size];

  const colorClass = {
    primary: 'spinner-primary',
    white: 'spinner-white',
    dark: 'spinner-dark',
  }[color];

  return (
    <div className={`spinner ${sizeClass} ${colorClass}`}>
      <style jsx>{`
        .spinner {
          border-radius: 50%;
          border-style: solid;
          animation: spin 0.8s linear infinite;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border-width: 2px;
        }

        .spinner-medium {
          width: 24px;
          height: 24px;
          border-width: 3px;
        }

        .spinner-large {
          width: 48px;
          height: 48px;
          border-width: 4px;
        }

        .spinner-primary {
          border-color: var(--color-primary, #007bff);
          border-top-color: transparent;
        }

        .spinner-white {
          border-color: white;
          border-top-color: transparent;
        }

        .spinner-dark {
          border-color: var(--color-text, #333);
          border-top-color: transparent;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Loading button with spinner
 */
export function LoadingButton({
  children,
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  variant = 'primary',
}) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`loading-button ${variantClass} ${className} ${loading ? 'loading' : ''}`}
    >
      {loading && <Spinner size="small" color="white" />}
      <span className={loading ? 'loading-text' : ''}>{children}</span>

      <style jsx>{`
        .loading-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .loading-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background-color: var(--color-primary, #007bff);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: var(--color-primary-dark, #0056b3);
        }

        .btn-secondary {
          background-color: var(--color-secondary, #6c757d);
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: var(--color-secondary-dark, #545b62);
        }

        .btn-danger {
          background-color: var(--color-danger, #dc3545);
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background-color: var(--color-danger-dark, #c82333);
        }

        .loading-text {
          opacity: 0.7;
        }
      `}</style>
    </button>
  );
}

/**
 * Skeleton loader for forms
 */
export function FormSkeleton({ rows = 3 }) {
  return (
    <div className="form-skeleton">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="skeleton-row">
          <div className="skeleton-label"></div>
          <div className="skeleton-input"></div>
        </div>
      ))}

      <style jsx>{`
        .form-skeleton {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .skeleton-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .skeleton-label {
          width: 120px;
          height: 16px;
          background: linear-gradient(
            90deg,
            var(--color-bg-light, #f0f0f0) 25%,
            var(--color-bg-lighter, #e0e0e0) 50%,
            var(--color-bg-light, #f0f0f0) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-input {
          width: 100%;
          height: 40px;
          background: linear-gradient(
            90deg,
            var(--color-bg-light, #f0f0f0) 25%,
            var(--color-bg-lighter, #e0e0e0) 50%,
            var(--color-bg-light, #f0f0f0) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Full page loading overlay
 */
export function LoadingOverlay({ message = 'Caricamento...' }) {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <Spinner size="large" color="primary" />
        <p className="loading-message">{message}</p>
      </div>

      <style jsx>{`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .loading-content {
          background-color: white;
          padding: 2rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .loading-message {
          font-size: 1rem;
          color: var(--color-text, #333);
          margin: 0;
        }

        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .loading-content {
            background-color: var(--color-bg-dark, #2a2a2a);
          }

          .loading-message {
            color: var(--color-text-dark, #e0e0e0);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Inline loading indicator
 */
export function InlineLoader({ text = 'Caricamento...' }) {
  return (
    <div className="inline-loader">
      <Spinner size="small" color="primary" />
      <span className="loader-text">{text}</span>

      <style jsx>{`
        .inline-loader {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .loader-text {
          font-size: 0.875rem;
          color: var(--color-text-light, #666);
        }
      `}</style>
    </div>
  );
}

export default {
  Spinner,
  LoadingButton,
  FormSkeleton,
  LoadingOverlay,
  InlineLoader,
};
