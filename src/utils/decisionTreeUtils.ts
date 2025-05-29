
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
  const nodeStack: TreeNode[] = []; // Stack to track parent nodes at each depth
  const branchHistory: Map<string, TreeNode[]> = new Map(); // Track all attempts at each position
  
  steps.forEach((step, index) => {
    const nodeId = `${step.row}-${step.col}-${step.depth || 0}-${step.action}-${index}`;
    const currentDepth = step.depth || step.row || 0;
    
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
      depth: currentDepth
    };
    
    // Handle different types of steps
    if (step.action === 'try') {
      // Trim stack to current depth
      while (nodeStack.length > currentDepth) {
        nodeStack.pop();
      }
      
      // Add to appropriate parent
      if (nodeStack.length > 0) {
        const parent = nodeStack[nodeStack.length - 1];
        parent.children.push(node);
      } else {
        tree.push(node);
      }
      
      // Track this attempt
      const posKey = `${step.row}-${step.col}`;
      if (!branchHistory.has(posKey)) {
        branchHistory.set(posKey, []);
      }
      branchHistory.get(posKey)!.push(node);
      
    } else if (step.action === 'place') {
      // This is a successful placement - it becomes a new branch point
      while (nodeStack.length > currentDepth) {
        nodeStack.pop();
      }
      
      if (nodeStack.length > 0) {
        const parent = nodeStack[nodeStack.length - 1];
        parent.children.push(node);
      } else {
        tree.push(node);
      }
      
      // Push this node as a potential parent for next depth
      nodeStack[currentDepth] = node;
      
    } else if (step.action === 'reject') {
      // Rejected attempts are siblings of other attempts at the same position
      while (nodeStack.length > currentDepth) {
        nodeStack.pop();
      }
      
      if (nodeStack.length > 0) {
        const parent = nodeStack[nodeStack.length - 1];
        parent.children.push(node);
      } else {
        tree.push(node);
      }
      
    } else if (step.action === 'backtrack' || step.action === 'backtrack_row') {
      // Backtracking removes nodes from the stack
      while (nodeStack.length > currentDepth) {
        nodeStack.pop();
      }
      
      if (nodeStack.length > 0) {
        const parent = nodeStack[nodeStack.length - 1];
        parent.children.push(node);
      } else {
        tree.push(node);
      }
      
      // Remove this depth level from the stack
      if (nodeStack.length > currentDepth) {
        nodeStack.splice(currentDepth);
      }
    }
  });
  
  return tree;
};

export const buildDecisionTree = buildRecursionTree;

// New utility to create a flattened progress tree for better visualization
export const buildProgressTree = (steps: any[]): TreeNode[] => {
  const progressNodes: TreeNode[] = [];
  const pathStack: string[] = []; // Track the current solution path
  
  steps.forEach((step, index) => {
    const nodeId = `progress-${step.row}-${step.col}-${index}`;
    const currentDepth = step.depth || step.row || 0;
    
    const node: TreeNode = {
      id: nodeId,
      state: {
        ...step,
        stepIndex: index,
        pathPosition: pathStack.length
      },
      children: [],
      isValid: step.isValid || step.action === 'place',
      isCurrent: index === steps.length - 1,
      isBacktrack: step.isBacktracking || step.action === 'backtrack' || step.action === 'backtrack_row',
      depth: currentDepth
    };
    
    // Update path stack based on action
    if (step.action === 'place') {
      pathStack.push(`${step.row}-${step.col}`);
      node.state.isOnSolutionPath = true;
    } else if (step.action === 'backtrack' || step.action === 'backtrack_row') {
      if (pathStack.length > 0) {
        pathStack.pop();
      }
      node.state.isOnSolutionPath = false;
    } else {
      node.state.isOnSolutionPath = pathStack.length > currentDepth;
    }
    
    progressNodes.push(node);
  });
  
  return progressNodes;
};
