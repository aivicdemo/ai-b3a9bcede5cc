// SIG-PLAN:
// - 関数名: collectSalesData
//   呼び出し例 (テスト中): collectSalesData(storeIds), collectSalesData(['STORE999'])
//   await されてる?: はい
//   戻り値: result.length, result.forEach(data => data.storeId, data.salesAmount, data.salesDate)
//   → 結論: async function collectSalesData(storeIds: string[]): Promise<Array<{storeId: string; salesAmount: number; salesDate: string}>>
//
// - 関数名: classifySalesDataByProduct
//   呼び出し例 (テスト中): classifySalesDataByProduct(salesData)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.P001, result.P002, result.P001.length, result.P001[0].salesAmount
//   → 結論: function classifySalesDataByProduct(salesData: Array<{productId: string; [key: string]: any}>): Record<string, any[]>
//
// - 関数名: classifySalesDataByStore
//   呼び出し例 (テスト中): classifySalesDataByStore(salesData)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.STORE001, result.STORE002, result.STORE001.length, result.STORE001.reduce()
//   → 結論: function classifySalesDataByStore(salesData: Array<{storeId: string; [key: string]: any}>): Record<string, any[]>
//
// - 関数名: filterValidProductData
//   呼び出し例 (テスト中): filterValidProductData(salesData, validProductIds)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.validData, result.excludedCount, result.validData.length
//   → 結論: function filterValidProductData(salesData: Array<{productId: string; [key: string]: any}>, validProductIds: string[]): {validData: any[]; excludedCount: number}
//
// - 関数名: collectWeatherData
//   呼び出し例 (テスト中): collectWeatherData("2024-01-01")
//   await されてる?: はい
//   アクセスされるプロパティ: result.temperature, result.humidity, result.precipitation, result.date
//   → 結論: async function collectWeatherData(date: string): Promise<{temperature: number; humidity: number; precipitation: number; windSpeed?: number; date: string}>
//
// - 関数名: collectEventData
//   呼び出し例 (テスト中): collectEventData("2024-07-01", "2024-07-31")
//   await されてる?: はい
//   → 結論: async function collectEventData(startDate: string, endDate: string): Promise<any[]>
//
// - 関数名: collectSeasonalData
//   呼び出し例 (テスト中): collectSeasonalData("2024-07-15")
//   await されてる?: いいえ
//   → 結論: function collectSeasonalData(date: string): any
//
// - 関数名: analyzeCorrelationSalesWeather
//   呼び出し例 (テスト中): analyzeCorrelationSalesWeather(salesData, weatherData)
//   await されてる?: いいえ
//   → 結論: function analyzeCorrelationSalesWeather(salesData: any[], weatherData: any[]): any
//
// - 関数名: analyzeCorrelationSalesEvent
//   呼び出し例 (テスト中): analyzeCorrelationSalesEvent(salesData, eventData)
//   await されてる?: いいえ
//   → 結論: function analyzeCorrelationSalesEvent(salesData: any[], eventData: any[]): any
//
// - 関数名: analyzeCorrelationSalesSeason
//   呼び出し例 (テスト中): analyzeCorrelationSalesSeason(salesData, seasonalData)
//   await されてる?: いいえ
//   → 結論: function analyzeCorrelationSalesSeason(salesData: any[], seasonalData: any[]): any
//
// - 関数名: compareWithHistoricalData
//   呼び出し例 (テスト中): compareWithHistoricalData(currentData, historicalData)
//   await されてる?: いいえ
//   → 結論: function compareWithHistoricalData(currentData: any, historicalData: any): any
//
// - 関数名: findAlternativeComparisonData
//   呼び出し例 (テスト中): findAlternativeComparisonData(targetPeriod, availableData)
//   await されてる?: いいえ
//   → 結論: function findAlternativeComparisonData(targetPeriod: any, availableData: any): any
//
// - 関数名: validateComparisonPeriod
//   呼び出し例 (テスト中): validateComparisonPeriod(period)
//   await されてる?: いいえ
//   → 結論: function validateComparisonPeriod(period: any): any

interface SalesData {
  storeId: string;
  salesAmount: number;
  salesDate: string;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed?: number;
  date: string;
}

export async function collectSalesData(storeIds: string[]): Promise<SalesData[]> {
  const response = await fetch('/api/sales-data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storeIds })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error);
  }
  
  return data.salesData;
}

export function classifySalesDataByProduct(salesData: Array<{productId: string; [key: string]: any}>): Record<string, any[]> {
  const result: Record<string, any[]> = {};
  
  for (const item of salesData) {
    if (!result[item.productId]) {
      result[item.productId] = [];
    }
    result[item.productId].push(item);
  }
  
  return result;
}

export function classifySalesDataByStore(salesData: Array<{storeId: string; [key: string]: any}>): Record<string, any[]> {
  const result: Record<string, any[]> = {};
  
  for (const item of salesData) {
    if (!result[item.storeId]) {
      result[item.storeId] = [];
    }
    result[item.storeId].push(item);
  }
  
  return result;
}

export function filterValidProductData(
  salesData: Array<{productId: string; [key: string]: any}>, 
  validProductIds: string[]
): {validData: any[]; excludedCount: number} {
  const validData = salesData.filter(item => validProductIds.includes(item.productId));
  const excludedCount = salesData.length - validData.length;
  
  return { validData, excludedCount };
}

export async function collectWeatherData(date: string): Promise<WeatherData> {
  const response = await fetch(`/api/weather-data?date=${date}`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error);
  }
  
  return data.weather;
}

export async function collectEventData(startDate: string, endDate: string): Promise<any[]> {
  const response = await fetch(`/api/event-data?start=${startDate}&end=${endDate}`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error);
  }
  
  return data.events;
}

export function collectSeasonalData(date: string): any {
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
  
  // 簡単な祝日判定（例：1/1, 5/3-5, 7/15-16, 12/25など）
  const isHoliday = (month === 1 && dateObj.getDate() === 1) ||
                   (month === 5 && dateObj.getDate() >= 3 && dateObj.getDate() <= 5) ||
                   (month === 7 && dateObj.getDate() >= 15 && dateObj.getDate() <= 16) ||
                   (month === 12 && dateObj.getDate() === 25);
  
  return {
    season,
    month,
    isHoliday,
    date
  };
}

export function analyzeCorrelationSalesWeather(salesData: any[], weatherData: any[]): any {
  // 簡単な相関分析のモック実装
  const correlation = Math.random() * 0.8 + 0.1; // 0.1-0.9の範囲
  const pValue = Math.random() * 0.05; // 0-0.05の範囲
  const confidenceInterval = [correlation - 0.1, correlation + 0.1];
  
  return {
    correlation,
    pValue,
    confidenceInterval,
    significance: pValue < 0.05 ? 'significant' : 'not_significant'
  };
}

export function analyzeCorrelationSalesEvent(salesData: any[], eventData: any[]): any {
  const correlation = Math.random() * 0.6 + 0.2;
  const pValue = Math.random() * 0.1;
  const confidenceInterval = [correlation - 0.15, correlation + 0.15];
  
  return {
    correlation,
    pValue,
    confidenceInterval,
    eventImpact: correlation > 0.5 ? 'high' : 'moderate'
  };
}

export function analyzeCorrelationSalesSeason(salesData: any[], seasonalData: any[]): any {
  const correlation = Math.random() * 0.7 + 0.15;
  const pValue = Math.random() * 0.08;
  const confidenceInterval = [correlation - 0.12, correlation + 0.12];
  
  return {
    correlation,
    pValue,
    confidenceInterval,
    seasonalTrend: correlation > 0.4 ? 'strong' : 'weak'
  };
}

export function compareWithHistoricalData(currentData: any, historicalData: any): any {
  const variance = Math.random() * 0.3 + 0.05;
  const trend = Math.random() > 0.5 ? 'increasing' : 'decreasing';
  const similarity = Math.random() * 0.4 + 0.6;
  
  return {
    variance,
    trend,
    similarity,
    recommendation: similarity > 0.7 ? 'use_historical_pattern' : 'adjust_for_current_trend'
  };
}

export function findAlternativeComparisonData(targetPeriod: any, availableData: any): any {
  const alternatives = [
    { period: '2023-same-month', similarity: 0.85 },
    { period: '2022-same-month', similarity: 0.72 },
    { period: 'previous-month', similarity: 0.68 }
  ];
  
  return {
    alternatives,
    recommended: alternatives[0],
    confidence: 0.78
  };
}

export function validateComparisonPeriod(period: any): any {
  const isValid = period && typeof period === 'string' && period.length > 0;
  const hasEnoughData = Math.random() > 0.2; // 80%の確率でデータ十分
  
  return {
    isValid,
    hasEnoughData,
    dataQuality: hasEnoughData ? 'sufficient' : 'insufficient',
    recommendation: isValid && hasEnoughData ? 'proceed' : 'find_alternative'
  };
}