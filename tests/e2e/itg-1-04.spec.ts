import { test, expect } from '@playwright/test';

test.describe("相関分析・比較分析", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${baseURL}/dashboard`);
  });

  test("SCEN-072: 期間・店舗・商品選択して分析実行", async ({ page }) => {
    // SCEN-072
    await page.goto(`${baseURL}/analysis/correlation`);
    await page.selectOption('[data-testid="analysis-type"]', 'correlation');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.selectOption('[data-testid="store-select"]', 'store-001');
    await page.selectOption('[data-testid="product-category"]', 'category-001');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="analysis-result"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="correlation-coefficient"]')).toBeVisible();
  });

  test("SCEN-073: 天候要因で相関分析実行", async ({ page }) => {
    // SCEN-073
    await page.goto(`${baseURL}/analysis/correlation`);
    await page.selectOption('[data-testid="analysis-factor"]', 'weather');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.selectOption('[data-testid="product-category"]', 'category-001');
    await page.check('[data-testid="weather-temperature"]');
    await page.click('[data-testid="execute-correlation"]');
    await expect(page.locator('[data-testid="correlation-result"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="scatter-plot"]')).toBeVisible();
  });

  test("SCEN-074: イベント要因で相関分析実行", async ({ page }) => {
    // SCEN-074
    await page.goto(`${baseURL}/analysis/correlation`);
    await page.selectOption('[data-testid="analysis-factor"]', 'event');
    await page.fill('[data-testid="start-date"]', '2023-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.selectOption('[data-testid="product-category"]', 'category-001');
    await page.selectOption('[data-testid="event-type"]', 'sale');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="analysis-result"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="correlation-coefficient"]')).toBeVisible();
  });

  test("SCEN-075: 季節要因で相関分析実行", async ({ page }) => {
    // SCEN-075
    await page.goto(`${baseURL}/analysis/correlation`);
    await page.selectOption('[data-testid="analysis-type"]', 'correlation');
    await page.fill('[data-testid="start-date"]', '2023-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.selectOption('[data-testid="analysis-factor"]', 'season');
    await page.selectOption('[data-testid="product-category"]', 'category-001');
    await page.selectOption('[data-testid="season-division"]', 'quarterly');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="correlation-matrix"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="export-csv"]')).toBeEnabled();
  });

  test("SCEN-076: 複数商品カテゴリで比較分析", async ({ page }) => {
    // SCEN-076
    await page.goto(`${baseURL}/analysis/comparison`);
    await page.check('[data-testid="category-food"]');
    await page.check('[data-testid="category-clothing"]');
    await page.check('[data-testid="category-electronics"]');
    await page.fill('[data-testid="start-date"]', '2024-06-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.check('[data-testid="compare-sales"]');
    await page.check('[data-testid="compare-quantity"]');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="comparison-chart"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="export-pdf"]')).toBeEnabled();
  });

  test("SCEN-077: 相関係数表示とグラフ連動", async ({ page }) => {
    // SCEN-077
    await page.goto(`${baseURL}/analysis/correlation`);
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="correlation-table"]')).toBeVisible({ timeout: 30000 });
    await page.click('[data-testid="correlation-cell-0-1"]');
    await expect(page.locator('[data-testid="scatter-plot"]')).toBeVisible();
    await page.click('[data-testid="correlation-cell-0-2"]');
    await expect(page.locator('[data-testid="scatter-plot"]')).toBeVisible();
  });

  test("SCEN-078: 散布図とヒートマップ表示", async ({ page }) => {
    // SCEN-078
    await page.goto(`${baseURL}/analysis/correlation`);
    await page.selectOption('[data-testid="product-category"]', 'category-001');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.selectOption('[data-testid="variable-1"]', 'sales');
    await page.selectOption('[data-testid="variable-2"]', 'temperature');
    await page.click('[data-testid="show-scatter-plot"]');
    await expect(page.locator('[data-testid="scatter-plot"]')).toBeVisible();
    await page.click('[data-testid="show-heatmap"]');
    await expect(page.locator('[data-testid="heatmap"]')).toBeVisible();
  });

  test("SCEN-079: 時系列チャートで傾向確認", async ({ page }) => {
    // SCEN-079
    await page.goto(`${baseURL}/analysis/correlation`);
    await page.selectOption('[data-testid="product-category"]', 'category-001');
    await page.fill('[data-testid="start-date"]', '2023-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.click('[data-testid="show-timeseries"]');
    await expect(page.locator('[data-testid="timeseries-chart"]')).toBeVisible();
    await page.dragAndDrop('[data-testid="chart-area"]', '[data-testid="chart-area"]');
    await expect(page.locator('[data-testid="trend-details"]')).toBeVisible();
  });

  test("SCEN-080: 統計値サマリー表示", async ({ page }) => {
    // SCEN-080
    await page.goto(`${baseURL}/analysis/correlation`);
    await page.selectOption('[data-testid="product-category"]', 'category-001');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="statistics-summary"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="mean-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="standard-deviation"]')).toBeVisible();
  });

  test("SCEN-081: 期間未選択で分析実行", async ({ page }) => {
    // SCEN-081
    await page.goto(`${baseURL}/analysis/correlation`);
    await page.selectOption('[data-testid="product-category"]', 'category-001');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('期間を選択してください');
    await expect(page.locator('[data-testid="start-date"]')).toHaveClass(/highlight/);
  });

  test("SCEN-082: 店舗未選択で分析実行", async ({ page }) => {
    // SCEN-082
    await page.goto(`${baseURL}/analysis/correlation`);
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.selectOption('[data-testid="product-category"]', 'category-001');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('店舗を選択してください');
  });

  test("SCEN-083: 商品カテゴリ未選択で分析実行", async ({ page }) => {
    // SCEN-083
    await page.goto(`${baseURL}/analysis/correlation`);
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.selectOption('[data-testid="store-select"]', 'store-001');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('商品カテゴリを選択してください');
  });

  test("SCEN-084: 分析要因未選択で分析実行", async ({ page }) => {
    // SCEN-084
    await page.goto(`${baseURL}/analysis/correlation`);
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('分析要因を選択してください');
  });

  test("SCEN-085: データなし期間で分析実行", async ({ page }) => {
    // SCEN-085
    await page.goto(`${baseURL}/analysis/correlation`);
    await page.fill('[data-testid="start-date"]', '2025-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.selectOption('[data-testid="product-category"]', 'category-001');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('指定された期間にはデータが存在しません');
  });

  test("SCEN-086: 無効な店舗選択でエラー", async ({ page }) => {
    // SCEN-086
    await page.goto(`${baseURL}/analysis/correlation`);
    await page.fill('[data-testid="store-input"]', 'STORE-9999');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.selectOption('[data-testid="product-category"]', 'category-001');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('無効な店舗が選択されています');
  });

  test("SCEN-087: 開始日が終了日より後の期間選択", async ({ page }) => {
    // SCEN-087
    await page.goto(`${baseURL}/analysis/correlation`);
    await page.fill('[data-testid="start-date"]', '2024-12-31');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('開始日は終了日より前の日付を選択してください');
  });

  test("SCEN-088: 最大期間範囲での分析実行", async ({ page }) => {
    // SCEN-088
    await page.goto(`${baseURL}/analysis/correlation`);
    await page.fill('[data-testid="start-date"]', '2020-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.selectOption('[data-testid="store-select"]', 'store-001');
    await page.selectOption('[data-testid="product-category"]', 'category-001');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="analysis-result"]')).toBeVisible({ timeout: 60000 });
  });

  test("SCEN-089: 全商品カテゴリ選択で分析", async ({ page }) => {
    // SCEN-089
    await page.goto(`${baseURL}/analysis/correlation`);
    await page.check('[data-testid="select-all-categories"]');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="correlation-matrix"]')).toBeVisible({ timeout: 60000 });
    await expect(page.locator('[data-testid="comparison-chart"]')).toBeVisible();
  });

  test("SCEN-090: 複数分析要因同時選択", async ({ page }) => {
    // SCEN-090
    await page.goto(`${baseURL}/analysis/correlation`);
    await page.check('[data-testid="factor-sales"]');
    await page.check('[data-testid="factor-weather"]');
    await page.check('[data-testid="factor-event"]');
    await page.check('[data-testid="factor-season"]');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="multi-factor-matrix"]')).toBeVisible({ timeout: 60000 });
    await expect(page.locator('[data-testid="export-button"]')).toBeEnabled();
  });

  test("SCEN-091: 当日日付での期間選択", async ({ page }) => {
    // SCEN-091
    await page.goto(`${baseURL}/analysis/correlation`);
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="start-date"]', today);
    await page.fill('[data-testid="end-date"]', today);
    await page.selectOption('[data-testid="product-category"]', 'category-001');
    await page.click('[data-testid="execute-analysis"]');
    await expect(page.locator('[data-testid="analysis-result"], [data-testid="insufficient-data-message"]')).toBeVisible();
  });
});