import { useState, useCallback, useRef } from 'react';

interface TreeNode {
  id: string;
  state: any;
  children: TreeNode[];
  isValid: boolean;
  isCurrent: boolean;
  isBacktrack: boolean;
  depth: number;
}

interface SolverState {
  board: number[][];
  solutionSteps: any[];
  currentState: any;
  stats: {
    statesExplored: number;
    totalStates: number;
    backtrackCount: number;
    solutionsFound: number;
    timeElapsed: number;
    recursionDepth: number;
  };
  isComplete: boolean;
  violations: Set<string>;
  decisionTree: TreeNode[];
  userMoves: number;
  isUserSolved: boolean;
  progress: number;
  maxProgress: number;
}

export const useDFSSolver = (puzzleType: string, difficulty: string, boardSize: number = 8) => {
  const [state, setState] = useState<SolverState>({
    board: [],
    solutionSteps: [],
    currentState: null,
    stats: {
      statesExplored: 0,
      totalStates: 0,
      backtrackCount: 0,
      solutionsFound: 0,
      timeElapsed: 0,
      recursionDepth: 0
    },
    isComplete: false,
    violations: new Set(),
    decisionTree: [],
    userMoves: 0,
    isUserSolved: false,
    progress: 0,
    maxProgress: 0
  });

  const stepIndex = useRef(0);
  const startTime = useRef(0);
  const solutionSteps = useRef<any[]>([]);
  const solutionBoard = useRef<number[][]>([]);

  const generateSudokuPuzzle = (difficulty: string): number[][] => {
    const size = 9;
    
    const easyPuzzle = [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9]
    ];

    const mediumPuzzle = [
      [0,0,0,6,0,0,4,0,0],
      [7,0,0,0,0,3,6,0,0],
      [0,0,0,0,9,1,0,8,0],
      [0,0,0,0,0,0,0,0,0],
      [0,5,0,1,8,0,0,0,3],
      [0,0,0,3,0,6,0,4,5],
      [0,4,0,2,0,0,0,6,0],
      [9,0,3,0,0,0,0,0,0],
      [0,2,0,0,0,0,1,0,0]
    ];

    return difficulty === 'easy' ? easyPuzzle : difficulty === 'medium' ? mediumPuzzle : easyPuzzle;
  };

  const generateNQueensPuzzle = (size: number): number[][] => {
    return Array(size).fill(null).map(() => Array(size).fill(0));
  };

  const generateKnightsTourPuzzle = (size: number): number[][] => {
    const board = Array(size).fill(null).map(() => Array(size).fill(0));
    board[0][0] = 1;
    return board;
  };

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

  const isValidNQueens = (board: number[][], row: number, col: number): boolean => {
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

  const isValidKnightMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  };

  const checkSudokuSolved = (board: number[][]): boolean => {
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

  const checkNQueensSolved = (board: number[][]): boolean => {
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

  const checkKnightsTourSolved = (board: number[][]): boolean => {
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

  const calculateProgress = (board: number[][], puzzleType: string): number => {
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

  const getHint = useCallback(() => {
    if (solutionBoard.current.length === 0) {
      const boardCopy = state.board.map(row => [...row]);
      const steps: any[] = [];

      if (puzzleType === 'sudoku') {
        solveSudokuDFS(boardCopy, steps);
      } else if (puzzleType === 'nqueens') {
        solveNQueensDFS(boardCopy, 0, steps);
      } else if (puzzleType === 'knights') {
        solveKnightsTourDFS(boardCopy, 2, steps);
      }
      
      solutionBoard.current = boardCopy;
    }

    // Find next valid move
    if (puzzleType === 'sudoku') {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (state.board[row][col] === 0 && solutionBoard.current[row][col] !== 0) {
            return { row, col, value: solutionBoard.current[row][col] };
          }
        }
      }
    }

    return null;
  }, [state.board, puzzleType]);

  const handleCellClick = useCallback((row: number, col: number) => {
    setState(prevState => {
      const newBoard = prevState.board.map(r => [...r]);
      let newUserMoves = prevState.userMoves;
      let newViolations = new Set<string>();
      let progressChange = 0;

      if (puzzleType === 'sudoku') {
        const oldValue = newBoard[row][col];
        if (newBoard[row][col] === 0) {
          newBoard[row][col] = 1;
        } else if (newBoard[row][col] < 9) {
          newBoard[row][col]++;
        } else {
          newBoard[row][col] = 0;
        }
        
        // Calculate progress change
        if (oldValue === 0 && newBoard[row][col] !== 0) {
          progressChange = 1;
        } else if (oldValue !== 0 && newBoard[row][col] === 0) {
          progressChange = -1;
        }
        
        newUserMoves++;

        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (newBoard[r][c] !== 0) {
              const num = newBoard[r][c];
              newBoard[r][c] = 0;
              if (!isValidSudoku(newBoard, r, c, num)) {
                newViolations.add(`${r}-${c}`);
                progressChange -= 0.5; // Penalty for violations
              }
              newBoard[r][c] = num;
            }
          }
        }
      } else if (puzzleType === 'nqueens') {
        const oldValue = newBoard[row][col];
        if (newBoard[row][col] === 0) {
          newBoard[row][col] = 1;
          progressChange = 1;
        } else {
          newBoard[row][col] = 0;
          progressChange = -1;
        }
        newUserMoves++;

        for (let r = 0; r < newBoard.length; r++) {
          for (let c = 0; c < newBoard.length; c++) {
            if (newBoard[r][c] === 1 && !isValidNQueens(newBoard, r, c)) {
              newViolations.add(`${r}-${c}`);
              progressChange -= 0.5;
            }
          }
        }
      } else if (puzzleType === 'knights') {
        let knightRow = -1, knightCol = -1;
        for (let r = 0; r < newBoard.length; r++) {
          for (let c = 0; c < newBoard.length; c++) {
            if (newBoard[r][c] === newUserMoves) {
              knightRow = r;
              knightCol = c;
              break;
            }
          }
          if (knightRow !== -1) break;
        }

        if (knightRow !== -1 && knightCol !== -1 && isValidKnightMove(knightRow, knightCol, row, col) && newBoard[row][col] === 0) {
          newUserMoves++;
          newBoard[row][col] = newUserMoves;
          progressChange = 1;
        }
      }

      const newProgress = calculateProgress(newBoard, puzzleType);
      const maxProgress = Math.max(prevState.maxProgress, newProgress);

      let isUserSolved = false;
      if (puzzleType === 'sudoku') {
        isUserSolved = checkSudokuSolved(newBoard);
      } else if (puzzleType === 'nqueens') {
        isUserSolved = checkNQueensSolved(newBoard);
      } else if (puzzleType === 'knights') {
        isUserSolved = checkKnightsTourSolved(newBoard);
      }

      return {
        ...prevState,
        board: newBoard,
        userMoves: newUserMoves,
        violations: newViolations,
        isUserSolved,
        progress: newProgress,
        maxProgress
      };
    });
  }, [puzzleType]);

  const solveSudokuDFS = (board: number[][], steps: any[]): boolean => {
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

  const solveNQueensDFS = (board: number[][], row: number, steps: any[]): boolean => {
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

  const solveKnightsTourDFS = (board: number[][], move: number, steps: any[]): boolean => {
    const size = board.length;
    if (move === size * size + 1) return true;

    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    let currentRow = -1, currentCol = -1;
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

    for (const [dr, dc] of knightMoves) {
      const newRow = currentRow + dr;
      const newCol = currentCol + dc;

      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size && board[newRow][newCol] === 0) {
        steps.push({
          row: newRow,
          col: newCol,
          action: 'try',
          isValid: true
        });

        board[newRow][newCol] = move;
        steps.push({
          row: newRow,
          col: newCol,
          action: 'place',
          isValid: true
        });

        if (solveKnightsTourDFS(board, move + 1, steps)) return true;

        board[newRow][newCol] = 0;
        steps.push({
          row: newRow,
          col: newCol,
          action: 'backtrack',
          isBacktracking: true
        });
      }
    }
    return false;
  };

  const initializePuzzle = useCallback(() => {
    console.log('Initializing puzzle:', puzzleType, difficulty, 'size:', boardSize);
    
    let newBoard: number[][];
    if (puzzleType === 'sudoku') {
      newBoard = generateSudokuPuzzle(difficulty);
    } else if (puzzleType === 'nqueens') {
      newBoard = generateNQueensPuzzle(boardSize);
    } else {
      newBoard = generateKnightsTourPuzzle(boardSize);
    }

    const initialProgress = calculateProgress(newBoard, puzzleType);

    setState(prev => ({
      ...prev,
      board: newBoard,
      solutionSteps: [],
      currentState: null,
      stats: {
        statesExplored: 0,
        totalStates: 0,
        backtrackCount: 0,
        solutionsFound: 0,
        timeElapsed: 0,
        recursionDepth: 0
      },
      isComplete: false,
      violations: new Set(),
      decisionTree: [],
      userMoves: puzzleType === 'knights' ? 1 : 0,
      isUserSolved: false,
      progress: initialProgress,
      maxProgress: initialProgress
    }));

    stepIndex.current = 0;
    solutionSteps.current = [];
    solutionBoard.current = [];
    startTime.current = Date.now();
  }, [puzzleType, difficulty, boardSize]);

  const buildDecisionTree = (steps: any[]): TreeNode[] => {
    const tree: TreeNode[] = [];
    const nodeMap = new Map<string, TreeNode>();
    
    steps.forEach((step, index) => {
      const nodeId = `${step.row}-${step.col}-${index}`;
      const node: TreeNode = {
        id: nodeId,
        state: step,
        children: [],
        isValid: step.isValid || false,
        isCurrent: false,
        isBacktrack: step.isBacktracking || false,
        depth: step.row || 0
      };
      
      nodeMap.set(nodeId, node);
      
      if (index === 0) {
        tree.push(node);
      }
    });
    
    return tree;
  };

  const step = useCallback((): boolean => {
    if (stepIndex.current >= solutionSteps.current.length) {
      return false;
    }

    const currentStep = solutionSteps.current[stepIndex.current];
    const violations = new Set<string>();

    if (!currentStep.isValid) {
      violations.add(`${currentStep.row}-${currentStep.col}`);
    }

    const decisionTree = buildDecisionTree(solutionSteps.current.slice(0, stepIndex.current + 1));

    setState(prev => ({
      ...prev,
      currentState: currentStep,
      violations,
      decisionTree,
      stats: {
        ...prev.stats,
        statesExplored: stepIndex.current + 1,
        backtrackCount: prev.stats.backtrackCount + (currentStep.isBacktracking ? 1 : 0),
        timeElapsed: Date.now() - startTime.current,
        recursionDepth: Math.max(prev.stats.recursionDepth, currentStep.row || 0)
      }
    }));

    stepIndex.current++;
    return stepIndex.current < solutionSteps.current.length;
  }, []);

  const reset = useCallback(() => {
    initializePuzzle();
  }, [initializePuzzle]);

  const solve = useCallback(() => {
    console.log('Starting solve for:', puzzleType);
    const boardCopy = state.board.map(row => [...row]);
    const steps: any[] = [];

    let success = false;
    if (puzzleType === 'sudoku') {
      success = solveSudokuDFS(boardCopy, steps);
    } else if (puzzleType === 'nqueens') {
      success = solveNQueensDFS(boardCopy, 0, steps);
    } else if (puzzleType === 'knights') {
      success = solveKnightsTourDFS(boardCopy, 2, steps);
    }

    solutionSteps.current = steps;
    solutionBoard.current = boardCopy;
    console.log('Generated steps:', steps.length);

    setState(prev => ({
      ...prev,
      board: boardCopy,
      solutionSteps: steps,
      isComplete: success,
      stats: {
        ...prev.stats,
        totalStates: steps.length,
        solutionsFound: success ? 1 : 0
      }
    }));
  }, [state.board, puzzleType]);

  const setBoardSize = useCallback((newSize: number) => {
    // This will trigger a re-initialization via the useEffect in the component
  }, []);

  return {
    board: state.board,
    solutionSteps: state.solutionSteps,
    currentState: state.currentState,
    stats: state.stats,
    isComplete: state.isComplete,
    violations: state.violations,
    decisionTree: state.decisionTree,
    userMoves: state.userMoves,
    isUserSolved: state.isUserSolved,
    progress: state.progress,
    maxProgress: state.maxProgress,
    initializePuzzle,
    step,
    reset,
    solve,
    setBoardSize,
    handleCellClick,
    getHint
  };
};
