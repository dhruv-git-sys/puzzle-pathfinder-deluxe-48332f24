
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Zap, Brain, Target, User, Lightbulb, GitBranch } from 'lucide-react';
import { SudokuBoard } from '@/components/SudokuBoard';
import { NQueensBoard } from '@/components/NQueensBoard';
import { KnightsTourBoard } from '@/components/KnightsTourBoard';
import { DecisionTree } from '@/components/DecisionTree';
import { AlgorithmStats } from '@/components/AlgorithmStats';
import { AlgorithmExplanation } from '@/components/AlgorithmExplanation';
import { useDFSSolver } from '@/hooks/useDFSSolver';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedPuzzle, setSelectedPuzzle] = useState('sudoku');
  const [difficulty, setDifficulty] = useState('easy');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [currentStep, setCurrentStep] = useState(0);
  const [boardSize, setBoardSize] = useState(8);
  const [mode, setMode] = useState<'solve' | 'interactive'>('solve');
  const { toast } = useToast();

  const {
    board,
    solutionSteps,
    currentState,
    stats,
    isComplete,
    violations,
    decisionTree,
    initializePuzzle,
    step,
    reset,
    solve,
    setBoardSize: setSolverBoardSize,
    handleCellClick,
    userMoves,
    isUserSolved,
    progress,
    maxProgress,
    getHint,
    showDecisionTree,
    toggleDecisionTree
  } = useDFSSolver(selectedPuzzle, difficulty, boardSize);

  const intervalRef = useRef<NodeJS.Timeout>();

  const handlePlay = useCallback(() => {
    if (mode === 'interactive') return;
    
    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsPlaying(false);
      toast({
        title: "Paused",
        description: "Algorithm execution paused",
      });
    } else {
      setIsPlaying(true);
      toast({
        title: "Playing",
        description: "Algorithm execution started",
      });
      intervalRef.current = setInterval(() => {
        const hasNext = step();
        if (!hasNext) {
          setIsPlaying(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          toast({
            title: "Completed",
            description: "Algorithm execution finished",
          });
        }
      }, speed);
    }
  }, [isPlaying, speed, step, mode, toast]);

  const handleReset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
    setCurrentStep(0);
    reset();
    toast({
      title: "Reset",
      description: "Puzzle has been reset",
    });
  }, [reset, toast]);

  const handleSolveInstant = useCallback(() => {
    if (mode === 'interactive') return;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
    solve();
    toast({
      title: "Solution Found",
      description: "Puzzle solved instantly!",
    });
  }, [solve, mode, toast]);

  const handleGetHint = useCallback(() => {
    if (mode !== 'interactive') return;
    
    const hint = getHint();
    if (hint) {
      toast({
        title: "Hint",
        description: `Try placing ${hint.value} at position (${hint.row + 1}, ${hint.col + 1})`,
      });
    } else {
      toast({
        title: "No Hint Available",
        description: "Unable to generate a hint at this time",
        variant: "destructive"
      });
    }
  }, [mode, getHint, toast]);

  const handleBoardSizeChange = (newSize: number) => {
    setBoardSize(newSize);
    setSolverBoardSize(newSize);
  };

  const handleModeChange = (newMode: 'solve' | 'interactive') => {
    setMode(newMode);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
    reset();
  };

  useEffect(() => {
    initializePuzzle();
  }, [selectedPuzzle, difficulty, boardSize, initializePuzzle]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const renderPuzzleBoard = () => {
    const commonProps = {
      board,
      currentState: mode === 'solve' ? currentState : null,
      violations,
      isAnimating: isPlaying && mode === 'solve',
      onCellClick: mode === 'interactive' ? handleCellClick : undefined,
      userMoves,
      isInteractive: mode === 'interactive'
    };

    switch (selectedPuzzle) {
      case 'sudoku':
        return <SudokuBoard {...commonProps} />;
      case 'nqueens':
        return <NQueensBoard {...commonProps} />;
      case 'knights':
        return <KnightsTourBoard {...commonProps} />;
      default:
        return null;
    }
  };

  const getPuzzleTitle = () => {
    switch (selectedPuzzle) {
      case 'sudoku':
        return 'Sudoku Solver';
      case 'nqueens':
        return `${boardSize}-Queens Solver`;
      case 'knights':
        return `Knight's Tour (${boardSize}×${boardSize})`;
      default:
        return 'Puzzle Solver';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            DFS Backtracking Visualizer
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto">
            Explore how Depth-First Search with backtracking solves constraint satisfaction problems
          </p>
        </div>

        {/* Controls */}
        <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">Puzzle Type</Label>
              <Select value={selectedPuzzle} onValueChange={setSelectedPuzzle}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sudoku">Sudoku</SelectItem>
                  <SelectItem value="nqueens">N-Queens</SelectItem>
                  <SelectItem value="knights">Knight's Tour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPuzzle === 'sudoku' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {(selectedPuzzle === 'nqueens' || selectedPuzzle === 'knights') && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Board Size</Label>
                <Input
                  type="number"
                  min="4"
                  max="12"
                  value={boardSize}
                  onChange={(e) => handleBoardSizeChange(Number(e.target.value))}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">Mode</Label>
              <Select value={mode} onValueChange={handleModeChange}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solve">Auto Solve</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === 'solve' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Speed (ms)</Label>
                <Select value={speed.toString()} onValueChange={(v) => setSpeed(Number(v))}>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">Fast (100ms)</SelectItem>
                    <SelectItem value="500">Normal (500ms)</SelectItem>
                    <SelectItem value="1000">Slow (1000ms)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2 items-end">
              {mode === 'solve' ? (
                <>
                  <Button
                    onClick={handlePlay}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button onClick={handleSolveInstant} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Zap className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button onClick={handleGetHint} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Get Hint
                </Button>
              )}
              <Button onClick={handleReset} variant="outline" className="border-slate-600">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                onClick={toggleDecisionTree}
                variant="outline"
                className={`border-slate-600 ${showDecisionTree ? 'bg-purple-600/20 border-purple-400' : ''}`}
              >
                <GitBranch className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {mode === 'interactive' && (
            <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">Interactive Mode Instructions:</span>
              </div>
              <p className="text-sm text-slate-300">
                {selectedPuzzle === 'sudoku' && "Click on empty cells to enter numbers (1-9). Try to solve the puzzle yourself!"}
                {selectedPuzzle === 'nqueens' && "Click on cells to place or remove queens. Try to place all queens without conflicts!"}
                {selectedPuzzle === 'knights' && "Click on cells to move the knight. Try to visit all squares exactly once!"}
              </p>
              {isUserSolved && (
                <Badge className="mt-2 bg-gradient-to-r from-green-600 to-emerald-600">
                  <Target className="w-3 h-3 mr-1" />
                  Congratulations! You solved it!
                </Badge>
              )}
            </div>
          )}
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Puzzle Board */}
          <div className="xl:col-span-2 space-y-4">
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  {getPuzzleTitle()}
                </h2>
                <div className="flex items-center gap-2">
                  {(isComplete || isUserSolved) && (
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600">
                      <Target className="w-3 h-3 mr-1" />
                      Solved!
                    </Badge>
                  )}
                  {mode === 'solve' && (
                    <Badge variant="outline" className="border-slate-600">
                      Step: {stats.statesExplored}
                    </Badge>
                  )}
                  {mode === 'interactive' && userMoves > 0 && (
                    <Badge variant="outline" className="border-slate-600">
                      Moves: {userMoves}
                    </Badge>
                  )}
                </div>
              </div>
              {renderPuzzleBoard()}
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <Tabs defaultValue={showDecisionTree ? "tree" : "stats"} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="tree">Recursion Tree</TabsTrigger>
                <TabsTrigger value="learn">Learn</TabsTrigger>
              </TabsList>
              
              <TabsContent value="stats" className="mt-4">
                <AlgorithmStats stats={stats} />
              </TabsContent>
              
              <TabsContent value="tree" className="mt-4">
                <DecisionTree 
                  tree={decisionTree} 
                  currentState={currentState} 
                  isInteractive={mode === 'interactive'}
                />
              </TabsContent>
              
              <TabsContent value="learn" className="mt-4">
                <AlgorithmExplanation currentStep={currentState} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
