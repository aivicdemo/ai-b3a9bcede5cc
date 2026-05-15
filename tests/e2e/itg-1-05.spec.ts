import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("需要予測管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // ログイン処理（認証が必要な場合）
    // await page.fill('input[name="username"]', 'testuser');
    // await page.fill('input[name="password"]', 'password');
    // await page.click('button[type="submit"]');
  });

  test("SCEN-093: 全項目正常入力でAI予測が実行される", async ({ page }) => {
    // SCEN-093
    await page.goto(BASE_URL);
    await page.fill('input[placeholder*="商品コード"]', 'PROD001');
    await page.fill('input[type="date"]:first-of-type', '2024-01-01');
    await page.fill('input[type="date"]:last-of-type', '2024-03-31');
    await page.selectOption('select', '標準予測モデル');
    await page.check('input[type="checkbox"][name*="季節性"]');
    await page.check('input[type="checkbox"][name*="天候"]');
    await page.click('button:has-text("AI予測実行")');
    await expect(page.locator('.loading')).toBeVisible();
    await expect(page.locator('.prediction-result')).toBeVisible();
  });

  test("SCEN-094: 予測結果グラフが正常に表示される", async ({ page }) => {
    // SCEN-094
    await page.goto(BASE_URL);
    await page.selectOption('select[name*="商品"]', '商品A');
    await page.fill('input[type="date"]:first-of-type', '2024-01-01');
    await page.fill('input[type="date"]:last-of-type', '2024-03-31');
    await page.click('button:has-text("予測実行")');
    await page.waitForSelector('.prediction-complete');
    await page.click('button:has-text("グラフ表示")');
    await expect(page.locator('.chart-container')).toBeVisible();
    await expect(page.locator('.chart-title')).toContainText('需要予測');
  });

  test("SCEN-095: 商品別予測一覧が正常に表示される", async ({ page }) => {
    // SCEN-095
    await page.goto(BASE_URL);
    await page.click('text=商品別予測一覧');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('table tbody tr')).toHaveCount({ min: 1 });
    await expect(page.locator('th:has-text("商品名")')).toBeVisible();
    await expect(page.locator('th:has-text("予測数量")')).toBeVisible();
    await page.click('.pagination button:has-text("次へ")');
  });

  test("SCEN-096: 予測結果のエクスポートが正常に実行される", async ({ page }) => {
    // SCEN-096
    await page.goto(BASE_URL);
    await expect(page.locator('.prediction-result')).toBeVisible();
    await page.click('button:has-text("エクスポート")');
    await page.selectOption('select[name*="形式"]', 'CSV');
    await page.fill('input[name*="開始日"]', '2024-01-01');
    await page.fill('input[name*="終了日"]', '2024-03-31');
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("エクスポート実行")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });

  test("SCEN-097: 店舗未選択でAI予測実行時にエラー表示", async ({ page }) => {
    // SCEN-097
    await page.goto(BASE_URL);
    await page.fill('input[type="date"]:first-of-type', '2024-01-01');
    await page.fill('input[type="date"]:last-of-type', '2024-03-31');
    await page.selectOption('select[name*="カテゴリ"]', 'カテゴリA');
    await page.click('button:has-text("AI予測実行")');
    await expect(page.locator('.error-message')).toContainText('店舗を選択してください');
  });

  test("SCEN-098: 商品カテゴリ未選択でAI予測実行時にエラー表示", async ({ page }) => {
    // SCEN-098
    await page.goto(BASE_URL);
    await page.fill('input[type="date"]:first-of-type', '2024-01-01');
    await page.fill('input[type="date"]:last-of-type', '2024-03-31');
    await page.selectOption('select[name*="店舗"]', '店舗A');
    await page.click('button:has-text("AI予測実行")');
    await expect(page.locator('.error-message')).toContainText('商品カテゴリ');
  });

  test("SCEN-099: 予測期間未設定でAI予測実行時にエラー表示", async ({ page }) => {
    // SCEN-099
    await page.goto(BASE_URL);
    await page.selectOption('select[name*="商品"]', '商品A');
    await page.click('button:has-text("AI予測実行")');
    await expect(page.locator('.error-message')).toContainText('予測期間');
  });

  test("SCEN-100: 開始日が終了日より後の場合にエラー表示", async ({ page }) => {
    // SCEN-100
    await page.goto(BASE_URL);
    await page.fill('input[type="date"]:first-of-type', '2024-12-31');
    await page.fill('input[type="date"]:last-of-type', '2024-01-01');
    await page.click('button:has-text("予測実行")');
    await expect(page.locator('.error-message')).toContainText('開始日は終了日より前の日付');
  });

  test("SCEN-101: 予測モデル未選択でAI予測実行時にエラー表示", async ({ page }) => {
    // SCEN-101
    await page.goto(BASE_URL);
    await page.selectOption('select[name*="商品"]', '商品A');
    await page.fill('input[type="date"]:first-of-type', '2024-01-01');
    await page.fill('input[type="date"]:last-of-type', '2024-03-31');
    await page.click('button:has-text("AI予測実行")');
    await expect(page.locator('.error-message')).toContainText('予測モデルが選択されていません');
  });

  test("SCEN-102: AI予測処理中にタイムアウトエラー", async ({ page }) => {
    // SCEN-102
    await page.goto(BASE_URL);
    await page.selectOption('select[name*="商品"]', '商品A');
    await page.fill('input[type="date"]:first-of-type', '2024-01-01');
    await page.fill('input[type="date"]:last-of-type', '2024-06-30');
    await page.route('**/api/predict', route => route.abort());
    await page.click('button:has-text("AI予測実行")');
    await expect(page.locator('.error-message')).toContainText('タイムアウト', { timeout: 35000 });
  });

  test("SCEN-103: 予測期間が1日の場合の動作", async ({ page }) => {
    // SCEN-103
    await page.goto(BASE_URL);
    await page.fill('input[name*="期間"]', '1');
    await page.selectOption('select[name*="単位"]', '日');
    await page.selectOption('select[name*="商品"]', '商品A');
    await page.click('button:has-text("予測実行")');
    await expect(page.locator('.prediction-result')).toBeVisible();
    await expect(page.locator('.period-display')).toContainText('1日間');
  });

  test("SCEN-104: 予測期間が最大許可日数の場合の動作", async ({ page }) => {
    // SCEN-104
    await page.goto(BASE_URL);
    await page.fill('input[name*="期間"]', '365');
    await page.selectOption('select[name*="商品"]', '商品A');
    await page.click('button:has-text("予測実行")');
    await page.waitForSelector('.prediction-result', { timeout: 60000 });
    await expect(page.locator('.prediction-data')).toBeVisible();
  });

  test("SCEN-105: 過去日付を開始日に設定した場合の動作", async ({ page }) => {
    // SCEN-105
    await page.goto(BASE_URL);
    await page.click('button:has-text("新規予測作成")');
    await page.selectOption('select[name*="商品"]', '商品A');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await page.fill('input[name*="開始日"]', yesterday.toISOString().split('T')[0]);
    await page.fill('input[name*="終了日"]', '2024-12-31');
    await page.click('button:has-text("保存")');
    await expect(page.locator('.error-message')).toContainText('本日以降の日付');
  });

  test("SCEN-106: 未来の遠い日付を終了日に設定した場合の動作", async ({ page }) => {
    // SCEN-106
    await page.goto(BASE_URL);
    await page.click('button:has-text("新しい需要予測")');
    await page.selectOption('select[name*="商品"]', '商品A');
    await page.fill('input[name*="開始日"]', '2024-01-01');
    await page.fill('input[name*="終了日"]', '2050-12-31');
    await page.click('button:has-text("予測実行")');
    await expect(page.locator('.warning-message')).toBeVisible();
  });

  test("SCEN-107: 全ての予測モデルを同時選択した場合の動作", async ({ page }) => {
    // SCEN-107
    await page.goto(BASE_URL);
    await page.check('input[type="checkbox"][value="linear"]');
    await page.check('input[type="checkbox"][value="arima"]');
    await page.check('input[type="checkbox"][value="ml"]');
    await page.selectOption('select[name*="商品"]', '商品A');
    await page.fill('input[type="date"]:first-of-type', '2024-01-01');
    await page.fill('input[type="date"]:last-of-type', '2024-03-31');
    await page.click('button:has-text("予測実行")');
    await expect(page.locator('.model-comparison')).toBeVisible();
  });

  test("SCEN-108: 売上実績データが存在しない商品での予測実行", async ({ page }) => {
    // SCEN-108
    await page.goto(BASE_URL);
    await page.fill('input[name*="商品コード"]', 'NODATA001');
    await page.click('button:has-text("検索")');
    await page.fill('input[type="date"]:first-of-type', '2024-01-01');
    await page.fill('input[type="date"]:last-of-type', '2024-03-31');
    await page.click('button:has-text("需要予測実行")');
    await expect(page.locator('.error-message')).toContainText('売上実績データが存在しない');
  });
});