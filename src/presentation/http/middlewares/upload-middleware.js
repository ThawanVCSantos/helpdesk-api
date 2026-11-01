import multer from 'multer';
import { BadRequestError } from '../../../domain/errors/bad-request-error.js';

const storage = multer.memoryStorage();

const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB) || 10;
const MAX_FILE_SIZE = maxFileSizeMb * 1024 * 1024;

export const uploadAttachmentMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (!file) {
      return cb(new BadRequestError('Nenhum arquivo enviado'));
    }
    cb(null, true);
  },
});
