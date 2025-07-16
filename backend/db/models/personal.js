// models/personal.js
// Definición del modelo para la tabla `personal`, incluyendo el hashing con Argon2id.
import { DataTypes } from "sequelize";
import { connection } from "../db_connection.js";
import { GruposPersonal } from './grupos_personal.js'; // Asegúrate de que este modelo esté definido correctamente
import argon2 from 'argon2';

const Personal = connection.define('Personal', {
  id_empleado: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único del empleado',
  },
  cedula: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    comment: 'Número de cédula del empleado (identificador único)',
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  usuario: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Nombre de usuario para el inicio de sesión',
  },
  clave: { // Nombre de la columna para la contraseña hasheada
    type: DataTypes.STRING(255), // VARCHAR(255) es suficiente para el hash de Argon2
    allowNull: false,
    comment: 'Contraseña hasheada del empleado',
  },
  id_grupo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Clave foránea que referencia al grupo al que pertenece el empleado',
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Indica si el empleado está activo en el sistema',
  },
  // No se incluyen `creado_en` y `actualizado_en` aquí ya que no están en tu esquema SQL para esta tabla.
  // Si los añadieras en el SQL, deberías definirlos aquí también.
}, {
  tableName: 'personal', // Nombre de la tabla en la base de datos
  timestamps: false,     // Deshabilita los campos `createdAt` y `updatedAt` automáticos de Sequelize
  // ya que no están definidos en tu esquema SQL para esta tabla.
  underscored: true,     // Usa snake_case para los nombres de columnas generados automáticamente (si los hubiera)

  // === Hooks de Sequelize para el Hashing de Contraseñas ===
  hooks: {
    // Hook `beforeCreate`: Se ejecuta antes de que se cree un nuevo registro de Personal
    beforeCreate: async (personal, options) => {
      // Solo hashea si el campo 'clave' tiene un valor
      if (personal.clave) {
        personal.clave = await argon2.hash(personal.clave, {
          type: argon2.argon2id,
          memoryCost: 2 ** 14,     // Costo de memoria en KiB (ej. 16 MiB)
          timeCost: 3,          // Iteraciones (costo de tiempo)
          parallelism: 1        // Hilos de CPU a usar
        });
      }
    },
    // Hook `beforeUpdate`: Se ejecuta antes de que se actualice un registro de Personal
    beforeUpdate: async (personal, options) => {
      // Solo hashea si el campo 'clave' ha sido modificado
      if (personal.changed('clave')) {
        personal.clave = await argon2.hash(personal.clave, {
          type: argon2.argon2id,
          memoryCost: 2 ** 14,
          timeCost: 3,
          parallelism: 1
        });
      }
    },
  },
});



// Las asociaciones se definen en db/index.js
// Personal.associate = (models) => {
//   Personal.belongsTo(models.GruposPersonal, {
//     foreignKey: 'id_grupo',
//     as: 'grupo'
//   });
// };

export { Personal }

