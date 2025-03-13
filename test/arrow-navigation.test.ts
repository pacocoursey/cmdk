import { expect, test } from '@playwright/test'

test.describe('arrowNavigationType - vertical (default)', async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/arrow-navigation?type=vertical')
  })

  test('vertical arrows change selected item', async ({ page }) => {
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'first')

    // Down arrow should work
    await page.locator(`[cmdk-input]`).press('ArrowDown')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'Item A')

    // Up arrow should work
    await page.locator(`[cmdk-input]`).press('ArrowUp')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'first')

    // Right arrow should NOT work
    await page.locator(`[cmdk-input]`).press('ArrowRight')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'first')

    // Left arrow should NOT work
    await page.locator(`[cmdk-input]`).press('ArrowLeft')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'first')
  })
})

test.describe('arrowNavigationType - horizontal', async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/arrow-navigation?type=horizontal')
  })

  test('horizontal arrows change selected item', async ({ page }) => {
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'first')

    // Down arrow should NOT work
    await page.locator(`[cmdk-input]`).press('ArrowDown')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'first')

    // Up arrow should NOT work
    await page.locator(`[cmdk-input]`).press('ArrowUp')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'first')

    // Right arrow should work
    await page.locator(`[cmdk-input]`).press('ArrowRight')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'Item A')

    // Left arrow should work
    await page.locator(`[cmdk-input]`).press('ArrowLeft')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'first')
  })

  test('horizontal navigation with modifier keys', async ({ page }) => {
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'first')

    // Meta+Right should go to last item
    await page.locator(`[cmdk-input]`).press('Meta+ArrowRight')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'last')

    // Meta+Left should go to first item
    await page.locator(`[cmdk-input]`).press('Meta+ArrowLeft')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'first')

    // Alt+Right should navigate to next group
    await page.locator(`[cmdk-input]`).press('Alt+ArrowRight')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'Item A')

    await page.locator(`[cmdk-input]`).press('Alt+ArrowRight')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'Item 1')
  })
})

test.describe('arrowNavigationType - both', async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/arrow-navigation?type=both')
  })

  test('all arrow keys change selected item', async ({ page }) => {
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'first')

    // Down arrow should work
    await page.locator(`[cmdk-input]`).press('ArrowDown')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'Item A')

    // Up arrow should work
    await page.locator(`[cmdk-input]`).press('ArrowUp')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'first')

    // Right arrow should work
    await page.locator(`[cmdk-input]`).press('ArrowRight')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'Item A')

    // Left arrow should work
    await page.locator(`[cmdk-input]`).press('ArrowLeft')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'first')
  })

  test('vim keybinds still work with both navigation types', async ({ page }) => {
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'first')

    // Test Ctrl+j (vim down)
    await page.locator(`[cmdk-input]`).press('Control+j')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'Item A')

    // Test Ctrl+k (vim up)
    await page.locator(`[cmdk-input]`).press('Control+k')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'first')

    // Test Ctrl+n (vim down)
    await page.locator(`[cmdk-input]`).press('Control+n')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'Item A')

    // Test Ctrl+p (vim up)
    await page.locator(`[cmdk-input]`).press('Control+p')
    await expect(page.locator(`[cmdk-item][aria-selected="true"]`)).toHaveAttribute('data-value', 'first')
  })
})
