
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Circle, CheckCircle, XCircle } from 'lucide-react';

interface TreeNode {
  id: string;
  state: any;
  children: TreeNode[];
  isValid: boolean;
  isCurrent: boolean;
  isBacktrack: boolean;
}

interface DecisionTreeProps {
  tree: TreeNode[];
  currentState: any;
}

export const DecisionTree: React.FC<DecisionTreeProps> = ({ tree, currentState }) => {
  const renderNode = (node: TreeNode, depth: number = 0) => {
    return (
      <div key={node.id} className="space-y-2">
        <div className={`flex items-center gap-2 pl-${depth * 4}`}>
          <div className="flex items-center gap-1">
            {node.isValid ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400" />
            )}
            <Circle 
              className={`w-3 h-3 ${node.isCurrent ? 'text-blue-400 fill-blue-400' : 'text-slate-400'}`} 
            />
          </div>
          <Badge 
            variant={node.isCurrent ? "default" : "outline"} 
            className={`text-xs ${node.isBacktrack ? 'bg-yellow-600' : ''}`}
          >
            {node.state?.row !== undefined ? `(${node.state.row}, ${node.state.col})` : 'Root'}
          </Badge>
          {node.isBacktrack && (
            <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-400">
              Backtrack
            </Badge>
          )}
        </div>
        
        {node.children.map(child => (
          <div key={child.id} className="ml-4 border-l border-slate-600 pl-2">
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
      </div>
      
      {tree.length === 0 ? (
        <p className="text-slate-400 text-sm">Tree will appear as algorithm runs...</p>
      ) : (
        <div className="space-y-1 text-sm">
          {tree.map(node => renderNode(node))}
        </div>
      )}
    </Card>
  );
};
