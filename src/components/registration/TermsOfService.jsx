// =============================================
// FILE: src/components/registration/TermsOfService.jsx
// GDPR-compliant Terms of Service acceptance component
// =============================================
import React from 'react';
import { themeTokens } from '@lib/theme.js';

export default function TermsOfService({ accepted, onAcceptanceChange, showError = false, T = themeTokens() }) {
  return (
    <div className="space-y-3">
      {/* Main TOS checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => onAcceptanceChange(e.target.checked)}
          className={`mt-1 h-4 w-4 rounded ${T.border} text-blue-600 focus:ring-blue-500 cursor-pointer`}
          required
        />
        <span className={`text-sm ${T.text} group-hover:${T.neonText} transition-colors`}>
          Accetto i{' '}
          <a
            href="/terms-and-conditions"
            target="_blank"
            rel="noopener noreferrer"
            className={`${T.link} underline font-medium`}
            onClick={(e) => e.stopPropagation()}
          >
            Termini e Condizioni d&apos;Uso
          </a>{' '}
          e la{' '}
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className={`${T.link} underline font-medium`}
            onClick={(e) => e.stopPropagation()}
          >
            Privacy Policy
          </a>
        </span>
      </label>

      {/* Error message */}
      {showError && !accepted && (
        <div className={`flex items-start gap-2 text-xs ${T.accentBad} ${T.cardBg} border ${T.border} rounded-lg p-2`}>
          <span className="text-sm">⚠️</span>
          <p className="font-medium">
            Devi accettare i Termini e Condizioni per procedere con la registrazione
          </p>
        </div>
      )}

      {/* GDPR info */}
      <div className={`${T.cardBg} border ${T.border} rounded-lg p-3`}>
        <p className={`text-xs font-semibold ${T.text} mb-2`}>
          🔒 Protezione dei tuoi dati (GDPR)
        </p>
        <ul className={`text-xs ${T.subtext} space-y-1.5 ml-4 list-disc`}>
          <li>I tuoi dati saranno trattati in conformità con il GDPR</li>
          <li>
            Puoi richiedere l&apos;accesso, la modifica o la cancellazione dei tuoi dati in
            qualsiasi momento
          </li>
          <li>I tuoi dati non saranno condivisi con terze parti senza il tuo consenso</li>
          <li>Utilizziamo crittografia per proteggere le tue informazioni</li>
        </ul>
      </div>

      {/* Marketing consent (optional) */}
      <div className={`pt-2 border-t ${T.border}`}>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className={`mt-1 h-4 w-4 rounded ${T.border} text-blue-600 focus:ring-blue-500 cursor-pointer`}
          />
          <span className={`text-sm ${T.subtext} group-hover:${T.text} transition-colors`}>
            <span className={`font-medium ${T.text}`}>(Facoltativo)</span>{' '}
            Desidero ricevere aggiornamenti, offerte e comunicazioni promozionali via email
          </span>
        </label>
      </div>
    </div>
  );
}
