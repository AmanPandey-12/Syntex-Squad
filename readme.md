# Technocrats-Innovation-Challenge-2k26 Hackathon Project


# 🌿 KRISHI-AI — AI-Powered Smart Farming Assistant

> *Detect · Predict · Protect · Profit*

**TIC_2K26 · AGRI_01 | Agriculture Theme · Technocrats Innovation Challenge 2K26**
**Team Syntax Squad** — Jatin | Aman | Jeetu | Mukesh | Devendra
*Technocrats Institute of Technology, Bhopal, MP*

---

## 📌 Overview

KRISHI-AI is an AI-powered smart farming assistant designed for India's 146 million farming families. It puts expert-level crop disease detection, market intelligence, and farming advice directly into a farmer's pocket — in Hindi, offline, on any smartphone.

> *"Agar kisan samarth hai, toh Bharat samarth hai."*
> — If the farmer is empowered, India is empowered.

---

## 🚨 Problem Statement

Indian farmers lose **35% of their crops preventably** every season due to:

| Problem | Scale |
|---|---|
| Annual crop loss due to undetected disease | ₹90,000 Crore |
| Farmers with no digital access to timely information | 58% |
| Income lost to poor selling timing | 30–40% |

- By the time disease symptoms are visible, **40–60% damage has already occurred**
- Critical information on pesticides, soil health, and market prices reaches farmers **weeks or months too late**
- Farmers sell at harvest when prices are at their lowest — no tool exists to predict the best selling window

---

## ✅ Solution

**KRISHI-AI — One app, all farming needs.**

| Feature | Description |
|---|---|
| 🐛 **Disease Detection** | Snap a leaf photo → AI detects disease + 0–100 health score |
| 💊 **Treatment Advisor** | Pesticide + organic remedy + prevention tips |
| ⚠️ **Early Warning** | Weather + pattern analysis → alerts before disease spreads |
| 🌾 **Smart Crop Picker** | Soil + location + season → best crop suggestion |
| 📈 **Market Prices** | Live mandi prices + best time to sell crops |
| 💰 **Profit Planner** | Cost · yield · revenue prediction per crop |
| 🤖 **AI Farm Assistant** | Hindi chatbot for farming decisions & advice |
| 📱 **Mobile-First** | Works offline, low-data mode, local language support |

---

## 🏗️ Solution Architecture

```
Farmer (Mobile/Web App)
        ↓
AI Engine (Disease + Crop ML)
        ↓
Data Layer (Weather · Soil · Market)
        ↓
Insights (Scores · Alerts · Advice)
        ↓
Action (Treat · Sell · Grow)
```

### Detailed Flow

1. Farmer photographs a diseased leaf using mobile camera or uploads an image
2. CNN model classifies the disease, generates a health score & confidence level
3. Weather API + soil data feeds the early warning engine — alerts sent if risk > 60%
4. Market API fetches live mandi prices; profit planner calculates best harvest window
5. All outputs consolidated in Hindi/English dashboard with action recommendations

---

## 🛠️ Technology Stack

### Frontend
- **React.js** — Component-based UI
- **Tailwind CSS** — Utility-first styling
- **PWA (Offline support)** — Works without internet
- **i18next** — Hindi/English internationalization

### AI / ML
- **TensorFlow.js** — On-device ML inference
- **Plant Disease CNN Model** — Leaf disease classification
- **Gemini AI API** — Conversational farm assistant
- **OpenWeather API** — Weather-based early warning

### Backend & Data
- **Node.js + Express** — REST API server
- **MongoDB Atlas** — Cloud database (free tier)
- **data.gov.in APIs** — Government agricultural data
- **Agmarket Price API** — Live mandi price feeds

### Deployment
- **Vercel** — Free hosting with CI/CD
- **GitHub CI/CD** — Automated deployment pipeline
- **Progressive Web App** — Installable on any device
- **Firebase** — Authentication

> ✅ No paid APIs required for MVP · All free tiers · Works on 2G networks · Deployable in 36 hrs

---

## 📱 App Screens (UI Mockup)

### Screen 1 — Rog Pahchaan (Disease Detection)
- Upload leaf photo
- Displays disease name (e.g., *Tomato Late Blight — Phytophthora infestans*)
- Health Score: 34/100 — with severity warning
- Treatment: Mancozeb 75% — 2g/litre, spray 3x/week
- Organic remedy: Neem oil every 3 days

### Screen 2 — Smart Salah (Crop Advisor)
- Location-aware: Bhopal, MP | Clay soil | 28°C | Rabi season
- Top crop recommendations with pricing:
  - 🥇 Gehun — Nov–Dec · ₹2,100/qtl
  - 🥈 Soybean — Sep–Oct · ₹3,800/qtl
  - 🥉 Makka — Aug · ₹1,400/qtl

### Screen 3 — Munafa Hisaab (Profit Calculator)
- Live Bhopal APMC mandi prices
- Profit breakdown for 2 bigha of Gehun:
  - Lagat (Cost): ₹18,000
  - Aamdan (Revenue): ₹32,700
  - **Munafa (Profit): ₹14,700**
- Government scheme alerts: PM Kisan — ₹6,000/year

---

## 📊 Expected Impact

| Metric | Value |
|---|---|
| Reduction in crop loss | **30%** via early disease detection |
| Extra annual income per farmer | **₹15,000+** from better sell timing |
| Disease diagnosis time | **10 seconds** (vs. 2–3 days with an expert) |
| Potential beneficiaries | **146 million** farming families in India |

### Who Benefits

- **Small & marginal farmers** — Free disease detection & crop advice without agronomist visits
- **Rural women farmers** — Simple Hindi interface removes language & literacy barriers
- **Agricultural extension workers** — Data-driven dashboard to serve more farmers efficiently
- **FPOs & co-operatives** — Aggregate market intelligence for bulk selling decisions

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- Gemini AI API key (free tier)
- OpenWeather API key (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/syntax-squad/krishi-ai.git
cd krishi-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your API keys in .env

# Run development server
npm run dev
```

### Environment Variables

```env
GEMINI_API_KEY=your_gemini_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
MONGODB_URI=your_mongodb_atlas_uri
FIREBASE_CONFIG=your_firebase_config
```

### Build & Deploy

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

## 📁 Project Structure

```
krishi-ai/
```

---

## 👥 Team

| Name | Role |
|---|---|
| Aman Pandey | **Team Lead** |
| Devendra Dongre 
| Jetendra Yadav 
| Jatin Dongre 
| Mukesh Kumar Paswan 

**Institution:** Technocrats Institute of Technology, Bhopal, MP

---

## 🏆 Competition

- **Event:** Technocrats Innovation Challenge 2K26 (TIC_2K26)
- **Theme:** Agriculture
- **Entry ID:** AGRI_01

---

## 📄 License

This project was built for the Technocrats Innovation Challenge 2K26. All rights reserved by Team Syntex Squad.

---

<div align="center">
  <strong>🌿 KRISHI-AI — Empowering India's farmers with the power of AI</strong><br>
  <em>In their language · On their phone · For Bharat</em>
</div>
