import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("需要予測管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'testpass');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${baseURL}/dashboard`);
  });

  test('SCEN-092: 全項目正常入力でAI予測が実行される', async ({ page }) => {
    // SCEN-092
    await page.goto(`${baseURL}/demand-forecast`);
    await page.fill('[data-testid="product-code"]', 'PRD001');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.selectOption('[data-testid="prediction-model"]', 'lstm');
    await page.check('[data-testid="seasonality-checkbox"]');
    await page.selectOption('[data-testid="external-factors"]', 'weather');
    await page.click('[data-testid="ai-prediction-execute"]');
    await expect(page.locator('[data-testid="prediction-processing"]')).toBeVisible();
    await page.waitForURL(`${baseURL}/demand-forecast/result`);
    await expect(page.locator('[data-testid="prediction-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="prediction-graph"]')).toBeVisible();
    await expect(page.locator('[data-testid="prediction-accuracy"]')).toBeVisible();
  });

  test('SCEN-093: 予測結果グラフが正常に表示される', async ({ page }) => {
    // SCEN-093
    await page.goto(`${baseURL}/demand-forecast`);
    await page.selectOption('[data-testid="product-category"]', 'electronics');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-03-31');
    await page.click('[data-testid="prediction-execute"]');
    await page.waitForSelector('[data-testid="prediction-complete"]');
    await page.click('[data-testid="graph-display"]');
    await expect(page.locator('[data-testid="prediction-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-legend"]')).toBeVisible();
    await expect(page.locator('[data-testid="x-axis-label"]')).toBeVisible();
    await expect(page.locator('[data-testid="y-axis-label"]')).toBeVisible();
  });

  test('SCEN-094: 商品別予測一覧が正常に表示される', async ({ page }) => {
    // SCEN-094
    await page.goto(`${baseURL}/dashboard`);
    await page.click('[data-testid="demand-forecast-menu"]');
    await page.click('[data-testid="product-prediction-list"]');
    await expect(page.locator('[data-testid="product-prediction-list-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-code-column"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-name-column"]')).toBeVisible();
    await expect(page.locator('[data-testid="prediction-period-column"]')).toBeVisible();
    await expect(page.locator('[data-testid="prediction-quantity-column"]')).toBeVisible();
    await expect(page.locator('[data-testid="prediction-accuracy-column"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-row"]')).toHaveCount({ min: 1 });
  });

  test('SCEN-095: 予測結果をエクスポートできる', async ({ page }) => {
    // SCEN-095
    await page.goto(`${baseURL}/demand-forecast/result`);
    await expect(page.locator('[data-testid="prediction-result"]')).toBeVisible();
    await page.click('[data-testid="export-button"]');
    await page.selectOption('[data-testid="export-format"]', 'csv');
    await page.fill('[data-testid="export-start-date"]', '2024-01-01');
    await page.fill('[data-testid="export-end-date"]', '2024-03-31');
    await page.selectOption('[data-testid="export-category"]', 'all');
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-execute"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('SCEN-096: 店舗未選択で予測実行時にエラー表示', async ({ page }) => {
    // SCEN-096
    await page.goto(`${baseURL}/demand-forecast`);
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-03-31');
    await page.selectOption('[data-testid="product-category"]', 'electronics');
    await page.click('[data-testid="prediction-execute"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('店舗を選択してください');
  });

  test('SCEN-097: 商品カテゴリ未選択で予測実行時にエラー表示', async ({ page }) => {
    // SCEN-097
    await page.goto(`${baseURL}/demand-forecast`);
    await page.selectOption('[data-testid="store-select"]', 'store001');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-03-31');
    await page.click('[data-testid="prediction-execute"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('商品カテゴリを選択してください');
  });

  test('SCEN-098: 予測期間未設定で予測実行時にエラー表示', async ({ page }) => {
    // SCEN-098
    await page.goto(`${baseURL}/demand-forecast`);
    await page.selectOption('[data-testid="product-select"]', 'PRD001');
    await page.selectOption('[data-testid="prediction-model"]', 'arima');
    await page.click('[data-testid="prediction-execute"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('予測期間を設定してください');
  });

  test('SCEN-099: 開始日が終了日より未来の場合にエラー表示', async ({ page }) => {
    // SCEN-099
    await page.goto(`${baseURL}/demand-forecast`);
    await page.click('[data-testid="new-prediction-period"]');
    await page.fill('[data-testid="start-date"]', '2024-12-31');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.fill('[data-testid="prediction-name"]', 'テスト予測');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('開始日は終了日より前の日付を入力してください');
  });

  test('SCEN-100: 予測モデル未選択で予測実行時にエラー表示', async ({ page }) => {
    // SCEN-100
    await page.goto(`${baseURL}/demand-forecast`);
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-03-31');
    await page.click('[data-testid="prediction-execute"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('予測モデルを選択してください');
  });

  test('SCEN-101: 予測期間が1日の場合の動作', async ({ page }) => {
    // SCEN-101
    await page.goto(`${baseURL}/demand-forecast`);
    await page.fill('[data-testid="prediction-period"]', '1');
    await page.selectOption('[data-testid="period-unit"]', 'day');
    await page.selectOption('[data-testid="product-select"]', 'PRD001');
    await page.click('[data-testid="prediction-execute"]');
    await expect(page.locator('[data-testid="prediction-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="confidence-interval"]')).toBeVisible();
    await expect(page.locator('[data-testid="prediction-accuracy"]')).toBeVisible();
    await expect(page.locator('[data-testid="short-period-guidance"]')).toBeVisible();
  });

  test('SCEN-102: 予測期間が最大期間の場合の動作', async ({ page }) => {
    // SCEN-102
    await page.goto(`${baseURL}/demand-forecast`);
    await page.fill('[data-testid="prediction-period"]', '365');
    await page.selectOption('[data-testid="product-select"]', 'PRD001');
    await page.click('[data-testid="prediction-execute"]');
    await page.waitForSelector('[data-testid="prediction-complete"]');
    await expect(page.locator('[data-testid="prediction-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="prediction-graph"]')).toBeVisible();
    await expect(page.locator('[data-testid="prediction-data"]')).toBeVisible();
  });

  test('SCEN-103: 過去日付を開始日に設定した場合の動作', async ({ page }) => {
    // SCEN-103
    await page.goto(`${baseURL}/demand-forecast`);
    await page.click('[data-testid="new-prediction-create"]');
    await page.fill('[data-testid="prediction-name"]', '過去日付テスト');
    await page.fill('[data-testid="start-date"]', '2023-12-31');
    await page.fill('[data-testid="end-date"]', '2024-03-31');
    await page.fill('[data-testid="product-select"]', 'PRD001');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('開始日は現在日以降の日付を設定してください');
  });

  test('SCEN-104: 未来の日付を終了日に設定した場合の動作', async ({ page }) => {
    // SCEN-104
    await page.goto(`${baseURL}/demand-forecast`);
    await page.click('[data-testid="new-prediction-period"]');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-04-01');
    await page.selectOption('[data-testid="product-category"]', 'electronics');
    await page.selectOption('[data-testid="prediction-model"]', 'lstm');
    await page.click('[data-testid="prediction-execute"]');
    await expect(page.locator('[data-testid="prediction-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="prediction-date-range"]')).toContainText('2024-01-01');
    await expect(page.locator('[data-testid="prediction-date-range"]')).toContainText('2024-04-01');
  });

  test('SCEN-105: 予測データが存在しない商品での動作', async ({ page }) => {
    // SCEN-105
    await page.goto(`${baseURL}/demand-forecast`);
    await page.fill('[data-testid="product-search"]', 'NODATA001');
    await page.click('[data-testid="product-search-button"]');
    await page.click('[data-testid="product-select-nodata"]');
    await expect(page.locator('[data-testid="no-prediction-data"]')).toContainText('予測データがありません');
    await expect(page.locator('[data-testid="create-new-prediction"]')).toBeVisible();
  });
});