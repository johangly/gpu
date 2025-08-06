import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock } from 'lucide-react';
// import { useAttendanceData } from '../hooks/useAttendanceData';
// import { getStatusIcon, getStatusLabel ,getStatusColor} from '../utils/statusUtils';
import GroupFilter from '../components/GroupFilter';
import userPlus from '../assets/user-plus.png'
import type { Transition } from 'framer-motion'
import { fetchGroups } from '../utils/getGroups';
import type { SessionGroup } from '../types';
import { toast } from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';
import type { ActivitiesProps } from '../types/window.type'
import formatAttendanceDateTime from '../components/dateFormatter';


const Employees = () => {
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  // const { employees } = useAttendanceData();
  const [groups, setGroups] = useState<SessionGroup[]>([]);
  const [activities, setActivities] = useState<ActivitiesProps[]>([]);
  const [typeActivityFilter,setTypeActivityFilter] = useState<string>('todos')
  const fetchInitialData = async () => {
    try {
      const [activitiesResponse, groupsResponse] = await Promise.all([
        window.api.getAllUserActivities(),
        fetchGroups(),
      ]);

      if (activitiesResponse.success && activitiesResponse.activities) {
        console.log('activities response', activitiesResponse.activities)
        setActivities(activitiesResponse.activities);
      } else {
        toast.error('Error al cargar las actividades.');
        console.error('Error loading activities:', activitiesResponse.error);
      }

      if (groupsResponse.success && groupsResponse.groups) {
        console.log('activities response', groupsResponse.groups)
        setGroups(groupsResponse.groups);
      } else {
        toast.error('Error al cargar las actividades.');
        console.error('Error loading activities:', groupsResponse.error);
      }
    } catch (error) {
      toast.error('Error de conexión al cargar datos iniciales.');
      console.error('Initial data fetch error:', error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const filteredActivities = activities.filter(activity => {
    const matchesGroup = selectedGroup === 0 || activity.empleado.grupo.id_grupo === selectedGroup;
    const matchesSearch = activity.empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActivityType = typeActivityFilter === "todos" || activity.tipo_accion === typeActivityFilter
    return matchesGroup && matchesSearch && matchesActivityType;
  });

  // modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit' | 'delete' | null>();

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div className='flex justify-center items-start flex-col'>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            Asistencias
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600"
          >
            Directorio completo del asistencias del personal
          </motion.p>
        </div>
        {/* <motion.button
          onClick={() => { setMode('add'); setIsModalOpen(true) }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img className='invert w-4 h-4' src={userPlus} alt="Agregar Personal" />
          <span>Agregar Personal</span>
        </motion.button> */}
        <AnimatePresence>
          {isModalOpen && (
            // Overlay del modal
            <motion.div
              className={twMerge('fixed min-h-screen overflow-y-auto inset-0  bg-opacity-70 backdrop-blur-sm flex items-start justify-center z-50 p-4', mode === 'delete' ? 'bg-red-100/50 items-center' : 'bg-slate-900/50')}
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={() => setIsModalOpen(false)} // Cierra el modal al hacer clic fuera
            >
              {/* Contenido del modal */}
              <motion.div
                className={twMerge("bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full text-center relative overflow-hidden transform", mode === 'delete' ? 'max-w-xl' : '')}
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()} // Evita que el clic en el modal cierre el overlay
              >

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
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <GroupFilter groups={groups} selectedGroup={selectedGroup} onGroupChange={setSelectedGroup} >
        <div className="flex items-center space-x-4">
          <Clock className="w-5 h-5 text-gray-600" />
          <div className="flex space-x-2">
            <motion.button
              key={'todos-filtro'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTypeActivityFilter("todos")}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${typeActivityFilter === "todos"
                ? 'bg-theme-3-900 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
                }`}
            >
              Todos
            </motion.button>
            <motion.button
              key={'entrada-filtro'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTypeActivityFilter("entrada")}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${typeActivityFilter === "entrada"
                ? 'bg-theme-3-900 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
                }`}
            >
              Entrada
            </motion.button>
            <motion.button
              key={'salida-filtro'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTypeActivityFilter("salida")}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${typeActivityFilter === "salida"
                ? 'bg-theme-3-900 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
                }`}
            >
              Salida
            </motion.button>
          </div>
        </div>
      </GroupFilter>
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por nombre o cargo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </motion.div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((activ: ActivitiesProps, index) => {
          // const StatusIcon = getStatusIcon('Presente');
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                key={activ.empleado.id_empleado}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span className="text-white font-bold text-lg">
                      {activ.empleado.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{activ.empleado.nombre}</h4>
                    <p className="text-sm text-gray-500">{activ.empleado.grupo.nombre_grupo}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {/* <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estado</span>
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor('present')}`}>
                      {StatusIcon && <StatusIcon className="w-3 h-3" />}
                      <span>{getStatusLabel('presente')}</span>
                    </span>
                  </div> */}
                  {/* {activ.checkIn && ( */}
                  {/* <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Entrada</span>
                    <span className="text-sm font-medium text-gray-900">{ }</span>
                  </div> */}
                  {/* )} */}
                  {/* {activ.checkOut && ( */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tipo de asistencia</span>
                    <span className={twMerge("text-sm font-medium px-3 py-2 rounded-md w-20 text-center", activ.tipo_accion === "entrada" && 'bg-green-400/50 text-green-800', activ.tipo_accion === "salida" && "bg-red-400/50 text-red-800")}>{ activ.tipo_accion }</span>
                  </div>
                  <div className='border-b border-gray-200 my-5'></div>
                  <div className="flex justify-between items-center flex-col">
                    <span className="text-sm text-gray-600 text-left">Hora y Fecha</span>
                    <span className="text-sm font-medium px-3 py-2 rounded-md w-text-center">{formatAttendanceDateTime(activ.fecha_hora,activ.tipo_accion,'formatted')}</span>
                  </div>
                  {/* )} */}
                </div>

                {/* <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                      Ver Historial
                    </button>
                    <button onClick={() => { }} className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                      Editar
                    </button>
                    <button onClick={() => { }} className="bg-red-200 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-red-300 transition-colors">
                      <Trash2 className='w-5 h-5 text-red-500/60' />
                    </button>
                  </div>
                </motion.div> */}
              </motion.div>
            </motion.div>

          );
        })}
      </div>

      {/* {filteredActivities.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron asistencias</h3>
          <p className="text-gray-500">Intenta ajustar los filtros o el término de búsqueda</p>
        </motion.div>
      )} */}
    </motion.div>
  );
};

export default Employees;