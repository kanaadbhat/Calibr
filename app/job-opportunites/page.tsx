"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const techStackOptions = [
  'C++',
  'Java',
  'Web Development',
  'Android Development',
  'Blockchain Developer',
  'Python',
  'React',
  'Node.js',
  'Machine Learning',
  'DevOps',
  'iOS Development',
  'Data Science'
];

const jobOpportunities = [
  {
    id: 1,
    company: 'Meta',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeJG171pMu9VTeNIjsIA8d5_-Sy8MvUBmZEA&s',
    title: 'Meta Frontend Developer',
    position: 'SWE II',
    timePosted: '2hr ago',
    location: 'Menlo Park, CA',
    techStack: ['React', 'JavaScript', 'CSS']
  },
  {
    id: 2,
    company: 'Google',
    logo: '/api/placeholder/60/60',
    title: 'Software Engineer',
    position: 'L4',
    timePosted: '4hr ago',
    location: 'Mountain View, CA',
    techStack: ['Java', 'Python', 'Machine Learning']
  },
  {
    id: 3,
    company: 'Microsoft',
    logo: '/api/placeholder/60/60',
    title: 'Senior Backend Developer',
    position: 'SDE II',
    timePosted: '6hr ago',
    location: 'Seattle, WA',
    techStack: ['C++', 'Azure', 'Microservices']
  },
  {
    id: 4,
    company: 'Apple',
    logo: '/api/placeholder/60/60',
    title: 'iOS Developer',
    position: 'ICT4',
    timePosted: '8hr ago',
    location: 'Cupertino, CA',
    techStack: ['Swift', 'iOS Development', 'Objective-C']
  },
  {
    id: 5,
    company: 'Amazon',
    logo: '/api/placeholder/60/60',
    title: 'Full Stack Engineer',
    position: 'SDE II',
    timePosted: '1 day ago',
    location: 'Seattle, WA',
    techStack: ['Web Development', 'AWS', 'React']
  },
  {
    id: 6,
    company: 'Netflix',
    logo: '/api/placeholder/60/60',
    title: 'Data Scientist',
    position: 'L5',
    timePosted: '1 day ago',
    location: 'Los Gatos, CA',
    techStack: ['Python', 'Data Science', 'Machine Learning']
  }
];

export default function JobOpportunitiesPage() {
  const [selectedTechStack, setSelectedTechStack] = useState<string[]>([]);
  const [experienceRange, setExperienceRange] = useState([0]);
  const [location, setLocation] = useState('');

  const handleTechStackChange = (tech: string, checked: boolean) => {
    if (checked) {
      setSelectedTechStack([...selectedTechStack, tech]);
    } else {
      setSelectedTechStack(selectedTechStack.filter(item => item !== tech));
    }
  };

  const getTimeColor = (timePosted: string) => {
    if (timePosted.includes('hr')) {
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    } else if (timePosted.includes('day')) {
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
    return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A18] to-[#0D0D20] pt-22 pb-16">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
          Job Opportunities
        </h1>
        
        <div className="flex gap-8 h-[calc(100vh-200px)]"> {/* Fixed height container */}
          {/* First Column - Fixed Filters (1/3) */}
          <div className="w-1/3 space-y-6 overflow-y-auto max-h-full pr-2">
            {/* Tech Stack Filter */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Tech Stack</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {techStackOptions.map((tech) => (
                    <div key={tech} className="flex items-center space-x-3">
                      <Checkbox
                        id={tech}
                        checked={selectedTechStack.includes(tech)}
                        onCheckedChange={(checked) => handleTechStackChange(tech, checked as boolean)}
                        className="border-white/30 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                      />
                      <Label
                        htmlFor={tech}
                        className="text-white/80 hover:text-white cursor-pointer text-sm"
                      >
                        {tech}
                      </Label>
                    </div>
                  ))}
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
                    value={experienceRange}
                    onValueChange={setExperienceRange}
                    max={40}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center">
                    <span className="text-violet-300 font-medium">
                      {experienceRange[0]} {experienceRange[0] === 1 ? 'year' : 'years'}
                      {experienceRange[0] >= 40 ? '+' : ''}
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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-violet-500"
                />
              </CardContent>
            </Card>
          </div>

          {/* Second Column - Scrollable Job Cards (2/3) */}
          <div className="w-2/3 overflow-y-auto max-h-full pr-2">
            <div className="space-y-4">
              {jobOpportunities.map((job) => (
                <Card key={job.id} className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Company Logo */}
                      <Avatar className="w-16 h-16 border-2 border-white/20">
                        <AvatarImage src={job.logo} alt={job.company} />
                        <AvatarFallback className="bg-violet-600 text-white font-bold text-lg">
                          {job.company.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Job Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-1">
                              {job.title}
                            </h3>
                            <p className="text-white/70 mb-2">{job.position}</p>
                            <p className="text-white/60 text-sm">{job.location}</p>
                            
                            {/* Tech Stack Tags */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {job.techStack.map((tech) => (
                                <Badge
                                  key={tech}
                                  variant="secondary"
                                  className="bg-violet-600/20 text-violet-300 border border-violet-500/30 text-xs"
                                >
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Time Posted Badge */}
                          <Badge
                            variant="outline"
                            className={`ml-4 ${getTimeColor(job.timePosted)} border`}
                          >
                            Applications opened {job.timePosted}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
