# Quick Start: Auto-Claim Setup

This guide will help you quickly set up the encrypted credential storage and auto-claim feature.

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database running
- Redis running
- Git clone of the repository

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
npm install
npm run playwright:install
```

This installs:
- All Node.js dependencies including Playwright
- Firefox browser for Playwright automation

### 2. Generate Encryption Key

```bash
npm run generate:key
```

This generates a secure 256-bit encryption key. Example output:
```
🔐 Encryption Key Generator

Generating secure 256-bit encryption key...

✅ Key generated successfully!

Add this to your .env file:

CREDENTIALS_ENC_KEY=aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5==
CREDENTIALS_KEY_VERSION=1

⚠️  IMPORTANT:
- Never commit this key to version control
- Store securely in environment variables
- Use different keys for dev/staging/production
- Keep a secure backup of production keys
```

### 3. Configure Environment

Copy `.env.example` to `.env` and add the generated key:

```bash
cp .env.example .env
```

Update your `.env` file with the encryption key and other required settings:

```bash
# Add the generated key
CREDENTIALS_ENC_KEY=aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5==
CREDENTIALS_KEY_VERSION=1

# Playwright settings
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_TIMEOUT=30000

# Claim worker settings
CLAIM_CRON_ENABLED=true
CLAIM_CRON_SCHEDULE=0 10 * * *  # Daily at 10 AM
CLAIM_MAX_CONCURRENT=3

# Optional: Telegram Bot Token
TELEGRAM_BOT_TOKEN=your-bot-token-from-botfather
```

### 4. Run Database Migration

```bash
npm run migrate
```

This creates the necessary tables:
- `user_credentials` - Stores encrypted credentials
- `credential_audit_log` - Tracks credential operations

### 5. Start the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## Quick Test

### Test via API

1. **Register/Login** to get JWT token:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

2. **Save Epic Games credentials**:
```bash
curl -X POST http://localhost:3000/api/credentials/epic \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-epic@email.com",
    "password": "your-epic-password"
  }'
```

3. **Check credential status**:
```bash
curl -X GET http://localhost:3000/api/credentials/epic \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test via Telegram Bot

1. **Start bot** (if Telegram token configured):
```bash
# Bot starts automatically with the server
# Or start separately if needed
node src/telegram/bot.js
```

2. **Connect to bot**:
   - Open Telegram
   - Search for your bot
   - Send `/start`
   - Send `/connect` and follow prompts

3. **Trigger manual claim**:
   - Send `/claim`
   - Select provider
   - Wait for results

## Verify Setup

### Check Encryption

Run the encryption tests:
```bash
npm run test tests/unit/encryption.test.js
```

Expected output:
```
 PASS  tests/unit/encryption.test.js
  Encryption Utilities
    encryptCredentials
      ✓ should encrypt data successfully
      ✓ should generate different IV for each encryption
    decryptCredentials
      ✓ should decrypt data successfully
      ...
```

### Check Validators

Run the validator tests:
```bash
npm run test tests/unit/credentials.validator.test.js
```

### Check Database

Verify tables were created:
```sql
\dt user_credentials
\dt credential_audit_log
```

## Next Steps

1. **Connect your provider accounts** using one of the methods:
   - Telegram bot (`/connect`)
   - API endpoints
   - Frontend UI (when available)

2. **Configure claim schedule** in `.env`:
   ```bash
   # Run daily at 2 AM and 2 PM
   CLAIM_CRON_SCHEDULE=0 2,14 * * *
   ```

3. **Test manual claim**:
   ```bash
   # Via Telegram: /claim
   # Or trigger programmatically
   ```

4. **Monitor logs**:
   ```bash
   tail -f logs/app.log | grep -i claim
   ```

## Troubleshooting

### Encryption Error

**Issue:** "Encryption key not configured"

**Solution:**
1. Verify `.env` has `CREDENTIALS_ENC_KEY`
2. Ensure key is valid base64 (44 characters)
3. Restart application

### Migration Failed

**Issue:** Migration fails to run

**Solution:**
1. Check PostgreSQL is running
2. Verify database connection in `.env`
3. Check user has CREATE TABLE permission
4. Run migrations manually:
   ```bash
   psql -U user -d database -f database/migrations/006_create_user_credentials_table.sql
   ```

### Playwright Error

**Issue:** "Executable doesn't exist at..."

**Solution:**
```bash
npx playwright install firefox
```

### Claim Fails

**Issue:** Claims fail with errors

**Solution:**
1. Verify credentials are valid (re-login to provider)
2. Check logs for specific error
3. Try with headless=false to see browser:
   ```bash
   PLAYWRIGHT_HEADLESS=false npm run dev
   ```

## Security Checklist

- [ ] Encryption key is NOT in version control
- [ ] Different keys for dev/staging/production
- [ ] `.env` file is in `.gitignore`
- [ ] Credentials stored securely
- [ ] Logs don't contain sensitive data
- [ ] Rate limiting is enabled
- [ ] HTTPS is used in production

## Resources

- [Full Documentation](./CREDENTIALS.md)
- [API Reference](http://localhost:3000/api-docs)
- [Telegram Commands](./CREDENTIALS.md#via-telegram-bot)
- [Security Best Practices](./CREDENTIALS.md#security-best-practices)

---

You're all set! 🎉 You can now automatically claim free games from Epic Games, GOG, and Steam.
