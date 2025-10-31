// =============================================
// FILE: src/components/registration/LogoEditor.jsx
// Logo editor with crop, zoom, and pan functionality
// =============================================
import React, { useState, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

export default function LogoEditor({ imageSource, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const canvasRef = useRef(null);

  const handleCropChange = (location) => {
    setCrop(location);
  };

  const handleZoomChange = (e) => {
    setZoom(Number(e.target.value));
  };

  const handleRotationChange = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleCropAreaChange = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Applica il ritaglio e la rotazione
  const generateCroppedImage = async () => {
    const image = new Image();
    image.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');

      // Imposta il canvas a quadrato (migliore per i logo)
      const size = Math.min(croppedAreaPixels.width, croppedAreaPixels.height);
      canvas.width = size;
      canvas.height = size;

      // Applica rotazione
      if (rotation !== 0) {
        ctx.translate(size / 2, size / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-size / 2, -size / 2);
      }

      // Disegna l'immagine ritagliata
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        size,
        size
      );

      // Converti a data URL (CSP-compliant) e passa al parent
      const dataUrl = canvas.toDataURL('image/png');

      // Converti data URL a blob per l'upload
      canvas.toBlob((blob) => {
        onCropComplete(dataUrl, blob);
      }, 'image/png');
    };
    image.src = imageSource;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 border-gray-700">
          <h3 className="text-xl font-semibold text-neutral-900 text-white">Modifica Logo</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 text-gray-400" />
          </button>
        </div>

        {/* Editor */}
        <div className="p-6 space-y-6">
          {/* Crop Area */}
          <div
            className="relative w-full bg-gray-100 bg-gray-700 rounded-lg overflow-hidden"
            style={{ height: '400px' }}
          >
            <Cropper
              image={imageSource}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={true}
              onCropChange={handleCropChange}
              onCropAreaChange={handleCropAreaChange}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              restrictPosition={true}
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Zoom Control */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <ZoomIn className="w-4 h-4" />
                  <span>Zoom</span>
                </div>
              </label>
              <div className="flex items-center gap-4">
                <ZoomOut className="w-4 h-4 text-gray-500" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={handleZoomChange}
                  className="flex-1 h-2 bg-gray-200 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <ZoomIn className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 text-gray-400 w-12 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
            </div>

            {/* Rotation Control */}
            <div>
              <button
                onClick={handleRotationChange}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 bg-gray-700 hover:bg-gray-200 hover:bg-gray-600 text-neutral-700 text-gray-300 rounded-lg transition-colors"
              >
                <RotateCw className="w-4 h-4" />
                <span>Ruota 90°</span>
              </button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 bg-blue-900/20 border border-blue-200 border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-700 text-blue-300">
                💡 Trascina per spostare, usa lo slider per zoommare, clicca "Ruota" per orientare
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 border-gray-700">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 border-gray-600 text-gray-700 text-gray-300 rounded-lg hover:bg-gray-50 hover:bg-gray-700 transition-colors font-medium"
            >
              Annulla
            </button>
            <button
              onClick={generateCroppedImage}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Applica
            </button>
          </div>
        </div>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
