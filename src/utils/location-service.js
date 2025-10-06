// Centralized location service with diagnostics and manual city geocoding fallback
// Provides: getUserLocation({timeout, highAccuracy}), geocodeCity(city)
// Returns structured objects to help UI decide next steps

export const LocationStatus = {
  SUCCESS: 'success',
  UNSUPPORTED: 'unsupported',
  INSECURE_CONTEXT: 'insecure_context',
  PERMISSION_DENIED: 'permission_denied',
  POSITION_UNAVAILABLE: 'position_unavailable',
  TIMEOUT: 'timeout',
  BLOCKED_BY_POLICY: 'blocked_by_policy', // Heuristic (permission denied instantly & no prior user action)
  ERROR: 'error'
};

function isProbablyPolicyBlocked(startTime, errorCode, permissionState) {
  // Heuristic: immediate PERMISSION_DENIED (< 80ms) AND permission state reports denied BEFORE user interaction
  const elapsed = performance.now() - startTime;
  return errorCode === 1 && elapsed < 80 && (permissionState === 'denied');
}

export async function getUserLocation(options = {}) {
  const {
    timeout = 8000,
    highAccuracy = false,
    cache = true,
    forceRefresh = false,
    cacheTTL = 120000 // 2 minuti default
  } = options;

  const CACHE_KEY = 'ps:lastLocation';
  if (cache && !forceRefresh) {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.timestamp && (Date.now() - parsed.timestamp) < cacheTTL) {
          return {
            status: LocationStatus.SUCCESS,
            coords: parsed.coords,
            accuracy: parsed.accuracy,
            permissionState: 'cached',
            cached: true
          };
        }
      }
    } catch (_) { /* ignore cache errors */ }
  }

  if (!('geolocation' in navigator)) {
    return { status: LocationStatus.UNSUPPORTED, message: 'Geolocalizzazione non supportata dal browser.' };
  }

  if (!window.isSecureContext && window.location.hostname !== 'localhost') {
    return { status: LocationStatus.INSECURE_CONTEXT, message: 'Richiesto HTTPS per usare la geolocalizzazione.' };
  }

  let permissionState = 'unknown';
  if (navigator.permissions && navigator.permissions.query) {
    try {
      const perm = await navigator.permissions.query({ name: 'geolocation' });
      permissionState = perm.state; // granted | denied | prompt
    } catch (e) {
      // Ignore
    }
  }

  return await new Promise((resolve) => {
    const start = performance.now();
    let finished = false;

    const t = setTimeout(() => {
      if (finished) return;
      finished = true;
      resolve({ status: LocationStatus.TIMEOUT, message: 'Timeout durante il rilevamento della posizione.' });
    }, timeout);

    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (finished) return;
            finished = true;
            clearTimeout(t);
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            // Store in session cache
            try {
              sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                coords,
                accuracy: pos.coords.accuracy,
                timestamp: Date.now()
              }));
            } catch (_) { /* ignore quota */ }
            resolve({
              status: LocationStatus.SUCCESS,
              coords,
              accuracy: pos.coords.accuracy,
              permissionState,
              cached: false
            });
        },
        (err) => {
          if (finished) return;
          finished = true;
          clearTimeout(t);
          let status = LocationStatus.ERROR;
          let message = 'Errore sconosciuto.';
          switch (err.code) {
            case 1:
              status = LocationStatus.PERMISSION_DENIED;
              message = 'Permesso negato.';
              if (isProbablyPolicyBlocked(start, err.code, permissionState)) {
                status = LocationStatus.BLOCKED_BY_POLICY;
                message = 'Geolocalizzazione bloccata dalla Permissions-Policy del server.';
              }
              break;
            case 2:
              status = LocationStatus.POSITION_UNAVAILABLE;
              message = 'Posizione non disponibile.';
              break;
            case 3:
              status = LocationStatus.TIMEOUT;
              message = 'Timeout durante il rilevamento.';
              break;
            default:
              status = LocationStatus.ERROR;
          }
          resolve({ status, message, permissionState, rawError: err });
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: timeout - 500, // Slightly less than wrapper timeout
          maximumAge: 60000
        }
      );
    } catch (e) {
      if (finished) return;
      finished = true;
      clearTimeout(t);
      resolve({ status: LocationStatus.ERROR, message: 'Eccezione geolocalizzazione: ' + e.message });
    }
  });
}

export async function geocodeCity(city, country = 'Italy') {
  if (!city || !city.trim()) {
    return { ok: false, message: 'Inserisci una città.' };
  }
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ',' + country)}&limit=1`;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'PlaySportPro/1.0 (geocoding)' }
    });
    if (!response.ok) {
      return { ok: false, message: 'Geocoding non disponibile.' };
    }
    const data = await response.json();
    if (!data.length) {
      return { ok: false, message: `Città "${city}" non trovata.` };
    }
    return { ok: true, coords: { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }, raw: data[0] };
  } catch (e) {
    return { ok: false, message: 'Errore di rete nel geocoding.' };
  }
}
