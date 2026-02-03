# GitHub Actions Workflows

Automated CI/CD pipelines for quality assurance and deployment.

---

## 🔄 Available Workflows

### 1. **quality.yml** - Code Quality & Security
**Trigger:** Push to `implementation` or `main`, PR, daily schedule (2 AM UTC)  
**Duration:** ~15 minutes  

**Checks:**
- ✅ Format check (Prettier)
- ✅ Linting (ESLint)
- ✅ Type checking (TypeScript)
- ✅ Security audit (npm audit)
- ✅ Secret detection (Gitleaks)
- ✅ Backend build
- ✅ Frontend build

**Status Badge:**
```markdown
[![Quality Checks](https://github.com/derneder/free-games-claimer/actions/workflows/quality.yml/badge.svg)](https://github.com/derneder/free-games-claimer/actions/workflows/quality.yml)
```

---

### 2. **backend-tests.yml** - Backend Tests & Coverage
**Trigger:** Push to backend/ or package.json changes  
**Duration:** ~15 minutes  
**Services:** PostgreSQL, Redis

**Steps:**
- ✅ Lint backend
- ✅ Type check
- ✅ Run Jest tests with coverage
- ✅ Upload coverage to Codecov
- ✅ Build backend
- ✅ Security audit
- ✅ Secret scanning

**Environment Variables:**
```bash
DATABASE_URL=postgresql://testuser:testpass@localhost:5432/test_db
REDIS_URL=redis://localhost:6379
NODE_ENV=test
```

**Coverage Report:** Automatically commented on PRs

---

### 3. **frontend-tests.yml** - Frontend Tests & Build
**Trigger:** Push to frontend/ or package.json changes  
**Duration:** ~15 minutes  

**Steps:**
- ✅ Lint frontend
- ✅ Type check
- ✅ Run tests with coverage
- ✅ Upload coverage to Codecov
- ✅ Build with Vite
- ✅ Upload build artifact (5 days retention)

**Environment Variables:**
```bash
VITE_API_URL=https://api.example.com
VITE_APP_ENV=production
CI=true
```

**Artifacts:** `frontend-dist/` for 5 days

---

### 4. **deploy-frontend.yml** - GitHub Pages Deployment
**Trigger:** Push to `main` branch or manual dispatch  
**Duration:** ~10 minutes  

**Steps:**
- ✅ Checkout code
- ✅ Build frontend
- ✅ Upload to GitHub Pages artifact
- ✅ Deploy to GitHub Pages

**URL:** `https://derneder.github.io/free-games-claimer/`

**Note:** Only deploys on push to `main` branch

---

## 🚀 Manual Triggers

### Run workflow manually
```bash
# Go to Actions tab in GitHub
# Select workflow
# Click "Run workflow"
```

### Using GitHub CLI
```bash
gh workflow run quality.yml
gh workflow run backend-tests.yml
gh workflow run frontend-tests.yml
gh workflow run deploy-frontend.yml
```

---

## 📊 View Results

### In GitHub UI
1. Go to **Actions** tab
2. Select workflow run
3. View logs and artifacts

### Status Badges
Add to README.md:
```markdown
[![Quality](https://github.com/derneder/free-games-claimer/actions/workflows/quality.yml/badge.svg?branch=main)](https://github.com/derneder/free-games-claimer/actions/workflows/quality.yml)
[![Backend Tests](https://github.com/derneder/free-games-claimer/actions/workflows/backend-tests.yml/badge.svg?branch=main)](https://github.com/derneder/free-games-claimer/actions/workflows/backend-tests.yml)
[![Frontend Tests](https://github.com/derneder/free-games-claimer/actions/workflows/frontend-tests.yml/badge.svg?branch=main)](https://github.com/derneder/free-games-claimer/actions/workflows/frontend-tests.yml)
```

---

## 🔐 Required Secrets

Set in **Settings > Secrets and variables > Actions**:

### For All Workflows
```
GITHUB_TOKEN       # Automatically available
```

### For Optional Features
```
SONAR_TOKEN        # SonarCloud integration
CODECOV_TOKEN      # Codecov integration
DEPLOY_KEY         # SSH deploy key
```

---

## 🛡️ Security

### What's Checked
- ✅ Dependency vulnerabilities
- ✅ Secret leaks (Gitleaks)
- ✅ Code quality issues
- ✅ Build failures
- ✅ Test failures

### Permissions
Each workflow has minimal required permissions:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

---

## 📈 Performance Tips

### Optimize Workflow Speed
1. **Use `npm ci`** instead of `npm install`
2. **Cache dependencies** (enabled by default)
3. **Set timeout-minutes** to prevent hangs
4. **Use Ubuntu latest** for best performance

### Reduce Workflow Runs
```yaml
on:
  push:
    paths:  # Only run if these files change
      - 'backend/**'
      - 'package.json'
```

---

## 🐛 Troubleshooting

### Workflow Not Triggering
- Check branch name matches trigger condition
- Verify file path matches `paths:` filter
- Wait ~1 minute after push

### Tests Failing Locally but Passing in CI
- Check Node.js version: `nvm use`
- Clear cache: `npm cache clean --force`
- Reinstall: `npm ci`

### Deployment Not Working
- Enable GitHub Pages in repo Settings
- Check branch is set to `main`
- Verify `frontend/dist` folder exists

---

## 📝 Adding New Workflows

1. Create file: `.github/workflows/new-workflow.yml`
2. Copy existing workflow as template
3. Modify triggers and steps
4. Push to trigger workflow
5. Check **Actions** tab for results

### Template
```yaml
name: My New Workflow

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18.18.2'
          cache: 'npm'
      - run: npm ci
      - run: npm run test
```

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Actions Marketplace](https://github.com/marketplace?type=actions)

---

**Last Updated:** February 3, 2026  
**Status:** ✅ Production Ready
