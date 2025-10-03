/**
 * Enhanced UI components for Match Creation form
 */

import React from 'react';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Users,
  Trophy,
  Calendar,
} from 'lucide-react';

/**
 * Progress Bar Component
 */
export const FormProgressBar = ({ progress, message, className = '' }) => {
  const getProgressColor = () => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Completamento Form
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {message && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message.message}</div>
      )}
    </div>
  );
};

/**
 * Field Validation Feedback
 */
export const FieldFeedback = ({ error, warning, className = '' }) => {
  if (!error && !warning) return null;

  const isError = !!error;
  const feedback = error || warning;

  return (
    <div className={`flex items-center gap-2 mt-1 ${className}`}>
      {isError ? (
        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
      )}
      <span
        className={`text-sm ${isError ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`}
      >
        {feedback.message}
      </span>
    </div>
  );
};

/**
 * Enhanced Player Select with validation styling
 */
export const EnhancedPlayerSelect = ({
  players,
  value,
  onChange,
  disabledIds,
  validation,
  fieldName,
  placeholder,
  T,
  className = '',
}) => {
  const fieldState = validation
    ? validation.errors[fieldName]
      ? 'error'
      : validation.warnings[fieldName]
        ? 'warning'
        : 'valid'
    : 'default';

  const getFieldClasses = () => {
    const baseClasses = `${T.input} pr-8 w-full transition-all duration-200`;

    switch (fieldState) {
      case 'error':
        return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20`;
      case 'warning':
        return `${baseClasses} border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500 bg-yellow-50 dark:bg-yellow-900/20`;
      case 'valid':
        return value
          ? `${baseClasses} border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20`
          : baseClasses;
      default:
        return baseClasses;
    }
  };

  return (
    <div className={className}>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={getFieldClasses()}
        >
          <option value="">{placeholder || '— Seleziona giocatore —'}</option>
          {players.map((p) => (
            <option key={p.id} value={p.id} disabled={disabledIds?.has(p.id)}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Validation icon */}
        {value && (
          <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
            {fieldState === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
            {fieldState === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
            {fieldState === 'valid' && <CheckCircle className="w-4 h-4 text-green-500" />}
          </div>
        )}
      </div>

      <FieldFeedback
        error={validation?.errors[fieldName]}
        warning={validation?.warnings[fieldName]}
      />
    </div>
  );
};

/**
 * Enhanced Set Input with validation
 */
export const EnhancedSetInput = ({
  setIndex,
  setData,
  onChange,
  validation,
  T,
  className = '',
}) => {
  const fieldName = `set${setIndex}`;
  const error = validation?.errors[fieldName];
  const warning = validation?.warnings[fieldName];
  const hasIssue = error || warning;

  const getInputClasses = (isTeamA = true) => {
    const baseClasses = `${T.input} w-16 text-center transition-all duration-200`;

    if (error) {
      return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20`;
    }
    if (warning) {
      return `${baseClasses} border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500 bg-yellow-50 dark:bg-yellow-900/20`;
    }
    if (setData.a !== '' && setData.b !== '') {
      return `${baseClasses} border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50 dark:bg-green-900/20`;
    }

    return baseClasses;
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium w-12">Set {setIndex + 1}:</span>
        <div className="flex items-center gap-2 flex-1">
          <div className="relative">
            <input
              type="number"
              min="0"
              max="7"
              placeholder="A"
              className={getInputClasses(true)}
              value={setData.a}
              onChange={(e) => onChange(setIndex, 'a', e.target.value)}
            />
          </div>
          <span className="text-gray-400">-</span>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="7"
              placeholder="B"
              className={getInputClasses(false)}
              value={setData.b}
              onChange={(e) => onChange(setIndex, 'b', e.target.value)}
            />
          </div>

          {/* Set completion indicator */}
          {setData.a !== '' && setData.b !== '' && !hasIssue && (
            <CheckCircle className="w-4 h-4 text-green-500 ml-1" />
          )}
          {hasIssue && (
            <div className="ml-1">
              {error && <AlertCircle className="w-4 h-4 text-red-500" />}
              {!error && warning && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
            </div>
          )}
        </div>
      </div>

      <FieldFeedback error={error} warning={warning} className="ml-14" />
    </div>
  );
};

/**
 * Enhanced Submit Button with loading and states
 */
export const EnhancedSubmitButton = ({
  onClick,
  disabled,
  loading,
  validation,
  T,
  className = '',
}) => {
  const canSubmit = validation?.canSubmit && !loading;
  const isDisabled = disabled || !canSubmit;

  // 🔍 DEBUG: Button state
  console.log('🔘 SUBMIT BUTTON STATE:', {
    disabled,
    loading,
    canSubmit: validation?.canSubmit,
    isDisabled,
    validationSummary: validation?.summary,
    validationErrors: validation?.errors,
  });

  const getButtonClasses = () => {
    const baseClasses = `${T.btnPrimary} flex items-center justify-center gap-2 transition-all duration-200`;

    if (loading) {
      return `${baseClasses} opacity-75 cursor-wait`;
    }

    if (isDisabled) {
      return `${baseClasses} opacity-50 cursor-not-allowed`;
    }

    return `${baseClasses} hover:scale-105 hover:shadow-lg`;
  };

  const getButtonText = () => {
    if (loading) return 'Salvando...';
    if (!validation?.summary.hasWinner) return 'Completa risultato';
    if (validation?.summary.playersSelected < 4) return 'Seleziona giocatori';
    return 'Salva partita';
  };

  return (
    <button
      type="button"
      onClick={() => {
        console.log('🔘 EnhancedSubmitButton clicked', { isDisabled, canSubmit, loading });
        if (!isDisabled) {
          onClick();
        }
      }}
      disabled={isDisabled}
      className={`${getButtonClasses()} ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
      {getButtonText()}
    </button>
  );
};

/**
 * Match Summary Card with enhanced feedback
 */
export const MatchSummaryCard = ({ validation, playersById, formData, T, className = '' }) => {
  const { result, summary, canSubmit } = validation;
  const { a1, a2, b1, b2 } = formData;

  const getPlayerName = (id) => playersById[id]?.name || '—';

  return (
    <div
      className={`rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 p-4 ${T.border} ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <span className="font-medium text-gray-900 dark:text-gray-100">Riepilogo Partita</span>
      </div>

      {/* Teams Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">🅰️ Team A</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {getPlayerName(a1)} {a1 && a2 && '+'} {getPlayerName(a2)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
          <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">🅱️ Team B</div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {getPlayerName(b1)} {b1 && b2 && '+'} {getPlayerName(b2)}
          </div>
        </div>
      </div>

      {/* Result Display */}
      {result && summary.setsCompleted > 0 && (
        <div className="bg-white dark:bg-gray-700 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Risultato</span>
            {result.winner && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  result.winner === 'A'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}
              >
                🏆 Vince Team {result.winner}
              </span>
            )}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Sets:{' '}
            <span className="font-mono font-medium">
              {result.setsA}-{result.setsB}
            </span>
            {' | '}
            Games:{' '}
            <span className="font-mono font-medium">
              {result.gamesA}-{result.gamesB}
            </span>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div
        className={`flex items-center gap-2 text-sm ${
          canSubmit ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        {canSubmit ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        {canSubmit ? 'Pronta per il salvataggio' : 'In completamento...'}
      </div>
    </div>
  );
};

/**
 * Toast Notification Component
 */
export const ToastNotification = ({
  message,
  type = 'info',
  onClose,
  autoClose = true,
  duration = 5000,
  className = '',
}) => {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, duration]);

  const getToastClasses = () => {
    const baseClasses =
      'fixed top-4 right-4 max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4 z-50 transform transition-all duration-300';

    switch (type) {
      case 'success':
        return `${baseClasses} border-green-200 dark:border-green-800`;
      case 'error':
        return `${baseClasses} border-red-200 dark:border-red-800`;
      case 'warning':
        return `${baseClasses} border-yellow-200 dark:border-yellow-800`;
      default:
        return `${baseClasses} border-blue-200 dark:border-blue-800`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className={`${getToastClasses()} ${className}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{message}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default {
  FormProgressBar,
  FieldFeedback,
  EnhancedPlayerSelect,
  EnhancedSetInput,
  EnhancedSubmitButton,
  MatchSummaryCard,
  ToastNotification,
};
