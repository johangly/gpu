import React, { useState, useRef, useEffect } from 'react';
// Importa los iconos de Lucide React que vayas a usar
import { Home, User, Settings, Mail, ChevronDown, Check, ShieldUser, GraduationCap, Hammer, ScrollText } from 'lucide-react';

import type { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

interface CustomSelectWithIconsProps {
  options: OptionType[];
  selectedOption: OptionType | null;
  onSelect: (option: OptionType) => void;
  placeholder?: string; // 'placeholder' es opcional
  focusedField?: string | null; // 'focusedField' es opcional, puede ser un string que representa el campo enfocado
}

interface OptionType {
  id: number;
  value: number;
  label: string;
  icon?: string; // 'icon' es opcional, puede ser una cadena que representa el nombre del icono
}

// Componente CustomSelectWithIcons (ahora en TypeScript)
function CustomSelectWithIcons({ options, selectedOption, onSelect, placeholder = "Selecciona..." }: CustomSelectWithIconsProps) {
  const [isOpen, setIsOpen] = useState(false); // Estado para controlar si el desplegable está abierto
  const selectRef = useRef<HTMLDivElement>(null); // Referencia para detectar clics fuera del componente
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // Efecto para cerrar el desplegable cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Función para manejar la selección de una opción
  const handleSelectOption = (option: OptionType) => {
    onSelect(option);
    setIsOpen(false); // Cierra el desplegable después de seleccionar
  };

  const IconMap: { [key: string]: LucideIcon } = {
    Home,
    User,
    Settings,
    Mail,
    ShieldUser,
    GraduationCap,
    Hammer,
    ScrollText
    // Añade más iconos aquí si los necesitas en tus opciones
  };

  const selectElement = {
    rest: { opacity: 1 },
    hover: { opacity: 1 },
  }

  const selectElementIcon = {
    rest: { scale: 1 },
    hover: { scale: 1.1 },
  }

  const selectElementText = {
    rest: { scale: 1 },
    hover: { scale: 1.03 },
  }

  // Determina el icono y la etiqueta a mostrar en el botón principal
  const displayIconComponent = selectedOption && selectedOption.icon ? IconMap[selectedOption.icon] : IconMap['ScrollText']; // Usa 'ScrollText' como icono por defecto si no hay uno seleccionado
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className="relative w-full mb-4" ref={selectRef}>
      {/* Botón que muestra la opción seleccionada y abre/cierra el desplegable */}
      <button
        type="button"
        onFocus={() => setFocusedField('departamento')}
        onBlur={() => setFocusedField(null)}
        className={twMerge("flex items-center justify-between w-full pl-4 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none transition-all duration-300 text-slate-800 placeholder-slate-400", focusedField === 'departamento' ? 'border-theme-3 bg-white' : '')}
        // className="flex items-center justify-between w-full px-5 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center">
          {displayIconComponent && React.createElement(displayIconComponent, {
            className: `absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 w-5 h-5 ${focusedField === 'departamento' ? 'text-theme-3 scale-110' : 'text-slate-400'
          }` })}
          <span className={`${selectedOption ? 'text-gray-800' : 'text-slate-400'} pl-8 font-regular`}>
            {displayLabel}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </button>

      {/* Lista desplegable de opciones */}
      {isOpen && (
        <ul
          className="absolute z-10 w-full mt-2 bg-slate-50 border-2 border-theme-3 rounded-lg shadow-lg max-h-60 overflow-y-auto focus:outline-none animate-fade-in-down"
          tabIndex={-1} // Permite que la lista sea enfocable pero no en el orden de tabulación normal
          role="listbox"
          aria-labelledby="select-button"
        >
          {options.map((option) => {
            const IconComponent = option.icon ? IconMap[option.icon] : null; // IconComponent puede ser null
            const isSelected = selectedOption && selectedOption.value === option.value;
            if (option.value !== 0) {
              return (
                <motion.li
                  key={option.value}
                  className={`flex items-center px-4 py-3 cursor-pointer text-gray-800 group hover:bg-theme-3-100 hover:text-theme-3 transition duration-150 ease-in-out ${isSelected ? 'bg-theme-3-200 text-theme-3 font-semibold' : ''}`}
                  onClick={() => handleSelectOption(option)}
                  role="option"
                  variants={selectElement}
                  initial={"rest"}
                  whileHover={'hover'}
                  aria-selected={!!isSelected}
                >
                  {IconComponent && React.createElement(
                    motion(IconComponent), 
                    {
                      variants: selectElementIcon,
                      className: `w-5 h-5 group-hover:text-theme-3 mr-3 ${isSelected ? 'text-theme-3' : 'text-gray-500'}`
                    }
                  )}
                  {!IconComponent && <div className="w-5 h-5 mr-3"></div>} {/* Espacio para opciones sin icono */}
                  <motion.span variants={selectElementText}>{option.label}</motion.span>
                  {isSelected && (
                    <Check className="w-5 h-5 ml-auto text-theme-3" />
                  )}
                </motion.li>
              );
            }
          })}
        </ul>
      )}
    </div>
  );
}

export { CustomSelectWithIcons };
export type { OptionType };