import React from 'react';
import { Video, Brain, BarChart3, Calendar, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Features: React.FC = () => {
  const features = [
    {
      icon: Video,
      title: 'AI-Powered Video Interviews',
      description: 'Automated video interviews with real-time AI analysis and auto-scoring based on responses, body language, and communication skills.',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: Brain,
      title: 'Candidate Skill Analysis',
      description: 'Deep learning algorithms evaluate technical skills, soft skills, and cultural fit with bias-free, objective assessments.',
      color: 'from-rose-500 to-rose-600'
    },
    {
      icon: BarChart3,
      title: 'ATS Integration',
      description: 'Seamlessly integrate with your existing Applicant Tracking System and popular HR tools for streamlined workflows.',
      color: 'from-violet-500 to-violet-600'
    },
    {
      icon: Calendar,
      title: 'Automated Scheduling',
      description: 'Smart scheduling system that automatically coordinates interviews and sends reminders to candidates and interviewers.',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      icon: Shield,
      title: 'Bias-Free Evaluation',
      description: 'Eliminate unconscious bias with AI-driven assessments that focus purely on skills, qualifications, and job relevance.',
      color: 'from-amber-500 to-amber-600'
    },
    {
      icon: Zap,
      title: 'Instant Reports',
      description: 'Get comprehensive candidate reports instantly with detailed insights, scores, and recommendations for informed decisions.',
      color: 'from-emerald-500 to-emerald-600'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-[#0A0A18] to-[#0D0D20]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Powerful Features for Modern Recruitment
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Everything you need to revolutionize your hiring process with cutting-edge AI technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4">
                {feature.title}
              </h3>
              
              <p className="text-white/60 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Feature Highlight */}
        <div className="mt-20 bg-gradient-to-r from-indigo-500/20 to-rose-500/20 rounded-3xl p-8 lg:p-12 border border-white/10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Advanced AI Analytics Dashboard
              </h3>
              <p className="text-white/60 text-lg mb-6">
                Get real-time insights into your hiring pipeline with comprehensive analytics, 
                candidate scoring, and performance metrics that help you make data-driven decisions.
              </p>
              <Button className="bg-gradient-to-r from-indigo-500 to-rose-500 text-white px-6 py-3 h-full rounded-lg font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
                Explore Dashboard
              </Button>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Hiring Efficiency</span>
                  <span className="font-bold text-white">+85%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full h-2 w-4/5"></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Time to Hire</span>
                  <span className="font-bold text-white">-70%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full h-2 w-3/4"></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Quality Score</span>
                  <span className="font-bold text-white">94%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full h-2 w-11/12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;