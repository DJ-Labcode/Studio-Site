import { expect, test } from '@playwright/test'

test('home page renders and a case study route works', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('link', { name: /case study/i }).click()
  await expect(page).toHaveURL(/\/work\/hsc-it$/)
  await expect(page.getByRole('heading', { level: 1, name: 'HSC-iT' })).toBeVisible()
})

test('unknown routes show the 404 page', async ({ page }) => {
  await page.goto('/nope')
  await expect(page.getByText('404')).toBeVisible()
})
