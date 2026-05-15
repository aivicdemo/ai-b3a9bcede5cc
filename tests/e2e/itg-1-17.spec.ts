import { test, expect } from '@playwright/test';

const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("モデル設定画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test("SCEN-328: [normal] モデル設定画面 - 全項目入力でモデル作成完了", async ({ page }) => {
    // SCEN-328
    await page.goto(`${baseUrl}/model-settings`);
    await page.fill('[data-testid="model-name-input"]', 'テストモデル001');
    await page.selectOption('[data-testid="target-product-select"]', { index: 1 });
    await page.fill('[data-testid="forecast-period-input"]', '30');
    await page.selectOption('[data-testid="training-period-select"]', '過去1年');
    await page.selectOption('[data-testid="algorithm-select"]', 'ARIMA');
    await page.check('[data-testid="seasonal-adjustment-checkbox"]');
    await page.fill('[data-testid="weather-factor-input"]', 'enabled');
    await page.fill('[data-testid="accuracy-threshold-input"]', '85');
    await page.fill('[data-testid="admin-email-input"]', 'admin@example.com');
    await page.click('[data-testid="create-model-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('モデルの作成が完了しました');
  });

  test("SCEN-329: [normal] モデル設定画面 - 既存モデル編集で設定値更新", async ({ page }) => {
    // SCEN-329
    await page.goto(`${baseUrl}/model-settings`);
    await page.click('[data-testid="model-list-item"]:first-child');
    await page.click('[data-testid="edit-button"]');
    await page.fill('[data-testid="model-name-input"]', '編集後モデル名');
    await page.fill('[data-testid="forecast-period-input"]', '60');
    await page.selectOption('[data-testid="training-period-select"]', '過去2年');
    await page.fill('[data-testid="algorithm-parameter-input"]', '新しいパラメータ');
    await page.click('[data-testid="save-button"]');
    await page.click('[data-testid="confirm-ok-button"]');
    await expect(page.locator('[data-testid="save-complete-message"]')).toBeVisible();
  });

  test("SCEN-330: [normal] モデル設定画面 - 複数データソース選択でモデル作成", async ({ page }) => {
    // SCEN-330
    await page.goto(`${baseUrl}/model-settings`);
    await page.click('[data-testid="new-model-button"]');
    await page.fill('[data-testid="model-name-input"]', '複数データソーステスト');
    await page.check('[data-testid="sales-data-checkbox"]');
    await page.check('[data-testid="inventory-data-checkbox"]');
    await page.check('[data-testid="weather-data-checkbox"]');
    await page.fill('[data-testid="forecast-period-input"]', '30');
    await page.selectOption('[data-testid="algorithm-select"]', '機械学習（自動選択）');
    await page.click('[data-testid="create-model-button"]');
    await expect(page.locator('[data-testid="model-status"]')).toContainText('作成完了');
  });

  test("SCEN-331: [error] モデル設定画面 - モデル名未入力で保存エラー", async ({ page }) => {
    // SCEN-331
    await page.goto(`${baseUrl}/model-settings`);
    await page.fill('[data-testid="model-name-input"]', '');
    await page.selectOption('[data-testid="target-product-select"]', { index: 1 });
    await page.fill('[data-testid="training-period-input"]', '365');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('モデル名');
  });

  test("SCEN-332: [error] モデル設定画面 - 重複モデル名で保存エラー", async ({ page }) => {
    // SCEN-332
    await page.goto(`${baseUrl}/model-settings`);
    await page.click('[data-testid="new-model-button"]');
    await page.fill('[data-testid="model-name-input"]', '季節商品予測モデル');
    await page.fill('[data-testid="forecast-period-input"]', '30');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('重複');
  });

  test("SCEN-333: [error] モデル設定画面 - 対象店舗未選択で保存エラー", async ({ page }) => {
    // SCEN-333
    await page.goto(`${baseUrl}/model-settings`);
    await page.fill('[data-testid="model-name-input"]', 'テストモデル');
    await page.fill('[data-testid="forecast-period-input"]', '30');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('対象店舗');
  });

  test("SCEN-334: [error] モデル設定画面 - 商品カテゴリ未選択で保存エラー", async ({ page }) => {
    // SCEN-334
    await page.goto(`${baseUrl}/model-settings`);
    await page.fill('[data-testid="model-name-input"]', 'テストモデル001');
    await page.fill('[data-testid="forecast-period-input"]', '30');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('商品カテゴリを選択してください');
  });

  test("SCEN-335: [error] モデル設定画面 - 学習期間未来日付で入力エラー", async ({ page }) => {
    // SCEN-335
    await page.goto(`${baseUrl}/model-settings`);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateString = futureDate.toISOString().split('T')[0];
    await page.fill('[data-testid="training-start-date"]', futureDateString);
    await page.fill('[data-testid="training-end-date"]', futureDateString);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('未来の日付は設定できません');
  });

  test("SCEN-336: [error] モデル設定画面 - 学習期間開始終了逆転で入力エラー", async ({ page }) => {
    // SCEN-336
    await page.goto(`${baseUrl}/model-settings`);
    await page.fill('[data-testid="training-end-date"]', '2024-01-01');
    await page.fill('[data-testid="training-start-date"]', '2024-12-31');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('開始日');
  });

  test("SCEN-337: [error] モデル設定画面 - データソース未選択で保存エラー", async ({ page }) => {
    // SCEN-337
    await page.goto(`${baseUrl}/model-settings`);
    await page.fill('[data-testid="model-name-input"]', 'テストモデル');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('データソース');
  });

  test("SCEN-338: [error] モデル設定画面 - モデル精度目標値範囲外で入力エラー", async ({ page }) => {
    // SCEN-338
    await page.goto(`${baseUrl}/model-settings`);
    await page.fill('[data-testid="accuracy-target-input"]', '-10');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('0%から100%の範囲');
  });

  test("SCEN-339: [edge] モデル設定画面 - モデル名最大文字数入力", async ({ page }) => {
    // SCEN-339
    await page.goto(`${baseUrl}/model-settings`);
    await page.click('[data-testid="new-model-button"]');
    const maxLengthString = 'a'.repeat(255);
    await page.fill('[data-testid="model-name-input"]', maxLengthString);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="model-list"]')).toContainText(maxLengthString);
  });

  test("SCEN-340: [edge] モデル設定画面 - 学習率最小値設定", async ({ page }) => {
    // SCEN-340
    await page.goto(`${baseUrl}/model-settings`);
    await page.fill('[data-testid="learning-rate-input"]', '0.0001');
    await page.click('[data-testid="save-button"]');
    await page.fill('[data-testid="learning-rate-input"]', '-0.1');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('バリデーション');
  });

  test("SCEN-341: [edge] モデル設定画面 - 学習率最大値設定", async ({ page }) => {
    // SCEN-341
    await page.goto(`${baseUrl}/model-settings`);
    await page.fill('[data-testid="learning-rate-input"]', '1.0');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test("SCEN-342: [edge] モデル設定画面 - 学習期間最短1日設定", async ({ page }) => {
    // SCEN-342
    await page.goto(`${baseUrl}/model-settings`);
    await page.fill('[data-testid="training-period-input"]', '1');
    await page.selectOption('[data-testid="period-unit-select"]', '日');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test("SCEN-343: [edge] モデル設定画面 - 全商品カテゴリ選択", async ({ page }) => {
    // SCEN-343
    await page.goto(`${baseUrl}/model-settings`);
    await page.check('[data-testid="select-all-categories"]');
    await expect(page.locator('[data-testid="category-checkbox"]')).toBeChecked();
    await page.uncheck('[data-testid="select-all-categories"]');
    await expect(page.locator('[data-testid="category-checkbox"]')).not.toBeChecked();
    await page.check('[data-testid="select-all-categories"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test("SCEN-344: [edge] モデル設定画面 - 全データソース選択", async ({ page }) => {
    // SCEN-344
    await page.goto(`${baseUrl}/model-settings`);
    await page.click('[data-testid="select-all-datasources"]');
    await expect(page.locator('[data-testid="datasource-count"]')).toBeVisible();
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test("SCEN-345: [edge] モデル設定画面 - モデル精度目標値上限設定", async ({ page }) => {
    // SCEN-345
    await page.goto(`${baseUrl}/model-settings`);
    await page.fill('[data-testid="accuracy-target-input"]', '100');
    await page.fill('[data-testid="accuracy-target-input"]', '101');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('バリデーション');
  });
});