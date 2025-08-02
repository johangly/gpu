// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useAttendanceData } from '../hooks/useAttendanceData';
// import { getStatusColor, getStatusIcon, getStatusLabel } from '../utils/statusUtils';
// import ProgressBar from '../components/ProgressBar';
// import GroupFilter from '../components/GroupFilter';
// import { fetchGroups } from '../utils/getGroups';
// import type { Group } from '../types';
// const Reports: React.FC = () => {
//   const [selectedReport, setSelectedReport] = useState('daily');
//   const [selectedGroup, setSelectedGroup] = useState('all');
//   const { employees, groupData } = useAttendanceData();
//   const [groups, setGroups] = useState<Group[]>([]);

//   const filteredEmployees = selectedGroup === 'all' 
//     ? employees 
//     : employees.filter(emp => emp.department.toLowerCase() === selectedGroup);

//   React.useEffect(() => {
//     const fetchData = async () => {
//       const groups = await fetchGroups();
//       setGroups(groups);
//     };
//     fetchData();
//   }, []);

//   const reportTypes = [
//     { id: 'daily', label: 'Diario' },
//     { id: 'weekly', label: 'Semanal' },
//     { id: 'monthly', label: 'Mensual' }
//   ];

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: 0.3 }}
//       className="space-y-8"
//     >
//       <div>
//         <motion.h1 
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="text-3xl font-bold text-gray-900 mb-2"
//         >
//           Reportes
//         </motion.h1>
//         <motion.p 
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="text-gray-600"
//         >
//           Análisis detallado de asistencia por períodos
//         </motion.p>
//       </div>

//       <GroupFilter groups={groups} selectedGroup={selectedGroup} onGroupChange={setSelectedGroup} />

//       {/* Report Type Selector */}
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.2 }}
//         className="flex space-x-2"
//       >
//         {reportTypes.map((report, index) => (
//           <motion.button
//             key={report.id}
//             initial={{ opacity: 0, x: -10 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.3 + index * 0.1 }}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => setSelectedReport(report.id)}
//             className={`px-6 py-3 rounded-lg transition-all duration-200 ${
//               selectedReport === report.id
//                 ? 'bg-indigo-600 text-white shadow-lg'
//                 : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
//             }`}
//           >
//             {report.label}
//           </motion.button>
//         ))}
//       </motion.div>

//       {/* Report Content */}
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={selectedReport}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           exit={{ opacity: 0, y: -20 }}
//           transition={{ duration: 0.3 }}
//           className="bg-white rounded-xl shadow-lg p-6"
//         >
//           <h3 className="text-xl font-semibold mb-6 text-gray-800">
//             Reporte {selectedReport === 'daily' ? 'Diario' : selectedReport === 'weekly' ? 'Semanal' : 'Mensual'}
//           </h3>
          
//           {selectedReport === 'daily' && (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-gray-200">
//                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Empleado</th>
//                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Departamento</th>
//                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Entrada</th>
//                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Salida</th>
//                     <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredEmployees.map((employee, index) => {
//                     const StatusIcon = getStatusIcon(employee.status);
//                     return (
//                       <motion.tr
//                         key={employee.id}
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: index * 0.1 }}
//                         className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
//                       >
//                         <td className="py-4 px-4">
//                           <div>
//                             <div className="font-medium text-gray-900">{employee.name}</div>
//                             <div className="text-sm text-gray-500">{employee.position}</div>
//                           </div>
//                         </td>
//                         <td className="py-4 px-4 text-gray-700">{employee.department}</td>
//                         <td className="py-4 px-4 text-gray-700">{employee.checkIn || '-'}</td>
//                         <td className="py-4 px-4 text-gray-700">{employee.checkOut || '-'}</td>
//                         <td className="py-4 px-4">
//                           <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
//                             {StatusIcon && <StatusIcon className="w-3 h-3" />}
//                             <span>{getStatusLabel(employee.status)}</span>
//                           </span>
//                         </td>
//                       </motion.tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           {selectedReport === 'weekly' && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {Object.entries(groupData).map(([key], index) => (
//                   <motion.div
//                     key={key}
//                     initial={{ opacity: 0, scale: 0.9 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ delay: index * 0.1 }}
//                     className="bg-gray-50 p-4 rounded-lg"
//                   >
//                     <h4 className="font-semibold text-gray-800 mb-3 capitalize">{key}</h4>
//                     <div className="space-y-2">
//                       <div className="flex justify-between">
//                         <span className="text-sm text-gray-600">Días asistidos</span>
//                         <span className="font-medium">4.8/5</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-sm text-gray-600">Promedio puntualidad</span>
//                         <span className="font-medium">96%</span>
//                       </div>
//                       <ProgressBar 
//                         percentage={96} 
//                         color="bg-green-500" 
//                         delay={index * 0.1}
//                       />
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {selectedReport === 'monthly' && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <motion.div 
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.1 }}
//                   className="bg-green-50 p-4 rounded-lg"
//                 >
//                   <h4 className="font-semibold text-green-800 mb-2">Días Trabajados</h4>
//                   <p className="text-2xl font-bold text-green-600">22/23</p>
//                   <p className="text-sm text-green-600">95.7% cumplimiento</p>
//                 </motion.div>
//                 <motion.div 
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.2 }}
//                   className="bg-red-50 p-4 rounded-lg"
//                 >
//                   <h4 className="font-semibold text-red-800 mb-2">Ausencias</h4>
//                   <p className="text-2xl font-bold text-red-600">1</p>
//                   <p className="text-sm text-red-600">Sin justificar</p>
//                 </motion.div>
//                 <motion.div 
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.3 }}
//                   className="bg-blue-50 p-4 rounded-lg"
//                 >
//                   <h4 className="font-semibold text-blue-800 mb-2">Permisos</h4>
//                   <p className="text-2xl font-bold text-blue-600">0</p>
//                   <p className="text-sm text-blue-600">Autorizados</p>
//                 </motion.div>
//               </div>
//             </div>
//           )}
//         </motion.div>
//       </AnimatePresence>
//     </motion.div>
//   );
// };

// export default Reports;