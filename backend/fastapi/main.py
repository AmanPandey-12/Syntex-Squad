import os
import time
import sys
from pathlib import Path

# Advanced dynamic dotenv loading to gracefully handle terminal execution from any path
try:
    from dotenv import load_dotenv
    # Seek for .env upwards to root project dir
    env_path = Path(__file__).parent.parent.parent / '.env'
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
    else:
        load_dotenv()
except ImportError:
    pass

# Instruct TF Hub to cache models locally
os.environ["TFHUB_CACHE_DIR"] = "./models"

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import io

# Safely import TF in case it is missing initially
try:
    import tensorflow as tf
    import tensorflow_hub as hub
except ImportError as e:
    print(f"Warning: {e}. Please install tensorflow and tensorflow_hub.")
    tf = None
    hub = None

# Safely import Gemini vision fallback
try:
    import google.generativeai as genai
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
    else:
        genai = None
except ImportError:
    genai = None


app = FastAPI(title="AgroAI Layer 1: Local Vision Inference & Recognition")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Reference CropNet Model
MODEL_URL = "https://tfhub.dev/google/cropnet/classifier/cassava_disease_V1/2"
model = None

# Custom label mapping
LABELS = {
    0: "Cassava Bacterial Blight (CBB)",
    1: "Cassava Brown Streak Disease (CBSD)",
    2: "Cassava Green Mottle (CGM)",
    3: "Cassava Mosaic Disease (CMD)",
    4: "Healthy Cassava",
    5: "Unknown (Not Cassava)"
}

@app.on_event("startup")
async def load_model():
    global model
    if hub is not None:
        try:
            print(f"Loading TF Hub model from {MODEL_URL}...")
            model = hub.KerasLayer(MODEL_URL)
            print("Model loaded & cached successfully.")
        except Exception as e:
            print(f"Error loading model: {e}")

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((224, 224))
    image_arr = np.array(image) / 255.0
    return np.expand_dims(image_arr, axis=0).astype(np.float32)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    print("\n" + "="*55)
    print("--> [Vision Layer] Request received for Plant Analysis...")
    
    start_time = time.time()
    contents = await file.read()
    
    print("--> [Vision Layer] Image Processed. Consulting Model Cache...")
    
    disease_name = "Unknown Pattern Error"

    try:
        if model is not None and tf is not None:
            # Step 1: Query TF Hub Local Model
            img_tensor = preprocess_image(contents)
            predictions = model(img_tensor)
            predicted_class = np.argmax(predictions, axis=-1)[0]
            tf_disease = LABELS.get(predicted_class, "Unknown Disease")
            
            # Step 2: Adaptive Generic Crops Identification via Multimodal Gemini
            # If TF Hub predicts "5" (Unknown/Non-Cassava Crop), we trigger dynamic generic identification!
            if predicted_class == 5:
                print("--> [Vision Layer] TensorFlow detected non-cassava/unknown crop pattern.")
                if genai and GEMINI_API_KEY:
                    print("--> [Vision Layer] Expanding recognition range dynamically using Multimodal Fallback...")
                    pil_img = Image.open(io.BytesIO(contents))
                    vision_model = genai.GenerativeModel('gemini-1.5-flash')
                    response = vision_model.generate_content([
                        "Identify the plant disease in this leaf. Return ONLY the string name of the crop and the disease in the format 'CropName: DiseaseName'. E.g., 'Tomato: Early Blight'. If it is healthy, reply 'CropName: Healthy leaf'. Do not include markdown formatting or quotes.", 
                        pil_img
                    ])
                    # Ensure cleanly formatted text output
                    disease_name = response.text.replace('`','').replace('*','').strip()
                    print(f"--> [Vision Layer] Dynamic Fallback Result: {disease_name}")
                else:
                    disease_name = "Unknown Non-Cassava Crop (Gemini Missing Config)"
            else:
                disease_name = tf_disease
                
        else:
            time.sleep(1.2)
            disease_name = "System Error: Local Tensor Model not found"
    except Exception as e:
        print(f"Prediction layer error: {e}")
        disease_name = f"Processing Error"

    end_time = time.time()
    inference_time = end_time - start_time
    
    print(f"--> [Vision Layer] Final Target Disease: => {disease_name}")
    print(f"--> [Vision Layer] Total Compute Time: {inference_time:.2f}s")
    print("--> [Vision Layer] Sending details to user...")
    print("="*55 + "\n")
    
    return {
        "disease_name": disease_name,
        "inference_time": inference_time
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
