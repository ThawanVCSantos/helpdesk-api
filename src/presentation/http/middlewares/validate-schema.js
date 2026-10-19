export function validateSchema(schema) {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed.body) req.body = parsed.body;
      if (parsed.params) req.params = parsed.params;
      req.validated = parsed;

      return next();
    } catch (error) {
      return next(error);
    }
  };
}
