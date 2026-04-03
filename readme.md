# KrishiAI — AI-Powered Smart Agriculture

<p align="center">
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Firebase-Auth_&_DB-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Gemini-2.0-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Three.js-3D_UI-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License MIT" />
</p>

<p align="center">
  <strong>An AI-powered full-stack agriculture web application.</strong><br/>
  Empowering farmers with AI-driven insights for crop disease detection,<br/>
  localized weather updates, and smart inventory monitoring.
</p>

<p align="center">
  <a href="https://krishiai-demo.vercel.app/">
    <img src="https://img.shields.io/badge/Live_Demo-Visit_App-blue?style=for-the-button&logo=vercel" alt="Live Demo" />
  </a>
  <a href="https://github.com/AmanPandey-12/Syntex-Squad">
    <img src="https://img.shields.io/badge/GitHub-Source_Code-black?style=for-the-button&logo=github" alt="GitHub" />
  </a>
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🌿 AI Disease Detection | Upload leaf images for instant deep clinical analysis using Gemini 2.0 Flash |
| 🎙️ Voice-Enabled Copilot | Virtual farming assistant that speaks 6 local languages with Web Speech API |
| 🌦️ Smart Weather | Hyper-local real-time metrics and agricultural prognostic forecasts |
| 📦 Inventory Management | Maintain farm records, track crop health ratings, and log history |
| 💬 Interactive Chat | Context-aware AI chat that assesses market prices and user inventory |
| 🌍 Multi-Lingual | Full support for English, Hindi, Tamil, Telugu, Marathi, and Bengali |
| 🎨 Premium 3D UI | Sleek, modern, dark glassmorphic interface powered by React Three Fiber |
| 🔐 Secure Authentication | Enterprise-grade user profiles and databases via Firebase |

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 18 (Vite SPA) |
| **Language** | JavaScript (ES6+) |
| **Backend / DB** | Firebase (Firestore & Auth) |
| **AI Model** | Google Gemini 2.0 Flash (via OpenRouter) |
| **Image Hosting** | ImgBB API |
| **External APIs** | OpenWeatherMap API, Web Speech API |
| **Styling** | Tailwind CSS 3.4 |
| **3D Graphics** | React Three Fiber, Spline, Three.js |
| **Animations** | Framer Motion, GSAP |
| **Deployment** | Vercel (Recommended) |

## 📁 Project Structure

```text
krishiai/
├── src/
│   ├── components/          # Reusable UI components (Navbar, Footers, etc.)
│   ├── context/             # Global states and contexts
│   ├── data/                # Static local data (Crop Calendar, Market Prices)
│   ├── hooks/               # Custom React hooks (useVoiceSearch)
│   ├── pages/               # Main application routed views
│   │   ├── Dashboard.jsx    # Analytics and crop inventory core view
│   │   ├── DetectionPage.jsx# AI plant disease scanner and diagnosis
│   │   ├── CropPickerPage.jsx # AI assisted crop recommendation
│   │   └── ...
│   ├── services/            # API integration and backend logic
│   │   ├── api.js           # External API handlers (OpenRouter, OpenWeather)
│   │   └── firebase.js      # Firebase SDK initialization
│   ├── three/               # React Three Fiber models and 3D scenes
│   ├── utils/               # Formatter and helper utilities
│   ├── index.css            # Global Tailwind directives
│   ├── App.jsx              # Main Application Router wrapper
│   └── main.jsx             # React entry point
├── public/                  # Raw static assets
└── index.html               # Main HTML framework
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Set up API Keys for: **Firebase**, **OpenRouter**, **ImgBB**, and **OpenWeatherMap**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AmanPandey-12/Syntex-Squad.git
   cd krishiai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   Create a `.env` file in the root directory by copying `.env.example` and insert your keys.
   ```bash
   cp .env.example .env
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## 🔑 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `VITE_OPENROUTER_API_KEY` | OpenRouter (Gemini) integration key | ✅ |
| `VITE_IMGBB_API_KEY` | ImgBB API key for temporary rapid image hosting | ✅ |
| `VITE_OPENWEATHER_API_KEY` | OpenWeatherMap API key | ✅ |
| `VITE_FIREBASE_API_KEY` | Firebase Client Auth Key | ✅ |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Project Auth Domain | ✅ |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | ✅ |
| `VITE_FIREBASE_STORAGE_BUCKET`| Firebase Storage Bucket | ✅ |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`| Firebase Sender Identifier | ✅ |
| `VITE_FIREBASE_APP_ID` | Firebase uniquely generated App ID | ✅ |
| `VITE_FIREBASE_MEASUREMENT_ID`| Firebase Analytics Measurement ID | ❌ |

## 🔌 API Integrations

As a serverless SPA, KrishiAI delegates heavy processing externally:

| Endpoint / Service | Purpose | Service Provider |
|---|---|---|
| `https://api.imgbb.com/1/upload` | Fast Base64 Image hosting pipeline to reduce AI payload limits | ImgBB |
| `https://openrouter.ai/api/v1/chat/completions` | Multi-prompt execution for Plant Pathology & Copilot Chat | OpenRouter (Gemini) |
| `https://api.openweathermap.org/data/2.5/` | Coordinates-based local data fetching for agronomical conditions | OpenWeatherMap |
| `Firestore Collections` | Synchronizing User Profiles and persisting dynamic Crop Inventories | Firebase |

## 🧠 How AI Disease Detection Works

1. **Image Scan**: The farmer takes/uploads a picture of a diseased plant leaf via the UI.
2. **Fast Encoding**: Client base64 encodes the image and transfers it securely to **ImgBB**.
3. **Structured Prompting**: A highly crafted pathology system prompt (dictating scoring systems and multi-language JSON generation) is prepared.
4. **LLM Inference**: The prompt and image URL are sent to **Gemini 2.0 Flash** via the **OpenRouter** pipeline.
5. **JSON Parsing & Translating**: The AI returns rigid JSON data assigning a discrete diagnosis, health score (0-100), and custom solutions formatted securely.
6. **Data Hydration**: React rapidly updates the UI, rendering immediate translations in the user's localized tongue.

## 🤝 Contributing

We welcome contributions to revolutionize agriculture globally! To contribute:

1. **Fork** the repository.
2. **Create** a new branch: `git checkout -b feature/your-feature-name`.
3. **Commit** your changes: `git commit -m 'feat: Add a new AI capability'`.
4. **Push** to the branch: `git push origin feature/your-feature-name`.
5. **Open** a Pull Request.

Please ensure your code follows the existing Vite/React standard and includes proper error boundaries.

## 👨‍💻 Authors

**Syntex Squad**
- **GitHub**: [@AmanPandey-12](https://github.com/AmanPandey-12) / [@jatin12-alt](https://github.com/jatin12-alt)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ to revolutionize agriculture worldwide
  <br/>
  <a href="https://krishiai-demo.vercel.app/">krishiai-demo.vercel.app</a>
</p>
