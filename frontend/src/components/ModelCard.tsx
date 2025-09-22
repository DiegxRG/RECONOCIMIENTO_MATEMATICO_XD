import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Hash, Trash2, Play, Settings } from 'lucide-react';
import { Model } from '../types';

interface ModelCardProps {
  model: Model;
  onDelete: (id: string) => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getTypeLabel = (type: string) => {
    return type === 'arithmetic' ? 'Aritmético' : 'Estándar';
  };

  const getTypeColor = (type: string) => {
    return type === 'arithmetic' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl hover:scale-[1.03] transform transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{model.name}</h3>
          <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${getTypeColor(model.type)}`}>
            {getTypeLabel(model.type)}
          </span>
        </div>
        <button
          onClick={() => onDelete(model.id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Info */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <Hash className="w-4 h-4 mr-2" />
          {model.signs.length} señas
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          {formatDate(model.created_at)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        {model.is_trained ? (
          <Link
            to={`/detect/${model.id}`}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm rounded-lg shadow hover:from-green-600 hover:to-green-700 transition-all duration-300"
          >
            <Play className="w-4 h-4 mr-1" />
            Detectar
          </Link>
        ) : (
          <Link
            to={`/train/${model.id}`}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm rounded-lg shadow hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
          >
            <Settings className="w-4 h-4 mr-1" />
            Entrenar
          </Link>
        )}
      </div>

      {/* Progress */}
      {!model.is_trained && model.training_progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progreso</span>
            <span>{Math.round(model.training_progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${model.training_progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelCard;
