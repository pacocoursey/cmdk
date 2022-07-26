import { expect, test } from '@playwright/test'

test.describe('item', async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/item')
  })

  test('mounted item matches search', async ({ page }) => {
    await page.locator(`[cmdk-input]`).type('b')
    await expect(page.locator(`[cmdk-item]`)).toHaveCount(0)
    await page.locator(`data-testid=mount`).click()
    await expect(page.locator(`[cmdk-item]`)).toHaveText('B')
  })

  test('mounted item does not match search', async ({ page }) => {
    await page.locator(`[cmdk-input]`).type('z')
    await expect(page.locator(`[cmdk-item]`)).toHaveCount(0)
    await page.locator(`data-testid=mount`).click()
    await expect(page.locator(`[cmdk-item]`)).toHaveCount(0)
  })

  test('unmount item that is selected', async ({ page }) => {
    await page.locator(`data-testid=mount`).click()
    await expect(page.locator(`[cmdk-item][aria-selected]`)).toHaveText('A')
    await page.locator(`data-testid=unmount`).click()
    await expect(page.locator(`[cmdk-item]`)).toHaveCount(1)
    await expect(page.locator(`[cmdk-item][aria-selected]`)).toHaveText('B')
  })

  test('unmount item that is the only result', async ({ page }) => {
    await page.locator(`data-testid=unmount`).click()
    await expect(page.locator(`[cmdk-item]`)).toHaveCount(0)
  })

  test('mount item that is the only result', async ({ page }) => {
    await page.locator(`data-testid=unmount`).click()
    await expect(page.locator(`[cmdk-empty]`)).toHaveCount(1)
    await page.locator(`data-testid=mount`).click()
    await expect(page.locator(`[cmdk-empty]`)).toHaveCount(0)
    await expect(page.locator(`[cmdk-item]`)).toHaveCount(1)
  })
})
