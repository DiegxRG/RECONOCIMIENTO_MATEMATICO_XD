from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from database.database import get_db
from database.models import Model as ModelDB
from models.model import SignRecognitionModel
import json
import numpy as np
import os

router = APIRouter()

class PredictionRequest(BaseModel):
    landmarks: List[List[float]]

class PredictionResponse(BaseModel):
    sign: str
    confidence: float

loaded_models = {}

def load_model_if_needed(model_id: str):
    if model_id not in loaded_models:
        model_path = f"storage/models/{model_id}.h5"
        metadata_path = f"storage/models/{model_id}_metadata.json"
        
        if not os.path.exists(model_path) or not os.path.exists(metadata_path):
            return None, None
        
        try:
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
            
            model = SignRecognitionModel(metadata['num_classes'], metadata['input_dim'])
            model.load(model_path)
            
            loaded_models[model_id] = {
                'model': model,
                'classes': metadata['classes']
            }
        except Exception as e:
            print(f"Error loading model {model_id}: {e}")
            return None, None
    
    return loaded_models[model_id]['model'], loaded_models[model_id]['classes']

@router.post("/{model_id}/predict", response_model=PredictionResponse)
def predict_sign(
    model_id: str,
    prediction_request: PredictionRequest,
    db: Session = Depends(get_db)
):
    db_model = db.query(ModelDB).filter(ModelDB.id == model_id).first()
    if not db_model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    if not db_model.is_trained:
        raise HTTPException(status_code=400, detail="Model is not trained yet")
    
    model, classes = load_model_if_needed(model_id)
    if model is None:
        raise HTTPException(status_code=500, detail="Failed to load trained model")
    
    try:
        if len(prediction_request.landmarks) == 0:
            raise HTTPException(status_code=400, detail="No landmarks provided")
        
        processed_landmarks = model.preprocess_landmarks(prediction_request.landmarks)
        prediction = model.predict(np.array([processed_landmarks]))
        
        predicted_class_index = np.argmax(prediction[0])
        confidence = float(prediction[0][predicted_class_index])
        predicted_sign = classes[predicted_class_index]
        
        return PredictionResponse(
            sign=predicted_sign,
            confidence=confidence
        )
    
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")