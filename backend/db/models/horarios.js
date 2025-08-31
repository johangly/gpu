export default (sequelize, DataTypes) => {
    const HorariosGrupos = sequelize.define('HorariosGrupos', {
      id_horario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'ID único del registro de horario',
      },
      id_grupo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Clave foránea que referencia al grupo',
      },
      dia_semana: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Día de la semana (1 = Lunes, 7 = Domingo)',
      },
      hora_inicio: {
        type: DataTypes.TIME,
        allowNull: false,
        comment: 'Hora en que comienza la jornada',
      },
      hora_fin: {
        type: DataTypes.TIME,
        allowNull: false,
        comment: 'Hora en que termina la jornada',
      },
      creado_en: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      actualizado_en: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
      },
    }, {
      tableName: 'horarios_grupos',
      timestamps: false, // Como los timestamps se manejan manualmente
      underscored: true,
    });
  
    return HorariosGrupos;
  };