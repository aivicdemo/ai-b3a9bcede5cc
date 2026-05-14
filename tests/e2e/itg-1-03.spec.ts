import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("外部要因データ管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('外部要因データ一覧が正常表示される', async ({ page }) => {
    // SCEN-045
    await page.click('text=外部要因データ管理');
    await page.waitForURL('**/external-factors');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("データ名")')).toBeVisible();
    await expect(page.locator('th:has-text("データ種別")')).toBeVisible();
    await expect(page.locator('th:has-text("更新日時")')).toBeVisible();
    await expect(page.locator('th:has-text("ステータス")')).toBeVisible();
    await expect(page.locator('tr').first()).toBeVisible();
    await page.click('button[aria-label="次のページ"]');
    await page.click('th:has-text("データ名")');
  });

  test('天候タブ選択でデータ切り替え', async ({ page }) => {
    // SCEN-046
    await page.click('text=外部要因データ管理');
    await page.click('button[role="tab"]:has-text("天候")');
    await expect(page.locator('button[role="tab"]:has-text("天候")').first()).toHaveClass(/active/);
    await expect(page.locator('text=気温')).toBeVisible();
    await expect(page.locator('text=降水量')).toBeVisible();
    await expect(page.locator('text=湿度')).toBeVisible();
  });

  test('イベントタブ選択でデータ切り替え', async ({ page }) => {
    // SCEN-047
    await page.click('text=外部要因データ管理');
    await page.click('button[role="tab"]:has-text("イベント")');
    await expect(page.locator('button[role="tab"]:has-text("イベント")').first()).toHaveClass(/active/);
    await expect(page.locator('text=祭り')).toBeVisible();
    await expect(page.locator('text=コンサート')).toBeVisible();
    await expect(page.locator('text=スポーツイベント')).toBeVisible();
  });

  test('季節タブ選択でデータ切り替え', async ({ page }) => {
    // SCEN-048
    await page.click('text=外部要因データ管理');
    await page.click('button[role="tab"]:has-text("季節")');
    await expect(page.locator('button[role="tab"]:has-text("季節")').first()).toHaveClass(/active/);
    await page.click('button[role="tab"]:has-text("天候")');
    await page.click('button[role="tab"]:has-text("季節")');
    await expect(page.locator('text=春夏秋冬')).toBeVisible();
  });

  test('期間指定検索で結果絞り込み', async ({ page }) => {
    // SCEN-049
    await page.click('text=外部要因データ管理');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-01-31');
    await page.click('button:has-text("検索")');
    await expect(page.locator('td:has-text("2024-01")')).toBeVisible();
    await expect(page.locator('td:has-text("2023-12")')).not.toBeVisible();
    await expect(page.locator('td:has-text("2024-02")')).not.toBeVisible();
  });

  test('店舗別絞り込みで結果表示', async ({ page }) => {
    // SCEN-050
    await page.click('text=外部要因データ管理');
    await page.click('select[name="store"]');
    await page.selectOption('select[name="store"]', '店舗A');
    await page.click('button:has-text("絞り込み")');
    await expect(page.locator('td:has-text("店舗A")')).toBeVisible();
  });

  test('天候データ手動入力で登録', async ({ page }) => {
    // SCEN-051
    await page.click('text=外部要因データ管理');
    await page.click('button[role="tab"]:has-text("天候")');
    await page.click('button:has-text("新規登録")');
    await page.fill('input[name="date"]', '2024-01-15');
    await page.selectOption('select[name="weather"]', '晴れ');
    await page.fill('input[name="maxTemp"]', '25');
    await page.fill('input[name="minTemp"]', '15');
    await page.fill('input[name="humidity"]', '60');
    await page.fill('input[name="rainfall"]', '0');
    await page.click('button:has-text("登録")');
    await page.click('button:has-text("OK")');
    await expect(page.locator('text=2024-01-15')).toBeVisible();
  });

  test('イベントデータ登録で保存', async ({ page }) => {
    // SCEN-052
    await page.click('text=外部要因データ管理');
    await page.click('button:has-text("新規イベントデータ登録")');
    await page.fill('input[name="eventName"]', '年末セール');
    await page.fill('input[name="startDate"]', '2024-12-25');
    await page.fill('input[name="endDate"]', '2024-12-31');
    await page.selectOption('select[name="impact"]', '高');
    await page.selectOption('select[name="category"]', '全商品');
    await page.fill('textarea[name="memo"]', '年末の大型セールイベント');
    await page.click('button:has-text("保存")');
    await page.click('button:has-text("OK")');
    await expect(page.locator('text=保存が完了しました')).toBeVisible();
    await expect(page.locator('text=年末セール')).toBeVisible();
  });

  test('季節情報設定で更新', async ({ page }) => {
    // SCEN-053
    await page.click('text=外部要因データ管理');
    await page.click('text=季節情報設定');
    await page.click('tr:first-child >> button:has-text("編集")');
    await page.fill('input[name="seasonName"]', '春シーズン');
    await page.fill('input[name="startDate"]', '2024-03-01');
    await page.fill('input[name="endDate"]', '2024-05-31');
    await page.click('button:has-text("更新")');
    await page.click('button:has-text("OK")');
    await expect(page.locator('text=春シーズン')).toBeVisible();
  });

  test('外部API連携設定が正常動作', async ({ page }) => {
    // SCEN-054
    await page.click('text=外部要因データ管理');
    await page.click('text=外部API連携設定');
    await page.fill('input[name="apiUrl"]', 'https://api.example.com/weather');
    await page.fill('input[name="apiKey"]', 'test-api-key');
    await page.fill('input[name="interval"]', '60');
    await page.click('button:has-text("接続テスト")');
    await page.click('button:has-text("設定を保存")');
    await page.click('text=外部要因データ管理');
    await page.click('button:has-text("データ取得実行")');
    await expect(page.locator('table')).toBeVisible();
  });

  test('データ自動取得スケジュール設定', async ({ page }) => {
    // SCEN-055
    await page.click('text=外部要因データ管理');
    await page.click('text=データ自動取得設定');
    await page.click('button:has-text("新規スケジュール作成")');
    await page.selectOption('select[name="dataSource"]', '天気');
    await page.selectOption('select[name="frequency"]', '毎日');
    await page.fill('input[name="executeTime"]', '08:00');
    await page.selectOption('select[name="region"]', '東京');
    await page.click('button:has-text("保存")');
    await expect(page.locator('text=天気')).toBeVisible();
    await expect(page.locator('text=毎日')).toBeVisible();
  });

  test('データ品質チェック実行と結果表示', async ({ page }) => {
    // SCEN-056
    await page.click('text=外部要因データ管理');
    await page.click('text=データ品質チェック');
    await page.click('button:has-text("チェック実行")');
    await expect(page.locator('text=品質チェック結果')).toBeVisible();
  });

  test('相関分析実行で結果生成', async ({ page }) => {
    // SCEN-057
    await page.click('text=外部要因データ管理');
    await page.click('text=相関分析');
    await page.check('input[name="weather"]');
    await page.check('input[name="events"]');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-01-31');
    await page.selectOption('select[name="product"]', '商品A');
    await page.click('button:has-text("分析実行")');
    await expect(page.locator('text=相関係数')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('データエクスポートでファイル出力', async ({ page }) => {
    // SCEN-058
    await page.click('text=外部要因データ管理');
    await page.click('button:has-text("エクスポート")');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-01-31');
    await page.selectOption('select[name="format"]', 'CSV');
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("エクスポート実行")');
    const download = await downloadPromise;
    await expect(download.suggestedFilename()).toContain('.csv');
  });

  test('不正な期間指定でエラー表示', async ({ page }) => {
    // SCEN-059
    await page.click('text=外部要因データ管理');
    await page.fill('input[name="startDate"]', '2024-12-31');
    await page.fill('input[name="endDate"]', '2024-01-01');
    await page.click('button:has-text("検索")');
    await expect(page.locator('text=期間の指定が不正です')).toBeVisible();
  });

  test('天候データ必須項目未入力でエラー', async ({ page }) => {
    // SCEN-060
    await page.click('text=外部要因データ管理');
    await page.click('button[role="tab"]:has-text("天候")');
    await page.click('button:has-text("新規登録")');
    await page.selectOption('select[name="region"]', '東京');
    await page.fill('input[name="temperature"]', '25');
    await page.selectOption('select[name="weather"]', '晴れ');
    await page.click('button:has-text("登録")');
    await expect(page.locator('text=日付は必須項目です')).toBeVisible();
  });

  test('イベントデータ不正値でバリデーション', async ({ page }) => {
    // SCEN-061
    await page.click('text=外部要因データ管理');
    await page.click('button:has-text("新規イベントデータ登録")');
    await page.fill('input[name="eventName"]', '###');
    await page.fill('input[name="startDate"]', '2023-01-01');
    await page.fill('input[name="endDate"]', '2022-12-31');
    await page.fill('input[name="impact"]', '-1');
    await page.click('button:has-text("登録")');
    await expect(page.locator('text=バリデーションエラー')).toBeVisible();
  });

  test('外部API接続失敗時のエラーハンドリング', async ({ page }) => {
    // SCEN-062
    await page.click('text=外部要因データ管理');
    await page.click('text=外部API連携設定');
    await page.fill('input[name="apiUrl"]', 'https://invalid-url.example.com');
    await page.click('button:has-text("データ取得")');
    await expect(page.locator('text=API接続に失敗しました')).toBeVisible();
  });

  test('データ品質チェック異常検出時の警告表示', async ({ page }) => {
    // SCEN-063
    await page.click('text=外部要因データ管理');
    await page.click('text=データ品質チェック');
    await page.setInputFiles('input[type="file"]', 'test-data-with-errors.csv');
    await page.click('button:has-text("チェック実行")');
    await expect(page.locator('text=データ品質に異常が検出されました')).toBeVisible();
    await expect(page.locator('text=欠損値')).toBeVisible();
    await expect(page.locator('text=異常値')).toBeVisible();
  });

  test('相関分析データ不足時のエラー', async ({ page }) => {
    // SCEN-064
    await page.click('text=外部要因データ管理');
    await page.click('text=相関分析');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-01-02');
    await page.click('button:has-text("分析実行")');
    await expect(page.locator('text=分析に必要なデータが不足しています')).toBeVisible();
    await page.click('button:has-text("閉じる")');
  });

  test('エクスポート権限なしでアクセス拒否', async ({ page }) => {
    // SCEN-065
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="username"]', 'limiteduser');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.click('text=外部要因データ管理');
    await page.click('button:has-text("エクスポート")');
    await expect(page.locator('text=エクスポート権限がありません')).toBeVisible();
  });

  test('期間検索開始日と終了日が同日', async ({ page }) => {
    // SCEN-066
    await page.click('text=外部要因データ管理');
    await page.fill('input[name="startDate"]', '2024-01-15');
    await page.fill('input[name="endDate"]', '2024-01-15');
    await page.click('button:has-text("検索")');
    await expect(page.locator('td:has-text("2024-01-15")')).toBeVisible();
  });

  test('全店舗選択での絞り込み', async ({ page }) => {
    // SCEN-067
    await page.click('text=外部要因データ管理');
    await page.check('input[name="selectAllStores"]');
    await page.click('button:has-text("絞り込み")');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('button[aria-label="次のページ"]')).toBeVisible();
  });

  test('天候データ数値項目の最大値入力', async ({ page }) => {
    // SCEN-068
    await page.click('text=外部要因データ管理');
    await page.click('button[role="tab"]:has-text("天候")');
    await page.click('button:has-text("新規登録")');
    await page.fill('input[name="date"]', '2024-01-15');
    await page.selectOption('select[name="region"]', '東京');
    await page.fill('input[name="temperature"]', '99.9');
    await page.fill('input[name="humidity"]', '100');
    await page.fill('input[name="rainfall"]', '999.9');
    await page.fill('input[name="windSpeed"]', '99.9');
    await page.click('button:has-text("登録")');
    await expect(page.locator('text=99.9')).toBeVisible();
    await expect(page.locator('text=100')).toBeVisible();
  });

  test('イベント名最大文字数での登録', async ({ page }) => {
    // SCEN-069
    await page.click('text=外部要因データ管理');
    await page.click('button:has-text("新規イベントデータ登録")');
    const longEventName = 'A'.repeat(255);
    await page.fill('input[name="eventName"]', longEventName);
    await page.fill('input[name="startDate"]', '2024-01-15');
    await page.fill('input[name="endDate"]', '2024-01-20');
    await page.selectOption('select[name="impact"]', '高');
    await page.click('button:has-text("登録")');
    await expect(page.locator(`text=${longEventName.substring(0, 50)}`)).toBeVisible();
  });

  test('大量データでの相関分析実行', async ({ page }) => {
    // SCEN-070
    await page.click('text=外部要因データ管理');
    await page.click('text=相関分析');
    await page.fill('input[name="startDate"]', '2020-01-01');
    await page.fill('input[name="endDate"]', '2024-12-31');
    await page.check('input[name="allFactors"]');
    await page.click('button:has-text("分析実行")');
    await expect(page.locator('text=処理中')).toBeVisible();
    await expect(page.locator('text=分析完了')).toBeVisible({ timeout: 60000 });
  });

  test('最大件数でのデータエクスポート', async ({ page }) => {
    // SCEN-071
    await page.click('text=外部要因データ管理');
    await page.click('button:has-text("エクスポート")');
    await page.check('input[name="exportAll"]');
    await page.selectOption('select[name="format"]', 'CSV');
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("エクスポート実行")');
    await expect(page.locator('text=エクスポート完了')).toBeVisible({ timeout: 60000 });
    const download = await downloadPromise;
    await expect(download.suggestedFilename()).toContain('.csv');
  });
});