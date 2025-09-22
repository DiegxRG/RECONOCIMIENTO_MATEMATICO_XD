from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from database.database import get_db
from database.models import Model as ModelDB, TrainingSample
from models.training import ModelTrainer
import json

router = APIRouter()

class TrainingData(BaseModel):
    sign: str
    landmarks: List[List[float]]

class TrainingProgress(BaseModel):
    progress: int
    is_complete: bool
    message: str

@router.post("/{model_id}/sample")
def add_training_sample(
    model_id: str,
    training_data: TrainingData,
    db: Session = Depends(get_db)
):
    model = db.query(ModelDB).filter(ModelDB.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    sample = TrainingSample(
        model_id=model_id,
        sign=training_data.sign,
        landmarks=json.dumps(training_data.landmarks)
    )
    
    db.add(sample)
    db.commit()
    
    total_samples = db.query(TrainingSample).filter(TrainingSample.model_id == model_id).count()
    signs = json.loads(model.signs)
    required_samples = len(signs) * 10
    progress = min(int((total_samples / required_samples) * 100), 100)
    
    model.training_progress = progress
    db.commit()
    
    return {"message": "Sample added successfully", "progress": progress}

def train_model_background(model_id: str, db: Session):
    model = db.query(ModelDB).filter(ModelDB.id == model_id).first()
    if not model:
        return
    
    samples = db.query(TrainingSample).filter(TrainingSample.model_id == model_id).all()
    
    trainer = ModelTrainer(model_id)
    
    for sample in samples:
        landmarks = json.loads(sample.landmarks)
        trainer.add_sample(landmarks, sample.sign)
    
    try:
        trainer.train_model()
        model.is_trained = True
        model.training_progress = 100
        db.commit()
    except Exception as e:
        print(f"Training failed: {e}")

@router.post("/{model_id}/train")
def train_model(
    model_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    model = db.query(ModelDB).filter(ModelDB.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    samples_count = db.query(TrainingSample).filter(TrainingSample.model_id == model_id).count()
    signs = json.loads(model.signs)
    required_samples = len(signs) * 10
    
    if samples_count < required_samples:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient training samples. Required: {required_samples}, Available: {samples_count}"
        )
    
    background_tasks.add_task(train_model_background, model_id, db)
    
    return {"message": "Training started", "status": "in_progress"}

@router.get("/{model_id}/progress", response_model=TrainingProgress)
def get_training_progress(model_id: str, db: Session = Depends(get_db)):
    model = db.query(ModelDB).filter(ModelDB.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    return TrainingProgress(
        progress=model.training_progress,
        is_complete=model.is_trained,
        message="Training completed" if model.is_trained else "Training in progress"
    )