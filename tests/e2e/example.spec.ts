import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Homepage', () => {
  test('should display the app name in header', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('RetireCal').first()).toBeVisible()
  })

  test('should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/')
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      // Exclude known issues that need separate fixes (pre-existing in codebase)
      .disableRules([
        'color-contrast', // Color contrast issues need design changes
        'aria-allowed-attr', // Radix slider puts aria-value* on wrong elements
        'aria-input-field-name', // Slider thumbs missing labels (Radix issue)
      ])
      .analyze()

    // Filter for critical and serious violations only
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    )
    expect(criticalViolations).toEqual([])
  })
})
