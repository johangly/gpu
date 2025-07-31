
import argon2 from 'argon2'; // argon2 sí se necesita para los hooks

export default (sequelize, DataTypes) => {
  const Personal = sequelize.define('Personal', {
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
  }, {
    tableName: 'personal', // Nombre de la tabla en la base de datos
    timestamps: true,     // Habilita los campos `createdAt` y `updatedAt` automáticos de Sequelize
    underscored: true,

    // === Hooks de Sequelize para el Hashing de Contraseñas ===
    hooks: {
      // Hook `beforeCreate`: Se ejecuta antes de que se cree un nuevo registro de Personal
      beforeCreate: async (personal, options) => {
        // Solo hashea si el campo 'clave' tiene un valor
        if (personal.clave) {
          personal.clave = await argon2.hash(personal.clave, {
            type: argon2.argon2id,
            memoryCost: 2 ** 14,     // Costo de memoria en KiB (ej. 16 MiB)
            timeCost: 3,           // Iteraciones (costo de tiempo)
            parallelism: 1         // Hilos de CPU a usar
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

  // Las asociaciones se definen en db/index.js después de cargar todos los modelos.
  // Personal.associate = (models) => { /* ... */ };

  return Personal; // Retorna el modelo definido
};
