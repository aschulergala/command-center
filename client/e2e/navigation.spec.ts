import { test, expect } from '@playwright/test'

/**
 * E2E tests for basic navigation and page structure
 */
test.describe('Navigation', () => {
  test('should navigate to tokens page by default', async ({ page }) => {
    await page.goto('/')

    // Should redirect to /tokens
    await expect(page).toHaveURL('/tokens')

    // Should show the page title
    await expect(page.getByRole('heading', { name: /tokens/i })).toBeVisible()
  })

  test('should navigate between sections', async ({ page }) => {
    await page.goto('/')

    // Click on NFTs tab
    await page.getByRole('link', { name: /nfts/i }).click()
    await expect(page).toHaveURL('/nfts')
    await expect(page.getByRole('heading', { name: /nfts/i })).toBeVisible()

    // Click on Creators tab
    await page.getByRole('link', { name: /creators/i }).click()
    await expect(page).toHaveURL('/creators')
    await expect(page.getByRole('heading', { name: /creators/i })).toBeVisible()

    // Click on Export tab
    await page.getByRole('link', { name: /export/i }).click()
    await expect(page).toHaveURL('/export')
  })

  test('should show wallet connect button', async ({ page }) => {
    await page.goto('/')

    // Should show connect wallet button
    await expect(page.getByRole('button', { name: /connect wallet/i })).toBeVisible()
  })

  test('should show empty state when wallet not connected', async ({ page }) => {
    await page.goto('/tokens')

    // Should show empty state or wallet prompt
    await expect(page.getByText(/connect your wallet/i)).toBeVisible()
  })
})

test.describe('Navigation - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should show mobile menu button', async ({ page }) => {
    await page.goto('/')

    // Should show hamburger menu on mobile
    await expect(page.getByRole('button', { name: /open menu/i })).toBeVisible()
  })
})
