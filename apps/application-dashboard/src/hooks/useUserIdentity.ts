import { useAppSelector } from 'hooks/toolkit';
import { UserRoleIdType } from 'types/api/auth.types';
import { PERMISSION_ROLES } from 'utils/accessPermission/accessPermission.types';

/**
 * Hook to get current user information and privilege checks.
 * This replaces direct store access utilities to avoid bundling the entire store
 * (and its dependencies like @zamp-platform/chat) into components.
 *
 * @returns {Object} Object containing user data and privilege checks
 * @returns {string} userRole - The user's role name (e.g., 'admin', 'member', 'system_admin')
 * @returns {string} userEmail - The user's email address
 * @returns {string} userId - The user's unique ID
 * @returns {boolean} isMember - Whether the user has 'member' role
 * @returns {boolean} isAdmin - Whether the user has 'admin' role
 * @returns {boolean} isSystemAdmin - Whether the user has 'system_admin' role
 * @returns {function} isCurrentUserEmail - (email: string) => boolean - Checks if the given email matches the current user
 * @returns {string} organizationId - The user's current organization ID
 * @returns {boolean} isLoading - Whether user data is still being loaded
 */
export const useUserIdentity = () => {
  const userRole = useAppSelector(
    (state) => state?.user?.roles?.find((role) => role.id === UserRoleIdType.USER)?.name ?? '',
  );
  const userEmail = useAppSelector((state) => state?.user?.user?.user_email ?? '');
  const userId = useAppSelector((state) => state?.user?.user?.user_id ?? '');
  const organizationId = useAppSelector((state) => state?.user?.user?.orgs?.[0]?.organization_id ?? '');

  return {
    userRole,
    userEmail,
    userId,
    isMember: userRole === PERMISSION_ROLES.MEMBER,
    isAdmin: userRole === PERMISSION_ROLES.ADMIN,
    isSystemAdmin: userRole === PERMISSION_ROLES.SYSTEM_ADMIN,
    isCurrentUserEmail: (email: string) => (email === '' ? false : userEmail === email),
    organizationId,
  };
};
