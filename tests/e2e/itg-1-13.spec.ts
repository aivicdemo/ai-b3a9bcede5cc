import { test, expect } from '@playwright/test';

test.describe("発注量計算処理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000");
  });

  test("SCEN-260: 全項目正常入力で発注量計算実行", async ({ page }) => {
    // SCEN-260
    await page.fill('input[placeholder="商品コードを入力"]', 'PRD001');
    await page.fill('input[placeholder="現在在庫数"]', '100');
    await page.fill('input[placeholder="予測需要量"]', '50');
    await page.fill('input[placeholder="安全在庫数"]', '20');
    await page.fill('input[placeholder="発注サイクル（日数）"]', '7');
    await page.fill('input[placeholder="リードタイム（日数）"]', '3');
    await page.click('button:has-text("計算実行")');
    await expect(page.locator('.calculation-result')).toBeVisible();
  });

  test("SCEN-261: 複数店舗選択で一括計算", async ({ page }) => {
    // SCEN-261
    await page.check('input[type="checkbox"][value="store1"]');
    await page.check('input[type="checkbox"][value="store2"]');
    await page.check('input[type="checkbox"][value="store3"]');
    await page.fill('input[placeholder="開始日"]', '2024-01-01');
    await page.fill('input[placeholder="終了日"]', '2024-01-31');
    await page.selectOption('select[name="category"]', 'category1');
    await page.click('button:has-text("一括計算")');
    await expect(page.locator('.result-list')).toBeVisible();
  });

  test("SCEN-262: 計算結果から発注データ生成", async ({ page }) => {
    // SCEN-262
    await page.click('button:has-text("発注量計算処理")');
    await expect(page.locator('.calculation-result')).toBeVisible();
    await page.click('button:has-text("発注データ生成")');
    await page.click('button:has-text("実行")');
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('.order-data-list')).toBeVisible();
  });

  test("SCEN-263: 店舗未選択で計算実行エラー", async ({ page }) => {
    // SCEN-263
    await page.selectOption('select[name="category"]', 'category1');
    await page.fill('input[placeholder="開始日"]', '2024-01-01');
    await page.fill('input[placeholder="終了日"]', '2024-01-31');
    await page.click('button:has-text("計算実行")');
    await expect(page.locator('.error-message')).toContainText('店舗を選択してください');
  });

  test("SCEN-264: 商品カテゴリ未選択でエラー", async ({ page }) => {
    // SCEN-264
    await page.check('input[type="checkbox"][value="store1"]');
    await page.fill('input[placeholder="開始日"]', '2024-01-01');
    await page.fill('input[placeholder="終了日"]', '2024-01-31');
    await page.click('button:has-text("計算実行")');
    await expect(page.locator('.error-message')).toContainText('商品カテゴリを選択してください');
  });

  test("SCEN-265: 計算対象期間未設定でエラー", async ({ page }) => {
    // SCEN-265
    await page.selectOption('select[name="category"]', 'category1');
    await page.check('input[type="checkbox"][value="store1"]');
    await page.click('button:has-text("計算実行")');
    await expect(page.locator('.error-message')).toContainText('計算対象期間を設定してください');
  });

  test("SCEN-266: 安全在庫数に負の値入力でエラー", async ({ page }) => {
    // SCEN-266
    await page.fill('input[placeholder="商品コードを入力"]', 'PRD001');
    await page.fill('input[placeholder="安全在庫数"]', '-10');
    await page.click('button:has-text("計算実行")');
    await expect(page.locator('.error-message')).toContainText('安全在庫数は0以上の値を入力してください');
  });

  test("SCEN-267: リードタイムに0入力でエラー", async ({ page }) => {
    // SCEN-267
    await page.fill('input[placeholder="商品コードを入力"]', 'PRD001');
    await page.fill('input[placeholder="現在在庫数"]', '100');
    await page.fill('input[placeholder="リードタイム（日数）"]', '0');
    await page.click('button:has-text("計算実行")');
    await expect(page.locator('.error-message')).toContainText('リードタイムは1以上の値を入力してください');
  });

  test("SCEN-268: 発注点に文字列入力でエラー", async ({ page }) => {
    // SCEN-268
    await page.fill('input[placeholder="商品コードを入力"]', 'PRD001');
    await page.fill('input[placeholder="発注点"]', 'abc');
    await page.click('button:has-text("計算実行")');
    await expect(page.locator('.error-message')).toContainText('数値を入力してください');
  });

  test("SCEN-269: 安全在庫数に最大値入力", async ({ page }) => {
    // SCEN-269
    await page.fill('input[placeholder="商品コードを入力"]', 'PRD001');
    await page.fill('input[placeholder="現在在庫数"]', '100');
    await page.fill('input[placeholder="リードタイム（日数）"]', '3');
    await page.fill('input[placeholder="平均日次消費量"]', '10');
    await page.fill('input[placeholder="安全在庫数"]', '999999');
    await page.click('button:has-text("計算実行")');
    await expect(page.locator('.calculation-result')).toBeVisible();
  });

  test("SCEN-270: リードタイムに最大日数入力", async ({ page }) => {
    // SCEN-270
    await page.fill('input[placeholder="商品コードを入力"]', 'PRD001');
    await page.fill('input[placeholder="リードタイム（日数）"]', '999');
    await page.fill('input[placeholder="現在在庫数"]', '100');
    await page.fill('input[placeholder="予測需要量"]', '50');
    await page.click('button:has-text("計算実行")');
    await expect(page.locator('.calculation-result')).toBeVisible();
  });

  test("SCEN-271: 計算対象期間を1日設定", async ({ page }) => {
    // SCEN-271
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[placeholder="開始日"]', today);
    await page.fill('input[placeholder="終了日"]', today);
    await page.selectOption('select[name="category"]', 'category1');
    await page.check('input[type="checkbox"][value="store1"]');
    await page.click('button:has-text("計算実行")');
    await expect(page.locator('.calculation-result')).toBeVisible();
  });

  test("SCEN-272: 在庫0の商品で計算実行", async ({ page }) => {
    // SCEN-272
    await page.fill('input[placeholder="商品コードを入力"]', 'PRD002');
    await page.fill('input[placeholder="現在在庫数"]', '0');
    await page.fill('input[placeholder="予測需要量"]', '50');
    await page.fill('input[placeholder="安全在庫数"]', '10');
    await page.fill('input[placeholder="リードタイム（日数）"]', '5');
    await page.click('button:has-text("計算実行")');
    await expect(page.locator('.calculation-result')).toBeVisible();
  });

  test("SCEN-273: 需要予測0の商品で計算", async ({ page }) => {
    // SCEN-273
    await page.fill('input[placeholder="商品コードを入力"]', 'PRD003');
    await page.fill('input[placeholder="予測需要量"]', '0');
    await page.fill('input[placeholder="現在在庫数"]', '100');
    await page.fill('input[placeholder="安全在庫数"]', '20');
    await page.fill('input[placeholder="リードタイム（日数）"]', '3');
    await page.click('button:has-text("計算実行")');
    await expect(page.locator('.calculation-result')).toBeVisible();
  });
});