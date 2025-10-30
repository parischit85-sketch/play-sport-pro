// =============================================
// FILE: src/lib/playerUtils.js
// Utility functions per gestione giocatori
// =============================================

import { PLAYER_CATEGORIES } from '../features/players/types/playerTypes.js';

/**
 * Formatta la data dell'ultima attività in formato relativo
 * @param {string|Date} date - Data dell'ultima attività
 * @returns {string} Stringa formattata
 */
export const formatLastActivity = (date) => {
  if (!date) return 'Mai';
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Oggi';
  if (days === 1) return 'Ieri';
  if (days < 7) return `${days} giorni fa`;
  if (days < 30) return `${Math.floor(days / 7)} settimane fa`;
  return `${Math.floor(days / 30)} mesi fa`;
};

/**
 * Restituisce le classi Tailwind per lo stile della categoria
 * @param {string} category - Categoria del giocatore
 * @returns {string} Classi CSS
 */
export const getCategoryStyle = (category) => {
  switch (category) {
    case PLAYER_CATEGORIES.MEMBER:
      return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
    case PLAYER_CATEGORIES.VIP:
      return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300';
    case PLAYER_CATEGORIES.GUEST:
      return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
  }
};

/**
 * Restituisce l'etichetta leggibile per la categoria
 * @param {string} category - Categoria del giocatore
 * @returns {string} Etichetta
 */
export const getCategoryLabel = (category) => {
  switch (category) {
    case PLAYER_CATEGORIES.MEMBER:
      return 'Membro';
    case PLAYER_CATEGORIES.VIP:
      return 'VIP';
    case PLAYER_CATEGORIES.GUEST:
      return 'Ospite';
    case PLAYER_CATEGORIES.NON_MEMBER:
      return 'Non Membro';
    default:
      return 'N/A';
  }
};

/**
 * Calcola l'età da una data di nascita
 * @param {string|Date} birthDate - Data di nascita
 * @returns {number|null} Età in anni o null se non valida
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * Ottiene il nome completo del giocatore
 * @param {Object} player - Oggetto giocatore
 * @returns {string} Nome completo
 */
export const getPlayerFullName = (player) => {
  if (!player) return 'Nome non disponibile';

  if (player.name) return player.name;

  const firstName = player.firstName || '';
  const lastName = player.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || 'Nome non disponibile';
};

/**
 * Formatta una data in formato italiano
 * @param {string|Date} date - Data da formattare
 * @param {Object} options - Opzioni per toLocaleDateString
 * @returns {string} Data formattata o stringa di fallback
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/D';
  try {
    return new Date(date).toLocaleDateString('it-IT', options);
  } catch (error) {
    console.warn('Invalid date format:', date);
    return 'Data non valida';
  }
};

/**
 * Ottiene l'iniziale del giocatore per l'avatar
 * @param {Object} player - Oggetto giocatore
 * @returns {string} Iniziale maiuscola o '?'
 */
export const getPlayerInitial = (player) => {
  if (!player) return '?';

  // Prima prova con il nome completo
  if (player.name && typeof player.name === 'string') {
    return player.name.charAt(0).toUpperCase();
  }

  // Poi con nome e cognome separati
  const firstName = player.firstName || '';
  const lastName = player.lastName || '';

  if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }

  if (lastName) {
    return lastName.charAt(0).toUpperCase();
  }

  // Fallback con l'email se disponibile
  if (player.email && typeof player.email === 'string') {
    return player.email.charAt(0).toUpperCase();
  }

  return '?';
};
