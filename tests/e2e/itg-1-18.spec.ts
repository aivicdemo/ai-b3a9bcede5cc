import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("モデルテスト機能", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // ログイン処理（認証が必要な場合）
    // await page.fill('[data-testid="login-email"]', 'test@example.com');
    // await page.fill('[data-testid="login-password"]', 'password');
    // await page.click('[data-testid="login-button"]');
  });

  test("SCEN-346: 全項目正常入力でテスト実行成功", async ({ page }) => {
    // SCEN-346
    await page.goto(BASE_URL + "/model-test");
    await page.selectOption('[name="model"]', 'ai-demand-model-1');
    await page.fill('[name="product-code"]', 'PRD001');
    await page.fill('[name="start-date"]', '2024-01-01');
    await page.fill('[name="end-date"]', '2024-01-31');
    await page.selectOption('[name="region"]', 'tokyo');
    await page.fill('[name="accuracy-threshold"]', '0.8');
    await page.fill('[name="sample-size"]', '1000');
    await page.click('button[type="submit"]');
    await page.click('button:has-text("OK")');
    await expect(page.locator('.progress-bar')).toBeVisible();
    await expect(page.locator('.test-results')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.download-csv')).toBeVisible();
  });

  test("SCEN-347: 予測精度指標が正しく表示される", async ({ page }) => {
    // SCEN-347
    await page.goto(BASE_URL + "/model-test");
    await page.selectOption('[name="model"]', 'prediction-model-1');
    await page.fill('[name="dataset"]', 'test-dataset.csv');
    await page.click('button:has-text("テスト実行")');
    await expect(page.locator('.accuracy-metrics')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.mape-value')).toBeVisible();
    await expect(page.locator('.rmse-value')).toBeVisible();
    await expect(page.locator('.r-squared')).toBeVisible();
    await expect(page.locator('.metrics-chart')).toBeVisible();
  });

  test("SCEN-348: 実績値vs予測値グラフが描画される", async ({ page }) => {
    // SCEN-348
    await page.goto(BASE_URL + "/model-test");
    await page.selectOption('[name="model"]', 'ai-model-1');
    await page.fill('[name="period"]', '2024-01-01_2024-01-31');
    await page.click('button:has-text("実績値vs予測値グラフ表示")');
    await expect(page.locator('.comparison-graph')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.actual-line')).toBeVisible();
    await expect(page.locator('.predicted-line')).toBeVisible();
    await expect(page.locator('.x-axis-label')).toBeVisible();
    await expect(page.locator('.y-axis-label')).toBeVisible();
    await expect(page.locator('.legend')).toBeVisible();
  });

  test("SCEN-349: テスト結果をエクスポートできる", async ({ page }) => {
    // SCEN-349
    await page.goto(BASE_URL + "/model-test/results");
    await expect(page.locator('.test-results')).toBeVisible();
    await page.click('button:has-text("エクスポート")');
    await page.selectOption('[name="export-format"]', 'csv');
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("エクスポート実行")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test("SCEN-350: 過去のテスト履歴が表示される", async ({ page }) => {
    // SCEN-350
    await page.goto(BASE_URL + "/model-test");
    await page.click('a:has-text("テスト履歴")');
    await expect(page.locator('.test-history-list')).toBeVisible();
    await expect(page.locator('.history-item')).toHaveCount({ min: 1 });
    await expect(page.locator('.execution-date')).toBeVisible();
    await expect(page.locator('.test-name')).toBeVisible();
    await expect(page.locator('.result-status')).toBeVisible();
  });

  test("SCEN-351: モデル未選択でテスト実行エラー", async ({ page }) => {
    // SCEN-351
    await page.goto(BASE_URL + "/model-test");
    await page.fill('[name="test-data"]', 'valid-data.csv');
    await page.click('button:has-text("テスト実行")');
    await expect(page.locator('.error-message')).toHaveText(/予測モデルが選択されていません/);
  });

  test("SCEN-352: 期間設定で終了日が開始日より前でエラー", async ({ page }) => {
    // SCEN-352
    await page.goto(BASE_URL + "/model-test");
    await page.fill('[name="start-date"]', '2024-01-15');
    await page.fill('[name="end-date"]', '2024-01-10');
    await page.click('button:has-text("テスト実行")');
    await expect(page.locator('.error-message')).toHaveText(/終了日は開始日より後の日付を設定してください/);
  });

  test("SCEN-353: 店舗未選択でテスト実行エラー", async ({ page }) => {
    // SCEN-353
    await page.goto(BASE_URL + "/model-test");
    await page.fill('[name="test-period"]', '2024-01-01_2024-01-31');
    await page.fill('[name="parameters"]', 'param1=value1');
    await page.click('button:has-text("テスト実行")');
    await expect(page.locator('.error-message')).toContainText('店舗が選択されていません');
  });

  test("SCEN-354: 商品カテゴリ未選択でエラー", async ({ page }) => {
    // SCEN-354
    await page.goto(BASE_URL + "/model-test");
    await page.fill('[name="test-period"]', '2024-01-01_2024-01-31');
    await page.fill('[name="dataset"]', 'test-data.csv');
    await page.click('button:has-text("テスト実行")');
    await expect(page.locator('.error-message')).toHaveText(/商品カテゴリが未選択/);
  });

  test("SCEN-355: テストデータセット未選択でエラー", async ({ page }) => {
    // SCEN-355
    await page.goto(BASE_URL + "/model-test");
    await page.selectOption('[name="model"]', 'model-1');
    await page.click('button:has-text("テスト実行")');
    await expect(page.locator('.error-message')).toHaveText(/テストデータセットが選択されていません/);
  });

  test("SCEN-356: 大量データでのモデル実行時間測定", async ({ page }) => {
    // SCEN-356
    await page.goto(BASE_URL + "/model-test");
    await page.selectOption('[name="dataset"]', 'large-dataset-100k');
    await page.selectOption('[name="model"]', 'ai-demand-model');
    const startTime = Date.now();
    await page.click('button:has-text("モデル実行")');
    await expect(page.locator('.progress-indicator')).toBeVisible();
    await expect(page.locator('.execution-complete')).toBeVisible({ timeout: 1800000 });
    const endTime = Date.now();
    const executionTime = (endTime - startTime) / 1000 / 60;
    expect(executionTime).toBeLessThan(30);
    await expect(page.locator('.accuracy-result')).toContainText(/[8-9][0-9]%|100%/);
  });

  test("SCEN-357: 最大期間設定でのテスト実行", async ({ page }) => {
    // SCEN-357
    await page.goto(BASE_URL + "/model-test");
    await page.selectOption('[name="model"]', 'test-model');
    await page.fill('[name="test-period"]', '3年間');
    await page.fill('[name="parameters"]', 'default');
    await page.click('button:has-text("テスト実行")');
    await expect(page.locator('.progress-bar')).toBeVisible();
    await expect(page.locator('.test-results')).toBeVisible({ timeout: 60000 });
    await expect(page.locator('.rmse-value')).toBeVisible();
    await expect(page.locator('.mape-value')).toBeVisible();
    await expect(page.locator('.result-graph')).toBeVisible();
  });

  test("SCEN-358: 全店舗選択でのパフォーマンス確認", async ({ page }) => {
    // SCEN-358
    await page.goto(BASE_URL + "/model-test");
    const startTime = Date.now();
    await page.check('[name="select-all-stores"]');
    await expect(page.locator('.selected-stores-count')).toContainText(/100/);
    await page.click('button:has-text("テスト実行")');
    await expect(page.locator('.test-results')).toBeVisible({ timeout: 15000 });
    const endTime = Date.now();
    const executionTime = (endTime - startTime) / 1000;
    expect(executionTime).toBeLessThan(10);
  });

  test("SCEN-359: 同一日の開始日・終了日設定", async ({ page }) => {
    // SCEN-359
    await page.goto(BASE_URL + "/model-test");
    await page.selectOption('[name="model"]', 'ai-demand-model');
    await page.fill('[name="start-date"]', '2024-01-15');
    await page.fill('[name="end-date"]', '2024-01-15');
    await page.click('button:has-text("テスト実行")');
    await expect(page.locator('.test-results')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.daily-accuracy')).toBeVisible();
  });

  test("SCEN-360: 予測精度が異常値の場合の表示", async ({ page }) => {
    // SCEN-360
    await page.goto(BASE_URL + "/model-test");
    await page.selectOption('[name="test-data"]', 'abnormal-accuracy-data');
    await page.click('button:has-text("テスト実行")');
    await expect(page.locator('.accuracy-display')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.error-message, .warning-message')).toBeVisible();
    await expect(page.locator('.accuracy-value')).toHaveText(/N\/A|算出不可/);
    await expect(page.locator('.main-content')).toBeVisible();
  });
});