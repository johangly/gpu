import React from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';

interface GroupFilterProps {
  selectedGroup: string;
  onGroupChange: (group: string) => void;
}

const groups = [
  { id: 'all', label: 'Todos' },
  { id: 'administrativo', label: 'Administrativo' },
  { id: 'docente', label: 'Docente' },
  { id: 'obrero', label: 'Obrero' }
];

const GroupFilter: React.FC<GroupFilterProps> = ({ selectedGroup, onGroupChange }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-8"
    >
      <div className="flex items-center space-x-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <div className="flex space-x-2">
          {groups.map((group, index) => (
            <motion.button
              key={group.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onGroupChange(group.id)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedGroup === group.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400'
              }`}
            >
              {group.label}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(GroupFilter);