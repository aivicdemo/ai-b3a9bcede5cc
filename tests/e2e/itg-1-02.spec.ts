import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

test.describe("売上実績データ管理", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('[data-testid="username"]', 'testuser');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(`${BASE_URL}/dashboard`);
  });

  test('SCEN-024: 売上実績一覧が正常表示される', async ({ page }) => {
    // SCEN-024
    await page.click('[data-testid="sales-data-menu"]');
    await page.waitForURL(`${BASE_URL}/sales-data`);
    await expect(page.locator('[data-testid="sales-data-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-column"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-column"]')).toBeVisible();
    await expect(page.locator('[data-testid="quantity-column"]')).toBeVisible();
    await expect(page.locator('[data-testid="amount-column"]')).toBeVisible();
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
  });

  test('SCEN-025: 店舗選択で絞り込み表示される', async ({ page }) => {
    // SCEN-025
    await page.goto(`${BASE_URL}/sales-data`);
    await page.click('[data-testid="store-select"]');
    await page.click('[data-testid="store-option-a"]');
    await page.click('[data-testid="filter-button"]');
    await expect(page.locator('[data-testid="sales-data-table"] tbody tr')).toHaveCount(1);
    await expect(page.locator('[data-testid="store-name-cell"]').first()).toContainText('店舗A');
  });

  test('SCEN-026: 商品選択で絞り込み表示される', async ({ page }) => {
    // SCEN-026
    await page.goto(`${BASE_URL}/sales-data`);
    await page.click('[data-testid="product-select"]');
    await page.click('[data-testid="product-option-a"]');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="product-name-cell"]').first()).toContainText('商品A');
  });

  test('SCEN-027: 日付範囲指定で絞り込み表示される', async ({ page }) => {
    // SCEN-027
    await page.goto(`${BASE_URL}/sales-data`);
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-01-31');
    await page.click('[data-testid="search-button"]');
    const dates = await page.locator('[data-testid="date-cell"]').allTextContents();
    for (const date of dates) {
      expect(date >= '2024-01-01' && date <= '2024-01-31').toBeTruthy();
    }
  });

  test('SCEN-028: 新規売上実績を正常登録できる', async ({ page }) => {
    // SCEN-028
    await page.goto(`${BASE_URL}/sales-data`);
    await page.click('[data-testid="new-sales-button"]');
    await page.fill('[data-testid="product-code"]', 'PROD001');
    await page.fill('[data-testid="sales-date"]', '2024-01-15');
    await page.fill('[data-testid="quantity"]', '10');
    await page.fill('[data-testid="unit-price"]', '1000');
    await page.fill('[data-testid="store-code"]', 'STORE001');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('登録完了');
    await expect(page.locator('[data-testid="sales-data-table"]')).toContainText('PROD001');
  });

  test('SCEN-029: 売上実績を正常編集できる', async ({ page }) => {
    // SCEN-029
    await page.goto(`${BASE_URL}/sales-data`);
    await page.click('[data-testid="edit-button"]').first();
    await page.fill('[data-testid="product-name"]', '編集後商品名');
    await page.fill('[data-testid="quantity"]', '20');
    await page.fill('[data-testid="amount"]', '2000');
    await page.click('[data-testid="save-button"]');
    await page.click('[data-testid="confirm-ok"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="sales-data-table"]')).toContainText('編集後商品名');
  });

  test('SCEN-030: 売上実績を正常削除できる', async ({ page }) => {
    // SCEN-030
    await page.goto(`${BASE_URL}/sales-data`);
    const firstRowText = await page.locator('[data-testid="sales-data-table"] tbody tr').first().textContent();
    await page.click('[data-testid="delete-button"]').first();
    await expect(page.locator('[data-testid="delete-confirm-dialog"]')).toBeVisible();
    await page.click('[data-testid="delete-confirm-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('削除完了');
    await expect(page.locator('[data-testid="sales-data-table"]')).not.toContainText(firstRowText);
  });

  test('SCEN-031: CSVファイルを一括インポートできる', async ({ page }) => {
    // SCEN-031
    await page.goto(`${BASE_URL}/sales-data`);
    await page.click('[data-testid="csv-import-button"]');
    await page.setInputFiles('[data-testid="csv-file-input"]', 'test-data/sales-data.csv');
    await page.click('[data-testid="import-execute-button"]');
    await expect(page.locator('[data-testid="import-success-message"]')).toContainText('インポート完了');
    await expect(page.locator('[data-testid="sales-data-table"] tbody tr')).toHaveCountGreaterThan(0);
  });

  test('SCEN-032: 売上実績をCSVエクスポートできる', async ({ page }) => {
    // SCEN-032
    await page.goto(`${BASE_URL}/sales-data`);
    await page.fill('[data-testid="period-start"]', '2024-01-01');
    await page.fill('[data-testid="period-end"]', '2024-01-31');
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="csv-export-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
    await expect(page.locator('[data-testid="export-success-message"]')).toContainText('エクスポート完了');
  });

  test('SCEN-033: 必須項目未入力でバリデーションエラー', async ({ page }) => {
    // SCEN-033
    await page.goto(`${BASE_URL}/sales-data`);
    await page.click('[data-testid="new-sales-button"]');
    await page.fill('[data-testid="optional-field"]', 'テスト値');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('必須項目');
  });

  test('SCEN-034: 売上金額に文字入力でバリデーションエラー', async ({ page }) => {
    // SCEN-034
    await page.goto(`${BASE_URL}/sales-data`);
    await page.click('[data-testid="new-sales-button"]');
    await page.fill('[data-testid="amount"]', 'abcdef');
    await page.fill('[data-testid="product-code"]', 'PROD001');
    await page.fill('[data-testid="sales-date"]', '2024-01-15');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="amount-error"]')).toContainText('数値を入力してください');
  });

  test('SCEN-035: 売上数量に負の値でバリデーションエラー', async ({ page }) => {
    // SCEN-035
    await page.goto(`${BASE_URL}/sales-data`);
    await page.click('[data-testid="new-sales-button"]');
    await page.fill('[data-testid="product-code"]', 'PROD001');
    await page.fill('[data-testid="sales-date"]', '2024-01-15');
    await page.fill('[data-testid="quantity"]', '-10');
    await page.fill('[data-testid="amount"]', '1000');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="quantity-error"]')).toContainText('0以上の値を入力してください');
  });

  test('SCEN-036: 未来日付入力でバリデーションエラー', async ({ page }) => {
    // SCEN-036
    await page.goto(`${BASE_URL}/sales-data`);
    await page.click('[data-testid="new-sales-button"]');
    await page.fill('[data-testid="product-code"]', 'PROD001');
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await page.fill('[data-testid="sales-date"]', tomorrow);
    await page.fill('[data-testid="quantity"]', '10');
    await page.fill('[data-testid="amount"]', '1000');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="date-error"]')).toContainText('未来の日付は入力できません');
  });

  test('SCEN-037: 不正フォーマットCSVでインポートエラー', async ({ page }) => {
    // SCEN-037
    await page.goto(`${BASE_URL}/sales-data`);
    await page.click('[data-testid="csv-import-button"]');
    await page.setInputFiles('[data-testid="csv-file-input"]', 'test-data/invalid-format.csv');
    await page.click('[data-testid="import-execute-button"]');
    await expect(page.locator('[data-testid="import-error"]')).toContainText('フォーマット');
    await expect(page.locator('[data-testid="error-details"]')).toContainText('行番号');
  });

  test('SCEN-038: 存在しないデータの編集でエラー', async ({ page }) => {
    // SCEN-038
    await page.goto(`${BASE_URL}/sales-data/edit/99999`);
    await expect(page.locator('[data-testid="not-found-error"]')).toContainText('データが見つかりません');
  });

  test('SCEN-039: 存在しないデータの削除でエラー', async ({ page }) => {
    // SCEN-039
    await page.goto(`${BASE_URL}/sales-data`);
    await page.evaluate(() => {
      window.deleteSalesData(999999);
    });
    await expect(page.locator('[data-testid="delete-error"]')).toContainText('データが存在しません');
  });

  test('SCEN-040: 売上金額上限値で正常登録', async ({ page }) => {
    // SCEN-040
    await page.goto(`${BASE_URL}/sales-data`);
    await page.click('[data-testid="new-sales-button"]');
    await page.fill('[data-testid="product-code"]', 'PROD001');
    await page.fill('[data-testid="sales-date"]', '2024-01-15');
    await page.fill('[data-testid="quantity"]', '10');
    await page.fill('[data-testid="amount"]', '999999999');
    await page.fill('[data-testid="store-code"]', 'STORE001');
    await page.click('[data-testid="register-button"]');
    await expect(page.locator('[data-testid="success-message"]')).toContainText('登録完了');
    await expect(page.locator('[data-testid="sales-data-table"]')).toContainText('999999999');
  });

  test('SCEN-041: 売上数量0で正常登録', async ({ page }) => {
    // SCEN-041
    await page.goto(`${BASE_URL}/sales-data`);
    await page.click('[data-testid="new-sales-button"]');
    await page.fill('[data-testid="product-code"]', 'PROD001');
    await page.fill('[data-testid="sales-date"]', '2024-01-15');
    await page.fill('[data-testid="quantity"]', '0');
    await page.fill('[data-testid="amount"]', '0');
    await page.fill('[data-testid="store-code"]', 'STORE001');
    await page.click('[data-testid="register-button"]');
    if (await page.locator('[data-testid="confirm-ok"]').isVisible()) {
      await page.click('[data-testid="confirm-ok"]');
    }
    await expect(page.locator('[data-testid="sales-data-table"]')).toContainText('0');
  });

  test('SCEN-042: 同一日付範囲の開始終了日で検索', async ({ page }) => {
    // SCEN-042
    await page.goto(`${BASE_URL}/sales-data`);
    await page.fill('[data-testid="start-date"]', '2024-01-15');
    await page.fill('[data-testid="end-date"]', '2024-01-15');
    await page.click('[data-testid="search-button"]');
    const dateExists = await page.locator('[data-testid="date-cell"]').first().isVisible();
    if (dateExists) {
      await expect(page.locator('[data-testid="date-cell"]').first()).toContainText('2024-01-15');
    } else {
      await expect(page.locator('[data-testid="no-data-message"]')).toContainText('該当するデータがありません');
    }
  });

  test('SCEN-043: 大容量CSVファイルのインポート', async ({ page }) => {
    // SCEN-043
    await page.goto(`${BASE_URL}/sales-data`);
    await page.click('[data-testid="csv-import-button"]');
    await page.setInputFiles('[data-testid="csv-file-input"]', 'test-data/large-sales-data.csv');
    await page.click('[data-testid="upload-button"]');
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    await page.waitForSelector('[data-testid="upload-complete"]', { timeout: 300000 });
    await expect(page.locator('[data-testid="import-success-message"]')).toContainText('処理完了');
    await expect(page.locator('[data-testid="sales-data-table"] tbody tr')).toHaveCountGreaterThan(0);
  });

  test('SCEN-044: 検索結果0件時の表示', async ({ page }) => {
    // SCEN-044
    await page.goto(`${BASE_URL}/sales-data`);
    await page.fill('[data-testid="product-code-search"]', 'NONEXIST999');
    await page.fill('[data-testid="start-date"]', '2025-01-01');
    await page.fill('[data-testid="end-date"]', '2025-01-31');
    await page.click('[data-testid="search-button"]');
    await expect(page.locator('[data-testid="no-results-message"]')).toContainText('該当するデータが見つかりませんでした');
  });
});