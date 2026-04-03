# KrishiAI - Smart Farming with AI

KrishiAI is a full-stack agriculture web application designed to empower farmers with AI-driven insights for crop disease detection, localized weather updates, and smart monitoring.

## 🚀 Key Features

- **AI Disease Detection:** Upload plant leaf images for instant diagnosis using TensorFlow-powered models.
- **Interactive 3D UI:** Modern landing page with React Three Fiber animations.
- **Farmer Dashboard:** Overview of crop health, stats, and agricultural alerts.
- **Smart Weather:** Hyper-local weather data with farming recommendations.
- **Clean Design:** Premium dark-themed UI with Krishi-green accents.

## 🛠 Tech Stack

- **Frontend:** React, Tailwind CSS, Framer Motion, React Three Fiber, Drei, Axios, Lucide-React.
- **Backend:** Python FastAPI, TensorFlow, Motor (Async MongoDB), NumPy, Pillow.
- **Database:** MongoDB.

## 📦 Installation

### Prerequisites
- Node.js & npm
- Python 3.8+
- MongoDB (running locally or a connection string)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 🧪 AI Model
The application uses a placeholder `model.h5`. For production, replace it with a trained plant disease classification model (e.g., MobileNetV2 or ResNet50 trained on the PlantVillage dataset).

---
