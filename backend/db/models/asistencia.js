export default (sequelize, DataTypes) => {
  const Asistencia = sequelize.define('Asistencia', {
    id_registro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID único del registro de asistencia',
    },
    id_empleado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Clave foránea que referencia al empleado',
    },
    tipo_accion: {
      type: DataTypes.ENUM('entrada', 'salida'), // 'entrada' o 'salida'
      allowNull: false,
      comment: 'Tipo de acción: entrada o salida',
    },
    fecha_hora: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Fecha y hora exacta del registro',
    },
    // Puedes añadir más campos si es necesario, como ubicación, IP, etc.
  }, {
    tableName: 'asistencia',
    timestamps: false, // O true si quieres createdAt/updatedAt automáticos
    underscored: true,
  });

  // Las asociaciones se definen mejor en db/index.js después de cargar todos los modelos
  // Asistencia.associate = (models) => { /* ... */ };

  return Asistencia; // Retorna el modelo definido
};