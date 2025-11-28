// =============================================
// FILE: src/features/players/components/CertificateExpiryAlert.jsx
// Alert certificato medico in scadenza/scaduto per utenti
// =============================================

import React, { useState, useEffect } from 'react';
// Fix: Use relative import to avoid potential alias resolution issues causing duplicate contexts
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { useClub } from '../../../contexts/ClubContext.jsx';
import { calculateCertificateStatus } from '@services/medicalCertificates.js';
import { themeTokens } from '@lib/theme.js';

export default function CertificateExpiryAlert() {
  // Il certificato medico è una gestione interna del circolo.
  // Gli utenti NON devono vedere questo banner - solo il circolo gestisce i certificati.
  return null;
}
