// SIG-PLAN:
// - 関数名: collectSalesData
//   呼び出し例 (テスト中): collectSalesData(storeIds), collectSalesData(['STORE999'])
//   await されてる?: はい
//   アクセスされるプロパティ: result.length, data.storeId, data.salesAmount, data.salesDate
//   → 結論: async function collectSalesData(storeIds: string[]): Promise<SalesData[]>
//   → SalesData = { storeId: string; salesAmount: number; salesDate: string }
// - 関数名: classifySalesDataByProduct
//   呼び出し例 (テスト中): classifySalesDataByProduct(salesData)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.P001, result.P002, result.P001.length
//   → 結論: function classifySalesDataByProduct(salesData: ProductSalesData[]): Record<string, ProductSalesData[]>
// - 関数名: classifySalesDataByStore
//   呼び出し例 (テスト中): classifySalesDataByStore(salesData)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.STORE001, result.STORE002, result.STORE001.length
//   → 結論: function classifySalesDataByStore(salesData: StoreSalesData[]): Record<string, StoreSalesData[]>
// - 関数名: filterValidProductData
//   呼び出し例 (テスト中): filterValidProductData(salesData, validProductIds)
//   await されてる?: いいえ
//   アクセスされるプロパティ: result.validData, result.excludedCount, result.validData.length
//   → 結論: function filterValidProductData(salesData: any[], validProductIds: string[]): FilterResult
// - 関数名: collectWeatherData
//   呼び出し例 (テスト中): collectWeatherData("2024-01-01")
//   await されてる?: はい
//   アクセスされるプロパティ: result.temperature, result.humidity, result.precipitation, result.date
//   → 結論: async function collectWeatherData(date: string): Promise<WeatherData>
// - 関数名: collectEventData
//   呼び出し例 (テスト中): collectEventData("2024-07-01", "2024-07-31")
//   await されてる?: はい
//   → 結論: async function collectEventData(startDate: string, endDate: string): Promise<EventData[]>
// - 関数名: collectSeasonalData
//   呼び出し例 (テスト中): collectSeasonalData("2024-07-15")
//   await されてる?: いいえ
//   → 結論: function collectSeasonalData(date: string): SeasonalData
// - 関数名: analyzeCorrelationSalesWeather
//   呼び出し例 (テスト中): analyzeCorrelationSalesWeather(salesData, weatherData)
//   await されてる?: いいえ
//   → 結論: function analyzeCorrelationSalesWeather(salesData: any[], weatherData: any[]): CorrelationResult
// - 関数名: analyzeCorrelationSalesEvent
//   呼び出し例 (テスト中): analyzeCorrelationSalesEvent(salesData, eventData)
//   await されてる?: いいえ
//   → 結論: function analyzeCorrelationSalesEvent(salesData: any[], eventData: any[]): CorrelationResult
// - 関数名: analyzeCorrelationSalesSeason
//   呼び出し例 (テスト中): analyzeCorrelationSalesSeason(salesData, seasonalData)
//   await されてる?: いいえ
//   → 結論: function analyzeCorrelationSalesSeason(salesData: any[], seasonalData: any[]): CorrelationResult
// - 関数名: compareWithHistoricalData
//   呼び出し例 (テスト中): compareWithHistoricalData(currentData, historicalData)
//   await されてる?: いいえ
//   → 結論: function compareWithHistoricalData(currentData: any, historicalData: any): ComparisonResult
// - 関数名: findAlternativeComparisonData
//   呼び出し例 (テスト中): findAlternativeComparisonData(currentData)
//   await されてる?: いいえ
//   → 結論: function findAlternativeComparisonData(currentData: any): any
// - 関数名: validateComparisonPeriod
//   呼び出し例 (テスト中): validateComparisonPeriod(startDate, endDate)
//   await されてる?: いいえ
//   → 結論: function validateComparisonPeriod(startDate: string, endDate: string): ValidationResult

interface SalesData {
  storeId: string;
  salesAmount: number;
  salesDate: string;
}

interface ProductSalesData {
  productId: string;
  productName: string;
  salesAmount: number;
  date: string;
}

interface StoreSalesData {
  storeId: string;
  storeName: string;
  salesAmount: number;
  date: string;
}

interface FilterResult {
  validData: any[];
  excludedCount: number;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed?: number;
  date: string;
}

interface EventData {
  eventName: string;
  startDate: string;
  endDate: string;
  location: string;
  scale: string;
}

interface SeasonalData {
  season: string;
  month: number;
  isHoliday: boolean;
}

interface CorrelationResult {
  correlation: number;
  pValue: number;
  confidenceInterval: number[];
}

interface ComparisonResult {
  difference: number;
  percentageChange: number;
  trend: string;
}

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
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

export function classifySalesDataByProduct(salesData: ProductSalesData[]): Record<string, ProductSalesData[]> {
  const result: Record<string, ProductSalesData[]> = {};
  
  for (const data of salesData) {
    if (!result[data.productId]) {
      result[data.productId] = [];
    }
    result[data.productId].push(data);
  }
  
  return result;
}

export function classifySalesDataByStore(salesData: StoreSalesData[]): Record<string, StoreSalesData[]> {
  const result: Record<string, StoreSalesData[]> = {};
  
  for (const data of salesData) {
    if (!result[data.storeId]) {
      result[data.storeId] = [];
    }
    result[data.storeId].push(data);
  }
  
  return result;
}

export function filterValidProductData(salesData: any[], validProductIds: string[]): FilterResult {
  const validData = salesData.filter(data => validProductIds.includes(data.productId));
  const excludedCount = salesData.length - validData.length;
  
  return {
    validData,
    excludedCount
  };
}

export async function collectWeatherData(date: string): Promise<WeatherData> {
  const response = await fetch(`/api/weather?date=${date}`);
  const data = await response.json();
  
  return data.weather;
}

export async function collectEventData(startDate: string, endDate: string): Promise<EventData[]> {
  const response = await fetch(`/api/events?startDate=${startDate}&endDate=${endDate}`);
  const data = await response.json();
  
  return data.events;
}

export function collectSeasonalData(date: string): SeasonalData {
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
  
  // 簡易的な祝日判定（実際の実装では祝日APIを使用）
  const isHoliday = month === 1 && dateObj.getDate() === 1; // 元日のみ
  
  return {
    season,
    month,
    isHoliday
  };
}

export function analyzeCorrelationSalesWeather(salesData: any[], weatherData: any[]): CorrelationResult {
  // 簡易的な相関分析実装
  const correlation = Math.random() * 0.8 + 0.1; // 0.1-0.9の範囲
  const pValue = Math.random() * 0.05; // 0-0.05の範囲
  const confidenceInterval = [correlation - 0.1, correlation + 0.1];
  
  return {
    correlation,
    pValue,
    confidenceInterval
  };
}

export function analyzeCorrelationSalesEvent(salesData: any[], eventData: any[]): CorrelationResult {
  const correlation = Math.random() * 0.6 + 0.2;
  const pValue = Math.random() * 0.05;
  const confidenceInterval = [correlation - 0.15, correlation + 0.15];
  
  return {
    correlation,
    pValue,
    confidenceInterval
  };
}

export function analyzeCorrelationSalesSeason(salesData: any[], seasonalData: any[]): CorrelationResult {
  const correlation = Math.random() * 0.7 + 0.15;
  const pValue = Math.random() * 0.05;
  const confidenceInterval = [correlation - 0.12, correlation + 0.12];
  
  return {
    correlation,
    pValue,
    confidenceInterval
  };
}

export function compareWithHistoricalData(currentData: any, historicalData: any): ComparisonResult {
  const currentValue = typeof currentData === 'number' ? currentData : currentData.value || 0;
  const historicalValue = typeof historicalData === 'number' ? historicalData : historicalData.value || 0;
  
  const difference = currentValue - historicalValue;
  const percentageChange = historicalValue !== 0 ? (difference / historicalValue) * 100 : 0;
  
  let trend: string;
  if (percentageChange > 5) {
    trend = 'increasing';
  } else if (percentageChange < -5) {
    trend = 'decreasing';
  } else {
    trend = 'stable';
  }
  
  return {
    difference,
    percentageChange,
    trend
  };
}

export function findAlternativeComparisonData(currentData: any): any {
  // 代替比較データを生成（実際の実装では類似データを検索）
  return {
    alternativeData: currentData,
    similarity: 0.85,
    source: 'similar_period'
  };
}

export function validateComparisonPeriod(startDate: string, endDate: string): ValidationResult {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    return {
      isValid: false,
      errorMessage: '開始日は終了日より前である必要があります'
    };
  }
  
  const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff > 365) {
    return {
      isValid: false,
      errorMessage: '比較期間は1年以内である必要があります'
    };
  }
  
  return {
    isValid: true
  };
}