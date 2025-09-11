// =============================================
// FILE: src/components/ui/Modal.jsx
// =============================================
import React from 'react';

export default function Modal({ open, isOpen, onClose, title, children, T, size = 'md' }) {
  // Backward-compat: support both `open` and `isOpen`
  const opened = typeof isOpen === 'boolean' ? isOpen : open;
  if (!opened) return null;

  const sizeClasses = {
    sm: 'w-[min(480px,92vw)]',
    md: 'w-[min(820px,92vw)]',
    lg: 'w-[min(1024px,92vw)]',
    xl: 'w-[min(1200px,92vw)]',
  };

  return (
    <div
      className="fixed inset-0 z-[1000000] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-sm"
        role="button"
        tabIndex={0}
        aria-label="Chiudi modale"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
          }
        }}
      />
      <div
        className={`relative z-10 rounded-3xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl 
          border border-white/30 dark:border-gray-700/30 p-6 lg:p-8 ${sizeClasses[size]} 
          shadow-2xl shadow-gray-900/20 dark:shadow-black/40 max-h-[85vh] md:max-h-[90vh] 
          overflow-y-auto mb-16 md:mb-0`}
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm 
              border border-white/30 dark:border-gray-600/30 hover:bg-white/90 dark:hover:bg-gray-600/90 
              transition-all duration-300 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white
              flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ✕
          </button>
        </div>
        <div className="text-sm pb-4 md:pb-0">{children}</div>
      </div>
    </div>
  );
}
