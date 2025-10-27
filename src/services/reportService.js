/**
 * Advanced Reporting Service
 * Generazione report con export Excel e PDF
 */

import { Firestore } from 'firebase/firestore';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Classe ReportGenerator
 */
export class ReportGenerator {
  constructor(firestore) {
    this.db = firestore;
  }

  /**
   * Report Bookings per Club
   */
  async getBookingsReport(clubId, startDate, endDate) {
    const bookings = [];
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const snapshot = await this.db
      .collection('bookings')
      .where('clubId', '==', clubId)
      .where('date', '>=', start)
      .where('date', '<=', end)
      .orderBy('date', 'desc')
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      bookings.push({
        id: doc.id,
        date: new Date(data.date).toLocaleDateString('it-IT'),
        time: `${data.startTime} - ${data.endTime}`,
        court: data.courtName || 'N/A',
        user: data.userName || 'N/A',
        players: data.players?.length || 0,
        duration: data.duration || 0,
        amount: data.totalAmount || 0,
        status: data.status,
        paymentStatus: data.paymentStatus
      });
    }

    // Statistiche
    const stats = {
      total: bookings.length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      totalRevenue: bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.amount, 0),
      avgDuration: bookings.length > 0
        ? bookings.reduce((sum, b) => sum + b.duration, 0) / bookings.length
        : 0,
      avgPlayers: bookings.length > 0
        ? bookings.reduce((sum, b) => sum + b.players, 0) / bookings.length
        : 0
    };

    return { bookings, stats };
  }

  /**
   * Report Matches per Club
   */
  async getMatchesReport(clubId, startDate, endDate) {
    const matches = [];
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const snapshot = await this.db
      .collection('matches')
      .where('clubId', '==', clubId)
      .where('date', '>=', start)
      .where('date', '<=', end)
      .orderBy('date', 'desc')
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      matches.push({
        id: doc.id,
        date: new Date(data.date).toLocaleDateString('it-IT'),
        sport: data.sport,
        player1: data.player1Name || 'N/A',
        player2: data.player2Name || 'N/A',
        score: data.score
          ? `${data.score.player1} - ${data.score.player2}`
          : 'N/A',
        winner: data.winner || 'N/A',
        eloChange: data.eloChange
          ? `${data.eloChange.player1} / ${data.eloChange.player2}`
          : 'N/A',
        status: data.status
      });
    }

    // Statistiche
    const stats = {
      total: matches.length,
      completed: matches.filter(m => m.status === 'completed').length,
      cancelled: matches.filter(m => m.status === 'cancelled').length,
      inProgress: matches.filter(m => m.status === 'in-progress').length,
      bySport: {}
    };

    matches.forEach(match => {
      if (!stats.bySport[match.sport]) {
        stats.bySport[match.sport] = 0;
      }
      stats.bySport[match.sport]++;
    });

    return { matches, stats };
  }

  /**
   * Report Revenue per Club
   */
  async getRevenueReport(clubId, startDate, endDate) {
    const payments = [];
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const snapshot = await this.db
      .collection('payments')
      .where('clubId', '==', clubId)
      .where('createdAt', '>=', start)
      .where('createdAt', '<=', end)
      .orderBy('createdAt', 'desc')
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      payments.push({
        id: doc.id,
        date: new Date(data.createdAt).toLocaleDateString('it-IT'),
        user: data.userName || 'N/A',
        amount: data.amount,
        method: data.method,
        status: data.status,
        booking: data.bookingId || 'N/A'
      });
    }

    // Statistiche per giorno
    const dailyRevenue = {};
    payments.forEach(payment => {
      if (payment.status === 'completed') {
        if (!dailyRevenue[payment.date]) {
          dailyRevenue[payment.date] = 0;
        }
        dailyRevenue[payment.date] += payment.amount;
      }
    });

    // Statistiche per metodo pagamento
    const byMethod = {};
    payments.forEach(payment => {
      if (payment.status === 'completed') {
        if (!byMethod[payment.method]) {
          byMethod[payment.method] = 0;
        }
        byMethod[payment.method] += payment.amount;
      }
    });

    const stats = {
      total: payments.length,
      completed: payments.filter(p => p.status === 'completed').length,
      failed: payments.filter(p => p.status === 'failed').length,
      pending: payments.filter(p => p.status === 'pending').length,
      totalRevenue: payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0),
      avgTransaction: 0,
      dailyRevenue,
      byMethod
    };

    if (stats.completed > 0) {
      stats.avgTransaction = stats.totalRevenue / stats.completed;
    }

    return { payments, stats };
  }

  /**
   * Report Users Activity
   */
  async getUsersReport(clubId, startDate, endDate) {
    const users = [];
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    // Ottieni tutti i player del club
    const playersSnapshot = await this.db
      .collection('players')
      .where('clubId', '==', clubId)
      .where('isActive', '==', true)
      .get();

    for (const doc of playersSnapshot.docs) {
      const playerData = doc.data();
      const userId = playerData.userId;

      // Conta bookings
      const bookingsSnapshot = await this.db
        .collection('bookings')
        .where('clubId', '==', clubId)
        .where('userId', '==', userId)
        .where('date', '>=', start)
        .where('date', '<=', end)
        .get();

      // Conta matches
      const matchesSnapshot = await this.db
        .collection('matches')
        .where('clubId', '==', clubId)
        .where('date', '>=', start)
        .where('date', '<=', end)
        .get();

      const userMatches = matchesSnapshot.docs.filter(
        m => m.data().player1Id === userId || m.data().player2Id === userId
      );

      users.push({
        name: playerData.displayName || 'N/A',
        email: playerData.email || 'N/A',
        bookings: bookingsSnapshot.size,
        matches: userMatches.length,
        ranking: playerData.ranking || 0,
        elo: playerData.elo || 1000,
        joinDate: playerData.joinDate
          ? new Date(playerData.joinDate).toLocaleDateString('it-IT')
          : 'N/A',
        lastActive: playerData.lastActive
          ? new Date(playerData.lastActive).toLocaleDateString('it-IT')
          : 'N/A'
      });
    }

    // Ordina per attività
    users.sort((a, b) => (b.bookings + b.matches) - (a.bookings + a.matches));

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.bookings > 0 || u.matches > 0).length,
      avgBookingsPerUser: users.length > 0
        ? users.reduce((sum, u) => sum + u.bookings, 0) / users.length
        : 0,
      avgMatchesPerUser: users.length > 0
        ? users.reduce((sum, u) => sum + u.matches, 0) / users.length
        : 0,
      topUsers: users.slice(0, 10)
    };

    return { users, stats };
  }

  /**
   * Export Bookings Report to Excel
   */
  async exportBookingsToExcel(clubId, startDate, endDate) {
    const { bookings, stats } = await this.getBookingsReport(clubId, startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Prenotazioni');

    // Header
    worksheet.columns = [
      { header: 'Data', key: 'date', width: 12 },
      { header: 'Orario', key: 'time', width: 15 },
      { header: 'Campo', key: 'court', width: 15 },
      { header: 'Utente', key: 'user', width: 20 },
      { header: 'Giocatori', key: 'players', width: 10 },
      { header: 'Durata (min)', key: 'duration', width: 12 },
      { header: 'Importo (€)', key: 'amount', width: 12 },
      { header: 'Stato', key: 'status', width: 12 },
      { header: 'Pagamento', key: 'paymentStatus', width: 12 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' }
    };

    // Add data
    bookings.forEach(booking => {
      worksheet.addRow(booking);
    });

    // Add stats
    worksheet.addRow([]);
    worksheet.addRow(['STATISTICHE']);
    worksheet.addRow(['Totale prenotazioni:', stats.total]);
    worksheet.addRow(['Completate:', stats.completed]);
    worksheet.addRow(['Cancellate:', stats.cancelled]);
    worksheet.addRow(['In attesa:', stats.pending]);
    worksheet.addRow(['Fatturato totale (€):', stats.totalRevenue.toFixed(2)]);
    worksheet.addRow(['Durata media (min):', stats.avgDuration.toFixed(0)]);
    worksheet.addRow(['Media giocatori:', stats.avgPlayers.toFixed(1)]);

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  /**
   * Export Bookings Report to PDF
   */
  async exportBookingsToPDF(clubId, clubName, startDate, endDate) {
    const { bookings, stats } = await this.getBookingsReport(clubId, startDate, endDate);

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Report Prenotazioni - ${clubName}`, 14, 20);

    // Period
    doc.setFontSize(11);
    doc.text(
      `Periodo: ${new Date(startDate).toLocaleDateString('it-IT')} - ${new Date(endDate).toLocaleDateString('it-IT')}`,
      14,
      30
    );

    // Stats box
    doc.setFillColor(76, 175, 80);
    doc.rect(14, 40, 180, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`Totale: ${stats.total}`, 20, 50);
    doc.text(`Completate: ${stats.completed}`, 20, 58);
    doc.text(`Cancellate: ${stats.cancelled}`, 20, 66);
    doc.text(`Fatturato: €${stats.totalRevenue.toFixed(2)}`, 20, 74);
    doc.text(`Durata media: ${stats.avgDuration.toFixed(0)} min`, 100, 50);
    doc.text(`Media giocatori: ${stats.avgPlayers.toFixed(1)}`, 100, 58);

    // Table
    doc.setTextColor(0, 0, 0);
    doc.autoTable({
      startY: 90,
      head: [['Data', 'Orario', 'Campo', 'Utente', 'Importo', 'Stato']],
      body: bookings.map(b => [
        b.date,
        b.time,
        b.court,
        b.user,
        `€${b.amount.toFixed(2)}`,
        b.status
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [76, 175, 80] }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Pagina ${i} di ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    return doc.output('arraybuffer');
  }

  /**
   * Export Revenue Report to Excel
   */
  async exportRevenueToExcel(clubId, startDate, endDate) {
    const { payments, stats } = await this.getRevenueReport(clubId, startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    
    // Worksheet Pagamenti
    const paymentsSheet = workbook.addWorksheet('Pagamenti');
    paymentsSheet.columns = [
      { header: 'Data', key: 'date', width: 12 },
      { header: 'Utente', key: 'user', width: 20 },
      { header: 'Importo (€)', key: 'amount', width: 12 },
      { header: 'Metodo', key: 'method', width: 15 },
      { header: 'Stato', key: 'status', width: 12 },
      { header: 'Prenotazione', key: 'booking', width: 15 }
    ];

    paymentsSheet.getRow(1).font = { bold: true };
    paymentsSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2196F3' }
    };

    payments.forEach(payment => {
      paymentsSheet.addRow(payment);
    });

    // Worksheet Statistiche
    const statsSheet = workbook.addWorksheet('Statistiche');
    statsSheet.addRow(['RIEPILOGO GENERALE']);
    statsSheet.addRow(['Totale transazioni:', stats.total]);
    statsSheet.addRow(['Completate:', stats.completed]);
    statsSheet.addRow(['Fallite:', stats.failed]);
    statsSheet.addRow(['In attesa:', stats.pending]);
    statsSheet.addRow(['Fatturato totale (€):', stats.totalRevenue.toFixed(2)]);
    statsSheet.addRow(['Importo medio (€):', stats.avgTransaction.toFixed(2)]);
    statsSheet.addRow([]);
    
    statsSheet.addRow(['FATTURATO GIORNALIERO']);
    statsSheet.addRow(['Data', 'Importo (€)']);
    Object.entries(stats.dailyRevenue).forEach(([date, amount]) => {
      statsSheet.addRow([date, amount.toFixed(2)]);
    });

    statsSheet.addRow([]);
    statsSheet.addRow(['FATTURATO PER METODO']);
    statsSheet.addRow(['Metodo', 'Importo (€)']);
    Object.entries(stats.byMethod).forEach(([method, amount]) => {
      statsSheet.addRow([method, amount.toFixed(2)]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}

/**
 * Hook per React
 */
export function useReports(clubId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reportGenerator = new ReportGenerator(firestore);

  const generateReport = async (type, startDate, endDate, format = 'excel') => {
    setLoading(true);
    setError(null);

    try {
      let result;

      switch (type) {
        case 'bookings':
          if (format === 'excel') {
            result = await reportGenerator.exportBookingsToExcel(clubId, startDate, endDate);
          } else {
            result = await reportGenerator.exportBookingsToPDF(clubId, clubName, startDate, endDate);
          }
          break;

        case 'revenue':
          result = await reportGenerator.exportRevenueToExcel(clubId, startDate, endDate);
          break;

        default:
          throw new Error(`Unknown report type: ${type}`);
      }

      // Download file
      const blob = new Blob([result], {
        type: format === 'excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report_${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setLoading(false);
      return true;
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  return {
    generateReport,
    loading,
    error
  };
}
