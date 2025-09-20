// PRD v1.3, Sec 3: Client-side RBAC Utilities

// Define the roles in a hierarchical order for easy comparison
export const ROLES = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
} as const;

export type UserRole = keyof typeof ROLES;
export type Profile = {
  role: UserRole | null;
  // ... other profile properties
};

/**
 * Checks if a user's role meets a minimum required level.
 * @param userProfile The user's profile object containing their role.
 * @param requiredRole The minimum role required for the action.
 * @returns True if the user has the required permission, false otherwise.
 */
export const hasPermission = (
  userProfile: Profile | null,
  requiredRole: UserRole
): boolean => {
  if (!userProfile || !userProfile.role) {
    return false;
  }
  const userLevel = ROLES[userProfile.role];
  const requiredLevel = ROLES[requiredRole];
  return userLevel >= requiredLevel;
};

/**
 * A simple checker for the 'owner' role.
 * @param userProfile The user's profile object.
 * @returns True if the user is an owner.
 */
export const isOwner = (userProfile: Profile | null): boolean => {
  return userProfile?.role === 'owner';
};

/**
 * A simple checker for the 'admin' role.
 * @param userProfile The user's profile object.
 * @returns True if the user is an admin.
 */
export const isAdmin = (userProfile: Profile | null): boolean => {
  return userProfile?.role === 'admin';
};
