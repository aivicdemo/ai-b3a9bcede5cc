import { test, expect } from '@playwright/test';

test.describe("モデル本番適用処理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000");
    // ログイン処理（認証が必要な場合）
  });

  test("SCEN-361: 検証済みモデルで正常適用完了", async ({ page }) => {
    // SCEN-361
    await page.goto("/");
    await page.waitForLoadState();
    await page.click('text=検証済みモデル一覧');
    await page.waitForURL('**/verified-models');
    await page.click('[data-status="verified"]:first-child');
    await page.click('text=本番適用');
    await page.click('text=OK');
    await page.waitForSelector('[data-testid="progress-indicator"]');
    await page.waitForSelector('text=適用完了', { timeout: 60000 });
    await expect(page.locator('[data-status="production"]')).toBeVisible();
  });

  test("SCEN-362: 複数店舗選択で一括適用完了", async ({ page }) => {
    // SCEN-362
    await page.goto("/");
    await page.click('text=モデル本番適用');
    await page.waitForURL('**/model-deployment');
    await page.check('[name="store"]:nth-child(1)');
    await page.check('[name="store"]:nth-child(2)');
    await page.check('[name="store"]:nth-child(3)');
    await expect(page.locator('text=選択店舗数: 3')).toBeVisible();
    await page.selectOption('[name="model"]', { index: 1 });
    await page.click('text=一括適用');
    await expect(page.locator('text=確認')).toBeVisible();
    await page.click('text=実行');
    await page.waitForSelector('[data-testid="batch-progress"]');
    await page.waitForSelector('text=完了通知', { timeout: 120000 });
    await expect(page.locator('[data-status="completed"]')).toHaveCount(3);
  });

  test("SCEN-363: バックアップ有効で適用完了", async ({ page }) => {
    // SCEN-363
    await page.goto("/");
    await page.click('text=モデル管理');
    await page.waitForURL('**/model-management');
    await page.click('[data-testid="model-row"]:first-child');
    await page.click('text=本番適用');
    await page.check('[name="backup"]');
    await page.click('text=実行');
    await page.waitForSelector('[data-testid="deployment-progress"]');
    await page.waitForSelector('text=適用完了通知');
    await expect(page.locator('[data-status="production"]')).toBeVisible();
  });

  test("SCEN-364: 適用後ロールバック実行完了", async ({ page }) => {
    // SCEN-364
    await page.goto("/");
    await page.click('text=モデル管理');
    await page.waitForURL('**/model-management');
    await page.click('[data-status="production"]:first-child');
    await page.click('text=ロールバック');
    await page.click('text=実行');
    await page.waitForSelector('[data-testid="rollback-progress"]');
    await page.waitForSelector('text=ロールバック完了通知');
    await expect(page.locator('[data-status="rollback-completed"]')).toBeVisible();
  });

  test("SCEN-365: 未選択状態で適用実行エラー", async ({ page }) => {
    // SCEN-365
    await page.goto("/");
    await page.click('text=モデル本番適用');
    await page.waitForURL('**/model-deployment');
    await page.click('text=適用実行');
    await expect(page.locator('text=適用対象のモデルが選択されていません')).toBeVisible();
  });

  test("SCEN-366: 検証未完了モデル適用エラー", async ({ page }) => {
    // SCEN-366
    await page.goto("/");
    await page.click('text=モデル管理');
    await page.waitForURL('**/model-management');
    await page.click('[data-status="unverified"]:first-child');
    await page.click('text=本番適用');
    await page.click('text=適用');
    await expect(page.locator('text=検証が完了していないモデルは本番適用できません')).toBeVisible();
  });

  test("SCEN-367: 店舗未選択で適用実行エラー", async ({ page }) => {
    // SCEN-367
    await page.goto("/");
    await page.click('text=モデル本番適用');
    await page.waitForURL('**/model-deployment');
    await page.selectOption('[name="model"]', { index: 1 });
    await page.click('text=適用実行');
    await expect(page.locator('text=店舗が選択されていません')).toBeVisible();
  });

  test("SCEN-368: 過去日時指定で適用エラー", async ({ page }) => {
    // SCEN-368
    await page.goto("/");
    await page.click('text=モデル管理');
    await page.waitForURL('**/model-management');
    await page.click('[data-testid="model-row"]:first-child');
    await page.click('text=本番適用');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await page.fill('[name="deployment-datetime"]', yesterday.toISOString().slice(0, 16));
    await page.click('text=適用実行');
    await expect(page.locator('text=適用日時は現在日時以降を指定してください')).toBeVisible();
  });

  test("SCEN-369: 適用処理中の重複実行エラー", async ({ page, context }) => {
    // SCEN-369
    await page.goto("/");
    await page.click('text=モデル本番適用');
    await page.waitForURL('**/model-deployment');
    await page.selectOption('[name="model"]', { index: 1 });
    await page.check('[name="store"]:first-child');
    await page.click('text=本番適用開始');
    await page.waitForSelector('[data-testid="processing-indicator"]');
    
    const newPage = await context.newPage();
    await newPage.goto(process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000");
    await newPage.click('text=モデル本番適用');
    await newPage.selectOption('[name="model"]', { index: 1 });
    await newPage.check('[name="store"]:first-child');
    await newPage.click('text=本番適用開始');
    await expect(newPage.locator('text=既に適用処理が実行中です')).toBeVisible();
  });

  test("SCEN-370: 適用前状態でロールバックエラー", async ({ page }) => {
    // SCEN-370
    await page.goto("/");
    await page.click('text=モデル管理');
    await page.waitForURL('**/model-management');
    await page.click('[data-status="draft"]:first-child');
    await page.click('text=ロールバック');
    await expect(page.locator('text=ロールバック対象のモデルが存在しません')).toBeVisible();
  });

  test("SCEN-371: 保持期間0日設定で警告表示", async ({ page }) => {
    // SCEN-371
    await page.goto("/");
    await page.click('text=モデル管理');
    await page.waitForURL('**/model-management');
    await page.click('[data-testid="model-row"]:first-child');
    await page.click('text=本番適用');
    await page.fill('[name="retention-period"]', '0');
    await page.click('text=適用実行');
    await expect(page.locator('text=保持期間に0日が設定されています')).toBeVisible();
  });

  test("SCEN-372: 保持期間上限値設定で正常処理", async ({ page }) => {
    // SCEN-372
    await page.goto("/");
    await page.click('text=モデル本番適用');
    await page.waitForURL('**/model-deployment');
    await page.fill('[name="retention-period"]', '999');
    await page.selectOption('[name="model"]', { index: 1 });
    await page.check('[name="store"]:first-child');
    await page.click('text=本番適用実行');
    await page.click('text=実行');
    await page.waitForSelector('text=適用完了', { timeout: 60000 });
    await expect(page.locator('[data-retention="999"]')).toBeVisible();
  });

  test("SCEN-373: 全店舗選択時の影響範囲表示", async ({ page }) => {
    // SCEN-373
    await page.goto("/");
    await page.click('text=モデル本番適用');
    await page.waitForURL('**/model-deployment');
    await page.check('[name="select-all-stores"]');
    await expect(page.locator('[data-testid="impact-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="store-count"]')).toContainText('店舗数');
    await expect(page.locator('[data-testid="category-count"]')).toContainText('商品カテゴリ数');
    await expect(page.locator('[data-testid="estimated-time"]')).toContainText('予想処理時間');
    await expect(page.locator('text=大規模処理に関する警告')).toBeVisible();
  });

  test("SCEN-374: 適用開始日時境界値での処理", async ({ page }) => {
    // SCEN-374
    await page.goto("/");
    await page.click('text=モデル本番適用');
    await page.waitForURL('**/model-deployment');
    
    const pastTime = new Date(Date.now() - 60000);
    await page.fill('[name="deployment-datetime"]', pastTime.toISOString().slice(0, 16));
    await page.selectOption('[name="model"]', { index: 1 });
    await page.check('[name="store"]:first-child');
    await page.click('text=モデル適用処理実行');
    await expect(page.locator('text=適用日時は現在日時以降を指定してください')).toBeVisible();
    
    const currentTime = new Date();
    await page.fill('[name="deployment-datetime"]', currentTime.toISOString().slice(0, 16));
    await page.click('text=モデル適用処理実行');
    await page.waitForSelector('text=処理完了', { timeout: 30000 });
    
    const futureTime = new Date(Date.now() + 60000);
    await page.fill('[name="deployment-datetime"]', futureTime.toISOString().slice(0, 16));
    await page.click('text=モデル適用処理実行');
    await page.waitForSelector('text=処理完了', { timeout: 30000 });
  });

  test("SCEN-375: 適用処理中断時の状態保持", async ({ page }) => {
    // SCEN-375
    await page.goto("/");
    await page.click('text=モデル本番適用');
    await page.waitForURL('**/model-deployment');
    await page.selectOption('[name="model"]', { index: 1 });
    await page.check('[name="store"]:first-child');
    await page.click('text=本番適用開始');
    await page.waitForSelector('[data-testid="processing-indicator"]');
    await page.reload();
    await expect(page.locator('[data-testid="processing-indicator"]')).toBeVisible();
    await expect(page.locator('[data-status="processing"]')).toBeVisible();
  });
});