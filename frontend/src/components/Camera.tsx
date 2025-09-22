import React, { useRef, useEffect, useState } from "react";
import { Camera as CameraIcon, Circle, AlertCircle } from "lucide-react";
import { useCamera } from "../hooks/useCamera";

interface CameraProps {
  onCapture?: (landmarks: number[][]) => void;
  isCapturing?: boolean;
  continuous?: boolean;
  showLandmarks?: boolean;
}

const Camera: React.FC<CameraProps> = ({
  onCapture,
  isCapturing = false,
  continuous = false,
  showLandmarks = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isLoading, error, landmarks, startCamera, stopCamera } = useCamera(
    videoRef,
    canvasRef
  );

  const [isActive, setIsActive] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Inicializar cámara
  useEffect(() => {
    const initCamera = async () => {
      try {
        setPermissionDenied(false);
        await startCamera();
        setIsActive(true);
      } catch (err) {
        console.error("Failed to start camera:", err);
        if (err instanceof Error && err.message.includes("denegado")) {
          setPermissionDenied(true);
        }
      }
    };

    const timer = setTimeout(initCamera, 500);
    return () => {
      clearTimeout(timer);
      stopCamera();
      setIsActive(false);
    };
  }, [startCamera, stopCamera]);

  // Captura continua
  useEffect(() => {
    if (continuous && landmarks.length > 0 && onCapture) {
      const throttledCapture = setTimeout(() => onCapture(landmarks), 100);
      return () => clearTimeout(throttledCapture);
    }
  }, [landmarks, continuous, onCapture]);

  const handleCapture = () => {
    if (landmarks.length > 0 && onCapture && !isCapturing) {
      onCapture(landmarks);
    }
  };

  const requestPermission = async () => {
    try {
      setPermissionDenied(false);
      await startCamera();
      setIsActive(true);
    } catch (err) {
      console.error("Permission request failed:", err);
    }
  };

  // -----------------------------
  // Render de distintos estados
  // -----------------------------

  if (permissionDenied) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl border border-gray-200">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Permiso de Cámara Requerido
          </h3>
          <p className="text-gray-600 mb-4">
            Para usar esta función necesitas permitir el acceso a la cámara.
          </p>

          <ul className="text-sm text-left space-y-1 text-gray-500">
            <li>
              <strong>Chrome/Edge:</strong> Clic en el ícono de cámara en la
              barra de direcciones
            </li>
            <li>
              <strong>Firefox:</strong> Clic en el candado/escudo y permitir
              cámara
            </li>
            <li>
              <strong>Safari:</strong> Configuración → Sitios web → Cámara
            </li>
          </ul>

          <button
            onClick={requestPermission}
            className="mt-5 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  if (error && !permissionDenied) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl border border-gray-200">
        <div className="text-center max-w-md">
          <CameraIcon className="w-12 h-12 mx-auto mb-3 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Error al acceder a la cámara
          </h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>

          <button
            onClick={requestPermission}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl border border-gray-200">
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
          <p className="text-sm">Inicializando cámara y MediaPipe...</p>
          <p className="text-xs mt-1 text-gray-400">
            Esto puede tomar unos segundos
          </p>
        </div>
      </div>
    );
  }

  // -----------------------------
  // Render normal
  // -----------------------------

  return (
    <div className="space-y-4">
      {/* Video + Canvas */}
      <div className="relative bg-black rounded-xl overflow-hidden shadow-md">
        <video
          ref={videoRef}
          className="w-full h-96 object-cover transform scale-x-[-1]"
          autoPlay
          playsInline
          muted
        />
        {showLandmarks && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none transform scale-x-[-1]"
          />
        )}

        {/* Indicadores arriba */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <div
            className={`flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium shadow-sm ${
              isActive ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1 ${
                isActive ? "bg-white animate-pulse" : "bg-white"
              }`}
            ></span>
            {isActive ? "ACTIVO" : "INACTIVO"}
          </div>

          {landmarks.length > 0 && (
            <div className="bg-blue-500 text-white px-2.5 py-1.5 rounded-full text-xs font-medium shadow-sm">
              MANOS: {Math.ceil(landmarks.length / 21)}
            </div>
          )}
        </div>

        {/* Info abajo */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm shadow-md">
            {landmarks.length > 0
              ? `Landmarks: ${landmarks.length} puntos (${Math.ceil(
                  landmarks.length / 21
                )} mano${Math.ceil(landmarks.length / 21) > 1 ? "s" : ""})`
              : "Coloca tus manos frente a la cámara"}
          </div>
        </div>
      </div>

      {/* Botón capturar */}
      {!continuous && onCapture && (
        <button
          onClick={handleCapture}
          disabled={landmarks.length === 0 || isCapturing}
          className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCapturing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Capturando...
            </>
          ) : (
            <>
              <Circle className="w-5 h-5 mr-2" />
              Capturar Seña
            </>
          )}
        </button>
      )}

      {/* Estado de cámara */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex justify-between">
            <span>Estado de la cámara:</span>
            <span
              className={isActive ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}
            >
              {isActive ? "Conectada" : "Desconectada"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Detección de manos:</span>
            <span
              className={
                landmarks.length > 0
                  ? "text-green-600 font-semibold"
                  : "text-gray-500"
              }
            >
              {landmarks.length > 0 ? "Activa" : "Inactiva"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Puntos detectados:</span>
            <span className="font-semibold">{landmarks.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Camera;
