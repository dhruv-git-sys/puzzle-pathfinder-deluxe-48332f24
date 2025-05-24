
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
  isPlaying: boolean;
  showDecisionTree: boolean;
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
    maxProgress: 0,
    isPlaying: false,
    showDecisionTree: false
  });

  const stepIndex = useRef(0);
  const startTime = useRef(0);
  const solutionSteps = useRef<any[]>([]);
  const solutionBoard = useRef<number[][]>([]);
  const userDecisionTree = useRef<TreeNode[]>([]);
  const playInterval = useRef<NodeJS.Timeout | null>(null);

  // Generate a random valid Sudoku puzzle
  const generateRandomSudoku = (difficulty: string): number[][] => {
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

  const generateSudokuPuzzle = (difficulty: string): number[][] => {
    return generateRandomSudoku(difficulty);
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

  // Build decision tree for user moves
  const buildUserDecisionTree = (moves: any[]): TreeNode[] => {
    const tree: TreeNode[] = [];
    
    moves.forEach((move, index) => {
      const node: TreeNode = {
        id: `user-${move.row}-${move.col}-${index}`,
        state: {
          row: move.row,
          col: move.col,
          value: move.value,
          action: move.action || 'place'
        },
        children: [],
        isValid: move.isValid !== false,
        isCurrent: index === moves.length - 1,
        isBacktrack: false,
        depth: index
      };
      
      if (index === 0) {
        tree.push(node);
      } else {
        // Find parent and add as child
        const parent = tree[Math.max(0, index - 1)];
        if (parent) {
          parent.children.push(node);
        } else {
          tree.push(node);
        }
      }
    });
    
    return tree;
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
        
        // Add move to history
        moveHistory.push({
          row,
          col,
          value: newBoard[row][col],
          action: newBoard[row][col] === 0 ? 'remove' : 'place',
          isValid: newBoard[row][col] === 0 || isValidSudoku(newBoard, row, col, newBoard[row][col])
        });
        
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
                progressChange -= 0.5;
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
        
        // Add move to history
        moveHistory.push({
          row,
          col,
          value: newBoard[row][col],
          action: newBoard[row][col] === 1 ? 'place' : 'remove',
          isValid: newBoard[row][col] === 0 || isValidNQueens(newBoard, row, col)
        });
        
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
          
          // Add move to history
          moveHistory.push({
            row,
            col,
            value: newUserMoves,
            action: 'move',
            isValid: true
          });
        }
      }

      // Update user decision tree
      userDecisionTree.current = moveHistory;
      const newDecisionTree = buildUserDecisionTree(moveHistory);

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
        decisionTree: prevState.showDecisionTree ? newDecisionTree : []
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
      maxProgress: initialProgress,
      isPlaying: false
    }));

    stepIndex.current = 0;
    solutionSteps.current = [];
    solutionBoard.current = [];
    userDecisionTree.current = [];
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
        isCurrent: index === stepIndex.current - 1,
        isBacktrack: step.isBacktracking || false,
        depth: step.row || 0
      };
      
      nodeMap.set(nodeId, node);
      
      if (index === 0 || step.isBacktracking) {
        tree.push(node);
      } else {
        // Find parent based on depth/backtracking
        let parentIndex = index - 1;
        while (parentIndex >= 0 && steps[parentIndex].isBacktracking) {
          parentIndex--;
        }
        if (parentIndex >= 0) {
          const parentId = `${steps[parentIndex].row}-${steps[parentIndex].col}-${parentIndex}`;
          const parent = nodeMap.get(parentId);
          if (parent) {
            parent.children.push(node);
          } else {
            tree.push(node);
          }
        }
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

    // Update board for visualization
    const newBoard = state.board.map(row => [...row]);
    if (currentStep.action === 'place' && currentStep.value !== undefined) {
      newBoard[currentStep.row][currentStep.col] = currentStep.value;
    } else if (currentStep.action === 'backtrack') {
      newBoard[currentStep.row][currentStep.col] = 0;
    }

    const decisionTree = state.showDecisionTree ? buildDecisionTree(solutionSteps.current.slice(0, stepIndex.current + 1)) : [];

    setState(prev => ({
      ...prev,
      board: newBoard,
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
  }, [state.board, state.showDecisionTree]);

  const play = useCallback(() => {
    if (playInterval.current) return;

    setState(prev => ({ ...prev, isPlaying: true }));
    
    playInterval.current = setInterval(() => {
      const hasMoreSteps = step();
      if (!hasMoreSteps) {
        setState(prev => ({ ...prev, isPlaying: false }));
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
      
      if (newShowDecisionTree) {
        if (solutionSteps.current.length > 0) {
          // Auto-solve tree
          newDecisionTree = buildDecisionTree(solutionSteps.current.slice(0, stepIndex.current));
        } else if (userDecisionTree.current.length > 0) {
          // User move tree
          newDecisionTree = buildUserDecisionTree(userDecisionTree.current);
        }
      }
      
      return {
        ...prev,
        showDecisionTree: newShowDecisionTree,
        decisionTree: newDecisionTree
      };
    });
  }, []);

  const reset = useCallback(() => {
    pause();
    initializePuzzle();
  }, [initializePuzzle, pause]);

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
