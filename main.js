// electron.js
import { app, BrowserWindow, ipcMain } from 'electron/main';
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import isDev from 'electron-is-dev';
import z from 'zod';
import argon2 from 'argon2';
import dotenv from 'dotenv';  
import { Op } from 'sequelize';
import puppeteer from 'puppeteer';
import archiver from 'archiver';
import db from './backend/db/db.js'; // Importa la configuración de la base de datos
// import { connection } from './backend/db/db_connection.js'; // Asegúrate de que la ruta sea correcta
import fs from 'node:fs'
import os from 'node:os'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, isDev ? '.env' : '.env') });

// const sequelize = connection;

const loginSchema = z.object({
  username: z.string()
    .min(3, { message: "El usuario debe tener al menos 3 caracteres." })
    .max(50, { message: "El usuario no puede exceder los 50 caracteres." })
    .trim()
    .nonempty({ message: "El usuario es requerido." }),

  password: z.string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." })
    .max(100, { message: "La contraseña no puede exceder los 100 caracteres." })
    .nonempty({ message: "La contraseña es requerida." }),
});

async function syncDatabase() {
  try {
    // await sequelize.authenticate();
    // await sequelize.sync({ alter: true }); // Sincroniza los modelos con la DB
  } catch (error) {
    console.error(`No se pudo conectar o sincronizar la base de datos: ${error.message}`);
  }
}

async function initialization() {
  const userDataPath = app.getPath('userData'); // Directorio de datos de la aplicación
  const logFilePath = path.join(userDataPath, 'app_debug.log');

  // function logToFile(message) {
  //   const timestamp = new Date().toISOString();
  //   // Solo escribe al archivo si logFilePath ya ha sido inicializado
  //   if (logFilePath) {
  //     fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`);
  //   } else {
  //     // Si se llama antes de la inicialización, imprime en la consola de desarrollo
  //     console.log(`[${timestamp}] (PRE-INIT LOG) ${message}`);
  //   }
  // }
  
  // logToFile('Aplicación Electron iniciada y rutas de log inicializadas.');

  // --- Carga de variables de entorno con dotenv ---
  try {
    const dotenvPath = path.resolve(__dirname, '../../.env');
    // logToFile(`Intentando cargar .env desde: ${dotenvPath}`);

    const dotenv = await import('dotenv');
    dotenv.config({ path: dotenvPath });

    // logToFile('dotenv cargado exitosamente.');
  } catch (error) {
    // logToFile(`Error al cargar dotenv: ${error.message}`);
  }

  // --- Verifica las variables de entorno de la DB ---
  // logToFile(`DB_HOST: ${process.env.DB_HOST}`);
  // logToFile(`DB_NAME: ${process.env.DB_NAME}`);
  // logToFile(`DB_USER: ${process.env.DB_USER}`);
  // logToFile(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '*****' : 'NO_PASSWORD_SET'}`);
  // logToFile(`DB_TIMEZONE: ${process.env.DB_TIMEZONE}`);

  try {
    console.log('Intentando sincronizar la base de datos...');
    // syncDatabase();
    console.log('Base de datos sincronizada y conectada.');
  } catch (error) {
    console.error(`Error crítico de conexión/sincronización de DB: ${error.message}`);
    console.error(`Detalle del error de DB: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
  }

  // logToFile('Inicialización completa, creando ventana principal...');
}

async function deleteUser(event, id_empleado) {
  try {
    const result = await db.Personal.destroy({
      where: { id_empleado }
    });
    if (result) {
      console.log(`Usuario eliminado exitosamente.`);
      return { success: true, error: null, message: `Usuario eliminado exitosamente.` };
    } else {
      console.log(`No se encontró usuario con ID ${id_empleado}.`);
      return { success: false, error: null, message: `No se encontró usuario.` };
    }
  } catch (error) {
    console.error(`Error al eliminar usuario con ID ${id_empleado}: ${error.message}`);
      return { success: false, error, message: `Error al eliminar usuario: ${error.message}` };
    }
  }

async function createUser(event,data) {
  // Agrega el nuevo usuario
  try {
    const userSchema = z.object({
      cedula: z.string().min(1, { message: "La cédula es requerida." }),
      nombre: z.string().min(1, { message: "El nombre es requerido." }),
      apellido: z.string().min(1, { message: "El apellido es requerido." }),
      usuario: z.string().min(3, { message: "El usuario debe tener al menos 3 caracteres." }).max(50, { message: "El usuario no puede exceder los 50 caracteres." }).trim(),
      clave: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }).max(100, { message: "La contraseña no puede exceder los 100 caracteres." }),
      grupo: z.object({
        id_grupo: z.number({ invalid_type_error: "El grupo debe ser un número." }),
        nombre_grupo: z.string().min(1, { message: "El nombre del grupo es requerido." })
      }),
    });

    const validationResult = userSchema.safeParse(data);
    if (!validationResult.success) {
      console.error('User validation failed:', validationResult.error);
      // retorna error en caso de que las credenciales invalidas
      return { success: false, error: validationResult.error, message: "Datos de usuario inválidos." };
    }

    const userData = {
      cedula: data.cedula,
      nombre: data.nombre,
      apellido: data.apellido,
      usuario: data.usuario,
      clave: data.clave,
      id_grupo: data.grupo.id_grupo,
      activo: true
    };

    // Intenta encontrar o crear el usuario
    const [user, created] = await db.Personal.findOrCreate({
      raw: true,
      where: { usuario: userData.usuario }, // Criterio para buscar si ya existe
      defaults: userData // Datos a usar si no existe y se crea
    });
    
    const userWithGroup = await db.Personal.findByPk(user.id_empleado, {
      include: {
        model: db.GruposPersonal,
        as: 'grupo',
        attributes: ['id_grupo', 'nombre_grupo']
      }
    });

    // Mapea el usuario a un objeto JSON plano y extrae el grupo
    const finalUserData = userWithGroup ? userWithGroup.toJSON() : null;
    const groupData = finalUserData?.grupo ? {
      id_grupo: finalUserData.grupo.id_grupo,
      nombre_grupo: finalUserData.grupo.nombre_grupo,
    } : null;

    if (created) {
      console.log(`Usuario '${user.usuario}' creado exitosamente.`);
      return {
        success: true,
        error: null,
        newUser: {
          id_empleado: user.id_empleado,
          cedula: user.cedula,
          nombre: user.nombre,
          apellido: user.apellido,
          usuario: user.usuario,
          activo: user.activo,
          grupo: groupData,
        },
        message: `Usuario '${user.usuario}' creado exitosamente.`
      };
    } else {
      console.log(`Usuario '${user.usuario}' ya existe.`);
      return {
        success: true,
        error: null,
        newUser: null,
        message: `Usuario '${user.usuario}' ya existe.`
      };
    }
  } catch (error) {
    console.error(`Error al crear o encontrar usuario: ${error.message}`);
    return {
      success: true,
      error: error,
      newUser: null,
      message: `Error al crear usuario '${user.usuario}': ${error.message}`
    };
  }
}

async function editUser(event, data) {
  try {
    const userSchema = z.object({
      id_empleado: z.number({ invalid_type_error: "El ID del empleado debe ser un número." }),
      cedula: z.string().min(1, { message: "La cédula es requerida." }),
      nombre: z.string().min(1, { message: "El nombre es requerido." }),
      apellido: z.string().min(1, { message: "El apellido es requerido." }),
      usuario: z.string().min(3, { message: "El usuario debe tener al menos 3 caracteres." }).max(50, { message: "El usuario no puede exceder los 50 caracteres." }).trim(),
      clave: z.string().min(0).max(100).optional(), // Puede ser opcional o string vacío
      id_grupo: z.number({ invalid_type_error: "El grupo debe ser un número." }),
      activo: z.boolean().optional().default(true) // Por defecto, el usuario está activo
    });

    const userDataToUpdate = {
      cedula: data.cedula,
      nombre: data.nombre,
      apellido: data.apellido,
      usuario: data.usuario,
      id_grupo: data.id_grupo,
      activo: data.activo !== undefined ? data.activo : true // Si no se especifica, se asume que el usuario está activo
    };

    // Solo agrega 'clave' si cumple con los requisitos de longitud y no está vacío
    if (
      typeof data.clave === 'string' &&
      data.clave.length >= 6 &&
      data.clave.length <= 100
    ) {
      userDataToUpdate.clave = data.clave;
    } else if (typeof data.clave === 'string' && data.clave.length > 0 && data.clave.length < 6) {
      // Si la clave es muy corta pero no vacía, es un error de validación
      return { success: false, error: { clave: "La contraseña debe tener al menos 6 caracteres." }, message: "Datos de usuario inválidos." };
    }

    const validationResult = userSchema.safeParse({ id_empleado: data.id_empleado, ...userDataToUpdate });
    if (!validationResult.success) {
      return { success: false, error: validationResult.error, message: "Datos de usuario inválidos." };
    }

    const user = await db.Personal.findByPk(data.id_empleado);

    if (!user) {
      return { success: false, error: { general: "Usuario no encontrado." }, message: "Usuario no encontrado." };
    }

    // Actualiza los campos del usuario
    await user.update(userDataToUpdate);

    // Recarga el usuario con la información del grupo incluida
    const updatedUserWithGroup = await db.Personal.findByPk(user.id_empleado, {
      include: {
        model: db.GruposPersonal,
        as: 'grupo',
        attributes: ['id_grupo', 'nombre_grupo']
      }
    });

    // Mapea el usuario actualizado a un objeto JSON plano y extrae el grupo
    const finalUserData = updatedUserWithGroup ? updatedUserWithGroup.toJSON() : null;
    const groupData = finalUserData?.grupo ? {
      id_grupo: finalUserData.grupo.id_grupo,
      nombre_grupo: finalUserData.grupo.nombre_grupo,
    } : null;

    // Desestructura para omitir id_grupo redundante en el objeto user principal
    const { id_grupo, ...restFinalUserData } = finalUserData || {};

    logToFile(`Usuario '${restFinalUserData.usuario}' actualizado exitosamente.`);
    return {
      success: true,
      error: null,
      updatedUser: {
        id_empleado: user.id_empleado,
        cedula: user.cedula,
        nombre: user.nombre,
        apellido: user.apellido,
        usuario: user.usuario,
        activo: user.activo,
        grupo: groupData,
      },
      message: `Usuario '${restFinalUserData.usuario}' actualizado exitosamente.`
    };
  } catch (error) {
    logToFile(`Error al actualizar usuario: ${error.message}`);
    logToFile(`Edit User Error Details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
    return {
      success: false,
      error: { general: `Error al actualizar usuario: ${error.message}` },
      updatedUser: {}, // Devuelve un objeto vacío en caso de error
      message: `Error al actualizar usuario: ${error.message}`
    };
  }
}
//* |||||||||||||||||||||||||||||||||||||||||||
//?            Activities functions
//* |||||||||||||||||||||||||||||||||||||||||||

// Trae la última actividad del usuario
async function getLastUserActivity(event, id_empleado) {
  try {
    const lastActivity = await db.Asistencia.findAll({
      where: { id_empleado },
      order: [['fecha_hora', 'DESC']],
      raw: true,
      limit: 1 // Solo queremos la última actividad
    });
    return { success: true, activities: lastActivity, message: `Última actividad obtenida exitosamente.` };
  } catch (error) {
    return { success: false, error: error.message, message: `Error al obtener la última actividad del usuario: ${id_empleado}` };
  }
}

// Trae las últimas 10 actividades del usuario
async function getLast10UserActivities(event, id_empleado) {
  try {
    const activities = await db.Asistencia.findAll({
      where: { id_empleado },
      order: [['fecha_hora', 'DESC']],
      limit: 10,
      raw: true,
    });
    return { success: true, activities: activities, message: `Últimas 10 actividades obtenidas exitosamente.` };
  } catch (error) {
    return { success: false, error: error.message, message: `Error al obtener las últimas 10 actividades del usuario: ${id_empleado}` };
  }
}

// Trae todas las actividades del usuario
async function getAllUserActivities() {
  try {
    const activities = await db.Asistencia.findAll({
      include: {
        model: db.Personal,
        as: 'empleado',
        attributes: ['id_empleado', 'nombre', 'apellido', 'usuario', 'cedula'],
        include: {
          model: db.GruposPersonal,
          as: 'grupo',
          attributes: ['id_grupo', 'nombre_grupo']
        }
      },
      order: [['fecha_hora', 'DESC']],
      attributes: { exclude: ['id_empleado'] },
    });

    // Mapea los resultados para convertirlos en objetos planos de JavaScript.
    // Esto resuelve el error de "object could not be cloned".
    const plainActivities = activities.map(activity => activity.get({ plain: true }));

    return { success: true, activities: plainActivities, message: 'Todas las actividades obtenidas exitosamente.' };
  } catch (error) {
    console.error('Error al obtener todas las actividades:', error);
    return { success: false, error: error.message, message: `Error al obtener todas las actividades.` };
  }
}

const markAttendanceSchema = z.object({
  id_empleado: z.number({ invalid_type_error: "El ID del empleado debe ser un número." }),
  tipo_accion: z.enum(['entrada', 'salida'], { errorMap: () => ({ message: "El tipo de acción debe ser 'entrada' o 'salida'." }) })
});
async function markAttendance(event, data) {
  // Validar los datos de entrada con Zod
  const { id_empleado, tipo_accion } = data;
  const validationResult = markAttendanceSchema.safeParse({ id_empleado, tipo_accion });
  if (!validationResult.success) {
    return { success: false, message: "Datos inválidos para marcar asistencia.", error: validationResult.error };
  }

  try {
    // 1. Validar el tipo de acción y el estado actual del empleado
    const lastActivityResponse = await getLastUserActivity(null, id_empleado);
    if (!lastActivityResponse.success) {
      throw new Error(lastActivityResponse.error || 'No se pudo verificar la última actividad.');
    }

    const lastActivity = lastActivityResponse.activities?.[0];

    if (tipo_accion === 'entrada') {
      if (lastActivity && lastActivity.tipo_accion === 'entrada') {
        return { success: false, message: 'Ya has marcado tu entrada. Debes marcar salida primero.' };
      }
    } else if (tipo_accion === 'salida') {
      if (!lastActivity || lastActivity.tipo_accion === 'salida') {
        return { success: false, message: 'Ya has marcado tu salida o no has marcado entrada.' };
      }
    }

    // 2. Registrar la nueva asistencia
    const newRecord = await db.Asistencia.create({
      id_empleado,
      tipo_accion,
      fecha_hora: new Date(),
    });

    return { success: true, message: `Has marcado tu ${tipo_accion} exitosamente.`, record: newRecord.toJSON() };
  } catch (error) {
    return { success: false, message: `Error al marcar ${tipo_accion}: ${error.message}` };
  }
}
/**
 * Maneja la lógica de inicio de sesión, validando credenciales contra la base de datos.
 * @param {Object} event - Objeto de evento IPC (no usado directamente para la lógica de login, pero es parte de la firma IPC).
 * @param {Object} credentials - Objeto que contiene 'username' y 'password' del formulario de login.
 * @returns {Promise<Object>} Un objeto con { success: boolean, error: string | Object | null, user: Object | null }.
 */

async function handleLogin(event, credentials) { 
  const { username, password } = credentials;
  const userDataPath = app.getPath('userData'); // Directorio de datos de la aplicación
  const logFilePath = path.join(userDataPath, 'app_debug.log');

  // function logToFile(message) {
  //   const timestamp = new Date().toISOString();

  //   if (logFilePath) {
  //     fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`);
  //   } else {
  //     console.log(`[${timestamp}] (PRE-INIT LOG) ${message}`);
  //   }
  // }

  const validationResult = loginSchema.safeParse({ username, password });
  if (!validationResult.success) {
    // logToFile('Login failed:', validationResult.error);

    // retorna error en caso de que las credenciales invalidas
    return { success: false, error: validationResult.error, username: null };
  }


  try {
    // Buscar el usuario en la base de datos por el nombre de usuario
    const user = await db.Personal.findOne({
      where: {
        usuario: username,
        activo: true // Asegúrate de que el usuario esté activo
      },
      include: {
        model: db.GruposPersonal,
        as: 'grupo', // Usa el alias definido en la asociación Personal.belongsTo(GruposPersonal)
        attributes: ['id_grupo', 'nombre_grupo'] // Solo trae los atributos que necesitas del grupo
      }
    });
    // Si el usuario no existe o no está activo
    if (!user) {
      // logToFile('Login failed: no found user');
      return { success: false, error: { general: 'Usuario o contraseña inválidos.' }, user: null };
    }

    // Verificar la contraseña hasheada con Argon2
    const passwordMatch = await argon2.verify(user.clave, password);

    const groupData = user.grupo ? {
      id_grupo: user.grupo.id_grupo,
      nombre_grupo: user.grupo.nombre_grupo,
      // Añade cualquier otro atributo del grupo que necesites aquí
    } : null;

    if (passwordMatch) {
      // logToFile('Login successful for user:', username);
      // Retorna información del usuario (sin la contraseña) si el login es exitoso
      return {
        success: true,
        error: null,
        token:'9312766kssb2123wx',
        user: {
          id_empleado: user.id_empleado,
          cedula: user.cedula,
          nombre: user.nombre,
          apellido: user.apellido,
          usuario: user.usuario,
          activo: user.activo,
          grupo: groupData,
        }
      };
    } else {
      // logToFile('Login failed');
      return { success: false, error: { general: 'Usuario o contraseña inválidos.' }, user: null };
    }

  } catch (dbError) {
    // logToFile('Database or Argon2 error during login:', dbError);
    // logToFile(dbError?.toString());
    return { success: false, error: { general: 'Error en el servidor. Por favor, inténtelo de nuevo.' }, user: null };
  }
}

async function handleGetGroups(event) {
  try {
    const groups = await db.GruposPersonal.findAll({
      include: [{
        model: db.HorariosGrupos,
        as: 'horarios' 
      }],
      order: [
        ['nombre_grupo', 'ASC']
      ]
    });
    const plainGroups = groups.map(group => group.get({ plain: true }));
    return { success: true, groups: plainGroups };
  } catch (error) {
    console.error('Error fetching groups:', error);
    return { success: false, error: { general: 'Error fetching groups.' } };
  }
}

async function createGroup(event, data) {
  const t = await db.sequelize.transaction();

  try {
    const scheduleSchema = z.object({
      dia_semana: z.number().min(0).max(6),
      hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido. Use HH:MM"),
      hora_fin: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido. Use HH:MM"),
    });

    const groupSchema = z.object({
      nombre_grupo: z.string()
        .min(1, { message: "El nombre del grupo es requerido." })
        .max(50, { message: "El nombre no puede exceder los 50 caracteres." })
        .trim(),
      horarios: z.array(scheduleSchema).refine(horarios => {
        for (const horario of horarios) {
          if (horario.hora_inicio >= horario.hora_fin) {
            return false;
          }
        }
        return true;
      }, { message: "La hora de fin debe ser siempre posterior a la hora de inicio." })
    });

    const validationResult = groupSchema.safeParse(data);
    if (!validationResult.success) {
      return { success: false, error: validationResult.error.flatten(), message: "Datos del formulario inválidos." };
    }

    const { nombre_grupo, horarios } = validationResult.data;

    const [group, created] = await db.GruposPersonal.findOrCreate({
      where: { nombre_grupo },
      defaults: { nombre_grupo },
      transaction: t
    });

    if (!created) {
      await t.rollback();
      return {
        success: false,
        error: null,
        newGroup: null,
        message: `El grupo '${nombre_grupo}' ya existe.`
      };
    }

    if (horarios && horarios.length > 0) {
      const schedulesToCreate = horarios.map(h => ({
        ...h,
        id_grupo: group.id_grupo
      }));
      await db.HorariosGrupos.bulkCreate(schedulesToCreate, { transaction: t });
    }

    await t.commit();

    const newGroupWithSchedules = await db.GruposPersonal.findOne({
      where: { id_grupo: group.id_grupo },
      include: [{
        model: db.HorariosGrupos,
        as: 'horarios'
      }]
    });

    console.log(`Grupo '${group.nombre_grupo}' y sus horarios han sido creados exitosamente.`);
    return {
      success: true,
      error: null,
      newGroup: newGroupWithSchedules.get({ plain: true }),
      message: `Grupo '${group.nombre_grupo}' creado exitosamente.`
    };

  } catch (error) {
    await t.rollback();
    console.error(`Error al crear grupo: ${error.message}`);
    return {
      success: false,
      error: error,
      newGroup: null,
      message: `Error al crear el grupo: ${error.message}`
    };
  }
}

async function editGroup(event, data) {
  const t = await db.sequelize.transaction();

  try {
    const scheduleSchema = z.object({
      dia_semana: z.number().min(0).max(7),
      hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido. Use HH:MM"),
      hora_fin: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido. Use HH:MM"),
    });

    const groupSchema = z.object({
      id_grupo: z.number(),
      nombre_grupo: z.string()
        .min(1, { message: "El nombre del grupo es requerido." })
        .max(50, { message: "El nombre no puede exceder los 50 caracteres." })
        .trim(),
      horarios: z.array(scheduleSchema).refine(horarios => {
        for (const horario of horarios) {
          if (horario.hora_inicio >= horario.hora_fin) {
            return false;
          }
        }
        return true;
      }, { message: "La hora de fin debe ser siempre posterior a la hora de inicio." })
    });

    const validationResult = groupSchema.safeParse(data);
    if (!validationResult.success) {
      console.log(validationResult);
      await t.rollback();
      return { success: false, error: validationResult.error.flatten(), message: "Datos del formulario inválidos." };
    }

    const { id_grupo, nombre_grupo, horarios } = validationResult.data;

    const group = await db.GruposPersonal.findByPk(id_grupo, { transaction: t });

    if (!group) {
      await t.rollback();
      return { success: false, error: { general: "Grupo no encontrado." }, message: "Grupo no encontrado." };
    }

    // Verificar si el nuevo nombre ya existe en otro grupo
    const existingGroup = await db.GruposPersonal.findOne({
      where: {
        nombre_grupo: nombre_grupo,
        id_grupo: { [Op.ne]: id_grupo } // Excluye el grupo actual
      },
      transaction: t
    });

    if (existingGroup) {
      await t.rollback();
      return {
        success: false,
        error: { general: "El nombre del grupo ya existe." },
        message: "El nombre del grupo ya existe."
      };
    }

    // Actualizar el nombre del grupo
    await group.update({ nombre_grupo, actualizado_en: new Date() }, { transaction: t });

    // Eliminar horarios antiguos
    await db.HorariosGrupos.destroy({
      where: { id_grupo },
      transaction: t
    });

    // Crear nuevos horarios
    if (horarios && horarios.length > 0) {
      const schedulesToCreate = horarios.map(h => ({
        ...h,
        id_grupo: group.id_grupo
      }));
      await db.HorariosGrupos.bulkCreate(schedulesToCreate, { transaction: t });
    }

    await t.commit();

    const updatedGroupWithSchedules = await db.GruposPersonal.findOne({
      where: { id_grupo },
      include: [{
        model: db.HorariosGrupos,
        as: 'horarios'
      }]
    });

    console.log(`Grupo '${group.nombre_grupo}' y sus horarios han sido actualizados exitosamente.`);
    return {
      success: true,
      error: null,
      updatedGroup: updatedGroupWithSchedules.get({ plain: true }),
      message: `Grupo '${group.nombre_grupo}' actualizado exitosamente.`
    };

  } catch (error) {
    await t.rollback();
    console.error(`Error al actualizar grupo: ${error.message}`);
    return {
      success: false,
      error: error,
      updatedGroup: null,
      message: `Error al actualizar grupo: ${error.message}`
    };
  }
}

async function deleteGroup(event, id_grupo) {
  try {
    // Primero verificar si hay usuarios asociados al grupo
    const usersInGroup = await db.Personal.count({
      where: { id_grupo }
    });

    if (usersInGroup > 0) {
      return {
        success: false,
        error: { general: "No se puede eliminar el grupo porque tiene usuarios asociados." },
        message: `No se puede eliminar el grupo porque tiene ${usersInGroup} usuarios asociados.`
      };
    }

    // Si no hay usuarios asociados, proceder con la eliminación
    const result = await db.GruposPersonal.destroy({
      where: { id_grupo }
    });

    if (result) {
      console.log(`Grupo eliminado exitosamente.`);
      return { success: true, error: null, message: `Grupo eliminado exitosamente.` };
    } else {
      console.log(`No se encontró grupo con ID ${id_grupo}.`);
      return { success: false, error: null, message: `No se encontró grupo.` };
    }
  } catch (error) {
    console.error(`Error al eliminar grupo con ID ${id_grupo}: ${error.message}`);
    return { success: false, error: error, message: `Error al eliminar grupo: ${error.message}` };
  }
}

function generarRangoFechas(fechaInicio, fechaFin) {
  const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const fechas = [];
  const fechaInicioObj = new Date(fechaInicio);
  const fechaFinObj = new Date(fechaFin);
  
  // Validar que las fechas sean válidas
  if (isNaN(fechaInicioObj.getTime()) || isNaN(fechaFinObj.getTime())) {
    throw new Error('Formato de fecha inválido. Usa el formato MM/DD/YYYY');
  }

  // Asegurarnos de que la fecha de inicio sea menor o igual a la fecha fin
  if (fechaInicioObj > fechaFinObj) {
    throw new Error('La fecha de inicio debe ser anterior o igual a la fecha de fin');
  }

  // Crear un objeto Date para iterar
  let fechaActual = new Date(fechaInicioObj);
  
  // Iterar hasta llegar a la fecha fin
  while (fechaActual <= fechaFinObj) {
    const diaSemana = diasSemana[fechaActual.getDay()];
    const fechaFormateada = fechaActual.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/');

    fechas.push({
      dia: diaSemana,
      fecha: fechaFormateada,
      asistencia: []
    });

    // Pasar al siguiente día
    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  return fechas;
}

// Función para generar datos de prueba de asistencias
async function generateTestAttendances() {
  try {
    // Obtener empleados activos (excluyendo administradores)
    const empleados = await db.Personal.findAll({
      where: {
        activo: true,
        id_grupo: {
          [db.Sequelize.Op.not]: 1 // Asumiendo que 1 es el ID del grupo Administrativo
        }
      },
      limit: 20, // Limitar a 20 empleados
      attributes: ['id_empleado']
    });

    if (empleados.length === 0) {
      console.log('No se encontraron empleados para generar asistencias de prueba');
      return { success: false, message: 'No se encontraron empleados para generar asistencias' };
    }

    // Fechas de inicio y fin
    const fechaInicio = new Date('2025-01-01T00:00:00');
    const fechaFin = new Date('2025-02-28T23:59:59');
    
    // Contador total de registros generados
    let totalRegistros = 0;
    
    // Generar asistencias para cada empleado
    for (const empleado of empleados) {
      // Generar entre 5 y 10 días aleatorios en el rango
      const diasAleatorios = Math.floor(Math.random() * 6) + 5;
      totalRegistros += diasAleatorios * 2; // Multiplicar por 2 (entrada y salida)
      
      // Obtener días únicos aleatorios
      const diasUnicos = new Set();
      while (diasUnicos.size < diasAleatorios) {
        const randomDays = Math.floor(Math.random() * 59); // 59 días entre 1 de enero y 28 de febrero
        diasUnicos.add(randomDays);
      }

      // Crear entradas de asistencia para cada día
      for (const diasSumar of diasUnicos) {
        const fechaBase = new Date(fechaInicio);
        fechaBase.setDate(fechaBase.getDate() + diasSumar);
        
        // Hora de entrada entre 6:00 AM y 9:00 AM
        const horaEntrada = new Date(fechaBase);
        horaEntrada.setHours(6 + Math.floor(Math.random() * 3)); // 6-8 AM
        horaEntrada.setMinutes(Math.floor(Math.random() * 60));
        
        // Hora de salida entre 2:00 PM y 6:00 PM (mismo día)
        const horaSalida = new Date(fechaBase);
        horaSalida.setHours(14 + Math.floor(Math.random() * 5)); // 2-6 PM
        horaSalida.setMinutes(Math.floor(Math.random() * 60));

        // Crear registro de entrada
        await db.Asistencia.create({
          id_empleado: empleado.id_empleado,
          tipo_accion: 'entrada',
          fecha_hora: horaEntrada
        });

        // Crear registro de salida
        await db.Asistencia.create({
          id_empleado: empleado.id_empleado,
          tipo_accion: 'salida',
          fecha_hora: horaSalida
        });
      }
    }

    console.log(`Se generaron ${totalRegistros} registros de asistencia de prueba`);
    return { 
      success: true, 
      message: `Se generaron ${totalRegistros} registros de asistencia para ${empleados.length} empleados`,
      totalRegistros,
      totalEmpleados: empleados.length
    };

  } catch (error) {
    console.error('Error al generar asistencias de prueba:', error);
    return { 
      success: false, 
      error: error, 
      message: `Error al generar asistencias de prueba: ${error.message}` 
    };
  }
}

async function calculateAttendance(event, data) {
  try {
    const { fechaInicio, fechaFin } = data;
    console.log("startDate",fechaInicio);
    console.log("endDate",fechaFin);
    const rangoFechas = generarRangoFechas(fechaInicio, fechaFin);

    // Obtener todos los grupos excepto el de Administrativo que tienen horario
    const gruposConHorario = await db.GruposPersonal.findAll({
      where: {
        nombre_grupo: {
          [db.Sequelize.Op.ne]: 'Administrativo'
        }
      },
      include: [{
        model: db.HorariosGrupos,
        as: 'horarios',
        required: true, // Hace un INNER JOIN para solo traer grupos con horario
        attributes: ['id_horario', 'dia_semana', 'hora_inicio', 'hora_fin']
      }],
      attributes: ['id_grupo', 'nombre_grupo']
    });

    
    // Obtener todas las asistencias en el rango de fechas
    const asistencias = await db.Asistencia.findAll({
      where: {
        fecha_hora: {
          [db.Sequelize.Op.between]: [
            new Date(fechaInicio + ' 00:00:00'), 
            new Date(fechaFin + ' 23:59:59')
          ]
        }
      },
      order: [['fecha_hora', 'ASC']]
    });

    // Formatear las asistencias con el día y fecha
    const asistenciasFormateadas = asistencias.map(asistencia => {
      const fecha = new Date(asistencia.fecha_hora);
      const diaSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado','domingo'][fecha.getDay()];
      const fechaFormateada = fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '/');
      
      return {
        ...asistencia.get({ plain: true }), // Convertir a objeto plano
        dia: diaSemana,
        fecha: fechaFormateada
      };
    });

    // Mapear los resultados al formato deseado
    const gruposYHorarios = gruposConHorario.map(grupo => ({
      id_grupo: grupo.id_grupo,
      nombre_grupo: grupo.nombre_grupo,
      horario: grupo.horarios.map(horario => ({
        id_horario: horario.id_horario,
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin
      }))
    }));

    // Obtener todos los empleados activos con sus grupos
    const empleados = await db.Personal.findAll({
      where: { activo: true },
      attributes: ['id_empleado', 'nombre', 'apellido', 'id_grupo'],
      include: [{
        model: db.GruposPersonal,
        as: 'grupo',
        attributes: ['nombre_grupo']
      }]
    });

    // Mapear empleados por ID para acceso rápido
    const empleadosMap = empleados.reduce((acc, empleado) => {
      acc[empleado.id_empleado] = {
        ...empleado.get({ plain: true }),
        asistencias: asistenciasFormateadas.filter(a => a.id_empleado === empleado.id_empleado)
      };
      return acc;
    }, {});

    // Función para verificar si un empleado asistió en un día específico
    function verificarAsistencia(empleado, fecha) {
      const asistenciasDia = empleado.asistencias.filter(a => a.fecha === fecha);
      const entrada = asistenciasDia.find(a => a.tipo_accion === 'entrada');
      const salida = asistenciasDia.find(a => a.tipo_accion === 'salida');
      
      if (entrada && salida) {
        return { 
          asistio: true, 
          entrada: entrada.fecha_hora, 
          salida: salida.fecha_hora,
          estado: 'completo'
        };
      } else if (entrada) {
        return { 
          asistio: true, 
          entrada: entrada.fecha_hora, 
          salida: null,
          estado: 'sin_salida'
        };
      } else if (salida) {
        return { 
          asistio: true, 
          entrada: null, 
          salida: salida.fecha_hora,
          estado: 'sin_entrada'
        };
      }
      return { asistio: false, estado: 'ausente' };
    }

    // Estructurar los datos finales
    const resultadoFinal = rangoFechas.map(dia => {
      // Obtener el día de la semana (0-6, donde 0 es domingo)
      const diaSemana = new Date(dia.fecha.split('/').reverse().join('-')).getDay();
      
      // Obtener empleados que deberían trabajar este día según su horario
      const empleadosDia = Object.values(empleadosMap)
        .filter(empleado => {
          const grupo = gruposYHorarios.find(g => g.id_grupo === empleado.id_grupo);
          if (!grupo) return false;
          return grupo.horario.some(h => h.dia_semana === diaSemana + 1); // +1 porque los días van de 1-7
        });

      // Mapear empleados con su estado de asistencia
      const asistenciasDia = empleadosDia.map(empleado => ({
        id_empleado: empleado.id_empleado,
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        grupo: empleado.grupo?.nombre_grupo || 'Sin grupo',
        ...verificarAsistencia(empleado, dia.fecha)
      }));

      return {
        ...dia,
        asistencias: asistenciasDia
      };
    });

    // Calcular estadísticas
    const totalDias = resultadoFinal.length;
    const totalEmpleados = empleados.length;
    const totalAsistencias = resultadoFinal.reduce(
      (sum, dia) => sum + dia.asistencias.filter(a => a.asistio).length, 0
    );
    const porcentajeAsistencia = totalEmpleados > 0 
      ? (totalAsistencias / (totalDias * totalEmpleados)) * 100 
      : 0;
      console.log('|||||||||||||||||||||||||||||||||')
    console.log({
      success: true,
      data: {
        rangoFechas: resultadoFinal,
        estadisticas: {
          totalDias,
          totalEmpleados,
          totalAsistencias,
          porcentajeAsistencia: porcentajeAsistencia.toFixed(2) + '%'
        },
        grupos: gruposYHorarios
      },
      message: 'Cálculo de asistencias completado exitosamente.'
    });
    console.log('|||||||||||||||||||||||||||||||||')

    // Retornar el resultado estructurado
    return {
      success: true,
      data: {
        rangoFechas: resultadoFinal,
        estadisticas: {
          totalDias,
          totalEmpleados,
          totalAsistencias,
          porcentajeAsistencia: porcentajeAsistencia.toFixed(2) + '%'
        },
        grupos: gruposYHorarios
      },
      message: 'Cálculo de asistencias completado exitosamente.'
    };
  } catch (error) {
    console.error(`Error al calcular asistencia: ${error.message}`);
    return { 
      success: false, 
      error: error, 
      message: `Error al calcular asistencia: ${error.message}` 
    };
  }
}

// async function createHorario(event, data) {
//   try {
//     const horarioSchema = z.object({
//       id_grupo: z.number({ invalid_type_error: "El ID del grupo debe ser un número." }),
//       dia_semana: z.number({ invalid_type_error: "El día de la semana debe ser un número." }).min(1).max(7),
//       hora_inicio: z.instanceof(Date, { invalid_type_error: "La hora de inicio debe ser un objeto Date." }),
//       hora_fin: z.instanceof(Date, { invalid_type_error: "La hora de fin debe ser un objeto Date." })
//     });

//     const validationResult = horarioSchema.safeParse(data);
//     if (!validationResult.success) {
//       return { success: false, error: validationResult.error, message: "Datos del horario inválidos." };
//     }

//     const horario = await db.HorariosGrupos.create(validationResult.data);
//     console.log(`Horario creado exitosamente.`);
//     return { success: true, error: null, message: `Horario creado exitosamente.` };
//   } catch (error) {
//     console.error(`Error al crear horario: ${error.message}`);
//     return { success: false, error: error, message: `Error al crear horario: ${error.message}` };
//   }
// }

async function handleGetUsers(event) {
  try {
    const users = await db.Personal.findAll({
      attributes: { exclude: ['clave'] }, // Excluye la contraseña
      include: {
        model: db.GruposPersonal,
        as: 'grupo', 
        attributes: ['id_grupo', 'nombre_grupo']
      }
    });

    // Mapea los resultados para convertirlos a objetos JSON planos,
    const usersWithGroupData = users.map(user => {
      const userData = user.toJSON();
      // Si el grupo existe, conviértelo también a JSON. Si no, será null.
      const groupData = userData.grupo ? {
        id_grupo: userData.grupo.id_grupo,
        nombre_grupo: userData.grupo.nombre_grupo,
        // Añade cualquier otro atributo del grupo que necesites aquí
      } : null;

      return {
        id_empleado: user.id_empleado,
        cedula: user.cedula,
        nombre: user.nombre,
        apellido: user.apellido,
        usuario: user.usuario,
        activo: user.activo,
        grupo: groupData // Añade el objeto group anidado
      };
    });

    // logToFile(`IPC: Fetched ${usersWithGroupData.length} users with group info.`);
    return { success: true, users: usersWithGroupData };
  } catch (error) {
    console.error('Error fetching groups:', error);
    return { success: false, error: { general: 'Error fetching groups.' } };
  }
}

// Función para formatear horas (HH:MM)
function formatTime(timeInput) {
  if (!timeInput) return '--:--';
  
  try {
    const date = timeInput instanceof Date ? timeInput : new Date(timeInput);
    
    if (isNaN(date.getTime())) {
      console.error('Hora inválida:', timeInput);
      return '--:--';
    }
    
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error al formatear la hora:', error);
    return '--:--';
  }
}

// Función para formatear fechas
function formatDate(dateInput) {
  try {
    // Si ya es una fecha, la formateamos directamente
    if (dateInput instanceof Date) {
      return dateInput.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    // Si es un string en formato ISO o similar
    const date = new Date(dateInput);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    // Si es un string en formato DD/MM/YYYY
    if (typeof dateInput === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
      const [day, month, year] = dateInput.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    return dateInput; // Retornar el valor original si no se pudo formatear
  } catch (error) {
    console.error('Error al formatear la fecha:', error);
    return dateInput;
  }
}


async function handlePrintReport(event, data) {
  if (!data || !data.data) {
    return { success: false, error: 'No se proporcionaron datos de asistencia' };
  }

  // Crear carpeta con la fecha y hora actual
  const now = new Date();
  const folderName = now.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 16); // Formato: YYYY-MM-DD_HH-MM
    
  const reportsDir = path.join(os.homedir(), 'Documents', 'Reportes_Asistencia', folderName);
  
  try {
    // Crear el directorio si no existe
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const { rangoFechas, estadisticas, grupos } = data.data;
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {     
      const page = await browser.newPage();
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 2
      });
      // Función para generar el HTML de un día
      const generateDayHTML = (dia) => {
        const totalAsistencias = dia.asistencias?.length || 0;
        const asistenciasCompletas = dia.asistencias?.filter(a => a.estado === 'completo').length || 0;
        const asistenciasIncompletas = dia.asistencias?.filter(a => a.estado !== 'completo').length || 0;
        
        let html = `
          <div style="page-break-inside: avoid; margin-bottom: 5px; border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden;">
            <!-- Encabezado del día -->
            <div style="padding: 8px 16px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center;">
                  <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1e293b;">
                    ${dia.dia}, ${formatDate(dia.fecha)}
                  </h3>
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                  <div style="font-size: 14px; color: #475569; display: flex; gap: 8px;">
                    <span style="display: flex; align-items: center;">
                      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #22c55e; margin-right: 4px;"></span>
                      ${asistenciasCompletas} Completas
                    </span>
                    <span style="display: flex; align-items: center;">
                      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #eab308; margin-right: 4px;"></span>
                      ${asistenciasIncompletas} Incompletas
                    </span>
                  </div>
                  <span style="font-size: 12px; background-color: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 9999px;">
                    ${totalAsistencias} registros
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Tabla de asistencias -->
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead style="background-color: #f8fafc; font-size: 12px; text-transform: uppercase; color: #64748b; text-align: left;">
                  <tr>
                    <th style="padding: 6px 12px; font-weight: 500;">Empleado</th>
                    <th style="padding: 6px 12px; font-weight: 500; text-align: center;">Grupo</th>
                    <th style="padding: 6px 12px; font-weight: 500; text-align: center;">Entrada</th>
                    <th style="padding: 6px 12px; font-weight: 500; text-align: center;">Salida</th>
                    <th style="padding: 6px 12px; font-weight: 500; text-align: center;">Estado</th>
                  </tr>
                </thead>
                <tbody style="font-size: 13px;">
                  ${dia.asistencias?.map(asistencia => {
                    const estadoStyles = {
                      'completo': 'background-color: #dcfce7; color: #166534;',
                      'sin_entrada': 'background-color: #fef9c3; color: #854d0e;',
                      'sin_salida': 'background-color: #fef9c3; color: #854d0e;',
                      'ausente': 'background-color: #fee2e2; color: #991b1b;'
                    };
                    const estadoText = {
                      'completo': 'completo',
                      'sin_entrada': 'sin entrada',
                      'sin_salida': 'sin salida',
                      'ausente': 'ausente'
                    };
                    
                    return `
                      <tr style="border-top: 1px solid #e2e8f0;">
                        <td style="padding: 6px 12px; color: #1e293b;">
                          ${asistencia.nombre} ${asistencia.apellido}
                        </td>
                        <td style="padding: 6px 12px; text-align: center; color: #475569;">
                          ${asistencia.grupo || '-'}
                        </td>
                        <td style="padding: 6px 12px; text-align: center; font-family: monospace; color: #475569;">
                          ${formatTime(asistencia.entrada)}
                        </td>
                        <td style="padding: 6px 12px; text-align: center; font-family: monospace; color: #475569;">
                          ${formatTime(asistencia.salida)}
                        </td>
                        <td style="padding: 6px 12px; text-align: center;">
                          <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 12px; ${estadoStyles[asistencia.estado] || ''}">
                            ${estadoText[asistencia.estado] || asistencia.estado}
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
        
        return html;
      };
      
      const allDaysHTML = rangoFechas.map(generateDayHTML).join('');

      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Asistencia</title>
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 0;
            margin: 0;
          }
          .header {
            text-align: center;
            padding-bottom: 16px;
          }
          .header h1 {
            margin: 0;
            color: #1e40af;
            font-size: 24px;
          }
          .header p {
            margin: 8px 0 0;
            color: #64748b;
            font-size: 14px;
          }
          .stats {
            display: flex;
            justify-content: space-around;
            background-color: #f8fafc;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 5px;
            font-size: 14px;
          }
          .stat-item {
            text-align: center;
          }
          .stat-value {
            font-size: 20px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 4px;
          }
          .stat-label {
            color: #64748b;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .page-break {
            page-break-after: always;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Asistencia</h1>
          <p>Generado el ${formatDate(now)} a las ${now.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
        <div class="stats">
          <div class="stat-item">
            <div class="stat-value">${estadisticas.totalDias}</div>
            <div class="stat-label">Días</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${estadisticas.totalEmpleados}</div>
            <div class="stat-label">Empleados</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${estadisticas.totalAsistencias}</div>
            <div class="stat-label">Registros</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${estadisticas.porcentajeAsistencia}</div>
            <div class="stat-label">Asistencia</div>
          </div>
        </div>
        ${allDaysHTML}
      </body>
      </html>
    `;

      await page.setContent(html, { waitUntil: 'domcontentloaded' });
        
      const pdfPath = path.join(reportsDir, `reporte_completo.pdf`);
      
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '20mm'
        }
      });
      console.log(`Reporte generado: ${pdfPath}`);
      
      await browser.close();
      
      return { success: true, path: pdfPath,error: null };
    } catch (error) {
      await browser.close();
      console.error('Error al generar el PDF:', error);
      return { success: false, error: {...error,path:reportsDir} };
    }
    
  } catch (error) {
    console.error('Error al crear el directorio de reportes:', reportsDir);
    return { success: false, error: {...error,path:reportsDir} };
  }
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1080,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    title: process.env.DB_USER,
    webPreferences: { 
      enablePreferredSizeMode: true,
      nodeIntegration: true, // Permite usar módulos de Node.js en el renderizador (si lo necesitas)
      contextIsolation: true, // Desactiva el aislamiento de contexto (cuidado con esto en producción)
      preload: `${path.join(__dirname)}/preload.js`, // Ruta al archivo preload.js
      enableRemoteModule: true, // Habilita el módulo remoto (si lo necesitas)

    }
  });

  console.log('Creating window...');
  console.log('isDev:', isDev);
  console.log('App directory:', `${path.join(__dirname)}/dist/index.html`);

  const startURL = isDev
    ? 'http://localhost:5173'
    : `${path.join(__dirname)}/dist/index.html`;

  win.loadURL(startURL);
};

app.whenReady().then(async () => {
  try {
    // initialization();
    await db.syncDatabase();
    ipcMain.handle('login', handleLogin)
    ipcMain.handle('getGroups', handleGetGroups)
    ipcMain.handle('createUser', createUser)
    ipcMain.handle('getUsers', handleGetUsers)
    ipcMain.handle('editUser', editUser)
    ipcMain.handle('deleteUser', deleteUser)
    ipcMain.handle('getLastUserActivity', getLastUserActivity)
    ipcMain.handle('markAttendance', markAttendance)
    ipcMain.handle('getLast10UserActivities', getLast10UserActivities)
    ipcMain.handle('getAllUserActivities', getAllUserActivities)
    ipcMain.handle('createGroup', createGroup)
    ipcMain.handle('editGroup', editGroup)
    ipcMain.handle('deleteGroup', deleteGroup)
    ipcMain.handle('calculateAttendance', calculateAttendance)
    ipcMain.handle('generateTestAttendances', generateTestAttendances)
    ipcMain.handle('printReport', handlePrintReport)
    // ipcMain.handle('printReport', handlePrintReport)
    // ipcMain.handle('createHorario', createHorario)
    //ipcMain.handle('deleteHorario', deleteHorario)
    // ipcMain.handle('getHorarios', getHorarios)

  } catch (error) {
    console.error('Error setting up IPC handler:', error);
  }
  console.log('App is ready, creating window...');
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});