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
  overallScore: number;
  completedAssessments: { current: number; total: number; percentage: number };
  upcomingInterviews: { count: number; nextTime: string };
  skillLevel: string;
}