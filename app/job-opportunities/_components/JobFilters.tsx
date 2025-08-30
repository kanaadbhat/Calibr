"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { JobFilters } from '../types';

interface JobFiltersProps {
  techStackOptions: string[];
  techStackLoading: boolean;
  filters: JobFilters;
  onTechStackChange: (tech: string, checked: boolean) => void;
  onExperienceChange: (experience: number[]) => void;
  onLocationChange: (location: string) => void;
}

const JobFiltersComponent: React.FC<JobFiltersProps> = ({
  techStackOptions,
  techStackLoading,
  filters,
  onTechStackChange,
  onExperienceChange,
  onLocationChange,
}) => {
  return (
    <div className="w-1/3 space-y-6 overflow-y-auto max-h-full pr-2">
      {/* Tech Stack Filter */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tech Stack</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {techStackLoading ? (
              // Tech Stack Loading Skeleton
              Array(12).fill(0).map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="w-24 h-4" />
                </div>
              ))
            ) : (
              techStackOptions.map((tech) => (
                <div key={tech} className="flex items-center space-x-3">
                  <Checkbox
                    id={tech}
                    checked={filters.techStack.includes(tech)}
                    onCheckedChange={(checked) => onTechStackChange(tech, checked as boolean)}
                    className="border-white/30 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                  />
                  <Label
                    htmlFor={tech}
                    className="text-white/80 hover:text-white cursor-pointer text-sm"
                  >
                    {tech}
                  </Label>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Experience Filter */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Experience</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-white/70">
              <span>0 years</span>
              <span>40+ years</span>
            </div>
            <Slider
              value={filters.experience}
              onValueChange={onExperienceChange}
              max={40}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="text-center">
              <span className="text-violet-300 font-medium">
                {filters.experience[0]} {filters.experience[0] === 1 ? 'year' : 'years'}
                {filters.experience[0] >= 40 ? '+' : ''}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Filter */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Location</h3>
          <Input
            placeholder="Enter location..."
            value={filters.location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-violet-500"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default JobFiltersComponent;
