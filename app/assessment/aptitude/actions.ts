'use server'
import { connectToDatabase } from '@/utils/connectDb'
import Aptitude from '@/models/aptitude.model'
import Candidate from '@/models/candidate.model'
import TestResult from '@/models/testResult.model'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
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

   
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return { 
        success: false, 
        error: 'Authentication required' 
      };
    }

    if (!aptitudeId) {
      return { 
        success: false, 
        error: 'Aptitude ID is required' 
      };
    }

    // Use session user ID instead of hardcoded candidate ID
    const authenticatedCandidateId = session.user?._id;
    
    if (!authenticatedCandidateId) {
      return { 
        success: false, 
        error: 'User ID not found in session' 
      };
    }
    
    console.log(' Validating candidate:', authenticatedCandidateId);
    console.log(' For aptitude assessment:', aptitudeId);

    const aptitude = await Aptitude.findById(aptitudeId);
    
    if (!aptitude) {
      console.log(' Aptitude assessment not found');
      return { 
        success: false, 
        error: 'No aptitude assessment found for the provided ID' 
      };
    }

    console.log(' Aptitude assessment found');
    console.log(' Authorized candidates:', aptitude.candidateIds);

    // Validate candidate exists
    const candidate = await Candidate.findById(authenticatedCandidateId);
    if (!candidate) {
      console.log('❌ Candidate not found in database');
      return {
        success: false,
        error: 'Candidate not found. Please check your candidate ID.'
      };
    }

    console.log(' Candidate found:', candidate.firstName, candidate.lastName);
    console.log(' Candidate email:', candidate.email);

    // Check if candidate is authorized for this assessment
    const isAuthorized = aptitude.candidateIds.some(id => id.toString() === String(candidate._id));
    console.log(' Authorization check:', isAuthorized);
    
    if (!isAuthorized) {
      console.log(' Candidate not authorized for this assessment');
      return {
        success: false,
        error: 'You are not authorized to take this assessment.'
      };
    }

    console.log('✅ Candidate authorized successfully!');

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
    
    console.log(` Loaded ${matchingQuestions.length} questions for assessment ${aptitudeId}`);
    
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

// Submit test and calculate score
export async function submitTest(
  aptitudeId: string, 
  candidateId: string, 
  answers: Record<string, number>,
  timeTaken: number,
  warnings?: {
    tabSwitch: { count: number; maxAllowed: number; exceeded: boolean };
    fullscreen: { count: number; maxAllowed: number; exceeded: boolean };
    audio: { count: number; maxAllowed: number; exceeded: boolean };
  },
  terminatedDueToWarnings?: boolean,
  terminationReason?: string
): Promise<{success: boolean, data?: any, error?: string}> {
  try {
    await connectToDatabase();
    
    // Get server session for authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return { 
        success: false, 
        error: 'Authentication required' 
      };
    }

    // Verify the candidateId matches the authenticated user
    if (session.user?._id !== candidateId) {
      return { 
        success: false, 
        error: 'Unauthorized: Candidate ID mismatch' 
      };
    }
    
    console.log(' Submitting test for candidate:', candidateId);
    console.log(' Aptitude ID:', aptitudeId);
    console.log(' Answers submitted:', Object.keys(answers).length);
    console.log('Time taken:', timeTaken, 'seconds');

    // Get aptitude details
    const aptitude = await Aptitude.findById(aptitudeId);
    if (!aptitude) {
      return { success: false, error: 'Aptitude assessment not found' };
    }

    // Get questions data
    if (!isValidQuestionsData(questionsData)) {
      return { success: false, error: 'Invalid questions data' };
    }

    const questionsArray = questionsData.questions as AptitudeQuestion[];
    const questionIds = aptitude.questionIds || [];
    
    // Filter questions based on aptitude
    const matchingQuestions = questionsArray
      .filter((q: AptitudeQuestion) => questionIds.includes(q.id))
      .map(processQuestion);

    // Calculate score
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    // Create sections for scoring
    const sections = [
      { name: 'A', questions: matchingQuestions.slice(0, Math.ceil(matchingQuestions.length / 4)) },
      { name: 'B', questions: matchingQuestions.slice(Math.ceil(matchingQuestions.length / 4), Math.ceil(matchingQuestions.length / 2)) },
      { name: 'C', questions: matchingQuestions.slice(Math.ceil(matchingQuestions.length / 2), Math.ceil(3 * matchingQuestions.length / 4)) },
      { name: 'D', questions: matchingQuestions.slice(Math.ceil(3 * matchingQuestions.length / 4)) }
    ];

    sections.forEach(section => {
      section.questions.forEach((question, idx) => {
        const questionKey = `${section.name}-${idx + 1}`;
        const userAnswer = answers[questionKey];
        const correctAnswer = question.correctAnswer ?? -1;
        
        if (userAnswer === undefined) {
          unattemptedCount++;
        } else if (userAnswer === correctAnswer) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      });
    });

    const totalQuestions = matchingQuestions.length;
    const score = correctCount;
    const percentage = (score / totalQuestions) * 100;
    const passed = percentage >= aptitude.passingScore;

    console.log(' Score Calculation:');
    console.log(' Correct:', correctCount);
    console.log(' Incorrect:', incorrectCount);
    console.log(' Unattempted:', unattemptedCount);
    console.log(' Percentage:', percentage.toFixed(2) + '%');
    console.log(' Passed:', passed);

    // Save test result (without storing correct answers - they're in questions data)
    const testResult = new TestResult({
      candidateId,
      aptitudeId,
      answers, // Only user answers
      score,
      totalQuestions,
      correctCount,
      incorrectCount,
      unattemptedCount,
      percentage,
      passed,
      passingScore: aptitude.passingScore,
      timeTaken,
      submittedAt: new Date(),
      status: terminatedDueToWarnings ? 'incomplete' : 'completed',
      warnings: warnings || {
        tabSwitch: { count: 0, maxAllowed: aptitude.warnings.tabSwitch, exceeded: false },
        fullscreen: { count: 0, maxAllowed: aptitude.warnings.fullscreen, exceeded: false },
        audio: { count: 0, maxAllowed: aptitude.warnings.audio, exceeded: false }
      },
      terminatedDueToWarnings: terminatedDueToWarnings || false,
      terminationReason: terminationReason
    });

    await testResult.save();
    console.log('💾 Test result saved to database');

    return {
      success: true,
      data: {
        score,
        totalQuestions,
        correctCount,
        incorrectCount,
        unattemptedCount,
        percentage,
        passed,
        passingScore: aptitude.passingScore,
        timeTaken
      }
    };

  } catch (error) {
    console.error(' Error in submitTest:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Auto-save test when warnings exceeded
export async function autoSaveTest(
  aptitudeId: string,
  candidateId: string,
  answers: Record<string, number>,
  timeTaken: number,
  warnings: {
    tabSwitch: { count: number; maxAllowed: number; exceeded: boolean };
    fullscreen: { count: number; maxAllowed: number; exceeded: boolean };
    audio: { count: number; maxAllowed: number; exceeded: boolean };
  },
  terminationReason: string
): Promise<{success: boolean, data?: any, error?: string}> {
  try {
    await connectToDatabase();
    
    // Get server session for authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return { 
        success: false, 
        error: 'Authentication required' 
      };
    }

    // Verify the candidateId matches the authenticated user
    if (session.user?._id !== candidateId) {
      return { 
        success: false, 
        error: 'Unauthorized: Candidate ID mismatch' 
      };
    }
    
    console.log('🔄 Auto-saving test due to warnings exceeded');
    console.log(' Candidate:', candidateId);
    console.log(' Termination reason:', terminationReason);

    // Get aptitude details
    const aptitude = await Aptitude.findById(aptitudeId);
    if (!aptitude) {
      return { success: false, error: 'Aptitude assessment not found' };
    }

    // Get questions data for validation
    if (!isValidQuestionsData(questionsData)) {
      return { success: false, error: 'Invalid questions data' };
    }

    const questionsArray = questionsData.questions as AptitudeQuestion[];
    const questionIds = aptitude.questionIds || [];
    
    // Filter questions based on aptitude
    const matchingQuestions = questionsArray
      .filter((q: AptitudeQuestion) => questionIds.includes(q.id))
      .map(processQuestion);

    // Calculate score with current answers
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    // Create sections for scoring
    const sections = [
      { name: 'A', questions: matchingQuestions.slice(0, Math.ceil(matchingQuestions.length / 4)) },
      { name: 'B', questions: matchingQuestions.slice(Math.ceil(matchingQuestions.length / 4), Math.ceil(matchingQuestions.length / 2)) },
      { name: 'C', questions: matchingQuestions.slice(Math.ceil(matchingQuestions.length / 2), Math.ceil(3 * matchingQuestions.length / 4)) },
      { name: 'D', questions: matchingQuestions.slice(Math.ceil(3 * matchingQuestions.length / 4)) }
    ];

    sections.forEach(section => {
      section.questions.forEach((question, idx) => {
        const questionKey = `${section.name}-${idx + 1}`;
        const userAnswer = answers[questionKey];
        const correctAnswer = question.correctAnswer ?? -1;
        
        if (userAnswer === undefined) {
          unattemptedCount++;
        } else if (userAnswer === correctAnswer) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      });
    });

    const totalQuestions = matchingQuestions.length;
    const score = correctCount;
    const percentage = (score / totalQuestions) * 100;
    const passed = percentage >= aptitude.passingScore;

    console.log(' Auto-save score calculation:');
    console.log(' Correct:', correctCount);
    console.log(' Incorrect:', incorrectCount);
    console.log(' Unattempted:', unattemptedCount);
    console.log(' Percentage:', percentage.toFixed(2) + '%');

    // Save test result with incomplete status
    const testResult = new TestResult({
      candidateId,
      aptitudeId,
      answers,
      score,
      totalQuestions,
      correctCount,
      incorrectCount,
      unattemptedCount,
      percentage,
      passed,
      passingScore: aptitude.passingScore,
      timeTaken,
      submittedAt: new Date(),
      status: 'incomplete',
      warnings,
      terminatedDueToWarnings: true,
      terminationReason
    });

    await testResult.save();
    console.log(' Auto-saved test result to database');

    return {
      success: true,
      data: {
        score,
        totalQuestions,
        correctCount,
        incorrectCount,
        unattemptedCount,
        percentage,
        passed,
        passingScore: aptitude.passingScore,
        timeTaken,
        terminatedDueToWarnings: true,
        terminationReason
      }
    };

  } catch (error) {
    console.error('❌ Error in autoSaveTest:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

