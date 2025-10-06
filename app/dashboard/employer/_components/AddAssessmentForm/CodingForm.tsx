'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import questions from '@/app/assessment/coding/questions.json';

export interface CodingFormData {
  totalProblems: number;
  duration: number;
  passingScore: number;
  warnings: { fullscreen: number; tabSwitch: number; audio: number };
  addManualProblem: boolean;
  difficultyWeightage: { easy: number; medium: number; hard: number };
  problemPool: { easy: number; medium: number; hard: number };
  randomizeProblems: boolean;
  manuallyAddProblems: boolean;
  selectedProblemIds: number[];
  showResultImmediately: boolean;
  allowReviewBeforeSubmit: boolean;
  languages: string[];
  compilerTimeout: number;
  memoryLimit: number;
}

interface CodingFormProps {
  onBack: () => void;
  onNext: (data: CodingFormData) => void;
}

const ALL_LANGUAGES = ['javascript','typescript','python','java','cpp','c','go','ruby','php'];

export default function CodingForm({ onBack, onNext }: CodingFormProps) {
  const [form, setForm] = useState<CodingFormData>({
    totalProblems: 2,
    duration: 90,
    passingScore: 60,
    warnings: { fullscreen: 3, tabSwitch: 3, audio: 2 },
    addManualProblem: false,
    difficultyWeightage: { easy: 50, medium: 40, hard: 10 },
    problemPool: { easy: 1, medium: 1, hard: 0 },
    randomizeProblems: true,
    manuallyAddProblems: false,
    selectedProblemIds: [],
    showResultImmediately: false,
    allowReviewBeforeSubmit: true,
    languages: ['javascript','python','cpp'],
    compilerTimeout: 30,
    memoryLimit: 256,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const problems = questions as Array<{ id: number; title: string; difficulty: string }>;
  const difficultyCounts = useMemo(() => {
    return problems.reduce((acc, q) => {
      const d = q.difficulty.toLowerCase();
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [problems]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.totalProblems < 1) e.totalProblems = 'At least 1 problem required';
    if (form.duration < 15) e.duration = 'Minimum duration 15 minutes';
    const weightSum = form.difficultyWeightage.easy + form.difficultyWeightage.medium + form.difficultyWeightage.hard;
    if (weightSum !== 100) e.difficultyWeightage = 'Difficulty weightage must sum to 100%';
    const poolSum = form.problemPool.easy + form.problemPool.medium + form.problemPool.hard;
    if (poolSum !== form.totalProblems) e.problemPool = 'Problem pool counts must equal total problems';
    if (form.languages.length === 0) e.languages = 'Select at least one language';
    
    // Validate manual problem selection
    if (form.manuallyAddProblems) {
      if (form.selectedProblemIds.length !== form.totalProblems) {
        e.selectedProblems = `Select exactly ${form.totalProblems} problems`;
      }
      
      // Validate difficulty distribution
      const selectedProblems = problems.filter(p => form.selectedProblemIds.includes(p.id));
      const selectedDifficultyCounts = selectedProblems.reduce((acc, p) => {
        const d = p.difficulty.toLowerCase();
        acc[d] = (acc[d] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      
      if (selectedDifficultyCounts.length > 0 && selectedDifficultyCounts.easy !== form.problemPool.easy) {
        e.selectedProblems = `Select exactly ${form.problemPool.easy} easy problems`;
      }
      if (selectedDifficultyCounts.length > 0 && selectedDifficultyCounts.medium !== form.problemPool.medium) {
        e.selectedProblems = `Select exactly ${form.problemPool.medium} medium problems`;
      }
      if (selectedDifficultyCounts.length > 0 && selectedDifficultyCounts.hard !== form.problemPool.hard) {
        e.selectedProblems = `Select exactly ${form.problemPool.hard} hard problems`;
      }
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toggleLanguage = (lang: string) => {
    setForm(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const toggleProblemSelection = (problemId: number) => {
    setForm(prev => {
      const isSelected = prev.selectedProblemIds.includes(problemId);
      const problem = problems.find(p => p.id === problemId);
      
      if (!problem) return prev;
      
      if (isSelected) {
        // Remove problem
        return {
          ...prev,
          selectedProblemIds: prev.selectedProblemIds.filter(id => id !== problemId)
        };
      } else {
        // Add problem if we haven't reached the limit
        if (prev.selectedProblemIds.length >= prev.totalProblems) {
          return prev;
        }
        
        // Check difficulty constraints
        const selectedProblems = problems.filter(p => prev.selectedProblemIds.includes(p.id));
        const selectedDifficultyCounts = selectedProblems.reduce((acc, p) => {
          const d = p.difficulty.toLowerCase();
          acc[d] = (acc[d] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const problemDifficulty = problem.difficulty.toLowerCase();
        const currentCount = selectedDifficultyCounts[problemDifficulty] || 0;
        const maxCount = prev.problemPool[problemDifficulty as keyof typeof prev.problemPool];
        
        if (currentCount >= maxCount) {
          return prev;
        }
        
        return {
          ...prev,
          selectedProblemIds: [...prev.selectedProblemIds, problemId]
        };
      }
    });
  };

  const handleProblemModeChange = (mode: 'randomize' | 'manual') => {
    setForm(prev => ({
      ...prev,
      randomizeProblems: mode === 'randomize',
      manuallyAddProblems: mode === 'manual',
      selectedProblemIds: mode === 'manual' ? [] : prev.selectedProblemIds
    }));
  };

  const submit = () => {
    if (!validate()) return;
    onNext(form);
  };

  return (
    <Card className="bg-[#171726] border-0">
      <CardHeader>
        <CardTitle className="text-white">Coding Round Configuration</CardTitle>
        <CardDescription className="text-white/60">Configure problems, duration, languages, and constraints</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Total Problems</Label>
            <Input type="number" value={form.totalProblems}
              onChange={e => setForm(f => ({ ...f, totalProblems: parseInt(e.target.value) || 0 }))}
              className={errors.totalProblems ? 'border-red-500 mt-1' : 'mt-1'}
              min={1} max={50}
            />
            {errors.totalProblems && <p className="text-red-500 text-xs mt-1">{errors.totalProblems}</p>}
          </div>
          <div>
            <Label>Duration (minutes)</Label>
            <Input type="number" value={form.duration}
              onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 0 }))}
              className={errors.duration ? 'border-red-500 mt-1' : 'mt-1'}
              min={15} max={480}
            />
            {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
          </div>
          <div>
            <Label>Passing Score</Label>
            <Input type="number" value={form.passingScore}
              onChange={e => setForm(f => ({ ...f, passingScore: parseInt(e.target.value) || 0 }))}
              className="mt-1" min={0} max={100}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>Problem Distribution</Label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-white/70 text-xs">Easy ({difficultyCounts['easy'] || 0})</Label>
                <Input type="number" min={0} value={form.problemPool.easy}
                  onChange={e => setForm(f => ({ ...f, problemPool: { ...f.problemPool, easy: parseInt(e.target.value) || 0 } }))}
                />
              </div>
              <div>
                <Label className="text-white/70 text-xs">Medium ({difficultyCounts['medium'] || 0})</Label>
                <Input type="number" min={0} value={form.problemPool.medium}
                  onChange={e => setForm(f => ({ ...f, problemPool: { ...f.problemPool, medium: parseInt(e.target.value) || 0 } }))}
                />
              </div>
              <div>
                <Label className="text-white/70 text-xs">Hard ({difficultyCounts['hard'] || 0})</Label>
                <Input type="number" min={0} value={form.problemPool.hard}
                  onChange={e => setForm(f => ({ ...f, problemPool: { ...f.problemPool, hard: parseInt(e.target.value) || 0 } }))}
                />
              </div>
            </div>
            {errors.problemPool && <p className="text-red-500 text-xs mt-1">{errors.problemPool}</p>}

            <Label className="mt-2 block">Difficulty Weightage (%)</Label>
            <div className="grid grid-cols-3 gap-3">
              <Input type="number" min={0} max={100} value={form.difficultyWeightage.easy}
                onChange={e => setForm(f => ({ ...f, difficultyWeightage: { ...f.difficultyWeightage, easy: parseInt(e.target.value) || 0 } }))} />
              <Input type="number" min={0} max={100} value={form.difficultyWeightage.medium}
                onChange={e => setForm(f => ({ ...f, difficultyWeightage: { ...f.difficultyWeightage, medium: parseInt(e.target.value) || 0 } }))} />
              <Input type="number" min={0} max={100} value={form.difficultyWeightage.hard}
                onChange={e => setForm(f => ({ ...f, difficultyWeightage: { ...f.difficultyWeightage, hard: parseInt(e.target.value) || 0 } }))} />
            </div>
            {errors.difficultyWeightage && <p className="text-red-500 text-xs mt-1">{errors.difficultyWeightage}</p>}
          </div>

          <div className="space-y-3">
            <Label>Allowed Languages</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ALL_LANGUAGES.map(lang => (
                <label key={lang} className="flex items-center space-x-2 text-sm">
                  <Checkbox checked={form.languages.includes(lang)} onCheckedChange={() => toggleLanguage(lang)} />
                  <span className="capitalize">{lang}</span>
                </label>
              ))}
            </div>
            {errors.languages && <p className="text-red-500 text-xs mt-1">{errors.languages}</p>}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <Label>Compiler Timeout (s)</Label>
                <Input type="number" min={5} max={60} value={form.compilerTimeout}
                  onChange={e => setForm(f => ({ ...f, compilerTimeout: parseInt(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>Memory Limit (MB)</Label>
                <Input type="number" min={128} max={2048} value={form.memoryLimit}
                  onChange={e => setForm(f => ({ ...f, memoryLimit: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Problem Selection Mode */}
        <div className="space-y-4">
          <Label>Problem Selection Mode</Label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <Checkbox 
                checked={form.randomizeProblems} 
                onCheckedChange={() => handleProblemModeChange('randomize')} 
              />
              <span className="text-sm">Randomize Problems</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox 
                checked={form.manuallyAddProblems} 
                onCheckedChange={() => handleProblemModeChange('manual')} 
              />
              <span className="text-sm">Manually Select Problems</span>
            </label>
          </div>
        </div>

        {/* Manual Problem Selection */}
        {form.manuallyAddProblems && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Select Problems ({form.selectedProblemIds.length}/{form.totalProblems})</Label>
              <div className="text-sm text-white/60">
                Easy: {problems.filter(p => form.selectedProblemIds.includes(p.id) && p.difficulty.toLowerCase() === 'easy').length}/{form.problemPool.easy} | 
                Medium: {problems.filter(p => form.selectedProblemIds.includes(p.id) && p.difficulty.toLowerCase() === 'medium').length}/{form.problemPool.medium} | 
                Hard: {problems.filter(p => form.selectedProblemIds.includes(p.id) && p.difficulty.toLowerCase() === 'hard').length}/{form.problemPool.hard}
              </div>
            </div>
            {errors.selectedProblems && <p className="text-red-500 text-xs">{errors.selectedProblems}</p>}
            
            <div className="max-h-60 overflow-y-auto rounded border border-white/10">
              {problems.map(p => {
                const isSelected = form.selectedProblemIds.includes(p.id);
                const difficulty = p.difficulty.toLowerCase();
                const selectedCount = problems.filter(prob => form.selectedProblemIds.includes(prob.id) && prob.difficulty.toLowerCase() === difficulty).length;
                const maxCount = form.problemPool[difficulty as keyof typeof form.problemPool];
                const canSelect = !isSelected && form.selectedProblemIds.length < form.totalProblems && selectedCount < maxCount;
                
                return (
                  <div 
                    key={p.id} 
                    className={`flex items-center justify-between px-4 py-2 border-b border-white/10 last:border-0 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-500/20' : canSelect ? 'hover:bg-white/5' : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => canSelect || isSelected ? toggleProblemSelection(p.id) : undefined}
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        checked={isSelected} 
                        disabled={!canSelect && !isSelected}
                        onChange={() => {}} // Handled by parent div click
                      />
                      <div>
                        <div className="text-sm font-medium">{p.id}. {p.title}</div>
                        <div className="text-xs text-white/60 capitalize">{p.difficulty}</div>
                      </div>
                    </div>
                    <div className="text-xs text-white/50">
                      {isSelected ? 'Selected' : canSelect ? 'Click to select' : 'Limit reached'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Problems Preview */}
        <div className="space-y-2">
          <Label>Available Problems</Label>
          <div className="max-h-60 overflow-y-auto rounded border border-white/10">
            {problems.map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-2 border-b border-white/10 last:border-0">
                <div>
                  <div className="text-sm font-medium">{p.id}. {p.title}</div>
                  <div className="text-xs text-white/60 capitalize">{p.difficulty}</div>
                </div>
                <span className="text-xs text-white/50">Preview only</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={onBack} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">Back</Button>
          <Button onClick={submit} className="bg-blue-600 hover:bg-blue-700 text-white">Save & Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
}



