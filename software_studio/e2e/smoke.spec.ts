import { expect, test } from '@playwright/test'

test('the laptop starts up, then scrolling takes you inside to the dock', async ({ page }) => {
  await page.goto('/')
  const boot = page.getByRole('status', { name: /starting/i })
  await expect(boot).toBeVisible()
  await expect(boot).toBeHidden({ timeout: 10_000 })
  await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.3, behavior: 'instant' }))
  await expect(page.getByRole('link', { name: 'Websites' })).toBeInViewport()
  // the page never scrolls sideways
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
})

test.describe('inside the laptop', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
  })

  test('websites are tabs in one browser', async ({ page }) => {
    await page.getByRole('tab', { name: 'Opticalearn' }).click()
    await expect(page.getByRole('heading', { level: 3, name: 'Opticalearn' })).toBeVisible()
  })

  test('a project opens in its own window, and Esc closes it', async ({ page }) => {
    await page.getByRole('tab', { name: 'RagLabs' }).click()
    await page.locator('#apps').getByRole('button', { name: 'All details' }).click()
    const dialog = page.getByRole('dialog', { name: 'RagLabs' })
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('an idea typed on the home screen becomes a plan, and the plan becomes the message', async ({
    page,
  }) => {
    await page.getByLabel('I want to build').fill('a booking app for my clinic')
    await page.getByRole('button', { name: /plan it/i }).click()
    await expect(page.getByText('Book an appointment')).toBeVisible()
    await page.getByRole('button', { name: /send this plan/i }).click()
    await expect(page.getByLabel('Your message')).toHaveValue(
      /I want to build a booking app for my clinic\./,
    )
    await expect(page.getByRole('radio', { name: 'An app' })).toBeChecked()
    await expect(page.getByRole('button', { name: /send message/i })).toBeVisible()
  })
})

test('unknown routes show the 404 page', async ({ page }) => {
  await page.goto('/nope')
  await expect(page.getByText('404')).toBeVisible()
})
