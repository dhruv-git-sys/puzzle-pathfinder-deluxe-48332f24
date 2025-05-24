
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowRight, RotateCcw, CheckCircle } from 'lucide-react';

interface AlgorithmExplanationProps {
  currentStep: any;
}

export const AlgorithmExplanation: React.FC<AlgorithmExplanationProps> = ({ currentStep }) => {
  const getStepExplanation = () => {
    if (!currentStep) {
      return {
        title: "DFS Backtracking Overview",
        description: "Depth-First Search with backtracking systematically explores all possible solutions by making choices and undoing them when they lead to invalid states.",
        phase: "initialization"
      };
    }

    if (currentStep.isBacktracking) {
      return {
        title: "Backtracking Phase",
        description: "The algorithm detected a constraint violation and is backtracking to try a different choice. This is the key mechanism that makes DFS efficient for constraint satisfaction.",
        phase: "backtrack"
      };
    }

    if (currentStep.isValid) {
      return {
        title: "Valid Move Found",
        description: `Exploring position (${currentStep.row}, ${currentStep.col}). All constraints are satisfied so far, continuing to search deeper.`,
        phase: "explore"
      };
    }

    return {
      title: "Constraint Checking",
      description: `Checking if position (${currentStep.row}, ${currentStep.col}) violates any constraints. If it does, we'll backtrack.`,
      phase: "validate"
    };
  };

  const explanation = getStepExplanation();

  const phases = [
    {
      name: "Initialize",
      description: "Set up the puzzle and start DFS from the first position",
      icon: <CheckCircle className="w-4 h-4" />,
      active: explanation.phase === "initialization"
    },
    {
      name: "Explore",
      description: "Try placing a value and check if it's valid",
      icon: <ArrowRight className="w-4 h-4" />,
      active: explanation.phase === "explore"
    },
    {
      name: "Validate",
      description: "Check constraints and detect violations",
      icon: <CheckCircle className="w-4 h-4" />,
      active: explanation.phase === "validate"
    },
    {
      name: "Backtrack",
      description: "Undo invalid choices and try alternatives",
      icon: <RotateCcw className="w-4 h-4" />,
      active: explanation.phase === "backtrack"
    }
  ];

  return (
    <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-orange-400" />
        <h3 className="font-semibold">Algorithm Explanation</h3>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-orange-400 mb-2">{explanation.title}</h4>
          <p className="text-sm text-slate-300 leading-relaxed">
            {explanation.description}
          </p>
        </div>

        <div className="space-y-2">
          <h5 className="text-sm font-medium text-slate-300">DFS Process:</h5>
          {phases.map((phase, index) => (
            <div 
              key={phase.name}
              className={`flex items-center gap-2 p-2 rounded transition-colors ${
                phase.active ? 'bg-orange-600/20 border border-orange-400/30' : 'bg-slate-700/50'
              }`}
            >
              <div className={`${phase.active ? 'text-orange-400' : 'text-slate-400'}`}>
                {phase.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${phase.active ? 'text-orange-400' : 'text-slate-300'}`}>
                    {index + 1}. {phase.name}
                  </span>
                  {phase.active && (
                    <Badge className="bg-orange-600 text-xs">Current</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400">{phase.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-700">
          <h5 className="text-sm font-medium text-slate-300 mb-2">Key Concepts:</h5>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>• <strong>DFS:</strong> Explores as deep as possible before backtracking</li>
            <li>• <strong>Constraint Satisfaction:</strong> Checks rules at each step</li>
            <li>• <strong>Backtracking:</strong> Undoes choices that lead to dead ends</li>
            <li>• <strong>State Space:</strong> All possible configurations of the puzzle</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};
