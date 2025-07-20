import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color,
  delay = 0 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.02, y: -2 }}
    className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <motion.p 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.2 }}
          className={`text-3xl font-bold ${color}`}
        >
          {value}
        </motion.p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <motion.div 
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ delay: delay + 0.1 }}
        className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}
      >
        <Icon className={`w-6 h-6 ${color}`} />
      </motion.div>
    </div>
  </motion.div>
);

export default React.memo(MetricCard);