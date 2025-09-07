// =============================================
// FILE: src/components/ui/Section.jsx
// =============================================
import React from 'react';

export default function Section({ title, right, children, T, variant = 'default' }) {
  // Varianti per diversi tipi di sezioni
  const variants = {
    default: T.card,
    elevated: T.cardHover,
    minimal: `${T.borderLg} ${T.cardBg} ${T.border} ${T.spacingMd}`,
    compact: `${T.borderMd} ${T.cardBg} ${T.border} ${T.spacingSm}`,
  };

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className={`text-xl font-semibold ${T.neonText}`}>{title}</h2>
        {right}
      </div>
      <div className={variants[variant] || variants.default}>{children}</div>
    </section>
  );
}
