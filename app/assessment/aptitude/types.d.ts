import { Dispatch, SetStateAction } from 'react';
// ===== CORE QUESTION TYPES =====
export interface AptitudeQuestion {
  id: number;
  topic: string;
  subtopic: string;
  question: string;
  options: string[];
  correct_answer: string;
}

export interface ProcessedQuestion {
  id: number;
  text: string;
  options: string[];
  correctAnswer?: number;
}

// ===== SECTION TYPES =====
export interface Section {
  name: string;
  title: string;
  questions: ProcessedQuestion[];
}

// ===== APTITUDE DATA TYPES =====
export interface AptitudeData {
  _id: string;
  totalQuestions: number;
  duration: number;
  passingScore: number;
  status: 'inactive' | 'active' | 'completed';
  sections: {
    name: string;
    description?: string;
    questionIds: number[];
    timeLimit?: number;
  }[];
  warnings: {
    fullscreen: number;
    tabSwitch: number;
    audio: number;
  };
  matchingQuestions: number;
  allQuestions: ProcessedQuestion[];
}

// ===== API RESPONSE TYPES =====
export interface FetchTestSessionResponse {
  success: boolean;
  data?: AptitudeData;
  error?: string;
}

// ===== HOOK RETURN TYPES =====
export interface UseTestQuestionsReturn {
  questions: ProcessedQuestion[];
  aptitudeData: AptitudeData | null;
  loading: boolean;
  error: string | null;
  tabSwitchWarningCount: number;
  setTabSwitchWarningCount: Dispatch<SetStateAction<number>>;
}

// ===== WARNING TYPES =====
export interface WarningState {
  tabSwitch: {
    count: number;
    maxAllowed: number;
    exceeded: boolean;
  };
  fullscreen: {
    count: number;
    maxAllowed: number;
    exceeded: boolean;
  };
  audio: {
    count: number;
    maxAllowed: number;
    exceeded: boolean;
  };
}

// ===== QUESTION STATUS TYPES =====
export type QuestionStatus = 'unattempted' | 'attempted' | 'marked';

export interface QuestionStats {
  total: number;
  attempted: number;
  marked: number;
  unattempted: number;
}

// ===== UTILITY TYPES =====
export type SectionName = 'A' | 'B' | 'C' | 'D';


