import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import type { Api } from './types/window.type'

// Tipo específico para respuestas que contienen un array de registros de asistencia

declare global {
  interface Window {
    api: Api;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
