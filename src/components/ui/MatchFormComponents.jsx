/**
 * Enhanced UI components for Match Creation form
 */

import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Loader2, Trophy } from 'lucide-react';

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
        <span className="text-sm font-medium text-slate-300">Completamento Form</span>
        <span className="text-sm text-slate-400">{progress}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {message && <div className="mt-2 text-sm text-slate-400">{message.message}</div>}
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
      <span className={`text-sm ${isError ? 'text-red-400' : 'text-yellow-400'}`}>
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
        return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50 bg-red-900/20`;
      case 'warning':
        return `${baseClasses} border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500 bg-yellow-50 bg-yellow-900/20`;
      case 'valid':
        return value
          ? `${baseClasses} border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50 bg-green-900/20`
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

  const getInputClasses = (_isTeamA = true) => {
    const baseClasses = `${T.input} w-16 text-center transition-all duration-200`;

    if (error) {
      return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50 bg-red-900/20`;
    }
    if (warning) {
      return `${baseClasses} border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500 bg-yellow-50 bg-yellow-900/20`;
    }
    if (setData.a !== '' && setData.b !== '') {
      return `${baseClasses} border-green-300 focus:border-green-500 focus:ring-green-500 bg-green-50 bg-green-900/20`;
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
 * Match Summary Card - Compact version
 */
export const MatchSummaryCard = ({ validation, playersById, formData, T, className = '' }) => {
  const { result, summary, canSubmit } = validation;
  const { a1, a2, b1, b2 } = formData;

  const getPlayerName = (id) => playersById[id]?.name || '—';

  return (
    <div className={`${T.borderMd} ${T.cardBg} p-4 ${T.border} ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-blue-400" />
          <span className={`text-sm font-semibold ${T.text}`}>Riepilogo Partita</span>
        </div>
        {canSubmit && (
          <span className="text-xs px-2 py-1 rounded bg-green-900/40 text-green-300 border border-green-700/40">
            ✓ Pronta
          </span>
        )}
      </div>

      {/* Teams Comparison */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        {/* Team A */}
        <div className="bg-blue-900/20 rounded-lg p-2 border border-blue-700/30">
          <div className="text-xs text-blue-300 font-semibold mb-1">🅰️ Team A</div>
          <div className="text-xs text-white font-medium truncate">{getPlayerName(a1)}</div>
          {a2 && <div className="text-xs text-blue-200 truncate">{getPlayerName(a2)}</div>}
        </div>

        {/* Result */}
        <div className="flex flex-col items-center justify-center bg-indigo-900/20 rounded-lg border border-indigo-700/30 py-2">
          {result && summary.setsCompleted > 0 ? (
            <>
              <div className="text-xs text-slate-300 mb-0.5">Sets</div>
              <div className="text-lg font-bold text-white">
                <span className={result.setsA > result.setsB ? 'text-blue-300' : ''}>
                  {result.setsA}
                </span>
                <span className="text-slate-400 mx-1">-</span>
                <span className={result.setsB > result.setsA ? 'text-red-300' : ''}>
                  {result.setsB}
                </span>
              </div>
              {result.winner && (
                <div className="text-xs text-green-300 mt-0.5">🏆 {result.winner}</div>
              )}
            </>
          ) : (
            <div className="text-xs text-slate-400">—</div>
          )}
        </div>

        {/* Team B */}
        <div className="bg-red-900/20 rounded-lg p-2 border border-red-700/30">
          <div className="text-xs text-red-300 font-semibold mb-1">🅱️ Team B</div>
          <div className="text-xs text-white font-medium truncate">{getPlayerName(b1)}</div>
          {b2 && <div className="text-xs text-red-200 truncate">{getPlayerName(b2)}</div>}
        </div>
      </div>

      {/* Games Detail */}
      {result && summary.setsCompleted > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-700/30 text-xs text-slate-300 text-center">
          Games:{' '}
          <span className="font-mono">
            {result.gamesA}-{result.gamesB}
          </span>
        </div>
      )}

      {/* Status */}
      {!canSubmit && (
        <div className="mt-2 text-xs text-amber-300 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Completa i dettagli
        </div>
      )}
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
      'fixed top-4 right-4 max-w-md bg-white bg-gray-800 rounded-lg shadow-lg border p-4 z-50 transform transition-all duration-300';

    switch (type) {
      case 'success':
        return `${baseClasses} border-green-800`;
      case 'error':
        return `${baseClasses} border-red-800`;
      case 'warning':
        return `${baseClasses} border-yellow-800`;
      default:
        return `${baseClasses} border-blue-800`;
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
          <div className="text-sm font-medium text-gray-100">{message}</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
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
