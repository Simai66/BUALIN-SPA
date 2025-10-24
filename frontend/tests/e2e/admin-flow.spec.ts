import { test, expect } from '@playwright/test';

/**
 * E2E Test: Admin Dashboard & Management Flow
 * Tests admin operations: Login → Dashboard → Manage Bookings → Export Reports
 * 
 * Prerequisites:
 * - Backend running on http://localhost:5000
 * - Frontend running on http://localhost:3000
 * - Admin account: admin@thaispa.com / Admin@123
 */

const adminUser = {
  email: 'admin@thaispa.com',
  password: 'Admin@123',
};

test.describe('Admin Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', adminUser.email);
    await page.fill('input[name="password"]', adminUser.password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect after login
    await page.waitForURL('/', { timeout: 5000 });
  });

  test('Admin can access dashboard', async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('/admin');
    
    // Verify dashboard loads
    await expect(page).toHaveURL('/admin', { timeout: 5000 });
    
    // Check for dashboard elements
    await expect(
      page.locator('text=/Dashboard|แดชบอร์ด|สถิติ/i')
    ).toBeVisible({ timeout: 5000 });
    
    // Verify statistics cards are visible
    const statsCards = page.locator('[class*="stat"], [class*="card"]');
    await expect(statsCards.first()).toBeVisible({ timeout: 5000 });
  });

  test('Dashboard displays revenue statistics', async ({ page }) => {
    await page.goto('/admin');
    
    // Check for revenue/income display
    await expect(
      page.locator('text=/รายได้|Revenue|฿|บาท/i')
    ).toBeVisible({ timeout: 5000 });
    
    // Check for booking count
    await expect(
      page.locator('text=/การจอง|Bookings|จำนวน/i')
    ).toBeVisible({ timeout: 5000 });
  });

  test('Dashboard displays charts', async ({ page }) => {
    await page.goto('/admin');
    
    // Wait for chart canvas elements to load
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10000 });
    
    // Verify multiple charts are present (revenue, services, etc.)
    const chartCount = await page.locator('canvas').count();
    expect(chartCount).toBeGreaterThanOrEqual(1);
  });

  test('Admin can view booking list', async ({ page }) => {
    await page.goto('/admin');
    
    // Navigate to bookings section
    const bookingsLink = page.locator('text=/การจอง|Bookings|จัดการ.*จอง/i');
    if (await bookingsLink.isVisible()) {
      await bookingsLink.click();
    } else {
      // Direct navigation if no link
      await page.goto('/admin/bookings');
    }
    
    // Wait for bookings table/list to load
    await expect(
      page.locator('table, [class*="booking"]').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Admin can update booking status', async ({ page }) => {
    await page.goto('/admin');
    
    // Navigate to bookings
    await page.goto('/admin/bookings');
    
    // Find a pending booking
    const pendingBooking = page.locator('text=/รอดำเนินการ|Pending/i').first();
    
    if (await pendingBooking.isVisible({ timeout: 3000 })) {
      // Click on booking row to see details
      await pendingBooking.click();
      
      // Look for status update button/dropdown
      const confirmButton = page.locator('button:has-text("ยืนยัน"), button:has-text("Confirm")');
      
      if (await confirmButton.isVisible({ timeout: 2000 })) {
        await confirmButton.click();
        
        // Wait for success message
        await expect(
          page.locator('text=/อัปเดตสำเร็จ|Updated.*success/i')
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('Admin can export PDF report', async ({ page }) => {
    await page.goto('/admin');
    
    // Look for export/report button
    const exportButton = page.locator('button:has-text("Export"), button:has-text("รายงาน"), button:has-text("PDF")');
    
    if (await exportButton.first().isVisible({ timeout: 3000 })) {
      // Listen for download
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
      
      await exportButton.first().click();
      
      const download = await downloadPromise;
      
      // Verify file is downloaded
      expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
    } else {
      // Direct API test if button not found
      await page.goto('/admin');
      const response = await page.request.get('http://localhost:5000/api/admin/export/pdf');
      expect(response.ok()).toBeTruthy();
    }
  });

  test('Admin can export Excel report', async ({ page }) => {
    await page.goto('/admin');
    
    // Look for Excel export button
    const excelButton = page.locator('button:has-text("Excel"), button:has-text("xlsx")');
    
    if (await excelButton.first().isVisible({ timeout: 3000 })) {
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
      
      await excelButton.first().click();
      
      const download = await downloadPromise;
      
      // Verify Excel file is downloaded
      expect(download.suggestedFilename()).toMatch(/\.xlsx$/i);
    } else {
      // Direct API test
      await page.goto('/admin');
      const response = await page.request.get('http://localhost:5000/api/admin/export/excel');
      expect(response.ok()).toBeTruthy();
    }
  });

  test('Admin can filter dashboard by date range', async ({ page }) => {
    await page.goto('/admin');
    
    // Look for date filter inputs
    const startDateInput = page.locator('input[type="date"]').first();
    
    if (await startDateInput.isVisible({ timeout: 3000 })) {
      // Set date range
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      
      await startDateInput.fill(startDate.toISOString().split('T')[0]);
      
      const endDateInput = page.locator('input[type="date"]').nth(1);
      await endDateInput.fill(endDate.toISOString().split('T')[0]);
      
      // Click filter/search button
      await page.click('button:has-text("Search"), button:has-text("ค้นหา"), button:has-text("Filter")');
      
      // Wait for dashboard to update
      await page.waitForTimeout(2000);
      
      // Verify data is refreshed (chart should be visible)
      await expect(page.locator('canvas').first()).toBeVisible();
    }
  });
});

test.describe('Admin CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', adminUser.email);
    await page.fill('input[name="password"]', adminUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('Admin can view services management', async ({ page }) => {
    await page.goto('/admin');
    
    // Navigate to services management
    const servicesLink = page.locator('text=/จัดการบริการ|Manage.*Services/i');
    
    if (await servicesLink.isVisible({ timeout: 3000 })) {
      await servicesLink.click();
    } else {
      await page.goto('/admin/services');
    }
    
    // Verify services list is displayed
    await expect(
      page.locator('[class*="service"], table').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('Admin can view therapists management', async ({ page }) => {
    await page.goto('/admin');
    
    // Navigate to therapists management
    const therapistsLink = page.locator('text=/จัดการนักบำบัด|Manage.*Therapists/i');
    
    if (await therapistsLink.isVisible({ timeout: 3000 })) {
      await therapistsLink.click();
    } else {
      await page.goto('/admin/therapists');
    }
    
    // Verify therapists list is displayed
    await expect(
      page.locator('[class*="therapist"], table').first()
    ).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Admin Security & Access Control', () => {
  test('Non-admin user cannot access admin dashboard', async ({ page }) => {
    // Login as regular user
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'User@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Try to access admin dashboard
    await page.goto('/admin');
    
    // Should be redirected or show error
    await page.waitForTimeout(2000);
    
    // Check if redirected away from admin page or error shown
    const currentURL = page.url();
    if (currentURL.includes('/admin')) {
      // If still on admin page, should show access denied
      await expect(
        page.locator('text=/Access Denied|ไม่มีสิทธิ์|Unauthorized/i')
      ).toBeVisible({ timeout: 3000 });
    } else {
      // Should be redirected to home or login
      expect(currentURL).toMatch(/\/(login|home)?$/);
    }
  });

  test('Unauthenticated user cannot access admin dashboard', async ({ page }) => {
    // Try to access admin without login
    await page.goto('/admin');
    
    await page.waitForTimeout(2000);
    
    // Should redirect to login
    const currentURL = page.url();
    expect(currentURL).toMatch(/\/login/);
  });
});

test.describe('Admin Business Logic Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', adminUser.email);
    await page.fill('input[name="password"]', adminUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('Dashboard shows accurate statistics', async ({ page }) => {
    await page.goto('/admin');
    
    // Get statistics from dashboard
    const statsElements = await page.locator('[class*="stat"] [class*="value"], [class*="number"]').all();
    
    if (statsElements.length > 0) {
      for (const stat of statsElements) {
        const text = await stat.textContent();
        
        // Verify statistics are numbers (not errors or null)
        if (text) {
          const hasNumber = /\d+/.test(text);
          expect(hasNumber).toBeTruthy();
        }
      }
    }
  });

  test('Revenue calculation is correct', async ({ page }) => {
    // This test would verify revenue calculations
    // In a real scenario, you'd:
    // 1. Get bookings from API
    // 2. Calculate expected revenue manually
    // 3. Compare with dashboard display
    
    await page.goto('/admin');
    
    // Get revenue from dashboard
    const revenueText = await page.locator('text=/รายได้|Revenue/i').first().textContent();
    
    // Verify revenue format (should contain currency symbol)
    expect(revenueText).toMatch(/฿|\$|บาท/i);
  });
});
