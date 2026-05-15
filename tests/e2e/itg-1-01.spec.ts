import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("ダッシュボード", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // ログイン処理（実装に応じて調整）
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-001: ダッシュボード画面が正常表示される', async ({ page }) => {
    // SCEN-001
    await expect(page.locator('h1')).toContainText('ダッシュボード');
    await expect(page.locator('[data-testid="demand-forecast-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="inventory-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="navigation-menu"]')).toBeVisible();
  });

  test('SCEN-002: ヘッダーナビゲーションで各画面に遷移できる', async ({ page }) => {
    // SCEN-002
    await page.click('[data-testid="nav-demand-forecast"]');
    await page.waitForURL('**/demand-forecast');
    
    await page.click('[data-testid="nav-order-management"]');
    await page.waitForURL('**/order-management');
    
    await page.click('[data-testid="nav-inventory-management"]');
    await page.waitForURL('**/inventory-management');
    
    await page.click('[data-testid="nav-dashboard"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-003: 店舗選択でデータが切り替わる', async ({ page }) => {
    // SCEN-003
    const initialData = await page.locator('[data-testid="store-data"]').textContent();
    await page.selectOption('[data-testid="store-selector"]', '店舗B');
    await page.waitForLoadState('networkidle');
    const updatedData = await page.locator('[data-testid="store-data"]').textContent();
    expect(updatedData).not.toBe(initialData);
  });

  test('SCEN-004: 期間選択でデータが更新される', async ({ page }) => {
    // SCEN-004
    const initialChart = await page.locator('[data-testid="chart-data"]').textContent();
    await page.selectOption('[data-testid="period-selector"]', '過去1ヶ月');
    await page.waitForLoadState('networkidle');
    const updatedChart = await page.locator('[data-testid="chart-data"]').textContent();
    expect(updatedChart).not.toBe(initialChart);
  });

  test('SCEN-005: 売上実績サマリーが正常表示される', async ({ page }) => {
    // SCEN-005
    await expect(page.locator('[data-testid="sales-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="sales-period-selector"]')).toBeVisible();
    await expect(page.locator('[data-testid="sales-amount"]')).toBeVisible();
    await expect(page.locator('[data-testid="sales-chart"]')).toBeVisible();
  });

  test('SCEN-006: 需要予測精度指標が正常表示される', async ({ page }) => {
    // SCEN-006
    await expect(page.locator('[data-testid="forecast-accuracy"]')).toBeVisible();
    await expect(page.locator('[data-testid="mape-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="rmse-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="accuracy-trend-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="update-time"]')).toBeVisible();
  });

  test('SCEN-007: 発注状況ステータスが正常表示される', async ({ page }) => {
    // SCEN-007
    await expect(page.locator('[data-testid="order-status-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-counts"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-icons"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-update-time"]')).toBeVisible();
  });

  test('SCEN-008: 在庫アラート通知が正常表示される', async ({ page }) => {
    // SCEN-008
    await expect(page.locator('[data-testid="inventory-alerts"]')).toBeVisible();
    await expect(page.locator('[data-testid="alert-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="alert-priority"]')).toBeVisible();
  });

  test('SCEN-009: 売上トレンドグラフが描画される', async ({ page }) => {
    // SCEN-009
    await expect(page.locator('[data-testid="sales-trend-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-x-axis"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-y-axis"]')).toBeVisible();
  });

  test('SCEN-010: 商品別売上ランキングが表示される', async ({ page }) => {
    // SCEN-010
    await expect(page.locator('[data-testid="product-ranking"]')).toBeVisible();
    const firstRank = page.locator('[data-testid="rank-1"]');
    const secondRank = page.locator('[data-testid="rank-2"]');
    await expect(firstRank).toBeVisible();
    await expect(secondRank).toBeVisible();
  });

  test('SCEN-011: 天候影響分析チャートが描画される', async ({ page }) => {
    // SCEN-011
    await expect(page.locator('[data-testid="weather-analysis-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="weather-data"]')).toBeVisible();
  });

  test('SCEN-012: イベント・季節要因が表示される', async ({ page }) => {
    // SCEN-012
    await expect(page.locator('[data-testid="event-seasonal-factors"]')).toBeVisible();
    await expect(page.locator('[data-testid="event-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="seasonal-info"]')).toBeVisible();
  });

  test('SCEN-013: 権限なし店舗選択でエラー表示', async ({ page }) => {
    // SCEN-013
    await page.selectOption('[data-testid="store-selector"]', 'unauthorized-store');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('この店舗にアクセスする権限がありません');
  });

  test('SCEN-014: 無効な期間選択でエラー表示', async ({ page }) => {
    // SCEN-014
    await page.fill('[data-testid="start-date"]', '2024-12-31');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.click('[data-testid="apply-period"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('開始日は終了日より前の日付を選択してください');
  });

  test('SCEN-015: データ取得失敗でエラーメッセージ表示', async ({ page }) => {
    // SCEN-015
    await page.route('**/api/**', route => route.abort());
    await page.reload();
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-016: ネットワークエラー時の表示', async ({ page }) => {
    // SCEN-016
    await page.route('**/*', route => route.abort());
    await page.reload();
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
  });

  test('SCEN-017: 過去最大期間選択での動作', async ({ page }) => {
    // SCEN-017
    await page.selectOption('[data-testid="period-selector"]', '全期間');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="dashboard-widgets"]')).toBeVisible();
  });

  test('SCEN-018: 未来日付選択での制御', async ({ page }) => {
    // SCEN-018
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    await page.fill('[data-testid="date-picker"]', futureDateString);
    await page.click('[data-testid="confirm-date"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('SCEN-019: データなし期間での表示', async ({ page }) => {
    // SCEN-019
    await page.selectOption('[data-testid="period-selector"]', 'システム導入前');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="no-data-message"]')).toContainText('データがありません');
  });

  test('SCEN-020: 大量データ表示時の性能', async ({ page }) => {
    // SCEN-020
    const startTime = Date.now();
    await page.selectOption('[data-testid="data-mode"]', '大量データ');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(5000);
    await expect(page.locator('[data-testid="data-grid"]')).toBeVisible();
  });
});