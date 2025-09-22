import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  X,
  Sparkles,
  Zap,
  Target,
  CheckCircle2,
} from "lucide-react";
import { modelApi } from "../services/api";

// 🎙️ Hook de voz
const speak = (text: string) => {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  window.speechSynthesis.speak(utterance);
};

const CreateModel: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [type, setType] = useState<"standard" | "arithmetic">("standard");
  const [customSigns, setCustomSigns] = useState<string[]>([]);
  const [newSign, setNewSign] = useState("");
  const [loading, setLoading] = useState(false);

  const arithmeticSigns = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "+",
    "-",
    "×",
    "÷",
  ];

  // 📢 Narrar cuando entra a la página
  useEffect(() => {
    speak("Crear nuevo modelo. Diseña y configura tu modelo de reconocimiento de señas");
  }, []);

  const addCustomSign = () => {
    const trimmed = newSign.trim();
    if (trimmed && !customSigns.includes(trimmed)) {
      setCustomSigns([...customSigns, trimmed]);
      speak(`Se agregó la seña personalizada: ${trimmed}`);
      setNewSign("");
    }
  };

  const removeCustomSign = (sign: string) => {
    setCustomSigns(customSigns.filter((s) => s !== sign));
    speak(`Se eliminó la seña ${sign}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      speak("Por favor ingresa un nombre para el modelo");
      return;
    }

    setLoading(true);
    try {
      const signs = type === "arithmetic" ? arithmeticSigns : customSigns;
      const response = await modelApi.create({
        name: name.trim(),
        type,
        signs,
      });
      speak("Modelo creado correctamente");
      navigate(`/train/${response.data.id}`);
    } catch (error) {
      console.error("Error creating model:", error);
      speak("Ocurrió un error al crear el modelo");
    } finally {
      setLoading(false);
    }
  };

  const isValid = name.trim() && (type === "arithmetic" || customSigns.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Fondos decorativos */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse animate-delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-cyan-200/15 to-blue-200/15 rounded-full blur-2xl animate-pulse animate-delay-2000"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Header con Volver */}
        <div className="flex items-center mb-12 animate-fade-in-up">
          <button
            onClick={() => {
              speak("Volviendo al Dashboard");
              navigate("/");
            }}
            className="group flex items-center text-slate-600 hover:text-slate-900 transition-all duration-300 hover:-translate-x-1"
          >
            <div className="p-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-sm group-hover:shadow-md transition-all duration-300 mr-3">
              <ArrowLeft className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="font-medium">Volver al Dashboard</span>
          </button>
        </div>

        {/* Título */}
        <div className="text-center mb-12 animate-fade-in-up animate-delay-500">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Crear Nuevo Modelo
            </h1>
          </div>
          <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Diseña y configura tu modelo de reconocimiento de señas con IA avanzada
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="animate-fade-in-up animate-delay-1000">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500 space-y-10">
            {/* Nombre */}
            <div className="space-y-3">
              <label
                htmlFor="name"
                className="flex items-center gap-2 text-lg font-semibold text-slate-800"
              >
                <Target className="w-5 h-5 text-blue-600" />
                Nombre del Modelo
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Alfabeto Básico, Números y Operaciones"
                className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200/50 bg-white/80 backdrop-blur-sm focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all duration-300 text-lg placeholder:text-slate-400 hover:shadow-md"
                required
              />
            </div>

            {/* Tipo de modelo */}
            <div className="space-y-6">
              <label className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <Zap className="w-5 h-5 text-indigo-600" />
                Tipo de Modelo
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    value: "standard",
                    title: "Modelo Estándar",
                    desc: "Define tus propias señas personalizadas",
                  },
                  {
                    value: "arithmetic",
                    title: "Modelo Aritmético",
                    desc: "Números 0-9 y operadores básicos (+, -, ×, ÷)",
                  },
                ].map((opt) => (
                  <label key={opt.value} className="relative cursor-pointer group">
                    <input
                      type="radio"
                      name="type"
                      value={opt.value}
                      checked={type === opt.value}
                      onChange={() => {
                        setType(opt.value as "standard" | "arithmetic");
                        speak(`Seleccionaste ${opt.title}`);
                      }}
                      className="sr-only"
                    />
                    <div
                      className={`p-8 rounded-3xl border-3 transition-all duration-300 transform group-hover:scale-[1.02] ${
                        type === opt.value
                          ? `border-blue-500 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 shadow-xl shadow-blue-500/10`
                          : "border-slate-200/50 bg-white/60 hover:border-slate-300/70 hover:shadow-lg"
                      }`}
                    >
                      <h3 className="font-bold text-xl text-slate-900 mb-2">
                        {opt.title}
                      </h3>
                      <p className="text-slate-600">{opt.desc}</p>
                      {type === opt.value && (
                        <CheckCircle2 className="w-6 h-6 text-blue-600 mt-2" />
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Señas personalizadas */}
            {type === "standard" && (
              <div className="space-y-6 animate-fade-in-up">
                <label className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <Plus className="w-5 h-5 text-purple-600" />
                  Señas Personalizadas
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newSign}
                    onChange={(e) => setNewSign(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addCustomSign())
                    }
                    placeholder="Ej: hola, gracias, adiós"
                    className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200/50 bg-white/80 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all duration-300 text-lg placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={addCustomSign}
                    className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
                {customSigns.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {customSigns.map((sign) => (
                      <span
                        key={sign}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 text-sm font-medium rounded-full shadow-sm border border-purple-200/50"
                      >
                        {sign}
                        <button
                          type="button"
                          onClick={() => removeCustomSign(sign)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Señas aritméticas */}
            {type === "arithmetic" && (
              <div className="space-y-6 animate-fade-in-up">
                <label className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Señas Incluidas (Automático)
                </label>
                <div className="p-6 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-2xl border border-emerald-200/50">
                  <div className="flex flex-wrap gap-3">
                    {arithmeticSigns.map((sign) => (
                      <span
                        key={sign}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 text-sm font-bold rounded-full shadow-sm border border-emerald-200/50"
                      >
                        {sign}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => {
                  speak("Cancelando creación de modelo");
                  navigate("/");
                }}
                className="px-8 py-4 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isValid || loading}
                className="flex-1 group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-bold rounded-2xl hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
              >
                {loading ? "Creando..." : "Crear Modelo"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateModel;
