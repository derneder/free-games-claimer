/**
 * Response Formatting Utilities
 *
 * Helper functions for consistent API response formatting.
 *
 * @module src/utils/formatters
 */

/**
 * Format success response
 *
 * @param {*} data - Response data
 * @param {string} message - Success message (optional)
 * @returns {Object} Formatted response
 */
export function formatSuccess(data, message = null) {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

/**
 * Format error response
 *
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} details - Additional details (optional)
 * @returns {Object} Formatted response
 */
export function formatError(code, message, details = null) {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
}

/**
 * Format paginated response
 *
 * @param {Array} data - Response data
 * @param {number} page - Current page
 * @param {number} pageSize - Items per page
 * @param {number} total - Total items
 * @returns {Object} Formatted paginated response
 */
export function formatPaginated(data, page, pageSize, total) {
  const totalPages = Math.ceil(total / pageSize);
  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Format user response (hide sensitive fields)
 *
 * @param {Object} user - User object
 * @returns {Object} Formatted user object
 */
export function formatUser(user) {
  const { password, refreshToken, ...rest } = user;
  return rest;
}

/**
 * Format game response
 *
 * @param {Object} game - Game object
 * @returns {Object} Formatted game object
 */
export function formatGame(game) {
  return {
    id: game.id,
    title: game.title,
    description: game.description,
    price: game.price,
    image: game.image,
    platforms: game.platforms,
    sources: game.sources,
    claimedAt: game.claimedAt,
    expiresAt: game.expiresAt,
  };
}
