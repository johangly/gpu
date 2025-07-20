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


// --- Carga de variables de entorno con dotenv ---
// Asegúrate de que esta línea esté al principio de tu main.js
// Ajusta la ruta según la estructura de tu proyecto empaquetado
// try {
//   // Importa dotenv directamente y usa .config()
//   // La ruta relativa a la raíz del proyecto desde el main.js empaquetado
//   // suele ser dos niveles arriba si main.js está en 'resources/app.asar/dist' o similar
//   const dotenvPath = path.resolve(__dirname, '../../.env');
//   logToFile(`Intentando cargar .env desde: ${dotenvPath}`);

//   // Importa dotenv.config() y úsalo
//   // Si tienes problemas, puedes probar con 'dotenv/config.js' si tu bundler lo permite
//   // Pero para control explícito de la ruta, es mejor dotenv.config()
//   const dotenv = await import('dotenv'); // Importación dinámica para usar await
//   dotenv.config({ path: dotenvPath });

//   logToFile('dotenv cargado exitosamente.');
// } catch (error) { // Añadido tipado para TypeScript
//   logToFile(`Error al cargar dotenv: ${error.message}`);
// }


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
    // Solo escribe al archivo si logFilePath ya ha sido inicializado
    if (logFilePath) {
      fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`);
    } else {
      // Si se llama antes de la inicialización, imprime en la consola de desarrollo
      console.log(`[${timestamp}] (PRE-INIT LOG) ${message}`);
    }
  }
  // 1. Validación de datos con Zod
  const validationResult = loginSchema.safeParse({ username, password });
  if (!validationResult.success) {
    logToFile('Login failed:', validationResult.error);

    // retorna error en caso de que las credenciales invalidas
    return { success: false, error: validationResult.error, username: null };
  }


  try {
    // 2. Buscar el usuario en la base de datos por el nombre de usuario
    const user = await Personal.findOne({
      where: {
        usuario: username,
        activo: true // Asegúrate de que el usuario esté activo
      }
    });

    // 3. Si el usuario no existe o no está activo
    if (!user) {
      logToFile('Login failed: no found user');
      return { success: false, error: { general: 'Usuario o contraseña inválidos.' }, user: null };
    }

    // 4. Verificar la contraseña hasheada con Argon2
    // user.clave es el hash almacenado en la DB
    // password es la contraseña en texto plano ingresada por el usuario
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
    console.log("ENTRANDO")
    const groups = await GruposPersonal.findAll({raw:true});
    console.log('Fetched groups:!!!!!!!!!!!!', groups);
    return { success: true, groups };
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