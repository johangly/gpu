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
  icon: React.ComponentType<any>;
  path: string;
  badge?: number;
}

export interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  menuItems: MenuItem[];
}