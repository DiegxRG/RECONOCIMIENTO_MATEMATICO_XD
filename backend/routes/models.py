from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database.database import get_db
from database.models import Model as ModelDB
import json
import os

router = APIRouter()

class ModelCreate(BaseModel):
    name: str
    type: str
    signs: Optional[List[str]] = None

class ModelResponse(BaseModel):
    id: str
    name: str
    type: str
    signs: List[str]
    created_at: str
    is_trained: bool
    training_progress: int

ARITHMETIC_SIGNS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "-", "x", "÷"]

@router.post("/", response_model=ModelResponse)
def create_model(model_data: ModelCreate, db: Session = Depends(get_db)):
    if model_data.type == "arithmetic":
        signs = ARITHMETIC_SIGNS
    elif model_data.signs:
        signs = model_data.signs
    else:
        raise HTTPException(status_code=400, detail="Signs are required for standard models")
    
    db_model = ModelDB(
        name=model_data.name,
        type=model_data.type,
        signs=json.dumps(signs),
        is_trained=False,
        training_progress=0
    )
    
    db.add(db_model)
    db.commit()
    db.refresh(db_model)
    
    return ModelResponse(
        id=db_model.id,
        name=db_model.name,
        type=db_model.type,
        signs=json.loads(db_model.signs),
        created_at=db_model.created_at.isoformat(),
        is_trained=db_model.is_trained,
        training_progress=db_model.training_progress
    )

@router.get("/", response_model=List[ModelResponse])
def get_models(db: Session = Depends(get_db)):
    models = db.query(ModelDB).all()
    
    return [
        ModelResponse(
            id=model.id,
            name=model.name,
            type=model.type,
            signs=json.loads(model.signs),
            created_at=model.created_at.isoformat(),
            is_trained=model.is_trained,
            training_progress=model.training_progress
        )
        for model in models
    ]

@router.get("/{model_id}", response_model=ModelResponse)
def get_model(model_id: str, db: Session = Depends(get_db)):
    model = db.query(ModelDB).filter(ModelDB.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    return ModelResponse(
        id=model.id,
        name=model.name,
        type=model.type,
        signs=json.loads(model.signs),
        created_at=model.created_at.isoformat(),
        is_trained=model.is_trained,
        training_progress=model.training_progress
    )

@router.delete("/{model_id}")
def delete_model(model_id: str, db: Session = Depends(get_db)):
    model = db.query(ModelDB).filter(ModelDB.id == model_id).first()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    model_path = f"storage/models/{model_id}.h5"
    metadata_path = f"storage/models/{model_id}_metadata.json"
    
    if os.path.exists(model_path):
        os.remove(model_path)
    if os.path.exists(metadata_path):
        os.remove(metadata_path)
    
    db.delete(model)
    db.commit()
    
    return {"message": "Model deleted successfully"}