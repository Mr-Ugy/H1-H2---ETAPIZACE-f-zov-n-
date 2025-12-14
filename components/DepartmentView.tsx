import React, { useState, useEffect } from 'react';
import { PhaseData, CellStatus } from '../types';
import { getCellStatus, getStatusColor, getStatusLabel } from '../utils/csvHelper';
import { 
  Info, Map, X, Calendar, ArrowRight, AlertTriangle, 
  CheckCircle2, Building, ChevronLeft, Move, CalendarClock, 
  Link2, FileText, RefreshCw, Download, Paperclip 
} from 'lucide-react';

interface DepartmentViewProps {
  data: PhaseData;
  headers: string[];
  notes: PhaseData[];
  onBack: () => void;
}

type VisualMode = 'plan' | 'updates' | 'attachments';

export const DepartmentView: React.FC<DepartmentViewProps> = ({ data, headers, notes, onBack }) => {
  const [selectedPhase, setSelectedPhase] = useState<{ index: number; content: string; status: CellStatus; header: string } | null>(null);
  const [visualMode, setVisualMode] = useState<VisualMode>('plan');

  // Reset visual mode when phase changes
  useEffect(() => {
    if (selectedPhase) setVisualMode('plan');
  }, [selectedPhase]);

  // Helper to get global note for a phase
  const getGlobalNote = (index: number) => {
    return notes.map(n => n.phases[index]).filter(Boolean).join('\n');
  };

  return (
    <div className="flex flex-col h-full animate-fade-in-up space-y-8 pb-12">
      
      {/* Immersive Header */}
      <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
        <div className="bg-slate-900 rounded-[1.25rem] px-6 py-8 md:px-10 md:py-10 text-white relative overflow-hidden">
            {/* Abstract bg */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <button 
              onClick={onBack}
              className="group flex items-center gap-2 text-indigo-300 hover:text-white mb-6 transition-colors w-fit"
            >
              <div className="p-1 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                <ChevronLeft size={16} />
              </div>
              <span className="text-sm font-medium tracking-wide">Zpět na výběr</span>
            </button>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-3">
                    <Building size={12} />
                    {data.category}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                    {data.subCategory}
                  </h1>
                  <p className="text-slate-400 max-w-2xl text-lg font-light">
                    Interaktivní přehled stavebních fází, omezení provozu a dočasných úprav.
                  </p>
                </div>
                
                <div className="hidden lg:block text-right">
                   <div className="text-sm text-slate-400 mb-1">Celkem fází</div>
                   <div className="text-3xl font-bold text-white font-mono">{headers.length}</div>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="relative max-w-5xl mx-auto px-4 md:px-0">
        
        {/* Continuous Vertical Line */}
        <div className="absolute left-8 md:left-[3.25rem] top-8 bottom-8 w-0.5 bg-gradient-to-b from-indigo-100 via-slate-200 to-slate-100 hidden sm:block" />

        <div className="space-y-8 md:space-y-12 relative">
          {headers.map((header, idx) => {
            const content = data.phases[idx] || "";
            const status = getCellStatus(content);
            const colorClass = getStatusColor(status);
            const isEmpty = !content.trim();
            
            // Base colors for the timeline node
            let nodeColor = "bg-slate-100 text-slate-400 border-slate-200";
            if (status === CellStatus.OK) nodeColor = "bg-emerald-100 text-emerald-600 border-emerald-200";
            if (status === CellStatus.RESTRICTION) nodeColor = "bg-rose-100 text-rose-600 border-rose-200";
            if (status === CellStatus.CONSTRUCTION) nodeColor = "bg-blue-100 text-blue-600 border-blue-200";
            if (status === CellStatus.MOVING) nodeColor = "bg-amber-100 text-amber-600 border-amber-200";

            return (
              <div key={idx} className="relative sm:pl-28 group">
                
                {/* Timeline Node (Hidden on very small screens, shown on sm+) */}
                <div className={nodeColor + " hidden sm:flex absolute left-8 md:left-[3.25rem] top-6 w-12 h-12 rounded-full border-4 border-white shadow-md items-center justify-center z-10 -translate-x-1/2 transition-transform duration-300 group-hover:scale-110"}>
                    {status === CellStatus.OK && <CheckCircle2 size={20} />}
                    {status === CellStatus.RESTRICTION && <AlertTriangle size={20} />}
                    {status === CellStatus.CONSTRUCTION && <Calendar size={20} />}
                    {status === CellStatus.MOVING && <Move size={20} />}
                    {(status === CellStatus.EMPTY || status === CellStatus.UNKNOWN) && <div className="w-2 h-2 rounded-full bg-slate-400" />}
                </div>

                {/* Timeline Content Card */}
                <div 
                   onClick={() => !isEmpty && setSelectedPhase({ index: idx, content, status, header })}
                   className={`
                    relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden
                    ${!isEmpty 
                      ? `${colorClass.split(' ')[2]} cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300` 
                      : 'border-slate-100 bg-slate-50/50 opacity-60 grayscale cursor-not-allowed'}
                   `}
                >
                  {/* Decorative Arrow pointing to node */}
                  <div className="hidden sm:block absolute top-9 -left-2 w-4 h-4 bg-white border-b border-l border-inherit transform rotate-45 z-20"></div>

                  <div className="flex flex-col md:flex-row">
                     {/* Phase Info Sidebar */}
                     <div className={`p-4 md:p-6 md:w-48 flex-shrink-0 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-2 border-b md:border-b-0 md:border-r border-slate-100 ${isEmpty ? 'bg-transparent' : 'bg-slate-50/50'}`}>
                        <div>
                           <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                             {header || `Fáze ${idx}`}
                           </span>
                           <span className={`text-sm font-bold ${colorClass.split(' ')[1]}`}>
                              {getStatusLabel(status)}
                           </span>
                        </div>
                        {/* Simluated Date for Timeline Context */}
                        {!isEmpty && (
                           <div className="md:mt-4 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-500">
                             <CalendarClock size={12} />
                             <span>Q{((idx % 4) + 1)} 2024</span>
                           </div>
                        )}
                     </div>

                     {/* Content Body */}
                     <div className="p-6 flex-1">
                        <p className={`text-base leading-relaxed ${isEmpty ? 'text-slate-300 italic' : 'text-slate-600'}`}>
                           {isEmpty ? 'Žádná data pro tuto fázi' : content}
                        </p>

                        {!isEmpty && (
                           <div className="mt-4 flex items-center justify-end gap-2 text-indigo-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                              <span>Detail a plánek</span>
                              <ArrowRight size={16} />
                           </div>
                        )}
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPhase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl animate-fade-in-up" style={{animationDuration: '0.2s'}}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col ring-1 ring-white/20">
            
            {/* Modal Header */}
            <div className={`px-8 py-6 border-b flex justify-between items-center bg-white z-10`}>
              <div>
                 <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      {selectedPhase.header || `Fáze ${selectedPhase.index}`}
                    </span>
                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getStatusColor(selectedPhase.status).split(' hover')[0]}`}>
                      {getStatusLabel(selectedPhase.status)}
                    </span>
                 </div>
                 <h3 className="text-2xl md:text-3xl font-bold text-slate-900">{data.subCategory}</h3>
              </div>
              <button 
                onClick={() => setSelectedPhase(null)}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-700" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col lg:flex-row h-full min-h-[500px]">
                
                {/* Left: Text & Info */}
                <div className="w-full lg:w-2/5 p-8 lg:p-10 space-y-8 bg-white overflow-y-auto">
                  
                  {/* 1. Description */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-indigo-600 border-b border-indigo-100 pb-4">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <Info size={24} />
                      </div>
                      <h4 className="text-xl font-bold text-slate-900">
                        Popis omezení
                      </h4>
                    </div>
                    <div className="prose prose-slate prose-lg">
                       <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                        {selectedPhase.content}
                       </p>
                    </div>
                  </div>

                  {/* 2. Key Dates (Rozhodné termíny) */}
                  <div className="space-y-4">
                    <h5 className="flex items-center gap-2 font-bold text-slate-800 text-sm uppercase tracking-wider">
                        <CalendarClock size={16} className="text-indigo-500" />
                        Rozhodné termíny
                    </h5>
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200 border-dashed">
                            <span className="text-sm text-slate-500">Zahájení fáze</span>
                            <span className="text-sm font-semibold text-slate-900">TBD (Q{((selectedPhase.index % 4) + 1)} 2024)</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Ukončení fáze</span>
                            <span className="text-sm font-semibold text-slate-900">TBD (Q{((selectedPhase.index % 4) + 2)} 2024)</span>
                        </div>
                    </div>
                  </div>

                  {/* 3. Dependencies (Souvislosti) */}
                  <div className="space-y-4">
                    <h5 className="flex items-center gap-2 font-bold text-slate-800 text-sm uppercase tracking-wider">
                        <Link2 size={16} className="text-indigo-500" />
                        Souvislosti - Podmíněné akce
                    </h5>
                    <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-5 space-y-3">
                        <div className="flex gap-3">
                             <div className="mt-0.5 min-w-[6px] h-[6px] rounded-full bg-indigo-400"></div>
                             <p className="text-sm text-indigo-900 leading-snug">
                                <span className="font-semibold block mb-0.5">Podmínka zahájení:</span>
                                {selectedPhase.index > 0 
                                  ? `Dokončení stavebních úprav ve Fázi ${selectedPhase.index - 1} a schválení kolaudace.` 
                                  : 'Podpis předávacího protokolu staveniště.'}
                             </p>
                        </div>
                        <div className="flex gap-3">
                             <div className="mt-0.5 min-w-[6px] h-[6px] rounded-full bg-indigo-400"></div>
                             <p className="text-sm text-indigo-900 leading-snug">
                                <span className="font-semibold block mb-0.5">Navazující kroky:</span>
                                Uvolnění prostor pro navazující technologie v dalším sektoru.
                             </p>
                        </div>
                    </div>
                  </div>

                  {/* 4. Global Notes Alert */}
                  {getGlobalNote(selectedPhase.index) && (
                    <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100/50 shadow-sm relative overflow-hidden mt-6">
                       <div className="relative z-10">
                         <h5 className="font-bold text-amber-800 text-sm uppercase tracking-wide flex items-center gap-2 mb-2">
                           <AlertTriangle size={16} />
                           Upozornění stavby
                         </h5>
                         <p className="text-amber-900/80 text-sm leading-relaxed">
                           {getGlobalNote(selectedPhase.index)}
                         </p>
                       </div>
                    </div>
                  )}
                </div>

                {/* Right: Visual/Map Area with Tabs */}
                <div className="w-full lg:w-3/5 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col">
                  
                  {/* Tab Navigation */}
                  <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto">
                    <button
                        onClick={() => setVisualMode('plan')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap
                            ${visualMode === 'plan' 
                                ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                    >
                        <Map size={16} />
                        Půdorys
                    </button>
                    <button
                        onClick={() => setVisualMode('updates')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap
                            ${visualMode === 'updates' 
                                ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                    >
                        <RefreshCw size={16} />
                        Aktualizace
                    </button>
                    <button
                        onClick={() => setVisualMode('attachments')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap
                            ${visualMode === 'attachments' 
                                ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                    >
                        <Paperclip size={16} />
                        Přílohy
                    </button>
                  </div>

                  {/* Visual Content Area */}
                  <div className="flex-1 p-6 relative">
                    
                    {/* View: Floor Plan */}
                    {visualMode === 'plan' && (
                        <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative group animate-fade-in">
                            <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] bg-slate-50 flex items-center justify-center">
                                <img 
                                src={`https://placehold.co/1200x800/f1f5f9/94a3b8?text=Grafické+znázornění+%0A${data.category}+-+${data.subCategory}%0A(Fáze+${selectedPhase.index})&font=sans`} 
                                alt="Půdorys" 
                                className="w-full h-full object-contain p-4"
                                />
                            </div>
                            <div className="absolute bottom-4 right-4">
                                <button className="bg-white/90 backdrop-blur shadow-sm border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white transition-colors">
                                    Zvětšit náhled
                                </button>
                            </div>
                        </div>
                    )}

                    {/* View: Updates */}
                    {visualMode === 'updates' && (
                        <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-y-auto animate-fade-in">
                            <h4 className="text-lg font-bold text-slate-800 mb-6">Deník změn a aktualizací</h4>
                            <div className="relative border-l-2 border-slate-100 pl-6 space-y-8">
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-white"></div>
                                    <span className="text-xs font-semibold text-indigo-600 mb-1 block">Dnes, 09:30</span>
                                    <p className="text-sm text-slate-800 font-medium">Aktualizace harmonogramu</p>
                                    <p className="text-xs text-slate-500 mt-1">Potvrzen termín zahájení prací na VZT.</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-200 ring-4 ring-white"></div>
                                    <span className="text-xs font-semibold text-slate-400 mb-1 block">Před 2 dny</span>
                                    <p className="text-sm text-slate-800 font-medium">Nahrána nová verze půdorysu</p>
                                    <p className="text-xs text-slate-500 mt-1">Verze v2.4 (Revize B)</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-200 ring-4 ring-white"></div>
                                    <span className="text-xs font-semibold text-slate-400 mb-1 block">15. 2. 2024</span>
                                    <p className="text-sm text-slate-800 font-medium">Vytvoření záznamu</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View: Attachments */}
                    {visualMode === 'attachments' && (
                        <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-y-auto animate-fade-in">
                            <h4 className="text-lg font-bold text-slate-800 mb-6">Dokumentace ke stažení</h4>
                            <div className="space-y-3">
                                {[
                                    { name: 'Technická zpráva - Fáze ' + selectedPhase.index, size: '2.4 MB', type: 'PDF' },
                                    { name: 'Harmonogram prací_v3', size: '1.1 MB', type: 'XLSX' },
                                    { name: 'Bezpečnostní pokyny BOZP', size: '850 KB', type: 'PDF' },
                                ].map((file, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-900">{file.name}</p>
                                                <p className="text-xs text-slate-400">{file.type} • {file.size}</p>
                                            </div>
                                        </div>
                                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                            <Download size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                  </div>
                  
                  {visualMode === 'plan' && (
                    <div className="px-6 pb-6 text-center">
                        <p className="text-xs text-slate-400 font-medium">
                        * Grafická dokumentace je pouze ilustrativní.
                        </p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};