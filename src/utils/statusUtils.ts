import { CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'present': return 'text-green-600 bg-green-100';
    case 'absent': return 'text-red-600 bg-red-100';
    case 'late': return 'text-yellow-600 bg-yellow-100';
    case 'leave': return 'text-blue-600 bg-blue-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'present': return CheckCircle;
    case 'absent': return XCircle;
    case 'late': return AlertCircle;
    case 'leave': return Calendar;
    default: return null;
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'present': return 'Presente';
    case 'absent': return 'Ausente';
    case 'late': return 'Tardanza';
    case 'leave': return 'Permiso';
    default: return status;
  }
};