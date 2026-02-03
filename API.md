# 📋 API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a Bearer token:

```
Authorization: Bearer <your_token>
```

## Response Format

```json
{
  "message": "Success message",
  "data": {},
  "error": "Error message (if applicable)"
}
```

## Auth Endpoints

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "securepassword",
  "confirmPassword": "securepassword"
}

Response 201:
{
  "message": "Registration successful",
  "user": { "id": 1, "email": "user@example.com", "username": "username" },
  "accessToken": "eyJhbGc..."
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response 200:
{
  "message": "Login successful",
  "user": { "id": 1, "email": "user@example.com" },
  "accessToken": "eyJhbGc..."
}
```

### Get Profile

```http
GET /auth/profile
Authorization: Bearer <token>

Response 200:
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "role": "user"
  }
}
```

### 2FA Setup

```http
POST /auth/2fa/setup
Authorization: Bearer <token>

Response 200:
{
  "secret": "JBSWY3DPEBLW64TMMQ...",
  "qrCode": "data:image/png;base64,...",
  "backupCodes": ["CODE1", "CODE2", ...]
}
```

### 2FA Verify

```http
POST /auth/2fa/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "123456"
}

Response 200:
{
  "message": "2FA enabled successfully"
}
```

## Games Endpoints

### Get All Games

```http
GET /games?page=1&limit=20&source=epic-games
Authorization: Bearer <token>

Response 200:
{
  "games": [
    {
      "id": 1,
      "title": "Game Title",
      "source": "epic-games",
      "platform": "windows",
      "steam_price_usd": 29.99,
      "obtained_at": "2024-02-03T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Get Single Game

```http
GET /games/1
Authorization: Bearer <token>

Response 200:
{
  "game": {
    "id": 1,
    "title": "Game Title",
    "source": "epic-games",
    "source_url": "https://...",
    "platform": "windows",
    "steam_price_usd": 29.99,
    "obtained_at": "2024-02-03T00:00:00Z"
  }
}
```

### Add Game

```http
POST /games
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Game Title",
  "source": "epic-games",
  "sourceUrl": "https://...",
  "platform": "windows",
  "steamPrice": 29.99
}

Response 201:
{
  "message": "Game added",
  "game": { ... }
}
```

### Bulk Import Games

```http
POST /games/import/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "games": [
    {
      "title": "Game 1",
      "source": "epic-games",
      "sourceUrl": "https://...",
      "platform": "windows",
      "steamPrice": 29.99
    },
    { ... }
  ]
}

Response 201:
{
  "message": "Imported 2 games",
  "count": 2
}
```

### Delete Game

```http
DELETE /games/1
Authorization: Bearer <token>

Response 200:
{
  "message": "Game deleted"
}
```

## Analytics Endpoints

### Get Statistics

```http
GET /analytics/stats
Authorization: Bearer <token>

Response 200:
{
  "totalGames": 45,
  "totalValue": 1234.56,
  "thisMonth": 5
}
```

### Get Distribution

```http
GET /analytics/distribution
Authorization: Bearer <token>

Response 200:
{
  "distribution": [
    { "source": "epic-games", "count": 20 },
    { "source": "gog", "count": 15 },
    { "source": "steam", "count": 10 }
  ]
}
```

### Get Activity

```http
GET /analytics/activity?period=month
Authorization: Bearer <token>

Response 200:
{
  "activity": [
    { "date": "2024-02-01", "count": 5 },
    { "date": "2024-02-02", "count": 3 },
    { "date": "2024-02-03", "count": 2 }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 404 Not Found
```json
{
  "error": "Game not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123","confirmPassword":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Games
curl -X GET http://localhost:3000/api/games \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get Stats
curl -X GET http://localhost:3000/api/analytics/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```
