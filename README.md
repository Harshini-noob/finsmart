# 💰 FinSmart — AI Financial Advisor for India

🌐 **Live Demo:** https://finsmart-ashy.vercel.app  
📦 **Backend:** https://finsmart-backend-btfl.onrender.com  
💻 **GitHub:** https://github.com/Harshini-noob/finsmart

---

## 🎯 Problem

95% of Indians have no financial plan.  
A Chartered Accountant costs Rs.25,000+ per year.  
FinSmart delivers CA-level financial analysis in 60 seconds — completely free.

---

## ✨ Features

| Feature | Description |
|---|---|
| 💯 Money Health Score | AI scores your finances 0-100 with specific reasoning |
| 🏦 Bank Data | PDF statement upload or Setu Account Aggregator |
| 💸 Tax Wizard | Finds missed deductions — avg Rs.41,000/year saved |
| 🔮 What If Simulator | Test any financial decision before making it |
| 💬 AI Chat | Ask anything in English, Hindi, or Tamil |
| 🎯 Goal Tracker | Set goals, auto-track from bank transactions |
| 📈 Score History | Monthly progress chart |
| 🔐 Authentication | JWT + bcrypt, MongoDB Atlas |

---

## 🏗️ Architecture
Frontend (React) → Backend (Node/Express) → Groq LLM API
→ MongoDB Atlas
→ Setu AA / PDF Parser

### API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| /api/auth/register | POST | Create account with bcrypt hashing |
| /api/auth/login | POST | JWT token generation |
| /api/analyze | POST | AI financial health analysis |
| /api/chat | POST | Context-aware financial Q&A |
| /api/simulate | POST | What If scenario engine |
| /api/tax | POST | Tax optimization analysis |
| /api/upload/statement | POST | PDF bank statement parsing |
| /api/setu/demo-transactions | GET | Demo bank data |
| /api/scores | POST/GET | Score history management |
| /api/goals | CRUD | Financial goal tracking |

---

## 🤖 GenAI Integration

FinSmart uses **Groq's Llama 3.3 70B** model with custom prompt engineering:

- **Scoring rubric** — explicit point values for each financial dimension
- **Indian context** — SIP, PPF, ELSS, 80C, NPS, HRA built into prompts
- **Structured output** — forces JSON responses for reliable UI rendering
- **Multilingual** — same prompts work in English, Hindi, Tamil
- **Context-aware** — user profile passed with every request

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| AI Engine | Groq API (Llama 3.3 70B) |
| Auth | JWT + bcrypt |
| Bank Data | Setu Account Aggregator + pdf-parse |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Groq API key (free at console.groq.com)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your keys in .env
node server.js
```

### Frontend
```bash
cd frontend
npm install
# Create .env with REACT_APP_API_URL=http://localhost:5000
npm start
```

---

## 📊 Impact

- **Rs.3.28 lakh crore** — tax overpaid by Indians annually
- **Rs.41,000** — average tax savings found per user
- **60 seconds** — time to get full financial analysis
- **Rs.0** — cost vs Rs.25,000+ for a CA

---

## 👩‍💻 build by 

**Harshini A** — IIIT Kottayam  
Harshini — harshinistackd@gmail.com