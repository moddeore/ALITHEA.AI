from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import tensorflow as tf
from tensorflow.keras.preprocessing import image as keras_image
import numpy as np
from PIL import Image
import io
import os
import joblib
from huggingface_hub import hf_hub_download

app = FastAPI(title="AI Image & Text Detection API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model will be downloaded from Hugging Face Hub on startup
HF_REPO_ID = "moddeore1004/ai_or_not_detection"
HF_FILENAME = "ai_detector_model.keras"
model = None

# Text models
nb_model_uni = None
lr_model_uni = None
uni_vectorizer = None

rf_model_bi = None
lgb_model_bi = None
bi_vectorizer = None

@app.on_event("startup")
async def load_models():
    global model, nb_model_uni, lr_model_uni, uni_vectorizer
    global rf_model_bi, lgb_model_bi, bi_vectorizer
    try:
        print(f"Downloading model from Hugging Face: {HF_REPO_ID}/{HF_FILENAME}")
        model_path = hf_hub_download(repo_id=HF_REPO_ID, filename=HF_FILENAME)
        model = tf.keras.models.load_model(model_path)
        print("Image model loaded successfully.")
    except Exception as e:
        print(f"Error loading image model: {e}")
        
    try:
        nb_model_uni = joblib.load('uni model pkl/nb_model.pkl')
        lr_model_uni = joblib.load('uni model pkl/lr_model.pkl')
        uni_vectorizer = joblib.load('uni model pkl/uni-vectorizer.pkl')
        
        rf_model_bi = joblib.load('bi model pkl/rf_model.pkl')
        lgb_model_bi = joblib.load('bi model pkl/lgb_model.pkl')
        bi_vectorizer = joblib.load('bi model pkl/bi-vectorizer.pkl')
        print("Text models loaded successfully.")
    except Exception as e:
        print(f"Error loading text models: {e}")

class TextRequest(BaseModel):
    text: str
    model: str = "unigram"

@app.post("/api/detect-image")
async def predict_image(file: UploadFile = File(...)):
    if not model:
        return {"error": "Model not loaded"}

    try:
        # Read the uploaded image file
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # Preprocess the image
        img = img.resize((224, 224))
        img_array = keras_image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0) / 255.0

        # Run prediction
        prediction = model.predict(img_array)
        prob = float(prediction[0][0])
        
        # Since class_mode='binary' with sigmoid, the probability represents the likelihood of class 1.
        # We need to know which class is index 1. Usually, ImageDataGenerator assigns them alphabetically.
        # FAKE -> 0, REAL -> 1.
        # Check training flow: `test_generator.class_indices`. "FAKE": 0, "REAL": 1.
        
        # If prob is close to 1, it's REAL. If close to 0, it's FAKE.
        # User reported reversed output, so we swap the logic.
        if prob > 0.5:
            label = "AI Generated"
            percentage = round(prob * 100)
        else:
            label = "Real"
            percentage = round((1 - prob) * 100)
            
        return {
            "prediction": label,
            "probability": f"{percentage}%"
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/detect-text")
async def predict_text(request: TextRequest):
    text = request.text
    model_type = request.model

    if not text:
        return {"error": "No text provided"}

    try:
        if model_type == 'unigram':
            if not uni_vectorizer:
                return {"error": "Text models not loaded"}
            
            text_vector = uni_vectorizer.transform([text]).toarray()
            nb_probs = nb_model_uni.predict_proba(text_vector)[:, 1]
            lr_probs = lr_model_uni.predict_proba(text_vector)[:, 1]

            combined_probs_uni = (nb_probs + lr_probs) / 2
            # User reported reversed behavior, so we align with their observation.
            # If P(1) > 0.5, we label it as "AI Generated" (assuming 1 is AI)
            prob = combined_probs_uni[0]
            if prob > 0.5:
                label = "AI Generated Content"
                percentage = round(prob * 100)
            else:
                label = "Human Written"
                percentage = round((1 - prob) * 100)
            
            return {
                "prediction": label,
                "probability": f"{percentage}%"
            }

        elif model_type == 'bigram':
            if not bi_vectorizer:
                return {"error": "Text models not loaded"}
                
            text_vector = bi_vectorizer.transform([text]).toarray()
            rf_probs = rf_model_bi.predict_proba(text_vector)[:, 1]
            lgb_probs = lgb_model_bi.predict_proba(text_vector)[:, 1]

            combined_probs_bi = (rf_probs + lgb_probs) / 2
            # User reported reversed behavior, so we align with their observation.
            prob = combined_probs_bi[0]
            if prob > 0.5:
                label = "AI Generated Content"
                percentage = round(prob * 100)
            else:
                label = "Real"
                percentage = round((1 - prob) * 100)
            
            return {
                "prediction": label,
                "probability": f"{percentage}%"
            }

        else:
            return {"error": "Invalid model type selected"}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
