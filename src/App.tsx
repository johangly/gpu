import './App.css'
import { LoginForm } from './LoginForm'
import Container from './Container'
import { useState, useMemo} from 'react'
import type { Session } from './types'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import {
  BarChart3,
  PieChart,
  Users,
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Reports from './pages/Reports';
import Employees from './pages/Employees';
import type { MenuItem } from './types';

function App() {

  const [session, setSession] = useState<Session>({
    token:"wdwdwdwdsawqwdsa",
    user: {
      id_empleado: 0,
      cedula: "232",
      nombre: "johangly",
      apellido: "sucre",
      usuario: "admin",
      id_grupo: 0,
      activo: true
    }
  })

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const menuItems: MenuItem[] = useMemo(() => [
    {
      id: 'overview',
      label: 'Vista General',
      icon: BarChart3,
      path: '/',
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
  ], []);


  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Router>
      { session.token && session.user.activo && (
        <div className="flex h-screen bg-gray-50">
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggle={handleSidebarToggle}
            menuItems={menuItems}
          />
          <main className="flex-1 overflow-auto">
            <div className="p-8">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<Overview />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/employees" element={<Employees />} />
                  {/* <Route path="/settings" element={<Settings />} /> */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AnimatePresence>
            </div>
          </main>
        </div>
      )}

      { !session.token && !session.user.activo && (
        <Container>
          <LoginForm setSession={setSession} />
        </Container>
      )}
    </Router>
  )
}

export default App
