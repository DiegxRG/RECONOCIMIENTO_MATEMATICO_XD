export interface Model {
  id: string;
  name: string;
  type: 'standard' | 'arithmetic';
  signs: string[];
  created_at: string;
  is_trained: boolean;
  training_progress?: number;
}

export interface TrainingData {
  sign: string;
  landmarks: number[][];
}

export interface PredictionResult {
  sign: string;
  confidence: number;
}

export interface Landmark {
  x: number;
  y: number;
  z: number;
}