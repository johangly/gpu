import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2 } from 'lucide-react';
// import { useAttendanceData } from '../hooks/useAttendanceData';
import { getStatusColor, getStatusIcon, getStatusLabel } from '../utils/statusUtils';
import GroupFilter from '../components/GroupFilter';
import userPlus from '../assets/user-plus.png'
import type { Transition } from 'framer-motion'
import { AddUser } from '../components/AddUser';
import { EditUser } from '../components/EditUser';
import { fetchGroups } from '../utils/getGroups';
import { fetchUsers} from '../utils/getUsers';
import type { SessionGroup, User, createUserProps, editUserProps, SelectedUserType } from '../types';
import { toast } from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';

const Employees = () => {
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  // const { employees } = useAttendanceData();
  const [groups, setGroups] = useState<SessionGroup[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<SelectedUserType>({
    id_empleado: 0,
    cedula: '',
    nombre: '',
    apellido: '',
    usuario: '',
    clave: '',
    activo:true,
    grupo: {
      id_grupo: 0,
      nombre_grupo: ''
    }
  });

  const fetchInitialData = async () => {
    try {
      const [usersResponse, groupsResponse] = await Promise.all([
        fetchUsers(),
        fetchGroups()
      ]);

      if (usersResponse.success && usersResponse.users) {
        setUsers(usersResponse.users);
      } else {
        toast.error('Error al cargar usuarios iniciales.');
        console.error('Error loading users:', usersResponse.error);
      }

      if (groupsResponse.success && groupsResponse.groups) {
        setGroups(groupsResponse.groups);
      } else {
        toast.error('Error al cargar grupos iniciales.');
        console.error('Error loading groups');
      }
    } catch (error) {
      toast.error('Error de conexión al cargar datos iniciales.');
      console.error('Initial data fetch error:', error);
    }
  };
  useEffect(() => {
    fetchInitialData();
  }, []);
  console.log('USUARIOS ||||||||||||||||||||',users)
  const filteredEmployees = users.filter(user => {
    const matchesGroup = selectedGroup === 0 || user.grupo?.id_grupo === selectedGroup;
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  async function deleteUser(id_empleado: number | undefined) {
    if (!id_empleado) {
      toast.error('ID de empleado no válido.');
      return;
    }

    const deletingUser = new Promise<{ message: string, success: boolean }>((resolve, reject) => {
      window.api.deleteUser(id_empleado)
        .then((response: { success: boolean; message?: string }) => {
          if (response.success === true) {
            resolve({
              message: response.message || 'Usuario eliminado exitosamente.',
              success: true,
            });
          } else {
            reject({
              message: `Error al eliminar usuario: ${response.message || 'Error desconocido.'}`,
              success: false,
            });
          }
        });
    });

    try {
      await toast.promise(deletingUser, {
        loading: 'Eliminando usuario...',
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

      setUsers((prevUsers) => prevUsers.filter(user => user.id_empleado !== id_empleado));
      setSelectedUser({
        id_empleado: 0,
        cedula: '',
        nombre: '',
        apellido: '',
        usuario: '',
        clave: '',
        grupo: {
          id_grupo: 0,
          nombre_grupo: ''
        },
        activo:true,
      }); // Resetea el estado del usuario seleccionado
      setIsModalOpen(false); // Cierra el modal después de eliminar
    } catch (error) {
      toast.error('Error al intentar eliminar el usuario.: ' + (typeof error === 'string' ? error : 'Error desconocido.'));
    }
  }

  async function createUser(user: createUserProps): Promise<{ success: boolean; message?: string }> {

    const creatingUser = new Promise<{
      message: string, success: boolean, newUser?: User | null
    }>((resolve, reject) => {
      window.api.createUser(user)
        .then((response: {
          success: boolean; message?: string; newUser?: User | null
        }) => {
          if (response.success === true) {
            resolve({
              message: response.message || 'Usuario creado exitosamente.',
              success: true,
              newUser: response.newUser || null
            });
          } else {
            reject({
              message: `Error al crear usuario: ${response.message || 'Error desconocido.'}`,
              success: false,
            });
          }
        });
    });
    // Usa toast.promise para manejar los estados de la promesa automáticamente
    try {
      await toast.promise(creatingUser, {
        loading: 'Creando nuevo usuario...', // Mensaje mientras la promesa está pendiente
        success: (data) => `${data.message}`, // Mensaje si la promesa se resuelve
        error: (err) => `${err.message}`,     // Mensaje si la promesa se rechaza
      }, {
        // Opciones adicionales para el toast de promesa
        style: {
          minWidth: '250px',
        },
        position: 'bottom-center',
        success: {
          duration: 3000, // El toast de éxito durará 3 segundos
          iconTheme: {
            primary: '#16A34A', // Color del icono de éxito (verde)
            secondary: '#fff',
          },
        },
        error: {
          duration: 4000, // El toast de error durará 4 segundos
          iconTheme: {
            primary: '#DC2626', // Color del icono de error (rojo)
            secondary: '#fff',
          },
        },
      });

      const result = await creatingUser;
      const newUpdatedUser = result.newUser;
      console.log('result', result);
      if (newUpdatedUser !== null && newUpdatedUser !== undefined && newUpdatedUser) {
        // const newUser = matchUserGroup(newUpdatedUser, groups);
        setUsers((prevUsers) => [...prevUsers, newUpdatedUser]);
      }

      return creatingUser;
    } catch (error) {
      return { success: false, message: 'Error al intentar crear el usuario.: '+ (typeof error === 'string' ? error : 'Error desconocido.') };
    }
  }

  async function editUser(user: editUserProps): Promise<{ success: boolean; message?: string }> {

    const editingUser = new Promise<{ message: string, success: boolean, updatedUser?: User | null }>((resolve, reject) => {
      window.api.editUser(user)
        .then((response: {
          success: boolean;
          error?: unknown | null;
          updatedUser?: User | null;
          message?: string;
        }) => {
          if (response.success === true) {
            resolve({
              message: response.message || 'Usuario editado exitosamente.',
              success: true,
              updatedUser: response.updatedUser ? response.updatedUser : null
            });
          } else {
            reject({
              message: `Error al editar usuario: ${response.message || 'Error desconocido.'}`,
              success: false,
            });
          }
        });
    });
    // Usa toast.promise para manejar los estados de la promesa automáticamente
    try {
      await toast.promise(editingUser, {
        loading: 'Editando usuario...', // Mensaje mientras la promesa está pendiente
        success: (data) => `${data.message}`, // Mensaje si la promesa se resuelve
        error: (err) => `${err.message}`,     // Mensaje si la promesa se rechaza
      }, {
        // Opciones adicionales para el toast de promesa
        style: {
          minWidth: '250px',
        },
        position: 'bottom-center',
        success: {
          duration: 3000, // El toast de éxito durará 3 segundos
          iconTheme: {
            primary: '#16A34A', // Color del icono de éxito (verde)
            secondary: '#fff',
          },
        },
        error: {
          duration: 4000, // El toast de error durará 4 segundos
          iconTheme: {
            primary: '#DC2626', // Color del icono de error (rojo)
            secondary: '#fff',
          },
        },
      })

      const result = await editingUser;
      const newUpdatedUser = result.updatedUser;
      console.log(result, newUpdatedUser, 'respuestaaa');
      // busca el usuario y lo actualiza
      if (newUpdatedUser !== null && newUpdatedUser !== undefined) {
        setUsers((prevUsers) => {
          const updatedUsers = prevUsers.map((u) =>
            u.id_empleado === newUpdatedUser.id_empleado ? newUpdatedUser : u
          );
          return updatedUsers;
        });
      }

      setSelectedUser({
        id_empleado: 0,
        cedula: '',
        nombre: '',
        apellido: '',
        usuario: '',
        clave: '',
        activo: true,
        grupo: {
          id_grupo: 0,
          nombre_grupo: ''
        }
      }); // Resetea el estado del usuario seleccionado

      setIsModalOpen(false); // Cierra el modal después de editar
      setMode(null); // Resetea el modo del modal

      return editingUser;
    } catch (error) {
      return { success: false, message: 'Error al intentar actualizar el usuario.: ' + (typeof error === 'string' ? error : 'Error desconocido.') };
    }
  }

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
        </motion.button>
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
                {mode === 'add' && (
                  <>
                    <h2 className="text-3xl font-bold text-theme-3 mb-4">
                      Agregar Nuevo Personal
                    </h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      Aqui podras crear un nuevo usuario para el sistema, por favor completa los campos requeridos.
                    </p>
                    <AddUser groups={groups} onAddUser={createUser} />
                  </>
                )}

                {mode === 'edit' && (
                  <>
                    <h2 className="text-3xl font-bold text-theme-3 mb-4">
                      Editar Usuario
                    </h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      Aqui podras editar los datos del usuario seleccionado.
                    </p>
                    <EditUser groups={groups} onEditUser={editUser} selectedUser={selectedUser} />
                  </>
                )}

                {mode === 'delete' && (
                  <>
                    <h2 className="text-3xl font-bold text-red-500 mb-4">
                      Eliminar Usuario
                    </h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      Estas seguro de que deseas eliminar a <strong>{selectedUser?.nombre}</strong>?
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
                      onClick={() => { deleteUser(selectedUser?.id_empleado) }} className="px-6 flex-1 py-3 bg-theme-3 mt-3 w-full text-white font-semibold rounded-lg shadow-md hover:bg-theme-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-theme-3 focus:ring-opacity-75 cursor-pointer">
                      Confirmar
                    </motion.button>
                  )}
                </div>

                {/* Elementos decorativos (opcional) */}
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
        {filteredEmployees.map((user: User, index) => {
          const StatusIcon = getStatusIcon('Presente');
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                key={user.id_empleado}
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
                      {user.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{user.nombre}</h4>
                    <p className="text-sm text-gray-500">{user.grupo?.nombre_grupo}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Departamento</span>
                    <span className="text-sm font-medium text-gray-900">{user.grupo?.nombre_grupo}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estado</span>
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor('present')}`}>
                      {StatusIcon && <StatusIcon className="w-3 h-3" />}
                      <span>{getStatusLabel('presente')}</span>
                    </span>
                  </div>
                  {/* {user.checkIn && ( */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Entrada</span>
                    <span className="text-sm font-medium text-gray-900">{ }</span>
                  </div>
                  {/* )} */}
                  {/* {user.checkOut && ( */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Salida</span>
                    <span className="text-sm font-medium text-gray-900">{ }</span>
                  </div>
                  {/* )} */}
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
                    <button onClick={() => { setSelectedUser(user); setMode('edit'); setIsModalOpen(true) }} className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                      Editar
                    </button>
                    <button onClick={() => { setSelectedUser(user); setMode('delete'); setIsModalOpen(true) }} className="bg-red-200 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-red-300 transition-colors">
                      <Trash2 className='w-5 h-5 text-red-500/60' />
                    </button>
                  </div>
                </motion.div>
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