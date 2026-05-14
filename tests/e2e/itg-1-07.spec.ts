import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("データ収集ログ管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'password');
    await page.click('[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-124: ログ一覧が正常に表示される', async ({ page }) => {
    // SCEN-124
    await page.click('text=データ収集ログ管理');
    await page.waitForURL('**/data-collection-logs');
    await expect(page.locator('h1')).toContainText('データ収集ログ管理');
    await expect(page.locator('th:has-text("日時")')).toBeVisible();
    await expect(page.locator('th:has-text("データソース")')).toBeVisible();
    await expect(page.locator('th:has-text("ステータス")')).toBeVisible();
    await expect(page.locator('th:has-text("件数")')).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('SCEN-125: データソース選択でログが絞り込まれる', async ({ page }) => {
    // SCEN-125
    await page.goto(`${BASE_URL}/data-collection-logs`);
    await page.click('[data-testid="datasource-dropdown"]');
    await page.click('text=POSシステム');
    await page.click('button:has-text("検索")');
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.locator('tbody td:has-text("POSシステム")')).toBeVisible();
  });

  test('SCEN-126: 収集日時範囲指定で期間内ログが表示される', async ({ page }) => {
    // SCEN-126
    await page.goto(`${BASE_URL}/data-collection-logs`);
    await page.fill('[data-testid="start-datetime"]', '2024-01-01T00:00:00');
    await page.fill('[data-testid="end-datetime"]', '2024-01-31T23:59:59');
    await page.click('button:has-text("検索")');
    const logEntries = page.locator('tbody tr');
    await expect(logEntries.first()).toBeVisible();
  });

  test('SCEN-127: ログレベル選択でフィルタリングされる', async ({ page }) => {
    // SCEN-127
    await page.goto(`${BASE_URL}/data-collection-logs`);
    await page.selectOption('[data-testid="log-level-select"]', 'ERROR');
    await expect(page.locator('tbody td:has-text("ERROR")')).toBeVisible();
    await page.selectOption('[data-testid="log-level-select"]', 'INFO');
    await expect(page.locator('tbody td:has-text("INFO")')).toBeVisible();
    await page.selectOption('[data-testid="log-level-select"]', 'すべて');
    await expect(page.locator('tbody tr')).toHaveCountGreaterThan(0);
  });

  test('SCEN-128: エラー状況インジケーターが正常に表示される', async ({ page }) => {
    // SCEN-128
    await page.goto(`${BASE_URL}/data-collection-logs`);
    await expect(page.locator('[data-testid="error-indicator"].error')).toBeVisible();
    await page.hover('[data-testid="error-indicator"]');
    await expect(page.locator('[role="tooltip"]')).toContainText('エラー');
  });

  test('SCEN-129: データ収集サマリーが正しく表示される', async ({ page }) => {
    // SCEN-129
    await page.goto(`${BASE_URL}/data-collection-logs`);
    await expect(page.locator('[data-testid="summary-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="summary-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="summary-failure"]')).toBeVisible();
    await expect(page.locator('[data-testid="summary-last-execution"]')).toBeVisible();
  });

  test('SCEN-130: 検索条件で絞り込み実行される', async ({ page }) => {
    // SCEN-130
    await page.goto(`${BASE_URL}/data-collection-logs`);
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.selectOption('[data-testid="datasource-select"]', 'POSシステム');
    await page.selectOption('[data-testid="status-select"]', '成功');
    await page.click('button:has-text("検索")');
    await expect(page.locator('[data-testid="search-result-count"]')).toBeVisible();
  });

  test('SCEN-131: ログ詳細モーダルが開く', async ({ page }) => {
    // SCEN-131
    await page.goto(`${BASE_URL}/data-collection-logs`);
    await page.click('tbody tr:first-child button:has-text("詳細")');
    await expect(page.locator('[data-testid="log-detail-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="log-id"]')).toBeVisible();
    await expect(page.locator('[data-testid="log-datetime"]')).toBeVisible();
  });

  test('SCEN-132: エラーログ再実行が成功する', async ({ page }) => {
    // SCEN-132
    await page.goto(`${BASE_URL}/data-collection-logs`);
    await page.selectOption('[data-testid="status-filter"]', 'エラー');
    await page.click('tbody tr:first-child [data-testid="rerun-button"]');
    await page.click('button:has-text("実行")');
    await expect(page.locator('text=再実行が完了しました')).toBeVisible();
  });

  test('SCEN-133: ログエクスポートが実行される', async ({ page }) => {
    // SCEN-133
    await page.goto(`${BASE_URL}/data-collection-logs`);
    await page.fill('[data-testid="export-start-date"]', '2024-01-01');
    await page.fill('[data-testid="export-end-date"]', '2024-01-31');
    await page.selectOption('[data-testid="export-format"]', 'CSV');
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("エクスポート実行")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('SCEN-134: 自動更新設定が有効になる', async ({ page }) => {
    // SCEN-134
    await page.goto(`${BASE_URL}/data-collection-logs`);
    await page.check('[data-testid="auto-refresh-toggle"]');
    await page.click('button:has-text("保存")');
    await page.click('button:has-text("OK")');
    await page.reload();
    await expect(page.locator('[data-testid="auto-refresh-toggle"]')).toBeChecked();
  });

  test('SCEN-135: アラート通知設定が開く', async ({ page }) => {
    // SCEN-135
    await page.goto(`${BASE_URL}/data-collection-logs`);
    await page.click('[data-testid="settings-button"]');
    await page.click('text=アラート通知設定');
    await expect(page.locator('h2:has-text("アラート通知設定")')).toBeVisible();
    await expect(page.locator('[data-testid="notification-conditions"]')).toBeVisible();
  });

  test('SCEN-136: データソース未選択でエラー表示', async ({ page }) => {
    // SCEN-136
    await page.goto(`${BASE_URL}/data-collection-logs`);
    await page.click('button:has-text("データ収集開始")');
    await expect(page.locator('text=データソースを選択してください')).toBeVisible();
  });

  test('SCEN-137: 収集日時の開始日が終了日より後でエラー', async ({ page }) => {
    // SCEN-137
    await page.goto(`${BASE_URL}/data-collection-logs`);
    await page.fill('[data-testid="start-date"]', '2024-03-15');
    await page.fill('[data-testid="end-date"]', '2024-03-10');
    await page.click('button:has-text("検索")');
    await expect(page.locator('text=開始日は終了日より前の日付を設定してください')).toBeVisible();
  });

  test('SCEN-138: エラーログ再実行が失敗時にエラー表示', async ({ page }) => {
    // SCEN-138
    await page.goto(`${BASE_URL}/data-collection-logs`);
    await page.route('**/api/logs/rerun', route => route.abort());
    await page.click('tbody tr:first-child [data-testid="rerun-button"]');
    await expect(page.locator('text=再実行に失敗しました')).toBeVisible();
  });

  test('SCEN-139: ログエクスポート失敗時にエラー表示', async ({ page }) => {
    // SCEN-139
    await page.goto(`${BASE_URL}/data-collection-logs`);
    await page.route('**/api/logs/export', route => route.abort());
    await page.click('button:has-text("エクスポート")');
    await expect(page.locator('text=エクスポートに失敗しました')).toBeVisible();
  });

  test('SCEN-140: 大量ログ表示時のパフォーマンス', async ({ page }) => {
    // SCEN-140
    await page.goto(`${BASE_URL}/data-collection-logs`);
    const startTime = Date.now();
    await page.click('button:has-text("全ログ表示")');
    await page.waitForSelector('tbody tr', { timeout: 5000 });
    const endTime = Date.now();
    expect(endTime - startTime).toBeLessThan(5000);
    await expect(page.locator('tbody tr')).toHaveCountGreaterThan(10000);
  });

  test('SCEN-141: 収集日時範囲の上限値での動作', async ({ page }) => {
    // SCEN-141
    await page.goto(`${BASE_URL}/data-collection-logs`);
    await page.fill('[data-testid="start-datetime"]', '1970-01-01T00:00:00');
    await page.fill('[data-testid="end-datetime"]', '2099-12-31T23:59:59');
    await page.click('button:has-text("検索")');
    await expect(page.locator('tbody tr')).toHaveCountGreaterThan(0);
    await page.click('button:has-text("エクスポート")');
    await expect(page.locator('text=エクスポートが完了しました')).toBeVisible();
  });

  test('SCEN-142: ログ詳細の最大文字数表示', async ({ page }) => {
    // SCEN-142
    await page.goto(`${BASE_URL}/data-collection-logs`);
    await page.click('tbody tr:has([data-testid="max-length-log"]) button:has-text("詳細")');
    await expect(page.locator('[data-testid="log-detail-content"]')).toBeVisible();
    const scrollHeight = await page.locator('[data-testid="log-detail-content"]').evaluate(el => el.scrollHeight);
    const clientHeight = await page.locator('[data-testid="log-detail-content"]').evaluate(el => el.clientHeight);
    expect(scrollHeight).toBeGreaterThan(clientHeight);
  });

  test('SCEN-143: 同時刻の大量エラーログ表示', async ({ page }) => {
    // SCEN-143
    await page.goto(`${BASE_URL}/data-collection-logs`);
    await page.fill('[data-testid="datetime-filter"]', '2024-01-15T10:30:00');
    await page.selectOption('[data-testid="status-filter"]', 'エラー');
    await page.click('button:has-text("検索")');
    await expect(page.locator('tbody tr')).toHaveCountGreaterThan(100);
    await page.click('tbody tr:first-child button:has-text("詳細")');
    await expect(page.locator('[data-testid="log-detail-modal"]')).toBeVisible();
    await page.click('[data-testid="sort-by-time"]');
    await expect(page.locator('tbody tr:first-child')).toBeVisible();
  });
});