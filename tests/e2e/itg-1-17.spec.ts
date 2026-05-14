import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("モデル設定画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-316: 全項目入力してモデル作成', async ({ page }) => {
    // SCEN-316
    await page.goto(`${BASE_URL}/model-settings`);
    await page.fill('[data-testid="model-name"]', '需要予測モデル_テスト');
    await page.selectOption('[data-testid="product-category"]', 'food');
    await page.fill('[data-testid="prediction-period"]', '30');
    await page.selectOption('[data-testid="algorithm-type"]', 'machine-learning');
    await page.selectOption('[data-testid="learning-period"]', '12months');
    await page.fill('[data-testid="accuracy-threshold"]', '85');
    await page.check('[data-testid="seasonal-factor"]');
    await page.fill('[data-testid="external-factors"]', '天気,イベント');
    await page.check('[data-testid="alert-notification"]');
    await page.click('[data-testid="create-model-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('モデルが正常に作成されました');
  });

  test('SCEN-317: 既存モデルの設定変更', async ({ page }) => {
    // SCEN-317
    await page.goto(`${BASE_URL}/model-settings`);
    await page.click('[data-testid="existing-model"]:first-child');
    await page.click('[data-testid="edit-settings-button"]');
    await page.fill('[data-testid="prediction-period"]', '60');
    await page.selectOption('[data-testid="learning-period"]', '6months');
    await page.fill('[data-testid="importance-parameter"]', '0.8');
    await page.click('[data-testid="save-button"]');
    await page.click('[data-testid="confirm-ok"]');
    await expect(page.locator('[data-testid="change-complete-message"]')).toBeVisible();
  });

  test('SCEN-318: 複数商品カテゴリ選択でモデル作成', async ({ page }) => {
    // SCEN-318
    await page.goto(`${BASE_URL}/model-settings`);
    await page.click('[data-testid="new-model-button"]');
    await page.fill('[data-testid="model-name"]', '複数カテゴリテストモデル');
    await page.check('[data-testid="category-food"]');
    await page.check('[data-testid="category-daily-goods"]');
    await page.check('[data-testid="category-clothing"]');
    await page.fill('[data-testid="prediction-period"]', '30');
    await page.fill('[data-testid="learning-period"]', '90');
    await page.click('[data-testid="create-model-button"]');
    await page.click('[data-testid="confirm-ok"]');
    await expect(page.locator('[data-testid="model-list"] >> text=複数カテゴリテストモデル')).toBeVisible();
  });

  test('SCEN-319: 全データソース選択でモデル作成', async ({ page }) => {
    // SCEN-319
    await page.goto(`${BASE_URL}/model-settings`);
    await page.click('[data-testid="new-model-button"]');
    await page.fill('[data-testid="model-name"]', '全データソーステスト');
    await page.check('[data-testid="select-all-datasources"]');
    await page.fill('[data-testid="prediction-period"]', '3months');
    await page.selectOption('[data-testid="learning-algorithm"]', 'auto-select');
    await page.click('[data-testid="create-model-start-button"]');
    await expect(page.locator('[data-testid="creation-progress"]')).toBeVisible();
    await page.waitForSelector('[data-testid="creation-complete"]', { timeout: 60000 });
    await expect(page.locator('[data-testid="model-list"] >> text=全データソーステスト')).toBeVisible();
  });

  test('SCEN-320: モデル名未入力で保存', async ({ page }) => {
    // SCEN-320
    await page.goto(`${BASE_URL}/model-settings`);
    await page.fill('[data-testid="prediction-target"]', 'test-target');
    await page.fill('[data-testid="learning-period"]', '30');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('モデル名');
  });

  test('SCEN-321: 既存モデル名で重複登録', async ({ page }) => {
    // SCEN-321
    await page.goto(`${BASE_URL}/model-settings`);
    await page.click('[data-testid="new-model-button"]');
    await page.fill('[data-testid="model-name"]', '既存モデル名');
    await page.fill('[data-testid="prediction-period"]', '30');
    await page.fill('[data-testid="learning-data-range"]', '90');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('このモデル名は既に使用されています');
  });

  test('SCEN-322: 対象店舗未選択で保存', async ({ page }) => {
    // SCEN-322
    await page.goto(`${BASE_URL}/model-settings`);
    await page.fill('[data-testid="model-name"]', 'テストモデル');
    await page.fill('[data-testid="prediction-period"]', '30');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('対象店舗');
  });

  test('SCEN-323: 商品カテゴリ未選択で保存', async ({ page }) => {
    // SCEN-323
    await page.goto(`${BASE_URL}/model-settings`);
    await page.fill('[data-testid="model-name"]', 'テストモデル');
    await page.fill('[data-testid="prediction-period"]', '30');
    await page.selectOption('[data-testid="algorithm"]', 'linear-regression');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('商品カテゴリ');
  });

  test('SCEN-324: 学習期間の開始日が終了日より後', async ({ page }) => {
    // SCEN-324
    await page.goto(`${BASE_URL}/model-settings`);
    await page.fill('[data-testid="learning-end-date"]', '2024-01-31');
    await page.fill('[data-testid="learning-start-date"]', '2024-02-15');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('開始日は終了日より前の日付を設定してください');
  });

  test('SCEN-325: 学習期間が未来日', async ({ page }) => {
    // SCEN-325
    await page.goto(`${BASE_URL}/model-settings`);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0];
    await page.fill('[data-testid="learning-start-date"]', tomorrowStr);
    await page.fill('[data-testid="learning-end-date"]', dayAfterTomorrowStr);
    await page.fill('[data-testid="model-name"]', 'テストモデル');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('学習期間に未来の日付は設定できません');
  });

  test('SCEN-326: データソース未選択で保存', async ({ page }) => {
    // SCEN-326
    await page.goto(`${BASE_URL}/model-settings`);
    await page.fill('[data-testid="model-name"]', 'テストモデル001');
    await page.fill('[data-testid="prediction-period"]', '30');
    await page.selectOption('[data-testid="algorithm"]', 'neural-network');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('データソースを選択してください');
  });

  test('SCEN-327: アルゴリズム未選択で保存', async ({ page }) => {
    // SCEN-327
    await page.goto(`${BASE_URL}/model-settings`);
    await page.fill('[data-testid="model-name"]', 'テストモデル');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('アルゴリズム');
  });

  test('SCEN-328: モデル精度目標値が範囲外', async ({ page }) => {
    // SCEN-328
    await page.goto(`${BASE_URL}/model-settings`);
    await page.fill('[data-testid="accuracy-target"]', '150');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('有効範囲外');
  });

  test('SCEN-329: 重み付け設定の合計値が100%以外', async ({ page }) => {
    // SCEN-329
    await page.goto(`${BASE_URL}/model-settings`);
    await page.fill('[data-testid="weight-sales"]', '40');
    await page.fill('[data-testid="weight-inventory"]', '30');
    await page.fill('[data-testid="weight-season"]', '10');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('重み付けの合計値が100%');
  });

  test('SCEN-330: モデル名最大文字数入力', async ({ page }) => {
    // SCEN-330
    await page.goto(`${BASE_URL}/model-settings`);
    const maxString = 'a'.repeat(255);
    await page.fill('[data-testid="model-name"]', maxString);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="model-name-display"]')).toContainText(maxString);
  });

  test('SCEN-331: 学習期間を1日のみ設定', async ({ page }) => {
    // SCEN-331
    await page.goto(`${BASE_URL}/model-settings`);
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="learning-start-date"]', today);
    await page.fill('[data-testid="learning-end-date"]', today);
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('SCEN-332: 学習期間を最大範囲設定', async ({ page }) => {
    // SCEN-332
    await page.goto(`${BASE_URL}/model-settings`);
    await page.fill('[data-testid="learning-start-date"]', '2020-01-01');
    await page.fill('[data-testid="learning-end-date"]', '2024-12-31');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('SCEN-333: 学習率を最小値設定', async ({ page }) => {
    // SCEN-333
    await page.goto(`${BASE_URL}/model-settings`);
    await page.fill('[data-testid="learning-rate"]', '0.00001');
    await page.click('[data-testid="save-button"]');
    await page.click('[data-testid="confirm-ok"]');
    await expect(page.locator('[data-testid="save-complete-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="learning-rate"]')).toHaveValue('0.00001');
  });

  test('SCEN-334: 学習率を最大値設定', async ({ page }) => {
    // SCEN-334
    await page.goto(`${BASE_URL}/model-settings`);
    await page.fill('[data-testid="learning-rate"]', '1.0');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="save-complete-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="learning-rate"]')).toHaveValue('1.0');
  });

  test('SCEN-335: 精度目標値を0%設定', async ({ page }) => {
    // SCEN-335
    await page.goto(`${BASE_URL}/model-settings`);
    await page.fill('[data-testid="accuracy-target"]', '0');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('SCEN-336: 精度目標値を100%設定', async ({ page }) => {
    // SCEN-336
    await page.goto(`${BASE_URL}/model-settings`);
    await page.fill('[data-testid="accuracy-target"]', '100');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('SCEN-337: 季節性パラメータに数値以外入力', async ({ page }) => {
    // SCEN-337
    await page.goto(`${BASE_URL}/model-settings`);
    await page.fill('[data-testid="seasonal-parameter"]', 'abc');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('数値');
  });
});