
import React from 'react';
import { cn } from '@/lib/utils';
import { Crown, X, ArrowLeft } from 'lucide-react';

interface NQueensBoardProps {
  board: number[][];
  currentState: any;
  violations: Set<string>;
  isAnimating: boolean;
  onCellClick?: (row: number, col: number) => void;
  userMoves?: number;
  isInteractive?: boolean;
}

export const NQueensBoard: React.FC<NQueensBoardProps> = ({
  board,
  currentState,
  violations,
  isAnimating,
  onCellClick,
  isInteractive = false
}) => {
  const size = board.length;

  const renderCell = (value: number, row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    const isViolation = violations.has(cellKey);
    const isCurrent = currentState?.row === row && currentState?.col === col;
    const hasQueen = value === 1;
    const isEvenSquare = (row + col) % 2 === 0;
    
    // Check if this is a backtracking step
    const isBacktracking = currentState?.isBacktracking && isCurrent;
    const isRejected = currentState?.action === 'reject' && isCurrent;
    const isTrying = currentState?.action === 'try' && isCurrent;

    return (
      <div
        key={cellKey}
        className={cn(
          "aspect-square flex items-center justify-center transition-all duration-500 border border-slate-600 relative",
          {
            "bg-slate-200": isEvenSquare && !isCurrent && !isViolation,
            "bg-slate-300": !isEvenSquare && !isCurrent && !isViolation,
            "bg-gradient-to-br from-blue-500 to-cyan-500 animate-pulse": isTrying && isAnimating,
            "bg-gradient-to-br from-red-500 to-pink-500 animate-pulse": isRejected && isAnimating,
            "bg-gradient-to-br from-yellow-500 to-orange-500 animate-pulse": isBacktracking && isAnimating,
            "bg-gradient-to-br from-red-500 to-pink-500": isViolation,
            "scale-110 shadow-lg": (isCurrent && isAnimating) || hasQueen,
            "cursor-pointer hover:bg-slate-400": isInteractive,
            "ring-2 ring-blue-400 ring-opacity-50": isInteractive && !hasQueen
          }
        )}
        onClick={() => onCellClick && onCellClick(row, col)}
      >
        {hasQueen && (
          <Crown 
            className={cn(
              "w-6 h-6 transition-all duration-300",
              {
                "text-yellow-600": !isViolation,
                "text-white": isViolation,
                "animate-bounce": isCurrent && isAnimating && !isBacktracking
              }
            )} 
          />
        )}
        
        {/* Show rejection indicator */}
        {isRejected && isAnimating && (
          <X className="w-6 h-6 text-white animate-pulse" />
        )}
        
        {/* Show backtracking indicator */}
        {isBacktracking && isAnimating && (
          <ArrowLeft className="w-6 h-6 text-white animate-pulse" />
        )}
        
        {/* Show trying indicator */}
        {isTrying && isAnimating && !hasQueen && (
          <div className="w-4 h-4 bg-white rounded-full animate-pulse opacity-70" />
        )}
        
        {/* Depth indicator for algorithm visualization */}
        {currentState?.depth !== undefined && isCurrent && isAnimating && (
          <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {currentState.depth}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div 
        className="grid gap-0 max-w-md mx-auto bg-slate-800 p-4 rounded-lg border border-slate-600"
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))
        )}
      </div>
      
      {/* Algorithm state indicator */}
      {currentState && isAnimating && (
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm">
            {currentState.action === 'try' && (
              <div className="flex items-center gap-2 text-blue-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span>Trying position ({currentState.row + 1}, {currentState.col + 1}) at depth {currentState.depth}</span>
              </div>
            )}
            {currentState.action === 'place' && (
              <div className="flex items-center gap-2 text-green-400">
                <Crown className="w-4 h-4" />
                <span>Placed queen at ({currentState.row + 1}, {currentState.col + 1})</span>
              </div>
            )}
            {currentState.action === 'reject' && (
              <div className="flex items-center gap-2 text-red-400">
                <X className="w-4 h-4" />
                <span>Rejected position ({currentState.row + 1}, {currentState.col + 1}) - conflicts detected</span>
              </div>
            )}
            {currentState.action === 'backtrack' && (
              <div className="flex items-center gap-2 text-yellow-400">
                <ArrowLeft className="w-4 h-4" />
                <span>Backtracking from ({currentState.row + 1}, {currentState.col + 1})</span>
              </div>
            )}
            {currentState.action === 'backtrack_row' && (
              <div className="flex items-center gap-2 text-orange-400">
                <ArrowLeft className="w-4 h-4" />
                <span>Backtracking to row {currentState.depth + 1} - no valid positions found</span>
              </div>
            )}
          </div>
          
          {/* Visual legend */}
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded"></div>
              <span>Trying</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gradient-to-br from-red-500 to-pink-500 rounded"></div>
              <span>Rejected</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded"></div>
              <span>Backtracking</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
