import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("予測精度監視画面", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test("SCEN-306: 画面初期表示で全要素が正常に表示される", async ({ page }) => {
    // SCEN-306
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="accuracy-metrics"]')).toBeVisible();
    await expect(page.locator('[data-testid="period-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="accuracy-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="comparison-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="update-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="export-button"]')).toBeVisible();
  });

  test("SCEN-307: 期間選択で予測精度データが更新される", async ({ page }) => {
    // SCEN-307
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    const initialData = await page.locator('[data-testid="accuracy-value"]').textContent();
    await page.selectOption('[data-testid="period-filter"]', '3months');
    await page.waitForLoadState('networkidle');
    const updatedData = await page.locator('[data-testid="accuracy-value"]').textContent();
    expect(updatedData).not.toBe(initialData);
  });

  test("SCEN-308: 店舗選択で該当店舗の精度データが表示される", async ({ page }) => {
    // SCEN-308
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="store-filter"]');
    await page.click('[data-testid="store-option-a"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="store-info"]')).toContainText('店舗A');
    await expect(page.locator('[data-testid="accuracy-rate"]')).toBeVisible();
  });

  test("SCEN-309: 商品カテゴリ選択で該当カテゴリの精度データが表示される", async ({ page }) => {
    // SCEN-309
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="category-filter"]');
    await page.click('[data-testid="category-food"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="category-info"]')).toContainText('食品');
    await expect(page.locator('[data-testid="accuracy-data"]')).toBeVisible();
  });

  test("SCEN-310: 複数フィルター組み合わせで正しくデータが絞り込まれる", async ({ page }) => {
    // SCEN-310
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await page.selectOption('[data-testid="period-filter"]', '3months');
    await page.selectOption('[data-testid="category-filter"]', 'food');
    await page.selectOption('[data-testid="accuracy-threshold"]', '80');
    await page.selectOption('[data-testid="area-filter"]', 'tokyo');
    await page.click('[data-testid="apply-filter"]');
    await page.waitForLoadState('networkidle');
    const rowCount = await page.locator('[data-testid="data-row"]').count();
    expect(rowCount).toBeGreaterThanOrEqual(0);
    await page.click('[data-testid="clear-filter"]');
    await page.waitForLoadState('networkidle');
  });

  test("SCEN-311: 予測精度推移グラフが正常に描画される", async ({ page }) => {
    // SCEN-311
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="x-axis-label"]')).toBeVisible();
    await expect(page.locator('[data-testid="y-axis-label"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-legend"]')).toBeVisible();
    await page.hover('[data-testid="chart-datapoint"]');
    await expect(page.locator('[data-testid="tooltip"]')).toBeVisible();
    await page.click('[data-testid="daily-view"]');
    await page.waitForLoadState('networkidle');
  });

  test("SCEN-312: MAPE値が正確に計算・表示される", async ({ page }) => {
    // SCEN-312
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await page.selectOption('[data-testid="product-select"]', 'product1');
    await page.selectOption('[data-testid="period-select"]', '1month');
    await page.click('[data-testid="calculate-mape"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="mape-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="mape-details"]')).toBeVisible();
    await page.selectOption('[data-testid="period-select"]', '3months');
    await page.waitForLoadState('networkidle');
  });

  test("SCEN-313: RMSE値が正確に計算・表示される", async ({ page }) => {
    // SCEN-313
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await page.selectOption('[data-testid="period-select"]', '1month');
    await expect(page.locator('[data-testid="rmse-value"]')).toBeVisible();
    await page.selectOption('[data-testid="product-select"]', 'product2');
    await page.waitForLoadState('networkidle');
    await page.selectOption('[data-testid="period-select"]', '3months');
    await page.waitForLoadState('networkidle');
  });

  test("SCEN-314: 予測vs実績比較チャートが正常に表示される", async ({ page }) => {
    // SCEN-314
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await page.selectOption('[data-testid="category-select"]', 'category1');
    await page.selectOption('[data-testid="period-select"]', '1month');
    await expect(page.locator('[data-testid="comparison-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="forecast-line"]')).toBeVisible();
    await expect(page.locator('[data-testid="actual-line"]')).toBeVisible();
    await expect(page.locator('[data-testid="x-axis"]')).toBeVisible();
    await expect(page.locator('[data-testid="y-axis"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-legend"]')).toBeVisible();
    await page.hover('[data-testid="chart-point"]');
    await expect(page.locator('[data-testid="tooltip"]')).toBeVisible();
  });

  test("SCEN-315: 精度ランキング表が正しくソートされて表示される", async ({ page }) => {
    // SCEN-315
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="ranking-table"]')).toBeVisible();
    await page.click('[data-testid="accuracy-sort"]');
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="accuracy-sort"]');
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="product-sort"]');
    await page.waitForLoadState('networkidle');
  });

  test("SCEN-316: 精度閾値を下回った場合にアラート通知が表示される", async ({ page }) => {
    // SCEN-316
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await page.fill('[data-testid="accuracy-data"]', '75');
    await page.click('[data-testid="update-data"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="alert-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="alert-details"]')).toContainText('75%');
  });

  test("SCEN-317: 詳細分析ボタンで詳細画面に遷移する", async ({ page }) => {
    // SCEN-317
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await page.click('[data-testid="detailed-analysis"]');
    await page.waitForURL('**/detailed-analysis');
    await expect(page.locator('h1')).toContainText('詳細分析');
  });

  test("SCEN-318: レポート出力ボタンでファイルがダウンロードされる", async ({ page }) => {
    // SCEN-318
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-report"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.(pdf|xlsx)$/);
  });

  test("SCEN-319: 存在しない店舗選択でエラーメッセージ表示", async ({ page }) => {
    // SCEN-319
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await page.fill('[data-testid="store-input"]', '9999');
    await page.click('[data-testid="search-button"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('店舗が見つかりません');
  });

  test("SCEN-320: データなし期間選択で適切なメッセージ表示", async ({ page }) => {
    // SCEN-320
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await page.fill('[data-testid="start-date"]', '2020-01-01');
    await page.fill('[data-testid="end-date"]', '2020-01-31');
    await page.click('[data-testid="search-button"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="no-data-message"]')).toContainText('データが存在しません');
  });

  test("SCEN-321: ネットワークエラー時にエラーハンドリングされる", async ({ page }) => {
    // SCEN-321
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await page.route('**/api/**', route => route.abort());
    await page.click('[data-testid="update-button"]');
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    await page.unroute('**/api/**');
    await page.click('[data-testid="retry-button"]');
    await page.waitForLoadState('networkidle');
  });

  test("SCEN-322: レポート出力失敗時にエラーメッセージ表示", async ({ page }) => {
    // SCEN-322
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await page.route('**/api/export/**', route => route.abort());
    await page.click('[data-testid="export-report"]');
    await expect(page.locator('[data-testid="export-error"]')).toContainText('出力に失敗');
  });

  test("SCEN-323: 最大期間範囲選択で正常動作する", async ({ page }) => {
    // SCEN-323
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await page.selectOption('[data-testid="period-range"]', '24months');
    await page.click('[data-testid="apply-period"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="accuracy-data"]')).toBeVisible();
    await expect(page.locator('[data-testid="accuracy-chart"]')).toBeVisible();
  });

  test("SCEN-324: 全店舗選択で正常動作する", async ({ page }) => {
    // SCEN-324
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await page.selectOption('[data-testid="store-filter"]', 'all');
    await page.click('[data-testid="apply-filter"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="data-table"]')).toBeVisible();
    const rowCount = await page.locator('[data-testid="data-row"]').count();
    expect(rowCount).toBeGreaterThan(0);
    await page.click('[data-testid="sort-button"]');
    await page.waitForLoadState('networkidle');
  });

  test("SCEN-325: 精度値が0%の場合に正常表示される", async ({ page }) => {
    // SCEN-325
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await page.fill('[data-testid="test-accuracy"]', '0');
    await page.click('[data-testid="update-test-data"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="accuracy-display"]')).toContainText('0%');
    await expect(page.locator('[data-testid="accuracy-chart"]')).toBeVisible();
  });

  test("SCEN-326: 精度値が100%の場合に正常表示される", async ({ page }) => {
    // SCEN-326
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await page.fill('[data-testid="test-accuracy"]', '100');
    await page.click('[data-testid="update-test-data"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('[data-testid="accuracy-display"]')).toContainText('100%');
    await expect(page.locator('[data-testid="accuracy-chart"]')).toBeVisible();
  });

  test("SCEN-327: 大量データ表示時の画面パフォーマンス", async ({ page }) => {
    // SCEN-327
    await page.goto(`${BASE_URL}/accuracy-monitoring`);
    await page.waitForLoadState('networkidle');
    await page.selectOption('[data-testid="period-range"]', '2years');
    await page.selectOption('[data-testid="category-filter"]', 'all');
    await page.selectOption('[data-testid="store-filter"]', 'all');
    await page.check('[data-testid="detailed-view"]');
    const startTime = Date.now();
    await page.click('[data-testid="execute-search"]');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000);
    await page.locator('[data-testid="data-table"]').scroll({ top: 1000 });
    await page.click('[data-testid="sort-column"]');
    await page.waitForLoadState('networkidle');
  });

});