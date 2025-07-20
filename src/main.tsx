import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'


declare global {
  interface Window {
    api: {
      setTitle: (title: string) => void;
      login: (credentials: { username: string; password: string }) => Promise<
        {
          error: string | null;
          success: boolean;
          token: string;
          user: {
            id_empleado: number;
            cedula: string;
            nombre: string;
            apellido: string;
            usuario: string;
            id_grupo: number;
            activo: boolean;
          }
        }>;
      getGroups: () => {
        success: boolean;
        groups: {
          id_grupo: string,
          nombre_grupo: string,
          creado_en: string,
          actualizado_en: string,
        }[];
      }
    };
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
