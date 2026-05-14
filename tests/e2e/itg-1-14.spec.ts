import { test, expect } from '@playwright/test';

test.describe("在庫照会画面", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test("店舗選択で在庫一覧が表示される", async ({ page }) => {
    // SCEN-262
    await page.goto(`${baseURL}/inventory`);
    await page.click('select[name="store"]');
    await page.selectOption('select[name="store"]', 'store-001');
    await page.click('button[data-testid="search-button"]');
    await expect(page.locator('table.inventory-list')).toBeVisible();
    await expect(page.locator('td[data-testid="product-name"]').first()).toBeVisible();
    await expect(page.locator('td[data-testid="stock-quantity"]').first()).toBeVisible();
    await expect(page.locator('td[data-testid="last-updated"]').first()).toBeVisible();
  });

  test("商品カテゴリフィルタで絞り込める", async ({ page }) => {
    // SCEN-263
    await page.goto(`${baseURL}/inventory`);
    await page.click('select[name="category"]');
    await page.selectOption('select[name="category"]', '食品');
    await page.click('button[data-testid="filter-button"]');
    await expect(page.locator('td[data-testid="category"]').first()).toContainText('食品');
    await page.selectOption('select[name="category"]', '日用品');
    await page.click('button[data-testid="filter-button"]');
    await expect(page.locator('td[data-testid="category"]').first()).toContainText('日用品');
    await page.selectOption('select[name="category"]', '');
    await page.click('button[data-testid="filter-button"]');
    await expect(page.locator('table.inventory-list tbody tr')).toHaveCount(await page.locator('table.inventory-list tbody tr').count());
  });

  test("商品名検索で該当商品が表示される", async ({ page }) => {
    // SCEN-264
    await page.goto(`${baseURL}/inventory`);
    await page.fill('input[name="product-name"]', 'テスト商品');
    await page.click('button[data-testid="search-button"]');
    await expect(page.locator('td[data-testid="product-code"]').first()).toBeVisible();
    await expect(page.locator('td[data-testid="product-name"]').first()).toContainText('テスト商品');
    await expect(page.locator('td[data-testid="stock-quantity"]').first()).toBeVisible();
  });

  test("商品コード検索で該当商品が表示される", async ({ page }) => {
    // SCEN-265
    await page.goto(`${baseURL}/inventory`);
    await page.fill('input[name="product-code"]', 'PROD001');
    await page.click('button[data-testid="search-button"]');
    await expect(page.locator('td[data-testid="product-name"]').first()).toBeVisible();
    await expect(page.locator('td[data-testid="stock-quantity"]').first()).toBeVisible();
    await expect(page.locator('td[data-testid="warehouse-info"]').first()).toBeVisible();
  });

  test("在庫状況フィルタで不足商品のみ表示される", async ({ page }) => {
    // SCEN-266
    await page.goto(`${baseURL}/inventory`);
    await page.click('select[name="stock-status"]');
    await page.selectOption('select[name="stock-status"]', 'shortage');
    await page.click('button[data-testid="filter-button"]');
    await expect(page.locator('td[data-testid="stock-status"]').first()).toContainText('不足');
    const stockQuantity = await page.locator('td[data-testid="stock-quantity"]').first().textContent();
    const safetyStock = await page.locator('td[data-testid="safety-stock"]').first().textContent();
    expect(parseInt(stockQuantity || '0')).toBeLessThan(parseInt(safetyStock || '0'));
  });

  test("検索条件クリアで全商品が表示される", async ({ page }) => {
    // SCEN-267
    await page.goto(`${baseURL}/inventory`);
    await page.fill('input[name="product-name"]', '検索商品');
    await page.selectOption('select[name="category"]', '食品');
    await page.click('button[data-testid="search-button"]');
    const filteredCount = await page.locator('table.inventory-list tbody tr').count();
    await page.click('button[data-testid="clear-button"]');
    const totalCount = await page.locator('table.inventory-list tbody tr').count();
    expect(totalCount).toBeGreaterThan(filteredCount);
  });

  test("在庫一覧テーブルの全列が正しく表示される", async ({ page }) => {
    // SCEN-268
    await page.goto(`${baseURL}/inventory`);
    await expect(page.locator('table.inventory-list')).toBeVisible();
    await expect(page.locator('th[data-testid="product-code-header"]')).toContainText('商品コード');
    await expect(page.locator('th[data-testid="product-name-header"]')).toContainText('商品名');
    await expect(page.locator('th[data-testid="current-stock-header"]')).toContainText('現在庫数');
    await expect(page.locator('th[data-testid="safety-stock-header"]')).toContainText('安全在庫数');
    await expect(page.locator('th[data-testid="reorder-point-header"]')).toContainText('発注点');
    await expect(page.locator('th[data-testid="last-received-header"]')).toContainText('最終入庫日');
    await expect(page.locator('td[data-testid="product-code"]').first()).toBeVisible();
    await expect(page.locator('td[data-testid="product-name"]').first()).toBeVisible();
  });

  test("存在しない商品名で検索結果なし", async ({ page }) => {
    // SCEN-269
    await page.goto(`${baseURL}/inventory`);
    await page.fill('input[name="product-name"]', 'テスト用存在しない商品XYZ123');
    await page.click('button[data-testid="search-button"]');
    await expect(page.locator('[data-testid="no-results-message"]')).toContainText('該当する商品が見つかりません');
    await expect(page.locator('table.inventory-list tbody tr')).toHaveCount(0);
  });

  test("存在しない商品コードで検索結果なし", async ({ page }) => {
    // SCEN-270
    await page.goto(`${baseURL}/inventory`);
    await page.fill('input[name="product-code"]', 'NOTEXIST001');
    await page.click('button[data-testid="search-button"]');
    await expect(page.locator('[data-testid="no-results-message"]')).toContainText('該当する商品が見つかりませんでした');
    await expect(page.locator('table.inventory-list tbody tr')).toHaveCount(0);
  });

  test("店舗未選択で検索するとエラー表示", async ({ page }) => {
    // SCEN-271
    await page.goto(`${baseURL}/inventory`);
    await page.click('button[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('店舗を選択してください');
  });

  test("商品名に特殊文字入力でエラーハンドリング", async ({ page }) => {
    // SCEN-272
    await page.goto(`${baseURL}/inventory`);
    await page.click('input[name="product-name"]');
    await page.fill('input[name="product-name"]', '<script>alert(\'test\')</script>');
    await page.click('button[data-testid="search-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await page.fill('input[name="product-name"]', '\'; DROP TABLE products; --');
    await page.click('button[data-testid="search-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
  });

  test("商品コードに文字入力でエラーハンドリング", async ({ page }) => {
    // SCEN-273
    await page.goto(`${baseURL}/inventory`);
    await page.fill('input[name="product-code"]', 'ABCD');
    await page.click('button[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('商品コードは数値で入力してください');
  });

  test("商品名の最大文字数入力で検索できる", async ({ page }) => {
    // SCEN-274
    await page.goto(`${baseURL}/inventory`);
    const maxLengthProductName = 'A'.repeat(255);
    await page.fill('input[name="product-name"]', maxLengthProductName);
    await page.click('button[data-testid="search-button"]');
    await expect(page.locator('table.inventory-list')).toBeVisible();
  });

  test("商品コードの最大桁数入力で検索できる", async ({ page }) => {
    // SCEN-275
    await page.goto(`${baseURL}/inventory`);
    const maxDigitProductCode = '12345678901234567890';
    await page.fill('input[name="product-code"]', maxDigitProductCode);
    await page.click('button[data-testid="search-button"]');
    await expect(page.locator('td[data-testid="product-name"]').first()).toBeVisible();
    await expect(page.locator('td[data-testid="stock-quantity"]').first()).toBeVisible();
  });

  test("在庫数が0の商品が正しく表示される", async ({ page }) => {
    // SCEN-276
    await page.goto(`${baseURL}/inventory`);
    await page.selectOption('select[name="stock-status"]', 'zero-stock');
    await page.click('button[data-testid="search-button"]');
    await expect(page.locator('td[data-testid="stock-quantity"]').first()).toContainText('0');
    await expect(page.locator('tr[data-testid="zero-stock-row"]').first()).toHaveClass(/zero-stock-highlight/);
  });

  test("安全在庫数と現在在庫数が同値の商品表示", async ({ page }) => {
    // SCEN-277
    await page.goto(`${baseURL}/inventory`);
    await page.fill('input[name="product-code"]', 'SAME001');
    await page.click('button[data-testid="search-button"]');
    const currentStock = await page.locator('td[data-testid="stock-quantity"]').first().textContent();
    const safetyStock = await page.locator('td[data-testid="safety-stock"]').first().textContent();
    expect(currentStock).toBe(safetyStock);
    await expect(page.locator('td[data-testid="stock-status"]').first()).toContainText('警告');
  });
});