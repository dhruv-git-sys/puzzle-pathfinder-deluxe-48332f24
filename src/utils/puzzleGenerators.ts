
export const generateRandomSudoku = (difficulty: string): number[][] => {
  // Start with a complete valid grid
  const grid = Array(9).fill(null).map(() => Array(9).fill(0));
  
  // Fill the grid using a simple pattern
  const fillGrid = (grid: number[][]): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          // Shuffle numbers for randomness
          for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
          }
          
          for (const num of numbers) {
            if (isValidSudoku(grid, row, col, num)) {
              grid[row][col] = num;
              if (fillGrid(grid)) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  fillGrid(grid);
  
  // Remove numbers based on difficulty
  const cellsToRemove = difficulty === 'easy' ? 40 : difficulty === 'medium' ? 50 : 60;
  const positions = [];
  for (let i = 0; i < 81; i++) {
    positions.push(i);
  }
  
  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  
  // Remove numbers
  for (let i = 0; i < cellsToRemove && i < positions.length; i++) {
    const pos = positions[i];
    const row = Math.floor(pos / 9);
    const col = pos % 9;
    grid[row][col] = 0;
  }
  
  return grid;
};

export const generateSudokuPuzzle = (difficulty: string): number[][] => {
  return generateRandomSudoku(difficulty);
};

export const generateNQueensPuzzle = (size: number): number[][] => {
  return Array(size).fill(null).map(() => Array(size).fill(0));
};

export const generateKnightsTourPuzzle = (size: number): number[][] => {
  const board = Array(size).fill(null).map(() => Array(size).fill(0));
  board[0][0] = 1;
  return board;
};

// Import validation function
const isValidSudoku = (board: number[][], row: number, col: number, num: number): boolean => {
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
