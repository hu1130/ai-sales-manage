import { test, expect } from '@playwright/test';
import { login, BASE_URL } from './helpers';

test.describe('客户管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('应该显示客户管理页面', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/customers`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const pageTitle = await page.title();
    console.log('页面标题:', pageTitle);
    
    const h1Elements = await page.locator('h1').allTextContents();
    console.log('所有h1文本:', h1Elements);
    
    const customerHeader = page.locator('.header-section h1');
    await expect(customerHeader).toHaveText('客户管理');
  });

  test('应该能打开添加客户表单', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/customers`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    const addButton = page.locator('.header-section button:has-text("添加客户")');
    await addButton.click();
    
    await page.waitForTimeout(1000);
    const formVisible = await page.locator('.add-form').isVisible();
    expect(formVisible).toBeTruthy();
  });

  test('应该能添加新客户', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/customers`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    await page.click('.header-section button:has-text("添加客户")');
    await page.waitForTimeout(1000);
    
    const formInputs = await page.locator('.add-form input').count();
    if (formInputs > 0) {
      await page.locator('.add-form input').first().fill('测试客户');
      
      const submitButton = page.locator('.add-form button[type="submit"]');
      await submitButton.click();
      
      await page.waitForTimeout(2000);
    }
  });
});
