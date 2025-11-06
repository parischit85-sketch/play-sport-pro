// =============================================
// FILE: src/components/registration/PasswordStrengthMeter.jsx
// Visual password strength indicator with requirements checklist
// =============================================
import React from 'react';
import { themeTokens } from '@lib/theme.js';
import {
  calculatePasswordStrength,
  getPasswordStrengthLevel,
  getPasswordRequirements,
} from '@utils/validators';

export default function PasswordStrengthMeter({ password, T = themeTokens() }) {
  const strength = calculatePasswordStrength(password);
  const level = getPasswordStrengthLevel(strength);
  const requirements = getPasswordRequirements(password);

  // Color schemes based on strength level using theme tokens
  const getColorClasses = () => {
    switch (level) {
      case 'weak':
        return {
          bg: 'bg-red-500',
          text: T.accentBad,
          border: 'border-red-500',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-500',
          text: T.accentWarning,
          border: 'border-yellow-500',
        };
      case 'strong':
        return {
          bg: 'bg-green-500',
          text: T.accentGood,
          border: 'border-green-500',
        };
      default:
        return {
          bg: 'bg-gray-300',
          text: T.subtext,
          border: 'border-gray-300',
        };
    }
  };

  const colors = getColorClasses();

  // Don't show if password is empty
  if (!password) {
    return null;
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className={`${T.subtext} font-medium`}>Sicurezza password</span>
          <span className={`font-semibold ${colors.text}`}>
            {level === 'weak' && '❌ Debole'}
            {level === 'medium' && '⚠️ Media'}
            {level === 'strong' && '✅ Forte'}
          </span>
        </div>

        {/* Progress bar */}
        <div className={`h-2 ${T.inputBg} rounded-full overflow-hidden`}>
          <div
            className={`h-full ${colors.bg} transition-all duration-300 ease-out`}
            style={{ width: `${strength}%` }}
          />
        </div>

        {/* Percentage */}
        <div className={`text-xs text-right ${T.subtext}`}>{strength}%</div>
      </div>

      {/* Requirements Checklist */}
      <div className={`${T.cardBg} rounded-lg p-3 space-y-1.5 border ${T.border}`}>
        <p className={`text-xs font-semibold ${T.text} mb-2`}>
          Requisiti password:
        </p>
        {requirements.map((req, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-sm mt-0.5">{req.met ? '✅' : req.required ? '❌' : '⭕'}</span>
            <span
              className={`text-xs ${
                req.met
                  ? T.accentGood + ' font-medium'
                  : req.required
                    ? T.accentBad
                    : T.subtext
              }`}
            >
              {req.label}
              {!req.required && ' (opzionale)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
