// App.tsx
import './App.css';
import { LoginForm } from './LoginForm';
import Container from './Container';
import { useState, useMemo } from 'react';
import type { Session, MenuItem } from './types'; // Asegúrate de que MenuItem esté definido en types.ts
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import {
  BarChart3,
  PieChart,
  Users,
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Reports from './pages/Reports';
import Employees from './pages/Employees';
import MarkAttendance from './components/markAttendance';
// import Settings from './pages/Settings'; // Descomenta si usas la página de Settings

function App() {
  const [session, setSession] = useState<Session>({
    token: "",
    user: {
      id_empleado: 0,
      cedula: "",
      nombre: "",
      apellido: "",
      usuario: "",
      activo: false,
      grupo: {
        id_grupo: 0,
        nombre_grupo: ""
      }
    }
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems: MenuItem[] = useMemo(() => {
    const baseItems: MenuItem[] = [

    ];

    // Clave para determinar el rol del usuario
    const userGroupId = session.user.grupo.id_grupo;

    // Añadir ítems específicos según el grupo del usuario
    if (userGroupId === 1) { // Administrativo
      return [
        ...baseItems,
        {
          id: 'overview',
          label: 'Vista General',
          icon: BarChart3,
          path: '/', // Ruta base
        },
        {
          id: 'reports',
          label: 'Reportes',
          icon: PieChart,
          path: '/reports',
        },
        {
          id: 'employees',
          label: 'Personal',
          icon: Users,
          path: '/employees',
          badge: 3 // Ejemplo de badge para notificaciones
        },
        // {
        //   id: 'settings',
        //   label: 'Configuración',
        //   icon: SettingsIcon,
        //   path: '/settings',
        // }
      ];
    } else { // Docente
      return [
        ...baseItems,
        {
          id: 'history',
          label: 'Historial',
          icon: PieChart,
          path: '/history',
        },
      ];
    }

    return []; // Si no hay sesión o grupo desconocido, no mostrar ítems
  }, [session.user.grupo.id_grupo]);

  console.log("session", session);

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Lógica de renderizado condicional basada en la sesión
  const isAuthenticated = session.token && session.user.activo;

  return (
    <Router> {/* HashRouter ya está importado como Router */}
      {isAuthenticated ? (
        <div className="flex h-screen bg-gray-50">
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggle={handleSidebarToggle}
            menuItems={menuItems}
            user={session.user} // Pasar el usuario actual al Sidebar
          />
          <main className="flex-1 overflow-auto">
            <div className="p-8">
              <h1 className="text-3xl font-bold mb-6">Bienvenido {session.user.nombre}</h1>
              <AnimatePresence mode="wait">
                <Routes>
                  {session.user.grupo.id_grupo !== 1
                    ? <>
                      <Route path="/mark-attendance" element={<MarkAttendance user={session.user} />} />
                      {/* <Route path="/history" element={<History user={session.user} />} /> */}
                      <Route path="*" element={<Navigate to="/mark-attendance" replace />} />
                    </>
                    : <>
                        {/* La ruta raíz '/' se renderizará cuando la URL sea http://localhost:5173/#/ */}
                        <Route path="/" element={<Overview />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/employees" element={<Employees session={session} />} />
                        {/* <Route path="/settings" element={<Settings />} /> */}
                        {/* Redirecciona cualquier ruta no encontrada a la vista general */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </>
                  }
                </Routes>
              </AnimatePresence>
            </div>
          </main>
        </div>
      ) : (
        <Container>
          <LoginForm setSession={setSession} />
        </Container>
      )}
      <Toaster position='bottom-right'/>
    </Router>
  );
}

export default App;