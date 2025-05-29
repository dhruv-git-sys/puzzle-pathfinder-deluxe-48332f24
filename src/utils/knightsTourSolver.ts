
export const solveKnightsTour = (board: number[][], startRow: number = 0, startCol: number = 0, steps: any[] = []): boolean => {
  const size = board.length;
  const totalMoves = size * size;
  
  // Initialize the board
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      board[i][j] = 0;
    }
  }
  
  board[startRow][startCol] = 1;
  
  steps.push({
    row: startRow,
    col: startCol,
    value: 1,
    action: 'place',
    isValid: true
  });

  return solveKnightsTourRecursive(board, startRow, startCol, 2, steps, totalMoves);
};

const solveKnightsTourRecursive = (board: number[][], x: number, y: number, moveCount: number, steps: any[], totalMoves: number): boolean => {
  if (moveCount > totalMoves) return true;

  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];

  // Try all possible moves, ordered by Warnsdorff's rule for better performance
  const possibleMoves = [];
  
  for (const [dx, dy] of knightMoves) {
    const nextX = x + dx;
    const nextY = y + dy;
    
    if (isValidMove(board, nextX, nextY)) {
      const accessibility = getAccessibility(board, nextX, nextY);
      possibleMoves.push({ x: nextX, y: nextY, accessibility });
    }
  }
  
  // Sort by accessibility (Warnsdorff's rule: choose square with fewest onward moves)
  possibleMoves.sort((a, b) => a.accessibility - b.accessibility);

  for (const move of possibleMoves) {
    const { x: nextX, y: nextY } = move;
    
    steps.push({
      row: nextX,
      col: nextY,
      value: moveCount,
      action: 'try',
      isValid: true
    });

    board[nextX][nextY] = moveCount;
    
    steps.push({
      row: nextX,
      col: nextY,
      value: moveCount,
      action: 'place',
      isValid: true
    });

    if (solveKnightsTourRecursive(board, nextX, nextY, moveCount + 1, steps, totalMoves)) {
      return true;
    }

    // Backtrack
    board[nextX][nextY] = 0;
    steps.push({
      row: nextX,
      col: nextY,
      value: 0,
      action: 'backtrack',
      isBacktracking: true
    });
  }

  return false;
};

const isValidMove = (board: number[][], x: number, y: number): boolean => {
  const size = board.length;
  return x >= 0 && x < size && y >= 0 && y < size && board[x][y] === 0;
};

const getAccessibility = (board: number[][], x: number, y: number): number => {
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  
  let count = 0;
  for (const [dx, dy] of knightMoves) {
    if (isValidMove(board, x + dx, y + dy)) {
      count++;
    }
  }
  return count;
};
