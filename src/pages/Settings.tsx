import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Database, Users, Clock } from 'lucide-react';

const Settings: React.FC = () => {
  const settingsSections = [
    {
      title: 'Notificaciones',
      icon: Bell,
      description: 'Configurar alertas y notificaciones del sistema',
      items: [
        { label: 'Notificaciones de tardanzas', enabled: true },
        { label: 'Alertas de ausencias', enabled: true },
        { label: 'Reportes automáticos', enabled: false },
      ]
    },
    {
      title: 'Seguridad',
      icon: Shield,
      description: 'Configuración de seguridad y accesos',
      items: [
        { label: 'Autenticación de dos factores', enabled: true },
        { label: 'Sesiones múltiples', enabled: false },
        { label: 'Logs de actividad', enabled: true },
      ]
    },
    {
      title: 'Base de Datos',
      icon: Database,
      description: 'Configuración de respaldos y mantenimiento',
      items: [
        { label: 'Respaldo automático', enabled: true },
        { label: 'Limpieza de logs antiguos', enabled: true },
        { label: 'Sincronización externa', enabled: false },
      ]
    },
    {
      title: 'Personal',
      icon: Users,
      description: 'Configuración de grupos y departamentos',
      items: [
        { label: 'Registro automático', enabled: true },
        { label: 'Validación de horarios', enabled: true },
        { label: 'Permisos especiales', enabled: false },
      ]
    },
    {
      title: 'Horarios',
      icon: Clock,
      description: 'Configuración de horarios laborales',
      items: [
        { label: 'Horario flexible', enabled: false },
        { label: 'Tolerancia de tardanza', enabled: true },
        { label: 'Horarios especiales', enabled: true },
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          Configuración
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600"
        >
          Administra la configuración del sistema de firma digital
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingsSections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <section.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                <p className="text-sm text-gray-500">{section.description}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + itemIndex * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      item.enabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <motion.span
                      animate={{ x: item.enabled ? 20 : 4 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
                    />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* System Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">v2.1.0</p>
            <p className="text-sm text-gray-500">Versión del Sistema</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">99.9%</p>
            <p className="text-sm text-gray-500">Tiempo de Actividad</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">88</p>
            <p className="text-sm text-gray-500">Usuarios Activos</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Settings;