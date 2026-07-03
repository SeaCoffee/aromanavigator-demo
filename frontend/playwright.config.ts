import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.e2e' });

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

/**
 * РЈ С‚РµР±СЏ Next СЃРµР№С‡Р°СЃ С‡Р°СЃС‚Рѕ РєСЂСѓС‚РёС‚СЃСЏ С‡РµСЂРµР· Docker.
 * РџРѕСЌС‚РѕРјСѓ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ Playwright РќР• СЃС‚Р°СЂС‚СѓРµС‚ npm run dev СЃР°Рј.
 *
 * РџРµСЂРµРґ С‚РµСЃС‚Р°РјРё Р·Р°РїСѓСЃС‚Рё:
 * docker compose up -d app nextapp celery redis db
 *
 * Р•СЃР»Рё РєРѕРіРґР°-С‚Рѕ Р·Р°С…РѕС‡РµС€СЊ Р·Р°РїСѓСЃРєР°С‚СЊ Next РёР· Playwright:
 * E2E_START_NEXT=true npm run test:e2e
 */
const shouldStartNext = process.env.E2E_START_NEXT === 'true';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: shouldStartNext
    ? {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      }
    : undefined,

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
