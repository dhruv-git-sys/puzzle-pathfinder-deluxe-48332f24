
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Circle, CheckCircle, XCircle, User, Zap } from 'lucide-react';

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
  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isCurrentNode = isInteractive ? node.isCurrent : 
      (currentState && node.state?.row === currentState.row && node.state?.col === currentState.col);

    return (
      <div key={node.id} className="space-y-2">
        <div className={`flex items-center gap-2 pl-${Math.min(depth * 2, 8)}`}>
          <div className="flex items-center gap-1">
            {node.isValid ? (
              <CheckCircle className="w-3 h-3 text-green-400" />
            ) : (
              <XCircle className="w-3 h-3 text-red-400" />
            )}
            <Circle 
              className={`w-2 h-2 ${isCurrentNode ? 'text-blue-400 fill-blue-400' : 'text-slate-400'}`} 
            />
          </div>
          
          <Badge 
            variant={isCurrentNode ? "default" : "outline"} 
            className={`text-xs ${node.isBacktrack ? 'bg-yellow-600' : ''} ${isCurrentNode ? 'bg-blue-600' : ''}`}
          >
            {node.state?.row !== undefined ? 
              `(${node.state.row + 1}, ${node.state.col + 1})` : 
              'Root'
            }
            {node.state?.value !== undefined && node.state.value > 0 && (
              <span className="ml-1">= {node.state.value}</span>
            )}
          </Badge>
          
          {node.state?.action && (
            <Badge variant="outline" className="text-xs border-slate-500">
              {node.state.action}
            </Badge>
          )}
          
          {node.isBacktrack && (
            <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-400">
              ↩ Backtrack
            </Badge>
          )}
        </div>
        
        {node.children.map(child => (
          <div key={child.id} className="ml-3 border-l border-slate-600 pl-2">
            {renderNode(child, depth + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 p-4 max-h-96 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold">Decision Tree</h3>
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
      
      {tree.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-slate-400 text-sm">
            {isInteractive ? 
              "Make moves to see your decision tree..." : 
              "Tree will appear as algorithm runs..."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-1 text-sm">
          {tree.map(node => renderNode(node))}
        </div>
      )}
      
      {tree.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-600">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>Valid</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-red-400" />
              <span>Invalid</span>
            </div>
            <div className="flex items-center gap-1">
              <Circle className="w-2 h-2 text-blue-400 fill-blue-400" />
              <span>Current</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
