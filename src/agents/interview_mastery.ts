
import { UserProfile } from './onboarding';

export interface InterviewSession {
  userId: string;
  questionCount: number;
  currentScore: number;
  masteryGated: boolean;
  history: { question: string, answer: string, score: number, feedback: string }[];
}

export class InterviewMasteryAgent {
  private interviewQuestions = [
    "Tell me about a time you handled a difficult customer or situation.",
    "Why should we hire you for this role given your specific background?",
    "Where do you see yourself in two years, and how does this job help you get there?",
    "How do you handle working under pressure or tight deadlines?"
  ];

  async startSession(userId: string): Promise<{ question: string }> {
    return { question: this.interviewQuestions[0] };
  }

  async evaluateResponse(answer: string, questionIndex: number): Promise<{ 
    score: number, 
    feedback: string, 
    hint?: string, 
    nextQuestion?: string,
    masteryAchieved: boolean 
  }> {
    // In a real implementation, this would use an LLM for dual-stream evaluation
    // (Structure 40% + Content 40% + Delivery 20%)
    
    // Mock Scoring Logic
    const wordCount = answer.split(' ').length;
    let score = 0;
    let feedback = "";
    let hint = "";
    
    if (wordCount < 10) {
      score = 30;
      feedback = "Your answer is a bit short. Try to use the STAR method (Situation, Task, Action, Result).";
      hint = "Think about a specific moment. What exactly did you do first?";
    } else if (wordCount < 30) {
      score = 65;
      feedback = "Good start! You've got the context, but I'm missing the 'Result' of your actions.";
      hint = "What happened after you took action? Did the customer smile? Was the work finished early?";
    } else {
      score = 85;
      feedback = "Excellent structure! You've clearly outlined your actions and the outcome.";
      masteryAchieved: true;
    }

    const masteryAchieved = score >= 80;
    const nextQuestion = masteryAchieved && questionIndex < this.interviewQuestions.length - 1 
      ? this.interviewQuestions[questionIndex + 1] 
      : undefined;

    return {
      score,
      feedback,
      hint: score < 80 ? hint : undefined,
      nextQuestion,
      masteryAchieved
    };
  }
}
