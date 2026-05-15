import { test, expect } from '@playwright/test';

test.describe("システム操作履歴管理", () => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-150: 操作履歴一覧が正常に表示される', async ({ page }) => {
    // SCEN-150
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    await page.waitForURL('**/system/operation-history');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("日時")')).toBeVisible();
    await expect(page.locator('th:has-text("ユーザー名")')).toBeVisible();
    await expect(page.locator('th:has-text("操作内容")')).toBeVisible();
    await expect(page.locator('th:has-text("対象データ")')).toBeVisible();
    await expect(page.locator('.pagination')).toBeVisible();
    await expect(page.locator('input[placeholder="検索"]')).toBeVisible();
  });

  test('SCEN-151: 日付範囲指定で履歴が絞り込まれる', async ({ page }) => {
    // SCEN-151
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-01-31');
    await page.click('button:has-text("検索")');
    const dates = await page.locator('td[data-column="date"]').allTextContents();
    dates.forEach(date => {
      expect(new Date(date) >= new Date('2024-01-01')).toBe(true);
      expect(new Date(date) <= new Date('2024-01-31')).toBe(true);
    });
  });

  test('SCEN-152: ユーザー選択で履歴が絞り込まれる', async ({ page }) => {
    // SCEN-152
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    await page.click('select[name="userId"]');
    await page.selectOption('select[name="userId"]', { label: '田中太郎' });
    await page.click('button:has-text("検索")');
    const users = await page.locator('td[data-column="username"]').allTextContents();
    users.forEach(user => {
      expect(user).toBe('田中太郎');
    });
  });

  test('SCEN-153: 操作種別フィルターで履歴が絞り込まれる', async ({ page }) => {
    // SCEN-153
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    await page.selectOption('select[name="operationType"]', 'ログイン');
    await page.click('button:has-text("検索")');
    let operations = await page.locator('td[data-column="operation"]').allTextContents();
    operations.forEach(op => expect(op).toContain('ログイン'));
    
    await page.selectOption('select[name="operationType"]', 'データ更新');
    await page.click('button:has-text("検索")');
    operations = await page.locator('td[data-column="operation"]').allTextContents();
    operations.forEach(op => expect(op).toContain('データ更新'));
  });

  test('SCEN-154: 画面名・機能名で履歴が検索される', async ({ page }) => {
    // SCEN-154
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    await page.fill('input[name="screenName"]', '需要予測画面');
    await page.click('button:has-text("検索")');
    let screens = await page.locator('td[data-column="screen"]').allTextContents();
    screens.forEach(screen => expect(screen).toContain('需要予測画面'));
    
    await page.fill('input[name="screenName"]', '');
    await page.fill('input[name="functionName"]', '発注登録');
    await page.click('button:has-text("検索")');
    let functions = await page.locator('td[data-column="function"]').allTextContents();
    functions.forEach(func => expect(func).toContain('発注登録'));
  });

  test('SCEN-155: IPアドレスで履歴が検索される', async ({ page }) => {
    // SCEN-155
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    await page.fill('input[name="ipAddress"]', '192.168.1.100');
    await page.click('button:has-text("検索")');
    const ips = await page.locator('td[data-column="ipAddress"]').allTextContents();
    ips.forEach(ip => expect(ip).toBe('192.168.1.100'));
  });

  test('SCEN-156: 操作結果成功・失敗で履歴が絞り込まれる', async ({ page }) => {
    // SCEN-156
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    
    await page.selectOption('select[name="operationResult"]', '成功');
    await page.click('button:has-text("検索")');
    let results = await page.locator('td[data-column="result"]').allTextContents();
    results.forEach(result => expect(result).toBe('成功'));
    
    await page.selectOption('select[name="operationResult"]', '失敗');
    await page.click('button:has-text("検索")');
    results = await page.locator('td[data-column="result"]').allTextContents();
    results.forEach(result => expect(result).toBe('失敗'));
    
    await page.selectOption('select[name="operationResult"]', 'すべて');
    await page.click('button:has-text("検索")');
    results = await page.locator('td[data-column="result"]').allTextContents();
    expect(results.some(r => r === '成功' || r === '失敗')).toBe(true);
  });

  test('SCEN-157: 複数条件組み合わせで詳細検索できる', async ({ page }) => {
    // SCEN-157
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-12-31');
    await page.selectOption('select[name="userId"]', { index: 1 });
    await page.selectOption('select[name="operationType"]', '発注データ更新');
    await page.selectOption('select[name="targetFunction"]', '需要予測');
    await page.click('button:has-text("検索")');
    
    await page.selectOption('select[name="operationResult"]', '成功');
    await page.click('button:has-text("検索")');
    const results = await page.locator('td[data-column="result"]').allTextContents();
    results.forEach(result => expect(result).toBe('成功'));
  });

  test('SCEN-158: 検索条件クリアで全条件がリセットされる', async ({ page }) => {
    // SCEN-158
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="username"]', 'testuser');
    await page.selectOption('select[name="operationType"]', 'ログイン');
    await page.click('button:has-text("検索")');
    
    await page.click('button:has-text("クリア")');
    await expect(page.locator('input[name="startDate"]')).toHaveValue('');
    await expect(page.locator('input[name="username"]')).toHaveValue('');
    await expect(page.locator('select[name="operationType"]')).toHaveValue('');
  });

  test('SCEN-159: CSV出力で履歴データがダウンロードされる', async ({ page }) => {
    // SCEN-159
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-12-31');
    await page.click('button:has-text("検索")');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("CSV出力")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/.*\.csv$/);
  });

  test('SCEN-160: 操作履歴詳細モーダルが表示される', async ({ page }) => {
    // SCEN-160
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    await page.click('button:has-text("詳細")');
    await expect(page.locator('.modal')).toBeVisible();
    await expect(page.locator('.modal .modal-title')).toContainText('操作履歴詳細');
    await expect(page.locator('.modal [data-field="datetime"]')).toBeVisible();
    await expect(page.locator('.modal [data-field="username"]')).toBeVisible();
    await expect(page.locator('.modal [data-field="operation"]')).toBeVisible();
    await expect(page.locator('.modal [data-field="target"]')).toBeVisible();
    await expect(page.locator('.modal [data-field="ipAddress"]')).toBeVisible();
  });

  test('SCEN-161: ページネーションで次ページに移動できる', async ({ page }) => {
    // SCEN-161
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    await page.click('button:has-text("次へ")');
    await expect(page.locator('.pagination .active')).toContainText('2');
    await expect(page.url()).toContain('page=2');
  });

  test('SCEN-162: 開始日が終了日より後の日付でエラー', async ({ page }) => {
    // SCEN-162
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    await page.fill('input[name="startDate"]', '2024-12-31');
    await page.fill('input[name="endDate"]', '2024-01-01');
    await page.click('button:has-text("検索")');
    await expect(page.locator('.error-message')).toContainText('開始日は終了日より前の日付を入力してください');
  });

  test('SCEN-163: 存在しない画面名で検索結果なし', async ({ page }) => {
    // SCEN-163
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    await page.fill('input[name="screenName"]', '存在しない画面ABC123');
    await page.click('button:has-text("検索")');
    await expect(page.locator('.no-results')).toContainText('該当する操作履歴が見つかりませんでした');
  });

  test('SCEN-164: 不正なIPアドレス形式でエラー', async ({ page }) => {
    // SCEN-164
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    await page.fill('input[name="ipAddress"]', '999.999.999.999');
    await page.click('button:has-text("検索")');
    await expect(page.locator('.error-message')).toContainText('正しいIPアドレス形式で入力してください');
  });

  test('SCEN-165: 履歴データなしでCSV出力エラー', async ({ page }) => {
    // SCEN-165
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    await page.fill('input[name="startDate"]', '1999-01-01');
    await page.fill('input[name="endDate"]', '1999-01-01');
    await page.click('button:has-text("検索")');
    await page.click('button:has-text("CSV出力")');
    await expect(page.locator('.error-message')).toContainText('出力可能なデータがありません');
  });

  test('SCEN-166: 存在しないページ番号でエラー', async ({ page }) => {
    // SCEN-166
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    await page.goto(baseURL + '/system/operation-history?page=999999');
    await expect(page.locator('.error-message')).toContainText('指定されたページが見つかりません');
  });

  test('SCEN-167: 日付範囲の境界値で正常検索', async ({ page }) => {
    // SCEN-167
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[name="startDate"]', today);
    await page.fill('input[name="endDate"]', today);
    await page.click('button:has-text("検索")');
    await expect(page.locator('table')).toBeVisible();
    
    const past30Days = new Date();
    past30Days.setDate(past30Days.getDate() - 30);
    await page.fill('input[name="startDate"]', past30Days.toISOString().split('T')[0]);
    await page.fill('input[name="endDate"]', today);
    await page.click('button:has-text("検索")');
    await expect(page.locator('table')).toBeVisible();
    
    await page.fill('input[name="startDate"]', '2020-01-01');
    await page.fill('input[name="endDate"]', today);
    await page.click('button:has-text("検索")');
    await expect(page.locator('table')).toBeVisible();
  });

  test('SCEN-168: 最大文字数での画面名検索', async ({ page }) => {
    // SCEN-168
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    
    const maxLengthString = 'a'.repeat(255);
    await page.fill('input[name="screenName"]', maxLengthString);
    await page.click('button:has-text("検索")');
    await expect(page.locator('table')).toBeVisible();
    
    const overLengthString = 'a'.repeat(256);
    await page.fill('input[name="screenName"]', overLengthString);
    await page.click('button:has-text("検索")');
    await expect(page.locator('.error-message')).toContainText('文字数制限を超えています');
  });

  test('SCEN-169: IPv6アドレスでの検索', async ({ page }) => {
    // SCEN-169
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    await page.fill('input[name="ipAddress"]', '2001:db8::1');
    await page.click('button:has-text("検索")');
    await expect(page.locator('table')).toBeVisible();
    
    await page.fill('input[name="ipAddress"]', '2001:db8::gg1');
    await page.click('button:has-text("検索")');
    await expect(page.locator('.error-message')).toContainText('正しいIPアドレス形式で入力してください');
  });

  test('SCEN-170: 大量データでのCSV出力', async ({ page }) => {
    // SCEN-170
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("CSV出力")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/.*\.csv$/);
    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test('SCEN-171: 最大ページ数でのページネーション', async ({ page }) => {
    // SCEN-171
    await page.click('text=システム管理');
    await page.click('text=操作履歴管理');
    
    const lastPageButton = page.locator('.pagination button').last();
    await lastPageButton.click();
    await expect(page.locator('button:has-text("次へ")')).toBeDisabled();
    await expect(page.locator('button:has-text("前へ")')).toBeEnabled();
    
    await page.click('button:has-text("前へ")');
    const currentPage = await page.locator('.pagination .active').textContent();
    expect(parseInt(currentPage || '0')).toBeGreaterThan(0);
  });
});