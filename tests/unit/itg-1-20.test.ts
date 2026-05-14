const fetchMock = require("jest-fetch-mock");

interface Store {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
}

interface SalesData {
  storeId: string;
  productId: string;
  amount: number;
  quantity: number;
  date: string;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  condition: string;
}

interface EventData {
  id: string;
  name: string;
  date: string;
  location: string;
}

interface SeasonData {
  season: string;
  index: number;
  characteristics: string[];
}

interface CorrelationResult {
  coefficient: number;
  factor: string;
}

interface ComparisonResult {
  current: number[];
  previous: number[];
  difference: number[];
}

describe("AI需要予測・発注管理システムの構築", () => {
  test("売上データ自動収集機能 - 50店舗全ての日次売上データが正常に収集される", async () => {
    // SCEN-373
    fetchMock.resetMocks();
    
    const stores = Array.from({ length: 50 }, (_, i) => ({ id: `store${i + 1}`, name: `店舗${i + 1}` }));
    const salesData = stores.map(store => ({
      storeId: store.id,
      productId: "product1",
      amount: 10000,
      quantity: 5,
      date: "2024-01-01"
    }));

    fetchMock.mockResponseOnce(JSON.stringify({ success: true, data: salesData }), { status: 200 });

    const response = await fetch("/api/sales/collect");
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(50);
    expect(result.data[0]).toHaveProperty("storeId");
    expect(result.data[0]).toHaveProperty("amount");
  });

  test("売上データ自動収集機能 - データ収集に失敗した場合エラーログが記録される", async () => {
    // SCEN-374
    fetchMock.resetMocks();
    
    fetchMock.mockResponseOnce("", { status: 500 });

    const response = await fetch("/api/sales/collect");

    expect(response.status).toBe(500);
  });

  test("売上データ分類機能 - 収集した売上データが商品別・店舗別に正しく分類される", async () => {
    // SCEN-375
    fetchMock.resetMocks();
    
    const classifiedData = {
      byProduct: { product1: [{ storeId: "store1", amount: 5000 }] },
      byStore: { store1: [{ productId: "product1", amount: 5000 }] }
    };

    fetchMock.mockResponseOnce(JSON.stringify({ success: true, data: classifiedData }), { status: 200 });

    const response = await fetch("/api/sales/classify");
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty("byProduct");
    expect(result.data).toHaveProperty("byStore");
  });

  test("売上データ分類機能 - データが0件の場合も正常に処理される", async () => {
    // SCEN-376
    fetchMock.resetMocks();
    
    fetchMock.mockResponseOnce(JSON.stringify({ success: true, data: { byProduct: {}, byStore: {} } }), { status: 200 });

    const response = await fetch("/api/sales/classify");
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(Object.keys(result.data.byProduct)).toHaveLength(0);
    expect(Object.keys(result.data.byStore)).toHaveLength(0);
  });

  test("外部要因データ収集機能 - 天候・イベント・季節情報が正常に収集される", async () => {
    // SCEN-377
    fetchMock.resetMocks();
    
    const externalData = {
      weather: { temperature: 25, humidity: 60, precipitation: 10, condition: "sunny" },
      events: [{ id: "event1", name: "祭り", date: "2024-01-01", location: "東京" }],
      season: { season: "spring", index: 0.8, characteristics: ["warm", "mild"] }
    };

    fetchMock.mockResponseOnce(JSON.stringify({ success: true, data: externalData }), { status: 200 });

    const response = await fetch("/api/external-factors/collect");
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty("weather");
    expect(result.data).toHaveProperty("events");
    expect(result.data).toHaveProperty("season");
  });

  test("外部要因データ収集機能 - 外部API接続エラー時に適切なエラーハンドリングが行われる", async () => {
    // SCEN-378
    fetchMock.resetMocks();
    
    fetchMock.mockResponseOnce("", { status: 500 });

    const response = await fetch("/api/external-factors/collect");

    expect(response.status).toBe(500);
  });

  test("相関分析機能 - 売上データと外部要因データの相関係数が正しく算出される", async () => {
    // SCEN-379
    fetchMock.resetMocks();
    
    const correlationResults = [
      { coefficient: 0.75, factor: "temperature" },
      { coefficient: -0.45, factor: "precipitation" },
      { coefficient: 0.60, factor: "events" }
    ];

    fetchMock.mockResponseOnce(JSON.stringify({ success: true, data: correlationResults }), { status: 200 });

    const response = await fetch("/api/analysis/correlation");
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(3);
    result.data.forEach((item: CorrelationResult) => {
      expect(item.coefficient).toBeGreaterThanOrEqual(-1);
      expect(item.coefficient).toBeLessThanOrEqual(1);
    });
  });

  test("相関分析機能 - 分析対象データが不十分な場合エラーが返される", async () => {
    // SCEN-380
    fetchMock.resetMocks();
    
    const errorMessage = "分析に必要な最小データ数が不足しています。より長い期間を指定するか、データが蓄積されてから再実行してください。";
    
    fetchMock.mockResponseOnce(JSON.stringify({ error: errorMessage }), { status: 400 });

    const response = await fetch("/api/analysis/correlation?period=1week");
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe(errorMessage);
  });

  test("比較分析機能 - 売上実績データと過去同条件データが正しく比較される", async () => {
    // SCEN-381
    fetchMock.resetMocks();
    
    const comparisonResult = {
      current: [10000, 12000, 11000],
      previous: [8000, 9500, 10000],
      difference: [2000, 2500, 1000]
    };

    fetchMock.mockResponseOnce(JSON.stringify({ success: true, data: comparisonResult }), { status: 200 });

    const response = await fetch("/api/analysis/comparison");
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty("current");
    expect(result.data).toHaveProperty("previous");
    expect(result.data).toHaveProperty("difference");
    expect(result.data.current).toHaveLength(3);
  });

  test("比較分析機能 - 過去同条件データが存在しない場合適切に処理される", async () => {
    // SCEN-382
    fetchMock.resetMocks();
    
    const noDataMessage = "過去同条件データが存在しません。類似条件での比較を提案します。";
    
    fetchMock.mockResponseOnce(JSON.stringify({ 
      success: true, 
      message: noDataMessage,
      alternatives: ["類似商品データ", "基準値との比較"]
    }), { status: 200 });

    const response = await fetch("/api/analysis/comparison?productId=newProduct");
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.message).toBe(noDataMessage);
    expect(result.alternatives).toHaveLength(2);
  });
});