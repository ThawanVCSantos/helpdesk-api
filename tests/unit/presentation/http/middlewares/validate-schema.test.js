import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { validateSchema } from '../../../../../src/presentation/http/middlewares/validate-schema.js';

describe('validateSchema', () => {
  it('stores parsed values separately from readonly Express properties', async () => {
    const req = {
      body: {},
      query: { page: '2', obsolete: 'value' },
      params: {},
    };
    const next = vi.fn();
    const schema = z.object({
      query: z.object({
        page: z.coerce.number().default(1),
      }),
    });

    await validateSchema(schema)(req, {}, next);

    expect(req.validated.query).toEqual({ page: 2 });
    expect(next).toHaveBeenCalledWith();
  });
});
