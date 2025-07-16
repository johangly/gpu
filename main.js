// electron.js
import { app, BrowserWindow, ipcMain } from 'electron/main';
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import isDev from 'electron-is-dev';
import { z } from 'zod';
import { Personal } from './backend/db/models/personal.js';
import argon2 from 'argon2';
// === Función handleLogin para autenticar usuarios con Sequelize y Argon2 ===
/**
 * Maneja la lógica de inicio de sesión, validando credenciales contra la base de datos.
 * @param {Object} event - Objeto de evento IPC (no usado directamente para la lógica de login, pero es parte de la firma IPC).
 * @param {Object} credentials - Objeto que contiene 'username' y 'password' del formulario de login.
 * @returns {Promise<Object>} Un objeto con { success: boolean, error: string | Object | null, user: Object | null }.
 */ 
async function handleLogin(event, credentials) { 
  const { username, password } = credentials;

  // 1. Validación de datos con Zod
  const validationResult = loginSchema.safeParse({ username, password });
  if (!validationResult.success) {
    console.error('Login failed:', validationResult.error);

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
      console.log('Login failed');
      return { success: false, error: { general: 'Usuario o contraseña inválidos.' }, user: null };
    }

    // 4. Verificar la contraseña hasheada con Argon2
    // user.clave es el hash almacenado en la DB
    // password es la contraseña en texto plano ingresada por el usuario
    const passwordMatch = await argon2.verify(user.clave, password);

    if (passwordMatch) {
      console.log('Login successful for user:', username);
      // Retorna información del usuario (sin la contraseña) si el login es exitoso
      return {
        success: true,
        error: null,
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
      console.log('Login failed');
      return { success: false, error: { general: 'Usuario o contraseña inválidos.' }, user: null };
    }

  } catch (dbError) {
    console.error('Database or Argon2 error during login:', dbError);
    return { success: false, error: { general: 'Error en el servidor. Por favor, inténtelo de nuevo.' }, user: null };
  }
}

async function verifyPassword(hash, password) {
  try {
    const isMatch = await argon2.verify(hash, password);
    console.log('¿Coinciden las contraseñas?', isMatch);
    return isMatch;
  } catch (err) {
    console.error('Error al verificar la contraseña:', err);
    throw err;
  }
}

// === Definición del esquema Zod para el login (sin TypeScript) ===
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

// Obteniendo el directorio actual del archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function handleSetTitle(event, title) {
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  win.setTitle(title)
}

function handleGetTitle() {
  console.log('Getting title...');
  return true;
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1080,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    webPreferences: { 
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
    ipcMain.on('set-title', handleGetTitle);
    ipcMain.handle('login', handleLogin)
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