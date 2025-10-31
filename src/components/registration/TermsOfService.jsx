// =============================================
// FILE: src/components/registration/TermsOfService.jsx
// GDPR-compliant Terms of Service acceptance component
// =============================================
import React from 'react';

export default function TermsOfService({ accepted, onAcceptanceChange, showError = false }) {
  return (
    <div className="space-y-3">
      {/* Main TOS checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => onAcceptanceChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          required
        />
        <span className="text-sm text-neutral-700 text-gray-300 group-hover:text-neutral-900 group-hover:text-white transition-colors">
          Accetto i{' '}
          <a
            href="/terms-of-service"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 text-indigo-400 hover:text-indigo-800 hover:text-indigo-300 underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            Termini e Condizioni d&apos;Uso
          </a>{' '}
          e la{' '}
          <a
            href="/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 text-indigo-400 hover:text-indigo-800 hover:text-indigo-300 underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            Privacy Policy
          </a>
        </span>
      </label>

      {/* Error message */}
      {showError && !accepted && (
        <div className="flex items-start gap-2 text-xs text-red-600 text-red-400 bg-red-50 bg-red-900/20 border border-red-200 border-red-800 rounded-lg p-2">
          <span className="text-sm">⚠️</span>
          <p className="font-medium">
            Devi accettare i Termini e Condizioni per procedere con la registrazione
          </p>
        </div>
      )}

      {/* GDPR info */}
      <div className="bg-blue-50 bg-blue-900/20 border border-blue-200 border-blue-800 rounded-lg p-3">
        <p className="text-xs font-semibold text-blue-700 text-blue-300 mb-2">
          🔒 Protezione dei tuoi dati (GDPR)
        </p>
        <ul className="text-xs text-blue-600 text-blue-400 space-y-1.5 ml-4 list-disc">
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
      <div className="pt-2 border-t border-gray-200 border-gray-700">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <span className="text-sm text-neutral-600 text-gray-400 group-hover:text-neutral-800 group-hover:text-gray-200 transition-colors">
            <span className="font-medium text-neutral-700 text-gray-300">(Facoltativo)</span>{' '}
            Desidero ricevere aggiornamenti, offerte e comunicazioni promozionali via email
          </span>
        </label>
      </div>
    </div>
  );
}
