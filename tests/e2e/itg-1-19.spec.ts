import { test, expect } from '@playwright/test';

test.describe("モデル本番適用処理", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await page.fill('#username', 'admin');
    await page.fill('#password', 'password');
    await page.click('#login-button');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-356: 適用対象モデルを選択して本番適用が正常完了する', async ({ page }) => {
    // SCEN-356
    await page.click('text=モデル管理');
    await page.waitForURL('**/model-management');
    await expect(page.locator('.model-list')).toBeVisible();
    await page.click('.model-item:first-child .select-button');
    await page.click('#production-apply-button');
    await page.click('#confirm-dialog-yes');
    await expect(page.locator('.progress-indicator')).toBeVisible();
    await expect(page.locator('.completion-notification')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.model-status')).toHaveText('本番適用中');
  });

  test('SCEN-357: 複数店舗を選択してモデル適用が正常実行される', async ({ page }) => {
    // SCEN-357
    await page.click('text=モデル本番適用処理');
    await page.waitForURL('**/model-production-apply');
    await page.check('.store-checkbox:nth-child(1)');
    await page.check('.store-checkbox:nth-child(2)');
    await page.check('.store-checkbox:nth-child(3)');
    await page.selectOption('#model-select', '1');
    await page.fill('#apply-start-date', '2024-01-01');
    await page.click('#execute-apply-button');
    await page.click('#confirm-dialog-ok');
    await expect(page.locator('.progress-status')).toBeVisible();
    await expect(page.locator('.completion-message')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.store-status')).toContainText('成功');
  });

  test('SCEN-358: バックアップ設定ONでモデル適用が正常完了する', async ({ page }) => {
    // SCEN-358
    await page.click('text=モデル管理');
    await page.click('.model-item:first-child');
    await page.click('#production-apply-button');
    await page.check('#backup-setting');
    await page.click('#execute-button');
    await expect(page.locator('.progress-indicator')).toBeVisible();
    await expect(page.locator('.completion-notification')).toBeVisible({ timeout: 30000 });
    await page.click('#back-to-list');
    await expect(page.locator('.apply-status')).toHaveText('本番適用中');
    await expect(page.locator('.backup-log')).toContainText('バックアップ作成完了');
  });

  test('SCEN-359: 適用実行後にロールバックが正常実行される', async ({ page }) => {
    // SCEN-359
    await page.click('text=モデル本番適用処理');
    await page.selectOption('#model-select', '1');
    await page.click('#execute-apply-button');
    await expect(page.locator('.completion-message')).toBeVisible({ timeout: 30000 });
    await page.click('text=モデル管理');
    await page.click('.model-item .rollback-button');
    await page.click('#rollback-confirm');
    await expect(page.locator('.rollback-progress')).toBeVisible();
    await expect(page.locator('.rollback-completion')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.current-model-info')).toContainText('前バージョン');
    await expect(page.locator('.system-status')).toHaveText('正常稼働');
  });

  test('SCEN-360: 適用状況進捗バーが正常に更新される', async ({ page }) => {
    // SCEN-360
    await page.click('text=モデル管理');
    await page.click('.model-item:first-child .select-button');
    await page.click('#production-apply-button');
    await page.click('#confirm-execute');
    await expect(page.locator('.progress-bar')).toHaveAttribute('value', '0');
    await expect(page.locator('.progress-bar')).not.toHaveAttribute('value', '0', { timeout: 5000 });
    await expect(page.locator('.progress-stage')).toContainText('検証');
    await expect(page.locator('.progress-stage')).toContainText('デプロイ');
    await expect(page.locator('.progress-stage')).toContainText('切替');
    await expect(page.locator('.progress-bar')).toHaveAttribute('value', '100', { timeout: 30000 });
  });

  test('SCEN-361: 適用結果ログが正常に表示される', async ({ page }) => {
    // SCEN-361
    await page.click('text=モデル管理');
    await page.click('.model-item.applied:first-child');
    await page.click('#apply-result-log');
    await expect(page.locator('.log-display')).toBeVisible();
    await expect(page.locator('.log-start-time')).toBeVisible();
    await expect(page.locator('.log-completion-time')).toBeVisible();
    await expect(page.locator('.log-status')).toBeVisible();
    await expect(page.locator('.log-details')).toBeVisible();
  });

  test('SCEN-362: モデル未選択で適用実行時にエラー表示', async ({ page }) => {
    // SCEN-362
    await page.click('text=モデル本番適用処理');
    await page.click('#execute-apply-button');
    await expect(page.locator('.error-message')).toHaveText('モデルを選択してください');
    await expect(page.locator('.progress-indicator')).not.toBeVisible();
  });

  test('SCEN-363: 店舗未選択で適用実行時にエラー表示', async ({ page }) => {
    // SCEN-363
    await page.click('text=モデル本番適用処理');
    await page.selectOption('#model-select', '1');
    await page.click('#execute-apply-button');
    await expect(page.locator('.error-message')).toHaveText('店舗を選択してください');
    await expect(page.locator('.progress-indicator')).not.toBeVisible();
  });

  test('SCEN-364: 適用開始日時未入力で適用実行時にエラー表示', async ({ page }) => {
    // SCEN-364
    await page.click('text=モデル本番適用処理');
    await page.selectOption('#model-select', '1');
    await page.fill('#apply-end-date', '2024-12-31');
    await page.click('#execute-apply-button');
    await expect(page.locator('.error-message')).toHaveText('適用開始日時を入力してください');
    await expect(page.locator('.progress-indicator')).not.toBeVisible();
  });

  test('SCEN-365: 過去日時入力で適用実行時にエラー表示', async ({ page }) => {
    // SCEN-365
    await page.click('text=モデル管理');
    await page.click('.model-item:first-child .select-button');
    await page.click('#production-apply-button');
    await page.fill('#apply-start-datetime', '2020-01-01 10:00:00');
    await page.click('#execute-apply-button');
    await expect(page.locator('.error-message')).toHaveText('適用開始日時には現在日時以降を指定してください');
    await expect(page.locator('.progress-indicator')).not.toBeVisible();
  });

  test('SCEN-366: 適用前検証NGでモデル適用が実行不可', async ({ page }) => {
    // SCEN-366
    await page.click('text=モデル管理');
    await page.click('.model-item.validation-ng:first-child .select-button');
    await page.click('#production-apply-button');
    await expect(page.locator('.validation-progress')).toBeVisible();
    await expect(page.locator('.validation-error')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.error-details')).toContainText('データ品質チェックNG');
    await expect(page.locator('#execute-apply-button')).toBeDisabled();
  });

  test('SCEN-367: 適用処理中にシステムエラーが発生した場合の表示', async ({ page }) => {
    // SCEN-367
    await page.click('text=モデル管理');
    await page.click('.model-item:first-child .select-button');
    await page.click('#production-apply-button');
    await page.click('#confirm-execute');
    await expect(page.locator('.progress-indicator')).toBeVisible();
    await page.route('**/api/model/apply', route => route.abort());
    await expect(page.locator('.system-error-message')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.error-details')).toContainText('システムエラーが発生しました');
    await expect(page.locator('.retry-option')).toBeVisible();
    await expect(page.locator('.contact-admin')).toBeVisible();
  });

  test('SCEN-368: 適用開始日時に現在時刻を入力して即座実行', async ({ page }) => {
    // SCEN-368
    await page.click('text=モデル本番適用処理');
    await page.selectOption('#model-select', '1');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await page.fill('#apply-start-datetime', now);
    await page.click('#execute-start-button');
    await page.click('#confirm-ok');
    await expect(page.locator('.processing-status')).toHaveText('適用中');
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  test('SCEN-369: 全店舗選択でモデル適用実行', async ({ page }) => {
    // SCEN-369
    await page.click('text=モデル本番適用処理');
    await page.check('#select-all-stores');
    await expect(page.locator('.store-checkbox:checked')).toHaveCount(await page.locator('.store-checkbox').count());
    await page.selectOption('#model-select', '1');
    await page.click('#execute-apply-button');
    await page.click('#confirm-execute');
    await expect(page.locator('.progress-indicator')).toBeVisible();
    await expect(page.locator('.completion-message')).toBeVisible({ timeout: 30000 });
    await expect(page.locator('.store-status')).toContainText('適用済み');
    await expect(page.locator('.apply-datetime')).not.toBeEmpty();
  });

  test('SCEN-370: 現行モデル保持期間を最大値に設定', async ({ page }) => {
    // SCEN-370
    await page.click('text=モデル本番適用処理');
    await page.click('#settings-tab');
    await page.fill('#model-retention-period', '9999');
    await page.click('#save-settings');
    await page.click('#confirm-ok');
    await expect(page.locator('.save-success-message')).toBeVisible();
    await page.reload();
    await expect(page.locator('#model-retention-period')).toHaveValue('9999');
  });

  test('SCEN-371: 現行モデル保持期間を最小値に設定', async ({ page }) => {
    // SCEN-371
    await page.click('text=モデル管理');
    await page.click('#settings-tab');
    await page.fill('#model-retention-period', '1');
    await page.click('#save-settings');
    await page.selectOption('#model-select', '1');
    await page.click('#apply-model');
    await expect(page.locator('.apply-completion')).toBeVisible({ timeout: 30000 });
    await page.click('#simulate-time-advance');
    await expect(page.locator('.old-model')).not.toBeVisible();
    await expect(page.locator('.current-model')).toBeVisible();
  });

  test('SCEN-372: 適用処理中に画面更新や他操作を実行', async ({ page }) => {
    // SCEN-372
    await page.click('text=モデル管理');
    await page.click('.model-item:first-child .select-button');
    await page.click('#production-apply-button');
    await expect(page.locator('.progress-indicator')).toBeVisible();
    await page.reload();
    await expect(page.locator('.refresh-warning')).toBeVisible();
    await page.click('#cancel-refresh');
    await page.click('text=需要予測');
    await expect(page.locator('.navigation-blocked')).toBeVisible();
    await page.click('.model-item:nth-child(2) .apply-button');
    await expect(page.locator('.operation-blocked')).toBeVisible();
    await page.click('#logout-button');
    await expect(page.locator('.logout-warning')).toBeVisible();
    await expect(page.locator('.completion-notification')).toBeVisible({ timeout: 30000 });
  });
});