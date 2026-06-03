
export interface UserProfile {
  id: string;
  fullName?: string;
  location?: string;
  languages?: string[];
  educationLevel?: 'No-Matric' | 'Matric' | 'Tertiary' | 'Other';
  experienceYears?: number;
  skills: string[];
  currentStep: string;
}

export const ONBOARDING_STEPS = [
  {
    id: 'greeting',
    question: "Sawubona! Welcome to Lumia. I'm here to help you find your next great job. What's your full name?",
    field: 'fullName'
  },
  {
    id: 'language',
    question: "Great to meet you! Which languages do you feel most comfortable speaking in a workplace? (You can list multiple)",
    field: 'languages'
  },
  {
    id: 'location',
    question: "Where are you currently based? (City/Town and Province)",
    field: 'location'
  },
  {
    id: 'education',
    question: "Let's talk about your education. Do you have a Matric certificate, or have you gained your skills primarily through experience?",
    field: 'educationLevel'
  },
  {
    id: 'experience',
    question: "How many years of work or volunteer experience do you have?",
    field: 'experienceYears'
  }
];

export class OnboardingAgent {
  async processResponse(profile: UserProfile, response: string): Promise<{ nextStep: any, updatedProfile: UserProfile }> {
    // Logic for language detection and code-switching would go here
    // For now, we'll implement a simple sequential state machine
    
    const currentIndex = ONBOARDING_STEPS.findIndex(s => s.id === profile.currentStep);
    const currentStep = ONBOARDING_STEPS[currentIndex];
    
    // Update profile based on current step
    if (currentStep) {
        if (currentStep.field === 'languages') {
            profile.languages = response.split(',').map(l => l.trim());
        } else if (currentStep.field === 'educationLevel') {
            if (response.toLowerCase().includes('no') || response.toLowerCase().includes('experience')) {
                profile.educationLevel = 'No-Matric';
            } else {
                profile.educationLevel = 'Matric'; // Simplified
            }
        } else {
            (profile as any)[currentStep.field] = response;
        }
    }

    const nextIndex = currentIndex + 1;
    const nextStep = ONBOARDING_STEPS[nextIndex] || { id: 'complete', question: "Onboarding complete! Let's build your CV." };
    profile.currentStep = nextStep.id;

    return { nextStep, updatedProfile: profile };
  }
}
