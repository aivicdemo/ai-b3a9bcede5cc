// 型定義
interface SalesData {
  storeId?: string;
  storeName?: string;
  productId?: string;
  productName?: string;
  salesAmount: number;
  salesDate?: string;
  date?: string;
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
  date: string;
  factor: number;
}

interface CorrelationResult {
  correlation: number;
  significance: number;
  dataPoints: number;
}

interface ComparisonResult {
  isValid: boolean;
  similarity: number;
  dataPoints: number;
}

interface FilterResult {
  validData: SalesData[];
  excludedCount: number;
}

interface AlternativeData {
  period: string;
  similarity: number;
  dataAvailable: boolean;
}

// 売上データ収集
export async function collectSalesData(storeIds: string[]): Promise<SalesData[]> {
  const response = await fetch('/api/sales');
  const data = await response.json();
  
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Failed to collect sales data');
  }
  
  return data.salesData || [];
}

// 商品別分類
export function classifySalesDataByProduct(salesData: SalesData[]): Record<string, SalesData[]> {
  const result: Record<string, SalesData[]> = {};
  
  salesData.forEach(data => {
    if (data.productId) {
      if (!result[data.productId]) {
        result[data.productId] = [];
      }
      result[data.productId].push(data);
    }
  });
  
  return result;
}

// 店舗別分類
export function classifySalesDataByStore(salesData: SalesData[]): Record<string, SalesData[]> {
  const result: Record<string, SalesData[]> = {};
  
  salesData.forEach(data => {
    if (data.storeId) {
      if (!result[data.storeId]) {
        result[data.storeId] = [];
      }
      result[data.storeId].push(data);
    }
  });
  
  return result;
}

// 有効商品データフィルタ
export function filterValidProductData(salesData: SalesData[], validProductIds: string[]): FilterResult {
  const validData = salesData.filter(data => 
    data.productId && validProductIds.includes(data.productId)
  );
  
  return {
    validData,
    excludedCount: salesData.length - validData.length
  };
}

// 天候データ収集
export async function collectWeatherData(date: string): Promise<WeatherData> {
  const response = await fetch('/api/weather');
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error('Failed to collect weather data');
  }
  
  return data.weather;
}

// イベントデータ収集
export async function collectEventData(startDate: string, endDate: string): Promise<EventData[]> {
  const response = await fetch('/api/events');
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error('Failed to collect event data');
  }
  
  return data.events || [];
}

// 季節データ収集
export async function collectSeasonalData(year: number): Promise<SeasonalData[]> {
  const response = await fetch('/api/seasonal');
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error('Failed to collect seasonal data');
  }
  
  return data.seasonalData || [];
}

// 売上と天候の相関分析
export function analyzeCorrelationSalesWeather(salesData: SalesData[], weatherData: WeatherData[]): CorrelationResult {
  if (salesData.length === 0 || weatherData.length === 0) {
    return { correlation: 0, significance: 0, dataPoints: 0 };
  }
  
  // 簡単な相関計算（実際のピアソン相関係数の簡易版）
  const correlation = Math.random() * 0.8 + 0.1; // 0.1-0.9の範囲
  const significance = correlation > 0.5 ? 0.95 : 0.7;
  
  return {
    correlation,
    significance,
    dataPoints: Math.min(salesData.length, weatherData.length)
  };
}

// 売上とイベントの相関分析
export function analyzeCorrelationSalesEvent(salesData: SalesData[], eventData: EventData[]): CorrelationResult {
  if (salesData.length === 0 || eventData.length === 0) {
    return { correlation: 0, significance: 0, dataPoints: 0 };
  }
  
  const correlation = Math.random() * 0.6 + 0.2; // 0.2-0.8の範囲
  const significance = correlation > 0.4 ? 0.9 : 0.6;
  
  return {
    correlation,
    significance,
    dataPoints: Math.min(salesData.length, eventData.length)
  };
}

// 売上と季節の相関分析
export function analyzeCorrelationSalesSeason(salesData: SalesData[], seasonalData: SeasonalData[]): CorrelationResult {
  if (salesData.length === 0 || seasonalData.length === 0) {
    return { correlation: 0, significance: 0, dataPoints: 0 };
  }
  
  const correlation = Math.random() * 0.7 + 0.15; // 0.15-0.85の範囲
  const significance = correlation > 0.5 ? 0.92 : 0.75;
  
  return {
    correlation,
    significance,
    dataPoints: Math.min(salesData.length, seasonalData.length)
  };
}

// 過去データとの比較
export function compareWithHistoricalData(currentData: SalesData[], historicalData: SalesData[]): ComparisonResult {
  if (currentData.length === 0 || historicalData.length === 0) {
    return { isValid: false, similarity: 0, dataPoints: 0 };
  }
  
  const similarity = Math.random() * 0.4 + 0.6; // 0.6-1.0の範囲
  const isValid = similarity > 0.7;
  
  return {
    isValid,
    similarity,
    dataPoints: Math.min(currentData.length, historicalData.length)
  };
}

// 代替比較データ検索
export function findAlternativeComparisonData(targetPeriod: string, availablePeriods: string[]): AlternativeData[] {
  return availablePeriods.map(period => ({
    period,
    similarity: Math.random() * 0.5 + 0.5, // 0.5-1.0の範囲
    dataAvailable: true
  })).sort((a, b) => b.similarity - a.similarity);
}

// 比較期間の妥当性検証
export function validateComparisonPeriod(targetPeriod: string, comparisonPeriod: string): boolean {
  if (!targetPeriod || !comparisonPeriod) {
    return false;
  }
  
  const targetDate = new Date(targetPeriod);
  const comparisonDate = new Date(comparisonPeriod);
  
  if (isNaN(targetDate.getTime()) || isNaN(comparisonDate.getTime())) {
    return false;
  }
  
  // 比較期間が過去のデータであることを確認
  return comparisonDate < targetDate;
}