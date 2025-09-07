// =============================================
// FILE: src/features/prenota/RulesEditor.jsx
// =============================================
import React from 'react';
import { euro2 } from '@lib/format.js';

const pad2 = (n) => String(n).padStart(2, '0');
const toTime = (s = '09:00') => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s).trim());
  if (!m) return '09:00';
  const hh = Math.min(23, Math.max(0, Number(m[1] || 0)));
  const mm = Math.min(59, Math.max(0, Number(m[2] || 0)));
  return `${pad2(hh)}:${pad2(mm)}`;
};

function DayToggles({ value = [], onChange, T }) {
  const days = ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'];
  const toggle = (idx) => {
    const has = value.includes(idx);
    onChange(has ? value.filter(d => d !== idx) : [...value, idx].sort((a,b)=>a-b));
  };
  return (
    <div className="flex flex-wrap gap-1">
      {days.map((d, i) => (
        <button
          type="button"
          key={i}
          onClick={() => toggle(i)}
          className={`px-2 h-6 rounded-md text-xs ring-1 ${
            value.includes(i)
              ? 'bg-emerald-500 text-black ring-emerald-500/60'
              : `${T.ghostRing} ${T.cardBg}`
          }`}
        >
          {d}
        </button>
      ))}
    </div>
  );
}

function CourtsPicker({ courts = [], value = [], onChange, T }) {
  const toggle = (id) => {
    const has = value.includes(id);
    onChange(has ? value.filter((x) => x !== id) : [...value, id]);
  };
  return (
    <div className="mt-2">
      <div className={`text-xs ${T.subtext}`}>Campi <span className="opacity-70">(vuoto = tutti)</span></div>
      <div className="mt-1 max-h-40 overflow-auto pr-1 rounded-md">
        {courts.length === 0 ? (
          <div className={`text-xs ${T.subtext}`}>Nessun campo configurato.</div>
        ) : (
          <div className="space-y-1">
            {courts.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="accent-emerald-500"
                  checked={value.includes(c.id)}
                  onChange={() => toggle(c.id)}
                />
                <span className="truncate">{c.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        {/* RIMOSSO: pulsante "Tutti i campi" */}
        <button type="button" className={T.btnGhost} onClick={() => onChange(courts.map(c => c.id))}>Seleziona tutti</button>
        <button type="button" className={T.btnGhost} onClick={() => onChange([])}>Pulisci</button>
      </div>
    </div>
  );
}

export default function RulesEditor({ title, list = [], onChange, courts = [], T }) {
  const update = (idx, patch) => {
    const next = list.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    onChange(next);
  };
  const remove = (idx) => onChange(list.filter((_, i) => i !== idx));
  const add = () =>
    onChange([
      ...list,
      {
        label: 'Nuova fascia',
        eurPerHour: 20,
        from: '08:00',
        to: '11:00',
        days: [1,2,3,4,5],  // Lun–Ven
        courts: [],         // vuoto = tutti i campi
      },
    ]);

  // stima prezzo per persona su 90′
  const perPlayer90 = (eurPerHour) => {
    const total = (Number(eurPerHour) || 0) * 1.5; // 90 minuti
    return euro2(total / 4);
  };

  return (
    <div className={`rounded-2xl ${T.cardBg} ${T.border} p-3`}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">{title}</div>
        <button type="button" className={T.btnGhost} onClick={add}>+ Aggiungi fascia</button>
      </div>

      <div className="grid gap-3">
        {list.map((r, i) => (
          <div
            key={i}
            className={`relative rounded-xl p-3 ${
              T.name === 'dark'
                ? `${T.cardBg} ${T.border}`
                : 'bg-emerald-50 ring-2 ring-emerald-500/70'
            }`}
          >
            {/* X rimuovi */}
            <button
              type="button"
              className="absolute top-2 right-2 text-rose-500 text-xs hover:underline z-10"
              onClick={() => remove(i)}
              title="Rimuovi fascia"
            >
              ✕
            </button>

            <div className="grid lg:grid-cols-2 gap-3">
              {/* Sezione principale con form */}
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <label className={`text-xs ${T.subtext}`}>Etichetta</label>
                    <input
                      value={r.label || ''}
                      onChange={(e) => update(i, { label: e.target.value })}
                      className={T.input}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className={`text-xs ${T.subtext}`}>€/h</label>
                    <input
                      type="number"
                      value={r.eurPerHour ?? 0}
                      onChange={(e) => update(i, { eurPerHour: Number(e.target.value) || 0 })}
                      className={T.input}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <label className={`text-xs ${T.subtext}`}>Inizio</label>
                    <input
                      type="time"
                      value={toTime(r.from)}
                      onChange={(e) => update(i, { from: toTime(e.target.value) })}
                      className={T.input}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className={`text-xs ${T.subtext}`}>Fine</label>
                    <input
                      type="time"
                      value={toTime(r.to)}
                      onChange={(e) => update(i, { to: toTime(e.target.value) })}
                      className={T.input}
                    />
                  </div>
                </div>

                <div>
                  <div className={`text-xs ${T.subtext}`}>Giorni</div>
                  <DayToggles
                    value={Array.isArray(r.days) ? r.days : []}
                    onChange={(days) => update(i, { days })}
                    T={T}
                  />
                </div>

                <CourtsPicker
                  courts={courts}
                  value={Array.isArray(r.courts) ? r.courts : []}
                  onChange={(courtsSel) => update(i, { courts: courtsSel })}
                  T={T}
                />
              </div>

              {/* Sezione prezzo - separata e responsive */}
              <div className="flex lg:justify-end">
                <div
                  className="flex-shrink-0 px-3 py-2 rounded-lg ring-1 bg-emerald-50/50 dark:bg-emerald-900/20"
                  style={{ borderColor: 'rgba(16,185,129,0.45)' }}
                >
                  <div className="text-center">
                    <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                      1:30h/persona
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold leading-none text-emerald-800 dark:text-emerald-200">
                      {perPlayer90(r.eurPerHour)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
