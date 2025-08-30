'use server';

import { JobOpportunity } from './interfaces';

export async function getJobOpportunities(): Promise<JobOpportunity[]> {
  // Future: Replace with actual API call
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  return [
    {
      id: 1,
      company: 'Meta',
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeJG171pMu9VTeNIjsIA8d5_-Sy8MvUBmZEA&s',
      title: 'Meta Frontend Developer',
      position: 'SWE II',
      timePosted: '2hr ago',
      location: 'Menlo Park, CA',
      techStack: ['React', 'JavaScript', 'CSS'],
      description: 'Join Meta as a Frontend Developer and work on cutting-edge web technologies.',
      salary: '$150k - $200k',
      type: 'Full-time'
    },
    {
      id: 2,
      company: 'Google',
      logo: '/api/placeholder/60/60',
      title: 'Software Engineer',
      position: 'L4',
      timePosted: '4hr ago',
      location: 'Mountain View, CA',
      techStack: ['Java', 'Python', 'Machine Learning'],
      description: 'Build innovative solutions that impact billions of users worldwide.',
      salary: '$140k - $180k',
      type: 'Full-time'
    },
    {
      id: 3,
      company: 'Microsoft',
      logo: '/api/placeholder/60/60',
      title: 'Senior Backend Developer',
      position: 'SDE II',
      timePosted: '6hr ago',
      location: 'Seattle, WA',
      techStack: ['C++', 'Azure', 'Microservices'],
      description: 'Work on scalable backend systems powering Microsoft cloud services.',
      salary: '$160k - $220k',
      type: 'Full-time'
    },
    {
      id: 4,
      company: 'Apple',
      logo: '/api/placeholder/60/60',
      title: 'iOS Developer',
      position: 'ICT4',
      timePosted: '8hr ago',
      location: 'Cupertino, CA',
      techStack: ['Swift', 'iOS Development', 'Objective-C'],
      description: 'Create amazing iOS applications for millions of Apple users.',
      salary: '$145k - $190k',
      type: 'Full-time'
    },
    {
      id: 5,
      company: 'Amazon',
      logo: '/api/placeholder/60/60',
      title: 'Full Stack Engineer',
      position: 'SDE II',
      timePosted: '1 day ago',
      location: 'Seattle, WA',
      techStack: ['Web Development', 'AWS', 'React'],
      description: 'Build end-to-end solutions on AWS with modern web technologies.',
      salary: '$135k - $175k',
      type: 'Full-time'
    },
    {
      id: 6,
      company: 'Netflix',
      logo: '/api/placeholder/60/60',
      title: 'Data Scientist',
      position: 'L5',
      timePosted: '1 day ago',
      location: 'Los Gatos, CA',
      techStack: ['Python', 'Data Science', 'Machine Learning'],
      description: 'Use data science to enhance user experience and content recommendations.',
      salary: '$170k - $230k',
      type: 'Full-time'
    }
  ];
}

export async function getTechStackOptions(): Promise<string[]> {
  // Future: Replace with actual API call
  return [
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
}

export async function getJobOpportunityById(id: string): Promise<JobOpportunity | null> {
  // Future: Replace with actual API call
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
  
  const jobId = parseInt(id);
  const jobs = await getJobOpportunities();
  const baseJob = jobs.find(job => job.id === jobId);
  
  if (!baseJob) return null;

  // Enhanced job details for the details page
  const jobDetails: JobOpportunity = {
    ...baseJob,
    profileMatch: 92,
    postedDate: '2 days ago',
    applicants: 47,
    requirements: [
      '5+ years of experience in React development',
      'Strong proficiency in JavaScript/TypeScript',
      'Experience with modern frontend build tools',
      'Knowledge of state management (Redux, Context API)',
      'Familiarity with testing frameworks (Jest, React Testing Library)',
      'Understanding of RESTful APIs and GraphQL',
      'Experience with version control systems (Git)'
    ],
    responsibilities: [
      'Develop and maintain high-quality React applications',
      'Collaborate with cross-functional teams to define and implement features',
      'Write clean, maintainable, and efficient code',
      'Participate in code reviews and provide constructive feedback',
      'Optimize applications for maximum speed and scalability',
      'Stay up-to-date with emerging technologies and industry trends',
      'Mentor junior developers and contribute to team knowledge sharing'
    ],
    startDate: 'Immediate',
    selectionRounds: [
      'Initial Screening',
      'Technical Assessment',
      'System Design Round',
      'Behavioral Interview',
      'Final Interview with VP'
    ],
    benefits: [
      'Competitive salary and equity package',
      'Comprehensive health insurance',
      'Flexible working hours',
      'Professional development budget',
      'Remote work options'
    ],
    workMode: 'Hybrid (3 days in office)',
    experience: '5-8 years'
  };

  return jobDetails;
}