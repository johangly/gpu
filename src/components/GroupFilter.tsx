import React from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import type { SessionGroup } from '../types';  
interface GroupFilterProps {
  selectedGroup: number;
  onGroupChange: (group: number) => void;
  groups: SessionGroup[];
  children?: React.ReactNode;
}

const GroupFilter: React.FC<GroupFilterProps> = ({ groups,selectedGroup, onGroupChange,children }) => {


  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-8 flex flex-col gap-y-3"
    >
      <div className="flex items-center space-x-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <div className="flex space-x-2">
          {groups && groups.length > 0 && groups.map((group, index) => (
            <motion.button
              key={group.id_grupo}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onGroupChange(group.id_grupo)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedGroup === group.id_grupo
                  ? 'bg-theme-3-900 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
              }`}
            >
              {group.nombre_grupo}
            </motion.button>
          ))}
        </div>
      </div>
      {children ? children : null}
    </motion.div>
  );
};

export default React.memo(GroupFilter);