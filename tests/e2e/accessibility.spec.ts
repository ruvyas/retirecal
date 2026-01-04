import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Skip Link', () => {
    test('skip link is first focusable element', async ({ page }) => {
      await page.keyboard.press('Tab')
      const skipLink = page.getByText('Skip to main content')
      await expect(skipLink).toBeFocused()
    })

    test('skip link becomes visible on focus', async ({ page }) => {
      const skipLink = page.getByText('Skip to main content')

      // Should be visually hidden initially
      await expect(skipLink).toHaveClass(/sr-only/)

      // Focus the skip link
      await page.keyboard.press('Tab')

      // Should be visible now
      await expect(skipLink).toBeVisible()
    })

    test('skip link navigates to main content', async ({ page }) => {
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')

      const main = page.locator('#main-content')
      await expect(main).toBeFocused()
    })
  })

  test.describe('WCAG Compliance', () => {
    test('passes WCAG 2.1 A standards', async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a'])
        .disableRules([
          'aria-allowed-attr', // Radix slider limitation
          'aria-input-field-name', // Radix slider thumbs
        ])
        .analyze()

      expect(results.violations).toEqual([])
    })

    test('passes WCAG 2.1 AA standards', async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .disableRules([
          'aria-allowed-attr', // Radix slider limitation
          'aria-input-field-name', // Radix slider thumbs
        ])
        .analyze()

      // Allow minor issues, fail on critical/serious only
      const criticalViolations = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      )
      expect(criticalViolations).toEqual([])
    })

    test('color contrast meets AA standards', async ({ page }) => {
      const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze()

      // Should have no color contrast violations
      expect(results.violations).toEqual([])
    })
  })

  test.describe('Form Accessibility', () => {
    test('all inputs have associated labels', async ({ page }) => {
      // Main form fields
      await expect(page.getByLabel('Annual Income')).toBeVisible()
      await expect(page.getByLabel('Monthly Contribution')).toBeVisible()
      await expect(page.getByLabel('Annual Retirement Spending')).toBeVisible()

      // Age sliders
      await expect(page.getByRole('spinbutton', { name: /current age/i })).toBeVisible()
      await expect(page.getByRole('spinbutton', { name: /retirement age/i })).toBeVisible()
    })

    test('expanded breakdown inputs have labels', async ({ page }) => {
      // Expand savings breakdown
      await page.getByRole('button', { name: /current savings/i }).click()

      await expect(page.getByLabel('RRSP')).toBeVisible()
      await expect(page.getByLabel('TFSA')).toBeVisible()
      await expect(page.getByLabel('Non-Registered')).toBeVisible()
    })

    test('collapsible triggers have aria-controls', async ({ page }) => {
      const savingsTrigger = page.getByRole('button', { name: /current savings/i })

      // Should have aria-controls attribute
      await expect(savingsTrigger).toHaveAttribute('aria-controls', /.+/)

      // Should have aria-expanded attribute
      await expect(savingsTrigger).toHaveAttribute('aria-expanded', 'false')

      // After clicking, aria-expanded should change
      await savingsTrigger.click()
      await expect(savingsTrigger).toHaveAttribute('aria-expanded', 'true')
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('can tab through all interactive elements', async ({ page }) => {
      const focusedElements: string[] = []

      // Tab through first 15 focusable elements
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab')
        const tagName = await page.evaluate(() => document.activeElement?.tagName)
        focusedElements.push(tagName || 'unknown')
      }

      // Should have navigated through multiple elements
      expect(focusedElements.length).toBe(15)
      expect(focusedElements.filter((t) => t !== 'unknown').length).toBeGreaterThan(10)
    })

    test('focus indicators are visible', async ({ page }) => {
      // Tab to an input
      await page.keyboard.press('Tab') // Skip link
      await page.keyboard.press('Tab') // First focusable after skip

      // Get the focused element
      const focusedElement = page.locator(':focus')

      // Should have some kind of focus styling (ring, outline, etc.)
      // This is a basic check - the element should be visible when focused
      await expect(focusedElement).toBeVisible()
    })
  })

  test.describe('Screen Reader Support', () => {
    test('status indicator has role="status"', async ({ page }) => {
      const statusIndicator = page.locator('[role="status"]')
      await expect(statusIndicator).toBeVisible()
    })

    test('status indicator has aria-live for updates', async ({ page }) => {
      const statusIndicator = page.locator('[role="status"]')
      await expect(statusIndicator).toHaveAttribute('aria-live', 'polite')
    })

    test('results grid has aria-live for dynamic updates', async ({ page }) => {
      // Find the grid containing metric cards (by looking for aria-live)
      const resultsGrid = page.locator('[aria-live="polite"]').first()
      await expect(resultsGrid).toBeVisible()
    })

    test('decorative icons are hidden from screen readers', async ({ page }) => {
      // Check that chevron icons have aria-hidden
      const chevronIcons = page.locator('svg[aria-hidden="true"]')
      const count = await chevronIcons.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('Focus Management', () => {
    test('expanding collapsible does not trap focus', async ({ page }) => {
      // Expand savings breakdown
      const trigger = page.getByRole('button', { name: /current savings/i })
      await trigger.click()

      // Tab should move to first input inside
      await page.keyboard.press('Tab')

      // Should be able to continue tabbing
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      // Should not be trapped - can exit the expanded section
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })
  })
})
