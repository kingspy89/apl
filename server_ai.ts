import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are PredictPlay AI.
You are an intelligent sports companion.
Your job is to analyze match situations, explain strategy simply, create engaging prediction challenges, personalize interactions, teach users sports intelligence, detect momentum shifts, and tell compelling match stories.
Speak like an elite sports analyst mixed with a gaming companion. Never sound robotic. Always be engaging.
Return STRICTLY JSON with keys: storyline, momentum (positive|neutral|negative), prediction_question, difficulty, xp_reward, coach_tip.
`;

export async function generateProactiveMessage(apiKey: string | undefined, matchData: any) {
  if (!apiKey) {
    // Fallback: craft a simple heuristic-based message
    const score = matchData?.score?.[0];
    const r = score?.r || Math.floor(150 + Math.random() * 80);
    const w = score?.w || Math.floor(Math.random() * 6);
    const storyline = `Quick read: ${matchData?.name || 'This match'} has ${r}/${w} — momentum looks ${Math.random() > 0.5 ? 'positive' : 'slightly negative'}.`;
    return {
      storyline,
      momentum: Math.random() > 0.5 ? 'positive' : 'neutral',
      prediction_question: 'Will the next over contain a boundary?',
      difficulty: 'Intermediate',
      xp_reward: 120,
      coach_tip: 'Watch the right-left batter matchup and short balls.'
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `${SYSTEM_PROMPT}\nCurrent Match Data: ${JSON.stringify(matchData || {})}\nRespond with JSON only.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' }
    });

    try {
      const parsed = JSON.parse(response.text || '{}');
      return parsed;
    } catch (e) {
      // fall back to text parsing attempt
      return { storyline: response.text || 'Insight unavailable', momentum: 'neutral', prediction_question: 'Will the next over contain a boundary?', difficulty: 'Intermediate', xp_reward: 120, coach_tip: 'No tip available' };
    }
  } catch (err) {
    console.error('AI generation error', err);
    return { storyline: 'AI service unavailable', momentum: 'neutral', prediction_question: 'Will the next over contain a boundary?', difficulty: 'Intermediate', xp_reward: 120, coach_tip: 'No tip available' };
  }
}

export async function converseOnce(apiKey: string | undefined, promptText: string) {
  if (!apiKey) return { text: 'Gemini API key not configured. Running in demo fallback mode.' };
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: promptText }] }]
    });
    return { text: response.text };
  } catch (err) {
    console.error('converseOnce error', err);
    return { text: 'AI error' };
  }
}
