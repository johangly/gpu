import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { User, AttendanceRecord } from '../types';
import formatAttendanceDateTime from './dateFormatter';

interface AttendanceMarkerProps {
  user: User;
}

const MarkAttendance: React.FC<AttendanceMarkerProps> = ({ user }) => {
  const [currentUser] = useState<User | null>(user);

  const [lastActivity, setLastActivity] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const getUserActivity = async () => {
    if (!currentUser || !currentUser.id_empleado) {
      setLoading(false);
      toast.error('Error: No se ha proporcionado un usuario válido.');
      return;
    }

    setLoading(true);
    try {
      const response = await window.api.getLastUserActivity(currentUser.id_empleado);
      const response2 = await window.api.getAllUserActivities(currentUser.id_empleado);
      console.log(response2, 'respuesta de todas las actividades del usuario');
      console.log(response,'respuesta de la actividad del usuario')
      if (response.success && response.activities && response.activities.length > 0) {
        const last = response.activities[0];
        setLastActivity(last);
        const activityTime = new Date(last.fecha_hora).toLocaleString();
        if (last.tipo_accion === 'entrada') {
            toast.success(`Actualmente has marcado ENTRADA el ${activityTime}.`);
        } else {
          toast(`Tu última acción fue SALIDA el ${activityTime}.`);
        }
      } else {
        setLastActivity(null);
        toast('No hay registros de asistencia para hoy. Por favor, marca tu entrada.');
      }
    } catch (error) {
      console.error('Error al obtener la última actividad:', error);
      toast.error('Error al cargar tu estado de asistencia.');
      toast('Error al cargar tu estado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.id_empleado) {
      getUserActivity();
    }
  }, [currentUser]);

  const handleMarkAttendance = async (actionType: 'entrada' | 'salida') => {
    if (!currentUser || !currentUser.id_empleado) {
      toast.error('No se puede marcar asistencia: Usuario no válido.');
      return;
    }

    setLoading(true);
    try {
      const response = await window.api.markAttendance({
        id_empleado: currentUser.id_empleado,
        tipo_accion: actionType,
      });

      if (response.success) {
        toast.success(response.message || `Acción de ${actionType} registrada exitosamente.`);
        await getUserActivity();
      } else {
        toast.error(response.message || `Error al marcar ${actionType}.`);
      }
    } catch (error) {
      console.error(`Error IPC al marcar ${actionType}:`, error);
      toast.error(`Error de conexión al marcar ${actionType}.`);
    } finally {
      setLoading(false);
    }
  };

  const showMarkEntryButton = !lastActivity || lastActivity.tipo_accion === 'salida';
  const showMarkExitButton = lastActivity && lastActivity.tipo_accion === 'entrada';

  const formattedMessage = lastActivity
  ? formatAttendanceDateTime(lastActivity.fecha_hora, lastActivity.tipo_accion)
  : 'No hay actividad reciente.';


  if (!currentUser) {
    return (
      <div className="flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-xl shadow-2xl space-y-6 max-w-lg w-full border border-gray-200 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
            Sistema de Asistencia
          </h1>
          <p className="text-xl text-red-600 font-semibold">
            Error: No se ha proporcionado información de usuario válida.
          </p>
          <p className="text-md text-gray-600 mt-2">
            Por favor, asegúrate de iniciar sesión o de que el usuario sea cargado correctamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 font-sans">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
        Sistema de Asistencia
      </h1>
      <p className="text-xl text-gray-700">
        Bienvenido, <span className="font-semibold">{currentUser.nombre} {currentUser.apellido}</span>.
      </p>
      <div className="p-4 my-6 bg-gray-100 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2"> Estado de Asistencia </h3>
        <p className="text-gray-700"> { formattedMessage } </p>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Cargando estado de asistencia...</p>
        </div>
      ) : (
        <>
          {/* statusMessage removed, replaced by toast */}
          <div className="flex justify-center space-x-6">
            {showMarkEntryButton && (
              <button
                onClick={() => handleMarkAttendance('entrada')}
                className="flex items-center px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-75 transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H5a3 3 0 01-3-3v-10a3 3 0 013-3h11a3 3 0 013 3v1" />
                </svg>
                Marcar Entrada
              </button>
            )}

            {showMarkExitButton && (
              <button
                onClick={() => handleMarkAttendance('salida')}
                className="flex items-center px-8 py-4 bg-red-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-opacity-75 transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 8l-4 4m0 0l4 4m-4-4h14m-5 4v1a3 3 0 01-3 3H5a3 3 0 01-3-3v-10a3 3 0 013-3h11a3 3 0 013 3v1" />
                </svg>
                Marcar Salida
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MarkAttendance;
