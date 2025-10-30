import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '@contexts/AuthContext';
import { useClub } from '@contexts/ClubContext';
import { usePlayerPermissions } from '../usePlayerPermissions';

describe('usePlayerPermissions', () => {
  // Mock contexts at module level
  vi.mock('@contexts/AuthContext');
  vi.mock('@contexts/ClubContext');

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useClub).mockReturnValue({ clubId: 'club-1' });
  });

  describe('Admin Role', () => {
    it('should grant all permissions to admin users', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'admin-123' },
        userProfile: { role: 'admin' },
        userClubRoles: {},
      });

      const player = {
        id: 'player-1',
        clubId: 'club-1',
        linkedUserId: 'user-1',
      };

      const { result } = renderHook(() => usePlayerPermissions(player));

      expect(result.current.isAdmin).toBe(true);
      expect(result.current.canEdit).toBe(true);
      expect(result.current.canDelete).toBe(true);
      expect(result.current.canExportData).toBe(true);
      expect(result.current.canViewSensitiveData).toBe(true);
      expect(result.current.canManageWallet).toBe(true);
      expect(result.current.canManageCertificates).toBe(true);
      expect(result.current.canManageNotes).toBe(true);
      expect(result.current.canActivateDeactivate).toBe(true);
    });

    it('should allow admin to edit any player from any club', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'admin-123' },
        userProfile: { role: 'admin' },
        userClubRoles: { 'club-999': 'admin' },
      });

      const player = {
        id: 'player-1',
        clubId: 'club-1',
        linkedUserId: 'user-1',
      };

      const { result } = renderHook(() => usePlayerPermissions(player));

      expect(result.current.canEdit).toBe(true);
      expect(result.current.canDelete).toBe(true);
    });
  });

  describe('Club-Admin Role', () => {
    it('should grant permissions only for players from same club', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'club-admin-123' },
        userProfile: { role: 'club-admin' },
        userClubRoles: { 'club-1': 'club-admin' },
      });

      const player = {
        id: 'player-1',
        clubId: 'club-1',
        linkedUserId: 'user-1',
      };

      const { result } = renderHook(() => usePlayerPermissions(player));

      expect(result.current.canEdit).toBe(true);
      expect(result.current.canDelete).toBe(false);
      expect(result.current.canActivateDeactivate).toBe(true);
      expect(result.current.canLinkAccount).toBe(true);
      expect(result.current.canExportData).toBe(true);
    });

    it('should deny permissions for players from different club', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'club-admin-123' },
        userProfile: { role: 'club-admin' },
        userClubRoles: { 'club-1': 'club-admin' },
      });

      const player = {
        id: 'player-1',
        clubId: 'club-2',
        linkedUserId: 'user-1',
      };

      const { result } = renderHook(() => usePlayerPermissions(player));

      expect(result.current.canEdit).toBe(false);
      expect(result.current.canDelete).toBe(false);
      expect(result.current.canActivateDeactivate).toBe(false);
      expect(result.current.canLinkAccount).toBe(false);
      expect(result.current.canExportData).toBe(false);
    });

    it('should not allow club-admin to delete players', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'club-admin-123' },
        userProfile: { role: 'club-admin' },
        userClubRoles: { 'club-1': 'club-admin' },
      });

      const player = {
        id: 'player-1',
        clubId: 'club-1',
        linkedUserId: 'user-1',
      };

      const { result } = renderHook(() => usePlayerPermissions(player));

      expect(result.current.canDelete).toBe(false);
    });
  });

  describe('User Role (GDPR)', () => {
    it('should allow user to export own player data', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'user-123' },
        userProfile: { role: 'user' },
        userClubRoles: {},
      });

      const player = {
        id: 'player-1',
        clubId: 'club-1',
        linkedUserId: 'user-123',
      };

      const { result } = renderHook(() => usePlayerPermissions(player));

      expect(result.current.canExportData).toBe(true);
      expect(result.current.canEdit).toBe(false);
      expect(result.current.canDelete).toBe(false);
      expect(result.current.canViewSensitiveData).toBe(true);
    });

    it('should deny export for other users data', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'user-123' },
        userProfile: { role: 'user' },
        userClubRoles: {},
      });

      const player = {
        id: 'player-1',
        clubId: 'club-1',
        linkedUserId: 'user-456',
      };

      const { result } = renderHook(() => usePlayerPermissions(player));

      expect(result.current.canExportData).toBe(false);
      expect(result.current.canEdit).toBe(false);
      expect(result.current.canDelete).toBe(false);
    });

    it('should not allow user to delete own player data', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'user-123' },
        userProfile: { role: 'user' },
        userClubRoles: {},
      });

      const player = {
        id: 'player-1',
        linkedUserId: 'user-123',
      };

      const { result } = renderHook(() => usePlayerPermissions(player));

      expect(result.current.canDelete).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined player gracefully', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'admin-123' },
        userProfile: { role: 'admin' },
        userClubRoles: {},
      });

      const { result } = renderHook(() => usePlayerPermissions(undefined));

      // Admin has all permissions even without specific player
      expect(result.current.canEdit).toBe(true);
      expect(result.current.canDelete).toBe(true);
      expect(result.current.isAdmin).toBe(true);
    });

    it('should handle null player gracefully', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'admin-123' },
        userProfile: { role: 'admin' },
        userClubRoles: {},
      });

      const { result } = renderHook(() => usePlayerPermissions(null));

      // Admin has all permissions even with null player
      expect(result.current.canEdit).toBe(true);
      expect(result.current.canDelete).toBe(true);
    });

    it('should handle player without clubId', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'club-admin-123' },
        userProfile: { role: 'club-admin' },
        userClubRoles: { 'club-1': 'club-admin' },
      });

      const player = {
        id: 'player-1',
        linkedUserId: 'user-1',
        // No clubId - hook assumes current club context
      };

      const { result } = renderHook(() => usePlayerPermissions(player));

      // Without explicit clubId, hook assumes player belongs to current club (lenient)
      // So club-admin with current club 'club-1' DOES have permissions
      expect(result.current.canEdit).toBe(true);
    });

    it('should handle player without linkedUserId', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'user-123' },
        userProfile: { role: 'user' },
        userClubRoles: {},
      });

      const player = {
        id: 'player-1',
        clubId: 'club-1',
      };

      const { result } = renderHook(() => usePlayerPermissions(player));

      expect(result.current.canExportData).toBe(false);
    });

    it('should handle undefined currentUser', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: undefined,
        userProfile: undefined,
        userClubRoles: {},
      });

      const player = {
        id: 'player-1',
        clubId: 'club-1',
        linkedUserId: 'user-1',
      };

      const { result } = renderHook(() => usePlayerPermissions(player));

      expect(result.current.canEdit).toBe(false);
      expect(result.current.canDelete).toBe(false);
      expect(result.current.canExportData).toBe(false);
    });

    it('should handle unknown role', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'unknown-123' },
        userProfile: { role: 'unknown-role' },
        userClubRoles: {},
      });

      const player = {
        id: 'player-1',
        clubId: 'club-1',
        linkedUserId: 'user-1',
      };

      const { result } = renderHook(() => usePlayerPermissions(player));

      expect(result.current.canEdit).toBe(false);
      expect(result.current.canDelete).toBe(false);
    });
  });

  describe('Permissions Consistency', () => {
    it('should return same object reference if inputs unchanged', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'admin-123' },
        userProfile: { role: 'admin' },
        userClubRoles: {},
      });

      const player = {
        id: 'player-1',
        clubId: 'club-1',
      };

      const { result, rerender } = renderHook(() => usePlayerPermissions(player));
      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });

    it('should expose expected permission keys', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { uid: 'admin-123' },
        userProfile: { role: 'admin' },
        userClubRoles: {},
      });

      const player = {
        id: 'player-1',
        clubId: 'club-1',
      };

      const { result } = renderHook(() => usePlayerPermissions(player));
      const expectedKeys = [
        'canView',
        'canEdit',
        'canDelete',
        'canLinkAccount',
        'canUnlinkAccount',
        'canViewSensitiveData',
        'canExportData',
        'canActivateDeactivate',
        'canManageWallet',
        'canManageCertificates',
        'canManageNotes',
        'isAdmin',
        'isClubAdmin',
        'isReadOnly',
      ];
      expectedKeys.forEach((key) => {
        expect(result.current).toHaveProperty(key);
        expect(typeof result.current[key]).toBe('boolean');
      });
    });
  });
});
