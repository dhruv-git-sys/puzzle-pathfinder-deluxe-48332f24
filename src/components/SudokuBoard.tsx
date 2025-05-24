
import React from 'react';
import { cn } from '@/lib/utils';

interface SudokuBoardProps {
  board: number[][];
  currentState: any;
  violations: Set<string>;
  isAnimating: boolean;
  onCellClick?: (row: number, col: number) => void;
  userMoves?: number;
  isInteractive?: boolean;
}

export const SudokuBoard: React.FC<SudokuBoardProps> = ({
  board,
  currentState,
  violations,
  isAnimating,
  onCellClick,
  isInteractive = false
}) => {
  const renderCell = (value: number, row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    const isViolation = violations.has(cellKey);
    const isCurrent = currentState?.row === row && currentState?.col === col;
    const isEmpty = value === 0;
    const isEditable = isInteractive && isEmpty;

    return (
      <div
        key={cellKey}
        className={cn(
          "aspect-square flex items-center justify-center text-lg font-bold border border-slate-600 transition-all duration-300",
          {
            "bg-slate-700": isEmpty && !isCurrent,
            "bg-gradient-to-br from-blue-500 to-cyan-500 text-white animate-pulse": isCurrent && isAnimating,
            "bg-gradient-to-br from-red-500 to-pink-500 text-white": isViolation,
            "bg-gradient-to-br from-green-500 to-emerald-500 text-white": !isEmpty && !isViolation && !isCurrent,
            "border-r-2 border-slate-400": (col + 1) % 3 === 0 && col !== 8,
            "border-b-2 border-slate-400": (row + 1) % 3 === 0 && row !== 8,
            "scale-110 shadow-lg": isCurrent && isAnimating,
            "cursor-pointer hover:bg-slate-600": isEditable,
            "ring-2 ring-blue-400 ring-opacity-50": isEditable
          }
        )}
        onClick={() => onCellClick && onCellClick(row, col)}
      >
        {value !== 0 && value}
        {isEditable && (
          <div className="text-slate-400 text-sm">?</div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-9 gap-0 max-w-md mx-auto bg-slate-800 p-4 rounded-lg border border-slate-600">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
      )}
    </div>
  );
};
