'use server'
import { connectToDatabase } from '@/utils/connectDb'
import Aptitude from '@/models/aptitude.model'
import questionsData from './aptitude_questions.json'
import type { 
  FetchTestSessionResponse, 
  AptitudeQuestion, 
  ProcessedQuestion,
  AptitudeData 
} from './types'

// Type guard to check if questions data is valid
function isValidQuestionsData(data: any): data is { questions: AptitudeQuestion[] } {
  return data && Array.isArray(data.questions) && data.questions.length > 0;
}

// Process raw question data to match interface
function processQuestion(question: AptitudeQuestion): ProcessedQuestion {
  return {
    id: question.id,
    text: question.question,
    options: question.options,
    correctAnswer: question.options.findIndex(option => option === question.correct_answer)
  };
}

export async function fetchTestSession(aptitudeId: string): Promise<FetchTestSessionResponse> {
  try {
    await connectToDatabase()

    if (!aptitudeId) {
      return { 
        success: false, 
        error: 'Aptitude ID is required' 
      };
    }

    const aptitude = await Aptitude.findById(aptitudeId);
    
    if (!aptitude) {
      return { 
        success: false, 
        error: 'No aptitude assessment found for the provided ID' 
      };
    }

    if (!isValidQuestionsData(questionsData)) {
      return { 
        success: false, 
        error: 'Invalid questions data structure' 
      };
    }

    const questionsArray = questionsData.questions as AptitudeQuestion[];
    const questionIds = aptitude.questionIds || [];
    
    // Filter questions based on aptitude 
    const matchingQuestions = questionsArray
      .filter((q: AptitudeQuestion) => questionIds.includes(q.id))
      .map(processQuestion);
    
    console.log(`✅ Loaded ${matchingQuestions.length} questions for assessment ${aptitudeId}`);
    
    const aptitudeData: AptitudeData = {
      _id: String(aptitude._id),
      totalQuestions: aptitude.totalQuestions,
      passingScore: aptitude.passingScore,
      duration: aptitude.duration,
      status: aptitude.status,
      sections: aptitude.sections.map(section => ({
        name: section.name,
        description: section.description || '',
        questionIds: section.questionIds,
        timeLimit: section.timeLimit || undefined
      })),
      warnings: {
        fullscreen: aptitude.warnings.fullscreen,
        tabSwitch: aptitude.warnings.tabSwitch,
        audio: aptitude.warnings.audio
      },
      matchingQuestions: matchingQuestions.length,
      allQuestions: matchingQuestions
    };

    return {
      success: true,
      data: aptitudeData
    };

  } catch (error) {
    console.error('❌ Error in fetchTestSession:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

