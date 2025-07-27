import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import type { User, editUserProps } from './types/index.ts'

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
        error?: unknown;
        groups: {
          id_grupo: string,
          nombre_grupo: string,
          creado_en: string,
          actualizado_en: string,
        }[];
      },
      getUsers: () => {
        success: boolean;
        error?: unknown;
        users: User[];
      },
      createUser: (user: {
        cedula: string;
        nombre: string;
        apellido: string;
        usuario: string;
        clave: string;
        id_grupo: number;
      }) => Promise<{
        success: boolean;
        error: unknown | null;
        newUser?: {
          id_empleado: number;
          cedula: string;
          nombre: string;
          apellido: string;
          usuario: string;
          clave: string;
          id_grupo: number;
          activo: boolean;
        };
        message?: string;
      }>,
      deleteUser: (id_empleado: number) => Promise<{ success: boolean; error: unknown | null; message?: string; }>,
      editUser: (user: editUserProps) => Promise<{
        success: boolean;
        error: unknown | null;
        newUser?: {
          id_empleado: number;
          cedula: string;
          nombre: string;
          apellido: string;
          usuario: string;
          clave: string;
          id_grupo: number;
          activo?: boolean;
        };
        message?: string;
      }>;
    };
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
