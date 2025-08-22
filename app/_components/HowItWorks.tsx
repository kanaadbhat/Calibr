import React from 'react';
import { Upload, Brain, UserCheck, ArrowRight } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Upload,
      title: 'Upload Resume or Job Description',
      description: 'Candidates upload resumes, employers post job descriptions. Our AI instantly analyzes requirements and qualifications.',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: Brain,
      title: 'AI-Powered Evaluation',
      description: 'Advanced AI conducts comprehensive assessments through aptitude tests, coding challenges, and adaptive interviews.',
      color: 'from-rose-500 to-rose-600'
    },
    {
      icon: UserCheck,
      title: 'Intelligent Matching & Selection',
      description: 'Get AI-curated candidate rankings with detailed skill analysis and bias-free evaluation reports.',
      color: 'from-violet-500 to-violet-600'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[#0D0D20] to-[#0A0A18]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            How <span className="bg-gradient-to-r from-indigo-300 to-rose-300 bg-clip-text text-transparent">Calibr</span> Works
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Revolutionize your hiring process with our AI-powered recruitment platform
          </p>
        </div>

        <div className="relative">
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center group">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300 relative`}>
                    <step.icon className="h-10 w-10 text-white" />
                    
                    {/* Step Number */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#0A0A18] border-2 border-white/10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-white/60 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-6 text-white/20">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button className="bg-gradient-to-r from-indigo-500 to-rose-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
            See It In Action
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;