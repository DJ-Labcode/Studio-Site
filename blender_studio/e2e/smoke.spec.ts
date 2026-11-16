import { expect, test } from '@playwright/test'

test('home: the splash clears and the page runs to the contact form', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('status')).toBeHidden({ timeout: 15_000 })
  await expect(page.getByRole('heading', { level: 1 })).toBeAttached()
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }),
  )
  await expect(page.getByRole('button', { name: /send project brief/i })).toBeVisible()
})

test('a case study route works', async ({ page }) => {
  await page.goto('/work/hsc-it')
  await expect(page.getByRole('heading', { level: 1, name: 'HSC-iT' })).toBeVisible()
})

test('unknown routes show the 404 page', async ({ page }) => {
  await page.goto('/nope')
  await expect(page.getByText('404')).toBeVisible()
})
