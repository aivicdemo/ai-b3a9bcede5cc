import { 
  collectSalesData, 
  classifySalesDataByProduct, 
  classifySalesDataByStore, 
  filterValidProductData,
  collectWeatherData,
  collectEventData,
  collectSeasonalData,
  analyzeCorrelationSalesWeather,
  analyzeCorrelationSalesEvent,
  analyzeCorrelationSalesSeason,
  compareWithHistoricalData,
  findAlternativeComparisonData,
  validateComparisonPeriod
} from "../../src/logic/ai";

const fetchMock = require("jest-fetch-mock");

describe("AI需要予測・発注管理システムの構築", () => {
  test("SCEN-376: 売上データ自動収集機能 - 50店舗の日次売上データが正常に収集される", async () => {
    // SCEN-376
    fetchMock.resetMocks();
    const storeIds = Array.from({ length: 50 }, (_, i) => `STORE${(i + 1).toString().padStart(3, '0')}`);
    const expectedSalesData = storeIds.map(id => ({
      storeId: id,
      salesAmount: Math.floor(Math.random() * 100000) + 10000,
      salesDate: "2024-01-01"
    }));
    
    fetchMock.mockResponseOnce(JSON.stringify({ salesData: expectedSalesData }), { status: 200 });
    
    const result = await collectSalesData(storeIds);
    
    expect(result.length).toBe(50);
    result.forEach(data => {
      expect(data).toHaveProperty('storeId');
      expect(data).toHaveProperty('salesAmount');
      expect(data).toHaveProperty('salesDate');
      expect(typeof data.salesAmount).toBe('number');
      expect(data.salesAmount).toBeGreaterThan(0);
    });
  });

  test("SCEN-377: 売上データ自動収集機能 - 店舗データが存在しない場合にエラーが返される", async () => {
    // SCEN-377
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ error: "指定された店舗ID 'STORE999' は存在しません" }), { status: 404 });
    
    await expect(collectSalesData(['STORE999'])).rejects.toThrow("指定された店舗ID 'STORE999' は存在しません");
  });

  test("SCEN-378: 売上データ分類整理機能 - 収集した売上データが商品別に正しく分類される", () => {
    // SCEN-378
    const salesData = [
      { productId: 'P001', productName: '商品A', salesAmount: 10000, date: '2024-01-01' },
      { productId: 'P002', productName: '商品B', salesAmount: 20000, date: '2024-01-01' },
      { productId: 'P001', productName: '商品A', salesAmount: 15000, date: '2024-01-02' }
    ];
    
    const result = classifySalesDataByProduct(salesData);
    
    expect(result).toHaveProperty('P001');
    expect(result).toHaveProperty('P002');
    expect(result.P001).toHaveLength(2);
    expect(result.P002).toHaveLength(1);
    expect(result.P001[0].salesAmount).toBe(10000);
    expect(result.P001[1].salesAmount).toBe(15000);
  });

  test("SCEN-379: 売上データ分類整理機能 - 収集した売上データが店舗別に正しく分類される", () => {
    // SCEN-379
    const salesData = [
      { storeId: 'STORE001', storeName: '店舗A', salesAmount: 50000, date: '2024-01-01' },
      { storeId: 'STORE002', storeName: '店舗B', salesAmount: 60000, date: '2024-01-01' },
      { storeId: 'STORE001', storeName: '店舗A', salesAmount: 55000, date: '2024-01-02' }
    ];
    
    const result = classifySalesDataByStore(salesData);
    
    expect(result).toHaveProperty('STORE001');
    expect(result).toHaveProperty('STORE002');
    expect(result.STORE001).toHaveLength(2);
    expect(result.STORE002).toHaveLength(1);
    expect(result.STORE001.reduce((sum, item) => sum + item.salesAmount, 0)).toBe(105000);
  });

  test("SCEN-380: 売上データ分類整理機能 - 商品マスタに存在しない商品データが除外される", () => {
    // SCEN-380
    const salesData = [
      { productId: 'P001', salesAmount: 10000 },
      { productId: 'P002', salesAmount: 20000 },
      { productId: 'P999', salesAmount: 30000 },
      { productId: 'P888', salesAmount: 40000 }
    ];
    const validProductIds = ['P001', 'P002'];
    
    const result = filterValidProductData(salesData, validProductIds);
    
    expect(result.validData).toHaveLength(2);
    expect(result.excludedCount).toBe(2);
    expect(result.validData.map(item => item.productId)).toEqual(['P001', 'P002']);
  });

  test("SCEN-381: 外部要因データ自動収集機能 - 天候データが正常に収集される", async () => {
    // SCEN-381
    fetchMock.resetMocks();
    const weatherData = {
      temperature: 25.5,
      humidity: 60,
      precipitation: 0,
      windSpeed: 5.2,
      date: "2024-01-01"
    };
    
    fetchMock.mockResponseOnce(JSON.stringify({ weather: weatherData }), { status: 200 });
    
    const result = await collectWeatherData("2024-01-01");
    
    expect(result).toHaveProperty('temperature');
    expect(result).toHaveProperty('humidity');
    expect(result).toHaveProperty('precipitation');
    expect(result).toHaveProperty('date');
    expect(typeof result.temperature).toBe('number');
  });

  test("SCEN-382: 外部要因データ自動収集機能 - イベントデータが正常に収集される", async () => {
    // SCEN-382
    fetchMock.resetMocks();
    const eventData = [
      { eventName: "夏祭り", startDate: "2024-07-15", endDate: "2024-07-16", location: "市民公園", scale: "large" },
      { eventName: "商店街セール", startDate: "2024-07-20", endDate: "2024-07-22", location: "中央商店街", scale: "medium" }
    ];
    
    fetchMock.mockResponseOnce(JSON.stringify({ events: eventData }), { status: 200 });
    
    const result = await collectEventData("2024-07-01", "2024-07-31");
    
    expect(result).toHaveLength(2);
    result.forEach(event => {
      expect(event).toHaveProperty('eventName');
      expect(event).toHaveProperty('startDate');
      expect(event).toHaveProperty('location');
      expect(event).toHaveProperty('scale');
    });
  });

  test("SCEN-383: 外部要因データ自動収集機能 - 季節情報データが正常に収集される", async () => {
    // SCEN-383
    const seasonalData = collectSeasonalData("2024-07-15");
    
    expect(seasonalData).toHaveProperty('season');
    expect(seasonalData).toHaveProperty('month');
    expect(seasonalData).toHaveProperty('isHoliday');
    expect(seasonalData.season).toBe('summer');
    expect(seasonalData.month).toBe(7);
    expect(typeof seasonalData.isHoliday).toBe('boolean');
  });

  test("SCEN-384: 外部要因データ自動収集機能 - 外部APIが利用不可の場合にエラーハンドリングされる", async () => {
    // SCEN-384
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce("", { status: 500 });
    
    await expect(collectWeatherData("2024-01-01")).rejects.toThrow();
  });

  test("SCEN-385: 相関分析機能 - 売上データと天候データの相関分析が正常に実行される", () => {
    // SCEN-385
    const salesData = [10000, 15000, 8000, 12000, 20000];
    const weatherData = [25, 28, 18, 22, 30];
    
    const result = analyzeCorrelationSalesWeather(salesData, weatherData);
    
    expect(result).toHaveProperty('correlation');
    expect(result).toHaveProperty('pValue');
    expect(result).toHaveProperty('confidenceInterval');
    expect(result.correlation).toBeGreaterThanOrEqual(-1);
    expect(result.correlation).toBeLessThanOrEqual(1);
    expect(typeof result.pValue).toBe('number');
  });

  test("SCEN-386: 相関分析機能 - 売上データとイベントデータの相関分析が正常に実行される", async () => {
    // SCEN-386
    fetchMock.resetMocks();
    const analysisResult = {
      correlation: 0.75,
      pValue: 0.02,
      confidenceInterval: [0.15, 0.95]
    };
    
    fetchMock.mockResponseOnce(JSON.stringify(analysisResult), { status: 200 });
    
    const salesData = [10000, 15000, 25000, 12000];
    const eventData = [0, 1, 1, 0];
    
    const result = await analyzeCorrelationSalesEvent(salesData, eventData);
    
    expect(result).toHaveProperty('correlation');
    expect(result).toHaveProperty('pValue');
    expect(result).toHaveProperty('confidenceInterval');
    expect(typeof result.correlation).toBe('number');
  });

  test("SCEN-387: 相関分析機能 - 売上データと季節情報の相関分析が正常に実行される", async () => {
    // SCEN-387
    fetchMock.resetMocks();
    const analysisResult = {
      correlation: 0.65,
      pValue: 0.01,
      confidenceInterval: [0.25, 0.85]
    };
    
    fetchMock.mockResponseOnce(JSON.stringify(analysisResult), { status: 200 });
    
    const salesData = [8000, 12000, 18000, 15000];
    const seasonData = [1, 2, 3, 4];
    
    const result = await analyzeCorrelationSalesSeason(salesData, seasonData);
    
    expect(result.correlation).toBeGreaterThanOrEqual(-1);
    expect(result.correlation).toBeLessThanOrEqual(1);
    expect(typeof result.pValue).toBe('number');
    expect(Array.isArray(result.confidenceInterval)).toBe(true);
  });

  test("SCEN-388: 相関分析機能 - 分析対象データが不足している場合にエラーが返される", () => {
    // SCEN-388
    const salesData = [10000];
    const weatherData = [];
    
    expect(() => analyzeCorrelationSalesWeather(salesData, weatherData))
      .toThrow("分析対象データが不足しています");
  });

  test("SCEN-389: 自動比較分析機能 - 売上実績データと過去同条件データの比較分析が正常に実行される", () => {
    // SCEN-389
    const currentData = { sales: 150000, period: "2024-01", product: "P001" };
    const historicalData = { sales: 120000, period: "2023-01", product: "P001" };
    
    const result = compareWithHistoricalData(currentData, historicalData);
    
    expect(result).toHaveProperty('changeRate');
    expect(result).toHaveProperty('trend');
    expect(result).toHaveProperty('difference');
    expect(result.changeRate).toBe(25);
    expect(result.trend).toBe('increase');
    expect(result.difference).toBe(30000);
  });

  test("SCEN-390: 自動比較分析機能 - 過去同条件データが存在しない場合の処理が正常に動作する", () => {
    // SCEN-390
    const currentData = { sales: 100000, period: "2024-01", product: "P999" };
    
    const result = findAlternativeComparisonData(currentData);
    
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('alternativeAnalysis');
    expect(result.message).toBe('比較対象データなし');
    expect(result.alternativeAnalysis).toHaveProperty('basicStats');
  });

  test("SCEN-391: 自動比較分析機能 - 比較対象期間が不正な場合にエラーが返される", async () => {
    // SCEN-391
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(
      JSON.stringify({ error: "比較対象期間が不正です。開始日は終了日より前の日付を指定してください" }), 
      { status: 400 }
    );
    
    const invalidPeriod = { startDate: '2024-12-31', endDate: '2024-01-01' };
    
    await expect(validateComparisonPeriod(invalidPeriod.startDate, invalidPeriod.endDate))
      .rejects.toThrow("比較対象期間が不正です。開始日は終了日より前の日付を指定してください");
  });
});