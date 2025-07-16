// models/grupos_personal.js
// Definición del modelo para la tabla `grupos_personal`.
import { Sequelize, DataTypes } from "sequelize";
import { connection } from "../db_connection.js";
import { Personal } from "./personal.js";

const GruposPersonal = connection.define('GruposPersonal', {
  id_grupo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'ID único del grupo de personal',
  },
  nombre_grupo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Nombre del grupo de personal (ej. Administrativo, Docente, Obrero)',
  },
  creado_en: {
    type: DataTypes.DATE, // Usa DataTypes.DATE para TIMESTAMP en MySQL
    allowNull: false,
    defaultValue: DataTypes.NOW, 
    comment: 'Fecha y hora de creación del registro',
  },
  actualizado_en: {
    type: DataTypes.DATE, // Usa DataTypes.DATE para TIMESTAMP en MySQL
    allowNull: false,
    defaultValue: DataTypes.NOW, 
    onUpdate: DataTypes.NOW,     // Actualiza automáticamente en cada modificación
    comment: 'Fecha y hora de la última actualización del registro',
  },
}, {
  tableName: 'grupos_personal', 
  timestamps: false,
  underscored: true,
});


// Las asociaciones se definen en db/index.js
// GruposPersonal.associate = (models) => {
//   GruposPersonal.hasMany(models.Personal, {
//     foreignKey: 'id_grupo',
//     as: 'personal',
//   });
// };

export { GruposPersonal };