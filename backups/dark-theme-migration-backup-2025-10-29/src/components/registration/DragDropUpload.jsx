// =============================================
// FILE: src/components/registration/DragDropUpload.jsx
// Drag & drop image upload with preview
// =============================================
import React, { useState, useRef } from 'react';

/**
 * Drag & drop upload component with image preview
 * @param {Function} onFileSelect - Callback when file is selected
 * @param {string} accept - Accepted file types (default: image/*)
 * @param {number} maxSizeMB - Maximum file size in MB (default: 5)
 * @param {string} currentImage - Current image URL (for edit mode)
 */
export default function DragDropUpload({
  onFileSelect,
  accept = 'image/*',
  maxSizeMB = 5,
  currentImage = null,
}) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Validate file
  const validateFile = (file) => {
    // Check type
    if (!file.type.startsWith('image/')) {
      return "Il file deve essere un'immagine (PNG, JPG, GIF, WEBP)";
    }

    // Check size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return `Il file è troppo grande (${sizeMB.toFixed(1)} MB). Massimo ${maxSizeMB} MB`;
    }

    return null;
  };

  // Handle file selection
  const handleFile = (file) => {
    if (!file) return;

    // Validate
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Pass file to parent
    onFileSelect(file);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Handle button click
  const handleClick = () => {
    inputRef.current?.click();
  };

  // Remove image
  const handleRemove = () => {
    setPreview(null);
    setError('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onFileSelect(null);
  };

  return (
    <div className="drag-drop-upload">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      {preview ? (
        // Preview mode
        <div className="preview-container">
          <img src={preview} alt="Preview" className="preview-image" />
          <div className="preview-actions">
            <button type="button" onClick={handleClick} className="btn-change">
              Cambia Immagine
            </button>
            <button type="button" onClick={handleRemove} className="btn-remove">
              Rimuovi
            </button>
          </div>
        </div>
      ) : (
        // Upload zone
        <div
          className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="drop-zone-content">
            <svg
              className="upload-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="drop-zone-text">
              Trascina l'immagine qui o <span className="click-text">clicca per selezionare</span>
            </p>
            <p className="drop-zone-hint">PNG, JPG, GIF, WEBP (max {maxSizeMB} MB)</p>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <style jsx>{`
        .drag-drop-upload {
          width: 100%;
          margin: 1rem 0;
        }

        .drop-zone {
          border: 2px dashed var(--color-border, #ccc);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background-color: var(--color-bg-light, #f9f9f9);
        }

        .drop-zone:hover,
        .drop-zone.drag-active {
          border-color: var(--color-primary, #007bff);
          background-color: var(--color-primary-light, #e7f3ff);
        }

        .drop-zone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .upload-icon {
          width: 48px;
          height: 48px;
          color: var(--color-text-light, #666);
          margin-bottom: 0.5rem;
        }

        .drop-zone-text {
          font-size: 1rem;
          color: var(--color-text, #333);
          margin: 0;
        }

        .click-text {
          color: var(--color-primary, #007bff);
          font-weight: 600;
        }

        .drop-zone-hint {
          font-size: 0.875rem;
          color: var(--color-text-light, #666);
          margin: 0;
        }

        .preview-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid var(--color-border, #ccc);
          border-radius: 8px;
          background-color: var(--color-bg-light, #f9f9f9);
        }

        .preview-image {
          max-width: 100%;
          max-height: 300px;
          border-radius: 8px;
          object-fit: contain;
        }

        .preview-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-change,
        .btn-remove {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .btn-change {
          background-color: var(--color-primary, #007bff);
          color: white;
        }

        .btn-change:hover {
          background-color: var(--color-primary-dark, #0056b3);
        }

        .btn-remove {
          background-color: transparent;
          color: var(--color-danger, #dc3545);
          border-color: var(--color-danger, #dc3545);
        }

        .btn-remove:hover {
          background-color: var(--color-danger, #dc3545);
          color: white;
        }

        .error-message {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background-color: var(--color-error-bg, #fee);
          color: var(--color-error, #c00);
          border-radius: 4px;
          font-size: 0.875rem;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .drop-zone {
            background-color: var(--color-bg-dark, #2a2a2a);
            border-color: var(--color-border-dark, #444);
          }

          .drop-zone:hover,
          .drop-zone.drag-active {
            background-color: var(--color-primary-dark-bg, #1a3a52);
          }

          .preview-container {
            background-color: var(--color-bg-dark, #2a2a2a);
            border-color: var(--color-border-dark, #444);
          }
        }
      `}</style>
    </div>
  );
}
