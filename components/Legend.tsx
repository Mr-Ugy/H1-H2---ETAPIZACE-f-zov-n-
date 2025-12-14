import React from 'react';
import { CellStatus } from '../types';
import { getStatusColor, getStatusLabel } from '../utils/csvHelper';

export const Legend: React.FC = () => {
  const statuses = [
    CellStatus.OK,
    CellStatus.CONSTRUCTION,
    CellStatus.MOVING,
    CellStatus.RESTRICTION,
    CellStatus.EMPTY
  ];

  return (
    <div className="flex flex-wrap gap-3 items-center bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">Legenda:</span>
      {statuses.map((status) => (
        <div key={status} className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full border ${getStatusColor(status).split(' hover')[0]}`}></div>
          <span className="text-xs font-medium text-slate-600">{getStatusLabel(status)}</span>
        </div>
      ))}
    </div>
  );
};
