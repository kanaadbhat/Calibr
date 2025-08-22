"use client"
import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Mail, Building, User } from 'lucide-react';

const CallToAction: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    employees: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Demo request:', formData);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-900 via-[#0D0D20] to-rose-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Start <span className="bg-gradient-to-r from-indigo-300 to-rose-300 bg-clip-text text-transparent">Smarter Hiring</span> Today
            </h2>
            <p className="text-xl text-white/80 mb-8 leading-relaxed">
              Join thousands of companies using Calibr to hire better candidates faster. 
              Transform your recruitment process with AI-powered intelligence.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
                <span className="text-white/80">Free 14-day trial</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
                <span className="text-white/80">No credit card required</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
                <span className="text-white/80">Setup in under 5 minutes</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
                <span className="text-white/80">24/7 customer support</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-gradient-to-r from-indigo-500 to-rose-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center">
                Try Calibr Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
              
              <button className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300">
                Watch Demo Video
              </button>
            </div>
          </div>

          {/* Right Form */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">
                Book Your Personal Demo
              </h3>
              <p className="text-white/60">
                See how Calibr can transform your hiring process
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Full Name"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Work Email"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Company Name"
                    required
                  />
                </div>
              </div>

              <div>
                <select
                  value={formData.employees}
                  onChange={(e) => handleInputChange('employees', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Company Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-1000">201-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-rose-500 text-white py-4 rounded-lg font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center"
              >
                Book Demo Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            </form>

            <p className="text-xs text-white/40 text-center mt-4">
              By submitting this form, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;