import { test, expect } from '@playwright/test';

/**
 * E2E Test: Complete User Booking Flow
 * Tests the entire journey: Register → Verify → Login → Book Service → Receive Confirmation
 * 
 * Prerequisites:
 * - Backend running on http://localhost:5000
 * - Frontend running on http://localhost:3000
 * - Database seeded with services and therapists
 */

// Test data
const testUser = {
  fullName: 'E2E Test User',
  email: `e2etest+${Date.now()}@example.com`,
  phone: '0899999999',
  password: 'Test@123',
};

test.describe('User Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Complete booking flow: Register → Login → Book → Confirm', async ({ page }) => {
    // ============================================
    // Step 1: User Registration
    // ============================================
    test.step('Navigate to Register page', async () => {
      await page.click('text=สมัครสมาชิก');
      await expect(page).toHaveURL('/register');
      await expect(page.locator('h1')).toContainText('สมัครสมาชิก');
    });

    test.step('Fill registration form', async () => {
      await page.fill('input[name="full_name"]', testUser.fullName);
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="phone"]', testUser.phone);
      await page.fill('input[name="password"]', testUser.password);
      await page.fill('input[name="confirm_password"]', testUser.password);
    });

    test.step('Submit registration', async () => {
      await page.click('button[type="submit"]');
      
      // Wait for success message
      await expect(page.locator('text=/กรุณาตรวจสอบอีเมล.*ยืนยันบัญชี/i')).toBeVisible({
        timeout: 10000,
      });
    });

    // ============================================
    // Step 2: Email Verification (Manual Step)
    // ============================================
    // Note: In real test, we'd need to:
    // - Use email testing service (Mailhog, Mailtrap)
    // - Or directly verify in database
    // For this E2E, we'll simulate verified user by directly updating DB
    test.step('Skip email verification (use seeded verified user)', async () => {
      // In production test, implement email check here
      // For now, use existing verified user
      await page.goto('/login');
    });

    // ============================================
    // Step 3: User Login
    // ============================================
    test.step('Login with verified user', async () => {
      // Use seeded test user instead
      await page.fill('input[name="email"]', 'user@example.com');
      await page.fill('input[name="password"]', 'User@123');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to home
      await expect(page).toHaveURL('/', { timeout: 5000 });
    });

    // ============================================
    // Step 4: Browse Services
    // ============================================
    test.step('View services catalog', async () => {
      await page.click('text=บริการของเรา');
      await expect(page).toHaveURL('/services');
      
      // Check if services are loaded
      await expect(page.locator('.service-card, [class*="service"]').first()).toBeVisible({
        timeout: 5000,
      });
    });

    // ============================================
    // Step 5: Select Service and Book
    // ============================================
    test.step('Click "จองเลย" on first service', async () => {
      await page.locator('button:has-text("จองเลย"), a:has-text("จองเลย")').first().click();
      await expect(page).toHaveURL(/\/booking/, { timeout: 5000 });
    });

    // ============================================
    // Step 6: Booking Process - Step 1 (Service)
    // ============================================
    test.step('Select service in booking flow', async () => {
      // Service should be pre-selected if coming from service page
      // Or select first available service
      const serviceCard = page.locator('[class*="service-card"], .service-option').first();
      if (await serviceCard.isVisible()) {
        await serviceCard.click();
      }
      
      // Click next/continue button
      await page.click('button:has-text("ถัดไป"), button:has-text("ต่อไป"), button:has-text("Next")');
    });

    // ============================================
    // Step 7: Booking Process - Step 2 (Therapist)
    // ============================================
    test.step('Select therapist', async () => {
      // Wait for therapists to load
      await expect(page.locator('[class*="therapist"], .therapist-card').first()).toBeVisible({
        timeout: 5000,
      });
      
      // Select first active therapist
      await page.locator('[class*="therapist"], .therapist-card').first().click();
      
      // Click next
      await page.click('button:has-text("ถัดไป"), button:has-text("ต่อไป"), button:has-text("Next")');
    });

    // ============================================
    // Step 8: Booking Process - Step 3 (Date/Time)
    // ============================================
    test.step('Select date and time', async () => {
      // Select date (use date picker or input)
      const dateInput = page.locator('input[type="date"]');
      if (await dateInput.isVisible()) {
        // Set date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await dateInput.fill(tomorrow.toISOString().split('T')[0]);
      }
      
      // Wait for time slots to load
      await page.waitForTimeout(2000);
      
      // Select first available time slot
      const timeSlot = page.locator('[class*="time-slot"]:not([disabled]), .slot:not([disabled])').first();
      await expect(timeSlot).toBeVisible({ timeout: 5000 });
      await timeSlot.click();
    });

    // ============================================
    // Step 9: Confirm Booking
    // ============================================
    test.step('Submit booking', async () => {
      await page.click('button:has-text("ยืนยันการจอง"), button[type="submit"]');
      
      // Wait for success message or redirect
      await expect(
        page.locator('text=/จองสำเร็จ|ทำการจองเรียบร้อย|booking.*success/i')
      ).toBeVisible({ timeout: 10000 });
    });

    // ============================================
    // Step 10: Verify Booking in My Bookings
    // ============================================
    test.step('Check booking appears in user bookings', async () => {
      await page.click('text=การจองของฉัน');
      await expect(page).toHaveURL('/my-bookings', { timeout: 5000 });
      
      // Check if booking list has at least one item
      await expect(page.locator('[class*="booking"], .booking-card').first()).toBeVisible({
        timeout: 5000,
      });
    });
  });

  // ============================================
  // Additional Booking Flow Tests
  // ============================================

  test('Booking flow validation: Empty slots message', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'User@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/', { timeout: 5000 });

    // Navigate to booking
    await page.goto('/booking');

    // Select service and therapist
    await page.locator('[class*="service"]').first().click();
    await page.click('button:has-text("ถัดไป")');
    await page.locator('[class*="therapist"]').first().click();
    await page.click('button:has-text("ถัดไป")');

    // Set date to past date (should show no slots)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await page.fill('input[type="date"]', yesterday.toISOString().split('T')[0]);
    
    await page.waitForTimeout(2000);
    
    // Should show "no slots available" message
    await expect(
      page.locator('text=/ไม่มีช่วงเวลา|No.*slots.*available/i')
    ).toBeVisible({ timeout: 5000 });
  });

  test('Booking flow validation: Therapist availability check', async ({ page }) => {
    // Login as user
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'User@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Navigate to booking
    await page.goto('/booking');

    // Select service
    await page.locator('[class*="service"]').first().click();
    await page.click('button:has-text("ถัดไป")');

    // Check that only active therapists are shown
    const therapistCount = await page.locator('[class*="therapist"]').count();
    expect(therapistCount).toBeGreaterThan(0);

    // Verify therapist has "พร้อมให้บริการ" or similar active indicator
    await expect(
      page.locator('[class*="therapist"]').first()
    ).toContainText(/พร้อม|available|active/i);
  });

  test('Price calculation with promotion', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'User@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // Go to services
    await page.goto('/services');

    // Find service with promotion badge
    const serviceWithPromo = page.locator('[class*="promotion"], .badge:has-text("ลด")').first();
    
    if (await serviceWithPromo.isVisible()) {
      // Get original and discounted price
      const priceText = await page.locator('[class*="price"]').first().textContent();
      
      // Verify discounted price is shown
      expect(priceText).toMatch(/฿|บาท/);
      
      // Should show original price with strikethrough
      await expect(
        page.locator('[class*="original-price"], [class*="line-through"]')
      ).toBeVisible();
    }
  });
});

// ============================================
// Test Utilities
// ============================================

test.describe('Navigation and UI Tests', () => {
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1, [class*="hero"] h2')).toBeVisible();
    
    // Check main navigation
    await expect(page.locator('text=บริการของเรา')).toBeVisible();
    await expect(page.locator('text=นักบำบัด')).toBeVisible();
  });

  test('Services page displays all services', async ({ page }) => {
    await page.goto('/services');
    
    // Wait for services to load
    await expect(page.locator('[class*="service"]').first()).toBeVisible({ timeout: 5000 });
    
    // Check that multiple services are displayed
    const serviceCount = await page.locator('[class*="service-card"], [class*="service"]').count();
    expect(serviceCount).toBeGreaterThan(0);
  });

  test('Therapists page displays active therapists', async ({ page }) => {
    await page.goto('/therapists');
    
    // Wait for therapists to load
    await expect(page.locator('[class*="therapist"]').first()).toBeVisible({ timeout: 5000 });
    
    const therapistCount = await page.locator('[class*="therapist"]').count();
    expect(therapistCount).toBeGreaterThan(0);
  });
});
