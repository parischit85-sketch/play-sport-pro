// =============================================
// FILE: src/ui/ConfirmModal.jsx
// Modal di conferma per azioni distruttive
// =============================================

import React from 'react';
import Modal from './Modal.jsx';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Conferma Azione',
  message = 'Sei sicuro di voler procedere?',
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  confirmButtonClass = 'bg-red-500 hover:bg-red-600 text-white',
  T
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div className="space-y-4">
        <p className={`${T.text} text-center`}>{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className={`${T.btnSecondary} px-4 py-2`}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}