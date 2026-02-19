import { errorResponse } from '../utils/response.js';

export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return errorResponse(res, 'Validation failed', 400, errors);
    }

    req.validatedData = result.data;
    next();
  };
};
