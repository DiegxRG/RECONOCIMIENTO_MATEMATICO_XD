import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import CreateModel from './components/CreateModel'
import TrainModel from './components/TrainModel'
import Detection from './components/Detection'

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Reconocimiento de Señas
            </h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateModel />} />
            <Route path="/train/:id" element={<TrainModel />} />
            <Route path="/detect/:id" element={<Detection />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App