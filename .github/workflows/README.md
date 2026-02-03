# GitHub Actions Workflows

Automated CI/CD pipelines for quality assurance and deployment.

---

## 🔄 Active Workflows

### 1. **test.yml** - CI Tests & Quality
**Trigger:** Push to `main` or `implementation`, Pull Requests  
**Duration:** ~15 minutes  
**Services:** PostgreSQL 15, Redis 7

**Backend Checks:**
- ✅ Lint (ESLint)
- ✅ Format check (Prettier)
- ✅ Type check (TypeScript)
- ✅ Database migrations
- ✅ Tests with coverage (Jest)
- ✅ Upload coverage to Codecov

**Frontend Checks:**
- ✅ Lint (ESLint 9)
- ✅ Format check (Prettier)
- ✅ Type check (TypeScript)
- ✅ Tests with coverage (Vitest)
- ✅ Build (Vite)
- ✅ Upload coverage to Codecov

**Node Version:** 20

**Status Badge:**
```markdown
[![Tests](https://github.com/derneder/free-games-claimer/actions/workflows/test.yml/badge.svg)](https://github.com/derneder/free-games-claimer/actions/workflows/test.yml)
```

---

### 2. **build.yml** - Build Docker Images
**Trigger:** Push to `main`, version tags (`v*`), PRs to `main`  
**Duration:** ~10 minutes  

**Steps:**
- ✅ Build backend Docker image (Node 20 Alpine)
- ✅ Build frontend Docker image (Node 20 Alpine + Nginx)
- ✅ Push to GitHub Container Registry (ghcr.io)
- ✅ Semantic versioning support
- ✅ Build caching for faster builds

**Registry:** `ghcr.io/derneder/free-games-backend`, `ghcr.io/derneder/free-games-frontend`

**Note:** Images only pushed on non-PR events

**Status Badge:**
```markdown
[![Build](https://github.com/derneder/free-games-claimer/actions/workflows/build.yml/badge.svg)](https://github.com/derneder/free-games-claimer/actions/workflows/build.yml)
```

---

### 3. **pages.yml** - Deploy to GitHub Pages
**Trigger:** Push to `main` (frontend changes), manual dispatch  
**Duration:** ~10 minutes  

**Steps:**
- ✅ Build frontend with production config
- ✅ Upload to GitHub Pages artifact
- ✅ Deploy to GitHub Pages

**URL:** `https://derneder.github.io/free-games-claimer/`

**Node Version:** 20

**Concurrency:** Single deployment, no cancellation of in-progress runs

**Status Badge:**
```markdown
[![Pages](https://github.com/derneder/free-games-claimer/actions/workflows/pages.yml/badge.svg)](https://github.com/derneder/free-games-claimer/actions/workflows/pages.yml)
```

---

### 4. **code-quality.yml** - Code Quality & Security
**Trigger:** Push/PR to `main` and `implementation`, daily at 2 AM UTC  
**Duration:** ~20 minutes  

**Security Scan:**
- ✅ NPM audit (backend & frontend)
- ✅ Secret detection (Gitleaks)

**CodeQL Analysis:**
- ✅ Static security analysis
- ✅ JavaScript vulnerability detection

**SonarCloud:**
- ✅ Code quality analysis
- ✅ Technical debt tracking
- ✅ Code coverage integration

**Node Version:** 20

**Status Badge:**
```markdown
[![Quality](https://github.com/derneder/free-games-claimer/actions/workflows/code-quality.yml/badge.svg)](https://github.com/derneder/free-games-claimer/actions/workflows/code-quality.yml)
```

---

## 🚀 Manual Triggers

### Using GitHub UI
1. Go to **Actions** tab
2. Select workflow
3. Click "Run workflow"

### Using GitHub CLI
```bash
gh workflow run test.yml
gh workflow run build.yml
gh workflow run pages.yml
gh workflow run code-quality.yml
```

---

## 🔐 Required Secrets

Set in **Settings > Secrets and variables > Actions**:

```
GITHUB_TOKEN       # Automatically provided by GitHub
SONAR_TOKEN        # For SonarCloud analysis (optional)
```

---

## 📊 Workflow Dependencies

All workflows use:
- **Node Version:** 20 (via .nvmrc)
- **Action Versions:** v4/v5 (latest)
- **Docker Buildx:** v3 for caching
- **Coverage:** Codecov with separate backend/frontend flags

---

## 🛡️ Security Features

- ✅ Dependency vulnerability scanning
- ✅ Secret leak detection
- ✅ CodeQL static analysis
- ✅ SonarCloud quality gates
- ✅ Security audits with `continue-on-error` to avoid blocking

---

## 📝 Removed Workflows (Consolidated)

The following duplicate workflows were removed and consolidated:

- ❌ `ci.yml` → Merged into `test.yml`
- ❌ `backend-tests.yml` → Merged into `test.yml`
- ❌ `frontend-tests.yml` → Merged into `test.yml`
- ❌ `deploy.yml` → Functionality split between `build.yml` and `pages.yml`
- ❌ `deploy-frontend.yml` → Merged into `pages.yml`
- ❌ `quality.yml` → Merged into `code-quality.yml`
- ❌ `security.yml` → Merged into `code-quality.yml`
- ❌ `sonar.yml` → Merged into `code-quality.yml`

---

## 📈 Performance Tips

### Optimize Workflow Speed
1. **Use `npm ci`** instead of `npm install` (enabled in all workflows)
2. **Cache dependencies** (automatic with `actions/setup-node@v4`)
3. **Set timeout-minutes** to prevent hangs (15 min for tests)
4. **Use Ubuntu latest** for best performance

### Path Filtering
Workflows trigger only when relevant files change:
```yaml
on:
  push:
    paths:
      - 'backend/**'
      - 'frontend/**'
```

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Actions Marketplace](https://github.com/marketplace?type=actions)

---

**Last Updated:** February 3, 2026  
**Status:** ✅ Production Ready  
**Node Version:** 20.19.0
