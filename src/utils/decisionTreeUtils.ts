
import { TreeNode } from '../types/solver';

export const buildUserDecisionTree = (moves: any[]): TreeNode[] => {
  if (!moves || moves.length === 0) return [];
  
  return moves.map((move, index) => ({
    id: `user-${move.row}-${move.col}-${index}`,
    state: {
      row: move.row,
      col: move.col,
      value: move.value,
      action: move.action || 'place',
      stepIndex: index
    },
    children: [],
    isValid: move.isValid !== false,
    isCurrent: index === moves.length - 1,
    isBacktrack: move.action === 'backtrack',
    depth: index
  }));
};

export const buildRecursionTree = (steps: any[]): TreeNode[] => {
  if (!steps || steps.length === 0) return [];
  
  const tree: TreeNode[] = [];
  const nodeStack: TreeNode[] = [];
  
  steps.forEach((step, index) => {
    const nodeId = `${step.row || 0}-${step.col || 0}-${step.depth || 0}-${step.action}-${index}`;
    const currentDepth = step.depth || 0;
    
    const node: TreeNode = {
      id: nodeId,
      state: {
        ...step,
        stepIndex: index
      },
      children: [],
      isValid: step.isValid !== false,
      isCurrent: false,
      isBacktrack: step.isBacktracking || step.action === 'backtrack' || step.action === 'backtrack_row',
      depth: currentDepth
    };
    
    // Adjust stack to current depth
    while (nodeStack.length > currentDepth) {
      nodeStack.pop();
    }
    
    // Add to appropriate parent or root
    if (nodeStack.length > 0) {
      const parent = nodeStack[nodeStack.length - 1];
      parent.children.push(node);
    } else {
      tree.push(node);
    }
    
    // For placement actions, add to stack as potential parent
    if (step.action === 'place') {
      nodeStack[currentDepth] = node;
    }
  });
  
  return tree;
};

export const buildProgressTree = (steps: any[]): TreeNode[] => {
  if (!steps || steps.length === 0) return [];
  
  return steps.map((step, index) => ({
    id: `progress-${step.row || 0}-${step.col || 0}-${index}`,
    state: {
      ...step,
      stepIndex: index,
      isOnSolutionPath: step.action === 'place'
    },
    children: [],
    isValid: step.isValid !== false,
    isCurrent: index === steps.length - 1,
    isBacktrack: step.isBacktracking || step.action === 'backtrack' || step.action === 'backtrack_row',
    depth: step.depth || index
  }));
};

export const buildDecisionTree = buildRecursionTree;
