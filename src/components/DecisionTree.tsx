
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GitBranch, Circle, CheckCircle, XCircle, User, Zap, ArrowDown, ArrowRight, RotateCcw, Play, ChevronDown, ChevronRight } from 'lucide-react';

interface TreeNode {
  id: string;
  state: any;
  children: TreeNode[];
  isValid: boolean;
  isCurrent: boolean;
  isBacktrack: boolean;
  depth: number;
}

interface DecisionTreeProps {
  tree: TreeNode[];
  currentState: any;
  isInteractive?: boolean;
}

export const DecisionTree: React.FC<DecisionTreeProps> = ({ tree, currentState, isInteractive = false }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [autoExpand, setAutoExpand] = useState(true);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allNodeIds = new Set<string>();
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        allNodeIds.add(node.id);
        collectIds(node.children);
      });
    };
    collectIds(tree);
    setExpandedNodes(allNodeIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Auto-expand to current state
  React.useEffect(() => {
    if (autoExpand && currentState) {
      const newExpanded = new Set(expandedNodes);
      const expandToCurrentState = (nodes: TreeNode[], path: string[] = []) => {
        nodes.forEach(node => {
          const currentPath = [...path, node.id];
          if (node.state?.stepIndex <= (currentState?.stepIndex || 0)) {
            currentPath.forEach(id => newExpanded.add(id));
          }
          if (node.children.length > 0) {
            expandToCurrentState(node.children, currentPath);
          }
        });
      };
      expandToCurrentState(tree);
      setExpandedNodes(newExpanded);
    }
  }, [currentState, autoExpand]);

  const renderNode = (node: TreeNode, depth: number = 0, isLast: boolean = false, parentPath: boolean[] = []) => {
    const isCurrentNode = isInteractive ? node.isCurrent : 
      (currentState && node.state?.stepIndex === currentState?.stepIndex);
    
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isActive = currentState && node.state?.stepIndex <= (currentState?.stepIndex || 0);

    // Create visual path indicators
    const pathIndicators = parentPath.map((isParentLast, index) => (
      <div key={index} className="w-6 flex justify-center">
        {!isParentLast ? (
          <div className="w-px h-full bg-slate-600"></div>
        ) : null}
      </div>
    ));

    const getActionIcon = () => {
      switch (node.state?.action) {
        case 'try':
          return <Circle className="w-3 h-3 text-blue-400" />;
        case 'place':
          return <CheckCircle className="w-3 h-3 text-green-400" />;
        case 'reject':
          return <XCircle className="w-3 h-3 text-red-400" />;
        case 'backtrack':
        case 'backtrack_row':
          return <RotateCcw className="w-3 h-3 text-yellow-400" />;
        default:
          return <Circle className="w-3 h-3 text-slate-400" />;
      }
    };

    const getActionColor = () => {
      if (isCurrentNode) return 'bg-blue-600 border-blue-400';
      if (node.isBacktrack) return 'bg-yellow-600/30 border-yellow-400';
      if (!node.isValid && node.state?.action === 'reject') return 'bg-red-600/30 border-red-400';
      if (node.isValid && node.state?.action === 'place') return 'bg-green-600/30 border-green-400';
      if (node.state?.action === 'try') return 'bg-blue-600/30 border-blue-400';
      return 'bg-slate-600/30 border-slate-600';
    };

    return (
      <div key={node.id} className={`transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
        <div className="flex items-center gap-1">
          {/* Path indicators */}
          {pathIndicators}
          
          {/* Connection lines */}
          <div className="w-6 flex items-center justify-center relative">
            {depth > 0 && (
              <>
                <div className="absolute -left-3 top-1/2 w-3 h-px bg-slate-600"></div>
                {!isLast && <div className="absolute left-0 top-1/2 bottom-0 w-px bg-slate-600"></div>}
              </>
            )}
          </div>

          {/* Expand/collapse button */}
          <div className="w-4 flex justify-center">
            {hasChildren && (
              <button
                onClick={() => toggleNode(node.id)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
          </div>

          {/* Node content */}
          <div className={`flex items-center gap-2 p-2 rounded border transition-all duration-300 ${getActionColor()}`}>
            {getActionIcon()}
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-slate-500">
                D{node.depth}
              </Badge>
              
              {node.state?.row !== undefined && node.state?.col !== undefined ? (
                <Badge variant="outline" className="text-xs border-slate-500">
                  ({node.state.row + 1}, {node.state.col + 1})
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs border-slate-500">
                  Root
                </Badge>
              )}
              
              {node.state?.value !== undefined && node.state.value > 0 && (
                <Badge variant="outline" className="text-xs border-slate-500">
                  = {node.state.value}
                </Badge>
              )}
              
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  node.state?.action === 'try' ? 'border-blue-400 text-blue-400' :
                  node.state?.action === 'place' ? 'border-green-400 text-green-400' :
                  node.state?.action === 'reject' ? 'border-red-400 text-red-400' :
                  node.state?.action === 'backtrack' || node.state?.action === 'backtrack_row' ? 'border-yellow-400 text-yellow-400' :
                  'border-slate-500'
                }`}
              >
                {node.state?.action || 'root'}
              </Badge>

              {isCurrentNode && (
                <Badge className="text-xs bg-blue-600 animate-pulse">
                  Current
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-7 mt-1 space-y-1">
            {node.children.map((child, index) => 
              renderNode(child, depth + 1, index === node.children.length - 1, [...parentPath, isLast])
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 p-4 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold">Recursion Tree</h3>
          {isInteractive && (
            <Badge variant="outline" className="border-blue-400 text-blue-400">
              <User className="w-3 h-3 mr-1" />
              Interactive
            </Badge>
          )}
          {!isInteractive && (
            <Badge variant="outline" className="border-orange-400 text-orange-400">
              <Zap className="w-3 h-3 mr-1" />
              Auto-Solve
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="h-7 px-2 text-xs border-slate-600"
          >
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="h-7 px-2 text-xs border-slate-600"
          >
            Collapse
          </Button>
        </div>
      </div>
      
      {tree.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-slate-400 text-sm">
            {isInteractive ? 
              "Make moves to see your recursion tree..." : 
              "Tree will appear as algorithm explores..."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-1 text-sm font-mono">
          {tree.map((node, index) => 
            renderNode(node, 0, index === tree.length - 1, [])
          )}
        </div>
      )}
      
      {tree.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-600">
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Circle className="w-3 h-3 text-blue-400" />
              <span>Trying</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>Placed</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-400" />
              <span>Rejected</span>
            </div>
            <div className="flex items-center gap-1">
              <RotateCcw className="w-3 h-3 text-yellow-400" />
              <span>Backtrack</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <span>D = Depth level in recursion</span>
          </div>
        </div>
      )}
    </Card>
  );
};
