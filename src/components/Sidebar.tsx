import React from 'react';
import { cn } from '@/lib/utils';
import { AVAILABLE_CITIES } from '@/lib/data';
import { Search, Settings, Calendar, Database, Layout, MapPin, Clock } from 'lucide-react';

interface SidebarProps {
  selectedCities: string[];
  onToggleCity: (city: string) => void;
  dataSource: string;
  setDataSource: (source: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  showDecline: boolean;
  setShowDecline: (show: boolean) => void;
  showTable: boolean;
  setShowTable: (show: boolean) => void;
  onRefresh: () => void;
  onSelectAll: () => void;
  onClear: () => void;
}

export function Sidebar({
  selectedCities,
  onToggleCity,
  dataSource,
  setDataSource,
  theme,
  setTheme,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  showDecline,
  setShowDecline,
  showTable,
  setShowTable,
  onRefresh,
  onSelectAll,
  onClear
}: SidebarProps) {
  
  return (
    <div className={cn(
      "w-80 flex-shrink-0 flex flex-col border-r h-screen overflow-y-auto transition-colors duration-300",
      theme === 'dark' ? "bg-[#1e293b] border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-800"
    )}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          设置
        </h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Data Source */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Database className="w-4 h-4" />
            数据源
          </label>
          <select 
            value={dataSource}
            onChange={(e) => setDataSource(e.target.value)}
            className={cn(
              "w-full p-2 rounded-md border text-sm outline-none focus:ring-2 focus:ring-blue-500",
              theme === 'dark' ? "bg-[#0f172a] border-gray-600 text-white" : "bg-white border-gray-300"
            )}
          >
            <option value="NBS">国家统计局 (二手住宅70城)</option>
            <option value="Centaline">中原领先指数</option>
            <option value="Beike">贝壳研究院</option>
          </select>
          <p className="text-[10px] text-green-600 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
            已校准：基于互联网公开数据 (2008-2025)
          </p>
        </div>

        {/* Theme */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Layout className="w-4 h-4" />
            页面风格
          </label>
          <select 
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            className={cn(
              "w-full p-2 rounded-md border text-sm outline-none focus:ring-2 focus:ring-blue-500",
              theme === 'dark' ? "bg-[#0f172a] border-gray-600 text-white" : "bg-white border-gray-300"
            )}
          >
            <option value="light">浅色</option>
            <option value="dark">深色</option>
          </select>
        </div>

        {/* Cities */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              城市 (可选多至6个)
            </label>
            <div className="flex gap-2 text-xs">
              <button 
                onClick={onSelectAll}
                className="text-blue-500 hover:underline"
              >
                默认
              </button>
              <button 
                onClick={onClear}
                className="text-gray-500 hover:underline"
              >
                清空
              </button>
            </div>
          </div>
          <div className={cn(
            "grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 rounded-md border",
            theme === 'dark' ? "bg-[#0f172a] border-gray-600" : "bg-gray-50 border-gray-200"
          )}>
            {AVAILABLE_CITIES.map(city => (
              <label key={city} className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80">
                <input 
                  type="checkbox" 
                  checked={selectedCities.includes(city)}
                  onChange={() => onToggleCity(city)}
                  disabled={!selectedCities.includes(city) && selectedCities.length >= 6}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {city}
              </label>
            ))}
          </div>
        </div>

        {/* Time Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            时间区间
          </label>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">起点</span>
              <input 
                type="month" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={cn(
                  "w-full p-2 rounded-md border text-sm outline-none focus:ring-2 focus:ring-blue-500",
                  theme === 'dark' ? "bg-[#0f172a] border-gray-600 text-white" : "bg-white border-gray-300"
                )}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">终点</span>
              <input 
                type="month" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={cn(
                  "w-full p-2 rounded-md border text-sm outline-none focus:ring-2 focus:ring-blue-500",
                  theme === 'dark' ? "bg-[#0f172a] border-gray-600 text-white" : "bg-white border-gray-300"
                )}
              />
            </div>
          </div>
        </div>

        {/* Tools */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-2">
            <label className="text-sm font-medium">累计跌幅</label>
            <button
              onClick={() => setShowDecline(!showDecline)}
              className={cn(
                "w-full py-2 px-4 rounded-md text-sm font-medium transition-colors",
                showDecline 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : (theme === 'dark' ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300")
              )}
            >
              {showDecline ? "累计跌幅 (开启)" : "累计跌幅 (关闭)"}
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">表格汇总</label>
            <button
              onClick={() => setShowTable(!showTable)}
              className={cn(
                "w-full py-2 px-4 rounded-md text-sm font-medium transition-colors",
                showTable 
                  ? "bg-blue-600 text-white hover:bg-blue-700" 
                  : (theme === 'dark' ? "bg-gray-700 text-gray-200 hover:bg-gray-600" : "bg-gray-200 text-gray-800 hover:bg-gray-300")
              )}
            >
              {showTable ? "表格汇总 (开启)" : "表格汇总 (关闭)"}
            </button>
          </div>
          
          <div className="pt-2">
             <button 
               onClick={onRefresh}
               className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
             >
               <Clock className="w-4 h-4" />
               实时数据刷新
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
