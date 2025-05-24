
export const isValidSudoku = (board: number[][], row: number, col: number, num: number): boolean => {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
  }

  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) return false;
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = boxRow; i < boxRow + 3; i++) {
    for (let j = boxCol; j < boxCol + 3; j++) {
      if (board[i][j] === num) return false;
    }
  }

  return true;
};

export const isValidNQueens = (board: number[][], row: number, col: number): boolean => {
  const size = board.length;

  for (let i = 0; i < row; i++) {
    if (board[i][col] === 1) return false;
  }

  for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
    if (board[i][j] === 1) return false;
  }

  for (let i = row - 1, j = col + 1; i >= 0 && j < size; i--, j++) {
    if (board[i][j] === 1) return false;
  }

  return true;
};

export const isValidKnightMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);
  return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
};

export const checkSudokuSolved = (board: number[][]): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) return false;
      
      const num = board[row][col];
      board[row][col] = 0;
      const isValid = isValidSudoku(board, row, col, num);
      board[row][col] = num;
      
      if (!isValid) return false;
    }
  }
  return true;
};

export const checkNQueensSolved = (board: number[][]): boolean => {
  const size = board.length;
  let queensCount = 0;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === 1) {
        queensCount++;
        if (!isValidNQueens(board, row, col)) return false;
      }
    }
  }
  
  return queensCount === size;
};

export const checkKnightsTourSolved = (board: number[][]): boolean => {
  const size = board.length;
  const totalCells = size * size;
  
  for (let i = 1; i <= totalCells; i++) {
    let found = false;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === i) {
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (!found) return false;
  }
  
  return true;
};

export const calculateProgress = (board: number[][], puzzleType: string): number => {
  if (puzzleType === 'sudoku') {
    let filled = 0;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] !== 0) filled++;
      }
    }
    return (filled / 81) * 100;
  } else if (puzzleType === 'nqueens') {
    const size = board.length;
    let queens = 0;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === 1) queens++;
      }
    }
    return (queens / size) * 100;
  } else if (puzzleType === 'knights') {
    const size = board.length;
    let moves = 0;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] > 0) moves++;
      }
    }
    return (moves / (size * size)) * 100;
  }
  return 0;
};
