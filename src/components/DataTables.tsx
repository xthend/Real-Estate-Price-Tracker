import React from 'react';
import { CityStats } from '@/lib/data';
import { cn } from '@/lib/utils';

interface DataTablesProps {
  stats: CityStats[];
  selectedCities: string[];
  theme: 'light' | 'dark';
}

export function DataTables({ stats, selectedCities, theme }: DataTablesProps) {
  const isDark = theme === 'dark';
  const activeStats = stats.filter(s => selectedCities.includes(s.city));

  if (activeStats.length === 0) return null;

  return (
    <div className={cn(
      "w-full overflow-x-auto rounded-lg border mt-4",
      isDark ? "bg-[#1e293b] border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-800"
    )}>
      <table className="w-full text-sm text-left">
        <thead className={cn(
          "text-xs uppercase",
          isDark ? "bg-gray-800 text-gray-400" : "bg-gray-50 text-gray-700"
        )}>
          <tr>
            <th className="px-6 py-3">城市</th>
            <th className="px-6 py-3">起点指数 (2008-01)</th>
            <th className="px-6 py-3">区间峰值</th>
            <th className="px-6 py-3">最新指数 ({activeStats[0]?.currentDate})</th>
            <th className="px-6 py-3">环比涨幅</th>
            <th className="px-6 py-3">同比涨幅</th>
            <th className="px-6 py-3">较峰值回撤</th>
          </tr>
        </thead>
        <tbody>
          {activeStats.map((stat) => (
            <tr key={stat.city} className={cn(
              "border-b last:border-0",
              isDark ? "border-gray-700 hover:bg-gray-800/50" : "border-gray-200 hover:bg-gray-50"
            )}>
              <td className="px-6 py-4 font-medium">{stat.city}</td>
              <td className="px-6 py-4">{stat.baseIndex.toFixed(2)}</td>
              <td className="px-6 py-4">
                {stat.peakValue} <span className="text-xs opacity-60">({stat.peakDate})</span>
              </td>
              <td className="px-6 py-4">{stat.currentValue}</td>
              <td className={cn("px-6 py-4", stat.mom >= 0 ? "text-green-500" : "text-red-500")}>
                {stat.mom}%
              </td>
              <td className={cn("px-6 py-4", stat.yoy >= 0 ? "text-green-500" : "text-red-500")}>
                {stat.yoy}%
              </td>
              <td className="px-6 py-4 text-red-500 font-bold">
                {stat.declineFromPeak}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-2 text-xs opacity-60 text-right">
        数据来源：国家统计局70城二手住宅销售价格指数（上月=100，链式定基）。已按滑块起点 2008-01 统一基定 100。
      </div>
    </div>
  );
}
