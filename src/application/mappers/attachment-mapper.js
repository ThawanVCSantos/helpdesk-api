import { Attachment } from '../../domain/entities/attachment.js';

export class AttachmentMapper {
  static toDomain(raw) {
    if (!raw) return null;

    return new Attachment({
      id: raw.id,
      storageKey: raw.storageKey,
      fileName: raw.fileName,
      mimeType: raw.mimeType,
      size: raw.size,
      createdAt: raw.createdAt,
      url: raw.url || null,
    });
  }

  static toDTO(domain, options = {}) {
    if (!domain) return null;

    const url = domain.url || options.storageService?.getUrl(domain.storageKey) || null;

    return {
      id: domain.id,
      fileName: domain.fileName,
      mimeType: domain.mimeType,
      size: typeof domain.size === 'bigint' ? Number(domain.size) : domain.size,
      url,
      createdAt: domain.createdAt,
    };
  }
}
