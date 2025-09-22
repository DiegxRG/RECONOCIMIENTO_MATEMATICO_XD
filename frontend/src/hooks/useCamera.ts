import { useRef, useEffect, useState, useCallback } from 'react';

interface UseCameraReturn {
  isLoading: boolean;
  error: string | null;
  landmarks: number[][];
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureFrame: () => void;
}

declare global {
  interface Window {
    Hands: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}

export const useCamera = (
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>
): UseCameraReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<number[][]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const handsRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();
  const isProcessingRef = useRef(false);

  const waitForMediaPipe = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 100;
      
      const check = () => {
        attempts++;
        if (window.Hands && window.drawConnectors && window.drawLandmarks && window.HAND_CONNECTIONS) {
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('MediaPipe no se cargó correctamente'));
        } else {
          setTimeout(check, 100);
        }
      };
      
      check();
    });
  }, []);

  const initializeHands = useCallback(async () => {
    try {
      await waitForMediaPipe();
      
      const hands = new window.Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.3
      });

      hands.onResults((results: any) => {
        if (!canvasRef.current || !videoRef.current || isProcessingRef.current) return;
        
        isProcessingRef.current = true;
        
        try {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) return;
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = 'source-over';
          
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const allLandmarks: number[][] = [];
            
            for (const handLandmarks of results.multiHandLandmarks) {
              window.drawConnectors(ctx, handLandmarks, window.HAND_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 2
              });
              
              window.drawLandmarks(ctx, handLandmarks, {
                color: '#FF0000',
                lineWidth: 1,
                radius: 3
              });
              
              const landmarkArray = handLandmarks.map((landmark: any) => [
                landmark.x,
                landmark.y,
                landmark.z || 0
              ]);
              
              allLandmarks.push(...landmarkArray);
            }
            
            setLandmarks(allLandmarks);
          } else {
            setLandmarks([]);
          }
          
          ctx.restore();
        } catch (err) {
          console.error('Error processing results:', err);
        } finally {
          isProcessingRef.current = false;
        }
      });

      handsRef.current = hands;
    } catch (err) {
      throw new Error(`Error inicializando MediaPipe: ${err}`);
    }
  }, [canvasRef, videoRef, waitForMediaPipe]);

  const processFrame = useCallback(() => {
    if (videoRef.current && handsRef.current && videoRef.current.readyState >= 2 && !isProcessingRef.current) {
      try {
        handsRef.current.send({ image: videoRef.current });
      } catch (err) {
        console.error('Error processing frame:', err);
      }
    }
    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [videoRef]);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video element not available'));
            return;
          }
          
          const handleLoadedMetadata = async () => {
            if (videoRef.current) {
              try {
                await videoRef.current.play();
                resolve();
              } catch (playError) {
                reject(playError);
              }
            }
          };
          
          const handleError = (error: any) => {
            reject(error);
          };
          
          videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
          videoRef.current.addEventListener('error', handleError, { once: true });
        });
        
        setStream(mediaStream);
        
        await initializeHands();
        
        setTimeout(() => {
          processFrame();
        }, 1000);
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      let errorMessage = 'No se pudo inicializar la cámara';
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Permiso de cámara denegado. Por favor, permite el acceso a la cámara.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No se encontró ninguna cámara disponible.';
        } else if (err.name === 'NotReadableError') {
          errorMessage = 'La cámara está siendo usada por otra aplicación.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [videoRef, initializeHands, processFrame]);

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (handsRef.current) {
      try {
        handsRef.current.close();
      } catch (err) {
        console.error('Error closing hands:', err);
      }
      handsRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setLandmarks([]);
    isProcessingRef.current = false;
  }, [stream, videoRef]);

  const captureFrame = useCallback(() => {
    return landmarks;
  }, [landmarks]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    isLoading,
    error,
    landmarks,
    startCamera,
    stopCamera,
    captureFrame
  };
};