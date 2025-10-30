// =============================================
// FILE: src/utils/maps-utils.js
// Utility per estrarre coordinate da Google Maps URL
// =============================================

/**
 * Estrae latitudine e longitudine da un URL di Google Maps
 * Supporta vari formati:
 * - https://maps.app.goo.gl/...
 * - https://www.google.com/maps/@lat,lng,zoom
 * - https://www.google.com/maps/place/.../@lat,lng,zoom
 * - https://goo.gl/maps/...
 *
 * @param {string} url - URL di Google Maps
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export async function extractCoordinatesFromGoogleMapsUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    // Pattern 1: Coordinate direttamente nell'URL (@lat,lng)
    const directPattern = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const directMatch = url.match(directPattern);

    if (directMatch) {
      return {
        latitude: parseFloat(directMatch[1]),
        longitude: parseFloat(directMatch[2]),
      };
    }

    // Pattern 2: URL shortlink (maps.app.goo.gl o goo.gl/maps)
    // NOTA: Gli URL abbreviati non possono essere espansi lato client a causa di CORS
    // L'admin dovrebbe usare l'URL completo invece
    if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
      console.warn(
        '⚠️ URL abbreviato di Google Maps rilevato.\n' +
          'Gli URL abbreviati (maps.app.goo.gl) non possono essere elaborati.\n' +
          "Per favore usa l'URL completo:\n" +
          '1. Apri il link abbreviato nel browser\n' +
          "2. Copia l'URL completo dalla barra degli indirizzi\n" +
          '3. Incollalo nel campo Google Maps URL'
      );
      return null;
    }

    // Pattern 3: Query parameter q=lat,lng
    const qPattern = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const qMatch = url.match(qPattern);

    if (qMatch) {
      return {
        latitude: parseFloat(qMatch[1]),
        longitude: parseFloat(qMatch[2]),
      };
    }

    // Pattern 4: ll parameter
    const llPattern = /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const llMatch = url.match(llPattern);

    if (llMatch) {
      return {
        latitude: parseFloat(llMatch[1]),
        longitude: parseFloat(llMatch[2]),
      };
    }

    console.warn('⚠️ Could not extract coordinates from Google Maps URL:', url);
    return null;
  } catch (error) {
    console.error('❌ Error extracting coordinates:', error);
    return null;
  }
}

/**
 * Calcola la distanza tra due punti geografici usando la formula di Haversine
 * @param {number} lat1 - Latitudine punto 1
 * @param {number} lon1 - Longitudine punto 1
 * @param {number} lat2 - Latitudine punto 2
 * @param {number} lon2 - Longitudine punto 2
 * @returns {number} Distanza in chilometri
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raggio della Terra in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Converte gradi in radianti
 * @param {number} degrees
 * @returns {number}
 */
function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Valida se un URL è un link valido di Google Maps
 * @param {string} url
 * @returns {boolean}
 */
export function isValidGoogleMapsUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const validPatterns = [
    /^https?:\/\/(www\.)?google\.[a-z]+\/maps/,
    /^https?:\/\/maps\.app\.goo\.gl/,
    /^https?:\/\/goo\.gl\/maps/,
    /^https?:\/\/maps\.google\.[a-z]+/,
  ];

  return validPatterns.some((pattern) => pattern.test(url));
}

/**
 * Ottiene le coordinate di un circolo, sia da googleMapsUrl che da latitude/longitude
 * @param {Object} club - Oggetto circolo
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
export async function getClubCoordinates(club) {
  if (!club) return null;

  // Priorità 1: Coordinate esplicite
  if (club.location?.latitude && club.location?.longitude) {
    return {
      latitude: club.location.latitude,
      longitude: club.location.longitude,
    };
  }

  // Priorità 2: Coordinate legacy
  if (club.latitude && club.longitude) {
    return {
      latitude: club.latitude,
      longitude: club.longitude,
    };
  }

  // Priorità 3: Estrai da Google Maps URL
  const googleMapsUrl = club.location?.googleMapsUrl || club.googleMapsUrl;
  if (googleMapsUrl) {
    const coords = await extractCoordinatesFromGoogleMapsUrl(googleMapsUrl);
    if (coords) {
      return coords;
    }
  }

  return null;
}
