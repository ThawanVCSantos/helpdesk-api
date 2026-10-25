export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  AGENT: 'AGENT',
  USER: 'USER',
});

export function hasRole(roles = [], role) {
  return Array.isArray(roles) && roles.includes(role);
}

export function hasAnyRole(roles = [], targetRoles = []) {
  if (!Array.isArray(roles)) return false;
  return targetRoles.some((target) => roles.includes(target));
}

export function canHandleTickets(roles = []) {
  return hasAnyRole(roles, [ROLES.AGENT, ROLES.ADMIN]);
}

export function isUserOnly(roles = []) {
  return hasRole(roles, ROLES.USER) && !canHandleTickets(roles);
}
