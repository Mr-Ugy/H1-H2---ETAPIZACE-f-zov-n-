import React, { useState, useEffect } from 'react';
import { parseCsv } from './utils/csvHelper';
import { DEFAULT_CSV_DATA } from './constants';
import { PhaseData } from './types';
import { DepartmentSelector } from './components/DepartmentSelector';
import { DepartmentView } from './components/DepartmentView';
import { Legend } from './components/Legend';
import { Activity, FileText } from 'lucide-react';

function App() {
  const [data, setData] = useState<{ headers: string[], rows: PhaseData[], notes: PhaseData[] }>({ headers: [], rows: [], notes: [] });
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<PhaseData | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
        const parsed = parseCsv(DEFAULT_CSV_DATA);
        setData(parsed);
        setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setSelectedDepartment(null)}
          >
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
               <Activity size={24} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">OnkoFáze</h1>
              <p className="text-xs text-slate-500 font-semibold tracking-wide mt-1">Stavební portál</p>
            </div>
          </div>
          
          <div className="hidden md:block">
             {/* Only show legend if a specific department is NOT selected, or move it to footer? 
                 Let's keep it clean. Maybe only on timeline view? 
                 Actually, the timeline view is self-explanatory now with labels. 
                 Let's just show it nicely if we are on the main view or timeline view 
                 but make it subtle. */}
             {!loading && selectedDepartment && <Legend />}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-pulse">
             <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
             </div>
             <p className="text-slate-500 font-medium text-lg">Načítám data harmonogramu...</p>
          </div>
        ) : (
          <>
            {/* Content Switcher */}
            {data.rows.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <div className="p-6 bg-slate-100 rounded-full mb-6">
                    <FileText size={48} className="opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">Žádná data</h3>
                  <p>Nepodařilo se načíst harmonogram výstavby.</p>
               </div>
            ) : !selectedDepartment ? (
              <DepartmentSelector 
                rows={data.rows} 
                onSelect={setSelectedDepartment} 
              />
            ) : (
              <DepartmentView 
                data={selectedDepartment} 
                headers={data.headers} 
                notes={data.notes}
                onBack={() => setSelectedDepartment(null)}
              />
            )}
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col md:flex-row items-center justify-between text-slate-400 text-sm">
          <p className="mb-2 md:mb-0">Generováno pro <span className="font-semibold text-slate-600">Oddělení Onkologie</span></p>
          <p>&copy; {new Date().getFullYear()} Vizualizace výstavby</p>
        </div>
      </footer>
    </div>
  );
}

export default App;