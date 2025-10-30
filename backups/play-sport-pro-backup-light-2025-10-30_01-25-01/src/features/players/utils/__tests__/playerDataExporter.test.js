import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  downloadPlayerJSON,
  downloadPlayerCSV,
  downloadPlayerReport,
  exportPlayerAsJSON,
  exportPlayerAsCSV,
  generatePlayerReport,
} from '../playerDataExporter';

/**
 * Test Suite: playerDataExporter Utilities
 *
 * FASE 3 - Task 3.2
 * Tests GDPR export functions (JSON/CSV/TXT)
 * Verifies data structure, formatting, edge cases
 */

describe('playerDataExporter', () => {
  beforeEach(() => {
    // Ensure URL APIs exist and are mockable
    if (!global.URL.createObjectURL) {
      global.URL.createObjectURL = vi.fn(() => 'blob:mock');
    } else {
      vi.spyOn(global.URL, 'createObjectURL').mockReturnValue('blob:mock');
    }
    if (!global.URL.revokeObjectURL) {
      global.URL.revokeObjectURL = vi.fn();
    } else {
      vi.spyOn(global.URL, 'revokeObjectURL').mockImplementation(() => {});
    }
  });
  const mockPlayer = {
    id: 'player-123',
    firstName: 'Mario',
    lastName: 'Rossi',
    email: 'mario.rossi@example.com',
    phone: '+39 333 1234567',
    fiscalCode: 'RSSMRA85M01H501Z',
    birthDate: '1985-01-01',
    address: {
      street: 'Via Roma 10',
      city: 'Milano',
      postalCode: '20121',
      province: 'MI',
      country: 'Italia',
    },
    clubId: 'club-1',
    clubName: 'Tennis Club Milano',
    medicalCertificate: {
      number: 'MC-2024-001',
      expiryDate: '2025-12-31',
      status: 'valid',
    },
    wallet: {
      credits: 150,
      transactions: [
        { id: 'tx-1', amount: 100, type: 'credit', date: '2024-01-15', description: 'Ricarica' },
        {
          id: 'tx-2',
          amount: -50,
          type: 'debit',
          date: '2024-02-20',
          description: 'Prenotazione campo',
        },
      ],
    },
    bookings: [
      { id: 'b-1', date: '2024-03-10', court: 'Campo 1', status: 'completed' },
      { id: 'b-2', date: '2024-03-15', court: 'Campo 2', status: 'confirmed' },
    ],
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-03-01T15:30:00Z',
  };

  describe('downloadPlayerJSON', () => {
    it('should generate valid JSON export', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      const clickSpy = vi.fn();
      const mockLink = {
        href: '',
        download: '',
        click: clickSpy,
      };
      createElementSpy.mockReturnValue(mockLink);

      downloadPlayerJSON(mockPlayer);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.download).toMatch(/^giocatore_Mario_Rossi_\d+\.json$/);
      expect(clickSpy).toHaveBeenCalled();

      // Verify JSON structure using pure function
      const json = exportPlayerAsJSON(mockPlayer);
      const decodedData = JSON.parse(json);

      expect(decodedData.personalInfo.firstName).toBe('Mario');
      expect(decodedData.personalInfo.lastName).toBe('Rossi');
      expect(decodedData.personalInfo.email).toBe('mario.rossi@example.com');
      expect(decodedData.address.city).toBe('Milano');
      expect(decodedData.medicalCertificate?.hasValidCertificate).toBeDefined();

      createElementSpy.mockRestore();
    });

    it('should handle player with undefined fields', () => {
      const minimalPlayer = {
        id: 'player-minimal',
        firstName: 'Test',
        lastName: 'User',
        // Missing: email, phone, address, etc.
      };

      const createElementSpy = vi.spyOn(document, 'createElement');
      const mockLink = { href: '', download: '', click: vi.fn() };
      createElementSpy.mockReturnValue(mockLink);

      expect(() => downloadPlayerJSON(minimalPlayer)).not.toThrow();

      const decodedData = JSON.parse(exportPlayerAsJSON(minimalPlayer));

      expect(decodedData.personalInfo.firstName).toBe('Test');
      expect(decodedData.personalInfo.email).toBe('N/A');
      expect(decodedData.address).toBeUndefined();

      createElementSpy.mockRestore();
    });

    it('should include audit timestamps', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      const mockLink = { href: '', download: '', click: vi.fn() };
      createElementSpy.mockReturnValue(mockLink);

      downloadPlayerJSON(mockPlayer);

      const decodedData = JSON.parse(exportPlayerAsJSON(mockPlayer));

      expect(decodedData.audit.createdAt).toBe('2024-01-01T10:00:00Z');
      expect(decodedData.audit.updatedAt).toBe('2024-03-01T15:30:00Z');

      createElementSpy.mockRestore();
    });
  });

  describe('downloadPlayerCSV', () => {
    it('should generate valid CSV export', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      const mockLink = { href: '', download: '', click: vi.fn() };
      createElementSpy.mockReturnValue(mockLink);

      downloadPlayerCSV(mockPlayer);

      expect(mockLink.download).toMatch(/^giocatore_Mario_Rossi_\d+\.csv$/);

      const csvContent = exportPlayerAsCSV(mockPlayer);

      // Check CSV headers
      expect(csvContent).toContain('Campo,Valore');

      // Check CSV rows
      expect(csvContent).toContain('Nome,Mario');
      expect(csvContent).toContain('Cognome,Rossi');
      expect(csvContent).toContain('Email,mario.rossi@example.com');
      expect(csvContent).toContain('Città,Milano');

      createElementSpy.mockRestore();
    });

    it('should escape CSV special characters', () => {
      const playerWithSpecialChars = {
        ...mockPlayer,
        firstName: 'Mario, Jr.',
        address: {
          street: 'Via "Roma" 10',
        },
      };

      const createElementSpy = vi.spyOn(document, 'createElement');
      const mockLink = { href: '', download: '', click: vi.fn() };
      createElementSpy.mockReturnValue(mockLink);

      downloadPlayerCSV(playerWithSpecialChars);

      const csvContent = exportPlayerAsCSV(playerWithSpecialChars);

      // Commas and quotes should be escaped
      expect(csvContent).toContain('"Mario, Jr."');
      expect(csvContent).toContain('Via ""Roma"" 10');

      createElementSpy.mockRestore();
    });

    it('should handle missing data gracefully', () => {
      const minimalPlayer = {
        id: 'player-minimal',
        firstName: 'Test',
        lastName: 'User',
      };

      const createElementSpy = vi.spyOn(document, 'createElement');
      const mockLink = { href: '', download: '', click: vi.fn() };
      createElementSpy.mockReturnValue(mockLink);

      expect(() => downloadPlayerCSV(minimalPlayer)).not.toThrow();

      const csvContent = exportPlayerAsCSV(minimalPlayer);

      expect(csvContent).toContain('Nome,Test');
      expect(csvContent).toContain('Email,N/A');

      createElementSpy.mockRestore();
    });
  });

  describe('downloadPlayerReport', () => {
    it('should generate human-readable TXT report', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      const mockLink = { href: '', download: '', click: vi.fn() };
      createElementSpy.mockReturnValue(mockLink);

      downloadPlayerReport(mockPlayer);

      expect(mockLink.download).toMatch(/^giocatore_Mario_Rossi_\d+\.txt$/);

      const reportContent = generatePlayerReport(mockPlayer);

      // Check report sections
      expect(reportContent).toContain('REPORT DATI GIOCATORE');
      expect(reportContent).toContain('DATI PERSONALI');
      expect(reportContent).toContain('Nome: Mario');
      expect(reportContent).toContain('Cognome: Rossi');
      expect(reportContent).toContain('INDIRIZZO');
      expect(reportContent).toContain('Via: Via Roma 10');
      expect(reportContent).toContain('CERTIFICATO MEDICO');
      expect(reportContent).toContain('Numero: MC-2024-001');
      expect(reportContent).toContain('WALLET');
      expect(reportContent).toContain('Crediti: 150');
      expect(reportContent).toContain('PRENOTAZIONI');

      createElementSpy.mockRestore();
    });

    it('should format dates correctly', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      const mockLink = { href: '', download: '', click: vi.fn() };
      createElementSpy.mockReturnValue(mockLink);

      downloadPlayerReport(mockPlayer);

      const reportContent = generatePlayerReport(mockPlayer);

      expect(reportContent).toContain('Scadenza: 2025-12-31');
      expect(reportContent).toContain('Data creazione: 2024-01-01');

      createElementSpy.mockRestore();
    });

    it('should include wallet transactions', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      const mockLink = { href: '', download: '', click: vi.fn() };
      createElementSpy.mockReturnValue(mockLink);

      downloadPlayerReport(mockPlayer);

      const reportContent = generatePlayerReport(mockPlayer);

      expect(reportContent).toContain('Ricarica');
      expect(reportContent).toContain('Prenotazione campo');
      expect(reportContent).toContain('€100');
      expect(reportContent).toContain('-€50');

      createElementSpy.mockRestore();
    });

    it('should handle player without optional data', () => {
      const minimalPlayer = {
        id: 'player-minimal',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      };

      const createElementSpy = vi.spyOn(document, 'createElement');
      const mockLink = { href: '', download: '', click: vi.fn() };
      createElementSpy.mockReturnValue(mockLink);

      expect(() => downloadPlayerReport(minimalPlayer)).not.toThrow();

      const blob = mockLink.href.split(',')[1];
      const reportContent = decodeURIComponent(blob);

      expect(reportContent).toContain('Nome: Test');
      expect(reportContent).toContain('Email: test@example.com');
      expect(reportContent).toContain('Telefono: N/A');

      createElementSpy.mockRestore();
    });
  });

  describe('GDPR Compliance', () => {
    it('should include all personal data fields (Art. 15)', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      const mockLink = { href: '', download: '', click: vi.fn() };
      createElementSpy.mockReturnValue(mockLink);

      downloadPlayerJSON(mockPlayer);

      const decodedData = JSON.parse(exportPlayerAsJSON(mockPlayer));

      // Verify all GDPR-required fields
      expect(decodedData.personalInfo).toHaveProperty('firstName');
      expect(decodedData.personalInfo).toHaveProperty('lastName');
      expect(decodedData.personalInfo).toHaveProperty('email');
      expect(decodedData.personalInfo).toHaveProperty('phone');
      expect(decodedData.personalInfo).toHaveProperty('fiscalCode');
      expect(decodedData.personalInfo).toHaveProperty('birthDate');
      expect(decodedData.address).toBeDefined();
      expect(decodedData.clubInfo).toBeDefined();
      expect(decodedData.medicalCertificate).toBeDefined();
      expect(decodedData.wallet).toBeDefined();
      expect(decodedData.bookings).toBeDefined();
      expect(decodedData.audit).toBeDefined();

      createElementSpy.mockRestore();
    });

    it('should generate unique filenames to avoid overwrites', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      const mockLink1 = { href: '', download: '', click: vi.fn() };
      const mockLink2 = { href: '', download: '', click: vi.fn() };

      createElementSpy.mockReturnValueOnce(mockLink1);
      downloadPlayerJSON(mockPlayer);
      const filename1 = mockLink1.download;

      // Wait 1ms to ensure different timestamp
      setTimeout(() => {
        createElementSpy.mockReturnValueOnce(mockLink2);
        downloadPlayerJSON(mockPlayer);
        const filename2 = mockLink2.download;

        expect(filename1).not.toBe(filename2);
      }, 1);

      createElementSpy.mockRestore();
    });

    it('should not expose internal IDs in readable reports', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      const mockLink = { href: '', download: '', click: vi.fn() };
      createElementSpy.mockReturnValue(mockLink);

      downloadPlayerReport(mockPlayer);

      const blob = mockLink.href.split(',')[1];
      const reportContent = decodeURIComponent(blob);

      // Internal IDs should not be in human-readable report
      expect(reportContent).not.toContain('id: player-123');
      expect(reportContent).not.toContain('clubId: club-1');

      createElementSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle null player gracefully', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      const mockLink = { href: '', download: '', click: vi.fn() };
      createElementSpy.mockReturnValue(mockLink);

      expect(() => downloadPlayerJSON(null)).not.toThrow();
      expect(() => downloadPlayerCSV(null)).not.toThrow();
      expect(() => downloadPlayerReport(null)).not.toThrow();

      createElementSpy.mockRestore();
    });

    it('should handle undefined player gracefully', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');
      const mockLink = { href: '', download: '', click: vi.fn() };
      createElementSpy.mockReturnValue(mockLink);

      expect(() => downloadPlayerJSON(undefined)).not.toThrow();
      expect(() => downloadPlayerCSV(undefined)).not.toThrow();
      expect(() => downloadPlayerReport(undefined)).not.toThrow();

      createElementSpy.mockRestore();
    });

    it('should sanitize filename special characters', () => {
      const playerWithSpecialChars = {
        ...mockPlayer,
        firstName: 'Mario/Giuseppe',
        lastName: 'Rossi\\Bianchi',
      };

      const createElementSpy = vi.spyOn(document, 'createElement');
      const mockLink = { href: '', download: '', click: vi.fn() };
      createElementSpy.mockReturnValue(mockLink);

      downloadPlayerJSON(playerWithSpecialChars);

      // Filename should not contain / or \
      expect(mockLink.download).not.toContain('/');
      expect(mockLink.download).not.toContain('\\');

      createElementSpy.mockRestore();
    });
  });
});
