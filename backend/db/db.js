import { Sequelize, DataTypes } from 'sequelize'; 

import { connection } from './db_connection.js'; // Importa la conexión desde db_connection.js

import GruposPersonal from './models/grupos_personal.js';
import Personal from './models/personal.js';
import Asistencia from './models/asistencia.js';

const db = {
  sequelize: connection,
  Sequelize: Sequelize,
  Personal: Personal(connection,DataTypes),
  GruposPersonal: GruposPersonal(connection,DataTypes),
  Asistencia: Asistencia(connection,DataTypes),
}; // Objeto para almacenar los modelos y la instancia de Sequelize


db.GruposPersonal.hasMany(db.Personal, {
  foreignKey: 'id_grupo',
  as: 'personal', // Alias para la relación
});


db.Personal.belongsTo(db.GruposPersonal, {
  foreignKey: 'id_grupo', // Clave foránea en la tabla 'personal'
  targetKey: 'id_grupo',  // Clave primaria en la tabla 'grupos_personal'
  as: 'grupo',            // Alias para la relación
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'     // Actualiza en cascada si el id_grupo cambia
});

db.Personal.hasMany(db.Asistencia, {
  foreignKey: 'id_empleado',
  as: 'registrosAsistencia',
});

db.Asistencia.belongsTo(db.Personal, {
  foreignKey: 'id_empleado',
  as: 'empleado',
});

// db.Personal = new db.Personal(db.sequelize, DataTypes);
// db.GruposPersonal = new db.GruposPersonal(db.sequelize, DataTypes);
// db.Asistencia = new db.Asistencia(db.sequelize, DataTypes);


// Sincroniza los modelos con la base de datos
// ¡ADVERTENCIA!: `alter: true` intentará hacer cambios no destructivos en la DB.
// `force: true` BORRARÁ y recreará las tablas (¡solo para desarrollo!).
// Para producción, usa migraciones.
async function syncDatabase() {
  try {
    await db.sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    await db.sequelize.sync({ alter: true }); // Sincroniza los modelos con la DB
    console.log('Modelos sincronizados con la base de datos.');
  } catch (error) {
    console.error('No se pudo conectar o sincronizar la base de datos:', error);
  }
} 

// Exporta la instancia de Sequelize y los modelos
db.syncDatabase = syncDatabase; // Exporta la función de sincronización

export default db; // Usa export default para el módulo ES
