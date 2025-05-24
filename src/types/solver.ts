
export interface TreeNode {
  id: string;
  state: any;
  children: TreeNode[];
  isValid: boolean;
  isCurrent: boolean;
  isBacktrack: boolean;
  depth: number;
}

export interface SolverState {
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
