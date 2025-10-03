// =============================================
// FILE: src/features/tornei/CreaTornei.jsx
// =============================================
import React from 'react';
import Section from '@ui/Section.jsx';
export default function CreaTornei({ T }) {
  return (
    <Section title="Crea Tornei" T={T}>
      <div className={`text-sm ${T.subtext}`}>
        Qui potrai creare e gestire i tornei (funzionalità in sviluppo).
      </div>
    </Section>
  );
}
