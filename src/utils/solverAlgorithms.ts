
import { isValidSudoku, isValidNQueens } from './puzzleValidators';
import { solveKnightsTour } from './knightsTourSolver';

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
            isValid: isValidSudoku(board, row, col, num),
            depth: row
          });

          if (isValidSudoku(board, row, col, num)) {
            board[row][col] = num;
            steps.push({
              row,
              col,
              value: num,
              action: 'place',
              isValid: true,
              depth: row
            });

            if (solveSudokuDFS(board, steps)) return true;

            board[row][col] = 0;
            steps.push({
              row,
              col,
              value: 0,
              action: 'backtrack',
              isBacktracking: true,
              depth: row
            });
          } else {
            steps.push({
              row,
              col,
              value: num,
              action: 'reject',
              isValid: false,
              depth: row
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
      isValid: isValidNQueens(board, row, col),
      depth: row
    });

    if (isValidNQueens(board, row, col)) {
      board[row][col] = 1;
      steps.push({
        row,
        col,
        action: 'place',
        isValid: true,
        depth: row
      });

      if (solveNQueensDFS(board, row + 1, steps)) return true;

      board[row][col] = 0;
      steps.push({
        row,
        col,
        action: 'backtrack',
        isBacktracking: true,
        depth: row,
        backtrackFrom: row + 1
      });
    } else {
      steps.push({
        row,
        col,
        action: 'reject',
        isValid: false,
        depth: row
      });
    }
  }
  
  if (row > 0) {
    steps.push({
      row: row - 1,
      col: -1,
      action: 'backtrack_row',
      isBacktracking: true,
      depth: row - 1,
      backtrackFrom: row
    });
  }
  
  return false;
};

export const solveKnightsTourDFS = (board: number[][], move: number, steps: any[]): boolean => {
  // Use the improved Knight's Tour solver
  return solveKnightsTour(board, 0, 0, steps);
};
