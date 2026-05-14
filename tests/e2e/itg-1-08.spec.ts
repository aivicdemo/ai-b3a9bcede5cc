import { test, expect } from '@playwright/test';

test.describe("システム操作履歴管理", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(`${baseURL}/login`);
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'password');
    await page.click('[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-144: 操作履歴一覧が正常表示される', async ({ page }) => {
    // SCEN-144
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    await expect(page.locator('[data-testid="operation-history-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="history-datetime"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="history-user"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="history-operation"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="history-target"]').first()).toBeVisible();
  });

  test('SCEN-145: 日付範囲指定で履歴絞り込み', async ({ page }) => {
    // SCEN-145
    await page.goto(`${baseURL}/system/operation-history`);
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="history-list"] tr')).toHaveCount({ min: 0 });
  });

  test('SCEN-146: ユーザー選択で履歴絞り込み', async ({ page }) => {
    // SCEN-146
    await page.goto(`${baseURL}/system/operation-history`);
    await page.click('[data-testid="user-select"]');
    await page.click('text=user001');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="history-user"]')).toContainText('user001');
    await page.click('[data-testid="user-select"]');
    await page.click('text=user002');
    await page.click('[data-testid="filter-button"]');
    await page.click('[data-testid="clear-filter"]');
  });

  test('SCEN-147: 操作種別で履歴絞り込み', async ({ page }) => {
    // SCEN-147
    await page.goto(`${baseURL}/system/operation-history`);
    await page.click('[data-testid="operation-type-select"]');
    await page.click('text=データ更新');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="operation-type-column"]')).toContainText('データ更新');
    await page.click('[data-testid="operation-type-select"]');
    await page.click('text=ログイン');
    await page.click('[data-testid="filter-button"]');
  });

  test('SCEN-148: 画面名検索で履歴絞り込み', async ({ page }) => {
    // SCEN-148
    await page.goto(`${baseURL}/system/operation-history`);
    await page.fill('[data-testid="screen-name-search"]', '商品マスタ管理');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="screen-name-column"]')).toContainText('商品マスタ管理');
    await page.fill('[data-testid="screen-name-search"]', '発注管理');
    await page.click('[data-testid="search-button"]');
    await page.fill('[data-testid="screen-name-search"]', '管理');
    await page.click('[data-testid="search-button"]');
  });

  test('SCEN-149: IPアドレス検索で履歴絞り込み', async ({ page }) => {
    // SCEN-149
    await page.goto(`${baseURL}/system/operation-history`);
    await page.fill('[data-testid="ip-address-search"]', '192.168.1.100');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(1000);
    const ipCells = page.locator('[data-testid="ip-address-column"]');
    const count = await ipCells.count();
    for (let i = 0; i < count; i++) {
      await expect(ipCells.nth(i)).toContainText('192.168.1.100');
    }
  });

  test('SCEN-150: 操作結果で履歴絞り込み', async ({ page }) => {
    // SCEN-150
    await page.goto(`${baseURL}/system/operation-history`);
    await page.selectOption('[data-testid="operation-result-select"]', '成功');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="result-column"]')).toContainText('成功');
    await page.selectOption('[data-testid="operation-result-select"]', '失敗');
    await page.click('[data-testid="search-button"]');
    await page.selectOption('[data-testid="operation-result-select"]', '全て');
    await page.click('[data-testid="search-button"]');
  });

  test('SCEN-151: 複数条件組み合わせ検索', async ({ page }) => {
    // SCEN-151
    await page.goto(`${baseURL}/system/operation-history`);
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-07');
    await page.selectOption('[data-testid="user-select"]', 'user001');
    await page.selectOption('[data-testid="operation-type-select"]', 'データ更新');
    await page.selectOption('[data-testid="target-function-select"]', '需要予測');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
  });

  test('SCEN-152: 検索条件クリアで全件表示', async ({ page }) => {
    // SCEN-152
    await page.goto(`${baseURL}/system/operation-history`);
    await page.fill('[data-testid="user-search"]', 'test_user');
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.selectOption('[data-testid="operation-type-select"]', 'ログイン');
    await page.click('[data-testid="search-button"]');
    await page.click('[data-testid="clear-button"]');
    await expect(page.locator('[data-testid="user-search"]')).toHaveValue('');
    await expect(page.locator('[data-testid="start-date"]')).toHaveValue('');
  });

  test('SCEN-153: CSV出力が正常実行される', async ({ page }) => {
    // SCEN-153
    await page.goto(`${baseURL}/system/operation-history`);
    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="csv-export-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('SCEN-154: 操作履歴詳細モーダル表示', async ({ page }) => {
    // SCEN-154
    await page.goto(`${baseURL}/system/operation-history`);
    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
    await page.click('[data-testid="detail-button"]').first();
    await expect(page.locator('[data-testid="detail-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="detail-datetime"]')).toBeVisible();
    await expect(page.locator('[data-testid="detail-username"]')).toBeVisible();
    await expect(page.locator('[data-testid="detail-operation"]')).toBeVisible();
    await expect(page.locator('[data-testid="detail-ipaddress"]')).toBeVisible();
  });

  test('SCEN-155: ページネーション動作確認', async ({ page }) => {
    // SCEN-155
    await page.goto(`${baseURL}/system/operation-history`);
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    await page.click('[data-testid="next-page"]');
    await expect(page.locator('[data-testid="current-page"]')).toContainText('2');
    await page.click('[data-testid="prev-page"]');
    await expect(page.locator('[data-testid="current-page"]')).toContainText('1');
    await page.click('[data-testid="page-3"]');
    await expect(page.locator('[data-testid="current-page"]')).toContainText('3');
  });

  test('SCEN-156: 開始日が終了日より後の日付', async ({ page }) => {
    // SCEN-156
    await page.goto(`${baseURL}/system/operation-history`);
    await page.fill('[data-testid="start-date"]', '2024-12-31');
    await page.fill('[data-testid="end-date"]', '2024-01-01');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('開始日が終了日より後');
  });

  test('SCEN-157: 存在しないユーザー検索', async ({ page }) => {
    // SCEN-157
    await page.goto(`${baseURL}/system/operation-history`);
    await page.fill('[data-testid="user-search"]', 'nonexistent_user_999');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('該当するユーザーが見つかりません');
  });

  test('SCEN-158: 不正なIPアドレス形式入力', async ({ page }) => {
    // SCEN-158
    await page.goto(`${baseURL}/system/operation-history`);
    await page.fill('[data-testid="ip-address-search"]', '999.999.999.999');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('正しいIPアドレス');
    await page.fill('[data-testid="ip-address-search"]', 'abc.def.ghi.jkl');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
  });

  test('SCEN-159: 検索結果0件時の表示', async ({ page }) => {
    // SCEN-159
    await page.goto(`${baseURL}/system/operation-history`);
    await page.fill('[data-testid="user-search"]', '存在しないユーザー999');
    await page.fill('[data-testid="start-date"]', '2099-01-01');
    await page.fill('[data-testid="end-date"]', '2099-01-31');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="no-data-message"]')).toContainText('該当する操作履歴が見つかりませんでした');
  });

  test('SCEN-160: 大量データでのCSV出力', async ({ page }) => {
    // SCEN-160
    await page.goto(`${baseURL}/system/operation-history`);
    await page.fill('[data-testid="start-date"]', '2023-01-01');
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.click('[data-testid="search-button"]');
    await page.waitForTimeout(2000);
    await page.click('[data-testid="csv-export-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('タイムアウト|メモリ不足');
  });

  test('SCEN-161: 日付範囲上限値での検索', async ({ page }) => {
    // SCEN-161
    await page.goto(`${baseURL}/system/operation-history`);
    const today = new Date().toISOString().split('T')[0];
    await page.fill('[data-testid="start-date"]', today);
    await page.fill('[data-testid="end-date"]', '2099-12-31');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
  });

  test('SCEN-162: 検索文字列最大長入力', async ({ page }) => {
    // SCEN-162
    await page.goto(`${baseURL}/system/operation-history`);
    const maxLengthString = 'a'.repeat(255);
    await page.fill('[data-testid="search-field"]', maxLengthString);
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="history-list"]')).toBeVisible();
    const overMaxString = 'a'.repeat(256);
    await page.fill('[data-testid="search-field"]', overMaxString);
    const inputValue = await page.locator('[data-testid="search-field"]').inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(255);
  });

  test('SCEN-163: 最終ページでのページネーション', async ({ page }) => {
    // SCEN-163
    await page.goto(`${baseURL}/system/operation-history`);
    await page.click('[data-testid="last-page"]');
    await expect(page.locator('[data-testid="next-page"]')).toBeDisabled();
    await expect(page.locator('[data-testid="prev-page"]')).toBeEnabled();
    await page.click('[data-testid="prev-page"]');
    await page.click('[data-testid="next-page"]');
    await expect(page.locator('[data-testid="next-page"]')).toBeDisabled();
  });

  test('SCEN-164: 1件のみ表示時の動作', async ({ page }) => {
    // SCEN-164
    await page.goto(`${baseURL}/system/operation-history`);
    await page.fill('[data-testid="user-search"]', 'single_record_user');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="history-list"] tr')).toHaveCount(1);
    await page.click('[data-testid="history-list"] tr').first();
    await expect(page.locator('[data-testid="pagination"]')).not.toBeVisible();
    await page.click('[data-testid="sort-datetime"]');
    await expect(page.locator('[data-testid="history-list"] tr')).toHaveCount(1);
  });
});