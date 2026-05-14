import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("モデルテスト機能", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await page.fill('#username', 'admin');
    await page.fill('#password', 'password');
    await page.click('#login-button');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-338: 正常なモデルテスト実行', async ({ page }) => {
    // SCEN-338
    await page.click('[data-testid="menu-model-test"]');
    await page.waitForURL('**/model-test');
    await page.selectOption('[data-testid="model-select"]', 'ai-demand-model-v1');
    await page.setInputFiles('[data-testid="dataset-upload"]', 'test-data/sales-data.csv');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.check('[data-testid="accuracy-rmse"]');
    await page.check('[data-testid="accuracy-mae"]');
    await page.click('[data-testid="test-execute-button"]');
    await expect(page.locator('[data-testid="test-progress"]')).toBeVisible();
    await page.waitForSelector('[data-testid="test-results"]', { timeout: 30000 });
    await expect(page.locator('[data-testid="rmse-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="mae-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="comparison-chart"]')).toBeVisible();
  });

  test('SCEN-339: テスト結果の正常エクスポート', async ({ page }) => {
    // SCEN-339
    await page.click('[data-testid="menu-model-test"]');
    await page.waitForURL('**/model-test');
    await expect(page.locator('[data-testid="test-history-item"]').first()).toBeVisible();
    await page.click('[data-testid="test-history-item"]');
    await page.click('[data-testid="export-button"]');
    await page.selectOption('[data-testid="export-format"]', 'csv');
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-execute"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('model-test-result');
  });

  test('SCEN-340: テスト履歴一覧の表示確認', async ({ page }) => {
    // SCEN-340
    await page.click('[data-testid="menu-model-test"]');
    await page.waitForURL('**/model-test');
    await page.click('[data-testid="test-history-tab"]');
    await expect(page.locator('[data-testid="test-history-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="test-history-item"]').first()).toContainText('2024');
    await expect(page.locator('[data-testid="model-name"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="test-result"]').first()).toBeVisible();
    if (await page.locator('[data-testid="pagination"]').isVisible()) {
      await page.click('[data-testid="pagination-next"]');
      await expect(page.locator('[data-testid="test-history-item"]').first()).toBeVisible();
    }
  });

  test('SCEN-341: 予測精度指標の正常表示', async ({ page }) => {
    // SCEN-341
    await page.click('[data-testid="menu-model-test"]');
    await page.waitForURL('**/model-test');
    await page.selectOption('[data-testid="model-select"]', 'ai-demand-model-v1');
    await expect(page.locator('[data-testid="accuracy-indicators"]')).toBeVisible();
    await expect(page.locator('[data-testid="mae-indicator"]')).toContainText('MAE');
    await expect(page.locator('[data-testid="rmse-indicator"]')).toContainText('RMSE');
    await expect(page.locator('[data-testid="mape-indicator"]')).toContainText('MAPE');
    await expect(page.locator('[data-testid="r2-indicator"]')).toContainText('R²');
    await expect(page.locator('[data-testid="mae-value"]')).toMatch(/^\d+\.\d{2,4}$/);
    await expect(page.locator('[data-testid="indicator-units"]')).toBeVisible();
  });

  test('SCEN-342: 実績値vs予測値グラフの表示', async ({ page }) => {
    // SCEN-342
    await page.click('[data-testid="menu-model-test"]');
    await page.waitForURL('**/model-test');
    await page.selectOption('[data-testid="model-select"]', 'ai-demand-model-v1');
    await page.fill('[data-testid="comparison-start-date"]', '2024-01-01');
    await page.fill('[data-testid="comparison-end-date"]', '2024-01-31');
    await page.click('[data-testid="show-comparison-graph"]');
    await expect(page.locator('[data-testid="comparison-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="actual-line"]')).toBeVisible();
    await expect(page.locator('[data-testid="predicted-line"]')).toBeVisible();
    await expect(page.locator('[data-testid="x-axis-label"]')).toBeVisible();
    await expect(page.locator('[data-testid="y-axis-label"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-legend"]')).toBeVisible();
  });

  test('SCEN-343: モデル未選択でエラー表示', async ({ page }) => {
    // SCEN-343
    await page.click('[data-testid="menu-model-test"]');
    await page.waitForURL('**/model-test');
    await page.click('[data-testid="test-execute-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('モデルが選択されていません');
  });

  test('SCEN-344: 開始日が終了日より後でエラー', async ({ page }) => {
    // SCEN-344
    await page.click('[data-testid="menu-model-test"]');
    await page.waitForURL('**/model-test');
    await page.selectOption('[data-testid="model-select"]', 'ai-demand-model-v1');
    await page.fill('[data-testid="start-date"]', '2024-12-31');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.click('[data-testid="test-execute-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('開始日は終了日より前の日付');
  });

  test('SCEN-345: 店舗未選択でエラー表示', async ({ page }) => {
    // SCEN-345
    await page.click('[data-testid="menu-model-test"]');
    await page.waitForURL('**/model-test');
    await page.selectOption('[data-testid="product-category"]', 'electronics');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.click('[data-testid="test-execute-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('店舗');
  });

  test('SCEN-346: 商品カテゴリ未選択でエラー', async ({ page }) => {
    // SCEN-346
    await page.click('[data-testid="menu-model-test"]');
    await page.waitForURL('**/model-test');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.selectOption('[data-testid="store-select"]', 'store-001');
    await page.click('[data-testid="test-execute-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('商品カテゴリ');
  });

  test('SCEN-347: テストデータセット未選択でエラー', async ({ page }) => {
    // SCEN-347
    await page.click('[data-testid="menu-model-test"]');
    await page.waitForURL('**/model-test');
    await page.click('[data-testid="test-execute-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('テストデータセット');
  });

  test('SCEN-348: 存在しないモデル選択時のエラー', async ({ page }) => {
    // SCEN-348
    await page.click('[data-testid="menu-model-test"]');
    await page.waitForURL('**/model-test');
    await page.fill('[data-testid="model-input"]', 'NonExistentModel_Test123');
    await page.click('[data-testid="test-execute-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('モデルが見つかりません');
  });

  test('SCEN-349: 大量データ処理時の動作確認', async ({ page }) => {
    // SCEN-349
    await page.click('[data-testid="menu-model-test"]');
    await page.waitForURL('**/model-test');
    await page.setInputFiles('[data-testid="dataset-upload"]', 'test-data/large-dataset-100k.csv');
    await page.selectOption('[data-testid="model-select"]', 'ai-demand-model-v1');
    await page.click('[data-testid="test-execute-button"]');
    await expect(page.locator('[data-testid="error-message"], [data-testid="timeout-message"]')).toBeVisible({ timeout: 60000 });
  });

  test('SCEN-350: テスト期間の最小値境界', async ({ page }) => {
    // SCEN-350
    await page.click('[data-testid="menu-model-test"]');
    await page.waitForURL('**/model-test');
    await page.selectOption('[data-testid="model-select"]', 'ai-demand-model-v1');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.setInputFiles('[data-testid="dataset-upload"]', 'test-data/sales-data.csv');
    await page.click('[data-testid="test-execute-button"]');
    await expect(page.locator('[data-testid="test-results"], [data-testid="mae-value"]')).toBeVisible({ timeout: 30000 });
  });

  test('SCEN-351: テスト期間の最大値境界', async ({ page }) => {
    // SCEN-351
    await page.click('[data-testid="menu-model-test"]');
    await page.waitForURL('**/model-test');
    await page.selectOption('[data-testid="model-select"]', 'ai-demand-model-v1');
    await page.fill('[data-testid="test-period-max"]', '365');
    await page.setInputFiles('[data-testid="dataset-upload"]', 'test-data/sales-data.csv');
    await page.click('[data-testid="test-execute-button"]');
    await expect(page.locator('[data-testid="test-results"]')).toBeVisible({ timeout: 60000 });
  });

  test('SCEN-352: 全店舗選択時の動作', async ({ page }) => {
    // SCEN-352
    await page.click('[data-testid="menu-model-test"]');
    await page.waitForURL('**/model-test');
    await page.check('[data-testid="select-all-stores"]');
    await expect(page.locator('[data-testid="store-checkbox"]:checked')).toHaveCount(3);
    await page.click('[data-testid="test-execute-button"]');
    await expect(page.locator('[data-testid="processing-indicator"]')).toBeVisible();
    await page.waitForSelector('[data-testid="all-stores-results"]', { timeout: 60000 });
    await expect(page.locator('[data-testid="store-result-item"]')).toHaveCount(3);
  });

  test('SCEN-353: 全商品カテゴリ選択時の動作', async ({ page }) => {
    // SCEN-353
    await page.click('[data-testid="menu-model-test"]');
    await page.waitForURL('**/model-test');
    await page.check('[data-testid="select-all-categories"]');
    await expect(page.locator('[data-testid="category-checkbox"]:checked')).toHaveCountGreaterThan(0);
    await page.click('[data-testid="test-execute-button"]');
    await expect(page.locator('[data-testid="processing-indicator"]')).toBeVisible();
    await page.waitForSelector('[data-testid="category-results"]', { timeout: 60000 });
    await expect(page.locator('[data-testid="category-result-item"]')).toHaveCountGreaterThan(0);
  });

  test('SCEN-354: 過去日付でのテスト期間設定', async ({ page }) => {
    // SCEN-354
    await page.click('[data-testid="menu-model-test"]');
    await page.waitForURL('**/model-test');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startDate = yesterday.toISOString().split('T')[0];
    await page.fill('[data-testid="start-date"]', startDate);
    await page.fill('[data-testid="end-date"]', startDate);
    await page.click('[data-testid="test-execute-button"]');
    await expect(page.locator('[data-testid="test-results"], [data-testid="validation-message"]')).toBeVisible();
  });

  test('SCEN-355: 未来日付でのテスト期間設定', async ({ page }) => {
    // SCEN-355
    await page.click('[data-testid="menu-model-test"]');
    await page.waitForURL('**/model-test');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureEndDate = new Date();
    futureEndDate.setDate(futureEndDate.getDate() + 60);
    await page.fill('[data-testid="start-date"]', futureDate.toISOString().split('T')[0]);
    await page.fill('[data-testid="end-date"]', futureEndDate.toISOString().split('T')[0]);
    await page.click('[data-testid="test-execute-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('過去または現在の日付範囲');
  });
});