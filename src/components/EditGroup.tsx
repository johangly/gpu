import React, { useState } from 'react';
import type { SessionGroup } from '../types';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { BookMarked, type LucideIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface EditUserProps {
  onEditGroup: (nombre_grupo:string, id_grupo:number) => Promise<{ success: boolean; message?: string }>;
  selectedGroup: SessionGroup;
}

const inputs = [
  {
    id: 'nombre_grupo',
    label: 'Nombre Grupo',
    type: 'text',
    placeholder: 'Nombre Grupo',
    icon: BookMarked,
  },
]

const EditGroup: React.FC<EditUserProps> = ({ onEditGroup, selectedGroup }) => {

  const [formData, setFormData] = useState<{nombre_grupo:string}>({
    nombre_grupo: selectedGroup ? selectedGroup.nombre_grupo : '',
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedGroup && Number(selectedGroup.id_grupo) !== 0) {
      const response = await onEditGroup(formData.nombre_grupo,selectedGroup.id_grupo);

      if (response.success === true) {
        setFormData({
          nombre_grupo: '',
        });
        setFocusedField(null);
      }
      
      console.log('EditGroup response:', response);
    } else {
      toast.error('No se pudo editar el usuario. Asegúrate de que el usuario esté seleccionado correctamente.');
    }

  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Sección del Select */}
        <div className='flex flex-col justify-center'>
          <motion.div variants={itemVariants} className='flex flex-col gap-y-4 mb-4'>
            {inputs.map((input) => (
              <InputGroup
                key={input.id}
                inputConfig={input}
                formData={formData}
                focusedField={focusedField}
                setFocusedField={setFocusedField}
                handleInputChange={handleInputChange}
              />
            ))}
          </motion.div>
        </div>

        {/* Botón de Envío */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          type="submit"
          className="w-full bg-theme-3 text-white font-bold py-3 px-4 rounded-md shadow-lg hover:bg-theme-3 focus:outline-none focus:ring-2 focus:ring-theme-3 focus:ring-opacity-75 transition-colors duration-200 transform cursor-pointer"
        >
          Actualizar Usuario
        </motion.button>
      </form>
    </div>
  );
};

interface InputConfig {
  id: string; // La propiedad id ahora es obligatoria para todos los inputs
  label: string;
  type: string;
  placeholder: string;
  icon: LucideIcon;
}

const InputGroup: React.FC<{  
  inputConfig: InputConfig;
  formData: {nombre_grupo:string};
  focusedField: string | null;
  setFocusedField: (id: string | null) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ inputConfig, formData, focusedField, setFocusedField, handleInputChange }) => {
  // Renderiza un input normal por defecto
  return (
    <motion.div
      className={twMerge("relative")}
      animate={{ scale: focusedField === inputConfig.id ? 1.02 : 1 }}
    >
      <div
        className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${focusedField === inputConfig.id ? 'text-theme-3 scale-110' : 'text-slate-400'
          }`}
      >
        {inputConfig.icon && React.createElement(inputConfig.icon, { className: 'w-5 h-5' })}
      </div>
      <input
        type={inputConfig.type}
        id={inputConfig.id}
        name={inputConfig.id}
        // Corrección: Convertir el valor a string para evitar errores de tipo
        value={String(formData[inputConfig.id as keyof typeof formData] || '')}
        onChange={handleInputChange}
        onFocus={() => setFocusedField(inputConfig.id)}
        onBlur={() => setFocusedField(null)}
        className={twMerge("w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none transition-all duration-300 text-slate-800 placeholder:text-slate-400 placeholder:font-regular", focusedField === inputConfig.id ? 'border-theme-3 bg-white' : '')}
        placeholder={inputConfig.placeholder}
        required
      />
    </motion.div>
  );
};


export { EditGroup };