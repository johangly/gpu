import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Search, Download, Calendar as CalendarIcon } from 'lucide-react';
import type { Transition } from 'framer-motion'
import { twMerge } from 'tailwind-merge';
import { formatToAmPm } from '../utils/formatToAmPm';
import type { CalculateAttendanceResponse, DiaAsistencia } from '../types';
import toast from 'react-hot-toast';
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Button } from "../components/ui/button";
import { cn } from '../lib/utils';

// Función para formatear horas (HH:MM)
const formatTime = (timeInput: string | Date | null): string => {
  if (!timeInput) return '--:--';
  
  try {
    const date = timeInput instanceof Date ? timeInput : new Date(timeInput);
    
    if (isNaN(date.getTime())) {
      console.error('Hora inválida:', timeInput);
      return '--:--';
    }
    
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error al formatear la hora:', error);
    return '--:--';
  }
};

// Función para formatear fechas
const formatDate = (dateInput: string | Date) => {
  try {
    // Si ya es una fecha, la formateamos directamente
    if (dateInput instanceof Date) {
      return dateInput.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    // Si es un string en formato DD/MM/YYYY
    if (typeof dateInput === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
      const [day, month, year] = dateInput.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      
      // Verificamos si la fecha es válida
      if (isNaN(date.getTime())) {
        console.error('Fecha inválida:', dateInput);
        return dateInput;
      }
      
      return dateInput; // Ya está en el formato correcto
    }
    
    // Para cualquier otro formato, intentamos con el constructor de Date
    const date = new Date(dateInput);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    // Si no se pudo parsear, devolvemos el valor original
    console.error('Formato de fecha no soportado:', dateInput);
    return dateInput;
    
  } catch (error) {
    console.error('Error al formatear la fecha:', error);
    return String(dateInput); // Devolvemos el valor original como string
  }
};

const Reports = () => {
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calculedAttendance, setCalculedAttendance] = useState<CalculateAttendanceResponse | null>(null);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const handleDownloadPdf = async () => {
    try {
        const result = await window.api.printReport(calculedAttendance);
        console.log(result);
        if (result.success) {
          toast.success(`Reporte generado exitosamente en ${result.path}`, { duration: 5000,style:{width:'auto',maxWidth:'900px'} }); 
        }else{
          toast.error(`Error al generar el reporte: ${result.error}`,{ duration: 5000,style:{width:'auto',maxWidth:'900px'} });
        }
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      toast.error(`Error al generar el reporte: ${error ? error : 'Error desconocido'}`, { duration: 5000,style:{width:'auto',maxWidth:'900px'} });
    }
  };

  
  // Inicializar todos los días como colapsados por defecto
  const toggleDay = (fecha: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [fecha]: !prev[fecha]
    }));
  };

  // modal state
    const [mode] = useState<'add' | 'edit' | 'delete' | null>();
    const backdropVariants = {
        visible: { opacity: 1 },
        hidden: { opacity: 0 },
    };

  // Variantes de animación para el modal (contenido)
    const modalVariants = {
        hidden: {
        y: "-20vh", // Empieza fuera de la pantalla (arriba)
        opacity: 0,
        },
        visible: {
        y: "0", // Se mueve a su posición final
        opacity: 1,
        transition: { delay: 0, type: "spring", stiffness: 50 } as Transition, // Animación de resorte
        },
        exit: {
        y: "100vh", // Sale hacia abajo
        opacity: 0,
        transition: { duration: 0.4 },
        },
    };

    async function calculateAttendance() {
        try {
      // Formatear fechas a DD-MM-AAAA
      const formatDateForAPI = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
      };
      console.log("startDate",formatDateForAPI(dateRange.startDate));
      console.log("endDate",formatDateForAPI(dateRange.endDate));
      
      const result = await window.api.calculateAttendance({
        fechaInicio: formatDateForAPI(dateRange.startDate),
        fechaFin: formatDateForAPI(dateRange.endDate)
      });
      console.log('result',result);
            setCalculedAttendance(result);
      setIsDateModalOpen(false);
            
            // Inicializar el estado de días expandidos cuando se cargan los datos
            if (result?.data?.rangoFechas) {
              const initialExpandedState: Record<string, boolean> = {};
              result.data.rangoFechas.forEach(dia => {
                initialExpandedState[dia.fecha] = false;
              });
              setExpandedDays(initialExpandedState);
            }
        } catch (error) {
            console.error(error);
      toast.error('Error al intentar calcular la asistencia');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 p-4"
    >
      <div className="flex justify-between items-center flex-wrap gap-4   ">
        <div className='flex justify-center items-start flex-col'>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            Reportes de Asistencia
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600"
          >
            Exportar reportes de asistencia de empleados
          </motion.p>
        </div>
        <AnimatePresence>
          {isModalOpen && (
            // Overlay del modal
            <motion.div
              className={twMerge('fixed min-h-screen overflow-y-auto inset-0  bg-opacity-70 backdrop-blur-sm flex items-start justify-center z-50 p-4',mode === 'delete' || mode === 'edit' ? 'items-center bg-slate-900/50' : 'bg-slate-900/50', mode === 'delete' ? 'bg-red-100/50' : '')}
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={() => setIsModalOpen(false)} // Cierra el modal al hacer clic fuera
            >
              {/* Contenido del modal */}
              <motion.div
                className={twMerge("bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full text-center relative overflow-hidden transform",mode === 'delete' || mode === 'add' || mode === 'edit' ? 'max-w-3xl' : '')}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()} // Evita que el clic en el modal cierre el overlay
              >
                {mode === 'add' && (
                  <>
                    <h2 className="text-3xl font-bold text-theme-3 mb-4">
                      Agregar Grupo
                    </h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      Aqui podras crear un nuevo grupo para los usuarios, por favor completa los campos requeridos.
                    </p>
                    {/* <AddGroup onAddGroup={addGroup}/> */}
                    {/* <AddUser groups={groups} onAddUser={createUser} /> */}
                  </>
                )}

                {mode === 'edit' && (
                  <>
                    <h2 className="text-3xl font-bold text-theme-3 mb-4">
                      Editar Grupo
                    </h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      Aqui podras editar los datos del grupo seleccionado.
                    </p>
                    {/* <EditGroup onEditGroup={editGroup} selectedGroup={selectedGroup}/> */}
                  </>
                )}

                {mode === 'delete' && (
                  <>
                    <h2 className="text-3xl font-bold text-red-500 mb-4">
                      Eliminar Grupo
                    </h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {/* Estas seguro de que deseas eliminar el grupo <strong>{selectedGroup?.nombre_grupo}</strong>? */}
                    </p>
                  </>
                )}
                {/* Botón para cerrar el modal */}
                <div className='flex gap-3'>
                  <motion.button
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 flex-1 bg-red-500 mt-3 w-full text-white font-semibold rounded-lg shadow-md hover:bg-theme-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-theme-3 focus:ring-opacity-75 cursor-pointer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cerrar
                  </motion.button>
                  {mode === 'delete' && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}

                      className="px-6 flex-1 py-3 bg-theme-3 mt-3 w-full text-white font-semibold rounded-lg shadow-md hover:bg-theme-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-theme-3 focus:ring-opacity-75 cursor-pointer">
                      Confirmar
                    </motion.button>
                  )}
                </div>
                {mode !== 'delete' && (
                  <>
                    <div className="absolute top-0 left-0 w-full h-2 bg-theme-3 rounded-t-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-full h-2 bg-theme-3 rounded-b-2xl"></div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex space-x-3">
          {calculedAttendance?.data?.rangoFechas && calculedAttendance.data.rangoFechas.length > 0 && (
            <motion.button
              onClick={handleDownloadPdf}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className='w-4 h-4' />
              <span>Exportar a PDF</span>
            </motion.button>
          )}

          <motion.button
            onClick={() => setIsDateModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Calculator className='w-4 h-4' />
            <span>Calcular Asistencia</span>
          </motion.button>
        </div>
      </div>
      <div className="space-y-4">
        {calculedAttendance?.data?.rangoFechas?.map((dia: DiaAsistencia, index) => {
          const isExpanded = expandedDays[dia.fecha] || false;
          
          // Calcular resúmenes para la vista colapsada
          const totalAsistencias = dia.asistencias?.length || 0;
          const asistenciasCompletas = dia.asistencias?.filter(a => a.estado === 'completo').length || 0;
          const asistenciasIncompletas = dia.asistencias?.filter(a => a.estado !== 'completo').length || 0;
          
          return (
            <motion.div 
              key={dia.fecha}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mb-0 print:break-inside-avoid bg-white rounded-xs overflow-hidden border border-gray-200 border-b-0 last:border-b"
            >
              {/* Encabezado del día */}
              <div 
                className={twMerge("px-4 py-3 border-b-0 border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors", isExpanded ? "border-b" : "")}
                onClick={() => toggleDay(dia.fecha)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="mr-2 text-gray-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                    <h3 className="text-base font-semibold text-gray-800">
                      {dia.dia}, {formatDate(dia.fecha)}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600 space-x-2">
                      <span className="inline-flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                        {asistenciasCompletas} Completas
                      </span>
                      <span className="inline-flex items-center">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
                        {asistenciasIncompletas} Incompletas
                      </span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {totalAsistencias} registros
                    </span>
                  </div>
                </div>
              </div>

            {/* Contenido expandible */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  variants={{
                    open: { opacity: 1, height: 'auto' },
                    collapsed: { opacity: 0, height: 0 }
                  }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="overflow-x-auto print:overflow-visible">
                    <table className="min-w-full divide-y divide-gray-200 print:divide-gray-400 text-sm">
                      <thead className="bg-gray-50 print:bg-gray-100">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Empleado
                          </th>
                          <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Grupo
                          </th>
                          <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Entrada
                          </th>
                          <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Salida
                          </th>
                          <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 print:divide-gray-400">
                        {dia.asistencias.map((asistencia, idx) => (
                          <tr 
                            key={`${asistencia.id_empleado}-${idx}`}
                            className="hover:bg-gray-50 print:hover:bg-transparent"
                          >
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {asistencia.nombre} {asistencia.apellido}
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-gray-500">
                              {asistencia.grupo}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-center font-mono">
                              {formatToAmPm(formatTime(asistencia.entrada))}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-center font-mono">
                              {formatToAmPm(formatTime(asistencia.salida))}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                asistencia.estado === 'completo' ? 'bg-green-100 text-green-800' :
                                asistencia.estado === 'sin_entrada' || asistencia.estado === 'sin_salida' ? 
                                    'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {asistencia.estado.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          )
        })}
      </div>

      {!calculedAttendance?.data?.rangoFechas?.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Calcular asistencia</h3>
          <p className="text-gray-500">Seleccione un rango de fecha para calcular la asistencia</p>
        </motion.div>
      )}
    {/* Date Range Modal */}
    <AnimatePresence>
    {isDateModalOpen && (
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsDateModalOpen(false)}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-theme-3 mb-6 text-center">
            Seleccionar Rango de Fechas
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <div className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.startDate ? (
                        formatDateForDisplay(dateRange.startDate)
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.startDate}
                      onSelect={(date) =>
                        date && setDateRange(prev => ({ ...prev, startDate: date }))
                      }
                      disabled={(date) =>
                        date > new Date() || date > dateRange.endDate
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin
              </label>
              <div className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.endDate ? (
                        formatDateForDisplay(dateRange.endDate)
                      ) : (
                        <span>Seleccionar fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.endDate}
                      onSelect={(date) =>
                        date && setDateRange(prev => ({ ...prev, endDate: date }))
                      }
                      disabled={(date) =>
                        date > new Date() || date < dateRange.startDate
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                onClick={() => setIsDateModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg flex-1 hover:bg-gray-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancelar
              </motion.button>
              <motion.button
                onClick={calculateAttendance}
                className="px-4 py-2 bg-theme-3 text-white rounded-lg flex-1 hover:bg-theme-4 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Calcular
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
    </AnimatePresence>
    </motion.div>
  );
};

export default Reports;