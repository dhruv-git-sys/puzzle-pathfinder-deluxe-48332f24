
import React from 'react';
import { cn } from '@/lib/utils';
import { Horse } from 'lucide-react';

interface KnightsTourBoardProps {
  board: number[][];
  currentState: any;
  violations: Set<string>;
  isAnimating: boolean;
  onCellClick?: (row: number, col: number) => void;
  userMoves?: number;
  isInteractive?: boolean;
}

export const KnightsTourBoard: React.FC<KnightsTourBoardProps> = ({
  board,
  currentState,
  violations,
  isAnimating,
  onCellClick,
  userMoves = 0,
  isInteractive = false
}) => {
  const size = board.length;

  const findKnight = () => {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === userMoves || (board[row][col] > 0 && !isInteractive)) {
          return { row, col };
        }
      }
    }
    return null;
  };

  const knightPosition = findKnight();

  const isValidKnightMove = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  };

  const canMoveToCell = (row: number, col: number) => {
    if (!isInteractive || !knightPosition) return false;
    return isValidKnightMove(knightPosition.row, knightPosition.col, row, col) && board[row][col] === 0;
  };

  const renderCell = (value: number, row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    const isViolation = violations.has(cellKey);
    const isCurrent = currentState?.row === row && currentState?.col === col;
    const hasKnight = (isInteractive && knightPosition?.row === row && knightPosition?.col === col) || 
                     (!isInteractive && value > 0);
    const isVisited = value > 0;
    const isEvenSquare = (row + col) % 2 === 0;
    const canMove = canMoveToCell(row, col);

    return (
      <div
        key={cellKey}
        className={cn(
          "aspect-square flex items-center justify-center transition-all duration-300 border border-slate-600 relative cursor-pointer text-xs font-bold",
          {
            "bg-amber-100": isEvenSquare && !isCurrent && !isViolation && !isVisited,
            "bg-amber-200": !isEvenSquare && !isCurrent && !isViolation && !isVisited,
            "bg-gradient-to-br from-blue-500 to-cyan-500 animate-pulse": isCurrent && isAnimating,
            "bg-gradient-to-br from-red-500 to-pink-500": isViolation,
            "bg-gradient-to-br from-green-500 to-emerald-500 text-white": isVisited && !hasKnight,
            "bg-gradient-to-br from-yellow-500 to-orange-500": hasKnight,
            "scale-110 shadow-lg": (isCurrent && isAnimating) || hasKnight,
            "ring-2 ring-blue-400 ring-opacity-50": canMove,
            "hover:bg-blue-300": canMove && isInteractive,
            "text-slate-800": !isVisited && !hasKnight && !isCurrent,
            "text-white": isVisited || hasKnight || isCurrent
          }
        )}
        onClick={() => onCellClick && onCellClick(row, col)}
      >
        {hasKnight && (
          <Horse 
            className={cn(
              "w-4 h-4 md:w-6 md:h-6 transition-all duration-300",
              {
                "text-white": !isViolation,
                "text-red-100": isViolation,
                "animate-bounce": isCurrent && isAnimating
              }
            )} 
          />
        )}
        {isVisited && !hasKnight && (
          <span className="text-xs font-bold">{value}</span>
        )}
        {canMove && (
          <div className="absolute inset-0 border-2 border-blue-400 border-dashed rounded animate-pulse" />
        )}
      </div>
    );
  };

  return (
    <div 
      className="grid gap-1 max-w-md mx-auto bg-slate-800 p-4 rounded-lg border border-slate-600"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
      )}
    </div>
  );
};
