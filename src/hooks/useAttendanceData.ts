import { useMemo } from 'react';
import { Employee, AttendanceData, GroupData } from '../types';

export const useAttendanceData = () => {
  const groupData: Record<string, GroupData> = useMemo(() => ({
    administrativo: {
      total: 25,
      present: 22,
      absent: 2,
      late: 1,
      leave: 0
    },
    docente: {
      total: 48,
      present: 45,
      absent: 1,
      late: 2,
      leave: 0
    },
    obrero: {
      total: 15,
      present: 14,
      absent: 0,
      late: 1,
      leave: 0
    }
  }), []);

  const employees: Employee[] = useMemo(() => [
    { id: '1', name: 'Dr. Ana García', department: 'Docente', position: 'Profesor Titular', status: 'present', checkIn: '08:00', checkOut: '16:30' },
    { id: '2', name: 'María López', department: 'Administrativo', position: 'Secretaria', status: 'present', checkIn: '07:45', checkOut: '15:45' },
    { id: '3', name: 'Carlos Rodríguez', department: 'Obrero', position: 'Mantenimiento', status: 'late', checkIn: '08:15' },
    { id: '4', name: 'Ing. Pedro Martínez', department: 'Docente', position: 'Profesor Asistente', status: 'absent' },
    { id: '5', name: 'Laura Hernández', department: 'Administrativo', position: 'Contadora', status: 'present', checkIn: '08:00', checkOut: '16:00' },
    { id: '6', name: 'Dr. Roberto Silva', department: 'Docente', position: 'Profesor Asociado', status: 'present', checkIn: '09:00', checkOut: '17:00' },
    { id: '7', name: 'Carmen Ruiz', department: 'Administrativo', position: 'Recursos Humanos', status: 'leave' },
    { id: '8', name: 'José Morales', department: 'Obrero', position: 'Seguridad', status: 'present', checkIn: '06:00', checkOut: '14:00' },
  ], []);

  const weeklyData: AttendanceData[] = useMemo(() => [
    { date: 'Lun', present: 81, absent: 3, late: 4, leave: 0 },
    { date: 'Mar', present: 83, absent: 2, late: 3, leave: 0 },
    { date: 'Mié', present: 85, absent: 1, late: 2, leave: 0 },
    { date: 'Jue', present: 82, absent: 3, late: 3, leave: 0 },
    { date: 'Vie', present: 80, absent: 4, late: 4, leave: 0 },
  ], []);

  const getTotalData = useMemo(() => {
    const total = groupData.administrativo.total + groupData.docente.total + groupData.obrero.total;
    const present = groupData.administrativo.present + groupData.docente.present + groupData.obrero.present;
    const absent = groupData.administrativo.absent + groupData.docente.absent + groupData.obrero.absent;
    const late = groupData.administrativo.late + groupData.docente.late + groupData.obrero.late;
    const leave = groupData.administrativo.leave + groupData.docente.leave + groupData.obrero.leave;
    
    return { total, present, absent, late, leave };
  }, [groupData]);

  const getFilteredData = (selectedGroup: string) => {
    if (selectedGroup === 'all') return getTotalData;
    return groupData[selectedGroup as keyof typeof groupData];
  };

  return {
    groupData,
    employees,
    weeklyData,
    getTotalData,
    getFilteredData
  };
};