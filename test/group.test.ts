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

  test('group can be progressively rendered', async ({ page }) => {
    await expect(page.locator(`[cmdk-group][data-value="numbers"]`)).not.toBeVisible()
    await page.locator(`[cmdk-input]`).type('t')
    await expect(page.locator(`[cmdk-group][data-value="animals"]`)).not.toBeVisible()
    await expect(page.locator(`[cmdk-group][data-value="letters"]`)).not.toBeVisible()
    await expect(page.locator(`[cmdk-group][data-value="numbers"]`)).toBeVisible()
  })

  test('mounted group still rendered with filter using forceMount', async ({ page }) => {
    await page.locator(`data-testid=forceMount`).click()
    await page.locator(`[cmdk-input]`).type('Giraffe')
    await expect(page.locator(`[cmdk-group][data-value="letters"]`)).toBeVisible()
  })
})
