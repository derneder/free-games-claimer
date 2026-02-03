# Encrypted Credential Storage & Auto-Claim

This document explains how to set up and use the encrypted credential storage and auto-claim features for Epic Games, GOG, and Steam.

## 🔐 Security Overview

All provider credentials are encrypted at rest using **AES-256-GCM** encryption with:
- Per-record initialization vectors (IV)
- Authentication tags for integrity verification
- Key versioning for rotation support
- Secure key storage via environment variables

**Never commit encryption keys to version control!**

## 📋 Prerequisites

Before setting up auto-claim, ensure you have:

1. **Node.js 20+** and dependencies installed
2. **PostgreSQL** database running
3. **Redis** for caching
4. **Playwright** browsers installed (`npx playwright install firefox`)

## 🔧 Initial Setup

### 1. Generate Encryption Key

Generate a secure 256-bit encryption key using the provided script:

```bash
cd backend
npm run generate:key
```

Or manually:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# Credential Encryption (REQUIRED)
CREDENTIALS_ENC_KEY=<your-generated-base64-key>
CREDENTIALS_KEY_VERSION=1

# Playwright Configuration
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_TIMEOUT=30000
PLAYWRIGHT_SLOW_MO=0

# Optional: Provider-specific
# EPIC_PARENTAL_PIN=1234
# PROXY_URL=http://user:pass@host:port

# Claim Worker Configuration
CLAIM_CRON_ENABLED=true
CLAIM_CRON_SCHEDULE=0 10 * * *  # Daily at 10 AM
CLAIM_MAX_CONCURRENT=3
```

### 3. Run Database Migration

Apply the credential storage migration:

```bash
cd backend
npm run migrate
```

This creates:
- `user_credentials` table for encrypted credentials
- `credential_audit_log` table for audit trail

## 🎮 Using the Feature

### Via Telegram Bot

#### Connect Provider Account

1. Send `/connect` to the bot
2. Select provider (Epic Games, GOG, or Steam)
3. Send credentials in JSON format:

**Email/Password method:**
```json
{
  "email": "your@email.com",
  "password": "yourpassword"
}
```

**With 2FA (TOTP):**
```json
{
  "email": "your@email.com",
  "password": "yourpassword",
  "otpSecret": "YOUR_TOTP_SECRET"
}
```

**Using Cookies (recommended):**
```json
{
  "cookies": [
    {
      "name": "cookie_name",
      "value": "cookie_value",
      "domain": ".epicgames.com"
    }
  ]
}
```

#### Check Account Status

Send `/accounts` to see all connected providers and their status.

#### Trigger Manual Claim

Send `/claim` and select:
- Specific provider to claim from
- "Claim All" to claim from all connected providers

#### Disconnect Account

Send `/disconnect` and select the provider to remove.

### Via API

#### Save Credentials

```bash
POST /api/credentials/{provider}
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "email": "your@email.com",
  "password": "yourpassword"
}
```

#### Get Status

```bash
GET /api/credentials/{provider}
Authorization: Bearer <jwt-token>
```

#### Delete Credentials

```bash
DELETE /api/credentials/{provider}
Authorization: Bearer <jwt-token>
```

### Via Frontend

1. Navigate to Settings → Provider Credentials
2. Select provider (Epic Games, GOG, Steam)
3. Enter credentials in the form
4. Click "Save Credentials"
5. View status and last verification time

## 🤖 Automated Claims

### Scheduled Claims

Claims run automatically based on `CLAIM_CRON_SCHEDULE`:

- Default: Daily at 10:00 AM
- Processes all users with active credentials
- Respects rate limits and concurrent limits

### Manual Trigger

Trigger claims programmatically:

```javascript
import { claimForUser, claimForAllUsers } from './workers/claimOrchestrator.js';

// Claim for specific user
const result = await claimForUser('user-id', 'epic');

// Claim for all users with Epic credentials
const results = await claimForAllUsers('epic');
```

## 🔑 Credential Types by Provider

### Epic Games

**Email/Password:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "otpSecret": "TOTP_SECRET",      // Optional
  "parentalPin": "1234"             // Optional
}
```

**Session Token:**
```json
{
  "sessionToken": "token_value"
}
```

**Cookies:**
```json
{
  "cookies": [
    {"name": "EPIC_BEARER_TOKEN", "value": "..."},
    {"name": "EPIC_SESSION_AP", "value": "..."}
  ]
}
```

### GOG

**Email/Password:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "otpSecret": "TOTP_SECRET",           // Optional
  "unsubscribeMarketing": true          // Optional
}
```

### Steam

**Username/Password:**
```json
{
  "username": "steamuser",
  "password": "password123",
  "otpSecret": "TOTP_SECRET",      // Optional
  "steamGuardCode": "ABC12"         // Optional
}
```

## 🔒 Security Best Practices

### 1. Encryption Key Management

- **Never commit** `CREDENTIALS_ENC_KEY` to version control
- Store in environment variables or secret manager
- Use different keys for dev/staging/production
- Rotate keys periodically (see Key Rotation below)

### 2. Credential Input

- **Prefer tokens/cookies** over passwords when possible
- Use **TOTP secrets** instead of manual 2FA codes
- Clear credentials from clipboard after use
- Use secure channels (HTTPS, encrypted messaging)

### 3. Logging

All credential operations are automatically logged without sensitive data:
- Credential creation/update/deletion
- Claim attempts and results
- Verification status changes

Logs are sanitized to never include:
- Passwords
- Tokens
- Cookies
- OTP secrets

### 4. Rate Limiting

API endpoints have strict rate limits:
- **20 requests per 15 minutes** for credential operations
- **Per-user limits** to prevent abuse
- **Concurrent claim limits** via `CLAIM_MAX_CONCURRENT`

## 🔄 Key Rotation

To rotate encryption keys:

### 1. Generate New Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Add New Key to Environment

```bash
CREDENTIALS_ENC_KEY=<old-key>
CREDENTIALS_ENC_KEY_V2=<new-key>
CREDENTIALS_KEY_VERSION=2
```

### 3. Run Rotation Script

```javascript
import { rotateCredentialKey } from './services/credentialService.js';

// Rotate all credentials to new key
const users = await getAllUsers();
for (const user of users) {
  for (const provider of ['epic', 'gog', 'steam']) {
    await rotateCredentialKey(user.id, provider, 2);
  }
}
```

### 4. Remove Old Key

After verifying all credentials are rotated, remove `CREDENTIALS_ENC_KEY` from environment.

## 📊 Monitoring

### Check Claim Results

Via logs:
```bash
tail -f logs/app.log | grep -i claim
```

Via audit log:
```sql
SELECT * FROM credential_audit_log
WHERE action IN ('claim_success', 'claim_failed')
ORDER BY created_at DESC
LIMIT 50;
```

### Credential Status

```sql
SELECT provider, status, COUNT(*) as count
FROM user_credentials
GROUP BY provider, status;
```

## 🐛 Troubleshooting

### Claim Failures

**Issue:** Claims fail with "verification_failed"

**Solutions:**
1. Check credential validity (re-login manually)
2. Update credentials if password/token changed
3. Check for captcha requirements (may need manual intervention)
4. Verify 2FA settings match

### Encryption Errors

**Issue:** "Failed to decrypt credentials"

**Solutions:**
1. Verify `CREDENTIALS_ENC_KEY` is correct
2. Check `CREDENTIALS_KEY_VERSION` matches
3. Ensure no truncation of base64 key
4. Check database `enc_data` column integrity

### Playwright Issues

**Issue:** Browser launch fails

**Solutions:**
1. Install browsers: `npx playwright install firefox`
2. Check system dependencies
3. Verify headless mode settings
4. Check available disk space

## ⚠️ Limitations & Risks

### Captcha

Some providers may require captcha verification. When encountered:
- Claim will fail with captcha error
- Manual intervention required
- Consider using session tokens/cookies instead

### 2FA

- **TOTP (Time-based):** Fully supported via `otpSecret`
- **SMS/Email codes:** Not supported (use TOTP instead)
- **Hardware keys:** Not supported

### Account Security

- Auto-claiming may trigger security alerts
- Use IP whitelisting if available
- Consider using proxy for consistent IP
- Monitor for unusual activity

### Provider Changes

Web scraping-based claims may break if providers change:
- Website structure
- Login flows
- Anti-bot measures

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [TOTP Setup Guide](https://github.com/google/google-authenticator/wiki/Key-Uri-Format)
- [API Documentation](/api-docs)

## 🆘 Support

For issues or questions:
1. Check logs: `logs/app.log`
2. Review audit trail: `credential_audit_log` table
3. Open GitHub issue with sanitized logs
4. Contact maintainers

---

**Remember:** This feature handles sensitive credentials. Always follow security best practices and never share your encryption keys or credentials.
