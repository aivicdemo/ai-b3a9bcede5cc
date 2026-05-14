import { test, expect } from '@playwright/test';

test.describe("発注量計算処理", () => {
  const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'testpass');
    await page.click('#login-button');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-244: 全項目入力で発注量計算が成功する', async ({ page }) => {
    // SCEN-244
    await page.goto(`${BASE_URL}/order-calculation`);
    await page.fill('#product-code', 'P001');
    await page.fill('#current-stock', '100');
    await page.fill('#safety-stock', '20');
    await page.fill('#lead-time', '7');
    await page.selectOption('#forecast-period', '30');
    await page.selectOption('#order-policy', 'periodic');
    await page.fill('#order-unit', '50');
    await page.click('#calculate-button');
    
    await expect(page.locator('#order-quantity')).toBeVisible();
    await expect(page.locator('#order-timing')).toBeVisible();
    await expect(page.locator('#stock-chart')).toBeVisible();
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  test('SCEN-245: 複数店舗での発注量計算結果が正しく表示される', async ({ page }) => {
    // SCEN-245
    await page.goto(`${BASE_URL}/order-management`);
    await page.check('#store-001');
    await page.check('#store-002');
    await page.check('#store-003');
    await page.selectOption('#product-category', 'food');
    await page.fill('#order-period-start', '2024-01-01');
    await page.fill('#order-period-end', '2024-01-31');
    await page.click('#execute-calculation');
    await page.waitForSelector('#calculation-results');
    
    await expect(page.locator('#store-001-result')).toBeVisible();
    await expect(page.locator('#store-002-result')).toBeVisible();
    await expect(page.locator('#store-003-result')).toBeVisible();
    await expect(page.locator('.calculation-error')).not.toBeVisible();
  });

  test('SCEN-246: 異なる商品カテゴリで計算結果が切り替わる', async ({ page }) => {
    // SCEN-246
    await page.goto(`${BASE_URL}/order-management`);
    
    await page.selectOption('#product-category', 'food');
    await page.click('#calculate-order');
    const foodResult = await page.textContent('#order-result');
    
    await page.selectOption('#product-category', 'daily-goods');
    await page.click('#calculate-order');
    const dailyResult = await page.textContent('#order-result');
    
    await page.selectOption('#product-category', 'clothing');
    await page.click('#calculate-order');
    const clothingResult = await page.textContent('#order-result');
    
    expect(foodResult).not.toEqual(dailyResult);
    expect(dailyResult).not.toEqual(clothingResult);
    expect(foodResult).not.toEqual(clothingResult);
  });

  test('SCEN-247: 計算結果一覧から商品詳細が確認できる', async ({ page }) => {
    // SCEN-247
    await page.goto(`${BASE_URL}/order-calculation`);
    await page.click('#show-results-list');
    await page.click('.product-link').first();
    
    await expect(page.locator('#product-detail')).toBeVisible();
    await expect(page.locator('#product-name')).toBeVisible();
    await expect(page.locator('#product-code')).toBeVisible();
    await expect(page.locator('#stock-info')).toBeVisible();
    await expect(page.locator('#order-history')).toBeVisible();
    await expect(page.locator('#forecast-data')).toBeVisible();
  });

  test('SCEN-248: 店舗未選択で計算実行時エラー表示', async ({ page }) => {
    // SCEN-248
    await page.goto(`${BASE_URL}/order-calculation`);
    await page.selectOption('#product', 'P001');
    await page.fill('#period-start', '2024-01-01');
    await page.fill('#period-end', '2024-01-31');
    await page.click('#calculate-button');
    
    await expect(page.locator('.error-message')).toContainText('店舗を選択してください');
  });

  test('SCEN-249: 商品カテゴリ未選択で計算実行時エラー表示', async ({ page }) => {
    // SCEN-249
    await page.goto(`${BASE_URL}/order-calculation`);
    await page.selectOption('#store', 'store-001');
    await page.fill('#period-start', '2024-01-01');
    await page.fill('#period-end', '2024-01-31');
    await page.click('#calculate-button');
    
    await expect(page.locator('.error-message')).toContainText('商品カテゴリを選択してください');
  });

  test('SCEN-250: 計算対象期間未設定で計算実行時エラー表示', async ({ page }) => {
    // SCEN-250
    await page.goto(`${BASE_URL}/order-calculation`);
    await page.selectOption('#product', 'P001');
    await page.selectOption('#store', 'store-001');
    await page.click('#calculate-button');
    
    await expect(page.locator('.error-message')).toContainText('計算対象期間を設定してください');
  });

  test('SCEN-251: 安全在庫数に負の値入力でエラー表示', async ({ page }) => {
    // SCEN-251
    await page.goto(`${BASE_URL}/order-calculation`);
    await page.fill('#product-code', 'P001');
    await page.fill('#current-stock', '100');
    await page.fill('#forecast-demand', '50');
    await page.fill('#safety-stock', '-10');
    await page.click('#calculate-button');
    
    await expect(page.locator('.error-message')).toContainText('安全在庫数は0以上の値を入力してください');
  });

  test('SCEN-252: リードタイムに0以下入力でエラー表示', async ({ page }) => {
    // SCEN-252
    await page.goto(`${BASE_URL}/order-calculation`);
    await page.selectOption('#product', 'P001');
    await page.fill('#stock-quantity', '100');
    await page.fill('#forecast-value', '50');
    
    await page.fill('#lead-time', '0');
    await page.click('#calculate-button');
    await expect(page.locator('.error-message')).toContainText('リードタイムは1以上の値を入力してください');
    
    await page.fill('#lead-time', '-1');
    await page.click('#calculate-button');
    await expect(page.locator('.error-message')).toContainText('リードタイムは1以上の値を入力してください');
  });

  test('SCEN-253: 発注点に負の値入力でエラー表示', async ({ page }) => {
    // SCEN-253
    await page.goto(`${BASE_URL}/order-calculation`);
    await page.fill('#product-info', 'P001');
    await page.fill('#order-point', '-100');
    await page.click('#execute-calculation');
    
    await expect(page.locator('.error-message')).toContainText('発注点に負の値は入力できません');
  });

  test('SCEN-254: 需要予測データ取得失敗時エラー表示', async ({ page }) => {
    // SCEN-254
    await page.route('**/api/forecast-data', route => route.abort());
    await page.goto(`${BASE_URL}/order-management`);
    await page.click('#execute-order-calculation');
    
    await expect(page.locator('.error-message')).toContainText('需要予測データの取得に失敗しました');
  });

  test('SCEN-255: 在庫データ取得失敗時エラー表示', async ({ page }) => {
    // SCEN-255
    await page.route('**/api/stock-data', route => route.abort());
    await page.goto(`${BASE_URL}/order-management`);
    await page.selectOption('#product', 'P001');
    await page.click('#execute-order-calculation');
    
    await expect(page.locator('.error-message')).toContainText('在庫データの取得に失敗しました');
  });

  test('SCEN-256: 安全在庫数上限値での計算実行', async ({ page }) => {
    // SCEN-256
    await page.goto(`${BASE_URL}/order-calculation`);
    await page.fill('#safety-stock', '9999');
    await page.fill('#current-stock', '5000');
    await page.fill('#demand-forecast', '1000');
    await page.fill('#lead-time', '7');
    await page.click('#execute-calculation');
    
    await expect(page.locator('#order-quantity')).toBeVisible();
    await expect(page.locator('.error-message')).not.toBeVisible();
    await expect(page.locator('#calculation-log')).toContainText('9999');
  });

  test('SCEN-257: リードタイム上限値での計算実行', async ({ page }) => {
    // SCEN-257
    await page.goto(`${BASE_URL}/order-calculation`);
    await page.selectOption('#product', 'P001');
    await page.fill('#lead-time', '365');
    await page.fill('#stock-quantity', '100');
    await page.fill('#demand-data', '50');
    await page.click('#calculate-button');
    
    await expect(page.locator('#calculation-result')).toBeVisible();
    await expect(page.locator('#order-quantity')).toBeVisible();
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  test('SCEN-258: 計算対象期間最短設定での実行', async ({ page }) => {
    // SCEN-258
    await page.goto(`${BASE_URL}/order-calculation`);
    await page.fill('#period-days', '1');
    await page.selectOption('#target-product', 'P001');
    await page.click('#execute-calculation');
    
    await expect(page.locator('#calculation-result')).toBeVisible();
    await expect(page.locator('#order-quantity')).toBeVisible();
    await expect(page.locator('#data-period')).toContainText('1日');
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  test('SCEN-259: 計算対象期間最長設定での実行', async ({ page }) => {
    // SCEN-259
    await page.goto(`${BASE_URL}/order-calculation`);
    await page.fill('#calculation-period', '365');
    await page.selectOption('#target-product', 'P001');
    await page.selectOption('#target-store', 'store-001');
    await page.click('#execute-button');
    await page.waitForSelector('#calculation-complete', { timeout: 60000 });
    
    await expect(page.locator('#calculation-result')).toBeVisible();
    await expect(page.locator('#order-quantity')).toBeVisible();
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  test('SCEN-260: 在庫数0での発注量計算', async ({ page }) => {
    // SCEN-260
    await page.goto(`${BASE_URL}/order-management`);
    await page.selectOption('#product-zero-stock', 'P001');
    await page.fill('#lead-time', '7');
    await page.fill('#safety-stock', '20');
    await page.click('#calculate-order');
    
    await expect(page.locator('#order-quantity')).toBeVisible();
    await expect(page.locator('#calculation-basis')).toBeVisible();
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  test('SCEN-261: 予測需要量0での発注量計算', async ({ page }) => {
    // SCEN-261
    await page.goto(`${BASE_URL}/order-calculation`);
    await page.selectOption('#product', 'P001');
    await page.fill('#forecast-demand', '0');
    await page.fill('#current-stock', '100');
    await page.fill('#safety-stock', '50');
    await page.click('#calculate-button');
    
    await expect(page.locator('#order-quantity')).toContainText('0');
    await expect(page.locator('.error-message')).not.toBeVisible();
  });
});