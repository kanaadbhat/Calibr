'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface AptitudeFormProps {
  jobId: string;
  jobTitle: string;
  onBack: () => void;
  onNext: (data: AptitudeFormData) => void;
}

export interface AptitudeFormData {
  numberOfQuestions: number;
  scheduledDate?: Date;
  startTime?: string;
  endTime?: string;
  addManualQuestion: boolean;
  duration: number;
  
  score: {
    min: number;
    max: number;
    required: number;
  };
  
  warnings: {
    fullscreen: number;
    tabSwitch: number;
    audio: number;
  };
  
  sectionWeightage: {
    logicalReasoning: number;
    quantitative: number;
    technical: number;
    verbal: number;
  };
  
  questionPool: {
    logicalReasoning: number;
    quantitative: number;
    technical: number;
    verbal: number;
  };
  
  randomizeQuestions: boolean;
  showResultImmediately: boolean;
  allowReviewBeforeSubmit: boolean;
  negativeMarking: boolean;
  negativeMarkingPercentage?: number;
}

export default function AptitudeForm({ 
  onBack, 
  onNext 
}: AptitudeFormProps) {
  const [formData, setFormData] = useState<AptitudeFormData>({
    numberOfQuestions: 50,
    addManualQuestion: false,
    duration: 60,
    score: {
      min: 0,
      max: 100,
      required: 60,
    },
    warnings: {
      fullscreen: 3,
      tabSwitch: 2,
      audio: 1,
    },
    sectionWeightage: {
      logicalReasoning: 25,
      quantitative: 25,
      technical: 25,
      verbal: 25,
    },
    questionPool: {
      logicalReasoning: 12,
      quantitative: 13,
      technical: 13,
      verbal: 12,
    },
    randomizeQuestions: true,
    showResultImmediately: false,
    allowReviewBeforeSubmit: true,
    negativeMarking: false,
    negativeMarkingPercentage: 25,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const getTotalSectionWeightage = () => {
    const { sectionWeightage } = formData;
    return sectionWeightage.logicalReasoning + 
           sectionWeightage.quantitative + 
           sectionWeightage.technical + 
           sectionWeightage.verbal;
  };

  const getTotalQuestions = () => {
    const { questionPool } = formData;
    return questionPool.logicalReasoning + 
           questionPool.quantitative + 
           questionPool.technical + 
           questionPool.verbal;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    // Validation
    if (formData.numberOfQuestions < 1 || formData.numberOfQuestions > 200) {
      newErrors.numberOfQuestions = 'Number of questions must be between 1 and 200';
    }
    
    if (formData.duration < 15 || formData.duration > 480) {
      newErrors.duration = 'Duration must be between 15 and 480 minutes';
    }
    
    if (formData.score.required < formData.score.min || formData.score.required > formData.score.max) {
      newErrors.requiredScore = 'Required score must be between minimum and maximum score';
    }
    
    const totalWeightage = getTotalSectionWeightage();
    if (totalWeightage !== 100) {
      newErrors.sectionWeightage = `Section weightage must add up to 100%. Current total: ${totalWeightage}%`;
    }
    
    const totalQuestions = getTotalQuestions();
    if (totalQuestions !== formData.numberOfQuestions) {
      newErrors.questionPool = `Question pool total (${totalQuestions}) must match number of questions (${formData.numberOfQuestions})`;
    }
    
    if (formData.negativeMarking && (!formData.negativeMarkingPercentage || formData.negativeMarkingPercentage < 0 || formData.negativeMarkingPercentage > 50)) {
      newErrors.negativeMarkingPercentage = 'Negative marking percentage must be between 0 and 50';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onNext(formData);
    }
  };

  const updateSectionWeightage = (section: keyof AptitudeFormData['sectionWeightage'], value: number) => {
    setFormData(prev => ({
      ...prev,
      sectionWeightage: {
        ...prev.sectionWeightage,
        [section]: value
      }
    }));
  };

  const updateQuestionPool = (section: keyof AptitudeFormData['questionPool'], value: number) => {
    setFormData(prev => ({
      ...prev,
      questionPool: {
        ...prev.questionPool,
        [section]: value
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pt-16 text-white">
      <div className="mb-6">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold text-blue-300 mb-1">
            Aptitude Test Configuration
          </h2>
          <p className="text-white/80 text-sm">
            Configure detailed settings for the aptitude assessment round
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Configuration */}
        <Card className="bg-[#171726] border-0">
          <CardHeader>
            <CardTitle className="text-white">Basic Configuration</CardTitle>
            <CardDescription className="text-white/60">
              Set up the fundamental parameters for the aptitude test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="numberOfQuestions" className="text-white">Number of Questions</Label>
                <Input
                  id="numberOfQuestions"
                  type="number"
                  min="1"
                  max="200"
                  value={formData.numberOfQuestions}
                  onChange={(e) => setFormData(prev => ({ ...prev, numberOfQuestions: parseInt(e.target.value) || 0 }))}
                  className={`bg-[#1f1f35] border-white/10 text-white ${errors.numberOfQuestions ? 'border-red-500' : ''}`}
                />
                {errors.numberOfQuestions && <p className="text-red-500 text-sm mt-1">{errors.numberOfQuestions}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-white">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="480"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  className={`bg-[#1f1f35] border-white/10 text-white ${errors.duration ? 'border-red-500' : ''}`}
                />
                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Manual Questions</Label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.addManualQuestion}
                    onChange={(e) => setFormData(prev => ({ ...prev, addManualQuestion: e.target.checked }))}
                    className="rounded border-white/30"
                  />
                  <span className="text-sm text-white">Allow manual questions</span>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate" className="text-white">Scheduled Date (Optional)</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate ? formData.scheduledDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    scheduledDate: e.target.value ? new Date(e.target.value) : undefined 
                  }))}
                  className="bg-[#1f1f35] border-white/10 text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-white">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="bg-[#1f1f35] border-white/10 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-white">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="bg-[#1f1f35] border-white/10 text-white"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scoring Configuration */}
        <Card className="bg-[#171726] border-0">
          <CardHeader>
            <CardTitle className="text-white">Scoring Configuration</CardTitle>
            <CardDescription className="text-white/60">
              Define scoring parameters and passing criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="minScore" className="text-white">Minimum Score</Label>
                <Input
                  id="minScore"
                  type="number"
                  min="0"
                  value={formData.score.min}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    score: { ...prev.score, min: parseInt(e.target.value) || 0 }
                  }))}
                  className="bg-[#1f1f35] border-white/10 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxScore" className="text-white">Maximum Score</Label>
                <Input
                  id="maxScore"
                  type="number"
                  min="1"
                  value={formData.score.max}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    score: { ...prev.score, max: parseInt(e.target.value) || 100 }
                  }))}
                  className="bg-[#1f1f35] border-white/10 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requiredScore" className="text-white">Required Score to Pass</Label>
                <Input
                  id="requiredScore"
                  type="number"
                  min={formData.score.min}
                  max={formData.score.max}
                  value={formData.score.required}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    score: { ...prev.score, required: parseInt(e.target.value) || 0 }
                  }))}
                  className={`bg-[#1f1f35] border-white/10 text-white ${errors.requiredScore ? 'border-red-500' : ''}`}
                />
                {errors.requiredScore && <p className="text-red-500 text-sm mt-1">{errors.requiredScore}</p>}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.negativeMarking}
                    onChange={(e) => setFormData(prev => ({ ...prev, negativeMarking: e.target.checked }))}
                    className="rounded border-white/30"
                  />
                  <span className="text-white">Enable Negative Marking</span>
                </label>
                
                {formData.negativeMarking && (
                  <div className="flex items-center space-x-2">
                    <Label className="text-white">Percentage:</Label>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={formData.negativeMarkingPercentage}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        negativeMarkingPercentage: parseInt(e.target.value) || 0 
                      }))}
                      className={`w-20 bg-[#1f1f35] border-white/10 text-white ${errors.negativeMarkingPercentage ? 'border-red-500' : ''}`}
                    />
                    <span className="text-white">%</span>
                  </div>
                )}
              </div>
              {errors.negativeMarkingPercentage && <p className="text-red-500 text-sm">{errors.negativeMarkingPercentage}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Section Weightage */}
        <Card className="bg-[#171726] border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Section Weightage
              <span className={`text-sm font-normal ${getTotalSectionWeightage() === 100 ? 'text-green-400' : 'text-red-400'}`}>
                Total: {getTotalSectionWeightage()}%
              </span>
            </CardTitle>
            <CardDescription className="text-white/60">
              Define the weightage for each section (must total 100%)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-white">Logical Reasoning (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.sectionWeightage.logicalReasoning}
                  onChange={(e) => updateSectionWeightage('logicalReasoning', parseInt(e.target.value) || 0)}
                  className="bg-[#1f1f35] border-white/10 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Quantitative (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.sectionWeightage.quantitative}
                  onChange={(e) => updateSectionWeightage('quantitative', parseInt(e.target.value) || 0)}
                  className="bg-[#1f1f35] border-white/10 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Technical (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.sectionWeightage.technical}
                  onChange={(e) => updateSectionWeightage('technical', parseInt(e.target.value) || 0)}
                  className="bg-[#1f1f35] border-white/10 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Verbal (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.sectionWeightage.verbal}
                  onChange={(e) => updateSectionWeightage('verbal', parseInt(e.target.value) || 0)}
                  className="bg-[#1f1f35] border-white/10 text-white"
                />
              </div>
            </div>
            {errors.sectionWeightage && <p className="text-red-500 text-sm">{errors.sectionWeightage}</p>}
          </CardContent>
        </Card>

        {/* Question Pool */}
        <Card className="bg-[#171726] border-0">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Question Pool Distribution
              <span className={`text-sm font-normal ${getTotalQuestions() === formData.numberOfQuestions ? 'text-green-400' : 'text-red-400'}`}>
                Total: {getTotalQuestions()}/{formData.numberOfQuestions}
              </span>
            </CardTitle>
            <CardDescription className="text-white/60">
              Define how many questions from each category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="text-white">Logical Reasoning</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.questionPool.logicalReasoning}
                  onChange={(e) => updateQuestionPool('logicalReasoning', parseInt(e.target.value) || 0)}
                  className="bg-[#1f1f35] border-white/10 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Quantitative</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.questionPool.quantitative}
                  onChange={(e) => updateQuestionPool('quantitative', parseInt(e.target.value) || 0)}
                  className="bg-[#1f1f35] border-white/10 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Technical</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.questionPool.technical}
                  onChange={(e) => updateQuestionPool('technical', parseInt(e.target.value) || 0)}
                  className="bg-[#1f1f35] border-white/10 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Verbal</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.questionPool.verbal}
                  onChange={(e) => updateQuestionPool('verbal', parseInt(e.target.value) || 0)}
                  className="bg-[#1f1f35] border-white/10 text-white"
                />
              </div>
            </div>
            {errors.questionPool && <p className="text-red-500 text-sm">{errors.questionPool}</p>}
          </CardContent>
        </Card>

        {/* Security & Monitoring */}
        <Card className="bg-[#171726] border-0">
          <CardHeader>
            <CardTitle className="text-white">Security & Monitoring</CardTitle>
            <CardDescription className="text-white/60">
              Configure security warnings and test behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-white">Fullscreen Violations</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.warnings.fullscreen}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    warnings: { ...prev.warnings, fullscreen: parseInt(e.target.value) || 0 }
                  }))}
                  className="bg-[#1f1f35] border-white/10 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Tab Switch Violations</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.warnings.tabSwitch}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    warnings: { ...prev.warnings, tabSwitch: parseInt(e.target.value) || 0 }
                  }))}
                  className="bg-[#1f1f35] border-white/10 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Audio Violations</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.warnings.audio}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    warnings: { ...prev.warnings, audio: parseInt(e.target.value) || 0 }
                  }))}
                  className="bg-[#1f1f35] border-white/10 text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.randomizeQuestions}
                  onChange={(e) => setFormData(prev => ({ ...prev, randomizeQuestions: e.target.checked }))}
                  className="rounded border-white/30"
                />
                <span className="text-white">Randomize Questions</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.showResultImmediately}
                  onChange={(e) => setFormData(prev => ({ ...prev, showResultImmediately: e.target.checked }))}
                  className="rounded border-white/30"
                />
                <span className="text-white">Show Results Immediately</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.allowReviewBeforeSubmit}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowReviewBeforeSubmit: e.target.checked }))}
                  className="rounded border-white/30"
                />
                <span className="text-white">Allow Review Before Submit</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
