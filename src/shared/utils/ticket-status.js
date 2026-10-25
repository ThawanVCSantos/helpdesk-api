export const TICKET_STATUS = Object.freeze({
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_USER: 'WAITING_USER',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
});

export const VALID_STATUSES = Object.values(TICKET_STATUS);

export const CLOSING_STATUSES = [TICKET_STATUS.RESOLVED, TICKET_STATUS.CLOSED];

export function isClosingStatus(status) {
  return CLOSING_STATUSES.includes(status);
}

export function calculateClosedAt(status, currentClosedAt = null) {
  if (isClosingStatus(status)) {
    return currentClosedAt || new Date();
  }
  return null;
}
