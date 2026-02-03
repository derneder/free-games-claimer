# 🚀 Phase 1 Integration Guide

## 📋 Overview

This guide walks you through integrating all Phase 1 features into your Free Games Claimer project:

- ✅ Jest Tests (Auth + Games APIs)
- ✅ Swagger/OpenAPI Documentation  
- ✅ CSRF Protection & Security Headers (using csrf-csrf)
- ✅ Email Notifications
- ✅ Admin Dashboard UI
- ✅ Analytics Charts

**Estimated time:** 30-45 minutes

---

## 🔧 Phase 1: Backend Setup

### Step 1.1: Update package.json Dependencies

Add these to `backend/package.json`:

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0"
  },
  "dependencies": {
    "helmet": "^7.1.0",
    "csrf-csrf": "^4.0.3",
    "cookie-parser": "^1.4.6",
    "nodemailer": "^6.9.7"
  },
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --coverageReporters=html"
  }
}
```

Install:
```bash
cd backend && npm install
```

### Step 1.2: Copy Test Files

```bash
# Files already in GitHub at:
# - backend/tests/auth.test.js
# - backend/tests/games.test.js
# - backend/jest.config.js
```

### Step 1.3: Update backend/src/index.js

Add to your main app file:

```javascript
import { cookieParserMiddleware, conditionalCsrf, csrfErrorHandler, generateToken } from './middleware/csrf.js';
import { setupSwagger } from './middleware/csrf.js';
import { initEmailService } from './services/email.js';

// Add cookie parser (required for CSRF protection)
app.use(cookieParserMiddleware);

// Add CSRF protection (BEFORE routes)
app.use(conditionalCsrf);

// Add CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
  const token = generateToken(req, res);
  res.json({ token });
});

// Setup Swagger
setupSwagger(app);

// Initialize email service
initEmailService();

// Add CSRF error handler (AFTER routes, BEFORE global error handler)
app.use(csrfErrorHandler);
```

### Step 1.4: Update backend/.env.example

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=app_password_here
SMTP_FROM=noreply@free-games-claimer.com
ADMIN_EMAIL=admin@example.com

# Security
CSRF_SECRET=your_csrf_secret_here
```

### Step 1.5: Add Swagger JSDoc Comments to Auth Routes

In `backend/src/routes/auth.js`, add Swagger documentation comments for your endpoints:

```javascript
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
```

Do the same for: `/auth/login`, `/auth/2fa/setup`, `/auth/refresh`, `/auth/profile`

### Step 1.6: Run Tests

```bash
cd backend
npm test

# Expected output:
# ✓ auth.test.js (30+ tests passing)
# ✓ games.test.js (45+ tests passing)
# Coverage: 70%+
```

---

## 🎨 Phase 2: Frontend Setup

### Step 2.1: Update frontend/package.json

```json
{
  "dependencies": {
    "recharts": "^2.10.3"
  }
}
```

Install:
```bash
cd frontend && npm install
```

### Step 2.2: Create Component Directories

```bash
mkdir -p src/components/Admin
mkdir -p src/components/Dashboard
```

### Step 2.3: Copy Component Files

```bash
# Files already in GitHub at:
# - frontend/src/components/Admin/AdminDashboard.jsx
# - frontend/src/components/Admin/UserManagement.jsx
# - frontend/src/components/Admin/SystemStats.jsx
# - frontend/src/components/Admin/ActivityLogs.jsx
# - frontend/src/components/Dashboard/AnalyticsCharts.jsx
```

### Step 2.4: Add Routes to frontend/src/App.jsx

```jsx
import AdminDashboard from './components/Admin/AdminDashboard';
import AnalyticsCharts from './components/Dashboard/AnalyticsCharts';

// In your routing:
<Route path="/admin" element={<AdminDashboard />} />
<Route path="/analytics" element={<AnalyticsCharts />} />
```

### Step 2.5: Update CSRF Token Handling

In `frontend/src/services/api.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
});

// Get CSRF token using generateToken endpoint
api.interceptors.request.use(async (config) => {
  // Only add CSRF token for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method.toUpperCase())) {
    try {
      const response = await axios.get('/api/csrf-token', {
        withCredentials: true,
      });
      config.headers['X-CSRF-Token'] = response.data.token;
    } catch (error) {
      console.warn('Could not fetch CSRF token');
    }
  }
  return config;
});

export default api;
```

---

## ✅ Phase 3: Verification

### Step 3.1: Test Backend

```bash
cd backend
npm test

# All tests should pass ✅
```

### Step 3.2: Start Development Servers

```bash
# Terminal 1: Backend
cd backend && npm run dev
# Should start on http://localhost:3000

# Terminal 2: Frontend  
cd frontend && npm run dev
# Should start on http://localhost:5173
```

### Step 3.3: Verify Swagger

Visit: `http://localhost:3000/docs`

You should see:
- Interactive API documentation
- All endpoints listed with schemas
- Try it out buttons
- Download JSON button

### Step 3.4: Verify Admin Dashboard

Visit: `http://localhost:5173/admin`

You should see:
- Three tabs: Statistics, Users, Logs
- System KPI cards
- User management table
- Activity logs viewer

### Step 3.5: Verify Analytics

Visit: `http://localhost:5173/analytics`

You should see:
- Period selector (Week/Month/Year)
- Line chart for activity
- Pie chart for source distribution
- Bar chart for platform distribution
- Summary statistics

---

## 🐛 Troubleshooting

### Issue: Tests failing with "Cannot find module 'supertest'"
**Solution:** Run `npm install` in backend directory

### Issue: Swagger docs not loading
**Solution:** Verify swagger.js is imported and setupSwagger() is called in index.js

### Issue: CSRF token errors
**Solution:** Ensure cookie-parser middleware is loaded BEFORE csrf middleware. The new csrf-csrf implementation uses double CSRF tokens stored in cookies.

### Issue: Email not sending
**Solution:** Check SMTP credentials in .env file

### Issue: Components not rendering
**Solution:** Verify routes are added to App.jsx and components are in correct directories

---

## 📦 What's Next?

### Recommended Next Steps:

1. **Merge to main branch** - When ready for production
2. **Set up CI/CD** - GitHub Actions workflow for automated testing
3. **Deploy to staging** - Test on staging environment
4. **Phase 2 features** - i18n, PWA, Push notifications

### Files to Review:
- `DEPLOYMENT_CHECKLIST.md` - For production deployment
- `GIT_COMMIT_INSTRUCTIONS.md` - For git workflow

---

## 📞 Support

For issues or questions:
1. Check code comments in each file
2. Review DEPLOYMENT_CHECKLIST.md
3. Check GitHub Issues

---

**Status:** ✅ All Phase 1 features integrated and tested!
