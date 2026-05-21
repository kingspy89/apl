import express from "express";
import dotenv from 'dotenv';
dotenv.config();
import path from "path";
import http from "http";
import { createServer as createViteServer } from "vite";
import { Server as SocketIOServer } from "socket.io";
import { GoogleGenAI } from "@google/genai";
import { generateProactiveMessage, converseOnce } from "./server_ai";

const cache = {
  matches: { data: null, timestamp: 0 },
  scorecards: {} as Record<string, { data: any, timestamp: number }>,
  info: {} as Record<string, { data: any, timestamp: number }>,
};
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Webhook endpoint for incoming real-time events (provider -> this bridge)
  app.post('/api/webhook', (req, res) => {
    try {
      const event = req.body || {};
      const matchId = event.matchId || 'global';
      // emit via socket.io (attached later to httpServer)
      // if io is not yet created, ignore (dev only)
      if ((app as any).io) {
        (app as any).io.to(matchId).emit('match:event', event);
      }
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Webhook handling error', err);
      res.status(500).json({ error: 'webhook error' });
    }
  });

  // Demo simulator state
  const demoSimulators: Record<string, { intervalId: NodeJS.Timeout | null, index: number, events: any[] }> = {};

  app.post('/api/demo/start', (req, res) => {
    const matchId = (req.body && req.body.matchId) || 'mock_ipl_match';
    if (demoSimulators[matchId]) return res.json({ ok: true, message: 'already running' });

    const scripted = [
      { seq: '17.1', type: 'ball', outcome: 'dot' },
      { seq: '17.2', type: 'ball', outcome: 'boundary' },
      { seq: '17.3', type: 'ball', outcome: 'wicket' },
      { seq: '17.4', type: 'ball', outcome: 'single' },
      { seq: '17.5', type: 'ball', outcome: 'wide' },
      { seq: '17.6', type: 'ball', outcome: 'dot' }
    ];

    demoSimulators[matchId] = { intervalId: null, index: 0, events: scripted };

    const intervalId = setInterval(async () => {
      const sim = demoSimulators[matchId];
      if (!sim) return;
      const ev = sim.events[sim.index % sim.events.length];
      sim.index += 1;
      const payload = { matchId, event: ev, timestamp: Date.now() };
      // emit raw match event
      if ((app as any).io) (app as any).io.to(matchId).emit('match:event', { type: 'demo:event', payload });
      // ask AI to generate a proactive message and emit
      const aiResult = await generateProactiveMessage(process.env.GEMINI_API_KEY, { name: 'Mock IPL: CSK vs GT', score: [{ r: 184 + sim.index, w: 4, o: 16 + Math.floor(sim.index / 6) }] });
      if ((app as any).io) (app as any).io.to(matchId).emit('match:event', { type: 'aiMessage', payload: aiResult });
    }, 2500);

    demoSimulators[matchId].intervalId = intervalId;
    res.json({ ok: true });
  });

  // Converse endpoint: run a single prompt through Gemini (or fallback) and optionally broadcast
  app.post('/api/converse', async (req, res) => {
    try {
      const { prompt, matchId } = req.body || {};
      if (!prompt) return res.status(400).json({ error: 'prompt required' });
      const result = await converseOnce(process.env.GEMINI_API_KEY, prompt);
      if (matchId && (app as any).io) {
        (app as any).io.to(matchId).emit('match:event', { type: 'aiMessage', payload: { storyline: result.text } });
      }
      res.json(result);
    } catch (err) {
      console.error('converse error', err);
      res.status(500).json({ error: 'converse failed' });
    }
  });

  app.post('/api/demo/stop', (req, res) => {
    const matchId = (req.body && req.body.matchId) || 'mock_ipl_match';
    const sim = demoSimulators[matchId];
    if (sim && sim.intervalId) {
      clearInterval(sim.intervalId);
      delete demoSimulators[matchId];
    }
    res.json({ ok: true });
  });

  // API Routes
  app.get("/api/matches", async (req, res) => {
    try {
      const now = Date.now();
      if (cache.matches.data && (now - cache.matches.timestamp) < CACHE_TTL) {
         return res.json(cache.matches.data);
      }

      const apiKey = process.env.CRIC_API_KEY;
      if (!apiKey) return res.status(400).json({ error: "CRIC_API_KEY missing" });
      const response = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}&offset=0`);
      const data = await response.json();
      
      if (!data.status || data.status !== "failure") {
         cache.matches.data = data;
         cache.matches.timestamp = now;
      }
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/match_scorecard", async (req, res) => {
    try {
      const id = req.query.id as string;
      const now = Date.now();
      if (id && cache.scorecards[id] && (now - cache.scorecards[id].timestamp) < CACHE_TTL) {
         return res.json(cache.scorecards[id].data);
      }

      const apiKey = process.env.CRIC_API_KEY;
      if (!apiKey) return res.status(400).json({ error: "CRIC_API_KEY missing" });
      const response = await fetch(`https://api.cricapi.com/v1/match_scorecard?apikey=${apiKey}&id=${id}`);
      const data = await response.json();
      
      if (!data.status || data.status !== "failure") {
         cache.scorecards[id] = { data, timestamp: now };
      }
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/match_info", async (req, res) => {
    try {
      const id = req.query.id as string;
      const now = Date.now();
      if (id && cache.info[id] && (now - cache.info[id].timestamp) < CACHE_TTL) {
         return res.json(cache.info[id].data);
      }

      const apiKey = process.env.CRIC_API_KEY;
      if (!apiKey) return res.status(400).json({ error: "CRIC_API_KEY missing" });
      const response = await fetch(`https://api.cricapi.com/v1/match_info?apikey=${apiKey}&id=${id}`);
      const data = await response.json();
      
      if (!data.status || data.status !== "failure") {
         cache.info[id] = { data, timestamp: now };
      }
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/generate_arcade", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `You are the ultimate cricket trivia and tactics AI. 
Generate a challenging, engaging quiz question for a cricket fan. It can be about historical moments, rules, or tactical scenarios.
There MUST be one definitively correct answer.

Return STRICTLY JSON with this exact schema:
{
  "scenario": "Context or brief setup for the question (e.g. 'World Cup 2011 Final' or 'Tactical dilemma').",
  "question": "The actual question (e.g. 'Who was the highest run scorer?').",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctOption": "The exact string from the options array that is correct.",
  "insight": "A fascinating fact or explanation of why this is the answer.",
  "xp": 150
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });
      
      try {
        res.json(JSON.parse(response.text! || "{}"));
      } catch (parseError) {
        throw new Error("Failed to parse Gemini response");
      }
    } catch (error: any) {
      if (error.status === 429 || error.message?.includes("429")) {
        console.error("Arcade Generation: Rate limit exceeded, using fallback.");
      } else {
        console.error("Arcade Generation Error:", error.message);
      }
      
      // Fallback pool of scenarios if Gemini API is rate-limited or fails
      const fallbacks = [
        {
          scenario: "World Cup 1983 Final",
          question: "Who was the captain of the Indian team that won the 1983 World Cup?",
          options: ["Sunil Gavaskar", "Kapil Dev", "Ravi Shastri", "Mohinder Amarnath"],
          correctOption: "Kapil Dev",
          insight: "Kapil Dev led India to their first ever World Cup victory, defeating the mighty West Indies.",
          xp: 150
        },
        {
          scenario: "First-Class Cricket Records",
          question: "Who holds the record for the highest individual score in a single innings in first-class cricket?",
          options: ["Brian Lara", "Sir Don Bradman", "Hanif Mohammad", "Sachin Tendulkar"],
          correctOption: "Brian Lara",
          insight: "Brian Lara scored an unbeaten 501 for Warwickshire against Durham in 1994.",
          xp: 150
        },
        {
          scenario: "Cricket Rules: Dismissals",
          question: "Which of the following is NOT a valid way of getting out in cricket?",
          options: ["Hit Wicket", "Obstructing the Field", "Timed Out", "Hitting the ball twice (for runs)"],
          correctOption: "Hitting the ball twice (for runs)",
          insight: "A batsman can hit the ball twice only to defend their wicket, but they cannot score runs off the second hit. If they do it to score runs, they can be given out for 'hit the ball twice'. So actually, hitting the ball twice IS a dismissal, wait. A better option: 'LBW off a no-ball'.",
          xp: 150
        }
      ];
      
      // Let's refine the 3rd fallback question a bit
      fallbacks[2] = {
        scenario: "Double Centuries in ODIs",
        question: "Who was the first male cricketer to score a double century in a One Day International?",
        options: ["Virender Sehwag", "Rohit Sharma", "Sachin Tendulkar", "Chris Gayle"],
        correctOption: "Sachin Tendulkar",
        insight: "Sachin Tendulkar was the first man to achieve this feat, scoring 200* against South Africa in 2010.",
        xp: 150
      };
      
      const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      res.json(randomFallback);
    }
  });

  app.post("/api/generate_prediction", async (req, res) => {
    try {
      const { matchData, userAccuracy } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

      const ai = new GoogleGenAI({ apiKey });
      
      const accuracyStr = userAccuracy !== undefined ? `User Accuracy: ${userAccuracy}%. (If > 80% make it Advanced/Hard. If < 50% Beginner/Easy. Otherwise Intermediate).` : "";
      
      const prompt = `You are PredictPlay AI. Generate a match prediction question based purely on this REAL live cricket match data.
DO NOT use generic or placeholder names. You MUST use the actual team names, the real current score, and real over from the data provided. If the data is missing, make the question about the upcoming innings or match result.

${accuracyStr}

Real Live Match Data: ${JSON.stringify(matchData)}

Create a predictive question about what will happen IMMEDIATELY NEXT in this exact match. 

Return STRICTLY JSON with this exact schema and no markdown wrappers:
{
  "question": "Will the next over contain a wicket?", 
  "options": ["Yes", "No"],
  "difficulty": "Intermediate",
  "xp": 120,
  "insight": "Short tactical insight about the current real match dynamic."
}`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            { role: "user", parts: [{ text: prompt }] }
          ],
          config: {
            responseMimeType: "application/json"
          }
        });
        
        try {
           res.json(JSON.parse(response.text! || "{}"));
        } catch (parseError) {
           throw new Error("Failed to parse Gemini prediction JSON");
        }
      } catch (geminiError: any) {
        if (geminiError.status === 429 || geminiError.message?.includes("429")) {
          console.error("Gemini Prediction: Rate limit exceeded, using fallback.");
        } else {
          console.error("Gemini Prediction Error:", geminiError.message || geminiError);
        }
        // Fallback for live prediction errors
        let matchStr = "this match";
        if (matchData && matchData.match && matchData.match.name) {
           matchStr = matchData.match.name;
        }
        res.json({
          question: `What will happen in the next over of ${matchStr}?`, 
          options: ["Boundary Hit", "Wicket Falls", "Just Singles/Dots", "Wide/No Ball"],
          difficulty: "Intermediate",
          xp: 120,
          insight: "The next over is crucial for setting the tone of the innings."
        });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to generate prediction" });
    }
  });

  app.post("/api/coach", async (req, res) => {
    try {
      const { message, context } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing");
      }

      const ai = new GoogleGenAI({ apiKey });
      const agentModeStr = context?.agentMode || 'Tactical Analyst';
      const debateMode = context?.debateMode || false;
      
      let personality = "You are PredictPlay AI, a highly intelligent sports companion.";
      if (agentModeStr === 'Casual Fan') {
         personality = "You are PredictPlay AI acting as a passionate, slightly biased 'Casual Fan'. Use emojis, get hyped about big hits, and talk about the 'vibe' of the match.";
      } else if (agentModeStr === 'Meme Lord') {
         personality = "You are PredictPlay AI acting as a 'Meme Lord' cricket fan. Use internet slang, reference popular cricket memes, and be overly dramatic in a funny way.";
      } else if (agentModeStr === 'Fantasy Guru') {
         personality = "You are PredictPlay AI acting as a 'Fantasy Cricket Guru'. You obsess over match-ups, player form, points systems, and who to captain/vice-captain.";
      } else {
         personality = "You are PredictPlay AI acting as a pragmatic 'Tactical Analyst'. Focus on field placements, bowler variations, pitch conditions, and batsman psychology.";
      }

      let debatePrompt = debateMode ? " DEBATE MODE IS ON: No matter what the user predicts or says, politely but firmly disagree with them. Argue the opposite side with compelling cricketing logic. Play devil's advocate." : "";

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            { role: "user", parts: [{ text: `${personality}${debatePrompt} Context: ${JSON.stringify(context)}. User says: ${message}. Keep your response concise, mostly one paragraph, and heavily adopt the selected persona's tone.` }] }
          ]
        });

        res.json({ response: response.text });
      } catch (geminiError: any) {
        if (geminiError.status === 429 || geminiError.message?.includes("429")) {
          console.error("Gemini Coach: Rate limit exceeded, using fallback.");
        } else {
          console.error("Gemini Coach Error:", geminiError.message || geminiError);
        }
        
        let fallbackText = "Hmm, let me analyze that... It looks like a tricky situation. Maintaining a strong off-stump line while keeping mid-off up could pressure the batsman into a mistake.";
        if (agentModeStr === "Casual Fan") {
          fallbackText = "Bro, big over coming! I can feel it in my bones! 👀🔥";
        } else if (agentModeStr === "Meme Lord") {
          fallbackText = "Bruh, scriptwriters working overtime for this match 💀🍿";
        } else if (agentModeStr === "Fantasy Guru") {
          fallbackText = "Looking at historical data, this batsman has a 65% boundary rate against spin. Make him your vice-captain.";
        }
        
        res.json({ response: fallbackText });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  app.post("/api/narrative", async (req, res) => {
    try {
      const { matchData } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

      const ai = new GoogleGenAI({ apiKey });
      
      let prompt = "You are an AI Sports Narrative Engine. You watch a live match and provide a thrilling, cinematic 'storyline' update. Focus on momentum, psychology, and the 'vibe'. Keep it to 2-3 engaging sentences.";
      if (matchData && matchData.name) {
          prompt += ` The current match is: ${matchData.name}. Status: ${matchData.status || "Unknown"}. Score: ${JSON.stringify(matchData.score || "")}.`;
      }

      prompt += "\nOutput JSON: { \"narrative\": \"The storyline text here\" }";

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      res.json(JSON.parse(response.text! || "{}"));
    } catch (error: any) {
      if (error.status === 429 || error.message?.includes("429")) {
        console.error("Narrative Engine: Rate limit exceeded, using fallback.");
      } else {
        console.error("Narrative Engine Error:", error.message || error);
      }
      res.json({ narrative: "Momentum is shifting rapidly on the pitch. Every ball counts as the pressure builds across both dressing rooms." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Create an HTTP server and attach Socket.IO for real-time bridge
  const httpServer = http.createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' }
  });
  // attach io to app for webhook route access
  (app as any).io = io;

  io.on('connection', (socket) => {
    socket.on('join', (matchId: string) => {
      try {
        socket.join(matchId);
      } catch (e) { console.error(e); }
    });
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
