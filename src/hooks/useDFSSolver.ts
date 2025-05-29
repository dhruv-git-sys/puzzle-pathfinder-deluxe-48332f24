import { useState, useCallback, useRef } from 'react';
import { SolverState, TreeNode } from '../types/solver';
import { 
  generateSudokuPuzzle, 
  generateNQueensPuzzle, 
  generateKnightsTourPuzzle 
} from '../utils/puzzleGenerators';
import { 
  isValidSudoku, 
  isValidNQueens, 
  isValidKnightMove,
  checkSudokuSolved,
  checkNQueensSolved,
  checkKnightsTourSolved,
  calculateProgress
} from '../utils/puzzleValidators';
import { 
  solveSudokuDFS, 
  solveNQueensDFS, 
  solveKnightsTourDFS 
} from '../utils/solverAlgorithms';
import { buildUserDecisionTree, buildRecursionTree, buildProgressTree } from '../utils/decisionTreeUtils';
import { generateHint } from '../utils/hintSystem';

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
    maxProgress: 0,
    isPlaying: false,
    showDecisionTree: false
  });

  const stepIndex = useRef(0);
  const startTime = useRef(0);
  const solutionSteps = useRef<any[]>([]);
  const solutionBoard = useRef<number[][]>([]);
  const initialBoard = useRef<number[][]>([]);
  const userDecisionTree = useRef<TreeNode[]>([]);
  const playInterval = useRef<NodeJS.Timeout | null>(null);

  const getHint = useCallback(() => {
    console.log('Getting hint for puzzle type:', puzzleType);
    const hint = generateHint(state.board, puzzleType);
    console.log('Generated hint:', hint);
    return hint;
  }, [state.board, puzzleType]);

  const handleCellClick = useCallback((row: number, col: number) => {
    setState(prevState => {
      const newBoard = prevState.board.map(r => [...r]);
      let newUserMoves = prevState.userMoves;
      let newViolations = new Set<string>();
      let moveHistory = [...(userDecisionTree.current || [])];

      if (puzzleType === 'sudoku') {
        const oldValue = newBoard[row][col];
        if (newBoard[row][col] === 0) {
          newBoard[row][col] = 1;
        } else if (newBoard[row][col] < 9) {
          newBoard[row][col]++;
        } else {
          newBoard[row][col] = 0;
        }
        
        const moveNode: TreeNode = {
          id: `user-${row}-${col}-${moveHistory.length}`,
          state: {
            row,
            col,
            value: newBoard[row][col],
            action: newBoard[row][col] === 0 ? 'remove' : 'place',
            stepIndex: moveHistory.length
          },
          children: [],
          isValid: newBoard[row][col] === 0 || isValidSudoku(newBoard, row, col, newBoard[row][col]),
          isCurrent: true,
          isBacktrack: false,
          depth: moveHistory.length
        };
        moveHistory.push(moveNode);
        newUserMoves++;

        // Check for violations
        for (let r = 0; r < 9; r++) {
          for (let c = 0; c < 9; c++) {
            if (newBoard[r][c] !== 0) {
              const num = newBoard[r][c];
              newBoard[r][c] = 0;
              if (!isValidSudoku(newBoard, r, c, num)) {
                newViolations.add(`${r}-${c}`);
              }
              newBoard[r][c] = num;
            }
          }
        }
      } else if (puzzleType === 'nqueens') {
        if (newBoard[row][col] === 0) {
          newBoard[row][col] = 1;
        } else {
          newBoard[row][col] = 0;
        }
        
        const moveNode: TreeNode = {
          id: `user-${row}-${col}-${moveHistory.length}`,
          state: {
            row,
            col,
            value: newBoard[row][col],
            action: newBoard[row][col] === 1 ? 'place' : 'remove',
            stepIndex: moveHistory.length
          },
          children: [],
          isValid: newBoard[row][col] === 0 || isValidNQueens(newBoard, row, col),
          isCurrent: true,
          isBacktrack: false,
          depth: moveHistory.length
        };
        moveHistory.push(moveNode);
        newUserMoves++;

        // Check for violations
        for (let r = 0; r < newBoard.length; r++) {
          for (let c = 0; c < newBoard.length; c++) {
            if (newBoard[r][c] === 1 && !isValidNQueens(newBoard, r, c)) {
              newViolations.add(`${r}-${c}`);
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
          
          const moveNode: TreeNode = {
            id: `user-${row}-${col}-${moveHistory.length}`,
            state: {
              row,
              col,
              value: newUserMoves,
              action: 'move',
              stepIndex: moveHistory.length
            },
            children: [],
            isValid: true,
            isCurrent: true,
            isBacktrack: false,
            depth: moveHistory.length
          };
          moveHistory.push(moveNode);
        }
      }

      userDecisionTree.current = moveHistory;
      const newDecisionTree = buildUserDecisionTree(moveHistory.map(node => node.state));
      const newProgressTree = buildProgressTree(moveHistory.map(node => node.state));

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
        maxProgress,
        decisionTree: prevState.showDecisionTree ? newDecisionTree : [],
        progressTree: prevState.showDecisionTree ? newProgressTree : []
      };
    });
  }, [puzzleType]);

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

    initialBoard.current = newBoard.map(row => [...row]);
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
      maxProgress: initialProgress,
      isPlaying: false
    }));

    stepIndex.current = 0;
    solutionSteps.current = [];
    solutionBoard.current = [];
    userDecisionTree.current = [];
    startTime.current = Date.now();
  }, [puzzleType, difficulty, boardSize]);

  const step = useCallback((): boolean => {
    if (stepIndex.current >= solutionSteps.current.length) {
      setState(prev => ({ ...prev, isPlaying: false, isComplete: true }));
      return false;
    }

    const currentStep = solutionSteps.current[stepIndex.current];
    console.log('Applying step:', stepIndex.current, currentStep);

    setState(prevState => {
      const newBoard = prevState.board.map(row => [...row]);
      const violations = new Set<string>();

      if (currentStep.action === 'place' && currentStep.value !== undefined) {
        newBoard[currentStep.row][currentStep.col] = currentStep.value;
      } else if (currentStep.action === 'backtrack') {
        newBoard[currentStep.row][currentStep.col] = 0;
      }

      if (!currentStep.isValid) {
        violations.add(`${currentStep.row}-${currentStep.col}`);
      }

      const stepWithIndex = { ...currentStep, stepIndex: stepIndex.current };

      const decisionTree = prevState.showDecisionTree ? 
        buildRecursionTree(solutionSteps.current.slice(0, stepIndex.current + 1).map((step, idx) => ({ ...step, stepIndex: idx }))) : [];
      
      const progressTree = prevState.showDecisionTree ? 
        buildProgressTree(solutionSteps.current.slice(0, stepIndex.current + 1).map((step, idx) => ({ ...step, stepIndex: idx }))) : [];

      const newStats = {
        ...prevState.stats,
        statesExplored: stepIndex.current + 1,
        backtrackCount: prevState.stats.backtrackCount + (currentStep.isBacktracking ? 1 : 0),
        timeElapsed: Date.now() - startTime.current,
        recursionDepth: Math.max(prevState.stats.recursionDepth, currentStep.depth || 0)
      };

      return {
        ...prevState,
        board: newBoard,
        currentState: stepWithIndex,
        violations,
        decisionTree,
        progressTree,
        stats: newStats
      };
    });

    stepIndex.current++;
    return stepIndex.current < solutionSteps.current.length;
  }, []);

  const play = useCallback(() => {
    if (playInterval.current) return;

    setState(prev => ({ ...prev, isPlaying: true }));
    
    playInterval.current = setInterval(() => {
      const hasMoreSteps = step();
      if (!hasMoreSteps) {
        setState(prev => ({ ...prev, isPlaying: false, isComplete: true }));
        if (playInterval.current) {
          clearInterval(playInterval.current);
          playInterval.current = null;
        }
      }
    }, 500);
  }, [step]);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }));
    if (playInterval.current) {
      clearInterval(playInterval.current);
      playInterval.current = null;
    }
  }, []);

  const toggleDecisionTree = useCallback(() => {
    setState(prev => {
      const newShowDecisionTree = !prev.showDecisionTree;
      let newDecisionTree = [];
      let newProgressTree = [];
      
      if (newShowDecisionTree) {
        if (solutionSteps.current.length > 0) {
          newDecisionTree = buildRecursionTree(solutionSteps.current.slice(0, stepIndex.current).map((step, idx) => ({ ...step, stepIndex: idx })));
          newProgressTree = buildProgressTree(solutionSteps.current.slice(0, stepIndex.current).map((step, idx) => ({ ...step, stepIndex: idx })));
        } else if (userDecisionTree.current.length > 0) {
          newDecisionTree = buildUserDecisionTree(userDecisionTree.current.map(node => node.state));
          newProgressTree = buildProgressTree(userDecisionTree.current.map(node => node.state));
        }
      }
      
      return {
        ...prev,
        showDecisionTree: newShowDecisionTree,
        decisionTree: newDecisionTree,
        progressTree: newProgressTree
      };
    });
  }, []);

  const reset = useCallback(() => {
    pause();
    
    // Reset to initial board state
    setState(prev => ({
      ...prev,
      board: initialBoard.current.map(row => [...row]),
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
      progressTree: [],
      userMoves: puzzleType === 'knights' ? 1 : 0,
      isUserSolved: false,
      progress: calculateProgress(initialBoard.current, puzzleType),
      maxProgress: calculateProgress(initialBoard.current, puzzleType),
      isPlaying: false
    }));

    stepIndex.current = 0;
    solutionSteps.current = [];
    solutionBoard.current = [];
    userDecisionTree.current = [];
    startTime.current = Date.now();
  }, [pause, puzzleType]);

  const solve = useCallback(() => {
    console.log('Starting solve for:', puzzleType);
    const boardCopy = state.board.map(row => [...row]);
    const steps: any[] = [];
    startTime.current = Date.now();

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
    console.log('Generated steps:', steps.length, 'Success:', success);

    setState(prev => ({
      ...prev,
      board: success ? boardCopy : prev.board,
      solutionSteps: steps,
      isComplete: success,
      stats: {
        ...prev.stats,
        totalStates: steps.length,
        solutionsFound: success ? 1 : 0,
        timeElapsed: Date.now() - startTime.current
      }
    }));

    stepIndex.current = 0;
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
    progressTree: state.progressTree || [],
    userMoves: state.userMoves,
    isUserSolved: state.isUserSolved,
    progress: state.progress,
    maxProgress: state.maxProgress,
    isPlaying: state.isPlaying,
    showDecisionTree: state.showDecisionTree,
    initializePuzzle,
    step,
    reset,
    solve,
    setBoardSize,
    handleCellClick,
    getHint,
    play,
    pause,
    toggleDecisionTree
  };
};
