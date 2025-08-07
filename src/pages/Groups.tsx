import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, BookMarked } from 'lucide-react';
import type { Transition } from 'framer-motion'
import { fetchGroups } from '../utils/getGroups';
import type { SessionGroup } from '../types';
import { toast } from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';
import formatAttendanceDateTime from '../components/dateFormatter';
import { AddGroup } from '../components/AddGroup';
import { EditGroup } from '../components/EditGroup';

const Groups = () => {
  const [selectedGroup, setSelectedGroup] = useState<SessionGroup>({
    id_grupo: 0,
    nombre_grupo: '',
    actualizado_en:'',
    creado_en:''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState<SessionGroup[]>([]);

  const fetchInitialData = async () => {
    try {
      const groupsResponse = await fetchGroups();

      if (groupsResponse.success && groupsResponse.groups) {
        console.log('groups response', groupsResponse.groups)
        setGroups(groupsResponse.groups);
      } else {
        toast.error('Error al cargar los grupos.');
        console.error('Error loading groups:', groupsResponse.error);
      }
    } catch (error) {
      toast.error('Error de conexión al cargar datos iniciales.');
      console.error('Initial data fetch error:', error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.nombre_grupo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit' | 'delete' | null>();

  async function addGroup(nombre_grupo: string): Promise<{ success: boolean; message?: string }> {
    console.log('nombre_grupo', nombre_grupo)
    try {
      const creatingGroup = new Promise<{ message: string; success: boolean; newGroup?: SessionGroup }>((resolve, reject) => {
        window.api.createGroup(nombre_grupo)
          .then((response: { success: boolean; error: unknown | null; newGroup?: SessionGroup; message?: string; }) => {
            if (response.success === true) {
              resolve({
                message: response.message || 'Grupo creado exitosamente.',
                success: true,
                newGroup: response.newGroup,
              });
            } else {
              reject({
                message: `Error al crear grupo: ${response.message || 'Error desconocido.'}`,
                success: false,
                error: response.error,
              });
            }
          });
      });

      await toast.promise(creatingGroup, {
        loading: 'Creando grupo...',
        success: (data) => `${data.message}`,
        error: (err) => `${err.message}`,
      }, {
        style: {
          minWidth: '250px',
        },
        position: 'bottom-center',
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#16A34A',
            secondary: '#fff',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#DC2626',
            secondary: '#fff',
          },
        },
      });

      const response = await creatingGroup;
      if (response.success) {
        setGroups(prevGroups => [...prevGroups, response.newGroup!]);
        setIsModalOpen(false);
        setMode(null);
      }
      return { success: response.success, message: response.message };
    } catch (error) {
      console.error('Error al crear grupo:', error);
      return { success: false, message: 'Error al crear el grupo' };
    }
  }

  async function deleteGroup(id_grupo: number): Promise<{ success: boolean; message?: string }> {
    try {
      const deletingGroup = new Promise<{ message: string; success: boolean; newGroup?: SessionGroup }>((resolve, reject) => {
        window.api.deleteGroup(id_grupo)
          .then((response: { success: boolean; error: unknown | null; message?: string; }) => {
            if (response.success === true) {
              resolve({
                message: response.message || 'Grupo eliminado exitosamente.',
                success: true,
              });
            } else {
              reject({
                message: `Error al crear grupo: ${response.message || 'Error desconocido.'}`,
                success: false,
                error: response.error,
              });
            }
          });
      });

      await toast.promise(deletingGroup, {
        loading: 'Eliminando grupo...',
        success: (data) => `${data.message}`,
        error: (err) => `${err.message}`,
      }, {
        style: {
          minWidth: '250px',
        },
        position: 'bottom-center',
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#16A34A',
            secondary: '#fff',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#DC2626',
            secondary: '#fff',
          },
        },
      });
      const response = await deletingGroup;
      if (response.success) {
        setGroups(prevGroups => prevGroups.filter(group => group.id_grupo !== id_grupo));
        setIsModalOpen(false);
        setMode(null);
      }

      return { success: response.success, message: response.message };
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
      toast.error('Error al eliminar el grupo');
      return { success: false, message: 'Error al eliminar el grupo' };
    }
  }

  async function editGroup(nombre_grupo: string,id_grupo: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await window.api.editGroup({
        nombre_grupo:nombre_grupo,
        id_grupo:id_grupo
      });
      if (response.success) {
        setGroups(prevGroups => 
          prevGroups.map(group => 
            group.id_grupo === id_grupo ? response.updatedGroup! : group
          )
        );
        setIsModalOpen(false);
        setMode(null);
        toast.success(response.message || 'Grupo actualizado exitosamente');
      } else {
        toast.error(response.message || 'Error al actualizar el grupo');
      }
      return { success: response.success, message: response.message };
    } catch (error) {
      console.error('Error al actualizar grupo:', error);
      toast.error('Error al actualizar el grupo');
      return { success: false, message: 'Error al actualizar el grupo' };
    }
  }

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
            Grupos
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600"
          >
            Directorio de Grupos
          </motion.p>
        </div>
        <AnimatePresence>
          {isModalOpen && (
            // Overlay del modal
            <motion.div
              className={twMerge('fixed min-h-screen overflow-y-auto inset-0  bg-opacity-70 backdrop-blur-sm flex items-start justify-center z-50 p-4',mode === 'delete' || mode === 'add' || mode === 'edit' ? 'items-center bg-slate-900/50' : 'bg-slate-900/50', mode === 'delete' ? 'bg-red-100/50' : '')}
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={() => setIsModalOpen(false)} // Cierra el modal al hacer clic fuera
            >
              {/* Contenido del modal */}
              <motion.div
                className={twMerge("bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full text-center relative overflow-hidden transform",mode === 'delete' || mode === 'add' || mode === 'edit' ? 'max-w-xl' : '')}
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
                    <AddGroup onAddGroup={addGroup}/>
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
                    <EditGroup onEditGroup={editGroup} selectedGroup={selectedGroup}/>
                  </>
                )}

                {mode === 'delete' && (
                  <>
                    <h2 className="text-3xl font-bold text-red-500 mb-4">
                      Eliminar Grupo
                    </h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      Estas seguro de que deseas eliminar el grupo <strong>{selectedGroup?.nombre_grupo}</strong>?
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
                      onClick={() => { deleteGroup(selectedGroup.id_grupo) }} className="px-6 flex-1 py-3 bg-theme-3 mt-3 w-full text-white font-semibold rounded-lg shadow-md hover:bg-theme-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-theme-3 focus:ring-opacity-75 cursor-pointer">
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
        <motion.button
          onClick={() => {
            setMode('add'); setIsModalOpen(true)
           }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <BookMarked className='w-4 h-4' />  
          <span>Agregar Grupo </span>
        </motion.button>
      </div>
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
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </motion.div>

      {/* groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group: SessionGroup, index) => {
          if(group.id_grupo === 0) return null;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                key={group.nombre_grupo}
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
                      {group.nombre_grupo.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{group.nombre_grupo}</h4>
                    <p className="text-sm text-gray-500">{group.nombre_grupo}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className='border-b border-gray-200 my-5'></div>
                  <div className="flex justify-between items-center flex-col">
                    <span className="text-sm text-gray-600 text-left">Fecha de creacion</span>
                    <span className="text-sm font-medium px-3 py-2 rounded-md w-text-center">{formatAttendanceDateTime(group.creado_en,"salida","formatted")}</span>
                  </div>
                  <div className="flex justify-between items-center flex-col">
                    <span className="text-sm text-gray-600 text-left">Fecha de actualizacion</span>
                    <span className="text-sm font-medium px-3 py-2 rounded-md w-text-center">{formatAttendanceDateTime(group.actualizado_en,"salida","formatted")}</span>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="flex space-x-2">
                    <button onClick={() => { 
                      setSelectedGroup(group); setMode('edit'); setIsModalOpen(true)
                        }} className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                      Editar
                    </button>
                    <button onClick={() => { 
                      setSelectedGroup(group); setMode('delete'); setIsModalOpen(true)
                        }} className="bg-red-200 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-red-300 transition-colors">
                      <Trash2 className='w-5 h-5 text-red-500/60' />
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

          );
        })}
      </div>

      {filteredGroups.length === 0 && (
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
      )}
    </motion.div>
  );
};

export default Groups;