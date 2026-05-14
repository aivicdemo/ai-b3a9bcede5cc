import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("発注書作成画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('#login-button');
    await page.waitForURL('**/dashboard');
  });

  test('店舗選択して発注書作成完了', async ({ page }) => {
    // SCEN-210
    await page.goto(`${baseURL}/order/create`);
    await page.selectOption('#store-select', 'store-001');
    await page.selectOption('#category-select', 'food');
    await page.click('#product-search');
    await page.click('[data-testid="product-item-001"]');
    await page.fill('#quantity-001', '100');
    await page.fill('#order-date', '2024-02-15');
    await page.fill('#delivery-date', '2024-02-20');
    await page.fill('#remarks', '通常発注');
    await page.click('#create-order-button');
    await expect(page.locator('.order-number')).toBeVisible();
    await expect(page.locator('.success-message')).toContainText('発注書が作成されました');
  });

  test('発注日付入力して商品検索', async ({ page }) => {
    // SCEN-211
    await page.goto(`${baseURL}/order/create`);
    await page.fill('#order-date', '2024-01-15');
    await page.click('#product-search-button');
    await page.waitForSelector('.product-list');
    await expect(page.locator('.product-item')).toHaveCountGreaterThan(0);
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  test('納期指定して発注総額表示', async ({ page }) => {
    // SCEN-212
    await page.goto(`${baseURL}/order/create`);
    await page.click('[data-testid="product-001"]');
    await page.fill('#quantity-001', '50');
    await page.fill('#delivery-date', '2024-03-01');
    await page.click('#calculate-total-button');
    await expect(page.locator('#total-amount')).toBeVisible();
    await expect(page.locator('#total-amount')).not.toHaveText('¥0');
  });

  test('商品カテゴリ選択して一覧表示', async ({ page }) => {
    // SCEN-213
    await page.goto(`${baseURL}/order/create`);
    await page.click('#category-dropdown');
    await expect(page.locator('.category-option')).toHaveCountGreaterThan(0);
    await page.selectOption('#category-select', 'food');
    await page.click('#search-button');
    await expect(page.locator('.product-list .product-item')).toHaveCountGreaterThan(0);
    await expect(page.locator('.product-name')).toBeVisible();
    await expect(page.locator('.product-code')).toBeVisible();
  });

  test('AI予測数量を手動調整', async ({ page }) => {
    // SCEN-214
    await page.goto(`${baseURL}/order/create`);
    await page.click('[data-testid="product-001"]');
    await expect(page.locator('#ai-predicted-quantity')).not.toHaveValue('');
    await page.click('#predicted-quantity-input');
    await page.fill('#predicted-quantity-input', '200');
    await page.click('#save-quantity-button');
    await expect(page.locator('#predicted-quantity-input')).toHaveValue('200');
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  test('予測根拠表示で詳細確認', async ({ page }) => {
    // SCEN-215
    await page.goto(`${baseURL}/order/create`);
    await page.click('[data-testid="product-001"]');
    await expect(page.locator('#predicted-quantity')).not.toHaveValue('');
    await page.click('#prediction-basis-button');
    await expect(page.locator('#prediction-basis-dialog')).toBeVisible();
    await expect(page.locator('.sales-data')).toBeVisible();
    await expect(page.locator('.seasonal-factor')).toBeVisible();
    await expect(page.locator('.trend-analysis')).toBeVisible();
    await expect(page.locator('.prediction-accuracy')).toBeVisible();
    await page.click('#close-dialog-button');
    await expect(page.locator('#prediction-basis-dialog')).not.toBeVisible();
  });

  test('在庫状況確認して発注数量決定', async ({ page }) => {
    // SCEN-216
    await page.goto(`${baseURL}/order/create`);
    await page.click('[data-testid="product-001"]');
    await page.click('#check-inventory-button');
    await expect(page.locator('.current-stock')).toBeVisible();
    await expect(page.locator('.safety-stock')).toBeVisible();
    await expect(page.locator('.lead-time')).toBeVisible();
    await expect(page.locator('.recommended-quantity')).toBeVisible();
    await page.fill('#order-quantity-input', '150');
    await page.click('#confirm-quantity-button');
    await expect(page.locator('#order-quantity-input')).toHaveValue('150');
  });

  test('過去実績参照して数量調整', async ({ page }) => {
    // SCEN-217
    await page.goto(`${baseURL}/order/create`);
    await page.click('[data-testid="product-001"]');
    await page.click('#view-history-button');
    await expect(page.locator('.history-data')).toBeVisible();
    await expect(page.locator('.past-orders')).toHaveCountGreaterThan(0);
    await page.fill('#adjusted-quantity', '120');
    await page.click('#save-adjustment-button');
    await expect(page.locator('#adjusted-quantity')).toHaveValue('120');
  });

  test('店舗未選択で発注実行', async ({ page }) => {
    // SCEN-218
    await page.goto(`${baseURL}/order/create`);
    await page.click('[data-testid="product-001"]');
    await page.fill('#quantity-001', '10');
    await page.click('#create-order-button');
    await expect(page.locator('.error-message')).toContainText('店舗を選択してください');
    await expect(page.locator('.order-number')).not.toBeVisible();
  });

  test('発注日付空欄でエラー表示', async ({ page }) => {
    // SCEN-219
    await page.goto(`${baseURL}/order/create`);
    await page.selectOption('#store-select', 'store-001');
    await page.click('[data-testid="product-001"]');
    await page.fill('#quantity-001', '10');
    await page.click('#create-order-button');
    await expect(page.locator('.error-message')).toContainText('発注日付を入力してください');
  });

  test('納期が発注日より過去でエラー', async ({ page }) => {
    // SCEN-220
    await page.goto(`${baseURL}/order/create`);
    await page.selectOption('#store-select', 'store-001');
    await page.click('[data-testid="product-001"]');
    await page.fill('#quantity-001', '10');
    await page.fill('#order-date', '2024-02-15');
    await page.fill('#delivery-date', '2024-02-10');
    await page.click('#create-order-button');
    await expect(page.locator('.error-message')).toContainText('納期は発注日より後の日付を入力してください');
  });

  test('商品未選択で発注実行', async ({ page }) => {
    // SCEN-221
    await page.goto(`${baseURL}/order/create`);
    await page.selectOption('#store-select', 'store-001');
    await page.fill('#order-date', '2024-02-15');
    await page.click('#create-order-button');
    await expect(page.locator('.error-message')).toContainText('商品を選択してください');
  });

  test('発注数量にマイナス値入力', async ({ page }) => {
    // SCEN-222
    await page.goto(`${baseURL}/order/create`);
    await page.selectOption('#store-select', 'store-001');
    await page.click('[data-testid="product-001"]');
    await page.fill('#quantity-001', '-10');
    await page.fill('#order-date', '2024-02-15');
    await page.fill('#delivery-date', '2024-02-20');
    await page.click('#create-order-button');
    await expect(page.locator('.error-message')).toContainText('発注数量は正の値を入力してください');
  });

  test('発注数量に文字列入力', async ({ page }) => {
    // SCEN-223
    await page.goto(`${baseURL}/order/create`);
    await page.selectOption('#store-select', 'store-001');
    await page.click('[data-testid="product-001"]');
    await page.fill('#quantity-001', 'abc');
    await page.fill('#order-date', '2024-02-15');
    await page.click('#create-order-button');
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('存在しない商品名で検索', async ({ page }) => {
    // SCEN-224
    await page.goto(`${baseURL}/order/create`);
    await page.fill('#product-search-input', '存在しない商品XYZ123');
    await page.click('#search-button');
    await expect(page.locator('.error-message')).toContainText('該当する商品が見つかりません');
    await expect(page.locator('.product-list .product-item')).toHaveCount(0);
  });

  test('発注日付に未来の1年後入力', async ({ page }) => {
    // SCEN-225
    await page.goto(`${baseURL}/order/create`);
    await page.selectOption('#store-select', 'store-001');
    await page.fill('#order-date', '2026-01-01');
    await page.click('[data-testid="product-001"]');
    await page.fill('#quantity-001', '10');
    await page.fill('#delivery-date', '2026-01-10');
    await page.click('#save-button');
    await expect(page.locator('.success-message, .warning-message')).toBeVisible();
  });

  test('発注数量に最大値入力', async ({ page }) => {
    // SCEN-226
    await page.goto(`${baseURL}/order/create`);
    await page.selectOption('#store-select', 'store-001');
    await page.click('[data-testid="product-001"]');
    await page.fill('#quantity-001', '999999999');
    await page.fill('#order-date', '2024-02-15');
    await page.fill('#delivery-date', '2024-02-20');
    await page.click('#create-order-button');
    await expect(page.locator('.success-message, .error-message')).toBeVisible();
  });

  test('発注数量にゼロ入力', async ({ page }) => {
    // SCEN-227
    await page.goto(`${baseURL}/order/create`);
    await page.selectOption('#store-select', 'store-001');
    await page.click('[data-testid="product-001"]');
    await page.fill('#quantity-001', '0');
    await page.fill('#order-date', '2024-02-15');
    await page.fill('#delivery-date', '2024-02-20');
    await page.click('#create-button');
    await expect(page.locator('.error-message')).toContainText('発注数量は1以上で入力してください');
  });

  test('商品検索で特殊文字入力', async ({ page }) => {
    // SCEN-228
    await page.goto(`${baseURL}/order/create`);
    await page.fill('#product-search-input', '!@#$%^&*()');
    await page.click('#search-button');
    await expect(page.locator('.search-results')).toBeVisible();
  });

  test('大量商品選択時の動作確認', async ({ page }) => {
    // SCEN-229
    await page.goto(`${baseURL}/order/create`);
    await page.click('#product-selection-modal');
    await page.click('#select-all-checkbox');
    for (let i = 1; i <= 100; i++) {
      await page.click(`[data-testid="product-checkbox-${i}"]`);
    }
    await expect(page.locator('#selected-count')).toContainText('100');
    await page.click('#confirm-selection-button');
    await expect(page.locator('.product-list .product-item')).toHaveCountGreaterThan(50);
    await page.fill('#bulk-quantity-input', '5');
    await page.click('#apply-bulk-quantity');
    await page.click('#save-order-button');
    await expect(page.locator('.success-message, .processing-message')).toBeVisible();
  });
});