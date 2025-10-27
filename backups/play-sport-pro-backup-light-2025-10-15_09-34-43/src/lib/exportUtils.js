// =============================================
// FILE: src/lib/exportUtils.js
// Utility per esportazione dati in vari formati
// =============================================

/**
 * Esporta dati in formato CSV
 * @param {Array} data - Array di oggetti da esportare
 * @param {Array} headers - Array di header colonne [{key: 'nomeCampo', label: 'Nome Colonna'}]
 * @param {string} filename - Nome del file senza estensione
 */
export function exportToCSV(data, headers, filename = 'export') {
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('Nessun dato da esportare');
  }

  // Crea l'header CSV
  const csvHeaders = headers.map(h => `"${h.label}"`).join(',');

  // Crea le righe CSV
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = getNestedValue(row, header.key);
      // Gestisci valori null/undefined e escape delle virgolette
      const stringValue = value == null ? '' : String(value);
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',');
  });

  // Combina header e righe
  const csvContent = [csvHeaders, ...csvRows].join('\n');

  // Crea e scarica il file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Ottiene un valore nidificato da un oggetto usando dot notation
 * @param {Object} obj - L'oggetto
 * @param {string} path - Il percorso (es. 'user.name', 'address.city')
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Formatta una data per l'esportazione
 * @param {string|Date} date - La data da formattare
 */
export function formatDateForExport(date) {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString('it-IT');
  } catch {
    return String(date);
  }
}

/**
 * Formatta un numero per l'esportazione
 * @param {number} num - Il numero da formattare
 * @param {number} decimals - Numero di decimali
 */
export function formatNumberForExport(num, decimals = 2) {
  if (num == null || isNaN(num)) return '';
  return Number(num).toFixed(decimals);
}

/**
 * Converte un valore booleano in testo
 * @param {boolean} bool - Il valore booleano
 */
export function formatBooleanForExport(bool) {
  if (bool === true) return 'Sì';
  if (bool === false) return 'No';
  return '';
}