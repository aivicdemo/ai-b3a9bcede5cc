import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("発注管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="password"]', 'testpass');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('店舗選択して商品一覧が表示される', async ({ page }) => {
    // SCEN-106
    await page.goto(`${BASE_URL}/order-management`);
    await page.click('[data-testid="store-selector"]');
    await page.click('[data-testid="store-option-1"]');
    await page.waitForSelector('[data-testid="product-list"]');
    await expect(page.locator('[data-testid="product-item"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-code"]')).toBeVisible();
    await expect(page.locator('[data-testid="stock-quantity"]')).toBeVisible();
  });

  test('商品カテゴリで絞り込みできる', async ({ page }) => {
    // SCEN-107
    await page.goto(`${BASE_URL}/order-management`);
    await page.click('[data-testid="category-selector"]');
    await page.click('[data-testid="category-food"]');
    await page.click('[data-testid="apply-filter"]');
    await expect(page.locator('[data-testid="product-item"]')).toBeVisible();
    
    await page.click('[data-testid="category-selector"]');
    await page.click('[data-testid="category-daily-goods"]');
    await page.click('[data-testid="apply-filter"]');
    await expect(page.locator('[data-testid="product-item"]')).toBeVisible();
  });

  test('発注日付範囲で検索できる', async ({ page }) => {
    // SCEN-108
    await page.goto(`${BASE_URL}/order-management`);
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-date"]')).toContainText('2024-01');
  });

  test('商品名で部分一致検索できる', async ({ page }) => {
    // SCEN-109
    await page.goto(`${BASE_URL}/order-management`);
    await page.fill('[data-testid="product-search"]', 'りんご');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-name"]')).toContainText('りんご');
  });

  test('需要予測結果が正しく表示される', async ({ page }) => {
    // SCEN-110
    await page.goto(`${BASE_URL}/order-management`);
    await page.click('[data-testid="product-selector"]');
    await page.click('[data-testid="prediction-period"]');
    await page.click('[data-testid="execute-prediction"]');
    await expect(page.locator('[data-testid="prediction-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="prediction-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="prediction-value"]')).toBeVisible();
  });

  test('推奨発注量で発注処理できる', async ({ page }) => {
    // SCEN-111
    await page.goto(`${BASE_URL}/order-management`);
    await page.fill('[data-testid="product-search"]', 'テスト商品');
    await page.click('[data-testid="search-button"]');
    await page.click('[data-testid="select-product"]');
    await expect(page.locator('[data-testid="recommended-quantity"]')).toBeVisible();
    await page.click('[data-testid="use-recommended"]');
    await page.fill('[data-testid="supplier"]', 'テスト業者');
    await page.fill('[data-testid="delivery-date"]', '2024-02-01');
    await page.click('[data-testid="confirm-order"]');
    await page.click('[data-testid="execute-order"]');
    await expect(page.locator('[data-testid="order-complete-message"]')).toBeVisible();
  });

  test('発注量を手動調整して発注できる', async ({ page }) => {
    // SCEN-112
    await page.goto(`${BASE_URL}/order-management`);
    await page.click('[data-testid="select-product"]');
    await expect(page.locator('[data-testid="recommended-quantity"]')).toBeVisible();
    await page.fill('[data-testid="order-quantity"]', '50');
    await page.click('[data-testid="execute-order"]');
    await expect(page.locator('[data-testid="order-quantity-confirm"]')).toContainText('50');
    await page.click('[data-testid="confirm-order"]');
    await expect(page.locator('[data-testid="order-complete"]')).toBeVisible();
  });

  test('発注理由を入力して発注できる', async ({ page }) => {
    // SCEN-113
    await page.goto(`${BASE_URL}/order-management`);
    await page.click('[data-testid="new-order-button"]');
    await page.click('[data-testid="product-selector"]');
    await page.fill('[data-testid="order-quantity"]', '10');
    await page.fill('[data-testid="order-reason"]', '在庫不足のため緊急発注');
    await page.click('[data-testid="supplier-selector"]');
    await page.click('[data-testid="execute-order"]');
    await expect(page.locator('[data-testid="order-complete"]')).toBeVisible();
  });

  test('店舗未選択で商品一覧が表示されない', async ({ page }) => {
    // SCEN-114
    await page.goto(`${BASE_URL}/order-management`);
    await expect(page.locator('[data-testid="store-selector"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-list"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="select-store-message"]')).toContainText('店舗を選択してください');
  });

  test('存在しない商品名で検索結果なし', async ({ page }) => {
    // SCEN-115
    await page.goto(`${BASE_URL}/order-management`);
    await page.fill('[data-testid="product-search"]', '存在しない商品XYZ123');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="no-results-message"]')).toContainText('該当する商品が見つかりません');
    await expect(page.locator('[data-testid="search-results"]')).toBeEmpty();
  });

  test('発注量に文字列入力でエラー', async ({ page }) => {
    // SCEN-116
    await page.goto(`${BASE_URL}/order-management`);
    await page.click('[data-testid="select-product"]');
    await page.fill('[data-testid="order-quantity"]', 'あいうえお');
    await page.click('[data-testid="order-register-button"]');
    await expect(page.locator('[data-testid="quantity-error"]')).toContainText('発注量は数値で入力してください');
    await expect(page.locator('[data-testid="order-complete"]')).not.toBeVisible();
  });

  test('発注量にマイナス値入力でエラー', async ({ page }) => {
    // SCEN-117
    await page.goto(`${BASE_URL}/order-management`);
    await page.click('[data-testid="select-product"]');
    await page.fill('[data-testid="order-quantity"]', '-10');
    await page.click('[data-testid="order-register-button"]');
    await expect(page.locator('[data-testid="quantity-error"]')).toContainText('発注量は正の数値を入力してください');
    await expect(page.locator('[data-testid="order-complete"]')).not.toBeVisible();
  });

  test('発注量未入力で発注処理エラー', async ({ page }) => {
    // SCEN-118
    await page.goto(`${BASE_URL}/order-management`);
    await page.click('[data-testid="select-product"]');
    await page.click('[data-testid="supplier-selector"]');
    await page.click('[data-testid="execute-order"]');
    await expect(page.locator('[data-testid="quantity-required-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-complete"]')).not.toBeVisible();
  });

  test('発注量ゼロで発注処理', async ({ page }) => {
    // SCEN-119
    await page.goto(`${BASE_URL}/order-management`);
    await page.click('[data-testid="select-product"]');
    await page.fill('[data-testid="order-quantity"]', '0');
    await page.click('[data-testid="supplier-selector"]');
    await page.click('[data-testid="order-process-button"]');
    await expect(page.locator('[data-testid="zero-quantity-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-complete"]')).not.toBeVisible();
  });

  test('発注量上限値で発注処理', async ({ page }) => {
    // SCEN-120
    await page.goto(`${BASE_URL}/order-management`);
    await page.click('[data-testid="select-product"]');
    await page.fill('[data-testid="order-quantity"]', '9999');
    await page.click('[data-testid="supplier-selector"]');
    await page.fill('[data-testid="delivery-date"]', '2024-02-01');
    await page.click('[data-testid="order-process-button"]');
    await page.click('[data-testid="confirm-dialog-ok"]');
    await expect(page.locator('[data-testid="order-complete-message"]')).toBeVisible();
  });

  test('発注日付の開始日と終了日が同日', async ({ page }) => {
    // SCEN-121
    await page.goto(`${BASE_URL}/order-management`);
    await page.fill('[data-testid="start-date"]', '2024-01-15');
    await page.fill('[data-testid="end-date"]', '2024-01-15');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    const orderDates = page.locator('[data-testid="order-date"]');
    if (await orderDates.count() > 0) {
      await expect(orderDates.first()).toContainText('2024-01-15');
    } else {
      await expect(page.locator('[data-testid="no-data-message"]')).toBeVisible();
    }
  });

  test('発注日付の終了日が開始日より前でエラー', async ({ page }) => {
    // SCEN-122
    await page.goto(`${BASE_URL}/order-management`);
    await page.fill('[data-testid="start-date"]', '2024-01-15');
    await page.fill('[data-testid="end-date"]', '2024-01-10');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="date-range-error"]')).toContainText('終了日は開始日以降の日付を入力してください');
  });

  test('商品検索ボックスに空文字で全件表示', async ({ page }) => {
    // SCEN-123
    await page.goto(`${BASE_URL}/order-management`);
    await page.fill('[data-testid="product-search"]', '');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-item"]').first()).toBeVisible();
  });
});