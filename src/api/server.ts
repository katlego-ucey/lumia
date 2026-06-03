
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { OnboardingAgent, UserProfile } from '../agents/onboarding';
import { CVMorphingAgent } from '../agents/cv_morphing';
import { InterviewMasteryAgent } from '../agents/interview_mastery';
import { FraudGuardAgent } from '../agents/fraud_guard';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, '../../public')));

const onboardingAgent = new OnboardingAgent();
const cvMorphingAgent = new CVMorphingAgent();
const interviewMasteryAgent = new InterviewMasteryAgent();
const fraudGuardAgent = new FraudGuardAgent();

// Mock database for profiles
const profiles: Record<string, UserProfile> = {};
const interviewSessions: Record<string, { currentQuestionIndex: number }> = {};

app.post('/onboarding/start', (req, res) => {
  const userId = Math.random().toString(36).substring(7);
  const initialProfile: UserProfile = {
    id: userId,
    skills: [],
    currentStep: 'greeting'
  };
  profiles[userId] = initialProfile;
  res.json({ userId, question: "Sawubona! Welcome to Lumia. I'm here to help you find your next great job. What's your full name?" });
});

app.post('/onboarding/respond', async (req, res) => {
  const { userId, response } = req.body;
  const profile = profiles[userId];
  
  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  const { nextStep, updatedProfile } = await onboardingAgent.processResponse(profile, response);
  profiles[userId] = updatedProfile;
  
  res.json({ question: nextStep.question, profile: updatedProfile });
});

app.post('/cv/generate', async (req, res) => {
  const { userId } = req.body;
  const profile = profiles[userId];
  
  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  try {
    const fileName = await cvMorphingAgent.generateCV(profile);
    const downloadUrl = `http://localhost:${port}/public/${fileName}`;
    res.json({ success: true, downloadUrl });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate CV" });
  }
});

app.post('/interview/start', async (req, res) => {
    const { userId } = req.body;
    interviewSessions[userId] = { currentQuestionIndex: 0 };
    const { question } = await interviewMasteryAgent.startSession(userId);
    res.json({ question });
});

app.post('/interview/respond', async (req, res) => {
    const { userId, response } = req.body;
    const session = interviewSessions[userId];
    if (!session) return res.status(404).json({ error: "Session not found" });

    const result = await interviewMasteryAgent.evaluateResponse(response, session.currentQuestionIndex);
    if (result.masteryAchieved && result.nextQuestion) {
        session.currentQuestionIndex++;
    }
    res.json(result);
});

app.post('/fraud/check', async (req, res) => {
    const { jobTitle, company, description, contactEmail } = req.body;
    const report = await fraudGuardAgent.scrutinizeJob(jobTitle, company, description, contactEmail);
    res.json(report);
});

app.listen(port, () => {
  console.log(`Lumia API listening at http://localhost:${port}`);
});
