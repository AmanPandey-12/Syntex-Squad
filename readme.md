<div align="center">
  <!-- GitHub Badges -->
  <img src="https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge" alt="Build Status" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/AI-Gemini_2.0-FF6F00?style=for-the-badge" alt="AI Powered" />
  
  <h1>🌾 KrishiAI</h1>
  <p><strong>Empowering farmers with AI-driven insights, multi-lingual disease detection, and hyper-local crop management.</strong></p>
</div>

---

## 📸 Screenshots

<div align="center">
  <!-- Screenshot Placeholders: Replace the URLs below with the actual project screenshots later -->
  <img src="https://via.placeholder.com/800x400?text=KrishiAI+Dashboard+Screenshot+Here" alt="Dashboard View" width="80%" />
   <br/>
   <p><em>(Placeholder) Interactive farmer dashboard tracking crop inventory and health.</em></p>
  
  <img src="https://via.placeholder.com/800x400?text=AI+Disease+Detection+Screenshot+Here" alt="AI Detection View" width="80%" />
</div>

---

## ✨ Key Features

- **🌿 Multi-Lingual AI Disease Detection:** Upload plant leaf images for instant deep clinical analysis using Google’s Gemini 2.0 Flash. Provides customized treatments and severity scoring natively in 6 languages (English, Hindi, Tamil, Telugu, Marathi, Bengali).
- **🎙 Voice-Enabled AI Copilot:** A smart virtual farming assistant you can speak to naturally. It parses queries using Web Speech API and responds dynamically based on live market pricing and farm inventory context.
- **🌦️ Hyper-Local Smart Weather:** Real-time meteorological data and multi-day forecasting tailored specifically for agricultural schedules.
- **📦 Crop Inventory Dashboard:** Easily maintain farm records, track crop health ratings, and keep an interactive log backed firmly by Firestore.
- **🎨 Interactive 3D Interface:** A premium dark-themed, glassmorphic UI powered by React Three Fiber, Framer Motion, and Tailwind CSS.
- **🔐 Secure Authentication:** Ready-to-use user profile and session management via Firebase Authentication.

## 🛠 Tech Stack

- **Frontend:** React 18 (Vite), Tailwind CSS, Framer Motion, GSAP, React Router.
- **3D & Visual Effects:** React Three Fiber, `@react-three/drei`, Spline tool.
- **Backend/BaaS:** Firebase (Authentication, Firestore Database).
- **AI Models:** Google Gemini 2.0 Flash (Invoked dynamically via OpenRouter API).
- **Image Processing & Storage:** ImgBB API (for fast base64 upload flows).
- **External APIs:** OpenWeatherMap API, Web Speech API (for voice support), Axios.

## 🏗 Architecture Overview

KrishiAI follows a modern serverless Single-Page Application (SPA) architecture.

1. **Client-Side Rendering:** The entire application runs gracefully in the browser using React/Vite, securely connecting with all necessary backend services without requiring a dedicated traditional Node/Python server.
2. **AI Inspection Data Flow:**
   - A user captures a leaf photo -> Image is securely base64 encoded.
   - The image is swiftly uploaded via **ImgBB API** to host temporarily.
   - The React App queries **OpenRouter**, instructing the **Gemini 2.0 Model** natively with the image payload and structured multi-language prompt instructions.
   - The AI returns actionable JSON containing disease name, severity, and localized solutions, immediately interpreted by the frontend state.
3. **App State & Data Persistence:** User identities, saved analyses, and crop rosters sync constantly via **Firebase / Firestore**. 

## 🚀 Installation & Setup

Follow these steps to run the application entirely locally:

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd krishiai
```

### 2. Install dependencies
Ensure Node.js is installed, then run:
```bash
npm install
```

### 3. Setup Environment Variables
Create a file named `.env` in the root folder, using `.env.example` as a template. Add your API credentials for the following keys:

```env
VITE_OPENROUTER_API_KEY=
VITE_IMGBB_API_KEY=
VITE_OPENWEATHER_API_KEY=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

### 4. Start Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

## 📖 Usage Guide

- **AI Pathologist:** Navigate to the **Scan/Detection** feature from the Dashboard. Upload any picture of a plant leaf showing signs of damage. After a brief loading phase, view the AI diagnosis in your chosen native language.
- **Weather Insights:** Input your location or grant GPS access. The dashboard will instantly visualize upcoming weather shifts.
- **Voice Help:** Tap the floating microphone button to activate AI Copilot. Speak your query in Hindi or English (e.g., "What is the market price of tomatoes today?").

## 🌐 API Endpoints & External Integrations

| Feature / Route | Purpose | Service Provider |
|-----------------|---------|------------------|
| `/api.imgbb.com/1/upload` | Uploading leaf images to acquire temporary URLs for processing. | ImgBB |
| `/openrouter.ai/api/v1/chat/completions` | Handling complex clinical AI checks and Chatbot dialogue using Gemini 2.0. | OpenRouter |
| `/api.openweathermap.org/data/2.5/` | Providing localized weather data updates and detailed step-forward forecasts. | OpenWeatherMap |
| **Firestore Client** | Stores user profiles and tracks scanned crops inside the authenticated Database. | Firebase |

## 🔮 Future Scope (Roadmap)

To push the project boundary further, we are actively looking into:

- **📱 Mobile App Version:** Wrapping the ecosystem via React Native for offline support on the field.
- **📡 IoT Sensor Integration:** Syncing the dashboard directly with live soil moisture and pH sensors.
- **🌍 Extended Polyglot:** Expanding to 15+ more regional languages.
- **🛒 E-commerce:** Adding a local marketplace for farmers to buy required fertilizers safely.

---

<p align="center">Built with ❤️ to revolutionize agriculture worldwide.</p>
