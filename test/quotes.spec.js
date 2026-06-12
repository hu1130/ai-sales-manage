import { test, expect } from '@playwright/test';
import { login, BASE_URL } from './helpers';

test.describe('报价管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('应该显示报价管理页面', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/quotes`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const pageTitle = await page.title();
    console.log('页面标题:', pageTitle);
    
    const h1Elements = await page.locator('h1').allTextContents();
    console.log('所有h1文本:', h1Elements);
    
    const quotesHeader = page.locator('.header-section h1');
    await expect(quotesHeader).toHaveText('报价管理');
  });

  test('应该能打开创建报价表单', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/quotes`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    const createButton = page.locator('.header-section button:has-text("创建报价")');
    await createButton.click();
    
    await page.waitForTimeout(1000);
    const formVisible = await page.locator('.add-form').isVisible();
    expect(formVisible).toBeTruthy();
  });

  test('应该显示报价列表', async ({ page }) => {
    await page.goto(`${BASE_URL}/#/quotes`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    const table = page.locator('.data-table');
    await expect(table).toBeVisible();
  });
});
