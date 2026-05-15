import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("外部要因データ管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // ログイン処理（認証が必要な場合）
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('SCEN-043: 外部要因データ一覧が正常表示される', async ({ page }) => {
    // SCEN-043
    await page.click('text=外部要因データ管理');
    await page.waitForURL('**/external-factors');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("データ名")')).toBeVisible();
    await expect(page.locator('th:has-text("データ種別")')).toBeVisible();
    await expect(page.locator('th:has-text("取得日時")')).toBeVisible();
    await expect(page.locator('th:has-text("ステータス")')).toBeVisible();
  });

  test('SCEN-044: 天候タブでデータ種別切り替えできる', async ({ page }) => {
    // SCEN-044
    await page.click('text=外部要因データ管理');
    await page.click('text=天候');
    await page.click('select[name="dataType"]');
    await page.selectOption('select[name="dataType"]', '気温');
    await expect(page.locator('text=気温')).toBeVisible();
    await page.selectOption('select[name="dataType"]', '湿度');
    await expect(page.locator('text=湿度')).toBeVisible();
  });

  test('SCEN-045: イベントタブでデータ種別切り替えできる', async ({ page }) => {
    // SCEN-045
    await page.click('text=外部要因データ管理');
    await page.click('text=イベント');
    await page.selectOption('select[name="eventType"]', '祝日');
    await expect(page.locator('text=祝日')).toBeVisible();
    await page.selectOption('select[name="eventType"]', 'スポーツイベント');
    await expect(page.locator('text=スポーツイベント')).toBeVisible();
    await page.selectOption('select[name="eventType"]', '地域イベント');
    await expect(page.locator('text=地域イベント')).toBeVisible();
  });

  test('SCEN-046: 季節タブでデータ種別切り替えできる', async ({ page }) => {
    // SCEN-046
    await page.click('text=外部要因データ管理');
    await page.click('text=季節');
    await page.selectOption('select[name="seasonType"]', '気温');
    await expect(page.locator('text=気温')).toBeVisible();
    await page.selectOption('select[name="seasonType"]', '湿度');
    await expect(page.locator('text=湿度')).toBeVisible();
    await page.selectOption('select[name="seasonType"]', '降水量');
    await expect(page.locator('text=降水量')).toBeVisible();
  });

  test('SCEN-047: 期間指定検索で結果が絞り込まれる', async ({ page }) => {
    // SCEN-047
    await page.click('text=外部要因データ管理');
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-01-31');
    await page.click('button:has-text("検索")');
    await expect(page.locator('table tbody tr')).toHaveCount({ min: 0 });
  });

  test('SCEN-048: 店舗別絞り込みで対象店舗データのみ表示される', async ({ page }) => {
    // SCEN-048
    await page.click('text=外部要因データ管理');
    await page.selectOption('select[name="store"]', '店舗A');
    await page.click('button:has-text("絞り込み")');
    await expect(page.locator('table')).toBeVisible();
    await page.selectOption('select[name="store"]', '店舗B');
    await page.click('button:has-text("絞り込み")');
    await expect(page.locator('table')).toBeVisible();
  });

  test('SCEN-049: 天候データを手動入力で登録できる', async ({ page }) => {
    // SCEN-049
    await page.click('text=外部要因データ管理');
    await page.click('button:has-text("天候データ登録")');
    await page.fill('input[name="date"]', '2024-01-01');
    await page.selectOption('select[name="weather"]', '晴れ');
    await page.fill('input[name="maxTemp"]', '25');
    await page.fill('input[name="minTemp"]', '15');
    await page.fill('input[name="humidity"]', '60');
    await page.fill('input[name="precipitation"]', '0');
    await page.fill('input[name="windSpeed"]', '5');
    await page.click('button:has-text("登録")');
    await page.click('button:has-text("OK")');
    await expect(page.locator('text=登録完了')).toBeVisible();
  });

  test('SCEN-050: イベントデータを登録できる', async ({ page }) => {
    // SCEN-050
    await page.click('text=外部要因データ管理');
    await page.click('button:has-text("イベントデータ登録")');
    await page.fill('input[name="eventName"]', '春祭り');
    await page.fill('input[name="startDate"]', '2024-04-01');
    await page.fill('input[name="endDate"]', '2024-04-03');
    await page.selectOption('select[name="impact"]', '高');
    await page.fill('input[name="area"]', '東京都渋谷区');
    await page.fill('textarea[name="memo"]', '来場者数約10万人予定');
    await page.click('button:has-text("登録")');
    await expect(page.locator('text=登録完了')).toBeVisible();
  });

  test('SCEN-051: 季節情報を設定できる', async ({ page }) => {
    // SCEN-051
    await page.click('text=外部要因データ管理');
    await page.click('text=季節情報設定');
    await page.click('button:has-text("新規追加")');
    await page.fill('input[name="seasonName"]', '春季');
    await page.fill('input[name="startDate"]', '03/01');
    await page.fill('input[name="endDate"]', '05/31');
    await page.fill('input[name="coefficient"]', '1.2');
    await page.fill('textarea[name="memo"]', '春の需要増加期');
    await page.click('button:has-text("保存")');
    await page.click('button:has-text("OK")');
    await expect(page.locator('text=春季')).toBeVisible();
  });

  test('SCEN-052: 外部API連携設定が正常完了する', async ({ page }) => {
    // SCEN-052
    await page.click('text=外部要因データ管理');
    await page.click('text=外部API連携設定');
    await page.click('button:has-text("新規API連携追加")');
    await page.fill('input[name="apiName"]', '気象庁API');
    await page.fill('input[name="endpoint"]', 'https://api.weather.jp/v1');
    await page.selectOption('select[name="authType"]', 'APIキー');
    await page.fill('input[name="apiKey"]', 'test-api-key');
    await page.selectOption('select[name="frequency"]', '毎日');
    await page.check('input[value="気温"]');
    await page.check('input[value="降水量"]');
    await page.check('input[value="湿度"]');
    await page.click('button:has-text("接続テスト")');
    await expect(page.locator('text=接続成功')).toBeVisible();
    await page.click('button:has-text("保存")');
    await page.click('button:has-text("OK")');
    await expect(page.locator('text=気象庁API')).toBeVisible();
  });

  test('SCEN-053: データ自動取得スケジュールを設定できる', async ({ page }) => {
    // SCEN-053
    await page.click('text=外部要因データ管理');
    await page.click('text=データ自動取得設定');
    await page.click('button:has-text("新規スケジュール作成")');
    await page.fill('input[name="scheduleName"]', '天気データ取得');
    await page.selectOption('select[name="dataSource"]', '気象データ');
    await page.selectOption('select[name="frequency"]', '毎日');
    await page.fill('input[name="time"]', '06:00');
    await page.selectOption('select[name="region"]', '東京');
    await page.click('button:has-text("保存")');
    await page.click('button:has-text("はい")');
    await expect(page.locator('text=天気データ取得')).toBeVisible();
  });

  test('SCEN-054: データ品質チェック結果が表示される', async ({ page }) => {
    // SCEN-054
    await page.click('text=外部要因データ管理');
    await page.click('text=データ品質チェック');
    await page.setInputFiles('input[type="file"]', 'test-data.csv');
    await page.click('button:has-text("データ品質チェック実行")');
    await page.waitForSelector('text=チェック完了');
    await expect(page.locator('text=エラー件数')).toBeVisible();
    await expect(page.locator('text=警告件数')).toBeVisible();
  });

  test('SCEN-055: 相関分析が正常実行される', async ({ page }) => {
    // SCEN-055
    await page.click('text=外部要因データ管理');
    await page.click('text=相関分析');
    await page.check('input[value="天気"]');
    await page.check('input[value="イベント"]');
    await page.fill('input[name="analysisStartDate"]', '2024-01-01');
    await page.fill('input[name="analysisEndDate"]', '2024-12-31');
    await page.click('button:has-text("相関分析実行")');
    await page.waitForSelector('text=分析完了');
    await expect(page.locator('text=相関係数')).toBeVisible();
  });

  test('SCEN-056: データエクスポートが正常実行される', async ({ page }) => {
    // SCEN-056
    await page.click('text=外部要因データ管理');
    await page.click('button:has-text("データエクスポート")');
    await page.fill('input[name="exportStartDate"]', '2024-01-01');
    await page.fill('input[name="exportEndDate"]', '2024-03-31');
    await page.check('input[value="天気"]');
    await page.check('input[value="イベント"]');
    await page.selectOption('select[name="format"]', 'CSV');
    await page.click('button:has-text("エクスポート実行")');
    await expect(page.locator('text=ダウンロード完了')).toBeVisible();
  });

  test('SCEN-057: 存在しない期間で検索するとデータなし表示', async ({ page }) => {
    // SCEN-057
    await page.click('text=外部要因データ管理');
    await page.fill('input[name="startDate"]', '1900-01-01');
    await page.fill('input[name="endDate"]', '1900-01-31');
    await page.click('button:has-text("検索")');
    await expect(page.locator('text=該当するデータがありません')).toBeVisible();
  });

  test('SCEN-058: 存在しない店舗で絞り込むとデータなし表示', async ({ page }) => {
    // SCEN-058
    await page.click('text=外部要因データ管理');
    await page.fill('input[name="storeId"]', 'STORE-9999');
    await page.click('button:has-text("絞り込み")');
    await expect(page.locator('text=該当するデータが見つかりません')).toBeVisible();
  });

  test('SCEN-059: 天候データ必須項目未入力でエラー表示', async ({ page }) => {
    // SCEN-059
    await page.click('text=外部要因データ管理');
    await page.click('button:has-text("天候データ登録")');
    await page.fill('input[name="windSpeed"]', '5');
    await page.click('button:has-text("保存")');
    await expect(page.locator('text=必須項目')).toBeVisible();
  });

  test('SCEN-060: イベントデータ必須項目未入力でエラー表示', async ({ page }) => {
    // SCEN-060
    await page.click('text=外部要因データ管理');
    await page.click('button:has-text("新規イベント登録")');
    await page.click('button:has-text("登録")');
    await expect(page.locator('text=必須項目')).toBeVisible();
  });

  test('SCEN-061: 不正なAPI設定でエラー表示', async ({ page }) => {
    // SCEN-061
    await page.click('text=外部要因データ管理');
    await page.click('button:has-text("API設定")');
    await page.fill('input[name="endpoint"]', 'invalid-url');
    await page.fill('input[name="apiKey"]', '');
    await page.selectOption('select[name="authType"]', 'Bearer Token');
    await page.fill('input[name="timeout"]', '-10');
    await page.click('button:has-text("設定保存")');
    await expect(page.locator('text=URLの形式が正しくありません')).toBeVisible();
    await expect(page.locator('text=APIキーは必須項目です')).toBeVisible();
  });

  test('SCEN-062: 無効なスケジュール設定でエラー表示', async ({ page }) => {
    // SCEN-062
    await page.click('text=外部要因データ管理');
    await page.click('button:has-text("新規スケジュール設定")');
    await page.fill('input[name="scheduleName"]', 'テストスケジュール');
    await page.fill('input[name="startTime"]', '25:00');
    await page.fill('input[name="endTime"]', '10:00');
    await page.selectOption('select[name="frequency"]', '毎日');
    await page.click('button:has-text("保存")');
    await expect(page.locator('text=無効な時刻形式です')).toBeVisible();
    await expect(page.locator('text=終了時刻は開始時刻より後に設定してください')).toBeVisible();
  });

  test('SCEN-063: データ異常時に品質チェックエラー表示', async ({ page }) => {
    // SCEN-063
    await page.click('text=外部要因データ管理');
    await page.click('text=データインポート');
    await page.setInputFiles('input[type="file"]', 'abnormal-data.csv');
    await page.click('button:has-text("データ品質チェック実行")');
    await expect(page.locator('text=品質チェックエラー')).toBeVisible();
    await expect(page.locator('text=行番号')).toBeVisible();
  });

  test('SCEN-064: データ不足時に相関分析エラー表示', async ({ page }) => {
    // SCEN-064
    await page.click('text=外部要因データ管理');
    await page.click('text=相関分析');
    await page.fill('input[name="analysisStartDate"]', '2030-01-01');
    await page.fill('input[name="analysisEndDate"]', '2030-12-31');
    await page.check('input[value="天気"]');
    await page.click('button:has-text("相関分析実行")');
    await expect(page.locator('text=データ不足により相関分析が実行できません')).toBeVisible();
  });

  test('SCEN-065: データなし状態でエクスポートエラー表示', async ({ page }) => {
    // SCEN-065
    await page.click('text=外部要因データ管理');
    await expect(page.locator('text=データが0件')).toBeVisible();
    await page.click('button:has-text("エクスポート")');
    await expect(page.locator('text=エクスポートするデータがありません')).toBeVisible();
  });

  test('SCEN-066: 期間指定の開始日終了日が同日で検索できる', async ({ page }) => {
    // SCEN-066
    await page.click('text=外部要因データ管理');
    await page.fill('input[name="startDate"]', '2024-01-15');
    await page.fill('input[name="endDate"]', '2024-01-15');
    await page.click('button:has-text("検索")');
    await expect(page.locator('table')).toBeVisible();
  });

  test('SCEN-067: 最大文字数で天候データ登録できる', async ({ page }) => {
    // SCEN-067
    await page.click('text=外部要因データ管理');
    await page.click('button:has-text("天候データ登録")');
    await page.fill('input[name="weatherName"]', 'a'.repeat(50));
    await page.fill('textarea[name="description"]', 'a'.repeat(500));
    await page.fill('input[name="region"]', 'a'.repeat(100));
    await page.fill('input[name="date"]', '2024-01-01');
    await page.fill('input[name="temperature"]', '25');
    await page.fill('input[name="humidity"]', '60');
    await page.fill('input[name="precipitation"]', '0');
    await page.click('button:has-text("登録")');
    await expect(page.locator('text=登録完了')).toBeVisible();
  });

  test('SCEN-068: 最大文字数でイベントデータ登録できる', async ({ page }) => {
    // SCEN-068
    await page.click('text=外部要因データ管理');
    await page.click('button:has-text("イベントデータ登録")');
    await page.fill('input[name="eventName"]', 'a'.repeat(255));
    await page.fill('textarea[name="eventDescription"]', 'a'.repeat(1000));
    await page.fill('input[name="startDate"]', '2024-01-01');
    await page.fill('input[name="endDate"]', '2024-01-31');
    await page.selectOption('select[name="impact"]', '高');
    await page.selectOption('select[name="region"]', '東京');
    await page.click('button:has-text("登録")');
    await expect(page.locator('text=登録完了')).toBeVisible();
  });

  test('SCEN-069: 大量データでの相関分析実行', async ({ page }) => {
    // SCEN-069
    await page.click('text=外部要因データ管理');
    await page.click('text=相関分析');
    await page.check('input[value="気温"]');
    await page.check('input[value="降水量"]');
    await page.check('input[value="経済指標"]');
    await page.check('input[value="イベント情報"]');
    await page.fill('input[name="analysisStartDate"]', '2022-01-01');
    await page.fill('input[name="analysisEndDate"]', '2023-12-31');
    await page.click('button:has-text("相関分析実行")');
    await page.waitForSelector('text=分析完了', { timeout: 1800000 });
    await expect(page.locator('text=相関マトリクス')).toBeVisible();
    await page.click('button:has-text("CSV出力")');
    await expect(page.locator('text=エクスポート完了')).toBeVisible();
  });

  test('SCEN-070: 大量データでのエクスポート実行', async ({ page }) => {
    // SCEN-070
    await page.click('text=外部要因データ管理');
    await page.click('button:has-text("エクスポート機能")');
    await page.selectOption('select[name="format"]', 'CSV');
    await page.selectOption('select[name="period"]', '全期間');
    await page.click('button:has-text("エクスポート")');
    await page.waitForSelector('text=エクスポート完了', { timeout: 1800000 });
    await page.click('text=ダウンロード');
    await expect(page.locator('text=ファイルダウンロード開始')).toBeVisible();
  });
});