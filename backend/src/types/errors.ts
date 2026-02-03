/**
 * Error Type Definitions and Classes
 */

/**
 * Error codes used throughout the application
 */
export enum ErrorCode {
  // Authentication errors (4000-4099)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Validation errors (4100-4199)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resource errors (4200-4299)
  NOT_FOUND = 'NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',

  // Server errors (5000-5099)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  SERVICE_ERROR = 'SERVICE_ERROR',
}

/**
 * Application error
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  public readonly fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string>) {
    super(message, ErrorCode.VALIDATION_ERROR, 400);
    this.name = 'ValidationError';
    this.fields = fields;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.NOT_FOUND) {
    super(message, code, 404);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Unauthorized error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, ErrorCode.UNAUTHORIZED, 401);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Forbidden error
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, ErrorCode.FORBIDDEN, 403);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
