import { test, expect } from '@playwright/test';

test.describe("発注量計算画面", () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseUrl}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'testpass');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-188: 店舗選択して商品カテゴリで絞り込み', async ({ page }) => {
    // SCEN-188
    await page.goto(`${baseUrl}/order-calculation`);
    await page.click('[data-testid="store-dropdown"]');
    await page.click('[data-testid="store-option-001"]');
    await page.click('[data-testid="category-dropdown"]');
    await page.click('[data-testid="category-option-food"]');
    await page.click('[data-testid="filter-execute-button"]');
    await expect(page.locator('[data-testid="product-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-quantity"]')).toBeVisible();
  });

  test('SCEN-189: 商品検索で対象商品を特定', async ({ page }) => {
    // SCEN-189
    await page.goto(`${baseUrl}/order-calculation`);
    await page.fill('[data-testid="product-search"]', '4901234567890');
    await page.click('[data-testid="search-button"]');
    await page.click('[data-testid="search-result-item"]');
    await expect(page.locator('[data-testid="product-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="jan-code"]')).toBeVisible();
    await expect(page.locator('[data-testid="stock-quantity"]')).toBeVisible();
  });

  test('SCEN-190: 対象期間設定でAI予測結果表示', async ({ page }) => {
    // SCEN-190
    await page.goto(`${baseUrl}/order-calculation`);
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-03-31');
    await page.click('[data-testid="ai-prediction-button"]');
    await page.waitForSelector('[data-testid="prediction-result"]', { timeout: 30000 });
    await expect(page.locator('[data-testid="predicted-demand"]')).toBeVisible();
    await expect(page.locator('[data-testid="recommended-order"]')).toBeVisible();
    await expect(page.locator('[data-testid="prediction-accuracy"]')).toBeVisible();
  });

  test('SCEN-191: 在庫・安全在庫・リードタイム入力で発注量計算', async ({ page }) => {
    // SCEN-191
    await page.goto(`${baseUrl}/order-calculation`);
    await page.fill('[data-testid="current-stock"]', '100');
    await page.fill('[data-testid="safety-stock"]', '50');
    await page.fill('[data-testid="lead-time"]', '7');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="calculated-order-quantity"]')).toBeVisible();
  });

  test('SCEN-192: 天候・イベント影響度調整で発注量変動', async ({ page }) => {
    // SCEN-192
    await page.goto(`${baseUrl}/order-calculation`);
    await page.click('[data-testid="product-select"]');
    await page.fill('[data-testid="prediction-period"]', '30');
    await page.fill('[data-testid="weather-impact"]', '1.5');
    await page.fill('[data-testid="event-impact"]', '1.3');
    await page.click('[data-testid="calculate-button"]');
    const highImpactOrder = await page.locator('[data-testid="order-result"]').textContent();
    await page.fill('[data-testid="weather-impact"]', '1.0');
    await page.fill('[data-testid="event-impact"]', '1.0');
    await page.click('[data-testid="calculate-button"]');
    const normalImpactOrder = await page.locator('[data-testid="order-result"]').textContent();
    expect(highImpactOrder).not.toBe(normalImpactOrder);
  });

  test('SCEN-193: 季節補正係数設定で発注量補正', async ({ page }) => {
    // SCEN-193
    await page.goto(`${baseUrl}/order-calculation`);
    await page.click('[data-testid="product-select"]');
    await page.fill('[data-testid="base-order-quantity"]', '100');
    await page.click('[data-testid="seasonal-adjustment-section"]');
    await page.fill('[data-testid="seasonal-coefficient"]', '1.2');
    await page.click('[data-testid="apply-coefficient-button"]');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="adjusted-order-quantity"]')).toContainText('120');
  });

  test('SCEN-194: AI推奨発注量を手動調整', async ({ page }) => {
    // SCEN-194
    await page.goto(`${baseUrl}/order-calculation`);
    await page.click('[data-testid="product-select"]');
    await expect(page.locator('[data-testid="ai-recommended-quantity"]')).toBeVisible();
    await page.fill('[data-testid="ai-recommended-quantity"]', '150');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="manual-adjusted-indicator"]')).toBeVisible();
  });

  test('SCEN-195: 店舗未選択で処理実行', async ({ page }) => {
    // SCEN-195
    await page.goto(`${baseUrl}/order-calculation`);
    await page.fill('[data-testid="category-select"]', 'food');
    await page.fill('[data-testid="period-select"]', '30');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="store-error"]')).toContainText('店舗を選択してください');
  });

  test('SCEN-196: 商品未選択で発注量計算', async ({ page }) => {
    // SCEN-196
    await page.goto(`${baseUrl}/order-calculation`);
    await page.fill('[data-testid="period-input"]', '30');
    await page.fill('[data-testid="warehouse-input"]', 'WH001');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="product-error"]')).toContainText('商品を選択してください');
  });

  test('SCEN-197: 対象期間未設定でAI予測取得', async ({ page }) => {
    // SCEN-197
    await page.goto(`${baseUrl}/order-calculation`);
    await page.click('[data-testid="product-select-dropdown"]');
    await page.click('[data-testid="ai-prediction-get-button"]');
    await expect(page.locator('[data-testid="period-error"]')).toContainText('対象期間を設定してください');
  });

  test('SCEN-198: 現在在庫数に負の値入力', async ({ page }) => {
    // SCEN-198
    await page.goto(`${baseUrl}/order-calculation`);
    await page.click('[data-testid="product-select"]');
    await page.fill('[data-testid="current-stock"]', '-10');
    await page.fill('[data-testid="demand-forecast"]', '100');
    await page.fill('[data-testid="lead-time-input"]', '7');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="stock-error"]')).toContainText('在庫数は0以上の値を入力してください');
  });

  test('SCEN-199: 安全在庫に文字列入力', async ({ page }) => {
    // SCEN-199
    await page.goto(`${baseUrl}/order-calculation`);
    await page.click('[data-testid="product-select"]');
    await page.fill('[data-testid="safety-stock"]', 'abc');
    await page.fill('[data-testid="other-required-field"]', '100');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="safety-stock-error"]')).toContainText('数値を入力してください');
  });

  test('SCEN-200: リードタイムに上限値超過入力', async ({ page }) => {
    // SCEN-200
    await page.goto(`${baseUrl}/order-calculation`);
    await page.click('[data-testid="product-select"]');
    await page.fill('[data-testid="lead-time"]', '9999');
    await page.fill('[data-testid="stock-input"]', '100');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="lead-time-error"]')).toBeVisible();
  });

  test('SCEN-201: 影響度調整に範囲外値入力', async ({ page }) => {
    // SCEN-201
    await page.goto(`${baseUrl}/order-calculation`);
    await page.click('[data-testid="product-select"]');
    await page.fill('[data-testid="demand-parameter"]', '100');
    await page.fill('[data-testid="impact-adjustment"]', '-50');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="impact-error"]')).toContainText('範囲外');
  });

  test('SCEN-202: 季節補正係数に異常値入力', async ({ page }) => {
    // SCEN-202
    await page.goto(`${baseUrl}/order-calculation`);
    await page.click('[data-testid="product-select"]');
    await page.fill('[data-testid="base-conditions"]', '100');
    await page.fill('[data-testid="seasonal-coefficient"]', 'abc');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="coefficient-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="coefficient-error"]')).toContainText('許可される値');
  });

  test('SCEN-203: 手動調整で負の発注量入力', async ({ page }) => {
    // SCEN-203
    await page.goto(`${baseUrl}/order-calculation`);
    await page.click('[data-testid="product-select"]');
    await expect(page.locator('[data-testid="ai-prediction-value"]')).toBeVisible();
    await page.fill('[data-testid="manual-adjustment"]', '-50');
    await page.click('[data-testid="calculate-order-button"]');
    await expect(page.locator('[data-testid="order-quantity-error"]')).toContainText('発注量は0以上の値を入力してください');
  });

  test('SCEN-204: 在庫数にゼロ入力', async ({ page }) => {
    // SCEN-204
    await page.goto(`${baseUrl}/order-calculation`);
    await page.click('[data-testid="product-select"]');
    await page.fill('[data-testid="stock-quantity"]', '0');
    await page.fill('[data-testid="demand-period"]', '30');
    await page.fill('[data-testid="lead-time-days"]', '7');
    await page.click('[data-testid="calculate-order-button"]');
    await expect(page.locator('[data-testid="order-result"]')).toBeVisible();
  });

  test('SCEN-205: 安全在庫に最大値入力', async ({ page }) => {
    // SCEN-205
    await page.goto(`${baseUrl}/order-calculation`);
    await page.fill('[data-testid="product-code"]', 'PRD001');
    await page.fill('[data-testid="safety-stock"]', '999999999');
    await page.fill('[data-testid="lead-time-field"]', '14');
    await page.fill('[data-testid="order-cycle"]', '30');
    await page.click('[data-testid="calculate-button"]');
    const result = page.locator('[data-testid="calculation-result"]');
    const error = page.locator('[data-testid="error-message"]');
    await expect(result.or(error)).toBeVisible();
  });

  test('SCEN-206: リードタイムに最小値入力', async ({ page }) => {
    // SCEN-206
    await page.goto(`${baseUrl}/order-calculation`);
    await page.click('[data-testid="product-info-select"]');
    await page.fill('[data-testid="lead-time-input"]', '1');
    await page.fill('[data-testid="stock-amount"]', '100');
    await page.fill('[data-testid="demand-forecast-input"]', '50');
    await page.click('[data-testid="order-calculate-button"]');
    await expect(page.locator('[data-testid="order-quantity-result"]')).toBeVisible();
  });

  test('SCEN-207: 影響度調整に境界値入力', async ({ page }) => {
    // SCEN-207
    await page.goto(`${baseUrl}/order-calculation`);
    await page.click('[data-testid="product-select"]');
    await page.fill('[data-testid="order-parameters"]', '100');
    await page.fill('[data-testid="impact-adjustment"]', '0');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="result-display"]')).toBeVisible();
    await page.fill('[data-testid="impact-adjustment"]', '100');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="result-display"]')).toBeVisible();
    await page.fill('[data-testid="impact-adjustment"]', '101');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
  });

  test('SCEN-208: 季節補正係数に最大・最小値入力', async ({ page }) => {
    // SCEN-208
    await page.goto(`${baseUrl}/order-calculation`);
    await page.fill('[data-testid="seasonal-coefficient"]', '9.99');
    await page.fill('[data-testid="required-field"]', '100');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="calculation-result"]')).toBeVisible();
    await page.fill('[data-testid="seasonal-coefficient"]', '0.01');
    await page.click('[data-testid="calculate-button"]');
    await expect(page.locator('[data-testid="calculation-result"]')).toBeVisible();
  });

  test('SCEN-209: 対象期間に過去・未来境界日付設定', async ({ page }) => {
    // SCEN-209
    await page.goto(`${baseUrl}/order-calculation`);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('[data-testid="start-date"]', yesterday.toISOString().split('T')[0]);
    await page.fill('[data-testid="end-date"]', tomorrow.toISOString().split('T')[0]);
    await page.click('[data-testid="calculate-order-button"]');
    await expect(page.locator('[data-testid="demand-forecast-result"]')).toBeVisible();
  });
});