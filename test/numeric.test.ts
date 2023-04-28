import { expect, test } from '@playwright/test'

test.describe('behavior for numeric values', async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/numeric')
  })

  test('items filter correctly on numeric inputs', async ({ page }) => {
    const input = page.locator(`[cmdk-input]`)
    await input.type('112')
    const removed = page.locator(`[cmdk-item][data-value="removed"]`)
    const remains = page.locator(`[cmdk-item][data-value="foo.bar112.value"]`)
    await expect(removed).toHaveCount(0)
    await expect(remains).toHaveCount(1)
  })

  test('items filter correctly on non-numeric inputs', async ({ page }) => {
    const input = page.locator(`[cmdk-input]`)
    await input.type('bar')
    const removed = page.locator(`[cmdk-item][data-value="removed"]`)
    const remains = page.locator(`[cmdk-item][data-value="foo.bar112.value"]`)
    await expect(removed).toHaveCount(0)
    await expect(remains).toHaveCount(1)
  })
})
