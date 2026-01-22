
import React from 'react';
import { CellData } from '../types';

interface CellProps {
  data: CellData;
  row: number;
  col: number;
  isSelected: boolean;
  onSelect: (r: number, c: number) => void;
  isWinning: boolean;
}

const Cell: React.FC<CellProps> = ({ data, row, col, isSelected, onSelect, isWinning }) => {
  const borderClasses = `
    border-slate-200
    ${row === 1 ? 'border-b-[3px] border-b-indigo-200' : 'border-b'}
    ${col === 1 ? 'border-r-[3px] border-r-indigo-200' : 'border-r'}
    ${row === 3 ? 'border-b-0' : ''}
    ${col === 3 ? 'border-r-0' : ''}
  `;

  const bgClasses = isWinning 
    ? 'bg-green-50 winning-cell text-green-600'
    : isSelected 
      ? 'bg-indigo-600 text-white shadow-inner scale-105 z-10' 
      : data.isFixed 
        ? 'bg-slate-50/50 text-slate-800' 
        : 'bg-white text-indigo-600';

  const textClasses = !isSelected && data.isError 
    ? 'text-red-500 font-black animate-shake' 
    : data.isFixed 
      ? 'font-bold' 
      : 'font-medium';

  return (
    <div
      onClick={() => onSelect(row, col)}
      className={`
        relative w-16 h-16 sm:w-20 sm:h-20 
        flex items-center justify-center 
        text-2xl sm:text-3xl 
        cursor-pointer transition-all duration-150
        ${borderClasses}
        ${bgClasses}
        ${textClasses}
        hover:opacity-90
      `}
    >
      {data.value || ''}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-indigo-400 opacity-20 pointer-events-none"></div>
      )}
    </div>
  );
};

export default Cell;
