import type { UserLevel } from "@/lib/constants";
import { USER_LEVEL_PERMISSIONS, USER_LEVEL_HIERARCHY } from "@/lib/constants";

export interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  user_level: UserLevel;
  is_active: boolean;
  force_password_change: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User, permission: string): boolean {
  if (!user || !user.is_active) {
    return false;
  }

  const userPermissions = USER_LEVEL_PERMISSIONS[user.user_level] || [];
  return userPermissions.includes(permission);
}

/**
 * Check if user can manage other users
 */
export function canManageUsers(user: User): boolean {
  return hasPermission(user, "manage_users");
}

/**
 * Check if user can manage system settings
 */
export function canManageSystem(user: User): boolean {
  return hasPermission(user, "manage_system");
}

/**
 * Check if user can view all data
 */
export function canViewAllData(user: User): boolean {
  return hasPermission(user, "view_all_data");
}

/**
 * Check if user can manage establishments
 */
export function canManageEstablishments(user: User): boolean {
  return hasPermission(user, "manage_establishments");
}

/**
 * Check if user can generate reports
 */
export function canGenerateReports(user: User): boolean {
  return (
    hasPermission(user, "generate_reports") ||
    hasPermission(user, "generate_legal_reports") ||
    hasPermission(user, "generate_division_reports") ||
    hasPermission(user, "generate_section_reports") ||
    hasPermission(user, "generate_unit_reports")
  );
}

/**
 * Check if user can manage queue
 */
export function canManageQueue(user: User): boolean {
  return hasPermission(user, "manage_queue");
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User): boolean {
  return user.user_level === "admin";
}

/**
 * Check if user has higher or equal level than target level
 */
export function hasHigherOrEqualLevel(
  user: User,
  targetLevel: UserLevel
): boolean {
  const userHierarchy = USER_LEVEL_HIERARCHY[user.user_level];
  const targetHierarchy = USER_LEVEL_HIERARCHY[targetLevel];

  return userHierarchy <= targetHierarchy;
}

/**
 * Get user's accessible user levels (levels they can manage)
 */
export function getAccessibleUserLevels(user: User): UserLevel[] {
  if (!user || !user.is_active) {
    return [];
  }

  // Admin can manage all levels except admin
  if (isAdmin(user)) {
    return Object.keys(USER_LEVEL_HIERARCHY).filter(
      (level) => level !== "admin"
    ) as UserLevel[];
  }

  // Other users can only manage levels below them
  const userHierarchy = USER_LEVEL_HIERARCHY[user.user_level];
  return Object.entries(USER_LEVEL_HIERARCHY)
    .filter(([level, hierarchy]) => hierarchy > userHierarchy)
    .map(([level]) => level as UserLevel);
}

/**
 * Check if user can edit another user
 */
export function canEditUser(currentUser: User, targetUser: User): boolean {
  if (!canManageUsers(currentUser)) {
    return false;
  }

  // Admin can edit all non-admin users
  if (isAdmin(currentUser) && !isAdmin(targetUser)) {
    return true;
  }

  // Users can only edit users with lower hierarchy levels
  return (
    hasHigherOrEqualLevel(currentUser, targetUser.user_level) &&
    currentUser.id !== targetUser.id
  );
}

/**
 * Get permissions for a user level
 */
export function getPermissionsForLevel(level: UserLevel): string[] {
  return USER_LEVEL_PERMISSIONS[level] || [];
}
