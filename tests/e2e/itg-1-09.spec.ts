import { test, expect } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("AI需要予測処理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    // ログイン処理が必要な場合はここに実装
  });

  test('SCEN-172: 予測対象期間選択で未来日付が設定できる', async ({ page }) => {
    // SCEN-172
    await page.goto("/");
    // メニューからAI需要予測処理画面への遷移処理
    // 実際のHTML要素が不明のため、適切なセレクタに置き換える必要があります
    await page.click('text=AI需要予測処理');
    
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    const startDate = nextMonth.toISOString().split('T')[0];
    
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(0);
    const endDate = nextMonth.toISOString().split('T')[0];
    
    await page.fill('[data-testid="start-date"]', startDate);
    await page.fill('[data-testid="end-date"]', endDate);
    await page.click('[data-testid="execute-prediction"]');
  });

  test('SCEN-173: 店舗選択で単一店舗が選択できる', async ({ page }) => {
    // SCEN-173
    await page.goto("/");
    await page.click('text=AI需要予測処理');
    await page.click('[data-testid="store-dropdown"]');
    await page.click('text=店舗A');
    await expect(page.locator('[data-testid="selected-store"]')).toContainText('店舗A');
    await page.click('[data-testid="next-button"]');
  });

  test('SCEN-174: 商品カテゴリ複数選択で予測実行できる', async ({ page }) => {
    // SCEN-174
    await page.goto("/");
    await page.click('text=需要予測');
    await page.click('[data-testid="category-food"]');
    await page.click('[data-testid="category-daily"]');
    await page.click('[data-testid="category-clothes"]');
    await page.fill('[data-testid="prediction-period"]', '30');
    await page.click('[data-testid="execute-prediction"]');
    await page.waitForSelector('[data-testid="prediction-results"]');
    await expect(page.locator('[data-testid="category-food-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-daily-result"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-clothes-result"]')).toBeVisible();
  });

  test('SCEN-175: 予測モデル選択で機械学習モデルが選択できる', async ({ page }) => {
    // SCEN-175
    await page.goto("/");
    await page.click('text=AI需要予測処理');
    await page.click('[data-testid="model-dropdown"]');
    await page.click('text=ランダムフォレスト');
    await expect(page.locator('[data-testid="selected-model"]')).toContainText('ランダムフォレスト');
    await page.click('[data-testid="save-settings"]');
  });

  test('SCEN-176: 天候データ取込が正常完了する', async ({ page }) => {
    // SCEN-176
    await page.goto("/");
    await page.click('text=データ取込');
    await page.click('[data-testid="weather-data-import"]');
    await page.fill('[data-testid="import-start-date"]', '2024-01-01');
    await page.fill('[data-testid="import-end-date"]', '2024-01-31');
    await page.click('[data-testid="start-weather-import"]');
    await page.waitForSelector('[data-testid="import-complete"]');
    await expect(page.locator('[data-testid="import-result"]')).toContainText('取込完了');
    await page.click('[data-testid="data-list"]');
    await expect(page.locator('[data-testid="weather-data"]')).toBeVisible();
  });

  test('SCEN-177: イベントデータ取込が正常完了する', async ({ page }) => {
    // SCEN-177
    await page.goto("/");
    await page.click('text=イベントデータ管理');
    await page.click('[data-testid="data-import"]');
    await page.setInputFiles('[data-testid="file-input"]', 'test-events.csv');
    await page.click('[data-testid="execute-import"]');
    await page.waitForSelector('[data-testid="import-complete-message"]');
    await expect(page.locator('[data-testid="import-complete-message"]')).toBeVisible();
    await page.click('[data-testid="event-data-list"]');
    await expect(page.locator('[data-testid="imported-events"]')).toBeVisible();
  });

  test('SCEN-178: 季節要因設定で適切な重み付けができる', async ({ page }) => {
    // SCEN-178
    await page.goto("/");
    await page.click('text=需要予測設定');
    await page.click('[data-testid="seasonal-factors"]');
    await page.fill('[data-testid="spring-weight"]', '1.2');
    await page.fill('[data-testid="summer-weight"]', '0.8');
    await page.fill('[data-testid="autumn-weight"]', '1.1');
    await page.fill('[data-testid="winter-weight"]', '1.3');
    await page.click('[data-testid="save-settings"]');
    await page.click('[data-testid="select-product"]');
    await page.click('[data-testid="execute-prediction"]');
    await page.waitForSelector('[data-testid="prediction-results"]');
  });

  test('SCEN-179: 学習データ期間設定で過去1年間が設定できる', async ({ page }) => {
    // SCEN-179
    await page.goto("/");
    await page.click('text=AI需要予測処理');
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const startDate = oneYearAgo.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];
    
    await page.fill('[data-testid="learning-start-date"]', startDate);
    await page.fill('[data-testid="learning-end-date"]', endDate);
    await page.click('[data-testid="save-button"]');
  });

  test('SCEN-180: 予測精度閾値80%設定でAI予測実行できる', async ({ page }) => {
    // SCEN-180
    await page.goto("/");
    await page.click('text=AI需要予測処理');
    await page.fill('[data-testid="accuracy-threshold"]', '80');
    await page.click('[data-testid="select-product"]');
    await page.fill('[data-testid="prediction-period"]', '30');
    await page.click('[data-testid="execute-ai-prediction"]');
    await page.waitForSelector('[data-testid="processing-message"]');
    await page.waitForSelector('[data-testid="prediction-results"]');
    await expect(page.locator('[data-testid="accuracy-result"]')).toContainText('80%');
  });

  test('SCEN-181: AI予測実行で進捗バー表示される', async ({ page }) => {
    // SCEN-181
    await page.goto("/");
    await page.click('text=AI需要予測処理');
    await page.fill('[data-testid="product-selection"]', '商品A');
    await page.fill('[data-testid="period-selection"]', '30');
    await page.click('[data-testid="execute-prediction"]');
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-bar"]')).toHaveAttribute('value', '0');
  });

  test('SCEN-182: 予測対象期間に過去日付選択でエラー', async ({ page }) => {
    // SCEN-182
    await page.goto("/");
    await page.click('text=AI需要予測処理');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastDate = yesterday.toISOString().split('T')[0];
    
    await page.fill('[data-testid="start-date"]', pastDate);
    await page.fill('[data-testid="end-date"]', '2024-12-31');
    await page.click('[data-testid="execute-prediction"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('過去の日付は選択できません');
  });

  test('SCEN-183: 店舗未選択で予測実行時エラー', async ({ page }) => {
    // SCEN-183
    await page.goto("/");
    await page.click('text=AI需要予測処理');
    await page.fill('[data-testid="prediction-period"]', '30');
    await page.click('[data-testid="execute-prediction"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('店舗を選択してください');
  });

  test('SCEN-184: 商品カテゴリ未選択で予測実行時エラー', async ({ page }) => {
    // SCEN-184
    await page.goto("/");
    await page.click('text=需要予測');
    await page.fill('[data-testid="prediction-period"]', '30');
    await page.click('[data-testid="execute-prediction"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('商品カテゴリを選択してください');
  });

  test('SCEN-185: 予測モデル未選択で予測実行時エラー', async ({ page }) => {
    // SCEN-185
    await page.goto("/");
    await page.click('text=AI需要予測処理');
    await page.click('[data-testid="select-product"]');
    await page.fill('[data-testid="prediction-period"]', '30');
    await page.click('[data-testid="execute-prediction"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('予測モデルを選択してください');
  });

  test('SCEN-186: 天候データ取込失敗でエラーメッセージ', async ({ page }) => {
    // SCEN-186
    await page.goto("/");
    await page.context().setOffline(true);
    await page.click('text=需要予測処理');
    await page.click('[data-testid="execute-prediction"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('天候データの取込に失敗');
  });

  test('SCEN-187: イベントデータ取込失敗でエラーメッセージ', async ({ page }) => {
    // SCEN-187
    await page.goto("/");
    await page.click('text=需要予測処理');
    await page.click('[data-testid="event-data-import"]');
    await page.setInputFiles('[data-testid="file-upload"]', 'invalid-data.csv');
    await page.click('[data-testid="execute-import"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('イベントデータの取込に失敗');
  });

  test('SCEN-188: 学習データ期間未設定で予測実行時エラー', async ({ page }) => {
    // SCEN-188
    await page.goto("/");
    await page.click('text=需要予測');
    await page.click('[data-testid="select-product"]');
    await page.click('[data-testid="execute-prediction"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('学習データ期間を設定してください');
  });

  test('SCEN-189: 予測精度閾値範囲外でエラー', async ({ page }) => {
    // SCEN-189
    await page.goto("/");
    await page.click('text=需要予測処理');
    await page.fill('[data-testid="accuracy-threshold"]', '150');
    await page.fill('[data-testid="product-code"]', 'P001');
    await page.fill('[data-testid="prediction-period"]', '30');
    await page.click('[data-testid="execute-prediction"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('予測精度閾値が有効範囲外');
  });

  test('SCEN-190: 予測対象期間1日設定で処理実行', async ({ page }) => {
    // SCEN-190
    await page.goto("/");
    await page.click('text=AI需要予測処理');
    await page.fill('[data-testid="prediction-period"]', '1');
    await page.selectOption('[data-testid="period-unit"]', '日');
    await page.click('[data-testid="select-product"]');
    await page.click('[data-testid="execute-prediction"]');
    await page.waitForSelector('[data-testid="prediction-results"]');
    await expect(page.locator('[data-testid="prediction-data"]')).toBeVisible();
  });

  test('SCEN-191: 予測対象期間1年設定で処理実行', async ({ page }) => {
    // SCEN-191
    await page.goto("/");
    await page.click('text=AI需要予測');
    await page.fill('[data-testid="prediction-period"]', '1年');
    await page.click('[data-testid="select-product"]');
    await page.click('[data-testid="execute-prediction"]');
    await page.waitForSelector('[data-testid="prediction-results"]');
    await expect(page.locator('[data-testid="monthly-data"]')).toHaveCount(12);
    await expect(page.locator('[data-testid="accuracy-metric"]')).toBeVisible();
  });

  test('SCEN-192: 学習データ期間最小値で予測実行', async ({ page }) => {
    // SCEN-192
    await page.goto("/");
    await page.click('text=AI需要予測処理');
    await page.selectOption('[data-testid="learning-period"]', '1週間');
    await page.click('[data-testid="select-product"]');
    await page.fill('[data-testid="prediction-period"]', '7');
    await page.click('[data-testid="execute-prediction"]');
    await page.waitForSelector('[data-testid="prediction-results"]');
    await expect(page.locator('[data-testid="warning-message"]')).toContainText('データ不足による予測精度の低下');
  });

  test('SCEN-193: 学習データ期間最大値で予測実行', async ({ page }) => {
    // SCEN-193
    await page.goto("/");
    await page.click('text=AI需要予測処理');
    await page.fill('[data-testid="learning-period"]', '9999');
    await page.click('[data-testid="select-product"]');
    await page.fill('[data-testid="prediction-period"]', '30');
    await page.click('[data-testid="execute-prediction"]');
    await page.click('text=OK');
    await page.waitForSelector('[data-testid="prediction-results"]');
    await expect(page.locator('[data-testid="accuracy-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="result-graph"]')).toBeVisible();
  });

  test('SCEN-194: 予測精度閾値0%設定で処理実行', async ({ page }) => {
    // SCEN-194
    await page.goto("/");
    await page.click('text=予測設定');
    await page.fill('[data-testid="accuracy-threshold"]', '0');
    await page.click('[data-testid="save-settings"]');
    await page.click('text=予測実行');
    await page.click('[data-testid="select-product"]');
    await page.fill('[data-testid="prediction-period"]', '30');
    await page.click('[data-testid="execute-prediction"]');
    await page.waitForSelector('[data-testid="prediction-results"]');
    await expect(page.locator('[data-testid="prediction-values"]')).toBeVisible();
  });

  test('SCEN-195: 予測精度閾値100%設定で処理実行', async ({ page }) => {
    // SCEN-195
    await page.goto("/");
    await page.click('text=需要予測設定');
    await page.fill('[data-testid="accuracy-threshold"]', '100');
    await page.click('[data-testid="select-product"]');
    await page.fill('[data-testid="prediction-period"]', '30');
    await page.click('[data-testid="execute-prediction"]');
    await page.click('text=実行');
    await page.waitForSelector('[data-testid="prediction-results"]');
  });
});