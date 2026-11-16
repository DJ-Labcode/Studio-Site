import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'off',
    // set PW_CHROMIUM_PATH to use a browser that is already installed (otherwise run `npx playwright install chromium`)
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH }
      : {},
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
})
