import { test, expect } from '@playwright/test'

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
]

test.describe('Responsive Layout', () => {
  for (const viewport of viewports) {
    test.describe(`at ${viewport.name} (${viewport.width}px)`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto('/')
      })

      test('all content is visible without horizontal scroll', async ({ page }) => {
        const body = page.locator('body')
        const scrollWidth = await body.evaluate((el) => el.scrollWidth)
        const clientWidth = await body.evaluate((el) => el.clientWidth)
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
      })

      test('header and main content are visible', async ({ page }) => {
        await expect(page.getByLabel('RetireCal')).toBeVisible()
        await expect(page.getByText('Current Age')).toBeVisible()
      })

      test('results section is accessible', async ({ page }) => {
        // Scroll to results if needed
        const resultsSection = page.locator('[data-testid="status-indicator"]')
        await resultsSection.scrollIntoViewIfNeeded()
        await expect(resultsSection).toBeVisible()
      })

      test('input fields are usable', async ({ page }) => {
        // Test that inputs can be focused and interacted with
        const incomeInput = page.getByLabel('Annual Income')
        await incomeInput.scrollIntoViewIfNeeded()
        await incomeInput.click()
        await expect(incomeInput).toBeFocused()
      })
    })
  }

  test.describe('Touch Targets', () => {
    test.beforeEach(async ({ page }) => {
      // Use mobile viewport for touch target tests
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
    })

    test('input fields have minimum 44px height on mobile', async ({ page }) => {
      const inputs = page.locator('input[data-slot="input"]')
      const count = await inputs.count()

      for (let i = 0; i < Math.min(count, 5); i++) {
        const box = await inputs.nth(i).boundingBox()
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44)
        }
      }
    })

    test('slider thumbs are visible and accessible', async ({ page }) => {
      // Slider thumbs should be at least 24px on mobile
      const thumbs = page.locator('[data-slot="slider-thumb"]')
      const count = await thumbs.count()

      for (let i = 0; i < count; i++) {
        const box = await thumbs.nth(i).boundingBox()
        if (box) {
          // 24px = size-6 on mobile
          expect(box.width).toBeGreaterThanOrEqual(24)
          expect(box.height).toBeGreaterThanOrEqual(24)
        }
      }
    })

    test('collapsible triggers meet minimum touch target', async ({ page }) => {
      // Find savings breakdown trigger
      const trigger = page.getByRole('button', { name: /current savings/i })
      const box = await trigger.boundingBox()

      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
    })
  })

  test.describe('Mobile Layout', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
    })

    test('sections stack vertically', async ({ page }) => {
      // On mobile, input sections should stack vertically
      const currentAge = page.getByText('Current Age')
      const retirementAge = page.getByText('Retirement Age')

      await currentAge.scrollIntoViewIfNeeded()
      const currentAgeBox = await currentAge.boundingBox()

      await retirementAge.scrollIntoViewIfNeeded()
      const retirementAgeBox = await retirementAge.boundingBox()

      if (currentAgeBox && retirementAgeBox) {
        // On mobile, retirement age should be below current age (higher Y)
        expect(retirementAgeBox.y).toBeGreaterThan(currentAgeBox.y)
      }
    })

    test('footer is accessible at bottom', async ({ page }) => {
      const footer = page.getByText('Disclaimer:')
      await footer.scrollIntoViewIfNeeded()
      await expect(footer).toBeVisible()
    })
  })

  test.describe('Desktop Layout', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.goto('/')
    })

    test('has appropriate max width', async ({ page }) => {
      const main = page.locator('main')
      const box = await main.boundingBox()

      if (box) {
        // Should use max-w-screen-xl (1280px) or similar
        expect(box.width).toBeLessThanOrEqual(1280 + 64) // Allow for padding
      }
    })

    test('uses grid layout for sections where applicable', async ({ page }) => {
      // The results metrics should be in a 3-column grid on desktop
      const metricsGrid = page.locator('.grid.sm\\:grid-cols-3')
      await expect(metricsGrid).toBeVisible()
    })
  })

  test.describe('Breakpoint Transitions', () => {
    test('layout adapts when resizing from mobile to desktop', async ({ page }) => {
      // Start at mobile
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      // Content should be visible
      await expect(page.getByText('Current Age')).toBeVisible()

      // Resize to desktop
      await page.setViewportSize({ width: 1440, height: 900 })

      // Content should still be visible
      await expect(page.getByText('Current Age')).toBeVisible()

      // No horizontal scroll should exist
      const body = page.locator('body')
      const scrollWidth = await body.evaluate((el) => el.scrollWidth)
      const clientWidth = await body.evaluate((el) => el.clientWidth)
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth)
    })
  })
})
