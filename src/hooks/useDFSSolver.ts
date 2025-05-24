
import { useState, useCallback, useRef } from 'react';

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
  decisionTree: any[];
}

export const useDFSSolver = (puzzleType: string, difficulty: string) => {
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
    decisionTree: []
  });

  const stepIndex = useRef(0);
  const startTime = useRef(0);
  const solutionSteps = useRef<any[]>([]);

  const generateSudokuPuzzle = (difficulty: string): number[][] => {
    const size = 9;
    const board = Array(size).fill(null).map(() => Array(size).fill(0));
    
    // Simple preset puzzles for demo
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

    return difficulty === 'easy' ? easyPuzzle : board;
  };

  const generateNQueensPuzzle = (difficulty: string): number[][] => {
    const size = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
    return Array(size).fill(null).map(() => Array(size).fill(0));
  };

  const isValidSudoku = (board: number[][], row: number, col: number, num: number): boolean => {
    // Check row
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num) return false;
    }

    // Check column
    for (let i = 0; i < 9; i++) {
      if (board[i][col] === num) return false;
    }

    // Check 3x3 box
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

    // Check column
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 1) return false;
    }

    // Check diagonal (top-left to bottom-right)
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 1) return false;
    }

    // Check diagonal (top-right to bottom-left)
    for (let i = row - 1, j = col + 1; i >= 0 && j < size; i--, j++) {
      if (board[i][j] === 1) return false;
    }

    return true;
  };

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

  const initializePuzzle = useCallback(() => {
    console.log('Initializing puzzle:', puzzleType, difficulty);
    
    let newBoard: number[][];
    if (puzzleType === 'sudoku') {
      newBoard = generateSudokuPuzzle(difficulty);
    } else {
      newBoard = generateNQueensPuzzle(difficulty);
    }

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
      decisionTree: []
    }));

    stepIndex.current = 0;
    solutionSteps.current = [];
    startTime.current = Date.now();
  }, [puzzleType, difficulty]);

  const step = useCallback((): boolean => {
    if (stepIndex.current >= solutionSteps.current.length) {
      return false;
    }

    const currentStep = solutionSteps.current[stepIndex.current];
    const violations = new Set<string>();

    if (!currentStep.isValid) {
      violations.add(`${currentStep.row}-${currentStep.col}`);
    }

    setState(prev => ({
      ...prev,
      currentState: currentStep,
      violations,
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
    }

    solutionSteps.current = steps;
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

  return {
    board: state.board,
    solutionSteps: state.solutionSteps,
    currentState: state.currentState,
    stats: state.stats,
    isComplete: state.isComplete,
    violations: state.violations,
    decisionTree: state.decisionTree,
    initializePuzzle,
    step,
    reset,
    solve
  };
};
