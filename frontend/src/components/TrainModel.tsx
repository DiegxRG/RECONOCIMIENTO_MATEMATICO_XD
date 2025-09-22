"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  Play,
  AlertTriangle,
  Brain,
  Target,
} from "lucide-react"
import { Model, TrainingData } from "../types"
import { modelApi, trainingApi } from "../services/api"
import CameraComponent from "./Camera"

const TrainModel: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [model, setModel] = useState<Model | null>(null)
  const [currentSignIndex, setCurrentSignIndex] = useState(0)
  const [samples, setSamples] = useState<{ [key: string]: number }>({})
  const [isCapturing, setIsCapturing] = useState(false)
  const [isTraining, setIsTraining] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [loading, setLoading] = useState(true)
  const [captureError, setCaptureError] = useState<string | null>(null)

  const samplesPerSign = 10

  // ==== TTS automático ====
  const speak = (text: string) => {
    if (!window.speechSynthesis) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "es-ES"
    window.speechSynthesis.cancel() // cancelar cualquier lectura previa
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    loadModel()
  }, [id])

  useEffect(() => {
    if (captureError) {
      speak(captureError)
    }
  }, [captureError])

  useEffect(() => {
    if (model) {
      const sign = getCurrentSign()
      speak(`Por favor, realiza la seña ${sign}`)
    }
  }, [currentSignIndex, model])

  const loadModel = async () => {
    if (!id) return
    try {
      const response = await modelApi.getById(id)
      setModel(response.data)
      const initialSamples = response.data.signs.reduce(
        (acc: { [key: string]: number }, sign: string) => {
          acc[sign] = 0
          return acc
        },
        {}
      )
      setSamples(initialSamples)
    } catch (error) {
      console.error("Error loading model:", error)
      speak("Error al cargar el modelo")
    } finally {
      setLoading(false)
    }
  }

  const handleCapture = async (landmarks: number[][]) => {
    if (!model || isCapturing || landmarks.length === 0) return
    setIsCapturing(true)
    setCaptureError(null)

    const currentSign = model.signs[currentSignIndex]
    try {
      if (landmarks.length < 21) {
        throw new Error(
          "No se detectaron suficientes puntos de la mano. Asegúrate de que tu mano esté completamente visible."
        )
      }

      const trainingData: TrainingData = { sign: currentSign, landmarks }
      await trainingApi.addSample(model.id, trainingData)

      setSamples((prev) => ({
        ...prev,
        [currentSign]: prev[currentSign] + 1,
      }))
      speak(`Muestra para ${currentSign} capturada correctamente`)

      if (
        samples[currentSign] + 1 >= samplesPerSign &&
        currentSignIndex < model.signs.length - 1
      ) {
        setCurrentSignIndex((prev) => prev + 1)
      }
    } catch (error) {
      const errMsg =
        error instanceof Error
          ? error.message
          : "Error al capturar la muestra"
      setCaptureError(errMsg)
      speak(errMsg)
    } finally {
      setIsCapturing(false)
    }
  }

  const handleTrain = async () => {
    if (!model) return
    setIsTraining(true)
    try {
      await trainingApi.train(model.id)
      speak("Entrenamiento completado. Redirigiendo a la detección")
      navigate(`/detect/${model.id}`)
    } catch (error) {
      console.error("Error training model:", error)
      speak("Ocurrió un error al entrenar el modelo")
    } finally {
      setIsTraining(false)
    }
  }

  const getTotalSamples = () =>
    Object.values(samples).reduce((a, b) => a + b, 0)
  const getRequiredSamples = () =>
    (model?.signs.length || 0) * samplesPerSign
  const isTrainingReady = () =>
    getTotalSamples() >= getRequiredSamples()
  const getCurrentSign = () =>
    model?.signs[currentSignIndex] || ""
  const getCurrentSampleCount = () =>
    samples[getCurrentSign()] || 0

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex justify-center items-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 animate-pulse"></div>
        </div>
      </div>
    )
  }

  // Not found
  if (!model) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800">
            Modelo no encontrado
          </h3>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* Fondos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center text-slate-600 hover:text-slate-900 mr-6 transition-all duration-200"
          >
            <div className="p-2 rounded-xl bg-white/80 border group-hover:shadow-lg transition-all duration-200">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="ml-3 font-medium">Volver</span>
          </button>
          <div className="flex items-center">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white mr-4 shadow-lg">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Entrenar Modelo
              </h2>
              <p className="text-slate-600 font-medium">{model.name}</p>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna izquierda */}
          <div className="space-y-6">
            {/* Progreso */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mr-4">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  Progreso
                </h3>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm text-slate-600 mb-3">
                  <span>Total de muestras</span>
                  <span className="font-bold">
                    {getTotalSamples()} / {getRequiredSamples()}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (getTotalSamples() / getRequiredSamples()) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {model.signs.map((sign, index) => (
                  <div
                    key={sign}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === currentSignIndex
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <span
                        className={`font-medium ${
                          index === currentSignIndex
                            ? "text-blue-700"
                            : "text-slate-700"
                        }`}
                      >
                        {sign}
                      </span>
                      {samples[sign] >= samplesPerSign && (
                        <CheckCircle className="w-5 h-5 text-emerald-500 ml-2" />
                      )}
                    </div>
                    <span className="text-sm text-slate-600">
                      {samples[sign]} / {samplesPerSign}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Seña actual */}
            {!isTrainingReady() && (
              <div className="bg-white/80 rounded-2xl shadow-xl p-8">
                <div className="flex items-center mb-6">
                  <Camera className="w-6 h-6 text-amber-500 mr-2" />
                  <h3 className="text-xl font-bold">
                    Seña actual: {getCurrentSign()}
                  </h3>
                </div>
                <p className="text-slate-600 mb-4">
                  Muestras: {getCurrentSampleCount()} / {samplesPerSign}
                </p>

                {captureError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-sm text-red-700">
                      {captureError}
                    </span>
                  </div>
                )}

                {!showCamera ? (
                  <button
                    onClick={() => setShowCamera(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg"
                  >
                    <Camera className="w-5 h-5 inline mr-2" /> Activar
                    cámara
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCamera(false)}
                    className="w-full bg-slate-600 text-white py-3 rounded-xl hover:bg-slate-700"
                  >
                    Desactivar cámara
                  </button>
                )}
              </div>
            )}

            {/* Entrenar */}
            {isTrainingReady() && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-emerald-800 mb-4">
                  ¡Listo para entrenar!
                </h3>
                <button
                  onClick={handleTrain}
                  disabled={isTraining}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl hover:shadow-lg disabled:opacity-50"
                >
                  {isTraining ? (
                    "Entrenando..."
                  ) : (
                    <>
                      <Play className="w-5 h-5 inline mr-2" /> Entrenar
                      Modelo
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Columna derecha: cámara */}
          <div className="bg-white/80 rounded-2xl shadow-xl p-8">
            {showCamera && !isTrainingReady() ? (
              <>
                <h3 className="text-xl font-bold mb-4">
                  Capturar: {getCurrentSign()}
                </h3>
                <CameraComponent
                  onCapture={handleCapture}
                  isCapturing={isCapturing}
                />
                <p className="text-sm text-slate-600 mt-4">
                  Realiza la seña y presiona el botón de captura
                </p>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                <Camera className="w-16 h-16 mr-2" /> Activa la
                cámara para comenzar
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainModel
