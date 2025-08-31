import type { User, editUserProps, createUserProps, SessionGroup, HorarioFormData } from ".";
import type { AttendanceRecord,CalculateAttendanceResponse } from '.'

interface AttendanceActivitiesResponse {
  success: boolean;
  message?: string;
  error?: string;
  activities: AttendanceRecord[];
}

interface AttendanceAllActivitiesResponse {
  success: boolean;
  message?: string;
  error?: string;
  activities: ActivitiesProps[];
}
export interface ActivitiesProps extends AttendanceRecord {
  empleado: User
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
    groups: SessionGroup[];
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
  getAllUserActivities: () => Promise<AttendanceAllActivitiesResponse>;
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
  createGroup: (data:HorarioFormData) => Promise<{ success: boolean; error: unknown | null; newGroup?: SessionGroup; message?: string; }>,
  editGroup: (group:{nombre_grupo:string, id_grupo:number}) => Promise<{ success: boolean; error: unknown | null; updatedGroup?: SessionGroup; message?: string; }>,
  deleteGroup: (id_grupo: number) => Promise<{ success: boolean; error: unknown | null; message?: string; }>,
  calculateAttendance: (data: { fechaInicio: string; fechaFin: string }) => Promise<CalculateAttendanceResponse>,
  generateTestAttendances: () => Promise<{ success: boolean; error: unknown | null; message?: string; }>,
  printReport: (data: CalculateAttendanceResponse | null) => Promise<{ success: boolean; error: unknown | null; message?: string; }>,
}