import { test, expect } from '@playwright/test';
import { BASE_URL, CREDENTIALS } from './helpers';

test.describe('登录功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('应该显示登录页面', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('AI Sales Pro');
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('应该成功登录并跳转到仪表盘', async ({ page }) => {
    await page.fill('#username', CREDENTIALS.username);
    await page.fill('#password', CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('应该在密码错误时显示错误', async ({ page }) => {
    await page.fill('#username', CREDENTIALS.username);
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*login/);
  });

  test('应该在用户名不存在时显示错误', async ({ page }) => {
    await page.fill('#username', 'nonexistent');
    await page.fill('#password', CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*login/);
  });
});
