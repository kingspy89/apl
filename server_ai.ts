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

export async function generateCoachResponse(apiKey: string | undefined, message: string, context: any) {
  // Return structured coaching response: { text, structured: { explanation, coach_tip, suggested_actions } }
  if (!apiKey) {
    // Demo fallback
    return {
      text: `(Demo) I examined "${message}" about ${context?.currentMatch || 'the match'}. Key point: focus on field placements and bowler patterns.`,
      structured: {
        explanation: 'In demo mode we cannot access live model. Look at bowler lengths and field positions.',
        coach_tip: 'Watch for short balls to the leg side; adjust by moving mid-wicket inwards.',
        suggested_actions: ['Study batter weaknesses vs pace', 'Adjust field on 3rd man', 'Switch bowler to left-arm']
      }
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const sys = `You are PredictPlay Coach.AI. Provide a concise coaching reply to the user message. Return JSON with keys: text, explanation, coach_tip, suggested_actions.`;
    const prompt = `${sys}\nUser message: ${message}\nContext: ${JSON.stringify(context || {})}\nReturn JSON only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' }
    });

    try {
      const parsed = JSON.parse(response.text || '{}');
      return { text: parsed.text || response.text, structured: parsed };
    } catch (e) {
      return { text: response.text || 'AI returned non-JSON', structured: null };
    }
  } catch (err) {
    console.error('generateCoachResponse error', err);
    return { text: 'AI error', structured: null };
  }
}
