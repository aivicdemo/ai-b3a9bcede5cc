// SIG-PLAN:
// - 関数名: collectSalesData
//   呼び出し例 (テスト中): collectSalesData(storeIds), collectSalesData(['STORE999'])
//   await されてる?: はい
//   戻り値の型: Promise<Array<{ storeId: string; salesAmount: number; salesDate: string }>>
//   → 結論: async function collectSalesData(storeIds: string[]): Promise<Array<{ storeId: string; salesAmount: number; salesDate: string }>>
//
// - 関数名: classifySalesDataByProduct
//   呼び出し例 (テスト中): classifySalesDataByProduct(salesData)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.P001, result.P002, result.P001.length, result.P001[0].salesAmount
//   → 結論: function classifySalesDataByProduct(salesData: Array<{ productId: string; [key: string]: any }>): Record<string, Array<any>>
//
// - 関数名: classifySalesDataByStore
//   呼び出し例 (テスト中): classifySalesDataByStore(salesData)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.STORE001, result.STORE002, result.STORE001.length, result.STORE001.reduce()
//   → 結論: function classifySalesDataByStore(salesData: Array<{ storeId: string; [key: string]: any }>): Record<string, Array<any>>
//
// - 関数名: filterValidProductData
//   呼び出し例 (テスト中): filterValidProductData(salesData, validProductIds)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.validData, result.excludedCount, result.validData.length
//   → 結論: function filterValidProductData(salesData: Array<{ productId: string; [key: string]: any }>, validProductIds: string[]): { validData: Array<any>; excludedCount: number }
//
// - 関数名: collectWeatherData
//   呼び出し例 (テスト中): collectWeatherData("2024-01-01")
//   await されてる?: はい
//   アクセスされるプロパティ: result.temperature, result.humidity, result.precipitation, result.date
//   → 結論: async function collectWeatherData(date: string): Promise<{ temperature: number; humidity: number; precipitation: number; windSpeed?: number; date: string }>
//
// - 関数名: collectEventData
//   呼び出し例 (テスト中): collectEventData("2024-07-01", "2024-07-31")
//   await されてる?: はい
//   → 結論: async function collectEventData(startDate: string, endDate: string): Promise<Array<{ eventName: string; startDate: string; endDate: string; location: string; scale: string }>>
//
// - 関数名: collectSeasonalData
//   呼び出し例 (テスト中): collectSeasonalData("2024-07-15")
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.season, result.month, result.isHoliday
//   → 結論: function collectSeasonalData(date: string): { season: string; month: number; isHoliday: boolean }
//
// - 関数名: analyzeCorrelationSalesWeather
//   呼び出し例 (テスト中): analyzeCorrelationSalesWeather(salesData, weatherData)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.correlation, result.pValue, result.confidenceInterval
//   → 結論: function analyzeCorrelationSalesWeather(salesData: number[], weatherData: number[]): { correlation: number; pValue: number; confidenceInterval: number[] }
//
// - 関数名: analyzeCorrelationSalesEvent
//   呼び出し例 (テスト中): analyzeCorrelationSalesEvent(salesData, eventData)
//   await されてる?: いいえ
//   → 結論: function analyzeCorrelationSalesEvent(salesData: number[], eventData: number[]): { correlation: number; pValue: number; confidenceInterval: number[] }
//
// - 関数名: analyzeCorrelationSalesSeason
//   呼び出し例 (テスト中): analyzeCorrelationSalesSeason(salesData, seasonalData)
//   await されてる?: いいえ
//   → 結論: function analyzeCorrelationSalesSeason(salesData: number[], seasonalData: number[]): { correlation: number; pValue: number; confidenceInterval: number[] }
//
// - 関数名: compareWithHistoricalData
//   呼び出し例 (テスト中): compareWithHistoricalData(currentData, historicalData)
//   await されてる?: いいえ
//   → 結論: function compareWithHistoricalData(currentData: any, historicalData: any): { similarity: number; trend: string; variance: number }
//
// - 関数名: findAlternativeComparisonData
//   呼び出し例 (テスト中): findAlternativeComparisonData(currentData)
//   await されてる?: いいえ
//   → 結論: function findAlternativeComparisonData(currentData: any): any
//
// - 関数名: validateComparisonPeriod
//   呼び出し例 (テスト中): validateComparisonPeriod(startDate, endDate)
//   await されてる?: いいえ
//   → 結論: function validateComparisonPeriod(startDate: string, endDate: string): { isValid: boolean; reason?: string }

export async function collectSalesData(storeIds: string[]): Promise<Array<{ storeId: string; salesAmount: number; salesDate: string }>> {
  const response = await fetch('/api/sales-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storeIds })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch sales data');
  }
  
  return data.salesData;
}

export function classifySalesDataByProduct(salesData: Array<{ productId: string; [key: string]: any }>): Record<string, Array<any>> {
  const result: Record<string, Array<any>> = {};
  
  for (const item of salesData) {
    if (!result[item.productId]) {
      result[item.productId] = [];
    }
    result[item.productId].push(item);
  }
  
  return result;
}

export function classifySalesDataByStore(salesData: Array<{ storeId: string; [key: string]: any }>): Record<string, Array<any>> {
  const result: Record<string, Array<any>> = {};
  
  for (const item of salesData) {
    if (!result[item.storeId]) {
      result[item.storeId] = [];
    }
    result[item.storeId].push(item);
  }
  
  return result;
}

export function filterValidProductData(salesData: Array<{ productId: string; [key: string]: any }>, validProductIds: string[]): { validData: Array<any>; excludedCount: number } {
  const validData = salesData.filter(item => validProductIds.includes(item.productId));
  const excludedCount = salesData.length - validData.length;
  
  return { validData, excludedCount };
}

export async function collectWeatherData(date: string): Promise<{ temperature: number; humidity: number; precipitation: number; windSpeed?: number; date: string }> {
  const response = await fetch(`/api/weather-data?date=${date}`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch weather data');
  }
  
  return data.weather;
}

export async function collectEventData(startDate: string, endDate: string): Promise<Array<{ eventName: string; startDate: string; endDate: string; location: string; scale: string }>> {
  const response = await fetch(`/api/event-data?startDate=${startDate}&endDate=${endDate}`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch event data');
  }
  
  return data.events;
}

export function collectSeasonalData(date: string): { season: string; month: number; isHoliday: boolean } {
  const dateObj = new Date(date);
  const month = dateObj.getMonth() + 1;
  
  let season: string;
  if (month >= 3 && month <= 5) {
    season = 'spring';
  } else if (month >= 6 && month <= 8) {
    season = 'summer';
  } else if (month >= 9 && month <= 11) {
    season = 'autumn';
  } else {
    season = 'winter';
  }
  
  // 簡単な祝日判定（1/1, 5/3-5, 7/15-16, 12/25など）
  const dayOfMonth = dateObj.getDate();
  const isHoliday = (month === 1 && dayOfMonth === 1) ||
                   (month === 5 && dayOfMonth >= 3 && dayOfMonth <= 5) ||
                   (month === 7 && dayOfMonth >= 15 && dayOfMonth <= 16) ||
                   (month === 12 && dayOfMonth === 25);
  
  return { season, month, isHoliday };
}

function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n < 2) return 0;
  
  const meanX = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let sumXSquared = 0;
  let sumYSquared = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    sumXSquared += dx * dx;
    sumYSquared += dy * dy;
  }
  
  const denominator = Math.sqrt(sumXSquared * sumYSquared);
  return denominator === 0 ? 0 : numerator / denominator;
}

function calculatePValue(correlation: number, n: number): number {
  if (n < 3) return 1;
  const t = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation));
  // 簡易的なp値計算（t分布の近似）
  return 2 * (1 - Math.abs(t) / (Math.abs(t) + Math.sqrt(n - 2)));
}

function calculateConfidenceInterval(correlation: number, n: number): number[] {
  if (n < 4) return [correlation - 0.1, correlation + 0.1];
  
  const z = 0.5 * Math.log((1 + correlation) / (1 - correlation));
  const se = 1 / Math.sqrt(n - 3);
  const margin = 1.96 * se; // 95%信頼区間
  
  const lowerZ = z - margin;
  const upperZ = z + margin;
  
  const lower = (Math.exp(2 * lowerZ) - 1) / (Math.exp(2 * lowerZ) + 1);
  const upper = (Math.exp(2 * upperZ) - 1) / (Math.exp(2 * upperZ) + 1);
  
  return [lower, upper];
}

export function analyzeCorrelationSalesWeather(salesData: number[], weatherData: number[]): { correlation: number; pValue: number; confidenceInterval: number[] } {
  const correlation = calculatePearsonCorrelation(salesData, weatherData);
  const n = Math.min(salesData.length, weatherData.length);
  const pValue = calculatePValue(correlation, n);
  const confidenceInterval = calculateConfidenceInterval(correlation, n);
  
  return { correlation, pValue, confidenceInterval };
}

export function analyzeCorrelationSalesEvent(salesData: number[], eventData: number[]): { correlation: number; pValue: number; confidenceInterval: number[] } {
  const correlation = calculatePearsonCorrelation(salesData, eventData);
  const n = Math.min(salesData.length, eventData.length);
  const pValue = calculatePValue(correlation, n);
  const confidenceInterval = calculateConfidenceInterval(correlation, n);
  
  return { correlation, pValue, confidenceInterval };
}

export function analyzeCorrelationSalesSeason(salesData: number[], seasonalData: number[]): { correlation: number; pValue: number; confidenceInterval: number[] } {
  const correlation = calculatePearsonCorrelation(salesData, seasonalData);
  const n = Math.min(salesData.length, seasonalData.length);
  const pValue = calculatePValue(correlation, n);
  const confidenceInterval = calculateConfidenceInterval(correlation, n);
  
  return { correlation, pValue, confidenceInterval };
}

export function compareWithHistoricalData(currentData: any, historicalData: any): { similarity: number; trend: string; variance: number } {
  // 数値配列として扱う
  const current = Array.isArray(currentData) ? currentData : [currentData];
  const historical = Array.isArray(historicalData) ? historicalData : [historicalData];
  
  // 平均値の計算
  const currentMean = current.reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0) / current.length;
  const historicalMean = historical.reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0) / historical.length;
  
  // 類似度の計算（相関係数ベース）
  const similarity = Math.abs(calculatePearsonCorrelation(
    current.map(v => typeof v === 'number' ? v : 0),
    historical.slice(0, current.length).map(v => typeof v === 'number' ? v : 0)
  ));
  
  // トレンドの判定
  let trend: string;
  const changeRate = (currentMean - historicalMean) / historicalMean;
  if (changeRate > 0.05) {
    trend = 'increasing';
  } else if (changeRate < -0.05) {
    trend = 'decreasing';
  } else {
    trend = 'stable';
  }
  
  // 分散の計算
  const currentVariance = current.reduce((sum, val) => {
    const diff = (typeof val === 'number' ? val : 0) - currentMean;
    return sum + diff * diff;
  }, 0) / current.length;
  
  return { similarity, trend, variance: currentVariance };
}

export function findAlternativeComparisonData(currentData: any): any {
  // 現在のデータに基づいて代替比較データを生成
  if (Array.isArray(currentData)) {
    // 配列の場合、類似したパターンのデータを生成
    return currentData.map((item, index) => {
      if (typeof item === 'number') {
        // 数値の場合、±10%の範囲で調整
        return item * (0.9 + Math.random() * 0.2);
      }
      return item;
    });
  } else if (typeof currentData === 'object' && currentData !== null) {
    // オブジェクトの場合、同じ構造で値を調整
    const alternative: any = {};
    for (const [key, value] of Object.entries(currentData)) {
      if (typeof value === 'number') {
        alternative[key] = value * (0.9 + Math.random() * 0.2);
      } else {
        alternative[key] = value;
      }
    }
    return alternative;
  } else {
    // プリミティブ値の場合
    if (typeof currentData === 'number') {
      return currentData * (0.9 + Math.random() * 0.2);
    }
    return currentData;
  }
}

export function validateComparisonPeriod(startDate: string, endDate: string): { isValid: boolean; reason?: string } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // 日付の妥当性チェック
  if (isNaN(start.getTime())) {
    return { isValid: false, reason: '開始日が無効な日付形式です' };
  }
  
  if (isNaN(end.getTime())) {
    return { isValid: false, reason: '終了日が無効な日付形式です' };
  }
  
  // 開始日が終了日より後でないかチェック
  if (start > end) {
    return { isValid: false, reason: '開始日が終了日より後になっています' };
  }
  
  // 期間が長すぎないかチェック（例：2年以内）
  const diffTime = end.getTime() - start.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  if (diffDays > 730) {
    return { isValid: false, reason: '比較期間が2年を超えています' };
  }
  
  // 期間が短すぎないかチェック（例：1日以上）
  if (diffDays < 1) {
    return { isValid: false, reason: '比較期間が短すぎます（最低1日必要）' };
  }
  
  return { isValid: true };
}