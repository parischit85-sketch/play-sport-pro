/**
 * Optimistic Update Indicators
 * Visual feedback components for optimistic updates
 */

import React from 'react';

/**
 * Saving indicator with spinner
 */
export function SavingIndicator({ message = 'Salvataggio...', age = null }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-900/20 border border-blue-800 rounded-lg">
      <svg className="animate-spin h-4 w-4 text-blue-400" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="text-sm font-medium text-blue-300">{message}</span>
      {age !== null && <span className="text-xs text-blue-400">({(age / 1000).toFixed(1)}s)</span>}
    </div>
  );
}

/**
 * Success indicator
 */
export function SuccessIndicator({ message = 'Salvato!' }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-green-900/20 border border-green-800 rounded-lg">
      <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span className="text-sm font-medium text-green-300">{message}</span>
    </div>
  );
}

/**
 * Error indicator with rollback message
 */
export function ErrorIndicator({ message = 'Errore - modifiche annullate', onRetry = null }) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-red-900/20 border border-red-800 rounded-lg">
      <div className="flex items-center gap-2">
        <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-sm font-medium text-red-300">{message}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="text-xs font-medium text-red-400 hover:underline">
          Riprova
        </button>
      )}
    </div>
  );
}

/**
 * Inline optimistic badge (small indicator)
 */
export function OptimisticBadge({ isPending, age = null }) {
  if (!isPending) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-900/30 rounded-full text-xs font-medium text-blue-300">
      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      Aggiornamento...
      {age !== null && <span className="opacity-75">({(age / 1000).toFixed(0)}s)</span>}
    </span>
  );
}

/**
 * Toast notification for optimistic updates
 */
export function OptimisticToast({ status, message, age, onClose, autoClose = 3000 }) {
  React.useEffect(() => {
    if (status === 'success' && autoClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [status, autoClose, onClose]);

  if (!status) return null;

  const statusConfig = {
    pending: {
      bg: 'bg-blue-900/20',
      border: 'border-blue-800',
      text: 'text-blue-300',
      icon: (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ),
    },
    success: {
      bg: 'bg-green-900/20',
      border: 'border-green-800',
      text: 'text-green-300',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    error: {
      bg: 'bg-red-900/20',
      border: 'border-red-800',
      text: 'text-red-300',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 ${config.bg} border ${config.border} rounded-lg shadow-lg min-w-[300px] max-w-md`}
    >
      <div className={config.text}>{config.icon}</div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${config.text}`}>{message}</p>
        {status === 'pending' && age !== null && (
          <p className={`text-xs ${config.text} opacity-75 mt-0.5`}>
            Tempo: {(age / 1000).toFixed(1)}s
          </p>
        )}
      </div>
      {onClose && (
        <button onClick={onClose} className={`${config.text} hover:opacity-75`}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Progress bar for optimistic updates
 */
export function OptimisticProgress({ isPending, progress = null, timeout = 10000 }) {
  const [currentProgress, setCurrentProgress] = React.useState(0);

  React.useEffect(() => {
    if (!isPending) {
      setCurrentProgress(100);
      return;
    }

    if (progress !== null) {
      setCurrentProgress(progress);
      return;
    }

    // Simulate progress based on timeout
    const interval = setInterval(() => {
      setCurrentProgress((prev) => {
        const increment = (100 / timeout) * 100; // Update every 100ms
        return Math.min(prev + increment, 95); // Max 95% until confirmed
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPending, progress, timeout]);

  if (!isPending && currentProgress >= 100) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-blue-300">Salvataggio in corso...</span>
        <span className="text-xs font-medium text-blue-300">{Math.round(currentProgress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-200 ease-out"
          style={{ width: `${currentProgress}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Optimistic update wrapper - adds visual indicators to any component
 */
export function OptimisticWrapper({ isPending, age, children, showIndicator = true }) {
  return (
    <div className="relative">
      {children}
      {showIndicator && isPending && (
        <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[1px] rounded-lg flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg shadow-lg px-4 py-3">
            <SavingIndicator age={age} />
          </div>
        </div>
      )}
    </div>
  );
}
