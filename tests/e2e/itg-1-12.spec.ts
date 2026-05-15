import { test, expect } from '@playwright/test';

test.describe("発注送信処理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000");
  });

  test("SCEN-247: 店舗選択で発注データが正しく表示される", async ({ page }) => {
    // SCEN-247
    await page.goto("/");
    await page.click('text=発注管理');
    await page.click('text=発注送信処理');
    await page.click('select[name="store"]');
    await page.selectOption('select[name="store"]', '店舗A');
    await expect(page.locator('.order-data-area')).toBeVisible();
  });

  test("SCEN-248: 全選択チェックボックスで全件選択される", async ({ page }) => {
    // SCEN-248
    await page.goto("/");
    await page.click('text=発注送信処理');
    await expect(page.locator('.order-list')).toBeVisible();
    await expect(page.locator('input[type="checkbox"]')).toHaveCount(5);
    await page.click('#select-all');
    await expect(page.locator('input[type="checkbox"]:checked')).toHaveCount(5);
  });

  test("SCEN-249: 個別チェックボックスで単一選択される", async ({ page }) => {
    // SCEN-249
    await page.goto("/");
    await page.click('text=発注送信処理');
    await page.click('input[type="radio"][value="order1"]');
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(1);
    await page.click('input[type="radio"][value="order2"]');
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(1);
    await expect(page.locator('input[type="radio"][value="order1"]:checked')).toHaveCount(0);
  });

  test("SCEN-250: 選択した発注データの送信が成功する", async ({ page }) => {
    // SCEN-250
    await page.goto("/");
    await page.click('text=発注管理');
    await page.click('input[type="checkbox"]:first-of-type');
    await page.click('button:text("送信")');
    await page.click('button:text("OK")');
    await expect(page.locator('text=発注データの送信が完了しました')).toBeVisible();
  });

  test("SCEN-251: 送信後にステータスが更新される", async ({ page }) => {
    // SCEN-251
    await page.goto("/");
    await page.click('text=発注管理');
    await page.click('input[type="checkbox"]:first-of-type');
    await page.click('button:text("送信")');
    await page.waitForTimeout(1000);
    await expect(page.locator('.status:text("送信済み")')).toBeVisible();
  });

  test("SCEN-252: 未選択状態での送信でエラー表示", async ({ page }) => {
    // SCEN-252
    await page.goto("/");
    await page.click('text=発注送信処理');
    await page.click('button:text("送信")');
    await expect(page.locator('text=発注対象が選択されていません')).toBeVisible();
  });

  test("SCEN-253: 通信エラー時の送信失敗処理", async ({ page }) => {
    // SCEN-253
    await page.goto("/");
    await page.click('text=発注管理');
    await page.fill('input[name="productCode"]', 'PROD001');
    await page.fill('input[name="quantity"]', '100');
    await page.route('**/api/orders/send', route => route.abort());
    await page.click('button:text("発注送信")');
    await expect(page.locator('text=通信エラーが発生しました')).toBeVisible();
  });

  test("SCEN-254: 権限なし店舗選択でアクセス拒否", async ({ page }) => {
    // SCEN-254
    await page.goto("/");
    await page.click('text=発注送信処理');
    await page.selectOption('select[name="store"]', '権限外店舗');
    await page.click('button:text("発注送信")');
    await expect(page.locator('text=アクセス権限がありません')).toBeVisible();
  });

  test("SCEN-255: 送信済データの重複送信防止", async ({ page }) => {
    // SCEN-255
    await page.goto("/");
    await page.click('text=発注管理');
    await page.click('input[type="checkbox"]:first-of-type');
    await page.click('button:text("送信")');
    await page.waitForTimeout(1000);
    await page.click('button:text("送信")');
    await expect(page.locator('text=既に送信済みです')).toBeVisible();
  });

  test("SCEN-256: 大量データ選択時の送信処理", async ({ page }) => {
    // SCEN-256
    await page.goto("/");
    await page.click('text=発注管理');
    await page.fill('input[name="search"]', 'category:all limit:1000');
    await page.click('button:text("検索")');
    await page.click('#select-all');
    await page.click('button:text("発注送信")');
    await page.click('button:text("送信する")');
    await expect(page.locator('.progress-indicator')).toBeVisible();
    await expect(page.locator('text=送信完了'), { timeout: 300000 }).toBeVisible();
  });

  test("SCEN-257: 発注データ0件時の画面表示", async ({ page }) => {
    // SCEN-257
    await page.goto("/");
    await page.click('text=発注送信処理');
    await page.route('**/api/orders', route => route.fulfill({
      status: 200,
      body: JSON.stringify({ orders: [] })
    }));
    await page.reload();
    await expect(page.locator('text=発注データがありません')).toBeVisible();
    await expect(page.locator('button:text("発注送信")')).toBeDisabled();
  });

  test("SCEN-258: 全選択後の個別選択解除", async ({ page }) => {
    // SCEN-258
    await page.goto("/");
    await page.click('text=発注管理');
    await page.click('#select-all');
    await expect(page.locator('input[type="checkbox"]:checked')).toHaveCount(4);
    await page.click('input[type="checkbox"]:nth-of-type(2)');
    await expect(page.locator('#select-all:checked')).toHaveCount(0);
    await page.click('button:text("発注送信")');
    await expect(page.locator('.confirmation-dialog .selected-items')).toHaveCount(2);
  });

  test("SCEN-259: 発注金額上限値での送信処理", async ({ page }) => {
    // SCEN-259
    await page.goto("/");
    await page.click('text=発注管理');
    await page.click('button:text("新規発注作成")');
    await page.selectOption('select[name="supplier"]', 'supplier1');
    await page.selectOption('select[name="product"]', 'product1');
    await page.fill('input[name="quantity"]', '9999');
    await expect(page.locator('.total-amount')).toContainText('10000000');
    await page.click('button:text("送信")');
    await page.click('button:text("OK")');
    await expect(page.locator('text=送信完了')).toBeVisible();
  });
});