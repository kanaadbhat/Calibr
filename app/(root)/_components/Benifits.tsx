import React from 'react';
import { Clock, Shield, TrendingUp, Users, CheckCircle } from 'lucide-react';

const Benefits: React.FC = () => {
  const benefits = [
    {
      icon: Clock,
      title: 'Save 80% of Hiring Time',
      description: 'Automate screening, interviews, and evaluation processes to dramatically reduce time-to-hire.',
      stat: '80%',
      statLabel: 'Time Saved',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: Shield,
      title: 'Reduce Hiring Bias',
      description: 'AI-driven assessments eliminate unconscious bias and ensure fair evaluation for all candidates.',
      stat: '95%',
      statLabel: 'Bias Reduction',
      color: 'from-rose-500 to-rose-600'
    },
    {
      icon: TrendingUp,
      title: 'Improve Candidate Experience',
      description: 'Streamlined process with instant feedback and transparent communication enhances candidate satisfaction.',
      stat: '4.8/5',
      statLabel: 'Candidate Rating',
      color: 'from-violet-500 to-violet-600'
    },
    {
      icon: Users,
      title: 'AI Analytics & ML',
      description: 'Advanced machine learning continuously improves hiring accuracy and provides actionable insights.',
      stat: '92%',
      statLabel: 'Accuracy Rate',
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  const additionalBenefits = [
    'Integrate with 50+ ATS platforms',
    'GDPR & SOC 2 compliant',
    '24/7 customer support',
    'Custom branding options',
    'Multi-language support',
    'Advanced reporting & analytics'
  ];

  return (
    <section id="benefits" className="py-20 bg-gradient-to-br from-[#0A0A18] to-[#0D0D20]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Why Choose <span className="bg-gradient-to-r from-indigo-300 to-rose-300 bg-clip-text text-transparent">Calibr</span>?
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Transform your recruitment process with measurable results and proven benefits
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center group">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <benefit.icon className="h-8 w-8 text-white" />
              </div>
              
              <div className="mb-4">
                <div className={`text-3xl font-bold bg-gradient-to-r ${benefit.color} bg-clip-text text-transparent`}>
                  {benefit.stat}
                </div>
                <div className="text-sm text-white/60 font-medium">
                  {benefit.statLabel}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-3">
                {benefit.title}
              </h3>
              
              <p className="text-white/60 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Benefits Grid */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-rose-500/10 rounded-3xl p-8 lg:p-12 border border-white/10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">
                Everything You Need for Modern Hiring
              </h3>
              <p className="text-white/60 text-lg mb-8">
                Calibr provides a comprehensive suite of tools and features designed to streamline 
                your entire recruitment workflow from job posting to final hiring decision.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {additionalBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-white/80">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h4 className="text-xl font-bold text-white mb-6">ROI Calculator</h4>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-white/70">Time saved per hire</span>
                  <span className="font-bold text-indigo-300">15 hours</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-white/70">Cost reduction per hire</span>
                  <span className="font-bold text-emerald-300">$2,400</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-white/70">Quality improvement</span>
                  <span className="font-bold text-violet-300">+40%</span>
                </div>
                
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">Annual Savings</span>
                    <span className="text-2xl font-bold text-indigo-300">$120K+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;