import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  percentage: number;
  color: string;
  height?: string;
  delay?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  percentage, 
  color, 
  height = 'h-3',
  delay = 0 
}) => (
  <div className={`w-full bg-gray-200 rounded-full ${height}`}>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(percentage, 100)}%` }}
      transition={{ duration: 1, ease: "easeOut", delay }}
      className={`${height} rounded-full ${color}`}
    />
  </div>
);

export default React.memo(ProgressBar);