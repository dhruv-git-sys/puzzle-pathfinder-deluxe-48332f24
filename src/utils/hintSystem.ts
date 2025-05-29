
import { isValidSudoku, isValidNQueens, isValidKnightMove } from './puzzleValidators';
import { solveSudokuDFS, solveNQueensDFS, solveKnightsTourDFS } from './solverAlgorithms';

export interface Hint {
  row: number;
  col: number;
  value: number;
  action: string;
  reason: string;
}

export const generateHint = (board: number[][], puzzleType: string): Hint | null => {
  console.log('Generating hint for:', puzzleType, 'Board:', board);
  
  if (puzzleType === 'sudoku') {
    return generateSudokuHint(board);
  } else if (puzzleType === 'nqueens') {
    return generateNQueensHint(board);
  } else if (puzzleType === 'knights') {
    return generateKnightsTourHint(board);
  }
  
  return null;
};

const generateSudokuHint = (board: number[][]): Hint | null => {
  // Create a copy and solve it
  const boardCopy = board.map(row => [...row]);
  const steps: any[] = [];
  
  if (solveSudokuDFS(boardCopy, steps)) {
    // Find the first empty cell that we can fill
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0 && boardCopy[row][col] !== 0) {
          return {
            row,
            col,
            value: boardCopy[row][col],
            action: 'place',
            reason: `This number completes the constraint requirements for this position`
          };
        }
      }
    }
  }
  
  return null;
};

const generateNQueensHint = (board: number[][]): Hint | null => {
  const size = board.length;
  
  // Find the first row without a queen
  for (let row = 0; row < size; row++) {
    let hasQueen = false;
    for (let col = 0; col < size; col++) {
      if (board[row][col] === 1) {
        hasQueen = true;
        break;
      }
    }
    
    if (!hasQueen) {
      // Find a valid position in this row
      for (let col = 0; col < size; col++) {
        if (board[row][col] === 0 && isValidNQueens(board, row, col)) {
          return {
            row,
            col,
            value: 1,
            action: 'place',
            reason: `Place a queen here - no conflicts with existing queens`
          };
        }
      }
    }
  }
  
  return null;
};

const generateKnightsTourHint = (board: number[][]): Hint | null => {
  const size = board.length;
  
  // Find the current knight position (highest number)
  let maxMove = 0;
  let knightRow = -1;
  let knightCol = -1;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] > maxMove) {
        maxMove = board[row][col];
        knightRow = row;
        knightCol = col;
      }
    }
  }
  
  if (knightRow === -1) return null;
  
  // Find valid next moves
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  
  for (const [dr, dc] of knightMoves) {
    const newRow = knightRow + dr;
    const newCol = knightCol + dc;
    
    if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size && board[newRow][newCol] === 0) {
      return {
        row: newRow,
        col: newCol,
        value: maxMove + 1,
        action: 'move',
        reason: `Valid knight move from (${knightRow + 1}, ${knightCol + 1})`
      };
    }
  }
  
  return null;
};
