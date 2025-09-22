import mediapipe as mp
import cv2
import numpy as np

class MediaPipeProcessor:
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_draw = mp.solutions.drawing_utils
    
    def process_frame(self, frame):
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb_frame)
        
        landmarks = []
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                hand_points = []
                for landmark in hand_landmarks.landmark:
                    hand_points.append([landmark.x, landmark.y, landmark.z])
                landmarks.extend(hand_points)
        
        return landmarks, results
    
    def draw_landmarks(self, frame, results):
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                self.mp_draw.draw_landmarks(
                    frame, hand_landmarks, self.mp_hands.HAND_CONNECTIONS
                )
        return frame
    
    def normalize_landmarks(self, landmarks):
        if not landmarks:
            return []
        
        landmarks_array = np.array(landmarks)
        
        if len(landmarks_array) > 0:
            mean = np.mean(landmarks_array, axis=0)
            landmarks_array = landmarks_array - mean
            
            std = np.std(landmarks_array)
            if std > 0:
                landmarks_array = landmarks_array / std
        
        return landmarks_array.tolist()
    
    def __del__(self):
        if hasattr(self, 'hands'):
            self.hands.close()