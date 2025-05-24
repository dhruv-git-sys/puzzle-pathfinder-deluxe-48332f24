
import React from 'react';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

interface NQueensBoardProps {
  board: number[][];
  currentState: any;
  violations: Set<string>;
  isAnimating: boolean;
}

export const NQueensBoard: React.FC<NQueensBoardProps> = ({
  board,
  currentState,
  violations,
  isAnimating
}) => {
  const size = board.length;

  const renderCell = (value: number, row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    const isViolation = violations.has(cellKey);
    const isCurrent = currentState?.row === row && currentState?.col === col;
    const hasQueen = value === 1;
    const isEvenSquare = (row + col) % 2 === 0;

    return (
      <div
        key={cellKey}
        className={cn(
          "aspect-square flex items-center justify-center transition-all duration-300 border border-slate-600",
          {
            "bg-slate-200": isEvenSquare && !isCurrent && !isViolation,
            "bg-slate-300": !isEvenSquare && !isCurrent && !isViolation,
            "bg-gradient-to-br from-blue-500 to-cyan-500 animate-pulse": isCurrent && isAnimating,
            "bg-gradient-to-br from-red-500 to-pink-500": isViolation,
            "scale-110 shadow-lg": (isCurrent && isAnimating) || hasQueen
          }
        )}
      >
        {hasQueen && (
          <Crown 
            className={cn(
              "w-6 h-6 transition-all duration-300",
              {
                "text-yellow-600": !isViolation,
                "text-white": isViolation,
                "animate-bounce": isCurrent && isAnimating
              }
            )} 
          />
        )}
      </div>
    );
  };

  return (
    <div 
      className="grid gap-0 max-w-md mx-auto bg-slate-800 p-4 rounded-lg border border-slate-600"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
      )}
    </div>
  );
};
