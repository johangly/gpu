// init_connection.js
// Script para inicializar la base de datos y crear el usuario administrador.
import { connection } from "./db_connection.js";
import { GruposPersonal } from './models/grupos_personal.js';
import { Personal } from './models/personal.js';

// Función para insertar los grupos de personal iniciales
async function insertInitialGroups() {
  console.log('Insertando grupos de personal iniciales...');
  // Define los grupos de personal que deseas insertar
  const groups = ['Administrativo', 'Docente', 'Obrero'];
  for (const groupName of groups) {
    try {
      // Busca si el grupo ya existe
      const [group, created] = await GruposPersonal.findOrCreate({
        where: { nombre_grupo: groupName },
        defaults: { nombre_grupo: groupName }
      });
      if (created) {
        console.log(`Grupo '${groupName}' insertado.`);
      } else {
        console.log(`Grupo '${groupName}' ya existe.`);
      }
    } catch (error) {
      console.error(`Error al insertar el grupo '${groupName}':`, error);
    }
  }
}

// Función para crear el usuario administrador
async function createAdminUser() {
  console.log('Creando usuario administrador...');
  try {
    // Busca el ID del grupo 'Administrativo'
    const adminGroup = await GruposPersonal.findOne({
      where: { nombre_grupo: 'Administrativo' }
    });

    if (!adminGroup) {
      console.error("Error: No se encontró el grupo 'Administrativo'. Asegúrate de que los grupos iniciales se insertaron correctamente.");
      return;
    }

    // Datos del usuario administrador
    const adminUserData = {
      cedula: 'V-99999999',
      nombre: process.env.ADMIN_NAME,
      apellido: process.env.ADMIN_LAST_NAME,
      usuario: process.env.ADMIN_USER,     
      clave: process.env.ADMIN_PASSWORD,     
      id_grupo: adminGroup.id_grupo,
      activo: true
    };

    // Intenta encontrar o crear el usuario administrador
    const [adminUser, created] = await Personal.findOrCreate({
      where: { usuario: adminUserData.usuario }, // Criterio para buscar si ya existe
      defaults: adminUserData // Datos a usar si no existe y se crea
    });

    if (created) {
      console.log(`Usuario administrador '${adminUser.usuario}' creado exitosamente.`);
    } else {
      console.log(`Usuario administrador '${adminUser.usuario}' ya existe.`);
    }

  } catch (error) {
    console.error('Error al crear el usuario administrador:', error);
    // Puedes añadir manejo de errores más específico, como si la cédula ya existe.
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('La cédula o el usuario del administrador ya existen.');
    }
  }
}

// Función principal de inicialización
async function initDatabase() {
  console.log('Iniciando la inicialización de la base de datos...');
  
  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    // 1. Sincroniza los modelos con la base de datos (crea/actualiza tablas)
    await connection.sync({ force: true });
    // 2. Inserta los grupos de personal iniciales
    await connection.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
    
    await insertInitialGroups();

    // 3. Crea el usuario administrador
    await createAdminUser();

    console.log('Base de datos inicializada y usuario administrador creado.');
  } catch (error) {
    console.error('Error durante la inicialización de la base de datos:', error);
  } finally {
    // Cierra la conexión a la base de datos al finalizar
    await connection.close();
    console.log('Conexión a la base de datos cerrada.');
    process.exit(0); // Termina el proceso del script
  }
}

// Ejecuta la función de inicialización
initDatabase();
