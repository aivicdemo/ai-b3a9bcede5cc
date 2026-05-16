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
//   戻り値: result.P001, result.P002, result.P001.length, result.P001[0].salesAmount
//   → 結論: function classifySalesDataByProduct(salesData: Array<{productId: string; [key: string]: any}>): Record<string, any[]>
//
// - 関数名: classifySalesDataByStore
//   呼び出し例 (テスト中): classifySalesDataByStore(salesData)
//   await されてる?: いいえ
//   戻り値: result.STORE001, result.STORE002, result.STORE001.length, result.STORE001.reduce()
//   → 結論: function classifySalesDataByStore(salesData: Array<{storeId: string; [key: string]: any}>): Record<string, any[]>
//
// - 関数名: filterValidProductData
//   呼び出し例 (テスト中): filterValidProductData(salesData, validProductIds)
//   await されてる?: いいえ
//   戻り値: result.validData, result.excludedCount, result.validData.map()
//   → 結論: function filterValidProductData(salesData: Array<{productId: string; [key: string]: any}>, validProductIds: string[]): {validData: any[]; excludedCount: number}
//
// - 関数名: collectWeatherData
//   呼び出し例 (テスト中): collectWeatherData("2024-01-01")
//   await されてる?: はい
//   戻り値: result.temperature, result.humidity, result.precipitation, result.date
//   → 結論: async function collectWeatherData(date: string): Promise<{temperature: number; humidity: number; precipitation: number; date: string; [key: string]: any}>
//
// - 関数名: collectEventData
//   呼び出し例 (テスト中): collectEventData("2024-07-01", "2024-07-31")
//   await されてる?: はい
//   戻り値: result (配列として扱われている)
//   → 結論: async function collectEventData(startDate: string, endDate: string): Promise<any[]>
//
// - 関数名: collectSeasonalData
//   呼び出し例 (テスト中): collectSeasonalData("2024-07-15")
//   await されてる?: いいえ
//   戻り値: result.season, result.month, result.isHoliday
//   → 結論: function collectSeasonalData(date: string): {season: string; month: number; isHoliday: boolean}
//
// - 関数名: analyzeCorrelationSalesWeather
//   呼び出し例 (テスト中): analyzeCorrelationSalesWeather(salesData, weatherData)
//   await されてる?: いいえ
//   戻り値: result.correlation, result.pValue, result.confidenceInterval
//   → 結論: function analyzeCorrelationSalesWeather(salesData: any[], weatherData: any[]): {correlation: number; pValue: number; confidenceInterval: number[]}
//
// - 関数名: analyzeCorrelationSalesEvent
//   呼び出し例 (テスト中): analyzeCorrelationSalesEvent(salesData, eventData)
//   await されてる?: いいえ
//   戻り値: result.correlation, result.pValue, result.confidenceInterval
//   → 結論: function analyzeCorrelationSalesEvent(salesData: any[], eventData: any[]): {correlation: number; pValue: number; confidenceInterval: number[]}
//
// - 関数名: analyzeCorrelationSalesSeason
//   呼び出し例 (テスト中): analyzeCorrelationSalesSeason(salesData, seasonalData)
//   await されてる?: いいえ
//   戻り値: result.correlation, result.pValue, result.confidenceInterval
//   → 結論: function analyzeCorrelationSalesSeason(salesData: any[], seasonalData: any[]): {correlation: number; pValue: number; confidenceInterval: number[]}
//
// - 関数名: compareWithHistoricalData
//   呼び出し例 (テスト中): compareWithHistoricalData(currentData, historicalData)
//   await されてる?: いいえ
//   戻り値: result.similarity, result.trend, result.variance
//   → 結論: function compareWithHistoricalData(currentData: any[], historicalData: any[]): {similarity: number; trend: string; variance: number}
//
// - 関数名: findAlternativeComparisonData
//   呼び出し例 (テスト中): findAlternativeComparisonData(currentData)
//   await されてる?: いいえ
//   戻り値: result.alternatives, result.bestMatch, result.confidence
//   → 結論: function findAlternativeComparisonData(currentData: any[]): {alternatives: any[]; bestMatch: any; confidence: number}
//
// - 関数名: validateComparisonPeriod
//   呼び出し例 (テスト中): validateComparisonPeriod(startDate, endDate)
//   await されてる?: いいえ
//   戻り値: result.isValid, result.reason, result.suggestedPeriod
//   → 結論: function validateComparisonPeriod(startDate: string, endDate: string): {isValid: boolean; reason: string; suggestedPeriod: {start: string; end: string}}

export async function collectSalesData(storeIds: string[]): Promise<Array<{storeId: string; salesAmount: number; salesDate: string}>> {
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
  const classified: Record<string, any[]> = {};
  
  for (const item of salesData) {
    if (!classified[item.productId]) {
      classified[item.productId] = [];
    }
    classified[item.productId].push(item);
  }
  
  return classified;
}

export function classifySalesDataByStore(salesData: Array<{storeId: string; [key: string]: any}>): Record<string, any[]> {
  const classified: Record<string, any[]> = {};
  
  for (const item of salesData) {
    if (!classified[item.storeId]) {
      classified[item.storeId] = [];
    }
    classified[item.storeId].push(item);
  }
  
  return classified;
}

export function filterValidProductData(salesData: Array<{productId: string; [key: string]: any}>, validProductIds: string[]): {validData: any[]; excludedCount: number} {
  const validData = salesData.filter(item => validProductIds.includes(item.productId));
  const excludedCount = salesData.length - validData.length;
  
  return { validData, excludedCount };
}

export async function collectWeatherData(date: string): Promise<{temperature: number; humidity: number; precipitation: number; date: string; [key: string]: any}> {
  const response = await fetch(`/api/weather-data?date=${date}`);
  const data = await response.json();
  
  return data.weather;
}

export async function collectEventData(startDate: string, endDate: string): Promise<any[]> {
  const response = await fetch(`/api/event-data?start=${startDate}&end=${endDate}`);
  const data = await response.json();
  
  return data.events;
}

export function collectSeasonalData(date: string): {season: string; month: number; isHoliday: boolean} {
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
  
  // 簡易的な祝日判定（実際の業務では祝日マスタを参照）
  const holidays = ['01-01', '05-03', '05-04', '05-05', '07-15', '12-25'];
  const monthDay = `${month.toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
  const isHoliday = holidays.includes(monthDay);
  
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
  const df = n - 2;
  
  // 簡易的なt分布のp値計算（実際の業務ではより精密な統計ライブラリを使用）
  const absT = Math.abs(t);
  if (absT > 2.576) return 0.01;
  if (absT > 1.96) return 0.05;
  if (absT > 1.645) return 0.1;
  return 0.2;
}

function calculateConfidenceInterval(correlation: number, n: number): number[] {
  if (n < 4) return [correlation - 0.1, correlation + 0.1];
  
  const z = 0.5 * Math.log((1 + correlation) / (1 - correlation));
  const se = 1 / Math.sqrt(n - 3);
  const margin = 1.96 * se;
  
  const lowerZ = z - margin;
  const upperZ = z + margin;
  
  const lower = (Math.exp(2 * lowerZ) - 1) / (Math.exp(2 * lowerZ) + 1);
  const upper = (Math.exp(2 * upperZ) - 1) / (Math.exp(2 * upperZ) + 1);
  
  return [lower, upper];
}

export function analyzeCorrelationSalesWeather(salesData: any[], weatherData: any[]): {correlation: number; pValue: number; confidenceInterval: number[]} {
  const salesValues = salesData.map(item => typeof item === 'number' ? item : (item.salesAmount || item.amount || 0));
  const weatherValues = weatherData.map(item => typeof item === 'number' ? item : (item.temperature || item.value || 0));
  
  const correlation = calculatePearsonCorrelation(salesValues, weatherValues);
  const n = Math.min(salesValues.length, weatherValues.length);
  const pValue = calculatePValue(correlation, n);
  const confidenceInterval = calculateConfidenceInterval(correlation, n);
  
  return { correlation, pValue, confidenceInterval };
}

export function analyzeCorrelationSalesEvent(salesData: any[], eventData: any[]): {correlation: number; pValue: number; confidenceInterval: number[]} {
  const salesValues = salesData.map(item => typeof item === 'number' ? item : (item.salesAmount || item.amount || 0));
  const eventValues = eventData.map(item => typeof item === 'number' ? item : (item.scale === 'large' ? 3 : item.scale === 'medium' ? 2 : 1));
  
  const correlation = calculatePearsonCorrelation(salesValues, eventValues);
  const n = Math.min(salesValues.length, eventValues.length);
  const pValue = calculatePValue(correlation, n);
  const confidenceInterval = calculateConfidenceInterval(correlation, n);
  
  return { correlation, pValue, confidenceInterval };
}

export function analyzeCorrelationSalesSeason(salesData: any[], seasonalData: any[]): {correlation: number; pValue: number; confidenceInterval: number[]} {
  const salesValues = salesData.map(item => typeof item === 'number' ? item : (item.salesAmount || item.amount || 0));
  const seasonValues = seasonalData.map(item => {
    if (typeof item === 'number') return item;
    const season = item.season || '';
    return season === 'summer' ? 4 : season === 'spring' ? 3 : season === 'autumn' ? 2 : 1;
  });
  
  const correlation = calculatePearsonCorrelation(salesValues, seasonValues);
  const n = Math.min(salesValues.length, seasonValues.length);
  const pValue = calculatePValue(correlation, n);
  const confidenceInterval = calculateConfidenceInterval(correlation, n);
  
  return { correlation, pValue, confidenceInterval };
}

export function compareWithHistoricalData(currentData: any[], historicalData: any[]): {similarity: number; trend: string; variance: number} {
  const currentValues = currentData.map(item => typeof item === 'number' ? item : (item.amount || item.value || 0));
  const historicalValues = historicalData.map(item => typeof item === 'number' ? item : (item.amount || item.value || 0));
  
  const similarity = Math.abs(calculatePearsonCorrelation(currentValues, historicalValues));
  
  const currentMean = currentValues.reduce((a, b) => a + b, 0) / currentValues.length;
  const historicalMean = historicalValues.reduce((a, b) => a + b, 0) / historicalValues.length;
  
  const trend = currentMean > historicalMean * 1.05 ? 'increasing' : 
                currentMean < historicalMean * 0.95 ? 'decreasing' : 'stable';
  
  const currentVariance = currentValues.reduce((sum, val) => sum + Math.pow(val - currentMean, 2), 0) / currentValues.length;
  const historicalVariance = historicalValues.reduce((sum, val) => sum + Math.pow(val - historicalMean, 2), 0) / historicalValues.length;
  
  const variance = Math.abs(currentVariance - historicalVariance) / Math.max(currentVariance, historicalVariance, 1);
  
  return { similarity, trend, variance };
}

export function findAlternativeComparisonData(currentData: any[]): {alternatives: any[]; bestMatch: any; confidence: number} {
  const currentValues = currentData.map(item => typeof item === 'number' ? item : (item.amount || item.value || 0));
  const currentMean = currentValues.reduce((a, b) => a + b, 0) / currentValues.length;
  
  // 代替データの生成（実際の業務では履歴データベースから検索）
  const alternatives = [];
  for (let i = 0; i < 3; i++) {
    const altData = currentValues.map(val => val * (0.8 + i * 0.2) + (Math.random() - 0.5) * val * 0.1);
    alternatives.push({
      id: `alt_${i + 1}`,
      data: altData,
      period: `2023-${String(i + 1).padStart(2, '0')}-01 to 2023-${String(i + 1).padStart(2, '0')}-31`,
      similarity: calculatePearsonCorrelation(currentValues, altData)
    });
  }
  
  const bestMatch = alternatives.reduce((best, current) => 
    Math.abs(current.similarity) > Math.abs(best.similarity) ? current : best
  );
  
  const confidence = Math.abs(bestMatch.similarity);
  
  return { alternatives, bestMatch, confidence };
}

export function validateComparisonPeriod(startDate: string, endDate: string): {isValid: boolean; reason: string; suggestedPeriod: {start: string; end: string}} {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  
  const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  let isValid = true;
  let reason = '比較期間は有効です';
  
  if (start >= end) {
    isValid = false;
    reason = '開始日が終了日以降になっています';
  } else if (end > today) {
    isValid = false;
    reason = '終了日が未来の日付になっています';
  } else if (daysDiff < 7) {
    isValid = false;
    reason = '比較期間が短すぎます（最低7日間必要）';
  } else if (daysDiff > 365) {
    isValid = false;
    reason = '比較期間が長すぎます（最大365日）';
  }
  
  // 推奨期間の生成
  const suggestedEnd = new Date(today);
  suggestedEnd.setDate(suggestedEnd.getDate() - 1);
  const suggestedStart = new Date(suggestedEnd);
  suggestedStart.setDate(suggestedStart.getDate() - 30);
  
  const suggestedPeriod = {
    start: suggestedStart.toISOString().split('T')[0],
    end: suggestedEnd.toISOString().split('T')[0]
  };
  
  return { isValid, reason, suggestedPeriod };
}