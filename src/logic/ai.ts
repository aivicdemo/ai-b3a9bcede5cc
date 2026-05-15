interface SalesData {
  storeId?: string;
  salesAmount: number;
  salesDate?: string;
  productId?: string;
  productName?: string;
  date?: string;
  storeName?: string;
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
}

interface CorrelationResult {
  correlation: number;
  pValue: number;
  confidenceInterval: [number, number];
}

interface ComparisonResult {
  isValid: boolean;
  reason?: string;
  comparisonData?: any[];
}

interface FilterResult {
  validData: SalesData[];
  excludedCount: number;
}

export async function collectSalesData(storeIds: string[]): Promise<SalesData[]> {
  const response = await fetch('/api/sales');
  const data = await response.json();
  
  if (!response.ok || data.error) {
    throw new Error(data.error);
  }
  
  return data.salesData;
}

export function classifySalesDataByProduct(salesData: SalesData[]): Record<string, SalesData[]> {
  const result: Record<string, SalesData[]> = {};
  
  salesData.forEach(item => {
    if (item.productId) {
      if (!result[item.productId]) {
        result[item.productId] = [];
      }
      result[item.productId].push(item);
    }
  });
  
  return result;
}

export function classifySalesDataByStore(salesData: SalesData[]): Record<string, SalesData[]> {
  const result: Record<string, SalesData[]> = {};
  
  salesData.forEach(item => {
    if (item.storeId) {
      if (!result[item.storeId]) {
        result[item.storeId] = [];
      }
      result[item.storeId].push(item);
    }
  });
  
  return result;
}

export function filterValidProductData(salesData: SalesData[], validProductIds: string[]): FilterResult {
  const validData = salesData.filter(item => 
    item.productId && validProductIds.includes(item.productId)
  );
  
  return {
    validData,
    excludedCount: salesData.length - validData.length
  };
}

export async function collectWeatherData(date: string): Promise<WeatherData> {
  const response = await fetch('/api/weather');
  const data = await response.json();
  
  return data.weather;
}

export async function collectEventData(startDate: string, endDate: string): Promise<EventData[]> {
  const response = await fetch('/api/events');
  const data = await response.json();
  
  return data.events;
}

export async function collectSeasonalData(date: string): Promise<SeasonalData> {
  const response = await fetch('/api/seasonal');
  const data = await response.json();
  
  return data.seasonal;
}

export function analyzeCorrelationSalesWeather(salesData: number[], weatherData: number[]): CorrelationResult {
  // ピアソン相関係数の計算
  const n = salesData.length;
  const sumX = salesData.reduce((a, b) => a + b, 0);
  const sumY = weatherData.reduce((a, b) => a + b, 0);
  const sumXY = salesData.reduce((sum, x, i) => sum + x * weatherData[i], 0);
  const sumX2 = salesData.reduce((sum, x) => sum + x * x, 0);
  const sumY2 = weatherData.reduce((sum, y) => sum + y * y, 0);
  
  const correlation = (n * sumXY - sumX * sumY) / 
    Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  // 簡易的なp値計算
  const t = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation));
  const pValue = 2 * (1 - Math.abs(t) / (Math.abs(t) + Math.sqrt(n - 2)));
  
  // 信頼区間の簡易計算
  const margin = 1.96 / Math.sqrt(n - 3);
  const confidenceInterval: [number, number] = [
    Math.max(-1, correlation - margin),
    Math.min(1, correlation + margin)
  ];
  
  return {
    correlation: isNaN(correlation) ? 0 : correlation,
    pValue: isNaN(pValue) ? 1 : Math.max(0, Math.min(1, pValue)),
    confidenceInterval
  };
}

export function analyzeCorrelationSalesEvent(salesData: number[], eventData: number[]): CorrelationResult {
  return analyzeCorrelationSalesWeather(salesData, eventData);
}

export function analyzeCorrelationSalesSeason(salesData: number[], seasonalData: number[]): CorrelationResult {
  return analyzeCorrelationSalesWeather(salesData, seasonalData);
}

export function compareWithHistoricalData(currentData: any[], historicalData: any[]): ComparisonResult {
  if (!historicalData || historicalData.length === 0) {
    return {
      isValid: false,
      reason: "比較対象の過去データが存在しません"
    };
  }
  
  if (currentData.length !== historicalData.length) {
    return {
      isValid: false,
      reason: "データ期間が一致しません"
    };
  }
  
  return {
    isValid: true,
    comparisonData: historicalData
  };
}

export function findAlternativeComparisonData(targetPeriod: string, availableData: any[]): ComparisonResult {
  const alternativeData = availableData.filter(data => 
    data.period && data.period !== targetPeriod
  );
  
  if (alternativeData.length === 0) {
    return {
      isValid: false,
      reason: "代替比較データが見つかりません"
    };
  }
  
  return {
    isValid: true,
    comparisonData: alternativeData
  };
}

export function validateComparisonPeriod(startDate: string, endDate: string): ComparisonResult {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start >= end) {
    return {
      isValid: false,
      reason: "開始日が終了日以降になっています"
    };
  }
  
  const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysDiff < 7) {
    return {
      isValid: false,
      reason: "比較期間が短すぎます（最低7日間必要）"
    };
  }
  
  if (daysDiff > 365) {
    return {
      isValid: false,
      reason: "比較期間が長すぎます（最大365日）"
    };
  }
  
  return {
    isValid: true
  };
}