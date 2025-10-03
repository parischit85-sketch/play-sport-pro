// =============================================
// FILE: src/components/ui/Modal.jsx
// =============================================
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ open, isOpen, onClose, title, children, T, size = 'md' }) {
  // Backward-compat: support both `open` and `isOpen`
  const opened = typeof isOpen === 'boolean' ? isOpen : open;

  // Gestione ESC key e scroll lock
  useEffect(() => {
    if (opened) {
      // Blocca lo scroll del body quando il modal è aperto
      document.body.style.overflow = 'hidden';

      // Gestione tasto ESC
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [opened, onClose]);

  if (!opened) return null;

  const sizeClasses = {
    sm: 'w-[min(480px,92vw)]',
    md: 'w-[min(820px,95vw)] max-w-2xl',
    lg: 'w-[min(1024px,95vw)] max-w-4xl',
    xl: 'w-[min(1200px,95vw)] max-w-6xl',
  };

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center p-2 sm:p-3 modal-overlay"
      aria-modal="true"
      role="dialog"
      style={{
        animation: 'fadeIn 0.2s ease-out',
        zIndex: 2147483647,
      }}
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
        className={`relative rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl 
          border border-white/30 dark:border-gray-700/30 p-3 sm:p-4 lg:p-5 ${sizeClasses[size]} 
          shadow-2xl shadow-gray-900/20 dark:shadow-black/40 max-h-[92vh] sm:max-h-[88vh] 
          overflow-y-auto transform transition-all duration-300 mx-auto my-auto modal-content`}
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.25rem)',
          animation: 'slideIn 0.3s ease-out',
          zIndex: 2147483647,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm 
              border border-white/30 dark:border-gray-600/30 hover:bg-white/90 dark:hover:bg-gray-600/90 
              transition-all duration-300 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white
              flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ✕
          </button>
        </div>
        <div className="text-sm pb-2 md:pb-0">{children}</div>
      </div>
    </div>
  );

  // Usa React Portal per rendere il modal direttamente nel body
  return createPortal(modalContent, document.body);
}
