export interface Job {
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  match: string;
  skills: string;
}

export interface Interview {
  id: string;
  company: string;
  type: string;
  time: string;
  status: string;
  urgent: boolean;
}

export interface Activity {
  title: string;
  description: string;
  time: string;
  icon: any;
  type: 'success' | 'info';
}

export interface Skill {
  name: string;
  level: string;
  progress: number;
}

export interface PerformanceData {
  overallScore: { 
    current: number; 
    previous: number; 
    trend: 'up' | 'down' | 'stable';
    tip: string;
  };
  completedAssessments: { 
    current: number; 
    total: number; 
    percentage: number;
    lastMonthCompleted: number;
    tip: string;
  };
  upcomingInterviews: { 
    count: number; 
    nextTime: string;
    successRate: number;
    lastMonthCount: number;
    tip: string;
  };
  skillLevel: {
    current: string;
    progress: number;
    nextLevel: string;
    improvement: number;
    tip: string;
  };
}