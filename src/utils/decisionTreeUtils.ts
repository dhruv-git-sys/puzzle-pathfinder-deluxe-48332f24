
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

export const buildRecursionTree = (steps: any[]): TreeNode[] => {
  const tree: TreeNode[] = [];
  const nodeMap = new Map<string, TreeNode>();
  const depthStack: TreeNode[] = []; // Track nodes at each depth level
  
  steps.forEach((step, index) => {
    const nodeId = `${step.row}-${step.col}-${step.depth || 0}-${index}`;
    const node: TreeNode = {
      id: nodeId,
      state: {
        ...step,
        stepIndex: index
      },
      children: [],
      isValid: step.isValid || step.action === 'place',
      isCurrent: false,
      isBacktrack: step.isBacktracking || step.action === 'backtrack' || step.action === 'backtrack_row',
      depth: step.depth || step.row || 0
    };
    
    nodeMap.set(nodeId, node);
    
    // Handle tree structure based on depth and action
    if (step.action === 'try' || step.action === 'place') {
      const currentDepth = node.depth;
      
      // Trim stack to current depth
      while (depthStack.length > currentDepth) {
        depthStack.pop();
      }
      
      // Find parent at the previous depth
      if (depthStack.length > 0) {
        const parent = depthStack[depthStack.length - 1];
        parent.children.push(node);
      } else {
        tree.push(node);
      }
      
      // If this is a successful placement, add to stack for potential children
      if (step.action === 'place') {
        depthStack[currentDepth] = node;
      }
    } else if (step.action === 'reject') {
      // Rejected attempts are siblings of successful placements at the same depth
      const currentDepth = node.depth;
      
      // Trim stack to current depth
      while (depthStack.length > currentDepth + 1) {
        depthStack.pop();
      }
      
      if (depthStack.length > 0) {
        const parent = depthStack[depthStack.length - 1];
        parent.children.push(node);
      } else {
        tree.push(node);
      }
    } else if (step.action === 'backtrack' || step.action === 'backtrack_row') {
      // Backtrack nodes show the retreat
      const currentDepth = node.depth;
      
      // Trim stack beyond current depth
      while (depthStack.length > currentDepth + 1) {
        depthStack.pop();
      }
      
      if (depthStack.length > 0) {
        const parent = depthStack[depthStack.length - 1];
        parent.children.push(node);
      } else {
        tree.push(node);
      }
      
      // Remove nodes from stack as we backtrack
      if (depthStack.length > currentDepth) {
        depthStack.splice(currentDepth);
      }
    }
  });
  
  return tree;
};

export const buildDecisionTree = buildRecursionTree;
