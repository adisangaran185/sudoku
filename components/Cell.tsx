
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
  // Determine border styles for 2x2 subgrids
  const borderClasses = `
    border-gray-300
    ${row === 1 ? 'border-b-4 border-b-indigo-400' : 'border-b'}
    ${col === 1 ? 'border-r-4 border-r-indigo-400' : 'border-r'}
    ${row === 3 ? 'border-b-0' : ''}
    ${col === 3 ? 'border-r-0' : ''}
  `;

  const bgClasses = isWinning 
    ? 'bg-green-100'
    : isSelected 
      ? 'bg-indigo-100' 
      : data.isFixed 
        ? 'bg-gray-50' 
        : 'bg-white';

  const textClasses = data.isError 
    ? 'text-red-600 font-bold' 
    : data.isFixed 
      ? 'text-gray-800 font-semibold' 
      : 'text-indigo-600 font-medium';

  return (
    <div
      onClick={() => onSelect(row, col)}
      className={`
        w-16 h-16 sm:w-20 sm:h-20 
        flex items-center justify-center 
        text-2xl sm:text-3xl 
        cursor-pointer transition-all duration-200
        ${borderClasses}
        ${bgClasses}
        ${textClasses}
        hover:bg-indigo-50
      `}
    >
      {data.value || ''}
    </div>
  );
};

export default Cell;
