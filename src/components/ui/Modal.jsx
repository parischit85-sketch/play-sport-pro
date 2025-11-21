// =============================================
// FILE: src/ui/Modal.jsx
// Componente Modal base riutilizzabile
// =============================================

import React, { useEffect } from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  closeOnOverlayClick = true,
  align = 'center',
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xl: 'max-w-4xl',
    xxl: 'max-w-5xl',
    // ~30% più largo di 5xl (~64rem). 64rem * 1.3 ≈ 83.2rem → arrotondato a 84rem
    xxxl: 'max-w-[84rem]',
    full: 'w-full h-full max-w-none rounded-none mx-0',
  };

  const isFull = size === 'full';

  return (
    <div
      className={`fixed inset-0 z-50 flex ${align === 'top' && !isFull ? 'items-start pt-4 md:pt-10' : 'items-center'} justify-center`}
    >
      {/* Overlay */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={`relative bg-gray-800 shadow-xl ${isFull ? 'w-full h-full rounded-none' : `rounded-lg mx-4 max-h-[90vh] ${sizeClasses[size] || sizeClasses.medium}`} overflow-hidden`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className={`p-4 overflow-y-auto ${isFull ? 'h-full pb-20' : 'max-h-[calc(90vh-8rem)]'}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
