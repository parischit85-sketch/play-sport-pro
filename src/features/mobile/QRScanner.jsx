// =============================================
// FILE: src/features/mobile/QRScanner.jsx
// QR Code Scanner con camera access
// =============================================

import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';

/**
 * QR Scanner Component
 *
 * Usa la camera del dispositivo per scansionare QR codes
 * Use cases:
 * - Check-in prenotazioni
 * - Verifica certificati medici
 * - Aggiunta rapida giocatori
 */
export default function QRScanner({ onScan, onClose, title = 'Scansiona QR Code' }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Fotocamera posteriore su mobile
      });

      setHasPermission(true);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);

        // Inizia scanning loop
        scanIntervalRef.current = setInterval(scanQRCode, 500);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      setError('Impossibile accedere alla camera. Verifica i permessi.');
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    setScanning(false);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      try {
        // Usa jsQR per decodificare il QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          handleScanSuccess(code.data);
        }
      } catch (err) {
        console.error('QR scan error:', err);
      }
    }
  };

  const handleScanSuccess = (data) => {
    setResult(data);
    setScanning(false);
    clearInterval(scanIntervalRef.current);

    // Vibrazione feedback (se disponibile)
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    // Callback
    setTimeout(() => {
      onScan?.(data);
      onClose?.();
    }, 1000);
  };

  const handleClose = () => {
    stopCamera();
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {scanning && (
          <p className="text-sm text-white/80 mt-2 text-center">Inquadra il QR code nel riquadro</p>
        )}
      </div>

      {/* Camera Preview */}
      <div className="relative w-full h-full flex items-center justify-center">
        {hasPermission === null && (
          <div className="text-white text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <p>Richiesta accesso camera...</p>
          </div>
        )}

        {hasPermission === false && (
          <div className="text-white text-center px-4">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <p className="text-lg font-semibold mb-2">Accesso camera negato</p>
            <p className="text-sm text-white/70 mb-4">{error}</p>
            <button
              onClick={startCamera}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Riprova
            </button>
          </div>
        )}

        {hasPermission && (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

            {/* Scanning Overlay */}
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Corners del frame */}
                <div className="relative w-64 h-64">
                  {/* Top-left */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500"></div>
                  {/* Top-right */}
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500"></div>
                  {/* Bottom-left */}
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500"></div>
                  {/* Bottom-right */}
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500"></div>

                  {/* Scanning line animation */}
                  <div className="absolute inset-x-0 h-1 bg-blue-500 shadow-lg shadow-blue-500/50 animate-scan"></div>
                </div>
              </div>
            )}

            {/* Success Result */}
            {result && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-white text-center px-4">
                  <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-500 animate-bounce-once" />
                  <p className="text-xl font-semibold mb-2">QR Code Scansionato!</p>
                  <p className="text-sm text-white/70 font-mono break-all">{result}</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6 text-center text-white">
        <div className="flex items-center justify-center gap-2 text-sm text-white/70">
          <Camera className="w-4 h-4" />
          <span>Mantieni il QR code ben illuminato e a fuoco</span>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0;
          }
          50% {
            top: 100%;
          }
          100% {
            top: 0;
          }
        }

        .animate-scan {
          animation: scan 2s linear infinite;
        }

        @keyframes bounce-once {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .animate-bounce-once {
          animation: bounce-once 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}

/**
 * Hook per QR Scanner
 */
export function useQRScanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const handleScan = (data) => {
    setScannedData(data);
  };

  return {
    isOpen,
    open,
    close,
    scannedData,
    handleScan,
    QRScannerComponent: isOpen ? <QRScanner onScan={handleScan} onClose={close} /> : null,
  };
}
