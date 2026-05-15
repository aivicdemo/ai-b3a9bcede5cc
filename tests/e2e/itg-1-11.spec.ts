import { test, expect } from '@playwright/test';

test.describe("発注書作成画面", () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000");
  });

  test("SCEN-223: 店舗選択して発注書が正常作成できる", async ({ page }) => {
    // SCEN-223
    await page.goto("/order-creation");
    await page.selectOption('[data-testid="store-select"]', 'store-001');
    await page.selectOption('[data-testid="category-select"]', 'category-001');
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await page.fill('[data-testid="quantity-input"]', '10');
    await page.fill('[data-testid="order-date-input"]', '2024-01-15');
    await page.fill('[data-testid="delivery-date-input"]', '2024-01-20');
    await page.click('[data-testid="create-order-button"]');
    await page.waitForURL('**/order-list');
    await expect(page).toHaveURL(/order-list/);
  });

  test("SCEN-224: 発注日付を設定して発注書作成できる", async ({ page }) => {
    // SCEN-224
    await page.goto("/order-creation");
    await page.click('[data-testid="order-date-input"]');
    await page.fill('[data-testid="order-date-input"]', '2024-01-15');
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await page.fill('[data-testid="quantity-input"]', '5');
    await page.selectOption('[data-testid="supplier-select"]', 'supplier-001');
    await page.click('[data-testid="create-order-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test("SCEN-225: 納期を指定して発注書作成できる", async ({ page }) => {
    // SCEN-225
    await page.goto("/order-management");
    await page.click('[data-testid="new-order-button"]');
    await expect(page).toHaveURL(/order-creation/);
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await page.fill('[data-testid="quantity-input"]', '20');
    await page.click('[data-testid="delivery-date-picker"]');
    await page.click('[data-testid="date-2024-01-25"]');
    await page.selectOption('[data-testid="supplier-select"]', 'supplier-001');
    await page.click('[data-testid="create-order-button"]');
    await page.waitForURL('**/order-list');
    await expect(page.locator('[data-testid="delivery-date"]')).toContainText('2024-01-25');
  });

  test("SCEN-226: 商品カテゴリ選択で商品一覧表示される", async ({ page }) => {
    // SCEN-226
    await page.goto("/order-creation");
    await page.selectOption('[data-testid="category-select"]', '食品');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-code"]')).toBeVisible();
    await expect(page.locator('[data-testid="unit-price"]')).toBeVisible();
  });

  test("SCEN-227: 商品検索で対象商品が絞り込める", async ({ page }) => {
    // SCEN-227
    await page.goto("/order-creation");
    await page.fill('[data-testid="product-search-input"]', 'ノート');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-item"]')).toContainText('ノート');
  });

  test("SCEN-228: AI予測数量が正しく表示される", async ({ page }) => {
    // SCEN-228
    await page.goto("/order-creation");
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await page.fill('[data-testid="period-start-date"]', '2024-01-01');
    await page.fill('[data-testid="period-end-date"]', '2024-01-31');
    await page.click('[data-testid="ai-prediction-button"]');
    await expect(page.locator('[data-testid="predicted-quantity"]')).toBeVisible();
    await expect(page.locator('[data-testid="predicted-quantity"]')).toContainText(/\d+/);
  });

  test("SCEN-229: 手動調整数量で予測値を変更できる", async ({ page }) => {
    // SCEN-229
    await page.goto("/order-creation");
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await expect(page.locator('[data-testid="predicted-quantity"]')).toBeVisible();
    await page.fill('[data-testid="manual-adjustment-input"]', '50');
    await page.click('[data-testid="apply-adjustment-button"]');
    await expect(page.locator('[data-testid="predicted-quantity"]')).toContainText('50');
  });

  test("SCEN-230: 予測根拠が正しく表示される", async ({ page }) => {
    // SCEN-230
    await page.goto("/order-creation");
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await page.fill('[data-testid="quantity-input"]', '10');
    await page.click('[data-testid="ai-prediction-button"]');
    await page.click('[data-testid="prediction-basis-button"]');
    await expect(page.locator('[data-testid="prediction-basis"]')).toBeVisible();
    await expect(page.locator('[data-testid="prediction-basis"]')).toContainText(/売上データ|季節性|トレンド/);
  });

  test("SCEN-231: 商品別発注一覧に追加された商品が表示される", async ({ page }) => {
    // SCEN-231
    await page.goto("/order-creation");
    await page.fill('[data-testid="product-search-input"]', 'product-001');
    await page.click('[data-testid="search-button"]');
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await page.fill('[data-testid="quantity-input"]', '15');
    await page.click('[data-testid="add-product-button"]');
    await expect(page.locator('[data-testid="order-item-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-code"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-quantity"]')).toContainText('15');
  });

  test("SCEN-232: 発注総額が正しく計算される", async ({ page }) => {
    // SCEN-232
    await page.goto("/order-creation");
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await page.fill('[data-testid="unit-price-input"]', '1000');
    await page.fill('[data-testid="quantity-input"]', '5');
    await page.click('[data-testid="add-product-button"]');
    await page.selectOption('[data-testid="product-select"]', 'product-002');
    await page.fill('[data-testid="unit-price-input"]', '2000');
    await page.fill('[data-testid="quantity-input"]', '3');
    await page.click('[data-testid="add-product-button"]');
    await page.selectOption('[data-testid="product-select"]', 'product-003');
    await page.fill('[data-testid="unit-price-input"]', '500');
    await page.fill('[data-testid="quantity-input"]', '10');
    await page.click('[data-testid="add-product-button"]');
    await expect(page.locator('[data-testid="total-amount"]')).toContainText('17000');
  });

  test("SCEN-233: 在庫状況が正しく確認できる", async ({ page }) => {
    // SCEN-233
    await page.goto("/order-creation");
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await expect(page.locator('[data-testid="stock-quantity"]')).toBeVisible();
    await expect(page.locator('[data-testid="stock-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="stock-updated-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="stock-quantity"]')).toContainText(/\d+/);
  });

  test("SCEN-234: 過去実績データが正しく参照できる", async ({ page }) => {
    // SCEN-234
    await page.goto("/order-creation");
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await page.click('[data-testid="past-data-button"]');
    await page.selectOption('[data-testid="period-select"]', '過去3ヶ月');
    await page.click('[data-testid="get-data-button"]');
    await expect(page.locator('[data-testid="past-data"]')).toBeVisible();
    await page.selectOption('[data-testid="period-select"]', '過去6ヶ月');
    await page.click('[data-testid="get-data-button"]');
    await expect(page.locator('[data-testid="past-data"]')).toBeVisible();
  });

  test("SCEN-235: 店舗未選択で発注書作成時エラー表示", async ({ page }) => {
    // SCEN-235
    await page.goto("/order-creation");
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await page.fill('[data-testid="quantity-input"]', '10');
    await page.click('[data-testid="create-order-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('店舗を選択してください');
  });

  test("SCEN-236: 発注日付未入力で発注書作成時エラー表示", async ({ page }) => {
    // SCEN-236
    await page.goto("/order-creation");
    await page.selectOption('[data-testid="supplier-select"]', 'supplier-001');
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await page.fill('[data-testid="quantity-input"]', '10');
    await page.click('[data-testid="create-order-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('発注日付');
  });

  test("SCEN-237: 過去日付を発注日に設定時エラー表示", async ({ page }) => {
    // SCEN-237
    await page.goto("/order-creation");
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await page.fill('[data-testid="quantity-input"]', '10');
    await page.fill('[data-testid="order-date-input"]', '2023-12-31');
    await page.click('[data-testid="create-order-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('過去の日付は設定できません');
  });

  test("SCEN-238: 発注日より前の納期設定時エラー表示", async ({ page }) => {
    // SCEN-238
    await page.goto("/order-creation");
    await page.selectOption('[data-testid="supplier-select"]', 'supplier-001');
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await page.fill('[data-testid="quantity-input"]', '10');
    await page.fill('[data-testid="order-date-input"]', '2024-01-15');
    await page.fill('[data-testid="delivery-date-input"]', '2024-01-10');
    await page.click('[data-testid="create-order-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('納期が発注日より前');
  });

  test("SCEN-239: 存在しない商品名で検索時結果なし表示", async ({ page }) => {
    // SCEN-239
    await page.goto("/order-creation");
    await page.fill('[data-testid="product-search-input"]', 'テスト商品999999');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="no-results-message"]')).toContainText('該当する商品が見つかりませんでした');
  });

  test("SCEN-240: 手動調整数量に負の値入力時エラー表示", async ({ page }) => {
    // SCEN-240
    await page.goto("/order-creation");
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await page.fill('[data-testid="manual-adjustment-input"]', '-10');
    await page.click('[data-testid="quantity-input"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('0以上の値を入力してください');
    await expect(page.locator('[data-testid="manual-adjustment-input"]')).toHaveClass(/error/);
  });

  test("SCEN-241: 商品未選択で発注書作成時エラー表示", async ({ page }) => {
    // SCEN-241
    await page.goto("/order-creation");
    await page.fill('[data-testid="quantity-input"]', '100');
    await page.selectOption('[data-testid="supplier-select"]', 'supplier-001');
    await page.click('[data-testid="create-order-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('商品を選択してください');
  });

  test("SCEN-242: 手動調整数量の上限値入力", async ({ page }) => {
    // SCEN-242
    await page.goto("/order-creation");
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await page.click('[data-testid="add-product-button"]');
    await page.click('[data-testid="manual-adjustment-input"]');
    await page.fill('[data-testid="manual-adjustment-input"]', '9999');
    await page.click('[data-testid="quantity-input"]');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="order-quantity"]')).toContainText('9999');
  });

  test("SCEN-243: 手動調整数量にゼロ入力", async ({ page }) => {
    // SCEN-243
    await page.goto("/order-creation");
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await page.fill('[data-testid="manual-adjustment-input"]', '0');
    await page.click('[data-testid="quantity-input"]');
    await expect(page.locator('[data-testid="order-quantity"]')).toContainText('0');
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });

  test("SCEN-244: 商品検索で部分一致検索", async ({ page }) => {
    // SCEN-244
    await page.goto("/order-creation");
    await page.fill('[data-testid="product-search-input"]', 'ノート');
    await page.press('[data-testid="product-search-input"]', 'Enter');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-name"]')).toContainText('ノート');
    await page.click('[data-testid="select-product-button"]');
    await expect(page.locator('[data-testid="order-item-list"]')).toBeVisible();
  });

  test("SCEN-245: 発注日当日の納期設定", async ({ page }) => {
    // SCEN-245
    await page.goto("/order-creation");
    await page.selectOption('[data-testid="supplier-select"]', 'supplier-001');
    await page.selectOption('[data-testid="product-select"]', 'product-001');
    await page.fill('[data-testid="quantity-input"]', '5');
    const today = new Date().toISOString().split('T')[0];
    await expect(page.locator('[data-testid="order-date-input"]')).toHaveValue(today);
    await page.fill('[data-testid="delivery-date-input"]', today);
    await page.click('[data-testid="create-order-button"]');
    await page.waitForURL('**/order-list');
    await expect(page).toHaveURL(/order-list/);
  });

  test("SCEN-246: 商品一覧の最大表示件数", async ({ page }) => {
    // SCEN-246
    await page.goto("/order-creation");
    await page.selectOption('[data-testid="items-per-page"]', '最大');
    await page.fill('[data-testid="product-search-input"]', '');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    const itemCount = await page.locator('[data-testid="product-item"]').count();
    expect(itemCount).toBeGreaterThan(0);
  });

});