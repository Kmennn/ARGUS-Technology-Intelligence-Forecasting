export type Role = "Analyst" | "Allocator" | "Admin";

const ROLE_HIERARCHY: Record<Role, number> = {
  Analyst: 1,
  Allocator: 2,
  Admin: 3,
};

/**
 * Checks if the user's role meets or exceeds the required role.
 */
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
