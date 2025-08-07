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