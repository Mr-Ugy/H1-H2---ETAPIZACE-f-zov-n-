import React, { useState } from 'react';
import { PhaseData, CellStatus } from '../types';
import { getCellStatus, getStatusColor } from '../utils/csvHelper';
import { Info, Maximize2, X } from 'lucide-react';

interface TimelineProps {
  headers: string[];
  rows: PhaseData[];
  notes: PhaseData[];
}

export const Timeline: React.FC<TimelineProps> = ({ headers, rows, notes }) => {
  const [selectedCell, setSelectedCell] = useState<{
    title: string;
    phase: string;
    content: string;
    status: CellStatus;
  } | null>(null);

  // Group rows by category (e.g. ONKO)
  const groupedRows = rows.reduce((acc, row) => {
    if (!acc[row.category]) acc[row.category] = [];
    acc[row.category].push(row);
    return acc;
  }, {} as Record<string, PhaseData[]>);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Scrollable Container */}
      <div className="overflow-x-auto overflow-y-auto w-full h-full relative custom-scrollbar">
        <table className="border-collapse min-w-max w-full text-sm text-left">
          <thead className="bg-slate-50 sticky top-0 z-20 shadow-sm">
            <tr>
              <th className="p-4 font-semibold text-slate-700 border-b border-slate-300 min-w-[150px] sticky left-0 bg-slate-50 z-30">
                Oddělení / Provoz
              </th>
              {headers.map((header, idx) => (
                <th key={idx} className="p-3 font-semibold text-slate-600 border-b border-r border-slate-200 min-w-[200px] text-center bg-slate-50">
                   <div className="flex flex-col items-center gap-1">
                     <span className="uppercase tracking-wider text-xs text-slate-400">Fáze</span>
                     <span className="text-lg font-bold text-slate-800">{idx}</span>
                   </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* General Notes Row (if any) placed at the top or treated specially. 
                Based on the CSV provided, the note is usually for a specific phase but spans.
                We will render notes as a special row if they exist. */}
            {notes.map((note, nIdx) => (
              <tr key={`note-${nIdx}`} className="bg-yellow-50/50">
                 <td className="p-4 border-b border-r border-slate-200 font-medium text-amber-700 italic sticky left-0 bg-yellow-50/90 z-10">
                    <div className="flex items-center gap-2">
                      <Info size={16} />
                      <span>Poznámky k výstavbě</span>
                    </div>
                 </td>
                 {headers.map((_, hIdx) => {
                    const content = note.phases[hIdx];
                    return (
                      <td key={hIdx} className="p-2 border-b border-r border-slate-200 text-xs text-amber-800 align-top">
                        {content}
                      </td>
                    );
                 })}
              </tr>
            ))}

            {Object.entries(groupedRows).map(([category, catRows]: [string, PhaseData[]]) => (
              <React.Fragment key={category}>
                {/* Category Header Row (Optional, if we want to visually separate ONKO from others later) */}
                {/* 
                <tr className="bg-slate-100">
                  <td colSpan={headers.length + 1} className="p-2 font-bold text-slate-700 border-b border-slate-200 sticky left-0">
                    {category}
                  </td>
                </tr> 
                */}

                {catRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 border-b border-r border-slate-200 bg-white sticky left-0 z-10 min-w-[250px] max-w-[300px]">
                      <div className="font-bold text-slate-800">{row.category}</div>
                      <div className="text-slate-500 text-xs mt-1">{row.subCategory}</div>
                    </td>
                    {headers.map((header, idx) => {
                      const content = row.phases[idx] || "";
                      const status = getCellStatus(content);
                      const colorClass = getStatusColor(status);
                      const isEmpty = !content.trim();

                      return (
                        <td 
                          key={idx} 
                          className={`border-b border-r border-slate-200 p-1 align-top h-[120px] max-w-[250px] relative group transition-all duration-200`}
                        >
                          {!isEmpty ? (
                            <div 
                              onClick={() => setSelectedCell({ title: `${row.category} - ${row.subCategory}`, phase: header || `Fáze ${idx}`, content, status })}
                              className={`w-full h-full p-3 rounded-lg border text-xs leading-relaxed overflow-hidden cursor-pointer ${colorClass} shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
                            >
                              <div className="line-clamp-5 whitespace-pre-wrap font-medium">
                                {content}
                              </div>
                              <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize2 size={14} className="text-current opacity-70" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full bg-slate-50/50"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className={`p-6 border-b flex justify-between items-start ${getStatusColor(selectedCell.status).split(' ')[0]}`}>
              <div>
                 <h3 className="text-lg font-bold text-slate-900">{selectedCell.title}</h3>
                 <p className="text-sm opacity-80 font-medium uppercase tracking-wide mt-1">
                   {selectedCell.phase}
                 </p>
              </div>
              <button 
                onClick={() => setSelectedCell(null)}
                className="p-1 hover:bg-black/10 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-800" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto">
              <p className="text-base leading-7 text-slate-700 whitespace-pre-wrap">
                {selectedCell.content}
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button 
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};