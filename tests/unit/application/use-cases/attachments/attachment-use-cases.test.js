import { describe, it, expect, vi } from 'vitest';
import { UploadTicketAttachment } from '../../../../../src/application/use-cases/attachments/upload-ticket-attachment.js';
import { ListTicketAttachments } from '../../../../../src/application/use-cases/attachments/list-ticket-attachments.js';
import { UploadCommentAttachment } from '../../../../../src/application/use-cases/attachments/upload-comment-attachment.js';
import { ListCommentAttachments } from '../../../../../src/application/use-cases/attachments/list-comment-attachments.js';
import { DeleteAttachment } from '../../../../../src/application/use-cases/attachments/delete-attachment.js';
import { BadRequestError } from '../../../../../src/domain/errors/bad-request-error.js';
import { ForbiddenError } from '../../../../../src/domain/errors/forbidden-error.js';
import { NotFoundError } from '../../../../../src/domain/errors/not-found-error.js';
import { Attachment } from '../../../../../src/domain/entities/attachment.js';
import { AttachmentMapper } from '../../../../../src/application/mappers/attachment-mapper.js';

describe('Attachment Use Cases', () => {
  const mockStorageService = {
    upload: vi.fn().mockResolvedValue({
      storageKey: 'cloudinary/test-key-123',
      url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      bytes: 2048,
    }),
    delete: vi.fn().mockResolvedValue({ result: 'ok' }),
    getUrl: vi.fn((key) => `https://res.cloudinary.com/demo/image/upload/${key}`),
  };

  const mockTicketEventsRepository = {
    create: vi.fn().mockResolvedValue({ id: 'event-1' }),
  };

  it('UploadTicketAttachment: should reject upload if ticket is closed', async () => {
    const ticketsRepository = {
      findById: vi.fn().mockResolvedValue({ id: 't1', status: 'CLOSED', requesterId: 'u1' }),
    };

    const useCase = new UploadTicketAttachment({
      ticketsRepository,
      attachmentsRepository: {},
      ticketEventsRepository: mockTicketEventsRepository,
      storageService: mockStorageService,
    });

    await expect(
      useCase.execute({
        ticketId: 't1',
        user: { id: 'u1', roles: ['USER'] },
        file: { buffer: Buffer.from('test'), originalname: 'doc.pdf', mimetype: 'application/pdf', size: 100 },
      })
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('UploadTicketAttachment: should reject when no file or ticket exists', async () => {
    const ticketsRepository = { findById: vi.fn().mockResolvedValue(null) };
    const useCase = new UploadTicketAttachment({
      ticketsRepository,
      attachmentsRepository: {},
      ticketEventsRepository: mockTicketEventsRepository,
      storageService: mockStorageService,
    });

    await expect(
      useCase.execute({ ticketId: 't1', user: { id: 'u1', roles: ['USER'] } })
    ).rejects.toBeInstanceOf(BadRequestError);

    await expect(
      useCase.execute({
        ticketId: 't1',
        user: { id: 'u1', roles: ['USER'] },
        file: { buffer: Buffer.from('test'), originalname: 'doc.pdf', mimetype: 'application/pdf', size: 100 },
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('UploadTicketAttachment: should reject common user when ticket is not theirs', async () => {
    const ticketsRepository = {
      findById: vi.fn().mockResolvedValue({ id: 't1', status: 'OPEN', requesterId: 'other-user' }),
    };

    const useCase = new UploadTicketAttachment({
      ticketsRepository,
      attachmentsRepository: {},
      ticketEventsRepository: mockTicketEventsRepository,
      storageService: mockStorageService,
    });

    await expect(
      useCase.execute({
        ticketId: 't1',
        user: { id: 'u1', roles: ['USER'] },
        file: { buffer: Buffer.from('test'), originalname: 'doc.pdf', mimetype: 'application/pdf', size: 100 },
      })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('UploadTicketAttachment: should upload and register event when valid', async () => {
    const ticketsRepository = {
      findById: vi.fn().mockResolvedValue({ id: 't1', status: 'OPEN', requesterId: 'u1' }),
    };
    const attachmentsRepository = {
      createForTicket: vi.fn().mockResolvedValue({
        id: 'att-1',
        storageKey: 'cloudinary/test-key-123',
        fileName: 'doc.pdf',
        mimeType: 'application/pdf',
        size: BigInt(2048),
        createdAt: new Date(),
      }),
    };

    const useCase = new UploadTicketAttachment({
      ticketsRepository,
      attachmentsRepository,
      ticketEventsRepository: mockTicketEventsRepository,
      storageService: mockStorageService,
    });

    const result = await useCase.execute({
      ticketId: 't1',
      user: { id: 'u1', roles: ['USER'] },
      file: { buffer: Buffer.from('test'), originalname: 'doc.pdf', mimetype: 'application/pdf', size: 100 },
    });

    expect(result.id).toBe('att-1');
    expect(result.url).toContain('cloudinary');
    expect(mockTicketEventsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ATTACHMENT_ADDED', ticketId: 't1' })
    );
  });

  it('ListTicketAttachments: should allow owner to list attachments', async () => {
    const ticketsRepository = {
      findById: vi.fn().mockResolvedValue({ id: 't1', status: 'OPEN', requesterId: 'u1' }),
    };
    const attachmentsRepository = {
      findByTicketId: vi.fn().mockResolvedValue([
        {
          id: 'att-1',
          storageKey: 'key-1',
          fileName: 'screen.png',
          mimeType: 'image/png',
          size: BigInt(1024),
          createdAt: new Date(),
        },
      ]),
    };

    const useCase = new ListTicketAttachments({
      ticketsRepository,
      attachmentsRepository,
      storageService: mockStorageService,
    });

    const list = await useCase.execute({ ticketId: 't1', user: { id: 'u1', roles: ['USER'] } });
    expect(list).toHaveLength(1);
    expect(list[0].fileName).toBe('screen.png');
  });

  it('ListTicketAttachments: should reject missing tickets and unauthorized users', async () => {
    const ticketsRepository = { findById: vi.fn().mockResolvedValue(null) };
    const useCase = new ListTicketAttachments({
      ticketsRepository,
      attachmentsRepository: {},
      storageService: mockStorageService,
    });

    await expect(
      useCase.execute({ ticketId: 't1', user: { id: 'u1', roles: ['USER'] } })
    ).rejects.toBeInstanceOf(NotFoundError);

    ticketsRepository.findById.mockResolvedValue({
      id: 't1',
      status: 'OPEN',
      requesterId: 'other-user',
    });
    await expect(
      useCase.execute({ ticketId: 't1', user: { id: 'u1', roles: ['USER'] } })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('ListCommentAttachments: should validate comment, ticket and ownership', async () => {
    const commentsRepository = { findById: vi.fn().mockResolvedValue(null) };
    const ticketsRepository = { findById: vi.fn() };
    const useCase = new ListCommentAttachments({
      ticketsRepository,
      commentsRepository,
      attachmentsRepository: {},
      storageService: mockStorageService,
    });

    await expect(
      useCase.execute({ commentId: 'c1', user: { id: 'u1', roles: ['USER'] } })
    ).rejects.toBeInstanceOf(NotFoundError);

    commentsRepository.findById.mockResolvedValue({ id: 'c1', ticketId: 't1' });
    ticketsRepository.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ commentId: 'c1', user: { id: 'u1', roles: ['USER'] } })
    ).rejects.toBeInstanceOf(NotFoundError);

    ticketsRepository.findById.mockResolvedValue({ id: 't1', requesterId: 'other-user' });
    await expect(
      useCase.execute({ commentId: 'c1', user: { id: 'u1', roles: ['USER'] } })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('ListCommentAttachments: should list attachments for an agent', async () => {
    const useCase = new ListCommentAttachments({
      ticketsRepository: { findById: vi.fn().mockResolvedValue({ id: 't1', requesterId: 'u1' }) },
      commentsRepository: { findById: vi.fn().mockResolvedValue({ ticketId: 't1' }) },
      attachmentsRepository: {
        findByCommentId: vi.fn().mockResolvedValue([
          { id: 'att-1', storageKey: 'key-1', fileName: 'note.txt', mimeType: 'text/plain', size: 5 },
        ]),
      },
      storageService: mockStorageService,
    });

    const result = await useCase.execute({
      commentId: 'c1',
      user: { id: 'agent-1', roles: ['AGENT'] },
    });
    expect(result[0].fileName).toBe('note.txt');
  });

  it('UploadCommentAttachment: should validate file, comment, ticket and permissions', async () => {
    const commentsRepository = { findById: vi.fn().mockResolvedValue(null) };
    const ticketsRepository = { findById: vi.fn() };
    const useCase = new UploadCommentAttachment({
      ticketsRepository,
      commentsRepository,
      attachmentsRepository: {},
      ticketEventsRepository: mockTicketEventsRepository,
      storageService: mockStorageService,
    });

    await expect(
      useCase.execute({ commentId: 'c1', user: { id: 'u1', roles: ['USER'] } })
    ).rejects.toBeInstanceOf(BadRequestError);

    const file = {
      buffer: Buffer.from('test'),
      originalname: 'doc.pdf',
      mimetype: 'application/pdf',
      size: 100,
    };
    await expect(
      useCase.execute({ commentId: 'c1', user: { id: 'u1', roles: ['USER'] }, file })
    ).rejects.toBeInstanceOf(NotFoundError);

    commentsRepository.findById.mockResolvedValue({ ticketId: 't1', userId: 'u1' });
    ticketsRepository.findById.mockResolvedValue(null);
    await expect(
      useCase.execute({ commentId: 'c1', user: { id: 'u1', roles: ['USER'] }, file })
    ).rejects.toBeInstanceOf(NotFoundError);

    ticketsRepository.findById.mockResolvedValue({ id: 't1', status: 'CLOSED', requesterId: 'u1' });
    await expect(
      useCase.execute({ commentId: 'c1', user: { id: 'u1', roles: ['USER'] }, file })
    ).rejects.toBeInstanceOf(BadRequestError);

    ticketsRepository.findById.mockResolvedValue({ id: 't1', status: 'OPEN', requesterId: 'other' });
    await expect(
      useCase.execute({ commentId: 'c1', user: { id: 'u1', roles: ['USER'] }, file })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('UploadCommentAttachment: should upload and register a comment attachment', async () => {
    const attachmentsRepository = {
      createForComment: vi.fn().mockResolvedValue({
        id: 'att-1',
        storageKey: 'key-1',
        fileName: 'doc.pdf',
        mimeType: 'application/pdf',
        size: 2048,
      }),
    };
    const ticketEventsRepository = { create: vi.fn().mockResolvedValue({ id: 'event-1' }) };
    const useCase = new UploadCommentAttachment({
      commentsRepository: { findById: vi.fn().mockResolvedValue({ ticketId: 't1', userId: 'u1' }) },
      ticketsRepository: { findById: vi.fn().mockResolvedValue({ id: 't1', status: 'OPEN', requesterId: 'u1' }) },
      attachmentsRepository,
      ticketEventsRepository,
      storageService: mockStorageService,
    });

    const result = await useCase.execute({
      commentId: 'c1',
      user: { id: 'u1', roles: ['USER'] },
      file: { buffer: Buffer.from('test'), originalname: 'doc.pdf', mimetype: 'application/pdf', size: 100 },
    });
    expect(result.id).toBe('att-1');
    expect(attachmentsRepository.createForComment).toHaveBeenCalledWith(
      expect.objectContaining({ commentId: 'c1', size: 2048 })
    );
    expect(ticketEventsRepository.create).toHaveBeenCalled();
  });

  it('DeleteAttachment: should delete from storage and repository', async () => {
    const attachmentsRepository = {
      findById: vi.fn().mockResolvedValue({
        id: 'att-1',
        storageKey: 'key-1',
        tickets: [{ ticketId: 't1' }],
      }),
      delete: vi.fn().mockResolvedValue({ id: 'att-1' }),
    };
    const ticketsRepository = {
      findById: vi.fn().mockResolvedValue({ id: 't1', status: 'OPEN', requesterId: 'u1' }),
    };

    const useCase = new DeleteAttachment({
      attachmentsRepository,
      ticketsRepository,
      storageService: mockStorageService,
    });

    const res = await useCase.execute({ attachmentId: 'att-1', user: { id: 'u1', roles: ['USER'] } });
    expect(res.success).toBe(true);
    expect(mockStorageService.delete).toHaveBeenCalledWith('key-1');
    expect(attachmentsRepository.delete).toHaveBeenCalledWith('att-1');
  });

  it('DeleteAttachment: should reject missing, closed, and unauthorized attachments', async () => {
    const attachmentsRepository = { findById: vi.fn().mockResolvedValue(null) };
    const useCase = new DeleteAttachment({
      attachmentsRepository,
      ticketsRepository: { findById: vi.fn() },
      storageService: mockStorageService,
    });
    await expect(
      useCase.execute({ attachmentId: 'att-1', user: { id: 'u1', roles: ['USER'] } })
    ).rejects.toBeInstanceOf(NotFoundError);

    attachmentsRepository.findById.mockResolvedValue({
      storageKey: 'key-1',
      tickets: [{ ticketId: 't1' }],
    });
    const ticketsRepository = { findById: vi.fn().mockResolvedValue({ status: 'CLOSED' }) };
    const closedUseCase = new DeleteAttachment({
      attachmentsRepository,
      ticketsRepository,
      storageService: mockStorageService,
    });
    await expect(
      closedUseCase.execute({ attachmentId: 'att-1', user: { id: 'u1', roles: ['USER'] } })
    ).rejects.toBeInstanceOf(BadRequestError);

    ticketsRepository.findById.mockResolvedValue({ status: 'OPEN', requesterId: 'other' });
    await expect(
      closedUseCase.execute({ attachmentId: 'att-1', user: { id: 'u1', roles: ['USER'] } })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('DeleteAttachment: should reject comment attachments owned by another user and tolerate storage errors', async () => {
    const attachmentsRepository = {
      findById: vi.fn().mockResolvedValue({
        storageKey: 'key-1',
        comments: [{ comment: { userId: 'other' } }],
        delete: vi.fn(),
      }),
    };
    const useCase = new DeleteAttachment({
      attachmentsRepository,
      ticketsRepository: { findById: vi.fn() },
      storageService: mockStorageService,
    });
    await expect(
      useCase.execute({ attachmentId: 'att-1', user: { id: 'u1', roles: ['USER'] } })
    ).rejects.toBeInstanceOf(ForbiddenError);

    const deleteRepository = {
      findById: vi.fn().mockResolvedValue({ storageKey: 'key-1', tickets: [], comments: [] }),
      delete: vi.fn().mockResolvedValue({ id: 'att-1' }),
    };
    const storageService = { delete: vi.fn().mockRejectedValue(new Error('missing')) };
    const tolerantUseCase = new DeleteAttachment({
      attachmentsRepository: deleteRepository,
      ticketsRepository: { findById: vi.fn() },
      storageService,
    });
    await expect(
      tolerantUseCase.execute({ attachmentId: 'att-1', user: { id: 'admin', roles: ['ADMIN'] } })
    ).resolves.toEqual({ success: true });
    expect(deleteRepository.delete).toHaveBeenCalledWith('att-1');
  });

  it('Attachment and mapper: should handle defaults, nulls, and URL fallbacks', () => {
    expect(AttachmentMapper.toDomain(null)).toBeNull();
    expect(AttachmentMapper.toDTO(null)).toBeNull();

    const attachment = new Attachment({
      id: 'att-1',
      storageKey: 'key-1',
      fileName: 'file.txt',
      mimeType: 'text/plain',
      size: 12,
    });
    expect(attachment.size).toBe(12n);
    expect(AttachmentMapper.toDTO(attachment)).toMatchObject({
      id: 'att-1',
      size: 12,
      url: null,
    });
    expect(
      AttachmentMapper.toDTO(
        AttachmentMapper.toDomain({
          id: 'att-2',
          storageKey: 'key-2',
          fileName: 'file.txt',
          mimeType: 'text/plain',
          size: 4n,
          url: 'https://example.test/file',
        })
      ).url
    ).toBe('https://example.test/file');
  });
});
