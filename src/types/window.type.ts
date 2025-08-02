import type { User, editUserProps, createUserProps } from ".";
import type { AttendanceRecord } from '.'

interface AttendanceActivitiesResponse {
  success: boolean;
  message?: string;
  error?: string;
  activities?: AttendanceRecord[];
}

export interface Api {
  setTitle: (title: string) => void;
  login: (credentials: { username: string; password: string }) => Promise<
    {
      error: string | null;
      success: boolean;
      token: string;
      user: User | null;
    }>;
  getGroups: () => {
    success: boolean;
    error?: unknown;
    groups: {
      id_grupo: string,
      nombre_grupo: string,
    }[];
  },
  getUsers: () => {
    success: boolean;
    error?: unknown;
    users: User[];
  },
  createUser: (user: createUserProps) => Promise<{
    success: boolean;
    error: unknown | null;
    newUser?: User | null;
    message?: string;
  }>,
  deleteUser: (id_empleado: number) => Promise<{ success: boolean; error: unknown | null; message?: string; }>,
  editUser: (user: editUserProps) => Promise<{
    success: boolean;
    error: unknown | null;
    updatedUser?: User;
    message?: string;
  }>;
  // Trae la la última actividad del usuario (ahora devuelve un array 'activities')
  getLastUserActivity: (id_empleado: number) => Promise<AttendanceActivitiesResponse>;

  // Trae las últimas 10 actividades del usuario
  getLast10UserActivities: (id_empleado: number) => Promise<AttendanceActivitiesResponse>;

  // Trae todas las actividades del usuario
  getAllUserActivities: (id_empleado: number) => Promise<AttendanceActivitiesResponse>;
  markAttendance: (data: {
    id_empleado: number;
    tipo_accion: 'entrada' | 'salida';
  }) => Promise<{
    success: boolean;
    message: string;
    error?: unknown;
    record?: {
      id_registro: number;
      id_empleado: number;
      tipo_accion: 'entrada' | 'salida';
      fecha_hora: string;
    };
  }>;
}