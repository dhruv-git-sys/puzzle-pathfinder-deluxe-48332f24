
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw, Zap, Brain, Target } from 'lucide-react';
import { SudokuBoard } from '@/components/SudokuBoard';
import { NQueensBoard } from '@/components/NQueensBoard';
import { DecisionTree } from '@/components/DecisionTree';
import { AlgorithmStats } from '@/components/AlgorithmStats';
import { AlgorithmExplanation } from '@/components/AlgorithmExplanation';
import { useDFSSolver } from '@/hooks/useDFSSolver';

const Index = () => {
  const [selectedPuzzle, setSelectedPuzzle] = useState('sudoku');
  const [difficulty, setDifficulty] = useState('easy');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [currentStep, setCurrentStep] = useState(0);

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
    solve
  } = useDFSSolver(selectedPuzzle, difficulty);

  const intervalRef = useRef<NodeJS.Timeout>();

  const handlePlay = useCallback(() => {
    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        const hasNext = step();
        if (!hasNext) {
          setIsPlaying(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      }, speed);
    }
  }, [isPlaying, speed, step]);

  const handleReset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
    setCurrentStep(0);
    reset();
  }, [reset]);

  const handleSolveInstant = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
    solve();
  }, [solve]);

  useEffect(() => {
    initializePuzzle();
  }, [selectedPuzzle, difficulty, initializePuzzle]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const renderPuzzleBoard = () => {
    switch (selectedPuzzle) {
      case 'sudoku':
        return (
          <SudokuBoard
            board={board}
            currentState={currentState}
            violations={violations}
            isAnimating={isPlaying}
          />
        );
      case 'nqueens':
        return (
          <NQueensBoard
            board={board}
            currentState={currentState}
            violations={violations}
            isAnimating={isPlaying}
          />
        );
      default:
        return null;
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Puzzle Type</label>
              <Select value={selectedPuzzle} onValueChange={setSelectedPuzzle}>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sudoku">Sudoku</SelectItem>
                  <SelectItem value="nqueens">N-Queens</SelectItem>
                  <SelectItem value="knights" disabled>Knight's Tour (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Difficulty</label>
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Speed (ms)</label>
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

            <div className="flex gap-2">
              <Button
                onClick={handlePlay}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button onClick={handleReset} variant="outline" className="border-slate-600">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button onClick={handleSolveInstant} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Zap className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Puzzle Board */}
          <div className="xl:col-span-2 space-y-4">
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  {selectedPuzzle === 'sudoku' ? 'Sudoku Solver' : 'N-Queens Solver'}
                </h2>
                <div className="flex items-center gap-2">
                  {isComplete && (
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600">
                      <Target className="w-3 h-3 mr-1" />
                      Solved!
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-slate-600">
                    Step: {stats.statesExplored}
                  </Badge>
                </div>
              </div>
              {renderPuzzleBoard()}
            </Card>

            {/* Progress */}
            <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700 p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round((stats.statesExplored / Math.max(stats.totalStates, 1)) * 100)}%</span>
                </div>
                <Progress 
                  value={(stats.statesExplored / Math.max(stats.totalStates, 1)) * 100} 
                  className="h-2"
                />
              </div>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="tree">Tree</TabsTrigger>
                <TabsTrigger value="learn">Learn</TabsTrigger>
              </TabsList>
              
              <TabsContent value="stats" className="mt-4">
                <AlgorithmStats stats={stats} />
              </TabsContent>
              
              <TabsContent value="tree" className="mt-4">
                <DecisionTree tree={decisionTree} currentState={currentState} />
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
