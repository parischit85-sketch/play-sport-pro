// =============================================
// FILE: src/components/ErrorBoundary.jsx
// =============================================
import React from 'react';
import { trackError, getFriendlyErrorMessage } from '@lib/errorTracker';
import { XCircle, RefreshCw, Home, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Track error with errorTracker
    const errorObj = trackError(error, {
      componentStack: errorInfo.componentStack,
      boundary: this.props.boundaryName || 'ErrorBoundary',
    });

    this.setState({
      error,
      errorInfo,
      errorId: errorObj?.id,
    });

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          reset: this.handleReset,
        });
      }

      // Default fallback UI with friendly messages
      const friendlyMessage = getFriendlyErrorMessage(this.state.error);

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {/* Error Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
                {friendlyMessage.title}
              </h1>

              {/* Message */}
              <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-8">
                {friendlyMessage.message}
              </p>

              {/* Error ID */}
              {this.state.errorId && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    ID Errore: <span className="font-mono font-semibold">{this.state.errorId}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
                    Fornisci questo ID al supporto per assistenza
                  </p>
                </div>
              )}

              {/* Suggestions */}
              {friendlyMessage.suggestions && friendlyMessage.suggestions.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                      Cosa Puoi Fare
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {friendlyMessage.suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-blue-800 dark:text-blue-300"
                      >
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Riprova
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Ricarica Pagina
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
                >
                  <Home className="w-5 h-5" />
                  Home
                </button>
              </div>

              {/* Development Info */}
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-8">
                  <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Dettagli Tecnici (Development Only)
                  </summary>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                    <div className="mb-4">
                      <h4 className="text-red-400 font-semibold mb-2">Error:</h4>
                      <pre className="text-sm whitespace-pre-wrap">
                        {this.state.error.toString()}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div className="mb-4">
                        <h4 className="text-yellow-400 font-semibold mb-2">Stack Trace:</h4>
                        <pre className="text-xs whitespace-pre-wrap font-mono">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo && (
                      <div>
                        <h4 className="text-blue-400 font-semibold mb-2">Component Stack:</h4>
                        <pre className="text-xs whitespace-pre-wrap font-mono">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>

            {/* Footer */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Se il problema persiste, contatta il supporto tecnico
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
