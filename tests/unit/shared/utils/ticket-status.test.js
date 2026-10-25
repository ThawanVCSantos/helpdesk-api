import { describe, expect, it } from 'vitest';
import {
  TICKET_STATUS,
  VALID_STATUSES,
  CLOSING_STATUSES,
  isClosingStatus,
  calculateClosedAt,
} from '../../../../src/shared/utils/ticket-status.js';

describe('Ticket Status helper (shared/utils/ticket-status.js)', () => {
  it('should list all valid statuses and closing statuses', () => {
    expect(VALID_STATUSES).toEqual(['OPEN', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED']);
    expect(CLOSING_STATUSES).toEqual([TICKET_STATUS.RESOLVED, TICKET_STATUS.CLOSED]);
  });

  it('should identify closing statuses correctly', () => {
    expect(isClosingStatus(TICKET_STATUS.RESOLVED)).toBe(true);
    expect(isClosingStatus(TICKET_STATUS.CLOSED)).toBe(true);
    expect(isClosingStatus(TICKET_STATUS.OPEN)).toBe(false);
    expect(isClosingStatus(TICKET_STATUS.IN_PROGRESS)).toBe(false);
    expect(isClosingStatus(TICKET_STATUS.WAITING_USER)).toBe(false);
  });

  it('should return new Date when transitioning to closing status and currentClosedAt is null', () => {
    const closedAt = calculateClosedAt('RESOLVED', null);
    expect(closedAt).toBeInstanceOf(Date);
  });

  it('should preserve existing closedAt when already set and staying in closing status', () => {
    const existingDate = new Date('2026-01-01T10:00:00.000Z');
    const closedAt = calculateClosedAt('CLOSED', existingDate);
    expect(closedAt).toBe(existingDate);
  });

  it('should reset closedAt to null when reopening or in progress', () => {
    const existingDate = new Date();
    expect(calculateClosedAt('OPEN', existingDate)).toBeNull();
    expect(calculateClosedAt('IN_PROGRESS', existingDate)).toBeNull();
    expect(calculateClosedAt('WAITING_USER', existingDate)).toBeNull();
  });
});
