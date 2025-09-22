from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import uuid

class Model(Base):
    __tablename__ = "models"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    signs = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_trained = Column(Boolean, default=False)
    training_progress = Column(Integer, default=0)
    
    training_samples = relationship("TrainingSample", back_populates="model", cascade="all, delete-orphan")

class TrainingSample(Base):
    __tablename__ = "training_samples"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    model_id = Column(String, ForeignKey("models.id"), nullable=False)
    sign = Column(String, nullable=False)
    landmarks = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    model = relationship("Model", back_populates="training_samples")