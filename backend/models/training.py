import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.utils import to_categorical
from .model import SignRecognitionModel
import os
import json

class ModelTrainer:
    def __init__(self, model_id: str):
        self.model_id = model_id
        self.training_data = []
        self.labels = []
        self.label_encoder = LabelEncoder()

    def add_sample(self, landmarks, sign):
        if len(landmarks) > 0:
            self.training_data.append(landmarks)
            self.labels.append(sign)

    def prepare_data(self):
        if not self.training_data:
            raise ValueError("No training data available")

        X = []
        for landmarks in self.training_data:
            model = SignRecognitionModel(len(set(self.labels)))
            processed = model.preprocess_landmarks(landmarks)
            X.append(processed)

        X = np.array(X)
        
        self.label_encoder.fit(self.labels)
        y_encoded = self.label_encoder.transform(self.labels)
        y = to_categorical(y_encoded)

        return X, y

    def augment_data(self, X, y, augmentation_factor=3):
        augmented_X = []
        augmented_y = []
        
        for i in range(len(X)):
            augmented_X.append(X[i])
            augmented_y.append(y[i])
            
            for _ in range(augmentation_factor):
                noise = np.random.normal(0, 0.01, X[i].shape)
                augmented_sample = X[i] + noise
                augmented_X.append(augmented_sample)
                augmented_y.append(y[i])
                
                scale = np.random.uniform(0.95, 1.05)
                scaled_sample = X[i] * scale
                augmented_X.append(scaled_sample)
                augmented_y.append(y[i])
        
        return np.array(augmented_X), np.array(augmented_y)

    def train_model(self, epochs=100):
        X, y = self.prepare_data()
        
        X_augmented, y_augmented = self.augment_data(X, y)
        
        X_train, X_val, y_train, y_val = train_test_split(
            X_augmented, y_augmented, test_size=0.2, random_state=42, stratify=y_augmented
        )

        num_classes = len(self.label_encoder.classes_)
        input_dim = X.shape[1]

        model = SignRecognitionModel(num_classes, input_dim)
        model.build_model()

        history = model.train(X_train, y_train, X_val, y_val, epochs)

        model_path = f"storage/models/{self.model_id}.h5"
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        model.save(model_path)

        metadata = {
            "classes": self.label_encoder.classes_.tolist(),
            "input_dim": input_dim,
            "num_classes": num_classes,
            "training_samples": len(self.training_data),
            "augmented_samples": len(X_augmented)
        }

        metadata_path = f"storage/models/{self.model_id}_metadata.json"
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f)

        return history