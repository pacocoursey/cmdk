import { expect, test } from '@playwright/test'

test.describe('basic behavior', async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('input props are forwarded', async ({ page }) => {
    const input = page.locator(`input[placeholder="Search…"]`)
    await expect(input).toHaveCount(1)
  })

  test('item value is derived from textContent', async ({ page }) => {
    const item = page.locator(`[cmdk-item][data-value="item"]`)
    await expect(item).toHaveText('Item')
  })

  test('item value prop is preferred over textContent', async ({ page }) => {
    const item = page.locator(`[cmdk-item][data-value="xxx"]`)
    await expect(item).toHaveText('Value')
  })

  test('item onSelect is called on click', async ({ page }) => {
    const item = page.locator(`[cmdk-item][data-value="item"]`)
    const [message] = await Promise.all([page.waitForEvent('console'), item.click()])
    expect(message.text()).toEqual('Item selected')
  })

  test('first item is selected by default', async ({ page }) => {
    const item = page.locator(`[cmdk-item][aria-selected]`)
    await expect(item).toHaveText('Item')
  })

  test('first item is selected when search changes', async ({ page }) => {
    const input = page.locator(`[cmdk-input]`)
    await input.type('x')
    const selected = page.locator(`[cmdk-item][aria-selected]`)
    await expect(selected).toHaveText('Value')
  })

  test('items filter when searching', async ({ page }) => {
    const input = page.locator(`[cmdk-input]`)
    await input.type('x')
    const removed = page.locator(`[cmdk-item][data-value="item"]`)
    const remains = page.locator(`[cmdk-item][data-value="xxx"]`)
    await expect(removed).toHaveCount(0)
    await expect(remains).toHaveCount(1)
  })

  test('items filter when searching by keywords', async ({ page }) => {
    const input = page.locator(`[cmdk-input]`)
    await input.type('key')
    const removed = page.locator(`[cmdk-item][data-value="xxx"]`)
    const remains = page.locator(`[cmdk-item][data-value="item"]`)
    await expect(removed).toHaveCount(0)
    await expect(remains).toHaveCount(1)
  })

  test('empty component renders when there are no results', async ({ page }) => {
    const input = page.locator('[cmdk-input]')
    await input.type('z')
    await expect(page.locator(`[cmdk-item]`)).toHaveCount(0)
    await expect(page.locator(`[cmdk-empty]`)).toHaveText('No results.')
  })

  test('className is applied to each part', async ({ page }) => {
    await expect(page.locator(`.root`)).toHaveCount(1)
    await expect(page.locator(`.input`)).toHaveCount(1)
    await expect(page.locator(`.list`)).toHaveCount(1)
    await expect(page.locator(`.item`)).toHaveCount(2)
    await page.locator('[cmdk-input]').type('zzzz')
    await expect(page.locator(`.item`)).toHaveCount(0)
    await expect(page.locator(`.empty`)).toHaveCount(1)
  })
})
