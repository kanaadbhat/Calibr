export type Stat = {
  value: string;
  label: string;
  trend: string;
  trendDirection?: "up" | "down";
};

export type Activity = {
  intent: "success" | "info" | "announce";
  title: string;
  meta: string;
  icon: "check-circle" | "user-plus" | "megaphone"; // use string identifiers
};

export type Candidate = {
  name: string;
  role: string;
  metaLeft: string;
  metaRight: string;
  score: string;
};

export type CandidatesByStage = {
  applied: Candidate[];
  screening: Candidate[];
  interview: Candidate[];
  offer: Candidate[];
  hired: Candidate[];
};

export type Job = {
  title: string;
  subtitle: string;
  applications: number;
  inInterview: number;
  rating: number;
};

export type CodePreview = {
  title: string;
  badge: string;
  metrics: string;
};

export type DashboardData = {
  stats: Stat[];
  activities: Activity[];
  candidatesByStage: CandidatesByStage;
  codePreview: CodePreview[];
  jobs: Job[];
};


