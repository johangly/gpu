dotenv.config();
import { Sequelize } from 'sequelize'; 
import dotenv from 'dotenv';  

// --- Configuración de la conexión a la base de datos MySQL ---
const connection = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  timezone: '-04:00', // Zona horaria de Venezuela/Caracas (UTC-04:00)
});

export { connection }
