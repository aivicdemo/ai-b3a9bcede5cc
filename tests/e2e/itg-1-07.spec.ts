import { test, expect } from '@playwright/test';

test.describe("データ収集ログ管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000");
    // ログイン処理（実装されているログイン要素に基づいて調整が必要）
    // await page.fill('[data-testid="username"]', 'admin');
    // await page.fill('[data-testid="password"]', 'password');
    // await page.click('[data-testid="login-button"]');
  });

  test("SCEN-128: ログ一覧の初期表示", async ({ page }) => {
    // SCEN-128
    await page.click('text=データ収集ログ管理');
    await page.waitForURL('**/data-collection-logs');
    await expect(page.locator('[data-testid="log-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="log-entry"]')).toHaveCount(10);
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
  });

  test("SCEN-129: データソース選択でログ絞り込み", async ({ page }) => {
    // SCEN-129
    await page.click('text=データ収集ログ管理');
    await page.click('[data-testid="data-source-select"]');
    await expect(page.locator('[data-testid="data-source-options"]')).toBeVisible();
    await page.click('text=POS');
    await page.click('[data-testid="filter-apply-button"]');
    await expect(page.locator('[data-testid="filtered-logs"]')).toBeVisible();
    await page.click('[data-testid="data-source-select"]');
    await page.click('text=在庫管理');
    await page.click('[data-testid="filter-apply-button"]');
    await page.click('[data-testid="data-source-select"]');
    await page.click('text=すべて');
    await expect(page.locator('[data-testid="all-logs"]')).toBeVisible();
  });

  test("SCEN-130: 収集日時範囲指定で期間フィルタリング", async ({ page }) => {
    // SCEN-130
    await page.click('text=データ収集ログ管理');
    await page.fill('[data-testid="start-datetime"]', '2024-01-01 00:00:00');
    await page.fill('[data-testid="end-datetime"]', '2024-01-31 23:59:59');
    await page.click('[data-testid="filter-execute"]');
    await expect(page.locator('[data-testid="filtered-results"]')).toBeVisible();
    await page.fill('[data-testid="start-datetime"]', '2024-02-01 00:00:00');
    await page.fill('[data-testid="end-datetime"]', '2024-02-28 23:59:59');
    await page.click('[data-testid="filter-execute"]');
    await page.click('[data-testid="filter-clear"]');
    await expect(page.locator('[data-testid="all-results"]')).toBeVisible();
  });

  test("SCEN-131: ログレベル選択でフィルタリング", async ({ page }) => {
    // SCEN-131
    await page.click('text=データ収集ログ管理');
    await page.click('[data-testid="log-level-select"]');
    await page.click('text=ERROR');
    await page.click('[data-testid="filter-apply"]');
    await expect(page.locator('[data-testid="error-logs"]')).toBeVisible();
    await page.click('[data-testid="log-level-select"]');
    await page.click('text=WARNING');
    await page.click('[data-testid="filter-apply"]');
    await expect(page.locator('[data-testid="warning-logs"]')).toBeVisible();
    await page.click('[data-testid="log-level-select"]');
    await page.click('text=INFO');
    await page.click('[data-testid="filter-apply"]');
    await expect(page.locator('[data-testid="info-logs"]')).toBeVisible();
  });

  test("SCEN-132: 検索ボタンでログ絞り込み実行", async ({ page }) => {
    // SCEN-132
    await page.click('text=データ収集ログ管理');
    await page.fill('[data-testid="search-conditions"]', '2024-01-01');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="results-count"]')).toBeVisible();
  });

  test("SCEN-133: ログ行クリックで詳細モーダル表示", async ({ page }) => {
    // SCEN-133
    await page.click('text=データ収集ログ管理');
    await page.click('[data-testid="log-row"]:first-child');
    await expect(page.locator('[data-testid="log-detail-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="log-timestamp"]')).toBeVisible();
    await expect(page.locator('[data-testid="log-data-source"]')).toBeVisible();
  });

  test("SCEN-134: エラーログ再実行ボタンで処理実行", async ({ page }) => {
    // SCEN-134
    await page.click('text=データ収集ログ管理');
    await page.click('[data-testid="error-log-row"]');
    await page.click('[data-testid="retry-button"]');
    await page.click('text=OK');
    await expect(page.locator('[data-testid="processing-status"]')).toContainText('処理中');
  });

  test("SCEN-135: ログエクスポート機能でファイル出力", async ({ page }) => {
    // SCEN-135
    await page.click('text=データ収集ログ管理');
    await page.click('[data-testid="export-button"]');
    await page.click('[data-testid="export-format-csv"]');
    await page.fill('[data-testid="export-start-date"]', '2024-01-01');
    await page.fill('[data-testid="export-end-date"]', '2024-01-31');
    await page.click('[data-testid="export-execute"]');
    await expect(page.locator('[data-testid="download-dialog"]')).toBeVisible();
  });

  test("SCEN-136: 自動更新設定トグルでリアルタイム更新", async ({ page }) => {
    // SCEN-136
    await page.click('text=データ収集ログ管理');
    await page.click('[data-testid="auto-update-toggle"]');
    await expect(page.locator('[data-testid="auto-update-toggle"]')).toHaveAttribute('aria-checked', 'true');
    await page.waitForTimeout(3000);
    await expect(page.locator('[data-testid="updated-timestamp"]')).toBeVisible();
    await page.click('[data-testid="auto-update-toggle"]');
    await expect(page.locator('[data-testid="auto-update-toggle"]')).toHaveAttribute('aria-checked', 'false');
  });

  test("SCEN-137: アラート通知設定ボタンで設定画面表示", async ({ page }) => {
    // SCEN-137
    await page.click('text=データ収集ログ管理');
    await page.click('[data-testid="alert-settings-button"]');
    await expect(page.locator('[data-testid="alert-settings-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="notification-conditions"]')).toBeVisible();
  });

  test("SCEN-138: データ収集状況サマリーの正常表示", async ({ page }) => {
    // SCEN-138
    await page.click('text=データ収集ログ管理');
    await expect(page.locator('[data-testid="collection-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="collection-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="latest-collection-time"]')).toBeVisible();
  });

  test("SCEN-139: エラー状況インジケーターの状態表示", async ({ page }) => {
    // SCEN-139
    await page.click('text=データ収集ログ管理');
    await expect(page.locator('[data-testid="error-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-indicator"]')).toHaveClass(/status-normal/);
    await page.click('[data-testid="simulate-error"]');
    await expect(page.locator('[data-testid="error-indicator"]')).toHaveClass(/status-error/);
    await page.click('[data-testid="simulate-warning"]');
    await expect(page.locator('[data-testid="error-indicator"]')).toHaveClass(/status-warning/);
    await page.click('[data-testid="resolve-error"]');
    await expect(page.locator('[data-testid="error-indicator"]')).toHaveClass(/status-normal/);
  });

  test("SCEN-140: 存在しないデータソース選択でエラー", async ({ page }) => {
    // SCEN-140
    await page.click('text=データ収集ログ管理');
    await page.evaluate(() => {
      const select = document.querySelector('[data-testid="data-source-select"]') as HTMLSelectElement;
      if (select) {
        const option = document.createElement('option');
        option.value = 'invalid-source';
        option.text = 'Invalid Source';
        select.add(option);
        select.value = 'invalid-source';
      }
    });
    await page.click('[data-testid="collection-execute"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('データソースが存在しません');
  });

  test("SCEN-141: 無効な日時範囲指定でエラー表示", async ({ page }) => {
    // SCEN-141
    await page.click('text=データ収集ログ管理');
    await page.fill('[data-testid="start-datetime"]', '2024-01-31');
    await page.fill('[data-testid="end-datetime"]', '2024-01-01');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('終了日時は開始日時より後の日付を指定してください');
  });

  test("SCEN-142: サーバーエラー時のログ取得失敗", async ({ page }) => {
    // SCEN-142
    await page.route('**/api/logs', route => route.abort('failed'));
    await page.click('text=データ収集ログ管理');
    await page.click('[data-testid="refresh-logs"]');
    await expect(page.locator('[data-testid="server-error-message"]')).toBeVisible();
  });

  test("SCEN-143: 再実行権限なしでボタン無効化", async ({ page }) => {
    // SCEN-143
    await page.click('text=データ収集ログ管理');
    await expect(page.locator('[data-testid="retry-button"]')).toBeDisabled();
    await page.click('[data-testid="retry-button"]');
    await expect(page.locator('[data-testid="retry-button"]')).toBeDisabled();
  });

  test("SCEN-144: エクスポート権限なしで機能無効化", async ({ page }) => {
    // SCEN-144
    await page.click('text=データ収集ログ管理');
    await expect(page.locator('[data-testid="export-button"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="permission-error"]')).toContainText('エクスポート権限');
  });

  test("SCEN-145: 大量ログ表示時のページング", async ({ page }) => {
    // SCEN-145
    await page.click('text=データ収集ログ管理');
    await expect(page.locator('[data-testid="pagination-info"]')).toBeVisible();
    await page.click('[data-testid="next-page"]');
    await expect(page.locator('[data-testid="current-page"]')).toContainText('2');
    await page.click('[data-testid="page-3"]');
    await expect(page.locator('[data-testid="current-page"]')).toContainText('3');
    await page.click('[data-testid="prev-page"]');
    await expect(page.locator('[data-testid="current-page"]')).toContainText('2');
    await page.click('[data-testid="last-page"]');
    await page.click('[data-testid="first-page"]');
    await expect(page.locator('[data-testid="current-page"]')).toContainText('1');
    await page.selectOption('[data-testid="items-per-page"]', '100');
    await expect(page.locator('[data-testid="log-entries"]')).toHaveCount(100);
  });

  test("SCEN-146: 未来日時指定での検索結果", async ({ page }) => {
    // SCEN-146
    await page.click('text=データ収集ログ管理');
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 7);
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 14);
    await page.fill('[data-testid="start-datetime"]', futureDate1.toISOString().slice(0, 16));
    await page.fill('[data-testid="end-datetime"]', futureDate2.toISOString().slice(0, 16));
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="no-data-message"]')).toContainText('該当するデータがありません');
  });

  test("SCEN-147: 開始日時と終了日時が同一での検索", async ({ page }) => {
    // SCEN-147
    await page.click('text=データ収集ログ管理');
    await page.fill('[data-testid="start-datetime"]', '2024-01-01 10:00:00');
    await page.fill('[data-testid="end-datetime"]', '2024-01-01 10:00:00');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test("SCEN-148: 全フィルター未選択状態での検索", async ({ page }) => {
    // SCEN-148
    await page.click('text=データ収集ログ管理');
    await page.click('[data-testid="clear-all-filters"]');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="all-logs-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
  });

  test("SCEN-149: ログが存在しない期間での検索結果", async ({ page }) => {
    // SCEN-149
    await page.click('text=データ収集ログ管理');
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    await page.fill('[data-testid="start-datetime"]', futureDate.toISOString().slice(0, 16));
    futureDate.setDate(futureDate.getDate() + 7);
    await page.fill('[data-testid="end-datetime"]', futureDate.toISOString().slice(0, 16));
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="no-results-message"]')).toContainText('該当するログが見つかりません');
    await expect(page.locator('[data-testid="empty-results"]')).toBeVisible();
  });
});