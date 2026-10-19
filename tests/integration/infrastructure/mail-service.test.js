import { describe, expect, it, vi } from 'vitest';
import { MailService } from '../../../src/infrastructure/email/mail-service.js';

describe('MailService', () => {
  it('compiles a template and sends it through the transporter', async () => {
    const service = new MailService();
    service.transporter = { sendMail: vi.fn().mockResolvedValue({ messageId: 'message-id' }) };

    const result = await service.sendMail({
      to: 'user@example.com',
      subject: 'Welcome',
      template: 'welcome-user',
      variables: { name: 'Maria', token: 'abc', expiresInMinutes: 15 },
    });

    expect(result.messageId).toBe('message-id');
    expect(service.transporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'user@example.com',
      subject: 'Welcome',
      html: expect.stringContaining('Maria'),
    }));
  });
});
