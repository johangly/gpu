export interface Session {
  token: string;
  user: {
    id_empleado: number;
    cedula: string;
    nombre: string;
    apellido: string;
    usuario: string;
    id_grupo: number;
    activo: boolean;
  }
}

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
}

export interface Group {
  id_grupo: string,
  id_name: string,
  nombre_grupo: string,
  creado_en: string,
  actualizado_en: string,
}