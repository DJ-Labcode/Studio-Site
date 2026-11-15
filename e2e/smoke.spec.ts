import { expect, test } from '@playwright/test'

test('home: the splash lifts and the hero is there', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('status')).toBeHidden({ timeout: 15_000 })
  await expect(page.getByRole('heading', { level: 1 })).toBeAttached()
  await expect(page.getByRole('link', { name: /start a project/i }).first()).toBeVisible()
})

test('home: scrolling reaches the ending', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('status')).toBeHidden({ timeout: 15_000 })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect(page.getByRole('link', { name: /forge my idea/i })).toBeVisible()
  // the page never scrolls sideways
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
})

test('a case study route works', async ({ page }) => {
  await page.goto('/work/hsc-it')
  await expect(page.getByRole('heading', { level: 1, name: 'HSC-iT' })).toBeVisible()
})

test('unknown routes show the 404 page', async ({ page }) => {
  await page.goto('/nope')
  await expect(page.getByText('404')).toBeVisible()
})
