# Testing Documentation - Thai Spa Booking System

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Test Architecture](#test-architecture)
- [Running Tests Locally](#running-tests-locally)
- [Health Checks](#health-checks)
- [API Testing](#api-testing)
- [E2E Testing](#e2e-testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Test Accounts](#test-accounts)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This document covers the comprehensive testing strategy for Thai Spa Booking System, including:

- **Health & Readiness Checks**: System health verification (API, DB, SMTP, CORS, Security)
- **Smoke Tests**: Quick validation of critical endpoints
- **API Testing**: REST Client collection for manual/automated API testing
- **E2E Testing**: Playwright tests for complete user flows
- **CI/CD**: GitHub Actions automated testing pipeline

---

## ✅ Prerequisites

### Required Software

```bash
# Node.js 18+ and npm
node --version  # v18.x.x or higher
npm --version   # 9.x.x or higher

# Git (for CI/CD)
git --version
```

### Environment Setup

1. **Backend `.env` configuration**:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=http://localhost:3000

# SMTP Configuration (Required for health checks)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=Thai Spa <noreply@thaispa.com>
```

2. **Database Setup**:
```bash
cd backend
npm run migrate  # Run migrations
npm run seed     # Seed test data
```

---

## 🏗️ Test Architecture

```
thai-spa/
├── backend/
│   ├── scripts/
│   │   └── healthcheck.ts          # Health check script
│   └── tests/
│       └── api.http                # REST Client API tests
├── frontend/
│   ├── playwright.config.ts        # Playwright configuration
│   └── tests/
│       └── e2e/
│           ├── booking-flow.spec.ts  # User booking E2E tests
│           └── admin-flow.spec.ts    # Admin dashboard E2E tests
└── .github/
    └── workflows/
        └── ci.yml                   # GitHub Actions CI/CD
```

---

## 🚀 Running Tests Locally

### 1. Health Checks (Backend)

```bash
cd backend

# Run health checks with Markdown report
npm run health

# Run health checks with JSON output
npm run health:json

# Save JSON report to file
npm run health:json > health-report.json
```

**What it checks:**
- ✅ API Health (`/health` endpoint)
- ✅ Database Ping (SQLite connection)
- ✅ Migration State (9 tables verified)
- ✅ SMTP Connection (nodemailer verify)
- ✅ CORS Headers (Frontend URL allowed)
- ✅ Security Headers (5 Helmet headers)
- ✅ Rate Limiting (15 requests test)
- ✅ Smoke Test: Services API
- ✅ Smoke Test: Therapists API

**Expected Output:**
```
🏥 Thai Spa - Health Check Report
================================

Health Checks:
✅ API Health: pass (123ms)
✅ Database Ping: pass (45ms)
✅ Migration State: pass (89ms)
...

Summary: 9/9 checks passed
```

### 2. API Testing with REST Client

**Install VS Code Extension:**
- [REST Client by Huachao Mao](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

**Usage:**
```bash
# Open file in VS Code
code backend/tests/api.http

# Click "Send Request" above each ### section
# Or use shortcut: Ctrl+Alt+R (Windows/Linux) or Cmd+Alt+R (Mac)
```

**Test Coverage:**
- Authentication (Register, Verify, Login, Logout)
- Services CRUD
- Therapists CRUD
- Promotions & Gallery
- Booking Slots & Creation
- Booking Status Updates (Admin)
- Admin Dashboard & Reports (PDF, Excel)
- Error Scenarios (401, 403, 404, 429)

### 3. E2E Testing with Playwright

```bash
cd frontend

# Run all E2E tests (headless)
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# View test report
npm run test:report
```

**Test Suites:**

**User Booking Flow** (`booking-flow.spec.ts`):
- ✅ Complete booking journey (Register → Login → Book → Confirm)
- ✅ Empty slots validation
- ✅ Therapist availability check
- ✅ Price calculation with promotions
- ✅ Navigation and UI tests

**Admin Flow** (`admin-flow.spec.ts`):
- ✅ Admin dashboard access
- ✅ Revenue statistics display
- ✅ Charts rendering
- ✅ Booking list and status updates
- ✅ PDF/Excel export
- ✅ Date range filtering
- ✅ Access control (non-admin blocked)
- ✅ Business logic validation

**Running Specific Tests:**
```bash
# Run only booking flow tests
npx playwright test booking-flow

# Run only admin tests
npx playwright test admin-flow

# Run tests matching pattern
npx playwright test --grep "Admin can"
```

---

## 🏥 Health Checks

### Running Health Checks

```bash
cd backend

# Start backend server first
npm run dev

# In another terminal
npm run health
```

### Health Check Details

| Check | Description | Pass Criteria |
|-------|-------------|---------------|
| **API Health** | GET `/health` | Status 200 + `{status: "ok"}` |
| **Database Ping** | SQLite connection | `SELECT 1` succeeds |
| **Migration State** | Table existence | All 9 tables present |
| **SMTP Connection** | Email service | `nodemailer.verify()` success |
| **CORS Headers** | CORS config | `Access-Control-*` headers present |
| **Security Headers** | Helmet headers | 5 security headers present |
| **Rate Limiting** | Rate limit enforcement | 429 status after 10 requests |
| **Services API** | GET `/api/services` | Array response with items |
| **Therapists API** | GET `/api/therapists` | Active therapists present |

### Interpreting Results

**✅ Pass**: All checks succeeded
```json
{
  "overall": "pass",
  "passed": 9,
  "failed": 0,
  "total": 9
}
```

**❌ Fail**: One or more checks failed
```json
{
  "overall": "fail",
  "passed": 8,
  "failed": 1,
  "checks": [
    {
      "name": "SMTP Connection",
      "status": "fail",
      "message": "Connection refused",
      "details": { "error": "ECONNREFUSED" }
    }
  ]
}
```

---

## 🔧 API Testing

### Using REST Client (VS Code)

1. **Install Extension**: Search "REST Client" in VS Code Extensions

2. **Open Test File**: `backend/tests/api.http`

3. **Configure Variables** (top of file):
```http
@baseURL = http://localhost:5000
@frontendURL = http://localhost:3001
@adminEmail = admin@thaispa.com
@adminPassword = Admin@123
```

4. **Run Tests**:
   - Click "Send Request" above any `###` section
   - Or press `Ctrl+Alt+R` / `Cmd+Alt+R`

### Test Workflow Example

```http
### 1. Login as Admin
# @name loginAdmin
POST {{baseURL}}/api/auth/login
Content-Type: application/json

{
  "email": "{{adminEmail}}",
  "password": "{{adminPassword}}"
}

### 2. Use the returned cookie in next request
GET {{baseURL}}/api/admin/dashboard
Cookie: token=YOUR_JWT_TOKEN_HERE
```

### Using cURL

```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@thaispa.com","password":"Admin@123"}' \
  -c cookies.txt

# Get dashboard (using saved cookies)
curl http://localhost:5000/api/admin/dashboard \
  -b cookies.txt
```

---

## 🎭 E2E Testing

### Test Structure

```typescript
test.describe('User Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Complete booking flow', async ({ page }) => {
    test.step('Navigate to Register', async () => {
      // Test code
    });
  });
});
```

### Debugging Failed Tests

**1. View Screenshots:**
```bash
cd frontend/test-results
# Screenshots saved as: <test-name>/<browser>/test-failed-1.png
```

**2. View Trace:**
```bash
npm run test:report
# Click on failed test → View trace
```

**3. Run in Debug Mode:**
```bash
npx playwright test --debug
```

**4. Run Single Test:**
```bash
npx playwright test booking-flow.spec.ts:15  # Line 15
```

### Common Issues & Solutions

**Issue**: Test timeout waiting for element
```typescript
// ❌ Bad: Default 30s timeout
await expect(page.locator('.button')).toBeVisible();

// ✅ Good: Custom timeout
await expect(page.locator('.button')).toBeVisible({ timeout: 10000 });
```

**Issue**: Element not found
```typescript
// ❌ Bad: Strict selector
await page.click('button');  // Multiple buttons

// ✅ Good: Specific selector
await page.click('button:has-text("จองเลย")');
```

**Issue**: Flaky tests
```typescript
// ❌ Bad: Fixed wait
await page.waitForTimeout(3000);

// ✅ Good: Wait for condition
await page.waitForLoadState('networkidle');
await expect(page.locator('.data')).toBeVisible();
```

---

## ⚙️ CI/CD Pipeline

### GitHub Actions Workflow

**File**: `.github/workflows/ci.yml`

**Jobs:**

1. **backend-test** (5-8 min)
   - Install dependencies
   - Setup database (migrate + seed)
   - Run backend server
   - Execute health checks
   - Upload health report

2. **frontend-e2e** (10-15 min)
   - Install dependencies (backend + frontend)
   - Install Playwright browsers
   - Setup database
   - Start backend server
   - Run E2E tests
   - Upload test reports and screenshots

3. **build** (3-5 min)
   - Build backend (TypeScript compilation)
   - Build frontend (Vite build)
   - Upload build artifacts

4. **security-audit** (1-2 min)
   - Run npm audit on both projects
   - Report vulnerabilities

### Triggering CI

```bash
# Automatically runs on push/PR to main or develop
git push origin main

# Manual trigger via GitHub Actions UI
# Go to Actions → CI/CD → Run workflow
```

### Viewing Results

1. Go to GitHub repository
2. Click "Actions" tab
3. Select workflow run
4. View job logs and artifacts

**Artifacts Available:**
- `health-check-report`: JSON health check results (30 days retention)
- `playwright-report`: HTML test report (30 days)
- `playwright-screenshots`: Failure screenshots (30 days)
- `backend-build`: Compiled backend (dist/)
- `frontend-build`: Built frontend (dist/)

---

## 👥 Test Accounts

### Pre-seeded Accounts

**Admin Account:**
```
Email: admin@thaispa.com
Password: Admin@123
Role: admin
```

**User Account:**
```
Email: user@example.com
Password: User@123
Role: user
Status: verified
```

### Creating Test Accounts

**Via API:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "phone": "0812345678",
    "password": "Test@123"
  }'
```

**Via E2E Test:**
```typescript
const testUser = {
  email: `test+${Date.now()}@example.com`,
  password: 'Test@123'
};
```

### Email Verification

**Development Mode:**
- Check backend console logs for verification links
- Or directly update `is_verified` in database:
```sql
UPDATE users SET is_verified = 1 WHERE email = 'test@example.com';
```

**Production Testing:**
- Use email testing service (Mailhog, Mailtrap, Ethereal)
- Configure SMTP credentials in backend `.env`

---

## 🐛 Troubleshooting

### Backend Issues

**Issue**: Health check fails - "SMTP Connection failed"

**Solution:**
```bash
# Check SMTP credentials in backend/.env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Not regular password!

# Generate Gmail App Password:
# 1. Enable 2FA on Gmail
# 2. Go to: https://myaccount.google.com/apppasswords
# 3. Generate password for "Mail" app
# 4. Use generated password in SMTP_PASS
```

**Issue**: Health check fails - "Database migration state failed"

**Solution:**
```bash
cd backend
rm -f database.sqlite  # Reset database
npm run migrate
npm run seed
```

**Issue**: Rate limit check fails

**Solution:**
```bash
# Backend must be running for rate limit test
# Make sure no other process is hitting the API
npm run dev  # Start backend
npm run health  # Run checks
```

### Frontend E2E Issues

**Issue**: Playwright tests fail - "Browser not found"

**Solution:**
```bash
cd frontend
npx playwright install chromium
# Or install all browsers
npx playwright install
```

**Issue**: Tests timeout - "Waiting for locator"

**Solution:**
```typescript
// Increase timeout in playwright.config.ts
export default defineConfig({
  use: {
    actionTimeout: 15000,  // 15s instead of default 30s
  },
  timeout: 60000,  // Overall test timeout
});
```

**Issue**: Backend not running during E2E tests

**Solution:**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Run E2E tests
cd frontend
npm run test:e2e
```

### CI/CD Issues

**Issue**: GitHub Actions failing - "Database not found"

**Check workflow**:
```yaml
- name: Setup database
  working-directory: ./backend
  run: |
    npm run migrate
    npm run seed
```

**Issue**: E2E tests fail in CI but pass locally

**Common causes:**
- Timing issues (CI is slower)
- Missing `await` in test code
- Strict mode enabled in CI

**Solution:**
```typescript
// Use waitForLoadState
await page.waitForLoadState('networkidle');

// Add explicit waits
await expect(element).toBeVisible({ timeout: 10000 });

// Disable strict mode for flaky selectors
await page.locator('button').first().click();
```

---

## 📊 Test Coverage

### Current Coverage

| Category | Tests | Status |
|----------|-------|--------|
| Health Checks | 9 checks | ✅ Complete |
| API Endpoints | 30+ requests | ✅ Complete |
| User E2E Flows | 5 tests | ✅ Complete |
| Admin E2E Flows | 9 tests | ✅ Complete |
| CI/CD Pipeline | 4 jobs | ✅ Complete |

### Future Enhancements

- [ ] Add unit tests for utilities
- [ ] Add integration tests for controllers
- [ ] Add load testing with k6/Artillery
- [ ] Add visual regression testing
- [ ] Add accessibility testing (axe-core)
- [ ] Add mobile E2E tests (iOS/Android)

---

## 📞 Support

**Questions or Issues?**
- Check troubleshooting section above
- Review test logs in `frontend/test-results/`
- View health check JSON output: `npm run health:json`
- Check CI/CD artifacts in GitHub Actions

**Best Practices:**
1. Always run health checks before E2E tests
2. Use `test:e2e:ui` for debugging
3. Keep test data isolated (use unique emails)
4. Clean up test data after tests
5. Use proper selectors (avoid brittle selectors)
6. Add explicit waits for dynamic content
7. Take screenshots on failure
8. Use page.pause() for debugging

---

## 🎉 Summary

You now have a complete testing infrastructure:

✅ **Health Checks**: Verify system readiness (9 checks)  
✅ **API Testing**: Manual/automated API validation (30+ endpoints)  
✅ **E2E Testing**: Complete user flows (14 test scenarios)  
✅ **CI/CD**: Automated testing on every push  
✅ **Documentation**: Comprehensive testing guide  

**Quick Start Commands:**
```bash
# Health checks
cd backend && npm run health

# API testing
code backend/tests/api.http

# E2E testing
cd frontend && npm run test:e2e

# CI/CD
git push origin main  # Triggers workflow
```

Happy Testing! 🚀
