import { expect, test } from '@playwright/test'

test.describe('group', async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/group')
  })

  test('groups are shown/hidden based on item matches', async ({ page }) => {
    await page.locator(`[cmdk-input]`).type('z')
    await expect(page.locator(`[cmdk-group][data-value="animals"]`)).not.toHaveCount(1)
    await expect(page.locator(`[cmdk-group][data-value="letters"]`)).toHaveCount(1)
  })

  test('group can be progressively rendered', async ({ page }) => {
    await expect(page.locator(`[cmdk-group][data-value="numbers"]`)).not.toHaveCount(1)
    await page.locator(`[cmdk-input]`).type('t')
    await expect(page.locator(`[cmdk-group][data-value="animals"]`)).not.toHaveCount(1)
    await expect(page.locator(`[cmdk-group][data-value="letters"]`)).not.toHaveCount(1)
    await expect(page.locator(`[cmdk-group][data-value="numbers"]`)).toHaveCount(1)
  })
})
