import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { BookMarked } from 'lucide-react';
import toast from 'react-hot-toast';
interface AddGroupProps {
  onAddGroup: (nombre_grupo:string) => Promise<{ success: boolean; message?: string }>;
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

const AddGroup: React.FC<AddGroupProps> = ({ onAddGroup }) => {

  const [formData, setFormData] = useState({
    nombre_grupo: '',
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
    if (formData.nombre_grupo === '') {
      toast.error('El campo de nombre no puede estar vacio')
    }
    const response = await onAddGroup(formData.nombre_grupo);

    if (response.success === true) {
      setFormData({
        nombre_grupo: '',
      });
      setFocusedField(null);
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
            {inputs.map((input) => {
              return (
                <motion.div key={input.id} className={twMerge("relative")} animate={{ scale: focusedField === input.id ? 1.02 : 1 }}>
                  <div
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${focusedField === input.id ? 'text-theme-3 scale-110' : 'text-slate-400'
                      }`}
                  >
                    {input.icon && React.createElement(input.icon, { className: 'w-5 h-5' })}
                  </div>
                  <input
                    type={input.type}
                    id={input.id}
                    name={input.id}
                    value={formData[input.id as keyof typeof formData]}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField(input.id ?? null)}
                    onBlur={() => setFocusedField(null)}
                    className={twMerge("w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none transition-all duration-300 text-slate-800 placeholder-slate-400", focusedField === input.id ? 'border-theme-3 bg-white' : '')}
                    placeholder={input.placeholder}
                    required
                  />
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        {/* Botón de Envío */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          type="submit"
          className="w-full bg-theme-3 text-white font-bold py-3 px-4 rounded-md shadow-lg hover:bg-theme-3 focus:outline-none focus:ring-2 focus:ring-theme-3 focus:ring-opacity-75 transition-colors duration-200 transform cursor-pointer"
        >
          Crear Grupo
        </motion.button>
      </form>
    </div>
  );
};

export { AddGroup };