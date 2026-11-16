import { expect, test } from '@playwright/test'

test('home: the story runs from the hero to the contact form', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }),
  )
  await expect(page.getByRole('button', { name: /send project brief/i })).toBeVisible()
  // the page never scrolls sideways
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
})

test('the Blender version is available at /journey', async ({ page }) => {
  await page.goto('/journey')
  await expect(page.getByRole('status')).toBeHidden({ timeout: 15_000 })
  await expect(page.getByRole('heading', { level: 1 })).toBeAttached()
})

test('a case study route works', async ({ page }) => {
  await page.goto('/work/hsc-it')
  await expect(page.getByRole('heading', { level: 1, name: 'HSC-iT' })).toBeVisible()
})

test('unknown routes show the 404 page', async ({ page }) => {
  await page.goto('/nope')
  await expect(page.getByText('404')).toBeVisible()
})

test('the splash plays on the home page and hands over to the header logo', async ({ page }) => {
  await page.goto('/')
  const splash = page.getByRole('status', { name: /loading/i })
  await expect(splash).toBeVisible()
  await expect(splash).toBeHidden({ timeout: 10_000 })
  await expect(page.getByRole('link', { name: /duoforge home/i })).toBeVisible()
})

test('the answer picked on the home screen is already chosen on the contact ticket', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('link', { name: /an app/i }).click()
  await expect(page.getByRole('radio', { name: 'An app' })).toBeChecked()
})
