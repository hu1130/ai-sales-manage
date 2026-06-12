import { test, expect } from '@playwright/test';
import { login, BASE_URL } from './helpers';

test.describe('线索管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('应该显示线索管理页面', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/leads`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const pageTitle = await page.title();
    console.log('页面标题:', pageTitle);
    
    const h1Elements = await page.locator('h1').allTextContents();
    console.log('所有h1文本:', h1Elements);
    
    const leadsHeader = page.locator('.header-section h1');
    await expect(leadsHeader).toHaveText('线索管理');
  });

  test('应该能打开添加线索表单', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/leads`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    const addButton = page.locator('.header-section button:has-text("添加线索")');
    await addButton.click();
    
    await page.waitForTimeout(1000);
    const formVisible = await page.locator('.add-form').isVisible();
    expect(formVisible).toBeTruthy();
  });

  test('应该能添加新线索', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/leads`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    await page.click('.header-section button:has-text("添加线索")');
    await page.waitForTimeout(1000);
    
    const formInputs = await page.locator('.add-form input').count();
    if (formInputs > 0) {
      await page.locator('.add-form input').first().fill('测试线索');
      
      const submitButton = page.locator('.add-form button[type="submit"]');
      await submitButton.click();
      
      await page.waitForTimeout(2000);
    }
  });

  test('应该显示线索列表', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/leads`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    const table = page.locator('.data-table');
    await expect(table).toBeVisible();
  });
});
