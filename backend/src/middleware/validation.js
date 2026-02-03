/**
 * Validation Middleware
 *
 * Input validation using Joi schemas.
 * Validates request body, params, and query.
 *
 * @module src/middleware/validation
 */

import Joi from 'joi';

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
          return res.status(400).json({
            error: 'VALIDATION_ERROR',
            details: error.details.map((d) => ({
              field: d.path.join('.'),
              message: d.message,
            })),
          });
        }
        req.body = value;
      }

      // Validate params
      if (schemas.params) {
        const { error, value } = schemas.params.validate(req.params);
        if (error) {
          return res.status(400).json({
            error: 'VALIDATION_ERROR',
            details: error.details.map((d) => ({
              field: d.path.join('.'),
              message: d.message,
            })),
          });
        }
        req.params = value;
      }

      // Validate query
      if (schemas.query) {
        const { error, value } = schemas.query.validate(req.query);
        if (error) {
          return res.status(400).json({
            error: 'VALIDATION_ERROR',
            details: error.details.map((d) => ({
              field: d.path.join('.'),
              message: d.message,
            })),
          });
        }
        req.query = value;
      }

      next();
    } catch (err) {
      res.status(500).json({
        error: 'VALIDATION_ERROR',
        message: 'Failed to validate input',
      });
    }
  };
}
