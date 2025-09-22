"use client"

import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus, Sparkles, TrendingUp, Zap, Star, Activity } from "lucide-react"
import type { Model } from "../types"
import { modelApi } from "../services/api"
import ModelCard from "./ModelCard"
import { useTextToSpeech } from "../hooks/useTextToSpeech"

const Dashboard: React.FC = () => {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)

  // 🎤 Hook de voz
  const { speak } = useTextToSpeech()

  useEffect(() => {
    // Reproducir texto al montar
    speak(
      "Modelos de Reconocimiento. Gestiona y entrena tus modelos de reconocimiento de señas con IA avanzada."
    )
  }, [speak])

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      const response = await modelApi.getAll()
      setModels(response.data)
    } catch (error) {
      console.error("Error loading models:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await modelApi.delete(id)
      setModels(models.filter((model) => model.id !== id))
    } catch (error) {
      console.error("Error deleting model:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30"></div>
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200/20 rounded-full blur-xl animate-pulse animate-delay-1000"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-100 border-t-blue-600 shadow-lg"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-t-purple-400 animate-spin duration-[1500ms]"></div>
            <div className="absolute inset-2 rounded-full h-16 w-16 border-2 border-transparent border-t-indigo-300 animate-spin duration-[2000ms]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-700 font-semibold text-lg animate-pulse">Cargando modelos...</p>
          <div className="mt-4 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute top-40 right-0 w-96 h-96 bg-gradient-to-bl from-purple-100/20 to-pink-100/20 rounded-full blur-3xl -z-10 animate-pulse animate-delay-2000"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 mb-12">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Modelos de Reconocimiento
            </h1>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed">
            Gestiona y entrena tus modelos de reconocimiento de señas con IA avanzada
          </p>

          <div className="flex gap-4 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">{models.length} Modelos</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-semibold text-gray-700">IA Activa</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
              <Star className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">Premium</span>
            </div>
          </div>
        </div>

        {/* Create Model Button */}
        <Link
          to="/create"
          className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-bold rounded-2xl hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          <span className="relative z-10">Crear Modelo</span>
          <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </Link>
      </div>

      {/* Models Grid */}
      {models.length === 0 ? (
        <div className="text-center py-20 px-6 relative">
          <div className="max-w-lg mx-auto relative">
            <div className="relative mb-10">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300 border border-white/50">
                <Sparkles className="w-16 h-16 text-blue-600 animate-pulse" />
              </div>
              {/* Decorative bouncing dots */}
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full animate-bounce shadow-lg"></div>
              <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full animate-bounce animate-delay-500 shadow-lg"></div>
              <div className="absolute top-2 -left-6 w-4 h-4 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-bounce animate-delay-1000 shadow-lg"></div>
              <div className="absolute -top-6 left-8 w-3 h-3 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full animate-bounce animate-delay-1500 shadow-lg"></div>
            </div>

            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-4">
              ¡Comienza tu primer modelo!
            </h3>
            <p className="text-gray-600 mb-10 text-lg leading-relaxed">
              No hay modelos creados aún. Crea tu primer modelo de reconocimiento de señas y comienza a entrenar tu IA con tecnología de vanguardia.
            </p>

            <Link
              to="/create"
              className="group relative inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-bold text-lg rounded-2xl hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl"></div>
              <Plus className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-500" />
              <span className="relative z-10">Crear Primer Modelo</span>
              <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {models.map((model, index) => (
            <div
              key={model.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ModelCard model={model} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
