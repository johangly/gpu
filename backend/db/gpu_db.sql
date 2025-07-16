-- -----------------------------------------------------
-- Schema Gestión de Personal Universitario (GPU)
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `gpu_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
USE `gpu_db` ;

-- -----------------------------------------------------
-- Table `gpu_db`.`grupos_personal`
--
-- Almacena los diferentes grupos de personal (Administrativo, Docente, Obrero).
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gpu_db`.`grupos_personal` (
  `id_grupo` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_grupo` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre del grupo de personal (ej. Administrativo, Docente, Obrero)',
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de creación del registro',
  `actualizado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha y hora de la última actualización del registro'
);

-- Insertar los grupos de personal iniciales
INSERT INTO `grupos_personal` (`nombre_grupo`) VALUES
('Administrativo'),
('Docente'),
('Obrero');

-- -----------------------------------------------------
-- Table `gpu_db`.`personal`
--
-- Almacena la información de cada empleado, incluyendo sus credenciales y grupo.
-- La contraseña debería ser almacenada como un hash seguro (ej. bcrypt, SHA256) en la aplicación, no texto plano.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gpu_db`.`personal` (
  `id_empleado` INT AUTO_INCREMENT PRIMARY KEY,
  `cedula` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Número de cédula del empleado (identificador único)',
  `nombre` VARCHAR(100) NOT NULL,
  `apellido` VARCHAR(100) NOT NULL,
  `usuario` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre de usuario para el inicio de sesión',
  `clave` VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada del empleado',
  `id_grupo` INT NOT NULL COMMENT 'Clave foránea que referencia al grupo al que pertenece el empleado',
  `activo` BOOLEAN DEFAULT TRUE COMMENT 'Indica si el empleado está activo en el sistema',
  CONSTRAINT `fk_personal_grupos`
    FOREIGN KEY (`id_grupo`)
    REFERENCES `gpu_db`.`grupos_personal` (`id_grupo`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table `gpu_db`.`registros_acceso`
--
-- Registra las entradas y salidas del personal.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gpu_db`.`registros_acceso` (
  `id_registro` INT AUTO_INCREMENT PRIMARY KEY,
  `id_empleado` INT NOT NULL COMMENT 'Clave foránea que referencia al empleado',
  `fecha_hora_entrada` DATETIME NOT NULL COMMENT 'Marca de tiempo de la entrada',
  `fecha_hora_salida` DATETIME NULL COMMENT 'Marca de tiempo de la salida (puede ser NULL si aún no ha salido)',
  CONSTRAINT `fk_registros_personal`
    FOREIGN KEY (`id_empleado`)
    REFERENCES `gpu_db`.`personal` (`id_empleado`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table `gpu_db`.`personal_horarios`
--
-- Define los días de la semana en que cada empleado debe asistir.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gpu_db`.`personal_horarios` (
  `id_personal_horario` INT AUTO_INCREMENT PRIMARY KEY,
  `id_empleado` INT NOT NULL COMMENT 'Clave foránea que referencia al empleado',
  `dia_semana` ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo') NOT NULL COMMENT 'Día de la semana de asistencia esperada',
  -- Se podrían añadir campos como hora_entrada_esperada y hora_salida_esperada si se necesita un horario más granular.
  CONSTRAINT `fk_horarios_personal`
    FOREIGN KEY (`id_empleado`)
    REFERENCES `gpu_db`.`personal` (`id_empleado`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  UNIQUE (`id_empleado`, `dia_semana`) -- Un empleado solo puede tener un registro por día de la semana
);

-- -----------------------------------------------------
-- Table `gpu_db`.`permisos_ausencias`
--
-- Registra los días de permiso, enfermedad o ausencias justificadas del personal.
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `gpu_db`.`permisos_ausencias` (
  `id_ausencia` INT AUTO_INCREMENT PRIMARY KEY,
  `id_empleado` INT NOT NULL COMMENT 'Clave foránea que referencia al empleado',
  `fecha_inicio` DATE NOT NULL COMMENT 'Fecha de inicio del permiso o ausencia',
  `fecha_fin` DATE NOT NULL COMMENT 'Fecha de fin del permiso o ausencia',
  `tipo_ausencia` VARCHAR(100) NOT NULL COMMENT 'Tipo de ausencia (ej. Permiso, Enfermedad, Vacaciones, Comisión de servicio)',
  `descripcion` TEXT NULL COMMENT 'Descripción detallada de la ausencia',
  `aprobado` BOOLEAN DEFAULT TRUE COMMENT 'Indica si la ausencia fue aprobada o justificada',
  CONSTRAINT `fk_ausencias_personal`
    FOREIGN KEY (`id_empleado`)
    REFERENCES `gpu_db`.`personal` (`id_empleado`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Índices para mejorar el rendimiento de las consultas
-- -----------------------------------------------------
CREATE INDEX `idx_personal_usuario` ON `personal` (`usuario`);
CREATE INDEX `idx_registros_empleado_fecha` ON `registros_acceso` (`id_empleado`, `fecha_hora_entrada`);
CREATE INDEX `idx_permisos_empleado_fechas` ON `permisos_ausencias` (`id_empleado`, `fecha_inicio`, `fecha_fin`);