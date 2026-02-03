# 🚨 API Error Reference

**Version:** 1.0.0  
**Last Updated:** 2026-02-03  

---

## Error Response Format

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Human readable error message",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

---

## Error Codes

### 400 - Bad Request

#### INVALID_EMAIL
```json
{
  "statusCode": 400,
  "code": "INVALID_EMAIL",
  "message": "Invalid email format"
}
```
**Solution:** Provide a valid email address (e.g., user@example.com)

#### INVALID_PASSWORD
```json
{
  "statusCode": 400,
  "code": "INVALID_PASSWORD",
  "message": "Password must contain uppercase, lowercase, number and special character"
}
```
**Solution:** Use a strong password with at least 8 characters

#### INVALID_USERNAME
```json
{
  "statusCode": 400,
  "code": "INVALID_USERNAME",
  "message": "Username must be 3-30 characters"
}
```
**Solution:** Choose a username between 3 and 30 characters

#### MISSING_REQUIRED_FIELD
```json
{
  "statusCode": 400,
  "code": "MISSING_REQUIRED_FIELD",
  "message": "Field 'title' is required",
  "field": "title"
}
```
**Solution:** Provide all required fields

#### INVALID_JSON
```json
{
  "statusCode": 400,
  "code": "INVALID_JSON",
  "message": "Invalid JSON in request body"
}
```
**Solution:** Ensure request body is valid JSON

#### INVALID_PAGINATION
```json
{
  "statusCode": 400,
  "code": "INVALID_PAGINATION",
  "message": "Page must be >= 1"
}
```
**Solution:** Use valid pagination parameters (page >= 1, pageSize <= 100)

---

### 401 - Unauthorized

#### NO_TOKEN
```json
{
  "statusCode": 401,
  "code": "NO_TOKEN",
  "message": "No authentication token provided"
}
```
**Solution:** Include Authorization header: `Authorization: Bearer <token>`

#### INVALID_TOKEN
```json
{
  "statusCode": 401,
  "code": "INVALID_TOKEN",
  "message": "Invalid or malformed authentication token"
}
```
**Solution:** Provide a valid JWT token

#### TOKEN_EXPIRED
```json
{
  "statusCode": 401,
  "code": "TOKEN_EXPIRED",
  "message": "Authentication token has expired"
}
```
**Solution:** Use refresh token to get a new access token

#### INVALID_CREDENTIALS
```json
{
  "statusCode": 401,
  "code": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```
**Solution:** Check your email and password

#### USER_INACTIVE
```json
{
  "statusCode": 401,
  "code": "USER_INACTIVE",
  "message": "User account is inactive"
}
```
**Solution:** Contact support to activate your account

#### INVALID_2FA_TOKEN
```json
{
  "statusCode": 401,
  "code": "INVALID_2FA_TOKEN",
  "message": "Invalid 2FA token"
}
```
**Solution:** Check your authenticator app for the correct code

---

### 403 - Forbidden

#### INSUFFICIENT_PERMISSIONS
```json
{
  "statusCode": 403,
  "code": "INSUFFICIENT_PERMISSIONS",
  "message": "You don't have permission to access this resource"
}
```
**Solution:** Admin access required for this endpoint

#### RESOURCE_NOT_OWNED
```json
{
  "statusCode": 403,
  "code": "RESOURCE_NOT_OWNED",
  "message": "You cannot modify this resource"
}
```
**Solution:** You can only modify your own resources

#### ADMIN_ONLY
```json
{
  "statusCode": 403,
  "code": "ADMIN_ONLY",
  "message": "This endpoint is only available to administrators"
}
```
**Solution:** Admin access required

---

### 409 - Conflict

#### EMAIL_EXISTS
```json
{
  "statusCode": 409,
  "code": "EMAIL_EXISTS",
  "message": "Email already registered"
}
```
**Solution:** Use a different email or login instead

#### USERNAME_EXISTS
```json
{
  "statusCode": 409,
  "code": "USERNAME_EXISTS",
  "message": "Username already taken"
}
```
**Solution:** Choose a different username

---

### 404 - Not Found

#### RESOURCE_NOT_FOUND
```json
{
  "statusCode": 404,
  "code": "RESOURCE_NOT_FOUND",
  "message": "Game not found"
}
```
**Solution:** Verify the resource ID is correct

#### USER_NOT_FOUND
```json
{
  "statusCode": 404,
  "code": "USER_NOT_FOUND",
  "message": "User not found"
}
```
**Solution:** Check the user ID

#### ENDPOINT_NOT_FOUND
```json
{
  "statusCode": 404,
  "code": "ENDPOINT_NOT_FOUND",
  "message": "Endpoint not found"
}
```
**Solution:** Check the API endpoint URL

---

### 429 - Too Many Requests

#### RATE_LIMIT_EXCEEDED
```json
{
  "statusCode": 429,
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```
**Solution:** Wait 60 seconds before retrying

#### AUTH_RATE_LIMIT_EXCEEDED
```json
{
  "statusCode": 429,
  "code": "AUTH_RATE_LIMIT_EXCEEDED",
  "message": "Too many authentication attempts. Please try again later.",
  "retryAfter": 300
}
```
**Solution:** Wait 5 minutes before retrying login

---

### 500 - Internal Server Error

#### INTERNAL_SERVER_ERROR
```json
{
  "statusCode": 500,
  "code": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred"
}
```
**Solution:** Try again later or contact support

#### DATABASE_ERROR
```json
{
  "statusCode": 500,
  "code": "DATABASE_ERROR",
  "message": "Database operation failed"
}
```
**Solution:** Try again later

#### CACHE_ERROR
```json
{
  "statusCode": 500,
  "code": "CACHE_ERROR",
  "message": "Cache operation failed"
}
```
**Solution:** Try again later

---

## Common Error Scenarios

### Scenario 1: Login Fails
```
1. Check credentials are correct
2. Verify account is active
3. Check for rate limiting (too many attempts)
4. If 2FA enabled, verify code
5. Try password reset if forgotten
```

### Scenario 2: Game Creation Fails
```
1. Verify all required fields provided
2. Check field formats (price should be number)
3. Ensure not exceeding rate limits
4. Check authentication token is valid
5. Verify database connection
```

### Scenario 3: Token Expired
```
1. Refresh token using refresh endpoint
2. Login again to get new token
3. Check system time synchronization
4. Verify token in Authorization header
```

---

## Error Handling Best Practices

### Frontend
```javascript
// Display user-friendly error message
if (error.response?.status === 401) {
  // Redirect to login
  redirectToLogin();
} else if (error.response?.status === 429) {
  // Show retry message
  showRetryMessage(error.response.data.retryAfter);
} else {
  // Show generic error
  showErrorNotification(error.response?.data?.message);
}
```

### Retry Logic
```javascript
// Exponential backoff
const delays = [100, 200, 400, 800, 1600];
for (let i = 0; i < delays.length; i++) {
  try {
    return await makeRequest();
  } catch (error) {
    if (error.response?.status === 429 && i < delays.length - 1) {
      await sleep(delays[i]);
    } else {
      throw error;
    }
  }
}
```

---

**For support, check the documentation or contact support team.**
