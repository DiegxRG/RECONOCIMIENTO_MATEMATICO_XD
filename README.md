# Sistema de Reconocimiento de Señas

Sistema completo para crear, entrenar y usar modelos de reconocimiento de señas con interfaz web moderna y backend en Python.

## Características

- **Frontend React**: Interfaz moderna y responsive con TypeScript y Tailwind CSS
- **Backend FastAPI**: API robusta con entrenamiento de modelos en tiempo real
- **Reconocimiento con MediaPipe**: Detección de landmarks de manos en tiempo real
- **Modelos personalizados**: Crea modelos estándar o aritméticos
- **Entrenamiento guiado**: Proceso paso a paso para capturar muestras
- **Detección en tiempo real**: Predicciones instantáneas con niveles de confianza

## Estructura del Proyecto

```
├── frontend/          # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── services/      # API calls
│   │   ├── hooks/         # Custom hooks
│   │   └── types/         # TypeScript types
├── backend/           # API FastAPI
│   ├── models/            # Modelos de ML
│   ├── database/          # Base de datos SQLite
│   ├── routes/            # Endpoints de la API
│   └── utils/             # Utilidades
└── storage/           # Almacenamiento local
    ├── models/            # Modelos entrenados (.h5)
    └── database/          # Base de datos SQLite
```

## Instalación y Configuración

### Backend

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Crear entorno virtual:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate     # Windows
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. Ejecutar servidor:
```bash
python run.py
```

El servidor estará disponible en `http://localhost:8000`

### Frontend

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar aplicación:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Uso del Sistema

### 1. Crear Modelo

- **Modelo Estándar**: Define tus propias señas personalizadas
- **Modelo Aritmético**: Incluye automáticamente números 0-9 y operadores (+, -, ×, ÷)

### 2. Entrenar Modelo

1. Activa la cámara
2. Realiza cada seña frente a la cámara
3. Captura 10 muestras por seña
4. Inicia el entrenamiento automático

### 3. Usar Modelo

1. Selecciona un modelo entrenado
2. Activa la cámara
3. Inicia la detección en tiempo real
4. Realiza señas frente a la cámara para obtener predicciones

## Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **Axios** para API calls
- **Vite** como bundler

### Backend
- **FastAPI** como framework web
- **SQLAlchemy** para ORM
- **SQLite** como base de datos
- **TensorFlow** para machine learning
- **MediaPipe** para procesamiento de landmarks
- **OpenCV** para procesamiento de imágenes

### Machine Learning
- **Redes neuronales densas** con TensorFlow/Keras
- **Preprocesamiento de landmarks** con normalización
- **Aumento de datos** para mejorar generalización
- **Clasificación multiclase** con softmax

## API Endpoints

### Modelos
- `POST /api/models` - Crear modelo
- `GET /api/models` - Listar modelos
- `GET /api/models/{id}` - Obtener modelo
- `DELETE /api/models/{id}` - Eliminar modelo

### Entrenamiento
- `POST /api/training/{id}/sample` - Añadir muestra
- `POST /api/training/{id}/train` - Entrenar modelo
- `GET /api/training/{id}/progress` - Progreso del entrenamiento

### Detección
- `POST /api/detection/{id}/predict` - Realizar predicción

## Requisitos del Sistema

- **Python 3.8+**
- **Node.js 16+**
- **Cámara web** para captura de señas
- **Navegador moderno** con soporte para WebRTC

## Notas Técnicas

- Los modelos se guardan en formato H5 de Keras
- Las muestras de entrenamiento se almacenan en SQLite
- MediaPipe procesa landmarks de manos en tiempo real
- La aplicación funciona completamente offline después de la instalación