import { expect, test } from '@playwright/test'

test.describe('group', async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/group')
  })

  test('groups are shown/hidden based on item matches', async ({ page }) => {
    await page.locator(`[cmdk-input]`).type('z')
    await expect(page.locator(`[cmdk-group][data-value="animals"]`)).not.toBeVisible()
    await expect(page.locator(`[cmdk-group][data-value="letters"]`)).toBeVisible()
  })
})
