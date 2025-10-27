// =============================================
// FILE: functions/emailTemplates.js
// Template HTML professionali per email transazionali
// =============================================

/**
 * Template base con branding e layout responsivo
 */
function getBaseTemplate({ title, content, clubName, clubLogo, primaryColor = '#2563eb' }) {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -20)} 100%); padding: 40px 20px; text-align: center; }
    .logo { max-width: 120px; height: auto; margin-bottom: 15px; }
    .header-title { color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; }
    .content { padding: 40px 30px; }
    .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
    .button { display: inline-block; background-color: ${primaryColor}; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .button:hover { background-color: ${adjustBrightness(primaryColor, -15)}; }
    .info-box { background-color: #f0f9ff; border-left: 4px solid ${primaryColor}; padding: 16px; margin: 20px 0; border-radius: 4px; }
    .warning-box { background-color: #fff7ed; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px; }
    .danger-box { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 4px; }
    .success-box { background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 4px; }
    .divider { border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
    .detail-label { color: #6b7280; font-size: 14px; }
    .detail-value { color: #111827; font-weight: 600; font-size: 14px; }
    .social-links { margin-top: 20px; }
    .social-links a { display: inline-block; margin: 0 10px; color: #6b7280; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .content { padding: 30px 20px; }
      .header { padding: 30px 15px; }
      .button { display: block; width: 100%; box-sizing: border-box; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${clubLogo ? `<img src="${clubLogo}" alt="${clubName}" class="logo">` : ''}
      <h1 class="header-title">${clubName || 'Play-Sport.pro'}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px 0;">
        Questa email è stata inviata automaticamente da <strong>Play-Sport.pro</strong>
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        ${clubName || 'Play-Sport.pro'} • Gestione Impianti Sportivi
      </p>
      <div class="social-links">
        <a href="https://play-sport.pro/privacy">Privacy Policy</a> •
        <a href="https://play-sport.pro/terms">Termini di Servizio</a>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Utility per regolare luminosità colore
 */
function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

/**
 * Formatta data in italiano
 */
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formatta ora
 */
function formatTime(timeString) {
  return timeString.substring(0, 5); // "14:30:00" -> "14:30"
}

// =============================================
// BOOKING TEMPLATES
// =============================================

/**
 * Email conferma prenotazione
 */
export function bookingConfirmationTemplate({
  playerName,
  clubName,
  clubLogo,
  courtName,
  date,
  time,
  duration,
  price,
  players,
  bookingId,
  primaryColor,
}) {
  const content = `
    <h2 style="color: #111827; margin-top: 0;">✅ Prenotazione Confermata!</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Ciao <strong>${playerName}</strong>,
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      La tua prenotazione è stata confermata con successo. Ecco i dettagli:
    </p>

    <div class="success-box">
      <p style="margin: 0; color: #065f46; font-weight: 600;">
        🎾 ${courtName}
      </p>
    </div>

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <div class="detail-row">
        <span class="detail-label">📅 Data</span>
        <span class="detail-value">${formatDate(date)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">⏰ Orario</span>
        <span class="detail-value">${formatTime(time)} (${duration} min)</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">👥 Giocatori</span>
        <span class="detail-value">${players.join(', ')}</span>
      </div>
      <div class="detail-row" style="border-bottom: none;">
        <span class="detail-label">💰 Totale</span>
        <span class="detail-value" style="color: #10b981; font-size: 18px;">€${price.toFixed(2)}</span>
      </div>
    </div>

    <div class="info-box">
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        <strong>💡 Ricorda:</strong> Presentati 10 minuti prima per il check-in.
      </p>
    </div>

    <div style="text-align: center;">
      <a href="https://play-sport.pro/bookings/${bookingId}" class="button">
        Visualizza Prenotazione
      </a>
    </div>

    <hr class="divider">

    <p style="color: #6b7280; font-size: 13px; margin: 0;">
      <strong>ID Prenotazione:</strong> ${bookingId}
    </p>
  `;

  return {
    subject: `✅ Prenotazione Confermata - ${courtName} | ${clubName}`,
    text: `Prenotazione confermata!\n\nCampo: ${courtName}\nData: ${formatDate(date)}\nOrario: ${formatTime(time)}\nDurata: ${duration} min\nGiocatori: ${players.join(', ')}\nTotale: €${price.toFixed(2)}\n\nID: ${bookingId}`,
    html: getBaseTemplate({ title: 'Prenotazione Confermata', content, clubName, clubLogo, primaryColor }),
  };
}

/**
 * Email reminder prenotazione (24h prima)
 */
export function bookingReminderTemplate({
  playerName,
  clubName,
  clubLogo,
  courtName,
  date,
  time,
  duration,
  players,
  bookingId,
  primaryColor,
}) {
  const content = `
    <h2 style="color: #111827; margin-top: 0;">⏰ Reminder Prenotazione</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Ciao <strong>${playerName}</strong>,
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      La tua partita è <strong>domani</strong>! Ecco i dettagli:
    </p>

    <div class="warning-box">
      <p style="margin: 0; color: #92400e; font-weight: 600;">
        🎾 ${courtName}
      </p>
    </div>

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <div class="detail-row">
        <span class="detail-label">📅 Data</span>
        <span class="detail-value">${formatDate(date)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">⏰ Orario</span>
        <span class="detail-value">${formatTime(time)} (${duration} min)</span>
      </div>
      <div class="detail-row" style="border-bottom: none;">
        <span class="detail-label">👥 Giocatori</span>
        <span class="detail-value">${players.join(', ')}</span>
      </div>
    </div>

    <div class="info-box">
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        <strong>💡 Consigli:</strong> Controlla meteo, prepara racchetta e abbigliamento, arriva 10 min prima.
      </p>
    </div>

    <div style="text-align: center;">
      <a href="https://play-sport.pro/bookings/${bookingId}" class="button">
        Gestisci Prenotazione
      </a>
    </div>
  `;

  return {
    subject: `⏰ Reminder: Partita Domani - ${courtName} | ${clubName}`,
    text: `Reminder: la tua partita è domani!\n\nCampo: ${courtName}\nData: ${formatDate(date)}\nOrario: ${formatTime(time)}\nGiocatori: ${players.join(', ')}\n\nID: ${bookingId}`,
    html: getBaseTemplate({ title: 'Reminder Prenotazione', content, clubName, clubLogo, primaryColor }),
  };
}

/**
 * Email cancellazione prenotazione
 */
export function bookingCancellationTemplate({
  playerName,
  clubName,
  clubLogo,
  courtName,
  date,
  time,
  bookingId,
  cancelledBy,
  reason,
  primaryColor,
}) {
  const content = `
    <h2 style="color: #111827; margin-top: 0;">❌ Prenotazione Cancellata</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Ciao <strong>${playerName}</strong>,
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      La prenotazione è stata cancellata ${cancelledBy ? `da <strong>${cancelledBy}</strong>` : ''}.
    </p>

    <div class="danger-box">
      <p style="margin: 0 0 10px 0; color: #991b1b; font-weight: 600;">
        🎾 ${courtName}
      </p>
      <p style="margin: 0; color: #991b1b; font-size: 14px;">
        ${formatDate(date)} alle ${formatTime(time)}
      </p>
    </div>

    ${reason ? `
      <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 5px 0;">Motivo:</p>
        <p style="color: #111827; margin: 0;">${reason}</p>
      </div>
    ` : ''}

    <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
      Vuoi prenotare un altro slot? Accedi alla piattaforma per vedere la disponibilità.
    </p>

    <div style="text-align: center;">
      <a href="https://play-sport.pro/prenota" class="button">
        Nuova Prenotazione
      </a>
    </div>

    <hr class="divider">

    <p style="color: #6b7280; font-size: 13px; margin: 0;">
      <strong>ID Prenotazione:</strong> ${bookingId}
    </p>
  `;

  return {
    subject: `❌ Prenotazione Cancellata - ${courtName} | ${clubName}`,
    text: `Prenotazione cancellata.\n\nCampo: ${courtName}\nData: ${formatDate(date)}\nOrario: ${formatTime(time)}\n${reason ? `Motivo: ${reason}\n` : ''}\nID: ${bookingId}`,
    html: getBaseTemplate({ title: 'Prenotazione Cancellata', content, clubName, clubLogo, primaryColor }),
  };
}

/**
 * Email aggiunta a prenotazione esistente
 */
export function addedToBookingTemplate({
  playerName,
  clubName,
  clubLogo,
  courtName,
  date,
  time,
  duration,
  organizer,
  players,
  bookingId,
  primaryColor,
}) {
  const content = `
    <h2 style="color: #111827; margin-top: 0;">🎉 Sei stato aggiunto a una partita!</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Ciao <strong>${playerName}</strong>,
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      <strong>${organizer}</strong> ti ha aggiunto a una partita. Ci vediamo in campo!
    </p>

    <div class="success-box">
      <p style="margin: 0; color: #065f46; font-weight: 600;">
        🎾 ${courtName}
      </p>
    </div>

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <div class="detail-row">
        <span class="detail-label">📅 Data</span>
        <span class="detail-value">${formatDate(date)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">⏰ Orario</span>
        <span class="detail-value">${formatTime(time)} (${duration} min)</span>
      </div>
      <div class="detail-row" style="border-bottom: none;">
        <span class="detail-label">👥 Giocatori</span>
        <span class="detail-value">${players.join(', ')}</span>
      </div>
    </div>

    <div class="info-box">
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        <strong>💡 Nota:</strong> Se non puoi partecipare, contatta ${organizer} per tempo.
      </p>
    </div>

    <div style="text-align: center;">
      <a href="https://play-sport.pro/bookings/${bookingId}" class="button">
        Visualizza Dettagli
      </a>
    </div>
  `;

  return {
    subject: `🎉 Sei stato aggiunto a una partita - ${courtName} | ${clubName}`,
    text: `${organizer} ti ha aggiunto a una partita!\n\nCampo: ${courtName}\nData: ${formatDate(date)}\nOrario: ${formatTime(time)}\nGiocatori: ${players.join(', ')}\n\nID: ${bookingId}`,
    html: getBaseTemplate({ title: 'Aggiunto a Partita', content, clubName, clubLogo, primaryColor }),
  };
}

// =============================================
// MATCH TEMPLATES
// =============================================

/**
 * Email invito partita competitiva
 */
export function matchInvitationTemplate({
  playerName,
  clubName,
  clubLogo,
  matchType,
  opponent,
  date,
  time,
  courtName,
  matchId,
  primaryColor,
}) {
  const content = `
    <h2 style="color: #111827; margin-top: 0;">🏆 Invito a Partita Competitiva</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Ciao <strong>${playerName}</strong>,
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      <strong>${opponent}</strong> ti ha sfidato a un match ${matchType}!
    </p>

    <div class="info-box">
      <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: 600;">
        🎾 ${courtName}
      </p>
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        ${formatDate(date)} alle ${formatTime(time)}
      </p>
    </div>

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <div class="detail-row">
        <span class="detail-label">🏅 Tipo Match</span>
        <span class="detail-value">${matchType}</span>
      </div>
      <div class="detail-row" style="border-bottom: none;">
        <span class="detail-label">⚔️ Avversario</span>
        <span class="detail-value">${opponent}</span>
      </div>
    </div>

    <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
      Accetta la sfida e mostra il tuo valore! Il risultato verrà registrato nel ranking.
    </p>

    <div style="text-align: center;">
      <a href="https://play-sport.pro/matches/${matchId}" class="button">
        Accetta Sfida
      </a>
    </div>
  `;

  return {
    subject: `🏆 Sfida Ricevuta - ${opponent} ti ha sfidato | ${clubName}`,
    text: `${opponent} ti ha sfidato!\n\nTipo: ${matchType}\nData: ${formatDate(date)}\nOrario: ${formatTime(time)}\nCampo: ${courtName}\n\nID: ${matchId}`,
    html: getBaseTemplate({ title: 'Invito Partita', content, clubName, clubLogo, primaryColor }),
  };
}

/**
 * Email risultato partita registrato
 */
export function matchResultTemplate({
  playerName,
  clubName,
  clubLogo,
  matchType,
  opponent,
  score,
  winner,
  eloChange,
  newRanking,
  date,
  primaryColor,
}) {
  const isWinner = winner === playerName;
  const content = `
    <h2 style="color: #111827; margin-top: 0;">${isWinner ? '🏆 Vittoria!' : '😔 Sconfitta'}</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Ciao <strong>${playerName}</strong>,
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Il risultato della tua partita è stato registrato.
    </p>

    <div class="${isWinner ? 'success' : 'danger'}-box">
      <p style="margin: 0 0 10px 0; color: ${isWinner ? '#065f46' : '#991b1b'}; font-weight: 600; font-size: 18px;">
        ${score}
      </p>
      <p style="margin: 0; color: ${isWinner ? '#065f46' : '#991b1b'}; font-size: 14px;">
        vs ${opponent}
      </p>
    </div>

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <div class="detail-row">
        <span class="detail-label">🏅 Tipo Match</span>
        <span class="detail-value">${matchType}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">📅 Data</span>
        <span class="detail-value">${formatDate(date)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">📊 Variazione ELO</span>
        <span class="detail-value" style="color: ${eloChange >= 0 ? '#10b981' : '#dc2626'};">
          ${eloChange >= 0 ? '+' : ''}${eloChange}
        </span>
      </div>
      <div class="detail-row" style="border-bottom: none;">
        <span class="detail-label">🏆 Nuovo Ranking</span>
        <span class="detail-value" style="font-size: 18px;">#${newRanking}</span>
      </div>
    </div>

    ${isWinner ? `
      <div class="success-box">
        <p style="margin: 0; color: #065f46; font-size: 14px;">
          🎉 <strong>Ottimo lavoro!</strong> Continua così e salirai nel ranking.
        </p>
      </div>
    ` : `
      <div class="info-box">
        <p style="margin: 0; color: #1e40af; font-size: 14px;">
          💪 <strong>Non mollare!</strong> Ogni sconfitta è un'opportunità per migliorare.
        </p>
      </div>
    `}

    <div style="text-align: center;">
      <a href="https://play-sport.pro/ranking" class="button">
        Visualizza Ranking
      </a>
    </div>
  `;

  return {
    subject: `${isWinner ? '🏆 Vittoria!' : '📊 Partita Giocata'} - ${opponent} | ${clubName}`,
    text: `Risultato: ${score}\nvs ${opponent}\n\nVariazione ELO: ${eloChange >= 0 ? '+' : ''}${eloChange}\nNuovo Ranking: #${newRanking}`,
    html: getBaseTemplate({ title: 'Risultato Partita', content, clubName, clubLogo, primaryColor }),
  };
}

// =============================================
// USER ACCOUNT TEMPLATES
// =============================================

/**
 * Email benvenuto nuovo utente
 */
export function welcomeTemplate({
  playerName,
  clubName,
  clubLogo,
  primaryColor,
}) {
  const content = `
    <h2 style="color: #111827; margin-top: 0;">🎉 Benvenuto su Play-Sport.pro!</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Ciao <strong>${playerName}</strong>,
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Benvenuto nel circolo <strong>${clubName}</strong>! Siamo felici di averti con noi.
    </p>

    <div class="success-box">
      <p style="margin: 0; color: #065f46; font-size: 14px;">
        ✅ Il tuo account è stato creato con successo!
      </p>
    </div>

    <h3 style="color: #111827; margin-top: 30px;">🚀 Cosa puoi fare ora:</h3>
    <ul style="color: #4b5563; line-height: 1.8;">
      <li><strong>Prenota campi</strong> - Trova e prenota i campi disponibili</li>
      <li><strong>Gioca partite</strong> - Sfida altri giocatori e scala il ranking</li>
      <li><strong>Partecipa a tornei</strong> - Unisciti ai tornei del circolo</li>
      <li><strong>Monitora statistiche</strong> - Traccia le tue performance</li>
    </ul>

    <div class="info-box">
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        💡 <strong>Consiglio:</strong> Completa il tuo profilo e carica il certificato medico per iniziare a giocare!
      </p>
    </div>

    <div style="text-align: center;">
      <a href="https://play-sport.pro/profile" class="button">
        Completa Profilo
      </a>
    </div>
  `;

  return {
    subject: `🎉 Benvenuto su Play-Sport.pro - ${clubName}`,
    text: `Benvenuto ${playerName}!\n\nIl tuo account per ${clubName} è stato creato.\n\nCosa puoi fare:\n- Prenotare campi\n- Giocare partite\n- Partecipare a tornei\n- Monitorare statistiche\n\nCompleta il tuo profilo per iniziare!`,
    html: getBaseTemplate({ title: 'Benvenuto', content, clubName, clubLogo, primaryColor }),
  };
}

/**
 * Email reset password
 */
export function passwordResetTemplate({
  playerName,
  clubName,
  clubLogo,
  resetLink,
  expiresIn = '1 ora',
  primaryColor,
}) {
  const content = `
    <h2 style="color: #111827; margin-top: 0;">🔐 Reset Password</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Ciao <strong>${playerName}</strong>,
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Abbiamo ricevuto una richiesta di reset password per il tuo account.
    </p>

    <div class="warning-box">
      <p style="margin: 0; color: #92400e; font-size: 14px;">
        ⏰ <strong>Attenzione:</strong> Questo link scade tra ${expiresIn}.
      </p>
    </div>

    <div style="text-align: center;">
      <a href="${resetLink}" class="button">
        Reimposta Password
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
      Se non hai richiesto il reset, ignora questa email. La tua password rimarrà invariata.
    </p>

    <div class="danger-box">
      <p style="margin: 0; color: #991b1b; font-size: 13px;">
        🔒 <strong>Sicurezza:</strong> Non condividere mai questo link con nessuno.
      </p>
    </div>
  `;

  return {
    subject: `🔐 Reset Password - ${clubName}`,
    text: `Reset password richiesto.\n\nClicca il link per reimpostare la password (scade tra ${expiresIn}):\n${resetLink}\n\nSe non hai richiesto il reset, ignora questa email.`,
    html: getBaseTemplate({ title: 'Reset Password', content, clubName, clubLogo, primaryColor }),
  };
}

// =============================================
// PAYMENT TEMPLATES
// =============================================

/**
 * Email conferma pagamento
 */
export function paymentConfirmationTemplate({
  playerName,
  clubName,
  clubLogo,
  amount,
  currency = 'EUR',
  description,
  invoiceUrl,
  paymentId,
  primaryColor,
}) {
  const content = `
    <h2 style="color: #111827; margin-top: 0;">✅ Pagamento Ricevuto</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Ciao <strong>${playerName}</strong>,
    </p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
      Abbiamo ricevuto il tuo pagamento. Grazie!
    </p>

    <div class="success-box">
      <p style="margin: 0; color: #065f46; font-weight: 600; font-size: 24px;">
        ${currency === 'EUR' ? '€' : '$'}${amount.toFixed(2)}
      </p>
    </div>

    <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <div class="detail-row">
        <span class="detail-label">💳 Descrizione</span>
        <span class="detail-value">${description}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">📅 Data</span>
        <span class="detail-value">${formatDate(new Date().toISOString())}</span>
      </div>
      <div class="detail-row" style="border-bottom: none;">
        <span class="detail-label">🔖 ID Transazione</span>
        <span class="detail-value">${paymentId}</span>
      </div>
    </div>

    ${invoiceUrl ? `
      <div style="text-align: center;">
        <a href="${invoiceUrl}" class="button">
          Scarica Fattura PDF
        </a>
      </div>
    ` : ''}

    <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin-top: 30px;">
      Conserva questa email come ricevuta. Per assistenza, contatta ${clubName}.
    </p>
  `;

  return {
    subject: `✅ Pagamento Confermato - €${amount.toFixed(2)} | ${clubName}`,
    text: `Pagamento ricevuto: €${amount.toFixed(2)}\n\nDescrizione: ${description}\nID: ${paymentId}\n${invoiceUrl ? `\nFattura: ${invoiceUrl}` : ''}`,
    html: getBaseTemplate({ title: 'Pagamento Confermato', content, clubName, clubLogo, primaryColor }),
  };
}

// =============================================
// EXPORT
// =============================================

export default {
  bookingConfirmationTemplate,
  bookingReminderTemplate,
  bookingCancellationTemplate,
  addedToBookingTemplate,
  matchInvitationTemplate,
  matchResultTemplate,
  welcomeTemplate,
  passwordResetTemplate,
  paymentConfirmationTemplate,
};
