
import { test, expect } from '@playwright/test';

test('Debug Application Render', async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
    page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));

    console.log('Navigating to home...');
    await page.goto('http://localhost:5173/');

    // Wait for body
    await page.waitForSelector('body');
    console.log('Body found.');

    const content = await page.content();
    console.log('Page Content Length:', content.length);
    // console.log(content);

    // Click Progress
    console.log('Clicking Progress...');
    const progressBtn = page.getByRole('button', { name: /Progress/i });
    if (await progressBtn.isVisible()) {
        await progressBtn.click();
        console.log('Clicked Progress.');
        await page.waitForTimeout(2000);
        const progressContent = await page.content();
        console.log('Progress Page Content Length:', progressContent.length);
        // console.log(progressContent);

        // Check for specific element
        const header = page.getByText('Sticker Book');
        if (await header.isVisible()) {
            console.log('Sticker Book Header Visible!');
        } else {
            console.log('Sticker Book Header NOT Visible.');
            // Check if "Start Your Journey" or something else is there
        }
    } else {
        console.log('Progress button not visible!');
    }
});
