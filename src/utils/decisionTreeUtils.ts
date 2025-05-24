
import { TreeNode } from '../types/solver';

export const buildUserDecisionTree = (moves: any[]): TreeNode[] => {
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

export const buildDecisionTree = (steps: any[]): TreeNode[] => {
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
