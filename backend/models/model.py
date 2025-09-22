import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
import numpy as np

class SignRecognitionModel:
    def __init__(self, num_classes: int, input_dim: int = 126):
        self.num_classes = num_classes
        self.input_dim = input_dim
        self.model = None

    def build_model(self):
        self.model = Sequential([
            Dense(512, activation='relu', input_shape=(self.input_dim,)),
            BatchNormalization(),
            Dropout(0.4),
            Dense(256, activation='relu'),
            BatchNormalization(),
            Dropout(0.3),
            Dense(128, activation='relu'),
            BatchNormalization(),
            Dropout(0.2),
            Dense(64, activation='relu'),
            Dropout(0.2),
            Dense(self.num_classes, activation='softmax')
        ])

        self.model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )

        return self.model

    def train(self, X_train, y_train, X_val=None, y_val=None, epochs=100):
        if self.model is None:
            self.build_model()

        early_stopping = EarlyStopping(
            monitor='val_loss' if X_val is not None else 'loss',
            patience=15,
            restore_best_weights=True
        )

        validation_data = (X_val, y_val) if X_val is not None and y_val is not None else None

        history = self.model.fit(
            X_train, y_train,
            validation_data=validation_data,
            epochs=epochs,
            batch_size=16,
            verbose=1,
            callbacks=[early_stopping]
        )

        return history

    def predict(self, X):
        if self.model is None:
            raise ValueError("Model not trained yet")
        return self.model.predict(X)

    def save(self, filepath):
        if self.model is None:
            raise ValueError("Model not trained yet")
        self.model.save(filepath)

    def load(self, filepath):
        self.model = tf.keras.models.load_model(filepath)

    def preprocess_landmarks(self, landmarks):
        landmarks_array = np.array(landmarks)
        
        if len(landmarks_array.shape) == 1:
            landmarks_array = landmarks_array.reshape(-1, 3)
        
        if landmarks_array.shape[0] == 0:
            landmarks_array = np.zeros((21, 3))
        elif landmarks_array.shape[0] < 21:
            padded = np.zeros((21, 3))
            padded[:landmarks_array.shape[0]] = landmarks_array
            landmarks_array = padded
        elif landmarks_array.shape[0] > 42:
            landmarks_array = landmarks_array[:42]
        elif landmarks_array.shape[0] > 21 and landmarks_array.shape[0] < 42:
            padded = np.zeros((42, 3))
            padded[:landmarks_array.shape[0]] = landmarks_array
            landmarks_array = padded

        flattened = landmarks_array.flatten()
        
        if len(flattened) < self.input_dim:
            padded = np.zeros(self.input_dim)
            padded[:len(flattened)] = flattened
            flattened = padded
        elif len(flattened) > self.input_dim:
            flattened = flattened[:self.input_dim]

        mean = np.mean(flattened)
        std = np.std(flattened)
        if std > 0:
            flattened = (flattened - mean) / std

        return flattened