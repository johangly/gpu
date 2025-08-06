// electron.js
import { app, BrowserWindow, ipcMain } from 'electron/main';
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import isDev from 'electron-is-dev';
import { includes, z } from 'zod';
// import db.Personal from './backend/db/models/personal.js';
// import db.GruposPersonal from './backend/db/models/grupos_personal.js';
// import db.Asistencia from './backend/db/models/asistencia.js';
import argon2 from 'argon2';
import dotenv from 'dotenv';  
import db from './backend/db/db.js'; // Importa la configuración de la base de datos
import fs from 'fs';
import { connection } from './backend/db/db_connection.js'; // Asegúrate de que la ruta sea correcta
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, isDev ? '.env' : '.env') });

const sequelize = connection;

const loginSchema = z.object({
  username: z.string()
    .min(3, { message: "El usuario debe tener al menos 3 caracteres." })
    .max(50, { message: "El usuario no puede exceder los 50 caracteres." })
    .trim()
    .nonempty({ message: "El usuario es requerido." }),

  password: z.string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." })
    .max(100, { message: "La contraseña no puede exceder los 100 caracteres." })
    .nonempty({ message: "La contraseña es requerida." }),
});

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    // logToFile('Conexión a la base de datos establecida correctamente.');
    await sequelize.sync({ alter: true }); // Sincroniza los modelos con la DB
    // logToFile('Modelos sincronizados con la base de datos.');
  } catch (error) {
    // logToFile(`No se pudo conectar o sincronizar la base de datos: ${error.message}`);
  }
}

async function initialization() {
  const userDataPath = app.getPath('userData'); // Directorio de datos de la aplicación
  const logFilePath = path.join(userDataPath, 'app_debug.log');

  // function logToFile(message) {
  //   const timestamp = new Date().toISOString();
  //   // Solo escribe al archivo si logFilePath ya ha sido inicializado
  //   if (logFilePath) {
  //     fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`);
  //   } else {
  //     // Si se llama antes de la inicialización, imprime en la consola de desarrollo
  //     console.log(`[${timestamp}] (PRE-INIT LOG) ${message}`);
  //   }
  // }
  
  // logToFile('Aplicación Electron iniciada y rutas de log inicializadas.');

  // --- Carga de variables de entorno con dotenv ---
  try {
    const dotenvPath = path.resolve(__dirname, '../../.env');
    // logToFile(`Intentando cargar .env desde: ${dotenvPath}`);

    const dotenv = await import('dotenv');
    dotenv.config({ path: dotenvPath });

    // logToFile('dotenv cargado exitosamente.');
  } catch (error) {
    // logToFile(`Error al cargar dotenv: ${error.message}`);
  }

  // --- Verifica las variables de entorno de la DB ---
  // logToFile(`DB_HOST: ${process.env.DB_HOST}`);
  // logToFile(`DB_NAME: ${process.env.DB_NAME}`);
  // logToFile(`DB_USER: ${process.env.DB_USER}`);
  // logToFile(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '*****' : 'NO_PASSWORD_SET'}`);
  // logToFile(`DB_TIMEZONE: ${process.env.DB_TIMEZONE}`);

  try {
    // logToFile('Intentando sincronizar la base de datos...');
    // syncDatabase();
    // logToFile('Base de datos sincronizada y conectada.');
  } catch (error) {
    // logToFile(`Error crítico de conexión/sincronización de DB: ${error.message}`);
    // logToFile(`Detalle del error de DB: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
  }

  // logToFile('Inicialización completa, creando ventana principal...');
}

async function deleteUser(event, id_empleado) {
  try {
    const result = await db.Personal.destroy({
      where: { id_empleado }
    });
    if (result) {
      console.log(`Usuario eliminado exitosamente.`);
      return { success: true, error: null, message: `Usuario eliminado exitosamente.` };
    } else {
      console.log(`No se encontró usuario con ID ${id_empleado}.`);
      return { success: false, error: null, message: `No se encontró usuario.` };
    }
  } catch (error) {
    console.error(`Error al eliminar usuario con ID ${id_empleado}: ${error.message}`);
      return { success: false, error, message: `Error al eliminar usuario: ${error.message}` };
    }
  }

async function createUser(event,data) {
  // Agrega el nuevo usuario
  try {
    const userSchema = z.object({
      cedula: z.string().min(1, { message: "La cédula es requerida." }),
      nombre: z.string().min(1, { message: "El nombre es requerido." }),
      apellido: z.string().min(1, { message: "El apellido es requerido." }),
      usuario: z.string().min(3, { message: "El usuario debe tener al menos 3 caracteres." }).max(50, { message: "El usuario no puede exceder los 50 caracteres." }).trim(),
      clave: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }).max(100, { message: "La contraseña no puede exceder los 100 caracteres." }),
      grupo: z.object({
        id_grupo: z.number({ invalid_type_error: "El grupo debe ser un número." }),
        nombre_grupo: z.string().min(1, { message: "El nombre del grupo es requerido." })
      }),
    });

    const validationResult = userSchema.safeParse(data);
    if (!validationResult.success) {
      console.error('User validation failed:', validationResult.error);
      // retorna error en caso de que las credenciales invalidas
      return { success: false, error: validationResult.error, message: "Datos de usuario inválidos." };
    }

    const userData = {
      cedula: data.cedula,
      nombre: data.nombre,
      apellido: data.apellido,
      usuario: data.usuario,
      clave: data.clave,
      id_grupo: data.grupo.id_grupo,
      activo: true
    };

    // Intenta encontrar o crear el usuario
    const [user, created] = await db.Personal.findOrCreate({
      raw: true,
      where: { usuario: userData.usuario }, // Criterio para buscar si ya existe
      defaults: userData // Datos a usar si no existe y se crea
    });
    
    const userWithGroup = await db.Personal.findByPk(user.id_empleado, {
      include: {
        model: db.GruposPersonal,
        as: 'grupo',
        attributes: ['id_grupo', 'nombre_grupo']
      }
    });

    // Mapea el usuario a un objeto JSON plano y extrae el grupo
    const finalUserData = userWithGroup ? userWithGroup.toJSON() : null;
    const groupData = finalUserData?.grupo ? {
      id_grupo: finalUserData.grupo.id_grupo,
      nombre_grupo: finalUserData.grupo.nombre_grupo,
    } : null;

    if (created) {
      console.log(`Usuario '${user.usuario}' creado exitosamente.`);
      return {
        success: true,
        error: null,
        newUser: {
          id_empleado: user.id_empleado,
          cedula: user.cedula,
          nombre: user.nombre,
          apellido: user.apellido,
          usuario: user.usuario,
          activo: user.activo,
          grupo: groupData,
        },
        message: `Usuario '${user.usuario}' creado exitosamente.`
      };
    } else {
      console.log(`Usuario '${user.usuario}' ya existe.`);
      return {
        success: true,
        error: null,
        newUser: null,
        message: `Usuario '${user.usuario}' ya existe.`
      };
    }
  } catch (error) {
    console.error(`Error al crear o encontrar usuario: ${error.message}`);
    return {
      success: true,
      error: error,
      newUser: null,
      message: `Error al crear usuario '${user.usuario}': ${error.message}`
    };
  }
}

async function editUser(event, data) {
  try {
    const userSchema = z.object({
      id_empleado: z.number({ invalid_type_error: "El ID del empleado debe ser un número." }),
      cedula: z.string().min(1, { message: "La cédula es requerida." }),
      nombre: z.string().min(1, { message: "El nombre es requerido." }),
      apellido: z.string().min(1, { message: "El apellido es requerido." }),
      usuario: z.string().min(3, { message: "El usuario debe tener al menos 3 caracteres." }).max(50, { message: "El usuario no puede exceder los 50 caracteres." }).trim(),
      clave: z.string().min(0).max(100).optional(), // Puede ser opcional o string vacío
      id_grupo: z.number({ invalid_type_error: "El grupo debe ser un número." }),
      activo: z.boolean().optional().default(true) // Por defecto, el usuario está activo
    });

    const userDataToUpdate = {
      cedula: data.cedula,
      nombre: data.nombre,
      apellido: data.apellido,
      usuario: data.usuario,
      id_grupo: data.id_grupo,
      activo: data.activo !== undefined ? data.activo : true // Si no se especifica, se asume que el usuario está activo
    };

    // Solo agrega 'clave' si cumple con los requisitos de longitud y no está vacío
    if (
      typeof data.clave === 'string' &&
      data.clave.length >= 6 &&
      data.clave.length <= 100
    ) {
      userDataToUpdate.clave = data.clave;
    } else if (typeof data.clave === 'string' && data.clave.length > 0 && data.clave.length < 6) {
      // Si la clave es muy corta pero no vacía, es un error de validación
      return { success: false, error: { clave: "La contraseña debe tener al menos 6 caracteres." }, message: "Datos de usuario inválidos." };
    }

    const validationResult = userSchema.safeParse({ id_empleado: data.id_empleado, ...userDataToUpdate });
    if (!validationResult.success) {
      return { success: false, error: validationResult.error, message: "Datos de usuario inválidos." };
    }

    const user = await db.Personal.findByPk(data.id_empleado);

    if (!user) {
      return { success: false, error: { general: "Usuario no encontrado." }, message: "Usuario no encontrado." };
    }

    // Actualiza los campos del usuario
    await user.update(userDataToUpdate);

    // Recarga el usuario con la información del grupo incluida
    const updatedUserWithGroup = await db.Personal.findByPk(user.id_empleado, {
      include: {
        model: db.GruposPersonal,
        as: 'grupo',
        attributes: ['id_grupo', 'nombre_grupo']
      }
    });

    // Mapea el usuario actualizado a un objeto JSON plano y extrae el grupo
    const finalUserData = updatedUserWithGroup ? updatedUserWithGroup.toJSON() : null;
    const groupData = finalUserData?.grupo ? {
      id_grupo: finalUserData.grupo.id_grupo,
      nombre_grupo: finalUserData.grupo.nombre_grupo,
    } : null;

    // Desestructura para omitir id_grupo redundante en el objeto user principal
    const { id_grupo, ...restFinalUserData } = finalUserData || {};

    logToFile(`Usuario '${restFinalUserData.usuario}' actualizado exitosamente.`);
    return {
      success: true,
      error: null,
      updatedUser: {
        id_empleado: user.id_empleado,
        cedula: user.cedula,
        nombre: user.nombre,
        apellido: user.apellido,
        usuario: user.usuario,
        activo: user.activo,
        grupo: groupData,
      },
      message: `Usuario '${restFinalUserData.usuario}' actualizado exitosamente.`
    };
  } catch (error) {
    logToFile(`Error al actualizar usuario: ${error.message}`);
    logToFile(`Edit User Error Details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
    return {
      success: false,
      error: { general: `Error al actualizar usuario: ${error.message}` },
      updatedUser: {}, // Devuelve un objeto vacío en caso de error
      message: `Error al actualizar usuario: ${error.message}`
    };
  }
}
//* |||||||||||||||||||||||||||||||||||||||||||
//?            Activities functions
//* |||||||||||||||||||||||||||||||||||||||||||

// Trae la última actividad del usuario
async function getLastUserActivity(event, id_empleado) {
  try {
    const lastActivity = await db.Asistencia.findAll({
      where: { id_empleado },
      order: [['fecha_hora', 'DESC']],
      raw: true,
      limit: 1 // Solo queremos la última actividad
    });
    return { success: true, activities: lastActivity, message: `Última actividad obtenida exitosamente.` };
  } catch (error) {
    return { success: false, error: error.message, message: `Error al obtener la última actividad del usuario: ${id_empleado}` };
  }
}

// Trae las últimas 10 actividades del usuario
async function getLast10UserActivities(event, id_empleado) {
  try {
    const activities = await db.Asistencia.findAll({
      where: { id_empleado },
      order: [['fecha_hora', 'DESC']],
      limit: 10,
      raw: true,
    });
    return { success: true, activities: activities, message: `Últimas 10 actividades obtenidas exitosamente.` };
  } catch (error) {
    return { success: false, error: error.message, message: `Error al obtener las últimas 10 actividades del usuario: ${id_empleado}` };
  }
}

// Trae todas las actividades del usuario
async function getAllUserActivities() {
  try {
    const activities = await db.Asistencia.findAll({
      include: {
        model: db.Personal,
        as: 'empleado',
        attributes: ['id_empleado', 'nombre', 'apellido', 'usuario', 'cedula'],
        include: {
          model: db.GruposPersonal,
          as: 'grupo',
          attributes: ['id_grupo', 'nombre_grupo']
        }
      },
      order: [['fecha_hora', 'DESC']],
      attributes: { exclude: ['id_empleado'] },
    });

    // Mapea los resultados para convertirlos en objetos planos de JavaScript.
    // Esto resuelve el error de "object could not be cloned".
    const plainActivities = activities.map(activity => activity.get({ plain: true }));

    return { success: true, activities: plainActivities, message: 'Todas las actividades obtenidas exitosamente.' };
  } catch (error) {
    console.error('Error al obtener todas las actividades:', error);
    return { success: false, error: error.message, message: `Error al obtener todas las actividades.` };
  }
}

const markAttendanceSchema = z.object({
  id_empleado: z.number({ invalid_type_error: "El ID del empleado debe ser un número." }),
  tipo_accion: z.enum(['entrada', 'salida'], { errorMap: () => ({ message: "El tipo de acción debe ser 'entrada' o 'salida'." }) })
});
async function markAttendance(event, data) {
  // Validar los datos de entrada con Zod
  const { id_empleado, tipo_accion } = data;
  const validationResult = markAttendanceSchema.safeParse({ id_empleado, tipo_accion });
  if (!validationResult.success) {
    return { success: false, message: "Datos inválidos para marcar asistencia.", error: validationResult.error };
  }

  try {
    // 1. Validar el tipo de acción y el estado actual del empleado
    const lastActivityResponse = await getLastUserActivity(null, id_empleado);
    if (!lastActivityResponse.success) {
      throw new Error(lastActivityResponse.error || 'No se pudo verificar la última actividad.');
    }

    const lastActivity = lastActivityResponse.activities?.[0];

    if (tipo_accion === 'entrada') {
      if (lastActivity && lastActivity.tipo_accion === 'entrada') {
        return { success: false, message: 'Ya has marcado tu entrada. Debes marcar salida primero.' };
      }
    } else if (tipo_accion === 'salida') {
      if (!lastActivity || lastActivity.tipo_accion === 'salida') {
        return { success: false, message: 'Ya has marcado tu salida o no has marcado entrada.' };
      }
    }

    // 2. Registrar la nueva asistencia
    const newRecord = await db.Asistencia.create({
      id_empleado,
      tipo_accion,
      fecha_hora: new Date(),
    });

    return { success: true, message: `Has marcado tu ${tipo_accion} exitosamente.`, record: newRecord.toJSON() };
  } catch (error) {
    return { success: false, message: `Error al marcar ${tipo_accion}: ${error.message}` };
  }
}
/**
 * Maneja la lógica de inicio de sesión, validando credenciales contra la base de datos.
 * @param {Object} event - Objeto de evento IPC (no usado directamente para la lógica de login, pero es parte de la firma IPC).
 * @param {Object} credentials - Objeto que contiene 'username' y 'password' del formulario de login.
 * @returns {Promise<Object>} Un objeto con { success: boolean, error: string | Object | null, user: Object | null }.
 */

async function handleLogin(event, credentials) { 
  const { username, password } = credentials;
  const userDataPath = app.getPath('userData'); // Directorio de datos de la aplicación
  const logFilePath = path.join(userDataPath, 'app_debug.log');

  // function logToFile(message) {
  //   const timestamp = new Date().toISOString();

  //   if (logFilePath) {
  //     fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`);
  //   } else {
  //     console.log(`[${timestamp}] (PRE-INIT LOG) ${message}`);
  //   }
  // }

  const validationResult = loginSchema.safeParse({ username, password });
  if (!validationResult.success) {
    // logToFile('Login failed:', validationResult.error);

    // retorna error en caso de que las credenciales invalidas
    return { success: false, error: validationResult.error, username: null };
  }


  try {
    // Buscar el usuario en la base de datos por el nombre de usuario
    const user = await db.Personal.findOne({
      where: {
        usuario: username,
        activo: true // Asegúrate de que el usuario esté activo
      },
      include: {
        model: db.GruposPersonal,
        as: 'grupo', // Usa el alias definido en la asociación Personal.belongsTo(GruposPersonal)
        attributes: ['id_grupo', 'nombre_grupo'] // Solo trae los atributos que necesitas del grupo
      }
    });
    // Si el usuario no existe o no está activo
    if (!user) {
      // logToFile('Login failed: no found user');
      return { success: false, error: { general: 'Usuario o contraseña inválidos.' }, user: null };
    }

    // Verificar la contraseña hasheada con Argon2
    const passwordMatch = await argon2.verify(user.clave, password);

    const groupData = user.grupo ? {
      id_grupo: user.grupo.id_grupo,
      nombre_grupo: user.grupo.nombre_grupo,
      // Añade cualquier otro atributo del grupo que necesites aquí
    } : null;

    if (passwordMatch) {
      // logToFile('Login successful for user:', username);
      // Retorna información del usuario (sin la contraseña) si el login es exitoso
      return {
        success: true,
        error: null,
        token:'9312766kssb2123wx',
        user: {
          id_empleado: user.id_empleado,
          cedula: user.cedula,
          nombre: user.nombre,
          apellido: user.apellido,
          usuario: user.usuario,
          activo: user.activo,
          grupo: groupData,
        }
      };
    } else {
      // logToFile('Login failed');
      return { success: false, error: { general: 'Usuario o contraseña inválidos.' }, user: null };
    }

  } catch (dbError) {
    // logToFile('Database or Argon2 error during login:', dbError);
    // logToFile(dbError?.toString());
    return { success: false, error: { general: 'Error en el servidor. Por favor, inténtelo de nuevo.' }, user: null };
  }
}

async function handleGetGroups(event) {
  try {
    const groups = await db.GruposPersonal.findAll({ raw: true });
    
    return { success: true, groups };
  } catch (error) {
    console.error('Error fetching groups:', error);
    return { success: false, error: { general: 'Error fetching groups.' } };
  }
}

async function handleGetUsers(event) {
  try {
    const users = await db.Personal.findAll({
      attributes: { exclude: ['clave'] }, // Excluye la contraseña
      include: {
        model: db.GruposPersonal,
        as: 'grupo', 
        attributes: ['id_grupo', 'nombre_grupo']
      }
    });

    // Mapea los resultados para convertirlos a objetos JSON planos,
    const usersWithGroupData = users.map(user => {
      const userData = user.toJSON();
      // Si el grupo existe, conviértelo también a JSON. Si no, será null.
      const groupData = userData.grupo ? {
        id_grupo: userData.grupo.id_grupo,
        nombre_grupo: userData.grupo.nombre_grupo,
        // Añade cualquier otro atributo del grupo que necesites aquí
      } : null;

      return {
        id_empleado: user.id_empleado,
        cedula: user.cedula,
        nombre: user.nombre,
        apellido: user.apellido,
        usuario: user.usuario,
        activo: user.activo,
        grupo: groupData // Añade el objeto group anidado
      };
    });

    // logToFile(`IPC: Fetched ${usersWithGroupData.length} users with group info.`);
    return { success: true, users: usersWithGroupData };
  } catch (error) {
    console.error('Error fetching groups:', error);
    return { success: false, error: { general: 'Error fetching groups.' } };
  }
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1080,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    title: process.env.DB_USER,
    webPreferences: { 
      enablePreferredSizeMode: true,
      nodeIntegration: true, // Permite usar módulos de Node.js en el renderizador (si lo necesitas)
      contextIsolation: true, // Desactiva el aislamiento de contexto (cuidado con esto en producción)
      preload: `${path.join(__dirname)}/preload.js`, // Ruta al archivo preload.js
      enableRemoteModule: true, // Habilita el módulo remoto (si lo necesitas)

    }
  });

  console.log('Creating window...');
  console.log('isDev:', isDev);
  console.log('App directory:', `${path.join(__dirname)}/dist/index.html`);

  const startURL = isDev
    ? 'http://localhost:5173'
    : `${path.join(__dirname)}/dist/index.html`;

  win.loadURL(startURL);
};

app.whenReady().then(async () => {
  try {
    initialization();
    await db.syncDatabase();
    ipcMain.handle('login', handleLogin)
    ipcMain.handle('getGroups', handleGetGroups)
    ipcMain.handle('createUser', createUser)
    ipcMain.handle('getUsers', handleGetUsers)
    ipcMain.handle('editUser', editUser)
    ipcMain.handle('deleteUser', deleteUser)
    ipcMain.handle('getLastUserActivity', getLastUserActivity)
    ipcMain.handle('markAttendance', markAttendance)
    ipcMain.handle('getLast10UserActivities', getLast10UserActivities)
    ipcMain.handle('getAllUserActivities', getAllUserActivities)

  } catch (error) {
    console.error('Error setting up IPC handler:', error);
  }
  console.log('App is ready, creating window...');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});