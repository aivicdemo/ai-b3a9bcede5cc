import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("予測精度監視画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#username', 'testuser');
    await page.fill('#password', 'testpass');
    await page.click('#login-button');
    await page.waitForURL(`${BASE_URL}/dashboard`);
    await page.click('#menu-forecast-accuracy');
    await page.waitForURL(`${BASE_URL}/forecast-accuracy`);
  });

  test("SCEN-294: 画面初期表示で全要素が正常に読み込まれる", async ({ page }) => {
    // SCEN-294
    await expect(page.locator('#header')).toBeVisible();
    await expect(page.locator('#navigation')).toBeVisible();
    await expect(page.locator('#accuracy-chart')).toBeVisible();
    await expect(page.locator('#metrics-table')).toBeVisible();
    await expect(page.locator('#filter-section')).toBeVisible();
    await expect(page.locator('#refresh-button')).toBeVisible();
    await expect(page.locator('#loading-spinner')).not.toBeVisible();
  });

  test("SCEN-295: 期間選択で予測精度データが更新される", async ({ page }) => {
    // SCEN-295
    const initialData = await page.locator('#mape-value').textContent();
    await page.click('#period-selector');
    await page.click('[data-value="1month"]');
    await page.waitForResponse('**/api/forecast-accuracy**');
    const updatedData = await page.locator('#mape-value').textContent();
    expect(updatedData).not.toBe(initialData);
  });

  test("SCEN-296: 店舗選択で該当店舗データに絞り込まれる", async ({ page }) => {
    // SCEN-296
    await page.click('#store-selector');
    await page.click('[data-value="store-a"]');
    await page.waitForResponse('**/api/forecast-accuracy**');
    await expect(page.locator('#store-filter-indicator')).toContainText('店舗A');
    await expect(page.locator('#accuracy-chart')).toBeVisible();
  });

  test("SCEN-297: 商品カテゴリ選択でフィルタリングされる", async ({ page }) => {
    // SCEN-297
    await page.click('#category-selector');
    await page.click('[data-value="food"]');
    await page.waitForResponse('**/api/forecast-accuracy**');
    await expect(page.locator('#category-filter-indicator')).toContainText('食品');
    
    await page.click('#category-selector');
    await page.click('[data-value="daily-goods"]');
    await page.waitForResponse('**/api/forecast-accuracy**');
    await expect(page.locator('#category-filter-indicator')).toContainText('日用品');
  });

  test("SCEN-298: 予測精度推移グラフが正常に表示される", async ({ page }) => {
    // SCEN-298
    await expect(page.locator('#accuracy-trend-chart')).toBeVisible();
    await expect(page.locator('#chart-x-axis-label')).toContainText('時間');
    await expect(page.locator('#chart-y-axis-label')).toContainText('精度');
    await expect(page.locator('#chart-legend')).toBeVisible();
    await page.hover('#chart-data-point');
    await expect(page.locator('#chart-tooltip')).toBeVisible();
  });

  test("SCEN-299: MAPE値が正常に表示される", async ({ page }) => {
    // SCEN-299
    await expect(page.locator('#mape-section')).toBeVisible();
    const mapeValue = await page.locator('#mape-value').textContent();
    expect(mapeValue).toMatch(/^\d+\.\d{2}%$/);
    expect(parseFloat(mapeValue?.replace('%', '') || '0')).toBeGreaterThanOrEqual(0);
  });

  test("SCEN-300: RMSE値が正常に表示される", async ({ page }) => {
    // SCEN-300
    await expect(page.locator('#rmse-section')).toBeVisible();
    const rmseValue = await page.locator('#rmse-value').textContent();
    expect(rmseValue).toMatch(/^\d+(\.\d+)?$/);
    await expect(page.locator('#rmse-label')).toBeVisible();
  });

  test("SCEN-301: 予測vs実績比較チャートが表示される", async ({ page }) => {
    // SCEN-301
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#forecast-vs-actual-chart')).toBeVisible();
    await expect(page.locator('#forecast-line')).toBeVisible();
    await expect(page.locator('#actual-line')).toBeVisible();
    await expect(page.locator('#comparison-chart-legend')).toBeVisible();
    await expect(page.locator('#chart-x-axis')).toBeVisible();
    await expect(page.locator('#chart-y-axis')).toBeVisible();
  });

  test("SCEN-302: 精度ランキング表が正常にソートされる", async ({ page }) => {
    // SCEN-302
    await page.click('#accuracy-column-header');
    await expect(page.locator('#sort-indicator-asc')).toBeVisible();
    
    await page.click('#accuracy-column-header');
    await expect(page.locator('#sort-indicator-desc')).toBeVisible();
    
    await page.click('#product-name-column-header');
    await expect(page.locator('#product-sort-indicator')).toBeVisible();
  });

  test("SCEN-303: 精度閾値超過でアラート通知が表示される", async ({ page }) => {
    // SCEN-303
    await page.fill('#threshold-setting', '80');
    await page.click('#set-threshold-button');
    await page.waitForResponse('**/api/set-threshold**');
    
    // テストデータ投入をシミュレート
    await page.route('**/api/forecast-accuracy**', async route => {
      const response = await route.fetch();
      const data = await response.json();
      data.accuracy = 75;
      await route.fulfill({ response, json: data });
    });
    
    await page.click('#refresh-button');
    await expect(page.locator('#alert-notification')).toBeVisible();
    await expect(page.locator('#alert-details')).toContainText('75');
  });

  test("SCEN-304: 詳細分析ボタンで詳細画面に遷移する", async ({ page }) => {
    // SCEN-304
    await page.click('#detail-analysis-button');
    await page.waitForURL('**/forecast-accuracy/detail**');
    await expect(page.locator('#detailed-analysis-section')).toBeVisible();
    await expect(page.locator('#forecast-value')).toBeVisible();
    await expect(page.locator('#actual-value')).toBeVisible();
  });

  test("SCEN-305: レポート出力でファイルがダウンロードされる", async ({ page }) => {
    // SCEN-305
    const downloadPromise = page.waitForEvent('download');
    await page.click('#report-export-button');
    await page.click('#csv-format');
    await page.click('#download-button');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test("SCEN-306: データ取得エラー時にエラーメッセージ表示", async ({ page }) => {
    // SCEN-306
    await page.route('**/api/forecast-accuracy**', route => route.abort());
    await page.click('#refresh-button');
    await expect(page.locator('#error-message')).toBeVisible();
    await expect(page.locator('#retry-button')).toBeVisible();
  });

  test("SCEN-307: ネットワーク切断時の適切なエラーハンドリング", async ({ page, context }) => {
    // SCEN-307
    await context.setOffline(true);
    await page.click('#refresh-button');
    await expect(page.locator('#network-error-message')).toContainText('ネットワークに接続できません');
    await expect(page.locator('#retry-button')).toBeVisible();
    
    await context.setOffline(false);
    await page.click('#retry-button');
    await page.waitForResponse('**/api/forecast-accuracy**');
    await expect(page.locator('#accuracy-chart')).toBeVisible();
  });

  test("SCEN-308: 無効な店舗選択時のエラー処理", async ({ page }) => {
    // SCEN-308
    await page.fill('#store-input', 'STORE-99999');
    await page.click('#search-button');
    await expect(page.locator('#store-error-message')).toContainText('指定された店舗が見つかりません');
    await expect(page.locator('#store-selector')).toBeVisible();
  });

  test("SCEN-309: レポート出力失敗時のエラー表示", async ({ page }) => {
    // SCEN-309
    await page.route('**/api/export-report**', route => route.abort());
    await page.click('#report-export-button');
    await page.click('#export-confirm-button');
    await expect(page.locator('#export-error-dialog')).toBeVisible();
    await expect(page.locator('#error-description')).toBeVisible();
  });

  test("SCEN-310: 最小期間選択での動作確認", async ({ page }) => {
    // SCEN-310
    await page.click('#period-selector');
    await page.click('[data-value="1day"]');
    await page.click('#apply-button');
    await page.waitForResponse('**/api/forecast-accuracy**');
    await expect(page.locator('#mape-value')).toBeVisible();
    await expect(page.locator('#accuracy-chart')).toBeVisible();
    await expect(page.locator('#error-message')).not.toBeVisible();
  });

  test("SCEN-311: 最大期間選択での動作確認", async ({ page }) => {
    // SCEN-311
    const startTime = Date.now();
    await page.click('#period-selector');
    await page.click('[data-value="1year"]');
    await page.click('#search-button');
    await page.waitForResponse('**/api/forecast-accuracy**');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000);
    await expect(page.locator('#accuracy-chart')).toBeVisible();
  });

  test("SCEN-312: データなし期間選択時の表示", async ({ page }) => {
    // SCEN-312
    await page.click('#period-selector');
    await page.click('[data-value="no-data-period"]');
    await page.click('#search-button');
    await expect(page.locator('#no-data-message')).toContainText('選択された期間にはデータが存在しません');
    await expect(page.locator('#empty-chart')).toBeVisible();
  });

  test("SCEN-313: 全店舗選択時の表示確認", async ({ page }) => {
    // SCEN-313
    await page.click('#store-selector');
    await page.click('#select-all-stores');
    await page.waitForResponse('**/api/forecast-accuracy**');
    await expect(page.locator('#all-stores-indicator')).toBeVisible();
    await expect(page.locator('#store-summary-table')).toBeVisible();
    await expect(page.locator('#aggregated-chart')).toBeVisible();
  });

  test("SCEN-314: 大量データ表示時のパフォーマンス", async ({ page }) => {
    // SCEN-314
    const startTime = Date.now();
    await page.click('#period-selector');
    await page.click('[data-value="2years"]');
    await page.click('#category-selector');
    await page.click('[data-value="all"]');
    await page.click('#store-selector');
    await page.click('[data-value="all"]');
    await page.click('#search-button');
    await page.waitForResponse('**/api/forecast-accuracy**');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000);
    
    await page.locator('#data-table').scrollIntoView();
    await page.click('#page-2');
    await page.click('#sort-by-accuracy');
  });

  test("SCEN-315: 精度値が境界値の場合の表示", async ({ page }) => {
    // SCEN-315
    await page.route('**/api/forecast-accuracy**', async route => {
      await route.fulfill({
        json: { accuracy: 0, products: [{ accuracy: 0, status: 'critical' }] }
      });
    });
    await page.reload();
    await expect(page.locator('#accuracy-value-0')).toHaveClass(/critical|red/);
    await expect(page.locator('#warning-message')).toBeVisible();
    
    await page.route('**/api/forecast-accuracy**', async route => {
      await route.fulfill({
        json: { accuracy: 100, products: [{ accuracy: 100, status: 'excellent' }] }
      });
    });
    await page.reload();
    await expect(page.locator('#accuracy-value-100')).toHaveClass(/excellent|green/);
  });
});