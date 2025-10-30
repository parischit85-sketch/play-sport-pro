import React from 'react';
import { ACTIONS } from './reducers/playerDetailsReducer';

/**
 * PlayerEditMode - Form per modifica dati giocatore
 *
 * Gestisce tutta la logica di edit con validazione inline
 * Usa reducer dispatch per aggiornamenti stato
 */
const PlayerEditMode = ({ state, dispatch, T }) => {
  const { editFormData, editErrors } = state;

  const handleFieldChange = (field, value) => {
    dispatch({
      type: ACTIONS.UPDATE_FORM_FIELD,
      payload: { field, value },
    });
  };

  return (
    <div className="space-y-6">
      {/* Nome Giocatore - Header */}
      <div className="mb-6">
        <h2 className={`text-3xl font-bold ${T.text} flex items-center gap-3`}>
          <span className="text-4xl">✏️</span>
          Modifica {editFormData.firstName} {editFormData.lastName}
        </h2>
        <p className={`text-sm ${T.subtext} mt-2`}>
          Compila i campi sottostanti per aggiornare le informazioni del giocatore
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dati di contatto */}
        <div className={`${T.cardBg} ${T.border} rounded-xl p-4`}>
          <h3 className={`font-semibold ${T.text} mb-4 flex items-center gap-2`}>📧 Contatti</h3>

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>Nome *</label>
              <input
                type="text"
                value={editFormData.firstName || ''}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                className={`${T.input} w-full ${editErrors.firstName ? 'border-red-500' : ''}`}
                placeholder="Nome"
              />
              {editErrors.firstName && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  ⚠️ {editErrors.firstName}
                </p>
              )}
            </div>

            {/* Cognome */}
            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>Cognome *</label>
              <input
                type="text"
                value={editFormData.lastName || ''}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                className={`${T.input} w-full ${editErrors.lastName ? 'border-red-500' : ''}`}
                placeholder="Cognome"
              />
              {editErrors.lastName && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  ⚠️ {editErrors.lastName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>Email</label>
              <input
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={`${T.input} w-full ${editErrors.email ? 'border-red-500' : ''}`}
                placeholder="email@esempio.com"
              />
              {editErrors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  ⚠️ {editErrors.email}
                </p>
              )}
            </div>

            {/* Telefono */}
            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>Telefono</label>
              <input
                type="tel"
                value={editFormData.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className={`${T.input} w-full ${editErrors.phone ? 'border-red-500' : ''}`}
                placeholder="+39 123 456 7890"
              />
              {editErrors.phone && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  ⚠️ {editErrors.phone}
                </p>
              )}
            </div>

            {/* Data di nascita */}
            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>Data di nascita</label>
              <input
                type="date"
                value={editFormData.dateOfBirth || ''}
                onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                className={`${T.input} w-full`}
              />
            </div>

            {/* Codice fiscale */}
            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>Codice Fiscale</label>
              <input
                type="text"
                value={editFormData.fiscalCode || ''}
                onChange={(e) => handleFieldChange('fiscalCode', e.target.value.toUpperCase())}
                className={`${T.input} w-full ${editErrors.fiscalCode ? 'border-red-500' : ''}`}
                placeholder="RSSMRA80A01H501U"
                maxLength={16}
              />
              {editErrors.fiscalCode && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  ⚠️ {editErrors.fiscalCode}
                </p>
              )}
            </div>

            {/* Indirizzo */}
            <div className="space-y-3">
              <h4 className={`font-medium ${T.text}`}>Indirizzo</h4>

              <input
                type="text"
                value={editFormData.address?.street || ''}
                onChange={(e) => handleFieldChange('address.street', e.target.value)}
                className={`${T.input} w-full`}
                placeholder="Via, numero civico"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={editFormData.address?.city || ''}
                  onChange={(e) => handleFieldChange('address.city', e.target.value)}
                  className={`${T.input} w-full`}
                  placeholder="Città"
                />
                <input
                  type="text"
                  value={editFormData.address?.province || ''}
                  onChange={(e) => handleFieldChange('address.province', e.target.value)}
                  className={`${T.input} w-full`}
                  placeholder="Provincia"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={editFormData.address?.postalCode || ''}
                  onChange={(e) => handleFieldChange('address.postalCode', e.target.value)}
                  className={`${T.input} w-full`}
                  placeholder="CAP"
                />
                <input
                  type="text"
                  value={editFormData.address?.country || 'Italia'}
                  onChange={(e) => handleFieldChange('address.country', e.target.value)}
                  className={`${T.input} w-full`}
                  placeholder="Paese"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dati sportivi */}
        <div className={`${T.cardBg} ${T.border} rounded-xl p-4`}>
          <h3 className={`font-semibold ${T.text} mb-4 flex items-center gap-2`}>
            🏃 Dati Sportivi
          </h3>

          <div className="space-y-4">
            {/* Categoria */}
            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>Categoria</label>
              <select
                value={editFormData.category || 'adult'}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                className={`${T.input} w-full`}
              >
                <option value="adult">👨 Adulto</option>
                <option value="junior">👦 Giovane</option>
                <option value="senior">👴 Senior</option>
              </select>
            </div>

            {/* Genere */}
            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>Genere</label>
              <select
                value={editFormData.gender || 'male'}
                onChange={(e) => handleFieldChange('gender', e.target.value)}
                className={`${T.input} w-full`}
              >
                <option value="male">👨 Maschio</option>
                <option value="female">👩 Femmina</option>
                <option value="other">🧑 Altro</option>
              </select>
            </div>

            {/* Giocatore attivo */}
            <div>
              <label className={`flex items-center gap-2 ${T.text}`}>
                <input
                  type="checkbox"
                  checked={editFormData.isActive !== false}
                  onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                  className="rounded"
                />
                Giocatore attivo
              </label>
              <p className={`text-xs ${T.subtext} mt-1 ml-6`}>
                I giocatori inattivi non appaiono nelle selezioni per i match
              </p>
            </div>

            {/* Partecipa al campionato */}
            <div>
              <label className={`flex items-center gap-2 ${T.text}`}>
                <input
                  type="checkbox"
                  checked={editFormData.tournamentData?.isParticipant !== false}
                  onChange={(e) =>
                    handleFieldChange('tournamentData.isParticipant', e.target.checked)
                  }
                  className="rounded"
                />
                Partecipa al Campionato
              </label>
              <p className={`text-xs ${T.subtext} mt-1 ml-6`}>
                I giocatori che non partecipano al campionato non appaiono nelle classifiche
              </p>
            </div>
          </div>
        </div>

        {/* Tag e preferenze */}
        <div className={`${T.cardBg} ${T.border} rounded-xl p-4 lg:col-span-2`}>
          <h3 className={`font-semibold ${T.text} mb-4 flex items-center gap-2`}>
            🏷️ Tag e Preferenze
          </h3>

          <div className="space-y-4">
            {/* Tags */}
            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>
                Tag (separati da virgola)
              </label>
              <input
                type="text"
                value={editFormData.tags?.join(', ') || ''}
                onChange={(e) =>
                  handleFieldChange(
                    'tags',
                    e.target.value
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                  )
                }
                className={`${T.input} w-full`}
                placeholder="Pro, Esperto, Beginner"
              />
              <p className={`text-xs ${T.subtext} mt-1`}>
                I tag aiutano a categorizzare i giocatori
              </p>
            </div>

            {/* Preferenze */}
            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>
                Preferenze (separati da virgola)
              </label>
              <input
                type="text"
                value={
                  Array.isArray(editFormData.playingPreferences)
                    ? editFormData.playingPreferences.join(', ')
                    : ''
                }
                onChange={(e) =>
                  handleFieldChange(
                    'playingPreferences',
                    e.target.value
                      .split(',')
                      .map((pref) => pref.trim())
                      .filter(Boolean)
                  )
                }
                className={`${T.input} w-full`}
                placeholder="Singolo, Doppio, Serale"
              />
              <p className={`text-xs ${T.subtext} mt-1`}>Preferenze di gioco e disponibilità</p>
            </div>
          </div>
        </div>

        {/* Messaggio di validazione */}
        {Object.keys(editErrors).length > 0 && (
          <div className="lg:col-span-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-xl">⚠️</span>
              <div>
                <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">
                  Correggi i seguenti errori:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-600 dark:text-red-400">
                  {Object.entries(editErrors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(PlayerEditMode);
