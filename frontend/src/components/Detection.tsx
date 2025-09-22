import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Activity, AlertCircle } from 'lucide-react';
import { Model, PredictionResult } from '../types';
import { modelApi, detectionApi } from '../services/api';
import CameraComponent from './Camera';
import { useCamera } from '../hooks/useCamera';

const Detection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [model, setModel] = useState<Model | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [lastPredictionTime, setLastPredictionTime] = useState<number>(0);

  // Refs y hook de cámara
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { startCamera, stopCamera, landmarks, isLoading: cameraLoading, error: cameraError } = useCamera(videoRef, canvasRef);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    loadModel();
  }, [id]);

  const loadModel = async () => {
    if (!id) return;

    try {
      const response = await modelApi.getById(id);
      setModel(response.data);
      if (!response.data.is_trained) {
        navigate(`/train/${id}`);
      }
    } catch (error) {
      console.error('Error loading model:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDetection = useCallback(async (landmarksCaptured: number[][]) => {
    if (!model || !isDetecting || landmarksCaptured.length === 0) return;

    const now = Date.now();
    if (now - lastPredictionTime < 200) return;

    try {
      setDetectionError(null);
      
      if (landmarksCaptured.length < 21) {
        setDetectionError('No se detectaron suficientes puntos de la mano');
        return;
      }

      const response = await detectionApi.predict(model.id, landmarksCaptured);
      setPrediction(response.data);
      setLastPredictionTime(now);
    } catch (error) {
      console.error('Error during prediction:', error);
      setDetectionError('Error al realizar la predicción');
    }
  }, [model, isDetecting, lastPredictionTime]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Media';
    return 'Baja';
  };

  // Iniciar cámara automáticamente al mostrar
  useEffect(() => {
    if (showCamera) {
      startCamera()
        .then(() => setIsVideoPlaying(true))
        .catch((err) => {
          console.error('No se pudo iniciar la cámara automáticamente', err);
          setIsVideoPlaying(false);
        });
    } else {
      stopCamera();
      setIsVideoPlaying(false);
      setIsDetecting(false);
    }
  }, [showCamera, startCamera, stopCamera]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Modelo no encontrado</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Volver
        </button>
        <h2 className="text-2xl font-semibold text-gray-900">Detección: {model.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Información del modelo */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Modelo</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium">{model.type === 'arithmetic' ? 'Aritmético' : 'Estándar'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Señas:</span>
                <span className="font-medium">{model.signs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Entrenado</span>
              </div>
            </div>
          </div>

          {/* Señas detectables */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Señas Detectables</h3>
            <div className="grid grid-cols-3 gap-2">
              {model.signs.map((sign) => (
                <span
                  key={sign}
                  className="px-3 py-2 bg-gray-100 text-gray-800 text-sm rounded-lg text-center"
                >
                  {sign}
                </span>
              ))}
            </div>
          </div>

          {/* Resultado de detección */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultado de Detección</h3>

            {detectionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{detectionError}</span>
                </div>
              </div>
            )}

            {prediction ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">{prediction.sign}</div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                    Confianza: {getConfidenceLabel(prediction.confidence)} ({Math.round(prediction.confidence * 100)}%)
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${prediction.confidence >= 0.8 ? 'bg-green-500' : prediction.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${prediction.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                {isDetecting ? 'Esperando detección...' : 'Activa la detección para comenzar'}
              </div>
            )}
          </div>

          {/* Controles */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Controles</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowCamera(!showCamera)}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${showCamera ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
              >
                <Camera className="w-5 h-5 mr-2" />
                {showCamera ? 'Desactivar Cámara' : 'Activar Cámara'}
              </button>

              {showCamera && (
                <button
                  onClick={() => {
                    setIsDetecting(!isDetecting);
                    if (!isDetecting) {
                      setPrediction(null);
                      setDetectionError(null);
                    }
                  }}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${isDetecting ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                >
                  <Activity className="w-5 h-5 mr-2" />
                  {isDetecting ? 'Detener Detección' : 'Iniciar Detección'}
                </button>
              )}

              {/* Botón de inicio manual si video no reproduce */}
              {showCamera && !isVideoPlaying && (
                <button
                  onClick={async () => {
                    if (videoRef.current) {
                      try {
                        await videoRef.current.play();
                        setIsVideoPlaying(true);
                      } catch (err) {
                        console.error('Error iniciando video manualmente', err);
                      }
                    }
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  Iniciar Cámara Manualmente
                </button>
              )}
            </div>

            {showCamera && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <strong>Consejos para mejor detección:</strong>
                <ul className="mt-1 space-y-1">
                  <li>• Mantén tu mano completamente visible</li>
                  <li>• Usa buena iluminación</li>
                  <li>• Haz las señas de forma clara y estable</li>
                  <li>• Espera a ver los puntos de detección en tu mano</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Cámara en vivo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center">
          {showCamera ? (
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Cámara en Vivo</h3>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm ${isDetecting ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${isDetecting ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  {isDetecting ? 'Detectando' : 'Inactivo'}
                </div>
              </div>
              <CameraComponent
                onCapture={handleDetection}
                continuous={isDetecting}
                showLandmarks={true}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-400">
              <div className="text-center">
                <Camera className="w-16 h-16 mx-auto mb-4" />
                <p>Activa la cámara para comenzar la detección</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Detection;
