export default (sequelize, DataTypes) => {
  const GruposPersonal = sequelize.define('GruposPersonal', {
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
    timestamps: false, // Si manejas creado_en y actualizado_en manualmente, timestamps: false es correcto.
    // Si quieres que Sequelize los maneje automáticamente (createdAt/updatedAt), pon timestamps: true.
    // Si pones timestamps: true, no necesitas los campos creado_en/actualizado_en en la definición del modelo.
    underscored: true, // Usa snake_case para los nombres de columna en la DB
  });

  return GruposPersonal; 
};
