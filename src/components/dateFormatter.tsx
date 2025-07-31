/**
 * Formatea una fecha y hora de asistencia para mostrarla de forma amigable.
 * Ejemplo de salida: 'salida a las 02:11 PM (ayer) día martes 29 de julio.'
 *
 * @param {string} isoDateString La fecha y hora en formato ISO (ej. "2025-07-29T18:11:15.000Z").
 * @param {'entrada' | 'salida'} actionType El tipo de acción (entrada o salida).
 * @returns {string} La cadena de texto formateada.
 */
function formatAttendanceDateTime(isoDateString: string, actionType: 'entrada' | 'salida'): string {
  const recordDate = new Date(isoDateString);
  const now = new Date();

  // --- 1. Formato de la hora (AM/PM) ---
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // Formato AM/PM
  };
  const formattedTime = recordDate.toLocaleTimeString('es-VE', timeOptions); // 'es-VE' para Venezuela

  // --- 2. Determinar si fue 'hoy', 'ayer' o una fecha específica ---
  // Normalizar fechas a medianoche para una comparación precisa (ignorar la hora)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const recordDay = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());

  let dayIndicator = '';
  if (recordDay.getTime() === today.getTime()) {
    dayIndicator = 'hoy';
  } else if (recordDay.getTime() === yesterday.getTime()) {
    dayIndicator = 'ayer';
  } else {
    // Si no es hoy ni ayer, obtener el día de la semana y la fecha completa
    const dayOfWeekOptions: Intl.DateTimeFormatOptions = { weekday: 'long' };
    const formattedDayOfWeek = recordDate.toLocaleDateString('es-VE', dayOfWeekOptions); // 'lunes', 'martes', etc.

    const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    const formattedDate = recordDate.toLocaleDateString('es-VE', dateOptions); // '23 de julio'

    dayIndicator = `el ${formattedDayOfWeek} ${formattedDate}`;
  }

  // --- 3. Construir el mensaje final ---
  // Asegurarse de que el 'día' no se duplique si ya está en el indicador
  const actionText = actionType === 'entrada' ? 'entrada' : 'salida';

  // Ajustar la frase para que sea más natural
  if (dayIndicator === 'hoy' || dayIndicator === 'ayer') {
    return `Última actividad: ${actionText} a las ${formattedTime} (${dayIndicator}).`;
  } else {
    return `Última actividad: ${actionText} a las ${formattedTime} ${dayIndicator}.`;
  }
}

export default formatAttendanceDateTime;
// --- Ejemplo de Uso en un Componente React ---
// import React, { useState, useEffect } from 'react';

// // Suponiendo que tienes un objeto de última actividad como este:
// interface LastActivityData {
//   id_registro: number;
//   id_empleado: number;
//   tipo_accion: 'entrada' | 'salida';
//   fecha_hora: string; // ISO string
// }

// const MyAttendanceStatus: React.FC = () => {
//   const [lastActivity, setLastActivity] = useState<LastActivityData | null>(null);

//   useEffect(() => {
//     // Simula la carga de datos de la API
//     const fetchActivity = () => {
//       // Ejemplo de datos (puedes cambiar la fecha para probar 'ayer' o fechas pasadas)
//       const mockDataToday: LastActivityData = {
//         id_registro: 1,
//         id_empleado: 101,
//         tipo_accion: 'entrada',
//         fecha_hora: new Date().toISOString(), // Hoy
//       };

//       const mockDataYesterday: LastActivityData = {
//         id_registro: 2,
//         id_empleado: 101,
//         tipo_accion: 'salida',
//         fecha_hora: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Ayer
//       };

//       const mockDataPast: LastActivityData = {
//         id_registro: 3,
//         id_empleado: 101,
//         tipo_accion: 'entrada',
//         fecha_hora: '2025-07-23T09:30:00.000Z', // Fecha específica
//       };

//       // Elige cuál mockData usar para probar
//       setLastActivity(mockDataToday);
//       // setLastActivity(mockDataYesterday);
//       // setLastActivity(mockDataPast);
//     };

//     fetchActivity();
//   }, []);

//   const formattedMessage = lastActivity
//     ? formatAttendanceDateTime(lastActivity.fecha_hora, lastActivity.tipo_accion)
//     : 'No hay actividad reciente.';

//   return (
//     <div className="p-4 bg-gray-100 rounded-lg shadow-md">
//     <h3 className="text-xl font-semibold mb-2" > Estado de Asistencia </h3>
//       < p className = "text-gray-700" > { formattedMessage } </p>
//     </div>
//   );
// };

// export default MyAttendanceStatus;
