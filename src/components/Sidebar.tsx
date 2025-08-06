import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import type { SidebarProps } from '../types';
import logo from '../assets/logo-group.svg'
import { twMerge } from 'tailwind-merge';

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, menuItems, user }) => {

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 70 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-white shadow-xl border-r border-gray-200 flex flex-col relative z-10"
    >
      {/* Header with Logo */}
      <div className={twMerge("border-b border-gray-200 h-[92px]", isCollapsed ? "px-2 py-6" : "px-6 py-6")}>
        <div className="flex items-center justify-center gap-x-8">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center space-x-3"
                >
                  <img
                    src={logo}
                    alt="Universidad Logo"
                    className="w-10 h-10"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="text-center"
                >
                  <h2 className="text-lg font-bold text-gray-900">Universidad</h2>
                  <p className="text-xs text-gray-500">Sistema Digital</p>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          
          {isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: 0.2, type: "spring", bounce: 1 }}
              className="mx-auto transition-all"
            >
              <img 
                src={logo} 
                alt="Universidad Logo" 
                className="w-10 h-10"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow z-20"
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </motion.div>
      </button>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-3">
          {menuItems.map((item, index) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between flex-1"
                        >
                          <span className="font-medium">{item.label}</span>
                          {item.badge && item.badge !== 0 && item.badge > 0 ? (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className={`px-2 py-1 text-xs rounded-full ${
                                isActive 
                                  ? 'bg-white text-blue-600' 
                                  : 'bg-red-500 text-white'
                              }`}
                            >
                              {item.badge}
                            </motion.span>
                          ) : null}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        whileHover={{ opacity: 1, x: 0 }}
                        className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none"
                      >
                        {item.label}
                        {item.badge && item.badge !== 0 && item.badge > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-xs rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </>
                )}
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">AD</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user.nombre}</p>
                <p className="text-xs text-gray-500">{user.grupo?.nombre_grupo ? user.grupo?.nombre_grupo : ''}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center"
            >
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{user.nombre[0] + user.nombre[1]}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

export default React.memo(Sidebar);