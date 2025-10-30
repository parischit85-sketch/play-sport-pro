// Test component per verificare funzionalità base
import React, { useState } from 'react';

export default function TestPlayersCRM({ T }) {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount((prev) => prev + 1);
    console.log('Button clicked!', count + 1);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className={`text-2xl font-bold ${T?.text || 'text-gray-900'}`}>Test CRM Giocatori</h1>

      <div className={`${T?.cardBg || 'bg-white'} ${T?.border || 'border'} rounded-xl p-4`}>
        <h2 className={`text-lg font-semibold ${T?.text || 'text-gray-900'} mb-4`}>
          Test Pulsante Cliccabile
        </h2>

        <button
          onClick={handleClick}
          className={`${T?.btnPrimary || 'bg-blue-500 hover:bg-blue-600 text-white'} px-6 py-3 rounded-lg transition-colors`}
        >
          Clicca qui! ({count})
        </button>

        <p className={`mt-4 ${T?.subtext || 'text-gray-600'}`}>
          Se vedi il counter aumentare, i pulsanti funzionano correttamente.
        </p>
      </div>

      <div className={`${T?.cardBg || 'bg-white'} ${T?.border || 'border'} rounded-xl p-4`}>
        <h2 className={`text-lg font-semibold ${T?.text || 'text-gray-900'} mb-4`}>
          Lista Giocatori Mock
        </h2>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`${T?.cardBg || 'bg-gray-50'} p-3 rounded-lg flex justify-between items-center`}
            >
              <div>
                <div className={`font-medium ${T?.text || 'text-gray-900'}`}>Giocatore {i}</div>
                <div className={`text-sm ${T?.subtext || 'text-gray-600'}`}>
                  giocatore{i}@esempio.com
                </div>
              </div>

              <button
                onClick={() => {
                  console.log(`Clicked player ${i}`);
                  alert(`Selezionato Giocatore ${i}`);
                }}
                className={`${T?.btnSecondary || 'bg-gray-200 hover:bg-gray-300'} px-4 py-2 rounded text-sm`}
              >
                Dettagli
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

