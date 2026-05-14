import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("AI需要予測処理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('SCEN-165: 全項目設定してAI予測実行が成功する', async ({ page }) => {
    // SCEN-165
    await page.click('[data-testid="ai-demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/ai-demand-forecast`);
    await page.selectOption('[data-testid="product-select"]', 'product1');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.selectOption('[data-testid="algorithm-select"]', 'lstm');
    await page.fill('[data-testid="learning-start-date"]', '2023-01-01');
    await page.fill('[data-testid="learning-end-date"]', '2023-12-31');
    await page.check('[data-testid="seasonality-checkbox"]');
    await page.check('[data-testid="event-checkbox"]');
    await page.check('[data-testid="weather-checkbox"]');
    await page.selectOption('[data-testid="accuracy-level"]', 'high');
    await page.click('[data-testid="execute-prediction-button"]');
    await expect(page.locator('[data-testid="prediction-result"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });

  test('SCEN-166: 複数店舗選択での予測実行が成功する', async ({ page }) => {
    // SCEN-166
    await page.click('[data-testid="demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/demand-forecast`);
    await page.check('[data-testid="store-1"]');
    await page.check('[data-testid="store-2"]');
    await page.check('[data-testid="store-3"]');
    await page.fill('[data-testid="forecast-start-date"]', '2024-01-01');
    await page.fill('[data-testid="forecast-end-date"]', '2024-01-07');
    await page.selectOption('[data-testid="category-select"]', 'food');
    await page.click('[data-testid="execute-forecast-button"]');
    await expect(page.locator('[data-testid="forecast-result"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="store-1-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="store-2-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="store-3-result"]')).toBeVisible();
  });

  test('SCEN-167: 複数商品カテゴリ選択での予測実行が成功する', async ({ page }) => {
    // SCEN-167
    await page.click('[data-testid="demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/demand-forecast`);
    await page.check('[data-testid="category-food"]');
    await page.check('[data-testid="category-daily-goods"]');
    await page.check('[data-testid="category-clothing"]');
    await page.fill('[data-testid="forecast-period"]', '30');
    await page.click('[data-testid="execute-forecast-button"]');
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="forecast-result"]')).toBeVisible({ timeout: 60000 });
    await expect(page.locator('[data-testid="food-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="daily-goods-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="clothing-result"]')).toBeVisible();
  });

  test('SCEN-168: 天候データ取込が正常完了する', async ({ page }) => {
    // SCEN-168
    await page.click('[data-testid="data-import-menu"]');
    await page.click('[data-testid="weather-data-import"]');
    await page.fill('[data-testid="import-start-date"]', '2024-01-01');
    await page.fill('[data-testid="import-end-date"]', '2024-01-31');
    await page.selectOption('[data-testid="region-select"]', 'tokyo');
    await page.click('[data-testid="start-weather-import-button"]');
    await expect(page.locator('[data-testid="import-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="import-complete-notification"]')).toBeVisible({ timeout: 60000 });
    await page.click('[data-testid="weather-data-list-link"]');
    await expect(page.locator('[data-testid="imported-weather-data"]')).toBeVisible();
  });

  test('SCEN-169: イベントデータ取込が正常完了する', async ({ page }) => {
    // SCEN-169
    await page.click('[data-testid="data-management-menu"]');
    await page.click('[data-testid="event-data-import"]');
    await page.setInputFiles('[data-testid="file-input"]', 'test-files/valid-event-data.csv');
    await page.click('[data-testid="preview-button"]');
    await expect(page.locator('[data-testid="data-preview"]')).toBeVisible();
    await page.click('[data-testid="execute-import-button"]');
    await expect(page.locator('[data-testid="import-progress-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="import-complete-message"]')).toBeVisible({ timeout: 30000 });
    await page.click('[data-testid="event-data-list-link"]');
    await expect(page.locator('[data-testid="imported-event-data"]')).toBeVisible();
  });

  test('SCEN-170: 予測期間未選択でバリデーションエラー', async ({ page }) => {
    // SCEN-170
    await page.click('[data-testid="demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/demand-forecast`);
    await page.selectOption('[data-testid="product-select"]', 'product1');
    await page.selectOption('[data-testid="store-select"]', 'store1');
    await page.click('[data-testid="execute-forecast-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('予測期間を選択してください');
  });

  test('SCEN-171: 店舗未選択でバリデーションエラー', async ({ page }) => {
    // SCEN-171
    await page.click('[data-testid="ai-demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/ai-demand-forecast`);
    await page.fill('[data-testid="forecast-start-date"]', '2024-01-01');
    await page.fill('[data-testid="forecast-end-date"]', '2024-01-31');
    await page.selectOption('[data-testid="category-select"]', 'food');
    await page.click('[data-testid="execute-forecast-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('店舗を選択してください');
  });

  test('SCEN-172: 商品カテゴリ未選択でバリデーションエラー', async ({ page }) => {
    // SCEN-172
    await page.click('[data-testid="demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/demand-forecast`);
    await page.fill('[data-testid="forecast-start-date"]', '2024-01-01');
    await page.fill('[data-testid="forecast-end-date"]', '2024-01-31');
    await page.selectOption('[data-testid="store-select"]', 'store1');
    await page.click('[data-testid="execute-forecast-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('商品カテゴリを選択してください');
  });

  test('SCEN-173: 予測モデル未選択でバリデーションエラー', async ({ page }) => {
    // SCEN-173
    await page.click('[data-testid="demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/demand-forecast`);
    await page.selectOption('[data-testid="product-select"]', 'product1');
    await page.fill('[data-testid="forecast-start-date"]', '2024-01-01');
    await page.fill('[data-testid="forecast-end-date"]', '2024-01-31');
    await page.click('[data-testid="execute-forecast-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('予測モデルを選択してください');
  });

  test('SCEN-174: 学習データ期間未設定でバリデーションエラー', async ({ page }) => {
    // SCEN-174
    await page.click('[data-testid="ai-demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/ai-demand-forecast`);
    await page.selectOption('[data-testid="product-select"]', 'product1');
    await page.selectOption('[data-testid="model-select"]', 'lstm');
    await page.click('[data-testid="execute-forecast-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('学習データ期間の開始日と終了日を入力してください');
  });

  test('SCEN-175: 天候データ取込失敗でエラー表示', async ({ page }) => {
    // SCEN-175
    await page.click('[data-testid="ai-demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/ai-demand-forecast`);
    await page.fill('[data-testid="weather-api-url"]', 'invalid-api-url');
    await page.fill('[data-testid="forecast-period"]', '7');
    await page.click('[data-testid="execute-forecast-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('天候データの取得に失敗しました。データソースの設定を確認してください。');
  });

  test('SCEN-176: イベントデータ取込失敗でエラー表示', async ({ page }) => {
    // SCEN-176
    await page.click('[data-testid="event-data-import-menu"]');
    await page.waitForURL(`${BASE_URL}/event-data-import`);
    await page.setInputFiles('[data-testid="file-input"]', 'test-files/corrupted-event-data.csv');
    await page.click('[data-testid="execute-import-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('イベントデータの取込に失敗しました。ファイル形式を確認してください。');
    await page.click('[data-testid="ok-button"]');
    await expect(page.locator('[data-testid="event-data-list"]')).toBeEmpty();
  });

  test('SCEN-177: AI予測実行失敗でエラー表示', async ({ page }) => {
    // SCEN-177
    await page.click('[data-testid="ai-demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/ai-demand-forecast`);
    await page.selectOption('[data-testid="product-select"]', 'product1');
    await page.fill('[data-testid="forecast-start-date"]', '2024-01-01');
    await page.fill('[data-testid="forecast-end-date"]', '2024-01-31');
    await page.evaluate(() => {
      window.mockAIPredictionError = true;
    });
    await page.click('[data-testid="execute-ai-prediction-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('AI予測実行に失敗しました');
  });

  test('SCEN-178: 予測期間が過去日付でバリデーションエラー', async ({ page }) => {
    // SCEN-178
    await page.click('[data-testid="demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/demand-forecast`);
    await page.selectOption('[data-testid="product-select"]', 'product1');
    await page.fill('[data-testid="forecast-start-date"]', '2023-01-01');
    await page.fill('[data-testid="forecast-end-date"]', '2023-01-07');
    await page.click('[data-testid="execute-forecast-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('予測期間に過去の日付は指定できません');
  });

  test('SCEN-179: 予測期間が1年超でバリデーションエラー', async ({ page }) => {
    // SCEN-179
    await page.click('[data-testid="demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/demand-forecast`);
    await page.selectOption('[data-testid="product-select"]', 'product1');
    await page.fill('[data-testid="forecast-start-date"]', '2024-01-01');
    await page.fill('[data-testid="forecast-end-date"]', '2025-01-02');
    await page.click('[data-testid="execute-forecast-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('予測期間は1年以内で設定してください');
  });

  test('SCEN-180: 学習データ期間が予測期間より短い場合のバリデーション', async ({ page }) => {
    // SCEN-180
    await page.click('[data-testid="demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/demand-forecast`);
    await page.fill('[data-testid="learning-period"]', '30');
    await page.fill('[data-testid="forecast-period"]', '60');
    await page.selectOption('[data-testid="category-select"]', 'food');
    await page.selectOption('[data-testid="store-select"]', 'store1');
    await page.click('[data-testid="execute-forecast-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('学習データ期間は予測期間以上に設定してください');
  });

  test('SCEN-181: 予測精度閾値が最小値での実行', async ({ page }) => {
    // SCEN-181
    await page.click('[data-testid="demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/demand-forecast`);
    await page.fill('[data-testid="accuracy-threshold"]', '0.01');
    await page.selectOption('[data-testid="product-select"]', 'product1');
    await page.fill('[data-testid="forecast-start-date"]', '2024-01-01');
    await page.fill('[data-testid="forecast-end-date"]', '2024-01-31');
    await page.click('[data-testid="execute-ai-forecast-button"]');
    await expect(page.locator('[data-testid="forecast-result"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="accuracy-value"]')).toBeVisible();
  });

  test('SCEN-182: 予測精度閾値が最大値での実行', async ({ page }) => {
    // SCEN-182
    await page.click('[data-testid="ai-demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/ai-demand-forecast`);
    await page.fill('[data-testid="accuracy-threshold"]', '100');
    await page.selectOption('[data-testid="product-select"]', 'product1');
    await page.fill('[data-testid="forecast-period"]', '30');
    await page.click('[data-testid="execute-ai-forecast-button"]');
    await expect(page.locator('[data-testid="forecast-result"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });

  test('SCEN-183: 季節要因設定が最小値での実行', async ({ page }) => {
    // SCEN-183
    await page.click('[data-testid="demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/demand-forecast`);
    await page.fill('[data-testid="seasonal-factor"]', '0');
    await page.selectOption('[data-testid="product-select"]', 'product1');
    await page.fill('[data-testid="forecast-period"]', '30');
    await page.click('[data-testid="execute-ai-forecast-button"]');
    await expect(page.locator('[data-testid="forecast-result"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="prediction-value"]')).toBeVisible();
  });

  test('SCEN-184: 季節要因設定が最大値での実行', async ({ page }) => {
    // SCEN-184
    await page.click('[data-testid="demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/demand-forecast`);
    await page.fill('[data-testid="seasonal-factor"]', '100');
    await page.selectOption('[data-testid="product-select"]', 'product1');
    await page.fill('[data-testid="forecast-period"]', '30');
    await page.click('[data-testid="execute-ai-forecast-button"]');
    await expect(page.locator('[data-testid="forecast-result"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="system-log"]')).not.toContainText('error');
  });

  test('SCEN-185: 全商品カテゴリ選択での実行', async ({ page }) => {
    // SCEN-185
    await page.click('[data-testid="ai-demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/ai-demand-forecast`);
    await page.check('[data-testid="select-all-categories"]');
    await expect(page.locator('[data-testid="category-checkboxes"] input[type="checkbox"]')).toBeChecked();
    await page.fill('[data-testid="forecast-days"]', '30');
    await page.click('[data-testid="execute-forecast-button"]');
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="forecast-result"]')).toBeVisible({ timeout: 60000 });
    await expect(page.locator('[data-testid="all-categories-result"]')).toBeVisible();
  });

  test('SCEN-186: 予測処理中の進捗バー表示確認', async ({ page }) => {
    // SCEN-186
    await page.click('[data-testid="demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/demand-forecast`);
    await page.selectOption('[data-testid="category-select"]', 'food');
    await page.fill('[data-testid="forecast-period"]', '30');
    await page.click('[data-testid="execute-forecast-button"]');
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-bar"]')).toHaveAttribute('value', '0');
    await expect(page.locator('[data-testid="progress-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-bar"]')).toHaveAttribute('value', '100', { timeout: 30000 });
  });

  test('SCEN-187: 予測処理中の他操作無効化確認', async ({ page }) => {
    // SCEN-187
    await page.click('[data-testid="demand-forecast-menu"]');
    await page.waitForURL(`${BASE_URL}/demand-forecast`);
    await page.selectOption('[data-testid="product-select"]', 'product1');
    await page.fill('[data-testid="forecast-period"]', '30');
    await page.click('[data-testid="forecast-start-button"]');
    await expect(page.locator('[data-testid="loading-screen"]')).toBeVisible();
    await expect(page.locator('[data-testid="forecast-start-button"]')).toBeDisabled();
    await expect(page.locator('[data-testid="product-select"]')).toBeDisabled();
    await expect(page.locator('[data-testid="forecast-period"]')).toBeDisabled();
    await expect(page.locator('[data-testid="forecast-result"]')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('[data-testid="forecast-start-button"]')).toBeEnabled();
  });
});