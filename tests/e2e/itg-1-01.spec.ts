import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("ダッシュボード", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-001: ダッシュボード初期表示', async ({ page }) => {
    // SCEN-001
    await expect(page.locator('[data-testid="sales-graph"]')).toBeVisible();
    await expect(page.locator('[data-testid="inventory-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="demand-forecast-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-recommendation-list"]')).toBeVisible();
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  test('SCEN-002: 店舗選択でデータ更新', async ({ page }) => {
    // SCEN-002
    await page.click('[data-testid="store-selector"]');
    await expect(page.locator('[data-testid="store-list"]')).toBeVisible();
    await page.click('[data-testid="store-option-2"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="selected-store"]')).toContainText('Store 2');
  });

  test('SCEN-003: 期間選択でデータ更新', async ({ page }) => {
    // SCEN-003
    await page.click('[data-testid="period-selector"]');
    await page.click('[data-testid="period-1month"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="demand-forecast-chart"]')).toBeVisible();
  });

  test('SCEN-004: 売上実績サマリー表示', async ({ page }) => {
    // SCEN-004
    await expect(page.locator('[data-testid="sales-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="monthly-sales"]')).toBeVisible();
    await expect(page.locator('[data-testid="monthly-comparison"]')).toBeVisible();
    await expect(page.locator('[data-testid="sales-trend-graph"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-breakdown"]')).toBeVisible();
    await expect(page.locator('[data-testid="last-updated"]')).toBeVisible();
  });

  test('SCEN-005: 需要予測精度指標表示', async ({ page }) => {
    // SCEN-005
    await expect(page.locator('[data-testid="forecast-accuracy"]')).toBeVisible();
    await expect(page.locator('[data-testid="mape-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="rmse-indicator"]')).toBeVisible();
    await page.click('[data-testid="accuracy-period-selector"]');
    await page.click('[data-testid="weekly-accuracy"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="accuracy-graph"]')).toBeVisible();
  });

  test('SCEN-006: 発注状況ステータス表示', async ({ page }) => {
    // SCEN-006
    await expect(page.locator('[data-testid="order-status-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-pending"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-ordered"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-shipping"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-completed"]')).toBeVisible();
  });

  test('SCEN-007: 在庫アラート通知表示', async ({ page }) => {
    // SCEN-007
    await expect(page.locator('[data-testid="alert-notification-area"]')).toBeVisible();
    await page.click('[data-testid="inventory-alert"]');
    await expect(page.locator('[data-testid="alert-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-stock"]')).toBeVisible();
    await expect(page.locator('[data-testid="safety-stock"]')).toBeVisible();
  });

  test('SCEN-008: 売上トレンドグラフ表示', async ({ page }) => {
    // SCEN-008
    await expect(page.locator('[data-testid="sales-trend-graph"]')).toBeVisible();
    await page.hover('[data-testid="graph-data-point"]');
    await expect(page.locator('[data-testid="tooltip"]')).toBeVisible();
    await page.click('[data-testid="period-toggle-weekly"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="graph-legend"]')).toBeVisible();
  });

  test('SCEN-009: 商品別売上ランキング表示', async ({ page }) => {
    // SCEN-009
    await expect(page.locator('[data-testid="product-ranking-widget"]')).toBeVisible();
    await page.click('[data-testid="ranking-period-monthly"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="ranking-list"] li')).toHaveCount(10);
    await expect(page.locator('[data-testid="product-rank"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="product-name"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="sales-amount"]').first()).toBeVisible();
  });

  test('SCEN-010: 天候影響分析チャート表示', async ({ page }) => {
    // SCEN-010
    await expect(page.locator('[data-testid="weather-analysis-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="weather-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="temperature-axis"]')).toBeVisible();
    await expect(page.locator('[data-testid="humidity-axis"]')).toBeVisible();
    await page.hover('[data-testid="weather-data-point"]');
    await expect(page.locator('[data-testid="weather-tooltip"]')).toBeVisible();
    await page.click('[data-testid="weather-period-filter"]');
  });

  test('SCEN-011: イベント・季節要因表示', async ({ page }) => {
    // SCEN-011
    await expect(page.locator('[data-testid="event-seasonal-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="seasonal-factors"]')).toBeVisible();
    await expect(page.locator('[data-testid="recent-events"]')).toBeVisible();
    await page.click('[data-testid="factor-details-button"]');
    await expect(page.locator('[data-testid="factor-detail-info"]')).toBeVisible();
  });

  test('SCEN-012: ヘッダーナビゲーション遷移', async ({ page }) => {
    // SCEN-012
    await page.click('[data-testid="nav-demand-forecast"]');
    await page.waitForURL('**/demand-forecast');
    await page.click('[data-testid="nav-order-management"]');
    await page.waitForURL('**/order-management');
    await page.click('[data-testid="nav-inventory-management"]');
    await page.waitForURL('**/inventory-management');
    await page.click('[data-testid="nav-dashboard"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-013: データ読み込み中の表示', async ({ page }) => {
    // SCEN-013
    await page.click('[data-testid="period-selector"]');
    await page.click('[data-testid="large-period-option"]');
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="loading-indicator"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="dashboard-data"]')).toBeVisible();
  });

  test('SCEN-014: データ取得失敗時エラー表示', async ({ page }) => {
    // SCEN-014
    await page.route('**/api/dashboard/**', route => route.abort());
    await page.reload();
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('データの取得に失敗しました');
  });

  test('SCEN-015: 権限なし店舗選択でエラー', async ({ page }) => {
    // SCEN-015
    await page.route('**/api/stores/unauthorized', route => route.fulfill({ status: 403 }));
    await page.click('[data-testid="store-selector"]');
    await page.click('[data-testid="unauthorized-store"]');
    await expect(page.locator('[data-testid="permission-error"]')).toBeVisible();
  });

  test('SCEN-016: 無効期間選択でエラー', async ({ page }) => {
    // SCEN-016
    await page.click('[data-testid="period-start-date"]');
    await page.fill('[data-testid="period-start-date"]', '2024-12-31');
    await page.fill('[data-testid="period-end-date"]', '2024-01-01');
    await page.click('[data-testid="apply-filter"]');
    await expect(page.locator('[data-testid="invalid-period-error"]')).toBeVisible();
  });

  test('SCEN-017: グラフ表示失敗時フォールバック', async ({ page }) => {
    // SCEN-017
    await page.route('**/api/graphs/**', route => route.fulfill({ status: 500 }));
    await page.reload();
    await expect(page.locator('[data-testid="graph-error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('SCEN-018: アラート通知クリック動作', async ({ page }) => {
    // SCEN-018
    await page.click('[data-testid="alert-notification"]');
    await page.waitForURL('**/inventory-status');
    await expect(page.locator('[data-testid="alert-detail-screen"]')).toBeVisible();
  });

  test('SCEN-019: 未来日期間選択', async ({ page }) => {
    // SCEN-019
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    await page.fill('[data-testid="period-start-date"]', futureDate.toISOString().split('T')[0]);
    await page.click('[data-testid="apply-filter"]');
    const forecastData = page.locator('[data-testid="forecast-data"]');
    const noDataMessage = page.locator('[data-testid="no-prediction-data"]');
    await expect(forecastData.or(noDataMessage)).toBeVisible();
  });

  test('SCEN-020: システム開始日以前選択', async ({ page }) => {
    // SCEN-020
    await page.fill('[data-testid="period-start-date"]', '2020-01-01');
    await page.click('[data-testid="apply-filter"]');
    const errorMessage = page.locator('[data-testid="date-range-error"]');
    const noData = page.locator('[data-testid="no-data-available"]');
    await expect(errorMessage.or(noData)).toBeVisible();
  });

  test('SCEN-021: 長期間選択時パフォーマンス', async ({ page }) => {
    // SCEN-021
    const startTime = Date.now();
    await page.click('[data-testid="period-selector"]');
    await page.click('[data-testid="two-years-period"]');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(10000);
    await expect(page.locator('[data-testid="dashboard-charts"]')).toBeVisible();
  });

  test('SCEN-022: 大量データ表示時レスポンス', async ({ page }) => {
    // SCEN-022
    const startTime = Date.now();
    await page.click('[data-testid="all-categories-filter"]');
    await page.click('[data-testid="large-dataset-period"]');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(5000);
    await page.mouse.wheel(0, 500);
    await expect(page.locator('[data-testid="dashboard-widgets"]')).toBeVisible();
  });

  test('SCEN-023: 画面リサイズ時レスポンシブ対応', async ({ page }) => {
    // SCEN-023
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible();
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });
});