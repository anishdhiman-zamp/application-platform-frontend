import { useAppSelector } from 'hooks/toolkit';
import { UserRoleIdType } from 'types/api/auth.types';
import { PERMISSION_ROLES } from 'utils/accessPermission/accessPermission.types';

/**
 * Hook to get current user information and privilege checks.
 * This replaces direct store access utilities to avoid bundling the entire store
 * (and its dependencies like @zamp-platform/chat) into components.
 *
 * @returns Object containing user data and privilege checks
 */
export const useCurrentUser = () => {
  const userRole = useAppSelector(
    (state) => state?.user?.roles?.find((role) => role.id === UserRoleIdType.USER)?.name ?? '',
  );
  const userEmail = useAppSelector((state) => state?.user?.user?.user_email ?? '');
  const userId = useAppSelector((state) => state?.user?.user?.user_id ?? '');

  return {
    userRole,
    userEmail,
    userId,
    isMember: userRole === PERMISSION_ROLES.MEMBER,
    isAdmin: userRole === PERMISSION_ROLES.ADMIN,
    isSystemAdmin: userRole === PERMISSION_ROLES.SYSTEM_ADMIN,
    isCurrentUser: (email: string) => (email === '' ? false : userEmail === email),
  };
};
