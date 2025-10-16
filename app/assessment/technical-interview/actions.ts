"use server";

import { connectToDatabase } from "@/utils/connectDb";
import TechnicalInterviewModel from "@/models/technicalInterview.model";
import { getGeminiResponse } from "@/ai-engine/ai-call/aiCall";
import { buildQueue1Prompt, buildQueue2Prompt, buildAnalysisPrompt, buildFollowupPrompt } from "@/ai-engine/prompts/technicalInterview";

interface Question {
  id: string;
  question: string;
  category: "technical" | "non-technical" | "followup";
  difficulty?: "medium" | "hard";
  answer?: string;
  parentQuestion?: string;
}

interface Queues {
  queue1: Question[];
  queue2: Question[];
  queue3: Question[];
}

function generateId(): string {
  return 'q_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function ensureIds(questions: Question[]): Question[] {
  return questions.map(q => ({
    ...q,
    id: q.id || generateId()
  }));
}

async function callGeminiAPI(prompt: string): Promise<string | null> {
  try {
    const result = await getGeminiResponse(prompt, false);
    return typeof result === 'string' ? result : JSON.stringify(result);
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}

export async function getInterviewConfig(interviewId: string) {
  try {
    await connectToDatabase();
    const config = await TechnicalInterviewModel.findById(interviewId).lean();
    
    if (!config) {
      return { success: false, error: 'Interview configuration not found' };
    }

    // Serialize to plain JSON-safe object (convert ObjectIds/Dates to strings)
    const serialized = JSON.parse(JSON.stringify(config));
    return { success: true, config: serialized };
  } catch (error) {
    console.error('Error fetching interview config:', error);
    return { success: false, error: 'Failed to fetch interview configuration' };
  }
}

export async function generateQuestions(resume: string): Promise<{ success: boolean; queues?: Queues; error?: string }> {
  try {
    // Generate Queue 1 questions
    const q1Prompt = buildQueue1Prompt(resume);

    const q1Result = await callGeminiAPI(q1Prompt);
    let queue1: Question[] = [];

    if (q1Result) {
      try {
        const jsonMatch = q1Result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          queue1 = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('Parse error:', e);
      }
    }

    queue1 = ensureIds(queue1);

    // Generate Queue 2 questions for technical topics
    const technicalQuestions = queue1.filter(q => q.category === "technical" && q.answer);
    let queue2: Question[] = [];

    for (const tq of technicalQuestions.slice(0, 3)) { // Limit to 3 for performance
      const q2Prompt = buildQueue2Prompt(tq.question, tq.answer!);

      const q2Result = await callGeminiAPI(q2Prompt);
      
      if (q2Result) {
        try {
          const jsonMatch = q2Result.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const questions = JSON.parse(jsonMatch[0]);
            const deepDiveQuestions = questions.map((q: any) => ({
              question: q.question,
              category: 'technical' as const,
              difficulty: q.difficulty,
              answer: q.answer,
              parentQuestion: tq.question,
              id: generateId()
            }));
            queue2.push(...deepDiveQuestions);
          }
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
    }

    return {
      success: true,
      queues: {
        queue1,
        queue2,
        queue3: []
      }
    };

  } catch (error) {
    console.error('Error generating questions:', error);
    return { success: false, error: 'Failed to generate questions' };
  }
}

export async function analyzeAnswer(
  question: string,
  correctAnswer: string,
  userAnswer: string,
  currentQueues: Queues,
  currentQuestion: Question
): Promise<{ updatedQueues?: Queues; correctness?: number }> {
  try {
    // Analyze correctness
    const analysisPrompt = buildAnalysisPrompt(question, correctAnswer, userAnswer);

    const analysisResult = await callGeminiAPI(analysisPrompt);
    let correctness = 50;

    if (analysisResult) {
      try {
        const jsonMatch = analysisResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          correctness = analysis.correctness || 50;
        }
      } catch (e) {
        console.error('Parse error:', e);
      }
    }

    const updatedQueues = { ...currentQueues };

    // Handle based on correctness
    if (correctness < 30) {
      // Generate follow-up for wrong answer
      const followupPrompt = buildFollowupPrompt(question, userAnswer);

      const followupResult = await callGeminiAPI(followupPrompt);
      
      if (followupResult) {
        try {
          const jsonMatch = followupResult.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const followup = JSON.parse(jsonMatch[0]);
            updatedQueues.queue3.push({
              question: followup.question,
              category: 'followup',
              parentQuestion: question,
              id: generateId()
            });
          }
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
    } else if (correctness >= 80 && currentQuestion.difficulty === 'medium') {
      // Move hard questions to queue1 for good answers
      const hardQuestion = updatedQueues.queue2.find(q => 
        q.parentQuestion === currentQuestion.parentQuestion && q.difficulty === 'hard'
      );
      
      if (hardQuestion) {
        updatedQueues.queue2 = updatedQueues.queue2.filter(q => q.id !== hardQuestion.id);
        updatedQueues.queue1.unshift(hardQuestion);
      }
    }

    return { updatedQueues, correctness };

  } catch (error) {
    console.error('Error analyzing answer:', error);
    return {};
  }
}