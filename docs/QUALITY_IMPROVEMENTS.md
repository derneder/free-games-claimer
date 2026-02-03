# Quality Improvements Roadmap

**Date:** February 3, 2026  
**Project:** Free Games Claimer  
**Version:** 1.0.0

---

## Overview

This document outlines recommended quality improvements identified during the comprehensive code quality and security audit. Items are prioritized and include timelines.

---

## Priority 1: Critical (Complete Within 1 Sprint)

### 1.1 Missing Dependencies ✅ COMPLETED

**Issue:** Backend missing `rate-limit-redis` and `@jest/globals`, frontend missing `@eslint/js` and `globals`

**Impact:** Build failures, linting errors

**Solution:**
- ✅ Added rate-limit-redis@^4.2.0 to backend dependencies
- ✅ Added @jest/globals@^29.7.0 to backend devDependencies  
- ✅ Added @eslint/js@^9.0.0 to frontend devDependencies
- ✅ Added globals@^15.0.0 to frontend devDependencies

**Status:** COMPLETED ✅

### 1.2 Frontend Health Endpoint ✅ COMPLETED

**Issue:** Docker healthcheck tries to access /health but endpoint doesn't exist

**Impact:** Container health checks fail

**Solution:**
- ✅ Added /health endpoint to nginx.conf
- Returns 200 OK with "OK" text
- No logging for health checks (performance)

**Status:** COMPLETED ✅

### 1.3 ESLint Warnings ✅ COMPLETED

**Issue:** 4 ESLint warnings for unescaped entities in JSX

**Files:**
- HomePage.jsx
- Login.jsx  
- NotFoundPage.jsx

**Solution:**
- ✅ Replaced single quotes with &apos; HTML entity

**Status:** COMPLETED ✅

---

## Priority 2: High (Complete Within 2-3 Sprints)

### 2.1 Increase Test Coverage ⏳ IN PROGRESS

**Current Coverage:**
- Backend: 12.09%
- Frontend: 7.77%

**Target:**
- Backend: 60%
- Frontend: 60%

**Plan:**

#### Backend (Phase 1 - Sprint 1)
- [ ] Add tests for auth service (login, register, refresh)
- [ ] Add tests for credentials controller (CRUD operations)
- [ ] Add tests for game service (scraping, claiming)
- [ ] Mock database connections for CI
- Target: 30% coverage

#### Backend (Phase 2 - Sprint 2)
- [ ] Add tests for worker orchestrator
- [ ] Add tests for Epic/GOG/Steam workers
- [ ] Add integration tests for API endpoints
- Target: 50% coverage

#### Backend (Phase 3 - Sprint 3)
- [ ] Add tests for middleware (auth, CSRF, rate limit)
- [ ] Add tests for validators
- [ ] Add edge case coverage
- Target: 60% coverage

#### Frontend (Phase 1 - Sprint 1)
- [ ] Add component tests for critical pages (Login, Dashboard, Admin)
- [ ] Add tests for auth service
- [ ] Add tests for useAuth hook
- Target: 25% coverage

#### Frontend (Phase 2 - Sprint 2)
- [ ] Add tests for all page components
- [ ] Add tests for reusable components (Header, Footer, etc.)
- [ ] Add integration tests for user flows
- Target: 50% coverage

#### Frontend (Phase 3 - Sprint 3)
- [ ] Add tests for edge cases
- [ ] Add accessibility tests
- [ ] Add error boundary tests
- Target: 60% coverage

**Estimated Effort:** 3 sprints, 40-60 hours

### 2.2 Enable Skipped Tests

**Files:**
- `backend/tests/games.test.js.skip`
- `backend/tests/unit/auth.test.js.skip`

**Tasks:**
- [ ] Review why tests were skipped
- [ ] Fix issues preventing tests from running
- [ ] Re-enable tests or document decision to remove
- [ ] Ensure tests pass in CI

**Estimated Effort:** 4-8 hours

### 2.3 Frontend Security Vulnerability

**Issue:** esbuild <=0.24.2 moderate vulnerability (dev-only)

**Current Workaround:** Development only, not production

**Options:**
1. Upgrade to vite 7.x (breaking changes)
2. Wait for vite to patch (monitor)
3. Document as acceptable risk

**Decision:** Monitor vite 7.x stability, upgrade when ready

**Tasks:**
- [ ] Track vite 7.x release status
- [ ] Test compatibility with current codebase
- [ ] Plan migration (breaking changes)
- [ ] Upgrade when stable

**Timeline:** Q2 2026

---

## Priority 3: Medium (Complete Within 3-6 Months)

### 3.1 Refactor Code Duplication

**Backend Duplications:**
1. Worker error handling (11 clones, 151 lines)
2. Credential validation schemas
3. Controller error responses

**Tasks:**
- [ ] Extract common worker error handler
- [ ] Create reusable validation schema builder
- [ ] Create error response helper middleware

**Estimated Effort:** 16-24 hours

**Frontend Duplications:**
1. Admin table rendering (ActivityLogs, UserManagement)
2. Form input fields (Login, Register)

**Tasks:**
- [ ] Create reusable Table component
- [ ] Create reusable FormInput component
- [ ] Refactor existing components to use new components

**Estimated Effort:** 12-16 hours

### 3.2 Fix Shellcheck Warnings

**Current:** 12 warnings (down from 22)

**Remaining issues:**
- Some SC2155 warnings (declare and assign separately)
- Some SC2317 info messages (unreachable code)

**Tasks:**
- [ ] Fix remaining SC2155 warnings
- [ ] Review unreachable code warnings
- [ ] Achieve 0 shellcheck warnings

**Estimated Effort:** 2-4 hours

### 3.3 Consolidate Backend Directories

**Issue:** Both `api/` and `routes/` directories exist

**Tasks:**
- [ ] Audit what's in each directory
- [ ] Decide on single pattern (routes/ recommended)
- [ ] Migrate and consolidate
- [ ] Update imports across codebase

**Estimated Effort:** 4-6 hours

### 3.4 Cyclical Dependencies Check

**Task:**
- [ ] Install madge: `npm install -g madge`
- [ ] Run: `madge --circular src` (backend and frontend)
- [ ] Fix any circular dependencies found
- [ ] Add to CI pipeline

**Estimated Effort:** 2-4 hours

---

## Priority 4: Low (Complete Within 6-12 Months)

### 4.1 Upgrade Deprecated Dependencies

**Packages:**
- eslint@8.x → eslint@9.x
- otplib@12.x → otplib@13.x
- Various transitive dependencies

**Tasks:**
- [ ] Review breaking changes for each package
- [ ] Update to latest versions one at a time
- [ ] Test thoroughly after each upgrade
- [ ] Update configuration files as needed

**Timeline:** Next major version (v2.0.0)

**Estimated Effort:** 20-30 hours

### 4.2 Backend TypeScript Migration (Optional)

**Current:** Backend is pure JavaScript with JSDoc types

**Benefits:**
- Better type safety
- Improved IDE support
- Consistent with frontend

**Considerations:**
- Large effort (7000+ LOC)
- Breaking changes possible
- Team learning curve

**Tasks:**
- [ ] Create migration plan
- [ ] Migrate utilities first (crypto, encryption)
- [ ] Migrate services
- [ ] Migrate controllers
- [ ] Update tests
- [ ] Full regression testing

**Timeline:** Major version 2.0 or 3.0

**Estimated Effort:** 80-120 hours

### 4.3 End-to-End Testing

**Current:** Only unit and component tests

**Tasks:**
- [ ] Choose E2E framework (Playwright or Cypress)
- [ ] Set up E2E testing infrastructure
- [ ] Create test scenarios for critical user flows
- [ ] Add E2E tests to CI pipeline

**Test Scenarios:**
- User registration and login
- Adding game credentials
- Claiming a game
- Admin panel operations
- Settings management

**Estimated Effort:** 40-60 hours

### 4.4 Performance Testing

**Tasks:**
- [ ] Set up load testing tool (k6 or Artillery)
- [ ] Define performance benchmarks
- [ ] Create load test scenarios
- [ ] Identify bottlenecks
- [ ] Optimize as needed

**Estimated Effort:** 20-30 hours

---

## Quality Metrics Tracking

### Current Baseline (Feb 2026)

| Metric | Backend | Frontend | Target | Status |
|--------|---------|----------|--------|--------|
| Test Coverage | 12% | 8% | 60% | 🔴 |
| Linting Errors | 0 | 0 | 0 | ✅ |
| Type Errors | 0 | 0 | 0 | ✅ |
| Security Vulns | 0 | 2 (dev) | 0 | ⚠️ |
| Code Duplication | 1.6% | 1.7% | <5% | ✅ |
| Shellcheck | 12 | N/A | 0 | ⚠️ |

### Target Metrics (Q2 2026)

| Metric | Backend | Frontend | Target | Goal |
|--------|---------|----------|--------|------|
| Test Coverage | 60% | 60% | 60% | 🎯 |
| Linting Errors | 0 | 0 | 0 | ✅ |
| Type Errors | 0 | 0 | 0 | ✅ |
| Security Vulns | 0 | 0 | 0 | 🎯 |
| Code Duplication | 1.6% | 1.7% | <3% | ✅ |
| Shellcheck | 0 | N/A | 0 | 🎯 |

---

## Sprint Planning

### Sprint 1 (Feb 2026)
- [x] Create quality audit documentation
- [x] Fix missing dependencies
- [x] Fix frontend health endpoint
- [x] Fix ESLint warnings
- [x] Fix majority of shellcheck warnings
- [ ] Add first batch of backend tests (30%)
- [ ] Add first batch of frontend tests (25%)

### Sprint 2 (Mar 2026)
- [ ] Enable skipped tests
- [ ] Continue backend tests (50%)
- [ ] Continue frontend tests (50%)
- [ ] Refactor worker error handling
- [ ] Create reusable table component

### Sprint 3 (Apr 2026)
- [ ] Final backend test push (60%)
- [ ] Final frontend test push (60%)
- [ ] Fix remaining shellcheck warnings
- [ ] Consolidate backend directories
- [ ] Add cyclical dependency checks

### Q2 2026
- [ ] Plan vite 7.x upgrade
- [ ] Start deprecation upgrades
- [ ] Add E2E testing infrastructure

---

## Success Criteria

### Sprint-Level Success
- All Priority 1 items completed
- Test coverage increases by 15-20% per sprint
- No new linting errors introduced
- No new security vulnerabilities

### Project-Level Success
- Backend test coverage ≥60%
- Frontend test coverage ≥60%
- Zero critical/high security vulnerabilities
- Code duplication <3%
- Zero shellcheck warnings
- CI/CD pipeline includes all quality checks

---

## Continuous Improvement

### Weekly
- Run `npm audit` on both projects
- Review new Dependabot PRs
- Check CI/CD pipeline health

### Monthly
- Review test coverage trends
- Update this roadmap
- Evaluate new tools/practices

### Quarterly
- Full security audit
- Performance review
- Quality metrics review
- Update quality documentation

---

**Document Owner:** Development Team  
**Last Updated:** February 3, 2026  
**Next Review:** March 1, 2026
