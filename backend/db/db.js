// db/index.js
// Este archivo configura la conexión a la base de datos y carga los modelos.
dotenv.config();
import dotenv from 'dotenv';  
import { Sequelize, DataTypes } from 'sequelize'; 

import { connection } from './db_connection.js'; // Importa la conexión desde db_connection.js
// --- Configuración de la conexión a la base de datos MySQL ---
const sequelize = connection;

const db = {}; // Objeto para almacenar los modelos y la instancia de Sequelize


import { GruposPersonal } from './models/grupos_personal.js';
import { Personal } from './models/personal.js';

GruposPersonal.hasMany(Personal, {
  foreignKey: 'id_grupo',
  as: 'personal', // Alias para la relación
});


Personal.belongsTo(GruposPersonal, {
  foreignKey: 'id_grupo', // Clave foránea en la tabla 'personal'
  targetKey: 'id_grupo',  // Clave primaria en la tabla 'grupos_personal'
  as: 'grupo',            // Alias para la relación
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'     // Actualiza en cascada si el id_grupo cambia
});
// --- Carga de Modelos ---
// Importa y define el modelo GruposPersonal
// Asegúrate de que los archivos de modelo (grupos_personal.js y personal.js)
// también usen 'export default' para que esto funcione.

db.Personal = new Personal(sequelize, DataTypes);
db.GruposPersonal = new GruposPersonal(sequelize, DataTypes);



// --- Definición de Asociaciones ---
// Define la relación de clave foránea entre Personal y GruposPersonal
// Un empleado pertenece a un grupo de personal
// db.Personal.belongsTo(db.GruposPersonal, {
//   foreignKey: 'id_grupo', // Clave foránea en la tabla 'personal'
//   targetKey: 'id_grupo',  // Clave primaria en la tabla 'grupos_personal'
//   as: 'grupo',            // Alias para la relación (ej. personal.getGrupo())
//   onDelete: 'RESTRICT',   // Restringe la eliminación de un grupo si hay personal asociado
//   onUpdate: 'CASCADE'     // Actualiza en cascada si el id_grupo cambia
// });

// Sincroniza los modelos con la base de datos
// ¡ADVERTENCIA!: `alter: true` intentará hacer cambios no destructivos en la DB.
// `force: true` BORRARÁ y recreará las tablas (¡solo para desarrollo!).
// Para producción, usa migraciones.
async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    await sequelize.sync({ alter: true }); // Sincroniza los modelos con la DB
    console.log('Modelos sincronizados con la base de datos.');
  } catch (error) {
    console.error('No se pudo conectar o sincronizar la base de datos:', error);
  }
}

// Exporta la instancia de Sequelize y los modelos
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.syncDatabase = syncDatabase; // Exporta la función de sincronización

export { db }; // Usa export default para el módulo ES
