<div align="center">

<img width="1200" alt="PredictPlay Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />

# ⚡ PredictPlay AI

### Your AI Sports Companion That Watches The Match With You

**PredictPlay AI transforms passive sports watching into an interactive AI experience.**

It doesn’t just show scores — it **understands momentum, predicts turning points, debates match decisions, coaches strategy, and reacts like a real companion watching beside you.**

Built with **Gemini AI + Real-Time Event Streaming**.

🚀 **Works even without live APIs** through an intelligent Demo Mode for seamless offline judging.

[Features](#-features) •
[Architecture](#-architecture) •
[Quick Start](#-quick-start) •
[Demo Mode](#-demo-mode) •
[Gemini AI](#-gemini-powered-experience)

</div>

---

# 🏆 Why PredictPlay AI?

Sports apps today are passive.

You open them → see scores → close them.

**PredictPlay AI changes that.**

Imagine watching an IPL match and your AI says:

> "CSK's momentum has shifted after that wicket. If Jadeja survives the next 2 overs, win probability increases by 18%."

Or:

> "Would you bowl Rashid Khan right now or save him for death overs?"

Or even:

> "What if Kohli had played aggressively during overs 7–10?"

PredictPlay AI turns every match into an **interactive AI-first experience.**

---

# ✨ Features

## 🎙️ AI Match Companion
An intelligent assistant that actively watches the match with users.

- Real-time storytelling
- Momentum detection
- Match analysis
- Turning-point insights
- Context-aware conversations

---

## 🔮 Prediction Challenges
Gemini dynamically creates prediction questions during live gameplay.

Examples:

- *Will this over go for 10+ runs?*
- *Can the batting team recover after this wicket?*
- *Will Bumrah bowl yorkers next over?*

---

## 🧠 What-If Simulations
Explore alternate realities of the match.

Examples:

- *What if Dhoni came at No. 4?*
- *What if the powerplay score was lower?*
- *What if Rashid bowled earlier?*

---

## 🏏 AI Cricket Coach
Talk to an AI coach persona.

Ask:

> “How should RCB approach the chase?”

Get tactical cricket insights powered by Gemini.

---

## 🎭 Debate Mode
Fans can debate match decisions with AI.

Examples:

- *Should Rohit have attacked spin earlier?*
- *Was that bowling change a mistake?*

---

## ⚡ Real-Time Match Events
Low-latency live updates using **Socket.IO**.

- Match events
- Commentary-style updates
- AI-generated insights
- Room-based subscriptions

---

## 📴 Offline Demo Mode (Hackathon Superpower)

No APIs?

No internet?

No problem.

PredictPlay AI includes a **scripted match simulator** that generates:

✅ Match events  
✅ Momentum swings  
✅ AI conversations  
✅ Predictions  
✅ Real-time reactions

This makes the product **100% demo-ready**, even during unstable internet or API failures.

---

# 🧠 Gemini Powered Experience

Gemini is the brain of PredictPlay AI.

Used for:

- Match storytelling
- Tactical coaching
- Prediction generation
- Fan conversations
- Debate reasoning
- Alternate scenario simulation

### Why Server-Side Gemini?

For:

- 🔒 Secure API keys
- ⚡ Better prompt engineering
- 🛡️ Rate limiting
- 💾 Response caching
- 🧩 Centralized AI orchestration

Gemini is never exposed in the frontend.

---

# 🏗️ Architecture

```text
                ┌─────────────────┐
                │  Live Match API │
                └────────┬────────┘
                         │
                         ▼
               ┌──────────────────┐
               │ Express Server   │
               │ + Socket.IO      │
               └────────┬─────────┘
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
   ┌────────────────┐     ┌────────────────┐
   │ Gemini Engine  │     │ Demo Simulator │
   └────────────────┘     └────────────────┘
            │
            ▼
      ┌───────────────┐
      │ React Frontend │
      └───────────────┘
