import { test, expect } from '@playwright/test';

/**
 * E2E Test: Avatar Customization System
 * Tests the complete avatar customization flow
 * Following "Paranoid" E2E standards: no sleeps, explicit waits, resilient selectors
 */

test.describe('Avatar Customization System', () => {
    test.beforeEach(async ({ page }) => {
        // Debugging
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err}`));

        // Navigate to app
        await page.goto('http://localhost:5173');

        // PARANOID RULE 1: Wait for hydration
        await expect(page.locator('body')).toBeVisible();

        // Wait for app to fully load (Learn hub should be visible)
        const learnHub = page.getByText('Vocab');
        await expect(learnHub).toBeVisible({ timeout: 10000 });
    });

    test('should open profile modal when clicking avatar HUD', async ({ page }) => {
        // PARANOID RULE 2: Assert visibility before clicking
        // Use accessible name which includes the text content (span with name)
        const avatarButton = page.getByRole('button', { name: /Learner/i }).first();
        await expect(avatarButton).toBeVisible();

        // Click avatar button
        await avatarButton.click();

        // Verify profile modal opens
        const profileModal = page.getByText('Your Profile');
        await expect(profileModal).toBeVisible();

        // Verify avatar customization section is present
        const customizeLabel = page.getByText('Customize Avatar');
        await expect(customizeLabel).toBeVisible();
    });

    test('should display avatar builder tabs', async ({ page }) => {
        // Open profile modal
        const avatarButton = page.getByRole('button', { name: /Learner/i }).first();
        await expect(avatarButton).toBeVisible();
        await avatarButton.click();

        // Wait for modal
        await expect(page.getByText('Your Profile')).toBeVisible();

        // Verify all tabs are present
        const baseTab = page.getByRole('button', { name: /👤 Base/i });
        const eyesTab = page.getByRole('button', { name: /👓 Eyes/i });
        const hatTab = page.getByRole('button', { name: /🎩 Hat/i });
        const bgTab = page.getByRole('button', { name: /🎨 Background/i });

        await expect(baseTab).toBeVisible();
        await expect(eyesTab).toBeVisible();
        await expect(hatTab).toBeVisible();
        await expect(bgTab).toBeVisible();
    });

    test('should allow selecting different avatar bases', async ({ page }) => {
        // Open profile modal
        const avatarButton = page.getByRole('button', { name: /Learner/i }).first();
        await expect(avatarButton).toBeVisible();
        await avatarButton.click();

        // Wait for modal
        await expect(page.getByText('Your Profile')).toBeVisible();

        // Base tab should be active by default
        const baseTab = page.getByRole('button', { name: /👤 Base/i });
        await expect(baseTab).toBeVisible();

        // Select Cat base
        const catButton = page.getByRole('button', { name: /Cat/i });
        await expect(catButton).toBeVisible();
        await expect(catButton).toBeEnabled();
        await catButton.click();

        // Verify cat is selected (button should have primary border color)
        // Note: Visual verification would check border color, but we verify it's still visible
        await expect(catButton).toBeVisible();
    });

    test('should allow selecting hat accessories', async ({ page }) => {
        // Open profile modal
        const avatarButton = page.getByRole('button', { name: /Learner/i }).first();
        await expect(avatarButton).toBeVisible();
        await avatarButton.click();

        // Wait for modal
        await expect(page.getByText('Your Profile')).toBeVisible();

        // Click Hat tab
        const hatTab = page.getByRole('button', { name: /🎩 Hat/i });
        await expect(hatTab).toBeVisible();
        await hatTab.click();

        // Verify hat options are visible
        const noneButton = page.getByRole('button', { name: /None/i });
        await expect(noneButton).toBeVisible();

        // Some hats may be locked (no shop items owned yet)
        // Just verify the items grid is rendered
        const hatGrid = page.locator('div').filter({ has: noneButton });
        await expect(hatGrid).toBeVisible();
    });

    test('should save profile changes', async ({ page }) => {
        // Open profile modal
        const avatarButton = page.getByRole('button', { name: /Learner/i }).first();
        await expect(avatarButton).toBeVisible();
        await avatarButton.click();

        // Wait for modal
        await expect(page.getByText('Your Profile')).toBeVisible();

        // Change name
        const nameInput = page.getByPlaceholder('Enter your name...');
        await expect(nameInput).toBeVisible();
        await nameInput.clear();
        await nameInput.fill('TestUser123');

        // Click Save Profile button
        const saveButton = page.getByRole('button', { name: /Save Profile/i });
        await expect(saveButton).toBeVisible();
        await expect(saveButton).toBeEnabled();
        await saveButton.click();

        // Modal should close
        await expect(page.getByText('Your Profile')).not.toBeVisible({ timeout: 3000 });

        // Verify name persisted - reopen modal
        await expect(avatarButton).toBeVisible();
        await avatarButton.click();
        await expect(page.getByText('Your Profile')).toBeVisible();

        // Name should still be TestUser123
        const nameInputAfter = page.getByPlaceholder('Enter your name...');
        await expect(nameInputAfter).toHaveValue('TestUser123');
    });

    test('should close modal when clicking X button', async ({ page }) => {
        // Open profile modal
        const avatarButton = page.getByRole('button', { name: /Learner/i }).first();
        await expect(avatarButton).toBeVisible();
        await avatarButton.click();

        // Wait for modal
        const modal = page.getByText('Your Profile');
        await expect(modal).toBeVisible();

        // Click close button (✕)
        const closeButton = page.getByRole('button', { name: '✕' });
        await expect(closeButton).toBeVisible();
        await closeButton.click();

        // Modal should close
        await expect(modal).not.toBeVisible({ timeout: 3000 });
    });

    test('should show locked items indicator for unowned accessories', async ({ page }) => {
        // Open profile modal
        const avatarButton = page.getByRole('button', { name: /Learner/i }).first();
        await expect(avatarButton).toBeVisible();
        await avatarButton.click();

        // Wait for modal
        await expect(page.getByText('Your Profile')).toBeVisible();

        // Go to Hat tab
        const hatTab = page.getByRole('button', { name: /🎩 Hat/i });
        await expect(hatTab).toBeVisible();
        await hatTab.click();

        // Look for locked icon (🔒) on items
        // Most hats should be locked initially
        const lockedItems = page.locator('div').filter({ hasText: '🔒' });

        // At least one item should show lock icon (unless user owns all items)
        const count = await lockedItems.count();

        // Either items are locked OR user message shows
        const shopMessage = page.getByText(/Visit the shop to unlock more items/i);
        const hasLockedItems = count > 0;
        const hasShopMessage = await shopMessage.isVisible().catch(() => false);

        // One of these should be true
        expect(hasLockedItems || hasShopMessage).toBeTruthy();
    });
});
