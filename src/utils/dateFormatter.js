/**
 * dateFormatter.js - Centralized date formatting utilities
 * Provides consistent date formatting across the application
 * 
 * All functions handle errors gracefully and return fallback values
 * Supports Italian locale by default
 */

/**
 * Formats a Date object to ISO date string (YYYY-MM-DD)
 * 
 * @param {Date} [date=new Date()] - Date to format
 * @returns {string} Formatted date in YYYY-MM-DD format
 * 
 * @example
 * formatToDateOnly(new Date(2025, 10, 3)) // "2025-11-03"
 * formatToDateOnly() // Current date in YYYY-MM-DD format
 */
export const formatToDateOnly = (date = new Date()) => {
  try {
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date to date-only:', error);
    return new Date().toISOString().split('T')[0];
  }
};

/**
 * Formats a time string from HH:MM to display format
 * 
 * @param {string} timeString - Time in HH:MM format
 * @returns {string} Formatted time or original if invalid
 * 
 * @example
 * formatTime('14:30') // "14:30"
 * formatTime('9:5') // "09:05"
 */
export const formatTime = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return timeString;
  
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return timeString;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

/**
 * Formats a Date object to full localized date string
 * 
 * @param {Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string (e.g., "domenica, 3 novembre")
 * 
 * @example
 * formatToFullDate(new Date(2025, 10, 3)) // "domenica, 3 novembre 2025"
 */
export const formatToFullDate = (date, options = {}) => {
  if (!(date instanceof Date)) {
    console.error('Invalid date provided to formatToFullDate');
    return '';
  }

  try {
    const defaultOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      ...options,
    };
    return date.toLocaleDateString('it-IT', defaultOptions);
  } catch (error) {
    console.error('Error formatting to full date:', error);
    return date.toDateString();
  }
};

/**
 * Formats a Date object to short date format
 * 
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string (e.g., "3 nov")
 * 
 * @example
 * formatToShortDate(new Date(2025, 10, 3)) // "3 nov"
 */
export const formatToShortDate = (date) => {
  if (!(date instanceof Date)) {
    console.error('Invalid date provided to formatToShortDate');
    return '';
  }

  try {
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
    });
  } catch (error) {
    console.error('Error formatting to short date:', error);
    return date.toDateString();
  }
};

/**
 * Gets tomorrow's date and formats to ISO date string
 * 
 * @returns {string} Tomorrow's date in YYYY-MM-DD format
 * 
 * @example
 * getTomorrowDate() // If today is 2025-11-03, returns "2025-11-04"
 */
export const getTomorrowDate = () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error calculating tomorrow:', error);
    return new Date().toISOString().split('T')[0];
  }
};

/**
 * Gets today's date and formats to ISO date string
 * 
 * @returns {string} Today's date in YYYY-MM-DD format
 * 
 * @example
 * getTodayDate() // "2025-11-03"
 */
export const getTodayDate = () => {
  try {
    return new Date().toISOString().split('T')[0];
  } catch (error) {
    console.error('Error getting today date:', error);
    return new Date().toISOString().split('T')[0];
  }
};

/**
 * Formats a date and time to full localized string
 * 
 * @param {Date} date - Date to format
 * @param {string} timeString - Optional time in HH:MM format
 * @returns {string} Formatted date-time string
 * 
 * @example
 * formatDateTime(new Date(2025, 10, 3), '14:30') 
 * // "domenica, 3 novembre 2025 14:30"
 */
export const formatDateTime = (date, timeString = null) => {
  if (!(date instanceof Date)) {
    console.error('Invalid date provided to formatDateTime');
    return '';
  }

  try {
    const dateStr = formatToFullDate(date);
    if (timeString) {
      const formattedTime = formatTime(timeString);
      return `${dateStr} ${formattedTime}`;
    }
    return dateStr;
  } catch (error) {
    console.error('Error formatting date-time:', error);
    return date.toString();
  }
};

/**
 * Parses time string to minutes since midnight
 * Useful for time comparisons
 * 
 * @param {string} timeString - Time in HH:MM format
 * @returns {number} Minutes since midnight, or -1 if invalid
 * 
 * @example
 * timeToMinutes('14:30') // 870
 * timeToMinutes('00:00') // 0
 */
export const timeToMinutes = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return -1;

  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return -1;
    return hours * 60 + minutes;
  } catch (error) {
    console.error('Error converting time to minutes:', error);
    return -1;
  }
};

/**
 * Checks if a time string is in the future (relative to now)
 * 
 * @param {string} timeString - Time in HH:MM format
 * @returns {boolean} True if time is in the future
 * 
 * @example
 * isTimeFuture('14:30') // true if current time is before 14:30
 */
export const isTimeFuture = (timeString) => {
  try {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const targetMinutes = timeToMinutes(timeString);
    
    if (targetMinutes === -1) return false;
    return targetMinutes >= currentMinutes;
  } catch (error) {
    console.error('Error checking if time is future:', error);
    return false;
  }
};

/**
 * ✅ FIX #6 (Sprint 4+): Robust time parsing handles multiple formats
 * Converts any time format to minutes since midnight
 * 
 * @param {string|number|Date|Object} timeData - Time in various formats:
 *   - "HH:MM" string format
 *   - Number representing minutes since midnight
 *   - Number representing milliseconds (timestamp)
 *   - Date object
 *   - Object with {hours, minutes} properties
 * @returns {number} Minutes since midnight, or -1 if invalid
 * 
 * @example
 * parseTimeToMinutes('14:30') // 870
 * parseTimeToMinutes(870) // 870
 * parseTimeToMinutes({hours: 14, minutes: 30}) // 870
 * parseTimeToMinutes(new Date()) // current time in minutes
 */
export const parseTimeToMinutes = (timeData) => {
  if (timeData === null || timeData === undefined) return -1;

  try {
    // String format: "HH:MM"
    if (typeof timeData === 'string') {
      const [hours, minutes] = timeData.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return -1;
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return -1;
      return hours * 60 + minutes;
    }

    // Number format: could be minutes or milliseconds
    if (typeof timeData === 'number') {
      // If it's between 0-1440, assume it's already in minutes
      if (timeData >= 0 && timeData <= 1440) {
        return Math.floor(timeData);
      }
      // If it's large, assume it's milliseconds (timestamp)
      if (timeData > 1440) {
        const date = new Date(timeData);
        return date.getHours() * 60 + date.getMinutes();
      }
      return -1;
    }

    // Date object
    if (timeData instanceof Date) {
      return timeData.getHours() * 60 + timeData.getMinutes();
    }

    // Object format: {hours, minutes}
    if (typeof timeData === 'object' && ('hours' in timeData || 'minutes' in timeData)) {
      const hours = parseInt(timeData.hours, 10) || 0;
      const minutes = parseInt(timeData.minutes, 10) || 0;
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return -1;
      return hours * 60 + minutes;
    }

    return -1;
  } catch (error) {
    console.error('Error parsing time:', error, 'Input:', timeData);
    return -1;
  }
};

export default {
  formatToDateOnly,
  formatTime,
  formatToFullDate,
  formatToShortDate,
  getTomorrowDate,
  getTodayDate,
  formatDateTime,
  timeToMinutes,
  isTimeFuture,
  parseTimeToMinutes,
};
