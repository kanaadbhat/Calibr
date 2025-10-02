'use server'
import { connectToDatabase } from '@/utils/connectDb'
import Aptitude from '@/models/aptitude.model'
import questionsData from './aptitude_questions.json'

export async function fetchTestSession(aptitudeId?: string) {
  try {
    await connectToDatabase()

    const aptitude = aptitudeId
      ? await Aptitude.findById( aptitudeId )
      : null;
    
    if (aptitude) {
      
      try {
        const questionsArray = (questionsData as any).questions;
        if (Array.isArray(questionsArray)) {
          const questionIds = aptitude.questionIds || [];
          
          
          const matchingQuestions = questionsArray
            .filter((q: any) => questionIds.includes(q.id));
          
          console.log(` Loaded ${matchingQuestions.length} questions for assessment`);
          
          return {
            success: true,
            data: {
              aptitudeId: String(aptitude._id),
              totalQuestions: aptitude.totalQuestions,
              passingScore:aptitude.passingScore,
              duration: aptitude.duration,
              status: aptitude.status,
              sections: aptitude.sections.map(section => ({
                name: section.name,
                description: section.description || '',
                questionIds: section.questionIds,
                timeLimit: section.timeLimit || null
              })),
              warnings: {
                fullscreen: aptitude.warnings.fullscreen,
                tabSwitch: aptitude.warnings.tabSwitch,
                audio: aptitude.warnings.audio
              },
              matchingQuestions: matchingQuestions.length,
              allQuestions: matchingQuestions.map((q: any) => ({
                id: q.id,
                topic: q.topic,
                subtopic: q.subtopic,
                question: q.question,
                options: q.options,
                correctAnswer: q.correct_answer
              }))
            }
          };
        } else {
          return { success: false, error: 'Invalid JSON structure' };
        }
      } catch (jsonError) {
        console.error('❌ Error loading questions:', jsonError);
        return { success: false, error: 'Failed to load questions data' };
      }
    } else {
      return { success: false, error: 'No aptitude found for the provided assessmentId' };
    }
  } catch (error) {
    console.error('❌ Error in fetchTestSession:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

