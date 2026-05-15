import { test, expect } from '@playwright/test';

test.describe("相関分析・比較分析", () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000");
    // ログイン処理を想定（実際のログインフォームに合わせて調整が必要）
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-071: 分析対象期間選択して相関分析実行', async ({ page }) => {
    // SCEN-071
    await page.click('text=分析');
    await page.click('text=相関分析・比較分析');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-03-31');
    await page.selectOption('select[name="category"]', 'food');
    await page.check('input[name="variables"][value="sales"]');
    await page.check('input[name="variables"][value="temperature"]');
    await page.click('button:has-text("相関分析実行")');
    await expect(page.locator('.correlation-matrix')).toBeVisible();
    await expect(page.locator('.export-buttons')).toBeVisible();
  });

  test('SCEN-072: 店舗選択して分析結果表示', async ({ page }) => {
    // SCEN-072
    await page.click('text=分析');
    await page.click('text=相関分析・比較分析');
    await page.selectOption('select[name="store"]', 'store1');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-03-31');
    await page.check('input[name="analysisItems"][value="sales"]');
    await page.click('button:has-text("分析実行")');
    await expect(page.locator('.analysis-results')).toBeVisible();
    await expect(page.locator('.comparison-chart')).toBeVisible();
  });

  test('SCEN-073: 商品カテゴリ複数選択して分析実行', async ({ page }) => {
    // SCEN-073
    await page.click('text=相関分析・比較分析');
    await page.check('input[name="categories"][value="food"]');
    await page.check('input[name="categories"][value="daily"]');
    await page.check('input[name="categories"][value="clothing"]');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-03-31');
    await page.check('input[name="dataItems"][value="sales"]');
    await page.click('button:has-text("分析実行")');
    await expect(page.locator('.category-comparison')).toBeVisible();
  });

  test('SCEN-074: 天候要因選択して相関係数表示', async ({ page }) => {
    // SCEN-074
    await page.click('text=相関分析・比較分析');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-03-31');
    await page.check('input[name="factors"][value="weather"]');
    await page.check('input[name="weatherItems"][value="temperature"]');
    await page.check('input[name="demandItems"][value="sales"]');
    await page.click('button:has-text("相関分析実行")');
    await expect(page.locator('.correlation-coefficient')).toBeVisible();
  });

  test('SCEN-075: イベント要因選択して散布図表示', async ({ page }) => {
    // SCEN-075
    await page.click('text=相関分析・比較分析');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-03-31');
    await page.selectOption('select[name="eventFactor"]', 'sale');
    await page.check('input[name="displayType"][value="scatter"]');
    await page.click('button:has-text("グラフ表示")');
    await expect(page.locator('.scatter-plot')).toBeVisible();
  });

  test('SCEN-076: 季節要因選択して時系列チャート表示', async ({ page }) => {
    // SCEN-076
    await page.click('text=相関分析・比較分析');
    await page.fill('input[name="startDate"]', '2022-01-01');
    await page.fill('input[name="endDate"]', '2024-12-31');
    await page.check('input[name="seasonalFactor"]');
    await page.selectOption('select[name="seasonalType"]', 'monthly');
    await page.selectOption('select[name="product"]', 'product1');
    await page.click('button:has-text("時系列チャート表示")');
    await expect(page.locator('.time-series-chart')).toBeVisible();
  });

  test('SCEN-077: 複数商品選択して比較分析実行', async ({ page }) => {
    // SCEN-077
    await page.click('text=相関分析・比較分析');
    await page.check('input[name="products"][value="productA"]');
    await page.check('input[name="products"][value="productB"]');
    await page.check('input[name="products"][value="productC"]');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-03-31');
    await page.click('button:has-text("比較分析実行")');
    await expect(page.locator('.product-comparison')).toBeVisible();
  });

  test('SCEN-078: 相関強度ヒートマップ表示確認', async ({ page }) => {
    // SCEN-078
    await page.click('text=分析');
    await page.click('text=相関分析');
    await page.selectOption('select[name="category"]', 'food');
    await page.click('button:has-text("分析実行")');
    await page.click('button:has-text("ヒートマップ表示")');
    await expect(page.locator('.heatmap')).toBeVisible();
    await page.hover('.heatmap-cell');
    await expect(page.locator('.tooltip')).toBeVisible();
  });

  test('SCEN-079: 統計値計算結果表示確認', async ({ page }) => {
    // SCEN-079
    await page.click('text=相関分析・比較分析');
    await page.selectOption('select[name="product"]', 'product1');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-03-31');
    await page.click('button:has-text("統計値計算")');
    await expect(page.locator('.statistics-results')).toBeVisible();
    await expect(page.locator('.correlation-value')).toBeVisible();
    await expect(page.locator('.statistics-chart')).toBeVisible();
  });

  test('SCEN-080: 分析結果サマリー表示確認', async ({ page }) => {
    // SCEN-080
    await page.click('text=相関分析・比較分析');
    await page.selectOption('select[name="product"]', 'product1');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-03-31');
    await page.click('button:has-text("分析実行")');
    await page.click('text=サマリー表示');
    await expect(page.locator('.summary-section')).toBeVisible();
    await page.click('a:has-text("詳細分析")');
    await expect(page).toHaveURL(/.*detail/);
  });

  test('SCEN-081: 期間未選択で分析実行エラー', async ({ page }) => {
    // SCEN-081
    await page.click('text=分析');
    await page.click('text=相関分析');
    await page.selectOption('select[name="product"]', 'product1');
    await page.click('button:has-text("分析実行")');
    await expect(page.locator('.error-message')).toContainText('期間を選択してください');
  });

  test('SCEN-082: 店舗未選択で分析実行エラー', async ({ page }) => {
    // SCEN-082
    await page.click('text=相関分析・比較分析');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-03-31');
    await page.click('button:has-text("分析実行")');
    await expect(page.locator('.error-message')).toContainText('店舗を選択してください');
  });

  test('SCEN-083: 商品カテゴリ未選択でエラー', async ({ page }) => {
    // SCEN-083
    await page.click('text=相関分析・比較分析');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-03-31');
    await page.click('button:has-text("分析実行")');
    await expect(page.locator('.error-message')).toContainText('商品カテゴリを選択してください');
  });

  test('SCEN-084: 分析要因未選択でエラー', async ({ page }) => {
    // SCEN-084
    await page.click('text=分析');
    await page.click('text=相関分析・比較分析');
    await page.click('button:has-text("分析実行")');
    await expect(page.locator('.error-message')).toContainText('分析要因を選択してください');
  });

  test('SCEN-085: データ不足期間でエラー表示', async ({ page }) => {
    // SCEN-085
    await page.click('text=相関分析・比較分析');
    await page.fill('input[name="startDate"]', '2024-12-28');
    await page.fill('input[name="endDate"]', '2024-12-31');
    await page.selectOption('select[name="product"]', 'product1');
    await page.click('button:has-text("分析実行")');
    await expect(page.locator('.error-message')).toContainText('データが不足しています');
  });

  test('SCEN-086: システムエラー時の画面表示', async ({ page }) => {
    // SCEN-086
    await page.click('text=相関分析・比較分析');
    await page.selectOption('select[name="dataset"]', 'large-dataset');
    await page.click('button:has-text("分析実行")');
    await page.click('button:has-text("分析実行")');
    await expect(page.locator('.system-error')).toBeVisible();
    await expect(page.locator('a:has-text("トップページ")')).toBeVisible();
  });

  test('SCEN-087: 開始日終了日逆転でバリデーション', async ({ page }) => {
    // SCEN-087
    await page.click('text=相関分析・比較分析');
    await page.selectOption('select[name="product"]', 'product1');
    await page.fill('input[name="startDate"]', '2024-12-31');
    await page.fill('input[name="endDate"]', '2024-01-01');
    await page.click('button:has-text("分析実行")');
    await expect(page.locator('.validation-error')).toContainText('開始日は終了日以前の日付を入力してください');
  });

  test('SCEN-088: 最大選択可能期間で分析実行', async ({ page }) => {
    // SCEN-088
    await page.click('text=相関分析・比較分析');
    await page.fill('input[name="startDate"]', '2021-01-01');
    await page.fill('input[name="endDate"]', '2024-12-31');
    await page.selectOption('select[name="product"]', 'product1');
    await page.check('input[name="variables"][value="sales"]');
    await page.click('button:has-text("分析実行")');
    await expect(page.locator('.analysis-results')).toBeVisible();
    await expect(page.locator('.correlation-value')).toBeVisible();
  });

  test('SCEN-089: 全商品カテゴリ選択で分析実行', async ({ page }) => {
    // SCEN-089
    await page.click('text=相関分析・比較分析');
    await page.check('input[name="selectAll"]');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-03-31');
    await page.click('button:has-text("分析実行")');
    await expect(page.locator('.category-analysis')).toBeVisible();
  });

  test('SCEN-090: 全分析要因選択で分析実行', async ({ page }) => {
    // SCEN-090
    await page.click('text=相関分析・比較分析');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-03-31');
    await page.click('button:has-text("全選択")');
    await page.selectOption('select[name="analysisType"]', 'correlation');
    await page.click('button:has-text("分析実行")');
    await expect(page.locator('.correlation-matrix')).toBeVisible();
    await page.selectOption('select[name="analysisType"]', 'comparison');
    await page.click('button:has-text("分析実行")');
    await expect(page.locator('.comparison-chart')).toBeVisible();
  });

  test('SCEN-091: 単一商品のみ選択で比較分析', async ({ page }) => {
    // SCEN-091
    await page.click('text=相関分析・比較分析');
    await page.check('input[name="products"][value="product1"]');
    await page.click('button:has-text("比較分析実行")');
    await expect(page.locator('.error-message')).toContainText('比較分析には2つ以上の商品を選択してください');
  });

  test('SCEN-092: 相関係数ゼロのデータで表示確認', async ({ page }) => {
    // SCEN-092
    await page.click('text=相関分析・比較分析');
    await page.selectOption('select[name="variable1"]', 'productA-sales');
    await page.selectOption('select[name="variable2"]', 'temperature');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-03-31');
    await page.click('button:has-text("相関分析実行")');
    await expect(page.locator('.correlation-value')).toContainText('0.0');
    await expect(page.locator('.correlation-strength')).toContainText('相関なし');
    await expect(page.locator('.scatter-plot')).toBeVisible();
  });

});