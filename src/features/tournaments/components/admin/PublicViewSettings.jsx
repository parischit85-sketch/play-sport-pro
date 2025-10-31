/**
 * Public View Settings - Admin Panel Component
 * Allows tournament admins to enable/disable public views and generate sharing links
 */

import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@services/firebase.js';
import { Eye, EyeOff, Copy, Check, RefreshCw, Monitor, Smartphone, QrCode } from 'lucide-react';
import QRCodeReact from 'react-qr-code';

function PublicViewSettings({ tournament, clubId, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState({ mobile: false, tv: false });
  const [showQR, setShowQR] = useState(false);

  const isEnabled = tournament?.publicView?.enabled || false;
  const token = tournament?.publicView?.token || '';
  const showQRCode = tournament?.publicView?.showQRCode || false;
  const interval = tournament?.publicView?.settings?.interval || 15000;
  const displaySettings = tournament?.publicView?.settings?.displaySettings || {
    groupsMatches: true,
    standings: true,
    points: true,
  };

  const baseUrl = window.location.origin;
  const mobileUrl = token ? `${baseUrl}/public/tournament/${clubId}/${tournament.id}/${token}` : '';
  const tvUrl = token ? `${baseUrl}/public/tournament-tv/${clubId}/${tournament.id}/${token}` : '';

  const generateToken = () => {
    return (
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  };

  const handleTogglePublicView = async () => {
    setLoading(true);
    try {
      const newToken = isEnabled ? token : generateToken();
      await updateDoc(doc(db, 'clubs', clubId, 'tournaments', tournament.id), {
        'publicView.enabled': !isEnabled,
        'publicView.token': newToken,
        'publicView.showQRCode': showQRCode,
        'publicView.settings.interval': interval,
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error toggling public view:', error);
      alert('Errore durante laggiornamento delle impostazioni');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateToken = async () => {
    if (
      !confirm('Vuoi rigenerare il token? I link esistenti smetteranno di funzionare. Continuare?')
    )
      return;

    setLoading(true);
    try {
      const newToken = generateToken();
      await updateDoc(doc(db, 'clubs', clubId, 'tournaments', tournament.id), {
        'publicView.token': newToken,
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error regenerating token:', error);
      alert('Errore durante la rigenerazione del token');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleQRCode = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'clubs', clubId, 'tournaments', tournament.id), {
        'publicView.showQRCode': !showQRCode,
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error toggling QR code:', error);
      alert('Errore durante laggiornamento delle impostazioni');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInterval = async (newInterval) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'clubs', clubId, 'tournaments', tournament.id), {
        'publicView.settings.interval': newInterval,
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating interval:', error);
      alert('Errore durante laggiornamento dellintervallo');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDisplaySettings = async (newSettings) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'clubs', clubId, 'tournaments', tournament.id), {
        'publicView.settings.displaySettings': newSettings,
      });

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating display settings:', error);
      alert('Errore durante laggiornamento delle impostazioni');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [type]: true });
      setTimeout(() => {
        setCopied({ ...copied, [type]: false });
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Vista Pubblica</h3>
          <p className="text-sm text-gray-400">
            Condividi il torneo su schermi pubblici senza autenticazione
          </p>
        </div>

        <button
          onClick={handleTogglePublicView}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isEnabled ? 'bg-red-900/20 text-red-400' : 'bg-green-900/20 text-green-400'
          } disabled:opacity-50`}
        >
          {isEnabled ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          {isEnabled ? 'Disabilita' : 'Abilita'}
        </button>
      </div>

      {isEnabled && (
        <>
          {/* Public Links */}
          <div className="space-y-4">
            {/* Mobile/Smartphone Link */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-5 h-5 text-primary-400" />
                <h4 className="font-semibold text-white">Vista Smartphone</h4>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Ottimizzata per dispositivi mobili con navigazione touch
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={mobileUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white font-mono"
                />
                <button
                  onClick={() => copyToClipboard(mobileUrl, 'mobile')}
                  className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  title="Copia link"
                >
                  {copied.mobile ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
                <a
                  href={mobileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Apri in nuova finestra"
                >
                  <Eye className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* TV Link */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-5 h-5 text-fuchsia-400" />
                <h4 className="font-semibold text-white">Vista TV</h4>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Ottimizzata per schermi grandi con grafica bold e QR code dedicato
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tvUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white font-mono"
                />
                <button
                  onClick={() => copyToClipboard(tvUrl, 'tv')}
                  className="p-2 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700 transition-colors"
                  title="Copia link"
                >
                  {copied.tv ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
                <a
                  href={tvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Apri in nuova finestra"
                >
                  <Eye className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-gray-800 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-white">Impostazioni</h4>

            {/* Auto-scroll interval */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Intervallo Auto-Scroll (secondi)
              </label>
              <select
                value={interval / 1000}
                onChange={(e) => handleUpdateInterval(Number(e.target.value) * 1000)}
                disabled={loading}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value={10}>10 secondi</option>
                <option value={15}>15 secondi</option>
                <option value={20}>20 secondi</option>
                <option value={30}>30 secondi</option>
                <option value={45}>45 secondi</option>
                <option value={60}>60 secondi</option>
              </select>
            </div>

            {/* Display Settings - Pages to show */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Pagine Pubbliche da visualizzare
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={displaySettings.groupsMatches || false}
                    onChange={(e) =>
                      handleUpdateDisplaySettings({
                        ...displaySettings,
                        groupsMatches: e.target.checked,
                      })
                    }
                    disabled={loading}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-300">Gironi & Partite</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={displaySettings.standings || false}
                    onChange={(e) =>
                      handleUpdateDisplaySettings({
                        ...displaySettings,
                        standings: e.target.checked,
                      })
                    }
                    disabled={loading}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-300">Tabellone</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={displaySettings.points || false}
                    onChange={(e) =>
                      handleUpdateDisplaySettings({
                        ...displaySettings,
                        points: e.target.checked,
                      })
                    }
                    disabled={loading}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-300">Punti</span>
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-2">La pagina QR code sarà sempre visibile</p>
            </div>

            {/* Show QR Code (only for mobile view) */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Mostra QR Code (vista smartphone)
                </label>
                <p className="text-xs text-gray-400">
                  Aggiunge un QR code in fondo alla pagina mobile
                </p>
              </div>
              <button
                onClick={handleToggleQRCode}
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showQRCode ? 'bg-primary-600' : 'bg-gray-300'
                } disabled:opacity-50`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showQRCode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* QR Code Preview */}
          <div className="bg-gray-800 rounded-lg p-4">
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-2 text-primary-400 font-medium hover:underline mb-3"
            >
              <QrCode className="w-5 h-5" />
              {showQR ? 'Nascondi' : 'Mostra'} QR Code
            </button>

            {showQR && (
              <div className="bg-gray-700 p-6 rounded-lg inline-block">
                <QRCodeReact value={mobileUrl} size={200} />
                <p className="text-center text-sm text-gray-300 mt-3">Vista Smartphone</p>
              </div>
            )}
          </div>

          {/* Security */}
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <RefreshCw className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-200 mb-1">Sicurezza</h4>
                <p className="text-sm text-yellow-300 mb-3">
                  Il token protegge laccesso alla vista pubblica. Se sospetti un uso non
                  autorizzato, rigenera il token per invalidare i vecchi link.
                </p>
                <button
                  onClick={handleRegenerateToken}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Rigenera Token
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PublicViewSettings;
