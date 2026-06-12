import { test, expect } from '@playwright/test';
import { login, BASE_URL } from './helpers';

test.describe('仪表盘功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    
    // 强制导航到仪表盘页面（确保正确的路由）
    await page.goto(`${BASE_URL}/#/dashboard`);
    
    // 等待 URL 更新为仪表盘
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // 等待页面标题变为仪表盘
    await page.waitForFunction(() => {
      const h1 = document.querySelector('h1');
      return h1 && h1.textContent === '仪表盘';
    }, { timeout: 10000 });
    
    // 等待 loading 状态消失（表示数据已加载）
    await page.waitForSelector('.loading-overlay', { state: 'hidden', timeout: 10000 });
  });

  test('应该显示仪表盘页面', async ({ page }) => {
    // 获取第一个 h1 元素的文本
    const h1Text = await page.locator('h1').first().textContent();
    await expect(h1Text).toBe('仪表盘');
  });

  test('应该显示统计卡片', async ({ page }) => {
    // 等待统计卡片容器
    await page.waitForSelector('.stats-grid', { timeout: 10000 });
    
    const statsCards = page.locator('.stat-card');
    await expect(statsCards).toHaveCount(4);
  });

  test('应该显示 AI 洞察区域', async ({ page }) => {
    // 等待右侧面板或内容区域加载
    await page.waitForSelector('.dashboard-content', { timeout: 10000 });
    
    await expect(page.locator('text=AI 洞察')).toBeVisible();
  });

  test('应该显示团队表现区域', async ({ page }) => {
    // 等待右侧面板或内容区域加载
    await page.waitForSelector('.dashboard-content', { timeout: 10000 });
    
    await expect(page.locator('text=团队表现')).toBeVisible();
  });
});
