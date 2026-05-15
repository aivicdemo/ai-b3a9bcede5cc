import { test, expect } from '@playwright/test';

test.describe("発注量計算画面", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000");
  });

  test("SCEN-196: 発注量計算画面 - 店舗選択から発注量計算まで正常完了", async ({ page }) => {
    // SCEN-196
    await page.goto("/order-calculation");
    await page.locator("select").first().click();
    await page.selectOption("select", { index: 1 });
    await page.locator("select").nth(1).selectOption({ index: 1 });
    await page.fill("input[type='date']", "2024-01-01");
    await page.fill("input[type='date']:nth(1)", "2024-01-31");
    await page.click("button:has-text('発注量計算')");
    await expect(page.locator(".calculation-result")).toBeVisible();
  });

  test("SCEN-197: 発注量計算画面 - 商品カテゴリ絞り込みが正常動作", async ({ page }) => {
    // SCEN-197
    await page.goto("/order-calculation");
    await page.locator("select[name='category']").click();
    await expect(page.locator("option")).toHaveCount.toBeGreaterThan(1);
    await page.selectOption("select[name='category']", "食品");
    await page.click("button:has-text('絞り込み実行')");
    await page.selectOption("select[name='category']", "日用品");
    await page.click("button:has-text('絞り込み実行')");
    await page.selectOption("select[name='category']", "全て");
    await page.click("button:has-text('絞り込み実行')");
  });

  test("SCEN-198: 発注量計算画面 - 商品名での部分一致検索が動作", async ({ page }) => {
    // SCEN-198
    await page.goto("/order-calculation");
    await page.fill("input[placeholder*='商品']", "りんご");
    await page.click("button:has-text('検索')");
    await expect(page.locator(".search-results")).toBeVisible();
  });

  test("SCEN-199: 発注量計算画面 - 対象期間設定で需要予測が更新", async ({ page }) => {
    // SCEN-199
    await page.goto("/order-calculation");
    await page.fill("input[type='date']", "2024-01-01");
    await page.fill("input[type='date']:nth(1)", "2024-01-31");
    await page.click("button:has-text('予測更新')");
    await expect(page.locator(".prediction-chart")).toBeVisible();
  });

  test("SCEN-200: 発注量計算画面 - 現在在庫数入力でAI推奨発注量が再計算", async ({ page }) => {
    // SCEN-200
    await page.goto("/order-calculation");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.fill("input[name='current-stock']", "100");
    await page.fill("input[name='current-stock']", "50");
    await page.press("input[name='current-stock']", "Enter");
    await expect(page.locator(".ai-recommendation")).toBeVisible();
  });

  test("SCEN-201: 発注量計算画面 - 安全在庫設定が発注量に反映", async ({ page }) => {
    // SCEN-201
    await page.goto("/order-calculation");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.fill("input[name='safety-stock']", "100");
    await page.fill("input[name='predicted-demand']", "500");
    await page.fill("input[name='current-stock']", "200");
    await page.click("button:has-text('発注量計算')");
    await expect(page.locator(".order-amount")).toContainText("400");
  });

  test("SCEN-202: 発注量計算画面 - リードタイム変更で発注量が調整", async ({ page }) => {
    // SCEN-202
    await page.goto("/order-calculation");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.fill("input[name='lead-time']", "14");
    await page.click("button:has-text('計算実行')");
    await expect(page.locator(".order-result")).toBeVisible();
  });

  test("SCEN-203: 発注量計算画面 - 天候影響度調整で予測値が変動", async ({ page }) => {
    // SCEN-203
    await page.goto("/order-calculation");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.selectOption("select[name='weather']", "雨");
    await page.selectOption("select[name='weather']", "雪");
    await page.selectOption("select[name='weather']", "晴れ");
    await expect(page.locator(".prediction-value")).toBeVisible();
  });

  test("SCEN-204: 発注量計算画面 - 季節補正係数で発注量が補正", async ({ page }) => {
    // SCEN-204
    await page.goto("/order-calculation");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.fill("input[name='seasonal-factor']", "1.5");
    await page.click("button:has-text('発注量計算')");
    await expect(page.locator(".correction-detail")).toBeVisible();
  });

  test("SCEN-205: 発注量計算画面 - 手動調整でAI推奨値を上書き", async ({ page }) => {
    // SCEN-205
    await page.goto("/order-calculation");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.click("input[name='manual-adjustment']");
    await page.fill("input[name='manual-adjustment']", "150");
    await page.press("input[name='manual-adjustment']", "Enter");
    await page.click("button:has-text('計算')");
    await expect(page.locator(".manual-value")).toContainText("150");
  });

  test("SCEN-206: 発注量計算画面 - 店舗未選択時にエラー表示", async ({ page }) => {
    // SCEN-206
    await page.goto("/order-calculation");
    await page.locator("select").nth(1).selectOption({ index: 1 });
    await page.fill("input[type='date']", "2024-01-01");
    await page.click("button:has-text('計算実行')");
    await expect(page.locator(".error-message")).toContainText("店舗を選択してください");
  });

  test("SCEN-207: 発注量計算画面 - 商品未選択で計算実行時エラー", async ({ page }) => {
    // SCEN-207
    await page.goto("/order-calculation");
    await page.fill("input[type='date']", "2024-01-01");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.click("button:has-text('計算実行')");
    await expect(page.locator(".error-message")).toBeVisible();
  });

  test("SCEN-208: 発注量計算画面 - 対象期間が未来日のみでエラー", async ({ page }) => {
    // SCEN-208
    await page.goto("/order-calculation");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    await page.fill("input[type='date']", tomorrow.toISOString().split('T')[0]);
    await page.fill("input[type='date']:nth(1)", nextWeek.toISOString().split('T')[0]);
    await page.click("button:has-text('計算実行')");
    await expect(page.locator(".error-message")).toBeVisible();
  });

  test("SCEN-209: 発注量計算画面 - 現在在庫数に負の値入力でエラー", async ({ page }) => {
    // SCEN-209
    await page.goto("/order-calculation");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.fill("input[name='current-stock']", "-10");
    await page.click("button:has-text('計算実行')");
    await expect(page.locator(".validation-error")).toBeVisible();
  });

  test("SCEN-210: 発注量計算画面 - 安全在庫に文字列入力でバリデーション", async ({ page }) => {
    // SCEN-210
    await page.goto("/order-calculation");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.fill("input[name='safety-stock']", "abc");
    await page.click("button:has-text('計算実行')");
    await expect(page.locator(".validation-error")).toContainText("数値を入力してください");
  });

  test("SCEN-211: 発注量計算画面 - リードタイムに上限超過値でエラー", async ({ page }) => {
    // SCEN-211
    await page.goto("/order-calculation");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.fill("input[name='lead-time']", "999");
    await page.click("button:has-text('計算実行')");
    await expect(page.locator(".error-message")).toBeVisible();
  });

  test("SCEN-212: 発注量計算画面 - 影響度調整に範囲外値でエラー", async ({ page }) => {
    // SCEN-212
    await page.goto("/order-calculation");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.fill("input[name='influence-factor']", "-50");
    await page.click("button:has-text('計算実行')");
    await expect(page.locator(".error-message")).toBeVisible();
  });

  test("SCEN-213: 発注量計算画面 - 季節補正係数に異常値でエラー", async ({ page }) => {
    // SCEN-213
    await page.goto("/order-calculation");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.fill("input[name='seasonal-factor']", "-0.5");
    await page.click("button:has-text('計算実行')");
    await expect(page.locator(".error-message")).toBeVisible();
  });

  test("SCEN-214: 発注量計算画面 - 手動調整に負の値入力でエラー", async ({ page }) => {
    // SCEN-214
    await page.goto("/order-calculation");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.fill("input[name='manual-adjustment']", "-10");
    await page.click("button:has-text('発注量計算')");
    await expect(page.locator(".error-message")).toContainText("0以上の値を入力してください");
  });

  test("SCEN-215: 発注量計算画面 - 現在在庫数0での発注量計算", async ({ page }) => {
    // SCEN-215
    await page.goto("/order-calculation");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.fill("input[name='current-stock']", "0");
    await page.fill("input[type='date']", "2024-01-01");
    await page.click("button:has-text('発注量計算')");
    await expect(page.locator(".calculation-result")).toBeVisible();
  });

  test("SCEN-216: 発注量計算画面 - 安全在庫0設定での計算", async ({ page }) => {
    // SCEN-216
    await page.goto("/order-calculation");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.fill("input[name='safety-stock']", "0");
    await page.fill("input[name='current-stock']", "100");
    await page.click("button:has-text('計算実行')");
    await expect(page.locator(".calculation-result")).toBeVisible();
  });

  test("SCEN-217: 発注量計算画面 - リードタイム最小値での計算", async ({ page }) => {
    // SCEN-217
    await page.goto("/order-calculation");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.fill("input[name='lead-time']", "1");
    await page.click("button:has-text('計算実行')");
    await expect(page.locator(".calculation-result")).toBeVisible();
  });

  test("SCEN-218: 発注量計算画面 - 影響度調整0%での予測値", async ({ page }) => {
    // SCEN-218
    await page.goto("/order-calculation");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.fill("input[name='influence-factor']", "0");
    await page.click("button:has-text('予測値計算')");
    await expect(page.locator(".baseline-prediction")).toBeVisible();
  });

  test("SCEN-219: 発注量計算画面 - 季節補正係数1.0での計算", async ({ page }) => {
    // SCEN-219
    await page.goto("/order-calculation");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.fill("input[name='base-order']", "100");
    await page.fill("input[name='seasonal-factor']", "1.0");
    await page.click("button:has-text('計算実行')");
    await expect(page.locator(".result-value")).toContainText("100");
  });

  test("SCEN-220: 発注量計算画面 - 手動調整0での発注量", async ({ page }) => {
    // SCEN-220
    await page.goto("/order-calculation");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.fill("input[name='manual-adjustment']", "0");
    await page.click("button:has-text('発注量計算')");
    await expect(page.locator(".ai-prediction")).toBeVisible();
  });

  test("SCEN-221: 発注量計算画面 - 大量商品データでの検索性能", async ({ page }) => {
    // SCEN-221
    await page.goto("/order-calculation");
    const startTime = Date.now();
    await page.fill("input[placeholder*='商品']", "テスト商品");
    await page.click("button:has-text('検索')");
    await expect(page.locator(".search-results")).toBeVisible({ timeout: 3000 });
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(3000);
    await expect(page.locator(".pagination")).toBeVisible();
  });

  test("SCEN-222: 発注量計算画面 - 長期間設定での予測計算", async ({ page }) => {
    // SCEN-222
    await page.goto("/order-calculation");
    await page.fill("input[name='prediction-period']", "365");
    await page.locator("select[name='category']").selectOption({ index: 1 });
    await page.check("input[name='seasonal-consideration']");
    await page.click("button:has-text('予測計算実行')");
    await expect(page.locator(".monthly-data")).toBeVisible();
    await expect(page.locator(".weekly-data")).toBeVisible();
  });
});