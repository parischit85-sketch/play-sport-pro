// =============================================
// FILE: src/components/registration/RegistrationErrorBoundary.jsx
// Error boundary for registration components with Sentry integration
// =============================================
import React from 'react';
import * as Sentry from '@sentry/react';

class RegistrationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        errorBoundary: 'RegistrationErrorBoundary',
        component: 'registration',
      },
    });

    // Save error details to state
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('RegistrationErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="error-boundary-container">
          <div className="error-content">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Qualcosa è andato storto</h2>
            <p className="error-message">
              Si è verificato un errore durante la registrazione. Il nostro team è stato avvisato e
              risolverà il problema al più presto.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Dettagli errore (solo in sviluppo)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="error-actions">
              <button onClick={this.handleReset} className="btn-retry">
                🔄 Riprova
              </button>
              <button onClick={() => (window.location.href = '/')} className="btn-home">
                🏠 Torna alla Home
              </button>
            </div>
          </div>

          <style jsx>{`
            .error-boundary-container {
              min-height: 400px;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              background-color: var(--color-bg-light, #f9f9f9);
            }

            .error-content {
              max-width: 600px;
              text-align: center;
              background-color: white;
              padding: 3rem 2rem;
              border-radius: 12px;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            }

            .error-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }

            .error-title {
              font-size: 1.75rem;
              font-weight: 700;
              color: var(--color-error, #dc3545);
              margin-bottom: 1rem;
            }

            .error-message {
              font-size: 1.125rem;
              color: var(--color-text, #666);
              line-height: 1.6;
              margin-bottom: 2rem;
            }

            .error-details {
              text-align: left;
              margin: 1.5rem 0;
              padding: 1rem;
              background-color: var(--color-bg-light, #f5f5f5);
              border-radius: 6px;
              border: 1px solid var(--color-border, #ddd);
            }

            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              color: var(--color-text, #333);
              margin-bottom: 0.5rem;
            }

            .error-stack {
              font-size: 0.875rem;
              color: var(--color-error, #dc3545);
              overflow-x: auto;
              padding: 0.5rem;
              background-color: white;
              border-radius: 4px;
              margin-top: 0.5rem;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
            }

            .btn-retry,
            .btn-home {
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
              border: none;
            }

            .btn-retry {
              background-color: var(--color-primary, #007bff);
              color: white;
            }

            .btn-retry:hover {
              background-color: var(--color-primary-dark, #0056b3);
              transform: translateY(-2px);
            }

            .btn-home {
              background-color: transparent;
              color: var(--color-text, #333);
              border: 1px solid var(--color-border, #ccc);
            }

            .btn-home:hover {
              background-color: var(--color-bg-light, #f5f5f5);
            }

            /* Dark mode */
            @media (prefers-color-scheme: dark) {
              .error-boundary-container {
                background-color: var(--color-bg-dark, #1a1a1a);
              }

              .error-content {
                background-color: var(--color-bg-dark, #2a2a2a);
                color: var(--color-text-dark, #e0e0e0);
              }

              .error-details {
                background-color: var(--color-bg-dark-light, #333);
              }

              .error-stack {
                background-color: var(--color-bg-dark, #1a1a1a);
              }
            }
          `}</style>
        </div>
      );
    }

    // Render children normally
    return this.props.children;
  }
}

export default RegistrationErrorBoundary;

