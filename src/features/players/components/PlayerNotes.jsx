// =============================================
// FILE: src/features/players/components/PlayerNotes.jsx
// Gestione note del giocatore
// Updated: 2025-10-13 - Fixed React key warning
// =============================================

import React, { useState } from 'react';
import { uid } from '@lib/ids.js';
import { createNoteSchema, NOTE_TYPES } from '../types/playerTypes.js';

export default function PlayerNotes({ player, onUpdate, T }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState(createNoteSchema());

  const notes = player.notes || [];

  const handleSaveNote = () => {
    if (!formData.title.trim() || !formData.content.trim()) return;

    const newNote = {
      ...formData,
      id: editingNote?.id || uid(),
      createdAt: editingNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user', // In futuro userà l'ID utente corrente
    };

    const updatedNotes = editingNote
      ? notes.map((n) => (n.id === editingNote.id ? newNote : n))
      : [...notes, newNote];

    onUpdate({
      notes: updatedNotes,
      updatedAt: new Date().toISOString(),
    });

    setFormData(createNoteSchema());
    setShowAddForm(false);
    setEditingNote(null);
  };

  const handleEditNote = (note) => {
    setFormData(note);
    setEditingNote(note);
    setShowAddForm(true);
  };

  const handleDeleteNote = (noteId) => {
    if (!confirm('Sei sicuro di voler eliminare questa nota?')) return;

    const updatedNotes = notes.filter((n) => n.id !== noteId);
    onUpdate({
      notes: updatedNotes,
      updatedAt: new Date().toISOString(),
    });
  };

  const getNoteTypeLabel = (type) => {
    switch (type) {
      case NOTE_TYPES.GENERAL:
        return '📝 Generale';
      case NOTE_TYPES.BOOKING:
        return '📅 Prenotazione';
      case NOTE_TYPES.PAYMENT:
        return '💰 Pagamento';
      case NOTE_TYPES.DISCIPLINARY:
        return '⚠️ Disciplinare';
      case NOTE_TYPES.MEDICAL:
        return '🏥 Medica';
      default:
        return '📝 Generale';
    }
  };

  const getNoteTypeColor = (type) => {
    switch (type) {
      case NOTE_TYPES.BOOKING:
        return 'bg-blue-900/20 text-blue-400';
      case NOTE_TYPES.PAYMENT:
        return 'bg-green-900/20 text-green-400';
      case NOTE_TYPES.DISCIPLINARY:
        return 'bg-red-900/20 text-red-400';
      case NOTE_TYPES.MEDICAL:
        return 'bg-orange-100 bg-orange-900/20 text-orange-600 text-orange-400';
      default:
        return 'bg-gray-100 bg-gray-700 text-gray-600 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className={`${T.cardBg} ${T.border} rounded-2xl p-6 shadow-lg relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500" />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-4xl">📝</span>
              <div>
                <h3 className={`text-2xl font-bold ${T.text}`}>Note Giocatore</h3>
                <p className={`text-sm ${T.subtext}`}>
                  {notes.length} {notes.length === 1 ? 'nota' : 'note'} registrate
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFormData(createNoteSchema());
                setEditingNote(null);
                setShowAddForm(true);
              }}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold hover:shadow-lg transition-shadow hover:scale-105 transform"
            >
              <span className="mr-2">➕</span>
              Nuova Nota
            </button>
          </div>
        </div>
      </div>

      {/* Form aggiunta/modifica */}
      {showAddForm && (
        <div className={`${T.cardBg} ${T.border} rounded-xl p-4`}>
          <h4 className={`font-medium ${T.text} mb-4`}>
            {editingNote ? 'Modifica Nota' : 'Nuova Nota'}
          </h4>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${T.text} mb-1`}>Titolo</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className={`${T.input} w-full`}
                  placeholder="Titolo della nota"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${T.text} mb-1`}>Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  className={`${T.input} w-full`}
                >
                  {Object.values(NOTE_TYPES).map((type) => (
                    <option key={type} value={type}>
                      {getNoteTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>Contenuto</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                className={`${T.input} w-full`}
                rows={4}
                placeholder="Descrizione dettagliata..."
              />
            </div>

            <div>
              <label className={`flex items-center gap-2 ${T.text}`}>
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isPrivate: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                Nota privata (visibile solo agli amministratori)
              </label>
            </div>

            <div>
              <label className={`block text-sm font-medium ${T.text} mb-1`}>
                Tag (separati da virgola)
              </label>
              <input
                type="text"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tags: e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean),
                  }))
                }
                className={`${T.input} w-full`}
                placeholder="urgente, follow-up, importante"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingNote(null);
                  setFormData(createNoteSchema());
                }}
                className={`${T.btnSecondary} px-4 py-2`}
              >
                Annulla
              </button>
              <button onClick={handleSaveNote} className={`${T.btnPrimary} px-4 py-2`}>
                {editingNote ? 'Aggiorna' : 'Salva'} Nota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista note */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className={`text-center py-8 ${T.cardBg} ${T.border} rounded-xl`}>
            <div className="text-4xl mb-2">📝</div>
            <div className={`${T.subtext} mb-4`}>Nessuna nota presente</div>
            <button
              onClick={() => {
                setFormData(createNoteSchema());
                setEditingNote(null);
                setShowAddForm(true);
              }}
              className={`${T.btnPrimary} px-6 py-3`}
            >
              Aggiungi Prima Nota
            </button>
          </div>
        ) : (
          notes
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((note) => (
              <div key={note.id} className={`${T.cardBg} ${T.border} rounded-xl p-4`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className={`font-semibold ${T.text}`}>{note.title}</h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getNoteTypeColor(note.type)}`}
                    >
                      {getNoteTypeLabel(note.type)}
                    </span>
                    {note.isPrivate && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-900/20 text-purple-400">
                        🔒 Privata
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                      title="Modifica"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      title="Elimina"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className={`${T.text} mb-3 whitespace-pre-wrap`}>{note.content}</div>

                <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 text-gray-400">
                  <div className="flex items-center gap-4">
                    <span>📅 {new Date(note.createdAt).toLocaleDateString('it-IT')}</span>
                    <span>👤 {note.createdBy || 'Sistema'}</span>
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 bg-gray-700 text-gray-600 text-gray-300 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
