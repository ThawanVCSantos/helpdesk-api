import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { errorHandlerMiddleware } from '../../../../../src/presentation/http/middlewares/error-handler.js';
import { NotFoundError } from '../../../../../src/domain/errors/not-found-error.js';
import { ConflictError } from '../../../../../src/domain/errors/conflict-error.js';
import { UnauthorizedError } from '../../../../../src/domain/errors/unauthorized-error.js';
import { ForbiddenError } from '../../../../../src/domain/errors/forbidden-error.js';
import { z } from 'zod';
import { validateSchema } from '../../../../../src/presentation/http/middlewares/validate-schema.js';

describe('Global Error Handler Middleware', () => {
  it('should handle AppError and subclasses with consistent payload', async () => {
    const app = express();
    app.get('/test-not-found', () => {
      throw new NotFoundError('Item específico não foi encontrado');
    });
    app.get('/test-conflict', () => {
      throw new ConflictError('E-mail duplicado');
    });
    app.get('/test-unauthorized', () => {
      throw new UnauthorizedError('Credenciais inválidas');
    });
    app.get('/test-forbidden', () => {
      throw new ForbiddenError('Acesso restrito');
    });
    app.use(errorHandlerMiddleware);

    const res404 = await request(app).get('/test-not-found');
    expect(res404.status).toBe(404);
    expect(res404.body).toEqual({
      status: 'error',
      code: 'NOT_FOUND',
      message: 'Item específico não foi encontrado',
    });

    const res409 = await request(app).get('/test-conflict');
    expect(res409.status).toBe(409);
    expect(res409.body).toEqual({
      status: 'error',
      code: 'CONFLICT',
      message: 'E-mail duplicado',
    });

    const res401 = await request(app).get('/test-unauthorized');
    expect(res401.status).toBe(401);
    expect(res401.body.code).toBe('UNAUTHORIZED');

    const res403 = await request(app).get('/test-forbidden');
    expect(res403.status).toBe(403);
    expect(res403.body.code).toBe('FORBIDDEN');
  });

  it('should format Zod validation errors consistently with status 422', async () => {
    const app = express();
    app.use(express.json());

    const schema = z.object({
      body: z.object({
        email: z.string().email('E-mail inválido'),
      }),
    });

    app.post('/validate', validateSchema(schema), (req, res) => {
      res.json({ ok: true });
    });
    app.use(errorHandlerMiddleware);

    const res = await request(app).post('/validate').send({ email: 'not-an-email' });

    expect(res.status).toBe(422);
    expect(res.body.status).toBe('error');
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'body.email',
          message: 'E-mail inválido',
        }),
      ])
    );
  });

  it('should format unhandled errors as 500 without leaking sensitive trace to client', async () => {
    const app = express();
    app.get('/unhandled', () => {
      throw new Error('Database connection crashed with secret password');
    });
    app.use(errorHandlerMiddleware);

    const res = await request(app).get('/unhandled');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ocorreu um erro interno no servidor',
    });
  });
});
