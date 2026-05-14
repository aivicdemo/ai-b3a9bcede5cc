import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("発注実行画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="password"]', 'testpass');
    await page.click('[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test("店舗選択して発注実行できる", async ({ page }) => {
    // SCEN-278
    await page.goto(`${BASE_URL}/order-execution`);
    await page.click('[data-testid="store-select"]');
    await page.click('[data-value="store-001"]');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    await page.fill('[data-testid="quantity-input"]', '10');
    await page.click('[data-testid="execute-order"]');
    await page.click('[data-testid="confirm-ok"]');
    await expect(page.locator('[data-testid="order-complete-message"]')).toBeVisible();
  });

  test("発注日付選択して表示更新される", async ({ page }) => {
    // SCEN-279
    await page.goto(`${BASE_URL}/order-execution`);
    await page.click('[data-testid="order-date"]');
    await page.click('[data-date="2024-12-31"]');
    await expect(page.locator('[data-testid="order-date"]')).toHaveValue('2024-12-31');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
  });

  test("商品カテゴリフィルターで絞り込める", async ({ page }) => {
    // SCEN-280
    await page.goto(`${BASE_URL}/order-execution`);
    await page.selectOption('[data-testid="category-filter"]', '食品');
    await expect(page.locator('[data-category="食品"]')).toBeVisible();
    await page.selectOption('[data-testid="category-filter"]', '日用品');
    await expect(page.locator('[data-category="日用品"]')).toBeVisible();
    await page.selectOption('[data-testid="category-filter"]', '全て');
    await expect(page.locator('[data-testid="product-list"] tr')).toHaveCount(await page.locator('[data-testid="product-list"] tr').count());
  });

  test("発注数量入力で金額が自動計算される", async ({ page }) => {
    // SCEN-281
    await page.goto(`${BASE_URL}/order-execution`);
    await page.click('[data-testid="product-001"]');
    await page.fill('[data-testid="quantity-input"]', '10');
    await page.click('[data-testid="other-element"]');
    await expect(page.locator('[data-testid="amount-display"]')).toContainText('¥');
  });

  test("推奨数量をそのまま発注実行できる", async ({ page }) => {
    // SCEN-282
    await page.goto(`${BASE_URL}/order-execution`);
    await expect(page.locator('[data-testid="recommended-quantity"]')).toBeVisible();
    await page.click('[data-testid="execute-order"]');
    await expect(page.locator('[data-testid="order-confirm-dialog"]')).toBeVisible();
    await page.click('[data-testid="execute-button"]');
    await expect(page.locator('[data-testid="order-complete-message"]')).toBeVisible();
  });

  test("複数商品まとめて発注実行できる", async ({ page }) => {
    // SCEN-283
    await page.goto(`${BASE_URL}/order-execution`);
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    await page.check('[data-testid="product-001-checkbox"]');
    await page.check('[data-testid="product-002-checkbox"]');
    await page.check('[data-testid="product-003-checkbox"]');
    await page.fill('[data-testid="quantity-001"]', '5');
    await page.fill('[data-testid="quantity-002"]', '3');
    await page.fill('[data-testid="quantity-003"]', '7');
    await page.click('[data-testid="bulk-order-execute"]');
    await expect(page.locator('[data-testid="order-confirm-dialog"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-summary"]')).toContainText('商品名');
    await page.click('[data-testid="execute-order"]');
    await expect(page.locator('[data-testid="order-complete-message"]')).toBeVisible();
  });

  test("店舗未選択で発注実行するとエラー", async ({ page }) => {
    // SCEN-284
    await page.goto(`${BASE_URL}/order-execution`);
    await page.click('[data-testid="product-001"]');
    await page.fill('[data-testid="quantity-input"]', '10');
    await page.click('[data-testid="execute-order"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('店舗');
  });

  test("発注数量に負の値入力でエラー", async ({ page }) => {
    // SCEN-285
    await page.goto(`${BASE_URL}/order-execution`);
    await page.click('[data-testid="product-001"]');
    await page.fill('[data-testid="quantity-input"]', '-10');
    await page.click('[data-testid="execute-order"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('正の値');
  });

  test("発注数量に文字列入力でエラー", async ({ page }) => {
    // SCEN-286
    await page.goto(`${BASE_URL}/order-execution`);
    await page.click('[data-testid="product-001"]');
    await page.fill('[data-testid="quantity-input"]', 'abc');
    await page.click('[data-testid="execute-order"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('数値');
  });

  test("発注数量未入力で発注実行するとエラー", async ({ page }) => {
    // SCEN-287
    await page.goto(`${BASE_URL}/order-execution`);
    await page.click('[data-testid="product-001"]');
    await page.click('[data-testid="execute-order"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('未入力');
  });

  test("過去日付選択でエラー", async ({ page }) => {
    // SCEN-288
    await page.goto(`${BASE_URL}/order-execution`);
    await page.click('[data-testid="order-date"]');
    await page.click('[data-date="2020-01-01"]');
    await page.click('[data-testid="product-001"]');
    await page.fill('[data-testid="quantity-input"]', '10');
    await page.click('[data-testid="execute-order"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('本日以降');
  });

  test("発注数量に上限値入力", async ({ page }) => {
    // SCEN-289
    await page.goto(`${BASE_URL}/order-execution`);
    await page.click('[data-testid="product-001"]');
    await page.fill('[data-testid="quantity-input"]', '9999');
    await page.click('[data-testid="execute-order"]');
    await expect(page.locator('[data-testid="order-complete-message"]')).toBeVisible();
  });

  test("発注数量にゼロ入力", async ({ page }) => {
    // SCEN-290
    await page.goto(`${BASE_URL}/order-execution`);
    await page.click('[data-testid="product-001"]');
    await page.fill('[data-testid="quantity-input"]', '0');
    await page.click('[data-testid="execute-order"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('1以上');
  });

  test("発注数量に小数点入力", async ({ page }) => {
    // SCEN-291
    await page.goto(`${BASE_URL}/order-execution`);
    await page.click('[data-testid="product-001"]');
    await page.fill('[data-testid="quantity-input"]', '10.5');
    await page.click('[data-testid="order-confirm"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test("商品データ0件での画面表示", async ({ page }) => {
    // SCEN-292
    await page.goto(`${BASE_URL}/order-execution?empty=true`);
    await expect(page.locator('[data-testid="no-data-message"]')).toContainText('データがありません');
    await expect(page.locator('[data-testid="execute-order"]')).toBeDisabled();
  });

  test("大量商品データでの表示性能", async ({ page }) => {
    // SCEN-293
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/order-execution?bulk=true`);
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible({ timeout: 3000 });
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
    
    const filterStart = Date.now();
    await page.selectOption('[data-testid="category-filter"]', '食品');
    await expect(page.locator('[data-category="食品"]')).toBeVisible({ timeout: 1000 });
    const filterTime = Date.now() - filterStart;
    expect(filterTime).toBeLessThan(1000);

    const scrollStart = Date.now();
    await page.mouse.wheel(0, 5000);
    await expect(page.locator('[data-testid="load-more"]')).toBeVisible({ timeout: 2000 });
    const scrollTime = Date.now() - scrollStart;
    expect(scrollTime).toBeLessThan(2000);
  });
});