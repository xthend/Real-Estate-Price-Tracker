import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { PriceChart } from './components/PriceChart';
import { DataTables } from './components/DataTables';
import { generateData, AVAILABLE_CITIES } from './lib/data';
import { cn } from './lib/utils';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [selectedCities, setSelectedCities] = useState<string[]>(['北京', '上海', '深圳', '广州']);
  const [dataSource, setDataSource] = useState('NBS');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [startDate, setStartDate] = useState('2008-01');
  const [endDate, setEndDate] = useState('2026-02');
  const [showDecline, setShowDecline] = useState(true);
  const [showTable, setShowTable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [dataVersion, setDataVersion] = useState(0);

  // Generate data on mount or when refreshed
  const { data: rawData, stats: rawStats } = useMemo(() => generateData(true), [dataVersion]);

  useEffect(() => {
    // Simulate loading delay for "Real-time" feel
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [dataVersion]);

  const handleRefresh = () => {
    setIsLoading(true);
    // Increment version to trigger re-generation
    setDataVersion(prev => prev + 1);
  };

  // Filter data based on date range
  const filteredData = useMemo(() => {
    return rawData.filter(d => d.date >= startDate && d.date <= endDate);
  }, [rawData, startDate, endDate]);

  const handleToggleCity = (city: string) => {
    if (selectedCities.includes(city)) {
      setSelectedCities(selectedCities.filter(c => c !== city));
    } else {
      if (selectedCities.length < 6) {
        setSelectedCities([...selectedCities, city]);
      }
    }
  };

  const handleSelectAll = () => {
    // Select first 6 cities as default
    setSelectedCities(AVAILABLE_CITIES.slice(0, 6));
  };

  const handleClear = () => {
    setSelectedCities([]);
  };

  return (
    <div className={cn(
      "flex h-screen w-full overflow-hidden font-sans transition-colors duration-300",
      theme === 'dark' ? "bg-[#0f172a] text-white" : "bg-gray-100 text-gray-900"
    )}>
      <Sidebar
        selectedCities={selectedCities}
        onToggleCity={handleToggleCity}
        dataSource={dataSource}
        setDataSource={setDataSource}
        theme={theme}
        setTheme={setTheme}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        showDecline={showDecline}
        setShowDecline={setShowDecline}
        showTable={showTable}
        setShowTable={setShowTable}
        onRefresh={handleRefresh}
        onSelectAll={handleSelectAll}
        onClear={handleClear}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
              <p className="text-lg font-medium">正在实时采集最新数据...</p>
            </div>
          </div>
        ) : null}

        <div className="flex-1 p-4 min-h-0">
          <div className={cn(
            "w-full h-full rounded-xl shadow-sm border p-4 flex flex-col relative overflow-hidden",
            theme === 'dark' ? "bg-[#1e293b] border-gray-700" : "bg-white border-gray-200"
          )}>
            <div className="flex-1 min-h-0">
               <PriceChart 
                 data={filteredData} 
                 stats={rawStats} 
                 selectedCities={selectedCities} 
                 theme={theme}
                 showDecline={showDecline}
               />
            </div>
          </div>
        </div>

        {showTable && (
          <div className="h-1/3 p-4 pt-0 overflow-y-auto min-h-[200px]">
             <DataTables stats={rawStats} selectedCities={selectedCities} theme={theme} />
          </div>
        )}
      </main>
    </div>
  );
}
