
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Clock, Layers, Target } from 'lucide-react';

interface AlgorithmStatsProps {
  stats: {
    statesExplored: number;
    totalStates: number;
    backtrackCount: number;
    solutionsFound: number;
    timeElapsed: number;
    recursionDepth: number;
  };
}

export const AlgorithmStats: React.FC<AlgorithmStatsProps> = ({ stats }) => {
  const efficiency = stats.totalStates > 0 ? ((stats.solutionsFound / stats.statesExplored) * 100) : 0;

  return (
    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-green-400" />
        <h3 className="font-semibold">Algorithm Statistics</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-300">States Explored</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.statesExplored}</div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-sm text-slate-300">Solutions Found</span>
          </div>
          <div className="text-2xl font-bold text-green-400">{stats.solutionsFound}</div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-slate-300">Backtracks</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">{stats.backtrackCount}</div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-slate-300">Time (ms)</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">{stats.timeElapsed}</div>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-slate-700">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-300">Recursion Depth</span>
          <Badge variant="outline" className="border-slate-600">
            {stats.recursionDepth}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-300">Efficiency</span>
          <Badge 
            className={efficiency > 50 ? 'bg-green-600' : efficiency > 20 ? 'bg-yellow-600' : 'bg-red-600'}
          >
            {efficiency.toFixed(1)}%
          </Badge>
        </div>
      </div>
    </Card>
  );
};
