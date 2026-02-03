/**
 * Validation Middleware
 *
 * Input validation using Joi schemas.
 * Validates request body, params, and query.
 *
 * @module src/middleware/validation
 */

/**
 * Create validation middleware
 *
 * @param {Object} schemas - Object containing 'body', 'params', 'query' schemas
 * @returns {Function} Express middleware
 */
export function validate(schemas) {
  return async (req, res, next) => {
    try {
      // Validate body
      if (schemas.body) {
        const { error, value } = schemas.body.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          const errorMessage = error.details.map((d) => d.message).join(', ');
          return res.status(400).json({
            error: errorMessage,
          });
        }
        req.body = value;
      }

      // Validate params
      if (schemas.params) {
        const { error, value } = schemas.params.validate(req.params);
        if (error) {
          const errorMessage = error.details.map((d) => d.message).join(', ');
          return res.status(400).json({
            error: errorMessage,
          });
        }
        req.params = value;
      }

      // Validate query
      if (schemas.query) {
        const { error, value } = schemas.query.validate(req.query);
        if (error) {
          const errorMessage = error.details.map((d) => d.message).join(', ');
          return res.status(400).json({
            error: errorMessage,
          });
        }
        req.query = value;
      }

      next();
    } catch (err) {
      res.status(500).json({
        error: 'Failed to validate input',
      });
    }
  };
}
