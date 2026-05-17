# FinSmart Architecture

## System Design

User Browser
│
│ HTTPS
▼
┌─────────────────┐
│  React Frontend  │  Vercel CDN
│                 │
│  Landing        │
│  Auth Pages     │
│  Dashboard      │
│  Tax Wizard     │
│  Goals          │
└────────┬────────┘
│ REST API calls
│ JWT in memory
▼
┌─────────────────┐
│  Express Backend │  Render.com
│                 │
│  /api/analyze   │──────────────▶ Groq LLM API
│  /api/chat      │──────────────▶ Groq LLM API
│  /api/simulate  │──────────────▶ Groq LLM API
│  /api/tax       │──────────────▶ Groq LLM API
│  /api/auth      │
│  /api/scores    │
│  /api/goals     │
│  /api/upload    │──────────────▶ pdf-parse
│  /api/setu      │──────────────▶ Setu AA API
└────────┬────────┘
│ Mongoose ODM
▼
┌─────────────────┐
│  MongoDB Atlas  │  Mumbai Region
│                 │
│  users          │
│  scores         │
│  goals          │
└─────────────────┘

## Data Flow

1. User registers → password bcrypt hashed → stored in MongoDB
2. User logs in → JWT token generated → stored in React memory
3. User fills form → profile saved to MongoDB via /api/auth/profile
4. User uploads PDF → pdf-parse extracts text → Groq reads transactions
5. Transactions sent to /api/analyze → Groq scores finances → JSON returned
6. Score saved to MongoDB → powers score history chart
7. User chats → profile + message sent → Groq responds in chosen language
8. Goals auto-updated → transactions matched to goals via Groq AI