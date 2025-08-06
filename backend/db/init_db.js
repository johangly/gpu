// Script para inicializar la base de datos y crear el usuario administrador.

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'; 
import db from './db.js'; // Importa la configuración de la base de datos y los modelos

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carga las variables de entorno para este script
// Asume que el .env está en la raíz del proyecto, un nivel arriba de 'init_db.js'
// Ajusta la ruta si tu .env está en otro lugar respecto a este script.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Función para insertar los grupos de personal iniciales
async function insertInitialGroups() {
  console.log('Insertando grupos de personal iniciales...');
  const groups = ['Administrativo', 'Docente', 'Obrero'];
  for (const groupName of groups) {
    try {
      // Usa db.GruposPersonal para acceder al modelo
      const [group, created] = await db.GruposPersonal.findOrCreate({
        where: { nombre_grupo: groupName },
        defaults: { nombre_grupo: groupName }
      });
      if (created) {
        console.log(`Grupo '${groupName}' insertado.`);
      } else {
        console.log(`Grupo '${groupName}' ya existe.`);
      }
    } catch (error) {
      console.error(`Error al insertar el grupo '${groupName}':`, error.message);
    }
  }
}

// Función para crear el usuario administrador
async function createAdminUser() {
  console.log('Creando usuario administrador...');
  try {
    // Usa db.GruposPersonal para acceder al modelo
    const adminGroup = await db.GruposPersonal.findOne({
      where: { nombre_grupo: 'Administrativo' }
    });

    if (!adminGroup) {
      console.error("Error: No se encontró el grupo 'Administrativo'. Asegúrate de que los grupos iniciales se insertaron correctamente.");
      return;
    }

    // Asegúrate de que estas variables de entorno existan en tu .env
    const adminUserData = {
      cedula: process.env.ADMIN_CEDULA || 'V99999999', // Añadido valor por defecto
      nombre: process.env.ADMIN_NAME || 'Admin',
      apellido: process.env.ADMIN_LAST_NAME || 'User',
      usuario: process.env.ADMIN_USER || 'admin',
      clave: process.env.ADMIN_PASSWORD || 'password', // La contraseña se hasheará automáticamente por el hook
      id_grupo: adminGroup.id_grupo,
      activo: true
    };

    // Usa db.Personal para acceder al modelo
    const [adminUser, created] = await db.Personal.findOrCreate({
      where: { usuario: adminUserData.usuario },
      defaults: adminUserData
    });

    if (created) {
      console.log(`Usuario administrador '${adminUser.usuario}' creado exitosamente.`);
    } else {
      console.log(`Usuario administrador '${adminUser.usuario}' ya existe.`);
    }

  } catch (error) {
    console.error('Error al crear el usuario administrador:', error.message);
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('La cédula o el usuario del administrador ya existen.');
    }
  }
}

// Función principal de inicialización de la base de datos
async function initDatabase() {
  console.log('Iniciando la inicialización de la base de datos...');

  try {
    // Deshabilita temporalmente las restricciones de clave foránea
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });

    // Solo usar en entornos de desarrollo/pruebas.
    await db.sequelize.sync({ force: true });
    console.log('Tablas de la base de datos sincronizadas (recreadas).');

    // Habilita nuevamente las restricciones de clave foránea
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });

    // Inserta los grupos de personal iniciales
    await insertInitialGroups();

    // Crea el usuario administrador
    await createAdminUser();

    console.log('Base de datos inicializada y usuario administrador creado.');
  } catch (error) {
    console.error('Error durante la inicialización de la base de datos:', error.message);
    console.error('Detalles del error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
  } finally {
    // Cierra la conexión a la base de datos al finalizar
    await db.sequelize.close(); // Usa db.sequelize para cerrar la conexión
    console.log('Conexión a la base de datos cerrada.');
    process.exit(0); // Termina el proceso del script
  }
}

// Ejecuta la función de inicialización
initDatabase();
