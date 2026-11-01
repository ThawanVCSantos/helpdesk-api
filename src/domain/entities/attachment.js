export class Attachment {
  constructor({
    id,
    storageKey,
    fileName,
    mimeType,
    size,
    createdAt = new Date(),
    url = null,
  }) {
    this.id = id;
    this.storageKey = storageKey;
    this.fileName = fileName;
    this.mimeType = mimeType;
    this.size = typeof size === 'bigint' ? size : BigInt(size || 0);
    this.createdAt = createdAt;
    this.url = url;
  }
}
