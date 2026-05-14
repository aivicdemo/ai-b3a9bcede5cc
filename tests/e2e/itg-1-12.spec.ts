import { test, expect } from '@playwright/test';

test.describe("発注送信処理", () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseUrl}/login`);
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="password"]', 'testpass');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-230: 店舗選択で発注対象一覧が表示される', async ({ page }) => {
    // SCEN-230
    await page.goto(`${baseUrl}/order/send`);
    await page.click('[data-testid="store-select"]');
    await page.click('[data-value="store-001"]');
    await expect(page.locator('[data-testid="order-items-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="item-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-stock"]')).toBeVisible();
    await expect(page.locator('[data-testid="recommended-quantity"]')).toBeVisible();
  });

  test('SCEN-231: 個別チェックボックスで発注データを選択できる', async ({ page }) => {
    // SCEN-231
    await page.goto(`${baseUrl}/order/management`);
    await expect(page.locator('[data-testid="order-data-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="item-checkbox"]').first()).toBeVisible();
    await page.check('[data-testid="item-checkbox"]', { timeout: 5000 });
    await expect(page.locator('[data-testid="item-checkbox"]').first()).toBeChecked();
    await page.check('[data-testid="item-checkbox"]');
    await expect(page.locator('[data-testid="item-checkbox"]')).toHaveCount(2);
    await page.uncheck('[data-testid="item-checkbox"]');
  });

  test('SCEN-232: 全選択チェックボックスで全発注データを選択できる', async ({ page }) => {
    // SCEN-232
    await page.goto(`${baseUrl}/order/management`);
    await expect(page.locator('[data-testid="order-data-list"]')).toBeVisible();
    await page.check('[data-testid="select-all-checkbox"]');
    await expect(page.locator('[data-testid="item-checkbox"]')).toBeChecked();
    await page.uncheck('[data-testid="select-all-checkbox"]');
    await expect(page.locator('[data-testid="item-checkbox"]')).not.toBeChecked();
  });

  test('SCEN-233: 選択した発注データを送信できる', async ({ page }) => {
    // SCEN-233
    await page.goto(`${baseUrl}/order/management`);
    await page.check('[data-testid="item-checkbox"]');
    await page.click('[data-testid="send-button"]');
    await page.click('button:has-text("OK")');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-status"]')).toContainText('送信済み');
  });

  test('SCEN-234: 送信後にステータスが更新される', async ({ page }) => {
    // SCEN-234
    await page.goto(`${baseUrl}/order/management`);
    await page.check('[data-testid="item-checkbox"]');
    await expect(page.locator('[data-testid="order-status"]')).toContainText('送信待ち');
    await page.click('[data-testid="send-order-button"]');
    await page.click('button:has-text("OK")');
    await page.reload();
    await expect(page.locator('[data-testid="order-status"]')).toContainText('送信済み');
  });

  test('SCEN-235: 発注金額の合計が正しく計算される', async ({ page }) => {
    // SCEN-235
    await page.goto(`${baseUrl}/order/management`);
    await page.click('[data-testid="add-product-A"]');
    await page.fill('[data-testid="quantity-A"]', '5');
    await page.click('[data-testid="add-product-B"]');
    await page.fill('[data-testid="quantity-B"]', '3');
    await page.click('[data-testid="add-product-C"]');
    await page.fill('[data-testid="quantity-C"]', '2');
    await expect(page.locator('[data-testid="subtotal-A"]')).toContainText('500');
    await expect(page.locator('[data-testid="subtotal-B"]')).toContainText('600');
    await expect(page.locator('[data-testid="subtotal-C"]')).toContainText('300');
    await expect(page.locator('[data-testid="total-amount"]')).toContainText('1,540');
    await page.click('[data-testid="send-order-button"]');
    await expect(page.locator('[data-testid="confirm-total-amount"]')).toContainText('1,540');
  });

  test('SCEN-236: 未選択で送信時にエラーメッセージ表示', async ({ page }) => {
    // SCEN-236
    await page.goto(`${baseUrl}/order/management`);
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    await page.click('[data-testid="send-order-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('発注する商品を選択してください');
  });

  test('SCEN-237: 送信済みデータの重複送信でエラー表示', async ({ page }) => {
    // SCEN-237
    await page.goto(`${baseUrl}/order/management`);
    await page.check('[data-testid="item-checkbox"]');
    await page.click('[data-testid="send-button"]');
    await page.click('button:has-text("OK")');
    await page.check('[data-testid="item-checkbox"]');
    await page.click('[data-testid="send-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('この発注データは既に送信済みです。重複送信はできません。');
  });

  test('SCEN-238: 存在しない店舗選択でエラー表示', async ({ page }) => {
    // SCEN-238
    await page.goto(`${baseUrl}/order/management?storeId=9999`);
    await page.check('[data-testid="item-checkbox"]');
    await page.fill('[data-testid="quantity-input"]', '5');
    await page.click('[data-testid="send-order-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('指定された店舗が存在しません');
  });

  test('SCEN-239: ネットワークエラー時の送信失敗処理', async ({ page, context }) => {
    // SCEN-239
    await page.goto(`${baseUrl}/order/management`);
    await page.fill('[data-testid="product-name"]', 'テスト商品');
    await page.fill('[data-testid="quantity"]', '10');
    await context.setOffline(true);
    await page.click('[data-testid="send-order-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="saved-data"]')).toBeVisible();
    await context.setOffline(false);
  });

  test('SCEN-240: 発注データ0件時の画面表示', async ({ page }) => {
    // SCEN-240
    await page.goto(`${baseUrl}/order/management`);
    await page.click('[data-testid="send-order-button"]');
    await expect(page.locator('[data-testid="no-data-message"]')).toContainText('発注対象のデータがありません');
  });

  test('SCEN-241: 大量発注データの一括選択', async ({ page }) => {
    // SCEN-241
    await page.goto(`${baseUrl}/order/management`);
    await expect(page.locator('[data-testid="order-data-count"]')).toContainText('1000');
    await page.check('[data-testid="select-all-checkbox"]');
    await expect(page.locator('[data-testid="item-checkbox"]')).toBeChecked();
    await page.click('[data-testid="bulk-send-button"]');
    await page.click('button:has-text("OK")');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('SCEN-242: 発注数量0の商品を含む送信', async ({ page }) => {
    // SCEN-242
    await page.goto(`${baseUrl}/order/management`);
    await page.click('[data-testid="create-order-button"]');
    await page.click('[data-testid="select-supplier"]');
    await page.click('[data-testid="add-product-A"]');
    await page.fill('[data-testid="quantity-A"]', '10');
    await page.click('[data-testid="add-product-B"]');
    await page.fill('[data-testid="quantity-B"]', '0');
    await page.click('[data-testid="add-product-C"]');
    await page.fill('[data-testid="quantity-C"]', '5');
    await page.click('[data-testid="send-order-button"]');
    await expect(page.locator('[data-testid="warning-message"]')).toBeVisible();
  });

  test('SCEN-243: 当日日付の発注データ表示', async ({ page }) => {
    // SCEN-243
    await page.goto(`${baseUrl}/order/management`);
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="date-filter"]', today);
    await page.click('[data-testid="apply-filter-button"]');
    await expect(page.locator('[data-testid="order-date"]')).toContainText(today);
    await expect(page.locator('[data-testid="order-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-data-count"]')).toBeVisible();
  });
});