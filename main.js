// electron.js
import { app, BrowserWindow, ipcMain } from 'electron/main';
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import isDev from 'electron-is-dev';
import { z } from 'zod';
import { Personal } from './backend/db/models/personal.js';
import { GruposPersonal } from './backend/db/models/grupos_personal.js';
import argon2 from 'argon2';
import dotenv from 'dotenv';  
import fs from 'fs';
import { connection } from './backend/db/db_connection.js'; // Asegúrate de que la ruta sea correcta
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, isDev ? '.env' : '.env') });

const sequelize = connection;

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    logToFile('Conexión a la base de datos establecida correctamente.');
    await sequelize.sync({ alter: true }); // Sincroniza los modelos con la DB
    logToFile('Modelos sincronizados con la base de datos.');
  } catch (error) {
    logToFile(`No se pudo conectar o sincronizar la base de datos: ${error.message}`);
  }
}

async function initialization() {
  const userDataPath = app.getPath('userData'); // Directorio de datos de la aplicación
  const logFilePath = path.join(userDataPath, 'app_debug.log');

  function logToFile(message) {
    const timestamp = new Date().toISOString();
    // Solo escribe al archivo si logFilePath ya ha sido inicializado
    if (logFilePath) {
      fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`);
    } else {
      // Si se llama antes de la inicialización, imprime en la consola de desarrollo
      console.log(`[${timestamp}] (PRE-INIT LOG) ${message}`);
    }
  }
  
  logToFile('Aplicación Electron iniciada y rutas de log inicializadas.');

  // --- Carga de variables de entorno con dotenv ---
  try {
    const dotenvPath = path.resolve(__dirname, '../../.env');
    logToFile(`Intentando cargar .env desde: ${dotenvPath}`);

    const dotenv = await import('dotenv');
    dotenv.config({ path: dotenvPath });

    logToFile('dotenv cargado exitosamente.');
  } catch (error) {
    logToFile(`Error al cargar dotenv: ${error.message}`);
  }

  // --- Verifica las variables de entorno de la DB ---
  logToFile(`DB_HOST: ${process.env.DB_HOST}`);
  logToFile(`DB_NAME: ${process.env.DB_NAME}`);
  logToFile(`DB_USER: ${process.env.DB_USER}`);
  logToFile(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '*****' : 'NO_PASSWORD_SET'}`);
  logToFile(`DB_TIMEZONE: ${process.env.DB_TIMEZONE}`);

  try {
    logToFile('Intentando sincronizar la base de datos...');
    syncDatabase();
    logToFile('Base de datos sincronizada y conectada.');
  } catch (error) {
    logToFile(`Error crítico de conexión/sincronización de DB: ${error.message}`);
    logToFile(`Detalle del error de DB: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
  }

  logToFile('Inicialización completa, creando ventana principal...');
}

async function deleteUser(event, id_empleado) {
  try {
    const result = await Personal.destroy({
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
      id_grupo: z.number({ invalid_type_error: "El grupo debe ser un número." }),
      activo: z.boolean()
    });
    console.log('Validating user data:', data);
    const userData = {
      cedula: data.cedula,
      nombre: data.nombre,
      apellido: data.apellido,
      usuario: data.usuario,
      clave: data.clave,
      id_grupo: data.id_grupo,
      activo: true
    };

    const validationResult = userSchema.safeParse(userData);
    if (!validationResult.success) {
      console.error('User validation failed:', validationResult.error);
      // retorna error en caso de que las credenciales invalidas
      return { success: false, error: validationResult.error, message: "Datos de usuario inválidos." };
    }

    // Intenta encontrar o crear el usuario
    const [user, created] = await Personal.findOrCreate({
      raw: true,
      where: { usuario: userData.usuario }, // Criterio para buscar si ya existe
      defaults: userData // Datos a usar si no existe y se crea
    });
    
    if (created) {
      console.log(`Usuario '${user.usuario}' creado exitosamente.`);
      return {
        success: true,
        error: null,
        newUser: {
          ...user.dataValues
        },
        message: `Usuario '${user.usuario}' creado exitosamente.`
      };
    } else {
      console.log(`Usuario '${user.usuario}' ya existe.`);
      return {
        success: true,
        error: null,
        newUser: {},
        message: `Usuario '${user.usuario}' ya existe.`
      };
    }
  } catch (error) {
    console.error(`Error al crear o encontrar usuario: ${error.message}`);
    return {
      success: true,
      error: error,
      newUser: {},
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

    console.log('Validating user data for update:', data);
    
    const userData = {
      id_empleado: data.id_empleado,
      cedula: data.cedula,
      nombre: data.nombre,
      apellido: data.apellido,
      usuario: data.usuario,
      id_grupo: data.id_grupo,
      activo: data.activo ? data.activo : true // Si no se especifica, se asume que el usuario está activo
    };

    // Solo agrega 'clave' si cumple con los requisitos de longitud
    if (
      typeof data.clave === 'string' &&
      data.clave.length >= 6 &&
      data.clave.length <= 100
    ) {
      userData.clave = data.clave;
    }

    const validationResult = userSchema.safeParse(userData);
    if (!validationResult.success) {
      console.error('User validation failed:', validationResult.error);
      return { success: false, error: validationResult.error, message: "Datos de usuario inválidos." };
    }

    // Busca el usuario por su identificador único (por ejemplo, id_empleado)
    const user = await Personal.findByPk(data.id_empleado);
    if (!user) {
      return { success: false, error: { general: "Usuario no encontrado." }, message: "Usuario no encontrado." };
    }

    // Actualiza los campos del usuario
    await user.update(userData);
    
    console.log(`Usuario '${user.usuario}' actualizado exitosamente.`);
    console.log('Updated user data:', userData);
    return {
      success: true,
      error: null,
      updatedUser: { ...userData, id_empleado: user.id_empleado },
      message: `Usuario '${user.usuario}' actualizado exitosamente.`
    };
  } catch (error) {
    console.error(`Error al actualizar usuario: ${error.message}`);
    return {
      success: false,
      error: error,
      updatedUser: {},
      message: `Error al actualizar usuario: ${error.message}`
    };
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

  function logToFile(message) {
    const timestamp = new Date().toISOString();

    if (logFilePath) {
      fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`);
    } else {
      console.log(`[${timestamp}] (PRE-INIT LOG) ${message}`);
    }
  }

  const validationResult = loginSchema.safeParse({ username, password });
  if (!validationResult.success) {
    logToFile('Login failed:', validationResult.error);

    // retorna error en caso de que las credenciales invalidas
    return { success: false, error: validationResult.error, username: null };
  }


  try {
    // Buscar el usuario en la base de datos por el nombre de usuario
    const user = await Personal.findOne({
      where: {
        usuario: username,
        activo: true // Asegúrate de que el usuario esté activo
      }
    });

    // Si el usuario no existe o no está activo
    if (!user) {
      logToFile('Login failed: no found user');
      return { success: false, error: { general: 'Usuario o contraseña inválidos.' }, user: null };
    }

    // Verificar la contraseña hasheada con Argon2
    const passwordMatch = await argon2.verify(user.clave, password);

    if (passwordMatch) {
      logToFile('Login successful for user:', username);
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
          id_grupo: user.id_grupo,
          activo: user.activo
        }
      };
    } else {
      logToFile('Login failed');
      return { success: false, error: { general: 'Usuario o contraseña inválidos.' }, user: null };
    }

  } catch (dbError) {
    logToFile('Database or Argon2 error during login:', dbError);
    logToFile(dbError?.toString());
    return { success: false, error: { general: 'Error en el servidor. Por favor, inténtelo de nuevo.' }, user: null };
  }
}
async function handleGetGroups(event) {
  try {
    const groups = await GruposPersonal.findAll({ raw: true });
    
    return { success: true, groups };
  } catch (error) {
    console.error('Error fetching groups:', error);
    return { success: false, error: { general: 'Error fetching groups.' } };
  }
}

async function handleGetUsers(event) {
  try {
    const users = await Personal.findAll({
      attributes: { exclude: ['clave'] },
      raw: true
    });

    return { success: true, users };
  } catch (error) {
    console.error('Error fetching groups:', error);
    return { success: false, error: { general: 'Error fetching groups.' } };
  }
}

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

app.whenReady().then(() => {
  try {
    initialization();
    ipcMain.handle('login', handleLogin)
    ipcMain.handle('getGroups', handleGetGroups)
    ipcMain.handle('createUser', createUser)
    ipcMain.handle('getUsers', handleGetUsers)
    ipcMain.handle('editUser', editUser)
    ipcMain.handle('deleteUser', deleteUser)
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