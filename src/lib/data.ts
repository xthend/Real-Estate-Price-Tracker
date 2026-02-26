import { addMonths, format, parseISO } from "date-fns";

export interface DataPoint {
  date: string;
  [city: string]: number | string;
}

export interface CityStats {
  city: string;
  peakValue: number;
  peakDate: string;
  currentValue: number;
  currentDate: string;
  decline: number; // Percentage
  returnToDate: string | null;
  baseIndex: number;
  mom: number; // Month over Month
  yoy: number; // Year over Year
  declineFromPeak: number;
}

export const CITIES = [
  // 按GDP大致排序 (2024/2025)
  "上海", "北京", "深圳", "重庆", "广州", "成都", "杭州", "武汉", "南京", "天津",
  "宁波", "青岛", "无锡", "长沙", "郑州", "福州", "济南", "合肥", "泉州", "西安",
  "烟台", "唐山", "徐州", "大连", "温州", "沈阳", "昆明", "长春", "厦门", "石家庄",
  "南昌", "扬州", "哈尔滨", "南宁", "贵阳", "兰州", "惠州", "洛阳", "金华", "襄阳",
  "宜昌", "赣州", "岳阳", "常德", "济宁", "乌鲁木齐", "太原", "遵义", "呼和浩特", "包头",
  "九江", "银川", "海口", "湛江", "平顶山", "安庆", "南充", "泸州", "桂林", "蚌埠",
  "秦皇岛", "西宁", "北海", "韶关", "吉林", "锦州", "丹东", "牡丹江", "三亚", "大理"
];

// Simulation parameters for different city tiers
const TIER_1 = ["北京", "上海", "深圳", "广州"];
const TIER_2 = ["杭州", "南京", "武汉", "成都", "重庆", "天津", "苏州", "西安", "宁波", "青岛", "长沙", "郑州", "合肥", "福州", "厦门", "济南", "沈阳", "大连", "无锡", "佛山", "东莞"];

// Real-world estimates based on market data up to late 2024/early 2025
const CITY_CONFIG: Record<string, { peakDate: string, decline: number, volatility: number }> = {
  "北京": { peakDate: "2021-03", decline: 0.28, volatility: 1.1 },
  "上海": { peakDate: "2021-07", decline: 0.25, volatility: 1.2 },
  "深圳": { peakDate: "2021-02", decline: 0.38, volatility: 1.5 }, // Dropped significantly
  "广州": { peakDate: "2021-08", decline: 0.22, volatility: 1.0 },
  "杭州": { peakDate: "2021-09", decline: 0.28, volatility: 1.3 },
  "南京": { peakDate: "2021-05", decline: 0.26, volatility: 1.1 },
  "武汉": { peakDate: "2021-06", decline: 0.30, volatility: 1.2 },
  "成都": { peakDate: "2022-04", decline: 0.15, volatility: 0.9 }, // Peaked later, fell less
  "重庆": { peakDate: "2021-07", decline: 0.25, volatility: 1.1 },
  "天津": { peakDate: "2017-03", decline: 0.35, volatility: 1.0 }, // Peaked early (2017)
  "郑州": { peakDate: "2017-08", decline: 0.32, volatility: 1.0 }, // Peaked early
  "西安": { peakDate: "2021-08", decline: 0.18, volatility: 1.0 },
  "长沙": { peakDate: "2021-09", decline: 0.12, volatility: 0.8 }, // Very stable
  "厦门": { peakDate: "2021-05", decline: 0.30, volatility: 1.4 },
  "福州": { peakDate: "2021-04", decline: 0.25, volatility: 1.1 },
  "青岛": { peakDate: "2018-06", decline: 0.28, volatility: 1.0 }, // Peaked 2018
  "济南": { peakDate: "2018-05", decline: 0.25, volatility: 1.0 },
  "石家庄": { peakDate: "2017-05", decline: 0.38, volatility: 1.1 }, // Peaked 2017
  "沈阳": { peakDate: "2020-08", decline: 0.25, volatility: 1.0 },
  "哈尔滨": { peakDate: "2020-09", decline: 0.30, volatility: 1.1 },
  "大连": { peakDate: "2020-10", decline: 0.22, volatility: 1.0 },
  "南宁": { peakDate: "2020-05", decline: 0.28, volatility: 1.1 },
  "昆明": { peakDate: "2020-11", decline: 0.25, volatility: 1.1 },
  "贵阳": { peakDate: "2018-12", decline: 0.30, volatility: 1.2 },
  "乌鲁木齐": { peakDate: "2019-08", decline: 0.20, volatility: 0.9 },
  "温州": { peakDate: "2011-08", decline: 0.40, volatility: 1.6 }, // Historical crash
};

function generateCityCurve(city: string, months: number): number[] {
  const data: number[] = [];
  let value = 100; // Base index Jan 2008 = 100
  
  // Get config or default
  const config = CITY_CONFIG[city] || { peakDate: "2021-06", decline: 0.25, volatility: 1.0 };
  
  // Parse peak date
  const peakDate = new Date(config.peakDate);
  const peakYear = peakDate.getFullYear();
  const peakMonth = peakDate.getMonth() + 1;
  const peakIndex = (peakYear - 2008) * 12 + (peakMonth - 1);

  // Random seed
  const seed = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  for (let i = 0; i < months; i++) {
    const year = 2008 + Math.floor(i / 12);
    const month = (i % 12) + 1;
    
    let change = 0;

    // --- Historical Phases ---

    // 2008-2009: Crisis & Stimulus
    if (year === 2008) change = -0.5;
    else if (year === 2009) change = 1.8; // 4 trillion stimulus
    
    // 2010-2011: Growth & Restrictions
    else if (year >= 2010 && year <= 2011) change = 0.3;
    
    // 2012-2013: Recovery
    else if (year >= 2012 && year <= 2013) change = 0.8;
    
    // 2014: Inventory overhang
    else if (year === 2014) change = -0.2;
    
    // 2015-2016: De-stocking Boom (The big one)
    else if (year >= 2015 && year <= 2016) change = 2.5;
    
    // 2017-2019: "Housing is for living" - Differentiation
    else if (year >= 2017 && year <= 2019) {
      // Some cities peaked here (Tianjin, Shijiazhuang, etc.)
      if (i > peakIndex) {
         change = -0.3; // Early decline
      } else {
         change = 0.5; // Slower growth
      }
    }
    
    // 2020-2021: COVID Stimulus & Peak
    else if (year >= 2020 && i <= peakIndex) {
       change = 1.0; // Final run-up
    }
    
    // Post-Peak Decline (The Correction)
    else if (i > peakIndex) {
       // Calculate required monthly drop to hit target decline by 2026
       // Remaining months from peak to end (approx 2026-02)
       const totalMonths = months;
       const remaining = totalMonths - peakIndex;
       // We want to lose `config.decline` percent over `remaining` months
       // Simple linear approximation of compound rate:
       // (1 - r)^N = (1 - decline)
       // N * ln(1-r) = ln(1-decline)
       // ln(1-r) = ln(1-decline) / N
       // r = 1 - exp(ln(1-decline) / N)
       if (remaining > 0) {
          const targetRatio = 1 - config.decline;
          const monthlyDecay = Math.pow(targetRatio, 1 / remaining);
          // Convert to percentage change: (0.99 - 1) * 100 = -1%
          change = (monthlyDecay - 1) * 100;
          
          // Accelerate decline in 2022-2023, slow down in 2024-2025?
          // Let's keep it simple or add a curve
          // Maybe steeper at first?
       } else {
          change = -0.5;
       }
    }

    // Add noise
    const noise = (Math.sin(i / 4 + seed) * 0.3 * config.volatility) + (Math.random() * 0.2 - 0.1);
    
    // Apply multiplier based on phase and city tier
    let multiplier = 1;
    if (year >= 2015 && year <= 2016 && TIER_1.includes(city)) multiplier = 1.5;

    value = value * (1 + (change * multiplier + noise) / 100);
    data.push(Number(value.toFixed(1)));
  }
  return data;
}

export function generateData(refresh: boolean = false): { data: DataPoint[], stats: CityStats[] } {
  const startDate = new Date(2008, 0, 1); // Jan 2008
  const endDate = new Date(2026, 1, 1);   // Feb 2026
  
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
  
  const cityCurves: Record<string, number[]> = {};
  CITIES.forEach(city => {
    cityCurves[city] = generateCityCurve(city, months);
  });

  const data: DataPoint[] = [];
  for (let i = 0; i < months; i++) {
    const currentDate = addMonths(startDate, i);
    const point: DataPoint = {
      date: format(currentDate, "yyyy-MM"),
    };
    CITIES.forEach(city => {
      point[city] = cityCurves[city][i];
    });
    data.push(point);
  }

  // Calculate stats
  const stats: CityStats[] = CITIES.map(city => {
    const curve = cityCurves[city];
    const currentValue = curve[curve.length - 1];
    const peakValue = Math.max(...curve);
    const peakIndex = curve.indexOf(peakValue);
    const peakDateStr = data[peakIndex].date;
    
    // Find return to date: last date before peak where value <= current value
    let returnToDate: string | null = null;
    for (let i = peakIndex - 1; i >= 0; i--) {
      if (curve[i] <= currentValue) {
        returnToDate = data[i].date;
        break;
      }
    }

    const prevMonthValue = curve[curve.length - 2];
    const prevYearValue = curve[curve.length - 13] || curve[0];

    return {
      city,
      peakValue,
      peakDate: peakDateStr,
      currentValue,
      currentDate: data[data.length - 1].date,
      decline: Number(((currentValue - peakValue) / peakValue * 100).toFixed(1)),
      returnToDate,
      baseIndex: 100,
      mom: Number(((currentValue - prevMonthValue) / prevMonthValue * 100).toFixed(1)),
      yoy: Number(((currentValue - prevYearValue) / prevYearValue * 100).toFixed(1)),
      declineFromPeak: Number(((currentValue - peakValue) / peakValue * 100).toFixed(1)),
    };
  });

  return { data, stats };
}

export const AVAILABLE_CITIES = CITIES;

export const CITY_GROUPS: Record<string, string[]> = {
  "直辖市": ["北京", "上海", "天津", "重庆"],
  "广东省": ["深圳", "广州", "惠州", "湛江", "韶关"],
  "浙江省": ["杭州", "宁波", "温州", "金华"],
  "江苏省": ["南京", "无锡", "徐州", "扬州"],
  "山东省": ["青岛", "济南", "烟台", "济宁"],
  "福建省": ["福州", "泉州", "厦门"],
  "四川省": ["成都", "南充", "泸州"],
  "湖北省": ["武汉", "襄阳", "宜昌"],
  "湖南省": ["长沙", "岳阳", "常德"],
  "河南省": ["郑州", "洛阳", "平顶山"],
  "安徽省": ["合肥", "安庆", "蚌埠"],
  "河北省": ["唐山", "石家庄", "秦皇岛"],
  "辽宁省": ["大连", "沈阳", "锦州", "丹东"],
  "江西省": ["南昌", "赣州", "九江"],
  "广西": ["南宁", "桂林", "北海"],
  "黑龙江省": ["哈尔滨", "牡丹江"],
  "吉林省": ["长春", "吉林"],
  "云南省": ["昆明", "大理"],
  "贵州省": ["贵阳", "遵义"],
  "内蒙古": ["呼和浩特", "包头"],
  "海南省": ["海口", "三亚"],
  "陕西省": ["西安"],
  "甘肃省": ["兰州"],
  "新疆": ["乌鲁木齐"],
  "山西省": ["太原"],
  "宁夏": ["银川"],
  "青海省": ["西宁"],
};
