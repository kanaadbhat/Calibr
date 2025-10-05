"use client";
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Lightbulb } from 'lucide-react';
import { Skill } from '../../types.d';

interface SkillAnalysisProps {
  skills: Skill[];
  radarData: { skill: string; value: number }[];
  recommendation: string;
}

const SkillAnalysis = ({ skills, radarData, recommendation }: SkillAnalysisProps) => {
  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Target className="w-6 h-6 text-white/70" />
          <span className="text-lg sm:text-xl font-bold">Skill Analysis</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6">
        {/* Radar Chart */}
        <div className="w-full flex justify-center">
          <Card className="bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border-indigo-500/30 p-3 sm:p-4" style={{ width: '100%', maxWidth: 300, height: 250 }}>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#6366f1" />
                <PolarAngleAxis dataKey="skill" stroke="#fff" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#fff" />
                <Radar name="Skill" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Skills List */}
        <div className="space-y-3 sm:space-y-4">
          {skills.map((skill, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium text-sm sm:text-base">{skill.name}</span>
                <span className="text-indigo-200 text-xs sm:text-sm">{skill.level}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-violet-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${skill.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Recommendation */}
        <Card className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-amber-500/30">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start space-x-2">
              <Lightbulb className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-amber-200 font-medium text-sm sm:text-base mb-2">Recommendation</div>
                <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">{recommendation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default SkillAnalysis;
