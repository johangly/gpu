import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAttendanceData } from '../hooks/useAttendanceData';
import MetricCard from '../components/MetricCard';
import ProgressBar from '../components/ProgressBar';
import GroupFilter from '../components/GroupFilter';
import { fetchGroups } from '../utils/getGroups';

const Overview: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const { groupData, weeklyData, getFilteredData } = useAttendanceData();
  const filteredData = getFilteredData(selectedGroup.toLowerCase());

  const [groups, setGroups] = useState<{
    id_grupo: string,
    id_name: string,
    nombre_grupo: string,
    creado_en: string,
    actualizado_en: string,
  }[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const groups = await fetchGroups();
      setGroups(groups);
    };
    fetchData();
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          Vista General
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600"
        >
          Resumen de asistencia del personal universitario
        </motion.p>
      </div>

      <GroupFilter groups={groups} selectedGroup={selectedGroup} onGroupChange={setSelectedGroup} />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Personal"
          value={filteredData.total}
          subtitle="Empleados registrados"
          icon={Users}
          color="text-blue-600"
          delay={0.1}
        />
        <MetricCard
          title="Presentes Hoy"
          value={filteredData.present}
          subtitle={`${((filteredData.present / filteredData.total) * 100).toFixed(1)}% asistencia`}
          icon={CheckCircle}
          color="text-green-600"
          delay={0.2}
        />
        <MetricCard
          title="Ausentes"
          value={filteredData.absent}
          subtitle="Sin justificar"
          icon={XCircle}
          color="text-red-600"
          delay={0.3}
        />
        <MetricCard
          title="Tardanzas"
          value={filteredData.late}
          subtitle="Llegadas tarde"
          icon={Clock}
          color="text-yellow-600"
          delay={0.4}
        />
      </div>

      {/* Weekly Progress */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white p-6 rounded-xl shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Asistencia Semanal</h3>
        <div className="space-y-4">
          {weeklyData.map((day, index) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center space-x-4"
            >
              <div className="w-12 text-sm font-medium text-gray-600">{day.date}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Presentes: {day.present}</span>
                  <span className="text-sm text-gray-600">{((day.present / 88) * 100).toFixed(1)}%</span>
                </div>
                <ProgressBar 
                  percentage={(day.present / 88) * 100} 
                  color="bg-green-500" 
                  delay={0.7 + index * 0.1}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(groupData).map(([key, data], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <h4 className="text-lg font-semibold mb-4 text-gray-800 capitalize">{key}</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-green-600 flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Presentes</span>
                </span>
                <span className="font-semibold">{data.present}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-600 flex items-center space-x-1">
                  <XCircle className="w-4 h-4" />
                  <span>Ausentes</span>
                </span>
                <span className="font-semibold">{data.absent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-600 flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Tardanzas</span>
                </span>
                <span className="font-semibold">{data.late}</span>
              </div>
              <div className="pt-2 border-t">
                <ProgressBar 
                  percentage={(data.present / data.total) * 100} 
                  color="bg-blue-500"
                  delay={0.9 + index * 0.1}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {((data.present / data.total) * 100).toFixed(1)}% asistencia
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Overview;