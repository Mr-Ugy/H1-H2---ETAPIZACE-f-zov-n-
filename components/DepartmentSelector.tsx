import React, { useState, useMemo } from 'react';
import { PhaseData } from '../types';
import { Building2, ChevronRight, Stethoscope, Search, Filter } from 'lucide-react';

interface DepartmentSelectorProps {
  rows: PhaseData[];
  onSelect: (row: PhaseData) => void;
}

export const DepartmentSelector: React.FC<DepartmentSelectorProps> = ({ rows, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Group rows by category
  const filteredRows = useMemo(() => {
    return rows.filter(row => 
      row.subCategory.toLowerCase().includes(searchTerm.toLowerCase()) || 
      row.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  const grouped = useMemo(() => {
    return filteredRows.reduce((acc, row) => {
      if (!acc[row.category]) acc[row.category] = [];
      acc[row.category].push(row);
      return acc;
    }, {} as Record<string, PhaseData[]>);
  }, [filteredRows]);

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 animate-fade-in-up pb-12">
      
      {/* Hero / Search Section */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-blue-800 to-indigo-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden mb-12">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Harmonogram výstavby
          </h2>
          <p className="text-blue-100 text-lg mb-8 leading-relaxed">
            Vyhledejte své oddělení pro zobrazení detailního plánu omezení, fází výstavby a grafických podkladů.
          </p>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-indigo-300" size={24} />
            </div>
            <input
              type="text"
              placeholder="Hledat oddělení (např. Ambulance, Ozařovny)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all shadow-lg text-lg"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
            <Search className="text-slate-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Nebylo nic nalezeno</h3>
          <p className="text-slate-500">Zkuste upravit hledaný výraz.</p>
        </div>
      ) : (
        (Object.entries(grouped) as [string, PhaseData[]][]).map(([category, deptRows]) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                <Building2 size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">{category}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {deptRows.map((row) => (
                <button
                  key={row.id}
                  onClick={() => onSelect(row)}
                  className="group relative flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 text-left w-full overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10 flex items-start gap-4 w-full">
                    <div className="mt-1 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                      <Stethoscope size={22} className="text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block font-bold text-slate-800 group-hover:text-indigo-700 transition-colors text-lg truncate pr-2">
                        {row.subCategory}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                         <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-medium uppercase tracking-wider group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                            Zobrazit plán
                         </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 group-hover:bg-indigo-100 transition-colors">
                       <ChevronRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" size={18} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};