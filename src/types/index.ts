export interface User {
  id_empleado: number;
  cedula: string;
  nombre: string;
  apellido: string;
  usuario: string;
  grupo: SessionGroup;
  activo: boolean;
}
export interface Session {
  token: string;
  user: User
}

export interface SessionGroup {
  id_grupo: number;
  nombre_grupo: string;
  horarios: HorarioDia[] | [];
  actualizado_en: string;
  creado_en: string;
}

export interface createUserProps {
  cedula: string;
  nombre: string;
  apellido: string;
  usuario: string;
  clave: string | '';
  grupo: SessionGroup;
}
export type SelectedUserType = editUserProps;

export type editUserProps = User & {
  clave?: string; // La propiedad 'clave' es opcional
};

export interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  checkIn?: string;
  checkOut?: string;
}

export interface AttendanceData {
  date: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
}

export interface GroupData {
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

export interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  menuItems: MenuItem[];
  user: User;
}

export interface Group {
  id_grupo: string,
  id_name: string,
  nombre_grupo: string,
  creado_en: string,
  actualizado_en: string,
}



export interface IpcResponse<T = undefined> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface AttendanceRecord {
  id_registro: number;
  id_empleado: number;
  tipo_accion: 'entrada' | 'salida';
  fecha_hora: string; // Considera usar `Date` si vas a manipularla como objeto Date
}

export interface HorarioDia {
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

// Define la interfaz para la estructura completa de datos del formulario
export interface HorarioFormData {
  nombre_grupo: string;
  horarios: HorarioDia[];
}

// tipos de reportes

export interface EstadisticasAsistencia {
  totalDias: number;
  totalEmpleados: number;
  totalAsistencias: number;
  porcentajeAsistencia: string;
}

export interface HorarioGrupo {
  id_horario: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

export interface GrupoConHorario {
  id_grupo: number;
  nombre_grupo: string;
  horario: HorarioGrupo[];
}

export interface DiaAsistencia {
  fecha: string;
  dia: string;
  asistencias: {
    id_empleado: number;
    nombre: string;
    apellido: string;
    grupo: string;
    asistio: boolean;
    entrada: string | null;
    salida: string | null;
    estado: 'completo' | 'sin_entrada' | 'sin_salida' | 'ausente';
  }[];
}

export interface CalculateAttendanceResponse {
  success: boolean;
  data: {
    rangoFechas: DiaAsistencia[];
    estadisticas: EstadisticasAsistencia;
    grupos: GrupoConHorario[];
  };
  message: string;
  error?: Error;
}