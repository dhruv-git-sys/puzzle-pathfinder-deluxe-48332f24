
import { isValidSudoku, isValidNQueens } from './puzzleValidators';

export const solveSudokuDFS = (board: number[][], steps: any[]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          steps.push({
            row,
            col,
            value: num,
            action: 'try',
            isValid: isValidSudoku(board, row, col, num)
          });

          if (isValidSudoku(board, row, col, num)) {
            board[row][col] = num;
            steps.push({
              row,
              col,
              value: num,
              action: 'place',
              isValid: true
            });

            if (solveSudokuDFS(board, steps)) return true;

            board[row][col] = 0;
            steps.push({
              row,
              col,
              value: 0,
              action: 'backtrack',
              isBacktracking: true
            });
          }
        }
        return false;
      }
    }
  }
  return true;
};

export const solveNQueensDFS = (board: number[][], row: number, steps: any[]): boolean => {
  const size = board.length;
  
  if (row === size) return true;

  for (let col = 0; col < size; col++) {
    steps.push({
      row,
      col,
      action: 'try',
      isValid: isValidNQueens(board, row, col)
    });

    if (isValidNQueens(board, row, col)) {
      board[row][col] = 1;
      steps.push({
        row,
        col,
        action: 'place',
        isValid: true
      });

      if (solveNQueensDFS(board, row + 1, steps)) return true;

      board[row][col] = 0;
      steps.push({
        row,
        col,
        action: 'backtrack',
        isBacktracking: true
      });
    }
  }
  return false;
};

export const solveKnightsTourDFS = (board: number[][], move: number, steps: any[]): boolean => {
  const size = board.length;
  if (move === size * size + 1) return true;

  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];

  // Find current knight position
  let currentRow = -1, currentCol = -1;
  
  // For the first move, start from position with value 1
  if (move === 2) {
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === 1) {
          currentRow = row;
          currentCol = col;
          break;
        }
      }
      if (currentRow !== -1) break;
    }
  } else {
    // Find the position with the current move number - 1
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === move - 1) {
          currentRow = row;
          currentCol = col;
          break;
        }
      }
      if (currentRow !== -1) break;
    }
  }

  if (currentRow === -1 || currentCol === -1) return false;

  for (const [dr, dc] of knightMoves) {
    const newRow = currentRow + dr;
    const newCol = currentCol + dc;

    if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size && board[newRow][newCol] === 0) {
      steps.push({
        row: newRow,
        col: newCol,
        value: move,
        action: 'try',
        isValid: true
      });

      board[newRow][newCol] = move;
      steps.push({
        row: newRow,
        col: newCol,
        value: move,
        action: 'place',
        isValid: true
      });

      if (solveKnightsTourDFS(board, move + 1, steps)) return true;

      board[newRow][newCol] = 0;
      steps.push({
        row: newRow,
        col: newCol,
        value: 0,
        action: 'backtrack',
        isBacktracking: true
      });
    }
  }
  return false;
};
