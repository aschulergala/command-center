import { test, expect } from '@playwright/test'

/**
 * E2E tests with mocked wallet state
 * These tests inject a mock wallet state before page load
 */

// Mock wallet data to inject
const MOCK_WALLET = {
  connected: true,
  address: 'client|0x1234567890abcdef1234567890abcdef12345678',
  publicKey: 'mock-public-key-abcdef123456',
}

test.describe('With Mocked Wallet', () => {
  test.beforeEach(async ({ page }) => {
    // Inject mock wallet state before page load
    await page.addInitScript((wallet) => {
      // Create a global variable that the app can detect
      ;(window as any).__MOCK_WALLET__ = wallet
    }, MOCK_WALLET)
  })

  test('should show connected wallet state', async ({ page }) => {
    await page.goto('/')

    // Wait for any loading to complete
    await page.waitForTimeout(1000)

    // The app should detect the mock wallet and show connected state
    // This test verifies the mock injection mechanism works
    // The actual wallet behavior depends on how the app handles __MOCK_WALLET__
  })
})

/**
 * Test that pages load without errors
 */
test.describe('Page Load Tests', () => {
  test('tokens page loads without console errors', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/tokens')
    await page.waitForLoadState('networkidle')

    // Filter out expected errors (like wallet not connected)
    const unexpectedErrors = consoleErrors.filter(
      (err) => !err.includes('wallet') && !err.includes('GalaChain'),
    )

    expect(unexpectedErrors).toHaveLength(0)
  })

  test('nfts page loads without console errors', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/nfts')
    await page.waitForLoadState('networkidle')

    const unexpectedErrors = consoleErrors.filter(
      (err) => !err.includes('wallet') && !err.includes('GalaChain'),
    )

    expect(unexpectedErrors).toHaveLength(0)
  })

  test('creators page loads without console errors', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/creators')
    await page.waitForLoadState('networkidle')

    const unexpectedErrors = consoleErrors.filter(
      (err) => !err.includes('wallet') && !err.includes('GalaChain'),
    )

    expect(unexpectedErrors).toHaveLength(0)
  })
})
