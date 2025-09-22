import axios from 'axios';
import { Model, TrainingData, PredictionResult } from '../types';

const API_BASE_URL = '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const modelApi = {
  getAll: () => api.get<Model[]>('/models'),
  getById: (id: string) => api.get<Model>(`/models/${id}`),
  create: (data: { name: string; type: 'standard' | 'arithmetic'; signs?: string[] }) => 
    api.post<Model>('/models', data),
  delete: (id: string) => api.delete(`/models/${id}`),
};

export const trainingApi = {
  addSample: (modelId: string, data: TrainingData) => 
    api.post(`/training/${modelId}/sample`, data),
  train: (modelId: string) => api.post(`/training/${modelId}/train`),
  getProgress: (modelId: string) => api.get(`/training/${modelId}/progress`),
};

export const detectionApi = {
  predict: (modelId: string, landmarks: number[][]) => 
    api.post<PredictionResult>(`/detection/${modelId}/predict`, { landmarks }),
};