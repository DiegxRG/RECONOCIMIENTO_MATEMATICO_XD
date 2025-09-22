import numpy as np
import json
import os
from typing import List, Tuple

def validate_landmarks(landmarks: List[List[float]]) -> bool:
    if not landmarks:
        return False
    
    if len(landmarks) < 21:
        return False
    
    for point in landmarks:
        if len(point) != 3:
            return False
        if not all(isinstance(coord, (int, float)) for coord in point):
            return False
    
    return True

def augment_landmarks(landmarks: List[List[float]], num_augmentations: int = 3) -> List[List[List[float]]]:
    if not validate_landmarks(landmarks):
        return [landmarks]
    
    landmarks_array = np.array(landmarks)
    augmented_samples = [landmarks]
    
    for _ in range(num_augmentations):
        noise = np.random.normal(0, 0.01, landmarks_array.shape)
        augmented = landmarks_array + noise
        augmented_samples.append(augmented.tolist())
    
    for _ in range(num_augmentations):
        scale = np.random.uniform(0.9, 1.1)
        scaled = landmarks_array * scale
        augmented_samples.append(scaled.tolist())
    
    return augmented_samples

def calculate_hand_features(landmarks: List[List[float]]) -> List[float]:
    if not validate_landmarks(landmarks):
        return [0.0] * 20
    
    landmarks_array = np.array(landmarks)
    features = []
    
    if len(landmarks_array) >= 21:
        hand = landmarks_array[:21]
        
        distances = []
        for i in range(1, 21):
            dist = np.linalg.norm(hand[i] - hand[0])
            distances.append(dist)
        
        angles = []
        for i in range(1, 20):
            v1 = hand[i] - hand[0]
            v2 = hand[i+1] - hand[0]
            cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-8)
            angles.append(np.arccos(np.clip(cos_angle, -1, 1)))
        
        features.extend(distances[:10])
        features.extend(angles[:10])
    
    while len(features) < 20:
        features.append(0.0)
    
    return features[:20]

def save_model_metadata(model_id: str, metadata: dict):
    os.makedirs("storage/models", exist_ok=True)
    metadata_path = f"storage/models/{model_id}_metadata.json"
    
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)

def load_model_metadata(model_id: str) -> dict:
    metadata_path = f"storage/models/{model_id}_metadata.json"
    
    if not os.path.exists(metadata_path):
        return {}
    
    with open(metadata_path, 'r') as f:
        return json.load(f)