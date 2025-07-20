import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { useAttendanceData } from '../hooks/useAttendanceData';
import { getStatusColor, getStatusIcon, getStatusLabel } from '../utils/statusUtils';
import GroupFilter from '../components/GroupFilter';
import userPlus from '../assets/user-plus.png'
import type { Transition } from 'framer-motion'
import { AddUser } from '../components/AddUser';
import { fetchGroups } from '../utils/getGroups';
import type { Group } from '../types';

const Employees: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { employees } = useAttendanceData();
  const [groups, setGroups] = useState<Group[]>([]); 

  React.useEffect(() => {
    const fetchData = async () => {
      const groups = await fetchGroups();
      setGroups(groups);
    };
    fetchData();
  }, []);

  const filteredEmployees = employees.filter(employee => {
    const matchesGroup = selectedGroup === 'all' || employee.department.toLowerCase() === selectedGroup;
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGroup && matchesSearch;
  });



  // modal states
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            Personal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600"
          >
            Directorio completo del personal universitario
          </motion.p>
        </div>
        <motion.button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img className='invert w-4 h-4' src={userPlus} alt="Agregar Personal" />
          <span>Agregar Personal</span>
        </motion.button>
        <AnimatePresence>
          {isModalOpen && (
            // Overlay del modal
            <motion.div
              className="fixed min-h-screen overflow-y-auto inset-0 bg-slate-900/50 bg-opacity-70 backdrop-blur-sm flex items-start justify-center z-50 p-4"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={() => setIsModalOpen(false)} // Cierra el modal al hacer clic fuera
            >
              {/* Contenido del modal */}
              <motion.div
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full text-center relative overflow-hidden transform"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()} // Evita que el clic en el modal cierre el overlay
              >
                <h2 className="text-3xl font-bold text-theme-3 mb-4">
                  Agregar Nuevo Personal
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Aqui podras crear un nuevo usuario para el sistema, por favor completa los campos requeridos.
                </p>
                <AddUser groups={groups} onAddUser={(user) => console.log(user)} />
                <motion.button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-theme-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-theme-3 focus:ring-opacity-75"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cerrar
                </motion.button>

                {/* Elementos decorativos (opcional) */}
                <div className="absolute top-0 left-0 w-full h-2 bg-theme-3 rounded-t-2xl"></div>
                <div className="absolute bottom-0 left-0 w-full h-2 bg-theme-3 rounded-b-2xl"></div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <GroupFilter groups={groups} selectedGroup={selectedGroup} onGroupChange={setSelectedGroup} />

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
        {filteredEmployees.map((employee, index) => {
          const StatusIcon = getStatusIcon(employee.status);
          return (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
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
                    {employee.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </motion.div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg">{employee.name}</h4>
                  <p className="text-sm text-gray-500">{employee.position}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Departamento</span>
                  <span className="text-sm font-medium text-gray-900">{employee.department}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estado</span>
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                    {StatusIcon && <StatusIcon className="w-3 h-3" />}
                    <span>{getStatusLabel(employee.status)}</span>
                  </span>
                </div>
                {employee.checkIn && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Entrada</span>
                    <span className="text-sm font-medium text-gray-900">{employee.checkIn}</span>
                  </div>
                )}
                {employee.checkOut && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Salida</span>
                    <span className="text-sm font-medium text-gray-900">{employee.checkOut}</span>
                  </div>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.4 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="flex space-x-2">
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    Ver Historial
                  </button>
                  <button className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                    Editar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron empleados</h3>
          <p className="text-gray-500">Intenta ajustar los filtros o el término de búsqueda</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Employees;