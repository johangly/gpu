// electron.js
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url'; // <-- Importa esto
import isDev from 'electron-is-dev';
// const isDev = false;

// Obtén la ruta del directorio actual de forma compatible con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // <-- Esto reemplaza a la global __dirname

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1080,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    webPreferences: { // <-- Es buena práctica añadir esto para Electron
      nodeIntegration: true, // Permite usar módulos de Node.js en el renderizador (si lo necesitas)
      contextIsolation: false, // Desactiva el aislamiento de contexto (cuidado con esto en producción)
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
  createWindow();
});

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });