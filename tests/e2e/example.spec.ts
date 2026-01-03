import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Homepage', () => {
  test('should display the title', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('RetireCal')
  })

  test('should have no accessibility violations', async ({ page }) => {
    await page.goto('/')
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    expect(accessibilityScanResults.violations).toEqual([])
  })
})
