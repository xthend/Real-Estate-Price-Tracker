import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Label,
  ReferenceDot
} from 'recharts';
import { DataPoint, CityStats } from '@/lib/data';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface PriceChartProps {
  data: DataPoint[];
  stats: CityStats[];
  selectedCities: string[];
  theme: 'light' | 'dark';
  showDecline: boolean;
}

const COLORS = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
];

const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={cn(
        "p-3 rounded-lg shadow-lg border text-xs",
        theme === 'dark' ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
      )}>
        <p className="font-bold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="font-medium">{entry.name}:</span>
            <span>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function PriceChart({ data, stats, selectedCities, theme, showDecline }: PriceChartProps) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#9ca3af' : '#4b5563';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  // Filter stats for selected cities
  const activeStats = stats.filter(s => selectedCities.includes(s.city));

  return (
    <div className="w-full h-full relative">
      {/* Chart Title Overlay */}
      <div className="absolute top-0 left-0 right-0 text-center z-10 pointer-events-none mt-4">
        <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
          二手住宅价格指数：热点城市
        </h2>
        <p className={cn("text-sm mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
          {data[0]?.date} - {data[data.length - 1]?.date} | 定基2008年1月=100
        </p>
      </div>

      {/* Summary Table Overlay */}
      {showDecline && activeStats.length > 0 && (
        <div className={cn(
          "absolute top-20 left-16 z-10 p-4 rounded-lg shadow-lg border pointer-events-auto bg-opacity-90 backdrop-blur-sm",
          isDark ? "bg-gray-900/80 border-gray-700 text-gray-200" : "bg-white/90 border-gray-200 text-gray-800"
        )}>
          <table className="text-xs text-center w-64">
            <thead>
              <tr className="border-b border-gray-500/30">
                <th className="pb-2 font-medium">城市</th>
                <th className="pb-2 font-medium">最高位置</th>
                <th className="pb-2 font-medium">当前位置</th>
                <th className="pb-2 font-medium">累计跌幅</th>
                <th className="pb-2 font-medium">跌回</th>
              </tr>
            </thead>
            <tbody>
              {selectedCities.map((city, idx) => {
                const stat = stats.find(s => s.city === city);
                if (!stat) return null;
                return (
                  <tr key={city} className="border-b border-gray-500/10 last:border-0">
                    <td className="py-1" style={{ color: COLORS[idx % COLORS.length] }}>{city}</td>
                    <td className="py-1">{stat.peakValue}</td>
                    <td className="py-1">{stat.currentValue}</td>
                    <td className="py-1 text-red-500">{stat.decline}%</td>
                    <td className="py-1">{stat.returnToDate || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-2 text-[10px] opacity-60 text-left">
            *数据来源：互联网公开数据整理 (NBS/贝壳/中原)<br/>
            *图表制作：AI Studio Applet
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 100, right: 50, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke={textColor} 
            tick={{ fontSize: 10 }}
            tickMargin={10}
            interval={24} // Show every 2 years roughly
          />
          <YAxis 
            stroke={textColor} 
            domain={['auto', 'auto']} 
            tick={{ fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip theme={theme} />} />
          <Legend verticalAlign="bottom" height={36} />
          
          {selectedCities.map((city, index) => {
            const cityColor = COLORS[index % COLORS.length];
            const stat = stats.find(s => s.city === city);
            
            return (
              <React.Fragment key={city}>
                <Line
                  type="monotone"
                  dataKey={city}
                  stroke={cityColor}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                />
                
                {/* Annotations for Peak and Return To */}
                {showDecline && stat && (
                  <>
                    {/* Peak Dot */}
                    <ReferenceDot 
                      x={stat.peakDate} 
                      y={stat.peakValue} 
                      r={4} 
                      fill={cityColor} 
                      stroke="none"
                    >
                      <Label 
                        value="最高点" 
                        position="top" 
                        fill={cityColor} 
                        fontSize={10} 
                        offset={10}
                      />
                      <Label 
                        value={stat.peakDate} 
                        position="top" 
                        fill={cityColor} 
                        fontSize={9} 
                        offset={-2}
                      />
                    </ReferenceDot>

                    {/* Return To Line */}
                    {stat.returnToDate && (
                      <ReferenceLine 
                        segment={[
                          { x: stat.returnToDate, y: stat.currentValue },
                          { x: stat.currentDate, y: stat.currentValue }
                        ]} 
                        stroke={cityColor} 
                        strokeDasharray="3 3" 
                        strokeWidth={1}
                        label={{ 
                          value: `跌回 ${stat.returnToDate}`, 
                          position: 'insideLeft', 
                          fill: cityColor, 
                          fontSize: 10 
                        }}
                      />
                    )}

                    {/* Vertical Drop Line (Peak to Current Level) */}
                    <ReferenceLine 
                      segment={[
                        { x: stat.peakDate, y: stat.peakValue },
                        { x: stat.peakDate, y: stat.currentValue } // Drop to current level visually
                      ]} 
                      stroke={cityColor} 
                      strokeDasharray="2 2" 
                      strokeWidth={1}
                    >
                       <Label 
                        value={`累计跌幅 ${stat.decline}%`} 
                        position="center" 
                        fill={cityColor} 
                        fontSize={10} 
                        angle={-90}
                        offset={10}
                      />
                    </ReferenceLine>
                  </>
                )}
              </React.Fragment>
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
