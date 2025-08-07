import React, { useState } from 'react';
import type { SessionGroup } from '../types';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { User as UserIcon, Eye, EyeOff, Lock, IdCard, CircleUserRound, IdCardLanyard } from 'lucide-react';
// import scrollText from '../assets/scroll-text.png';
import { CustomSelectWithIcons } from './CustomSelect';
import type { OptionType } from './CustomSelect';
import type { createUserProps } from '../types';
import validarCedula from '../utils/validarCedula';
import toast from 'react-hot-toast';
interface AddUserProps {
  groups: SessionGroup[];
  onAddUser: (user: createUserProps) => Promise<{ success: boolean; message?: string }>;
}

const inputs = [
  {
    type: 'group',
    inputs: [
      {
        id: 'nombre',
        label: 'Nombre',
        type: 'text',
        placeholder: 'Nombre',
        icon: UserIcon,
      },
      {
        id: 'apellido',
        label: 'Apellido',
        type: 'text',
        placeholder: 'Apellido',
        icon: IdCardLanyard,
      }
    ]
  },
  {
    id: 'usuario',
    label: 'Usuario',
    type: 'text',
    placeholder: 'Usuario',
    icon: CircleUserRound,
  },
  {
    id: 'cedula',
    label: 'Cedula',
    type: 'text',
    placeholder: 'Cédula',
    icon: IdCard,
  },
  {
    id: 'clave',
    label: 'Clave',
    type: 'password',
    placeholder: 'Clave',
    icon: Lock,
  }
]
const icons = {
  0: 'ScrollText',
  1: 'ShieldUser',
  2: 'GraduationCap',
  3: 'Hammer',
}

const AddUser: React.FC<AddUserProps> = ({ groups, onAddUser }) => {

  // Opciones de ejemplo con iconos
  const options: OptionType[] = [
    ...groups.map(group => ({
      id: group.id_grupo,
      value: group.id_grupo,
      label: group.nombre_grupo,
      icon: icons[group.id_grupo as keyof typeof icons] ? icons[group.id_grupo as keyof typeof icons] : undefined, // Asigna el icono si existe
    })),
  ];

  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null); // Inicializa con la primera opción o null

  // Función para manejar el cambio de opción
  const handleOptionChange = (option: OptionType) => {
    setSelectedOption(option);
    console.log('Opción seleccionada:', option);
  };

  const [formData, setFormData] = useState({
    usuario: '',
    nombre: '',
    apellido: '',
    cedula: '',
    clave: ''
  });

  const [showPassword, setShowPassword] = useState(false);
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

    if (!validarCedula(formData.cedula)) {
      toast.error('Cédula inválida. Debe comenzar con "V" o "E" y tener entre 7 y 9 dígitos.');
      return;
    }

    if (selectedOption === null) {
      toast.error('Grupo no seleccionado. Debe seleccionar un grupo para crear el usuario.');
      return;
    }

    if (formData.clave === '' || formData.clave.length < 6) {
      toast.error('La clave debe tener al menos 6 caracteres.');
      return;
    }

    if (formData.apellido === '') {
      toast.error('El campo de Apellido no puede estar vacio')
    }

    if (formData.nombre === '') {
      toast.error('El campo de nombre no puede estar vacio')
    }

    if (formData.usuario === '') {
      toast.error('El campo de Usuario no puede estar vacio')
    }

    const response = await onAddUser({
      cedula: formData.cedula,
      nombre: formData.nombre,
      apellido: formData.apellido,
      usuario: formData.usuario,
      clave: formData.clave ? formData.clave : '',
      grupo: {
        id_grupo: selectedOption ? selectedOption.id : 0,
        nombre_grupo: selectedOption ? selectedOption.label : '',
        creado_en: '',
        actualizado_en: '',
      },
    });

    if (response.success === true) {
      setFormData({
        usuario: '',
        nombre: '',
        apellido: '',
        cedula: '',
        clave: ''
      });
      setSelectedOption(null);
      setFocusedField(null);
      setShowPassword(false);
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
          <CustomSelectWithIcons
            options={options}
            selectedOption={selectedOption}
            onSelect={handleOptionChange}
            placeholder="Selecciona una opción..."
          />
          <motion.div variants={itemVariants} className='flex flex-col gap-y-4'>
            {inputs.map((input) => {
              if (input.type === 'group' && Array.isArray(input.inputs)) {
                return (
                  <div className='flex gap-x-3'>
                    {input.inputs.map((subInput) => (
                      <motion.div key={subInput.id} className={twMerge("relative w-full")} animate={{ scale: focusedField === subInput.id ? 1.02 : 1 }}>
                        <div
                          className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${focusedField === subInput.id ? 'text-theme-3 scale-110' : 'text-slate-400'
                            }`}
                        >
                          {subInput.icon && React.createElement(subInput.icon, { className: 'w-5 h-5' })}
                        </div>
                        <input
                          type={subInput.type}
                          id={subInput.id}
                          name={subInput.id}
                          value={formData[subInput.id as keyof typeof formData]}
                          onChange={handleInputChange}
                          onFocus={() => setFocusedField(subInput.id ?? null)}
                          onBlur={() => setFocusedField(null)}
                          className={twMerge("w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none transition-all duration-300 text-slate-800 placeholder:text-slate-400 placeholder:font-regular", focusedField === subInput.id ? 'border-theme-3 bg-white' : '')}
                          placeholder={subInput.placeholder}
                          required
                        />
                      </motion.div>
                    ))}
                  </div>
                )
              } else {
                if (input.type === 'password') {
                  return (
                    <motion.div key={input.id} className={twMerge("relative")} animate={{ scale: focusedField === input.id ? 1.02 : 1 }}>
                      <div
                        className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${focusedField === input.id ? 'text-theme-3 scale-110' : 'text-slate-400'
                          }`}
                      >
                        {input.icon && React.createElement(input.icon, { className: 'w-5 h-5' })}
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
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
                      <motion.button
                        type="button"
                        onFocus={() => setFocusedField(input.id ?? null)}
                        onClick={() => { setShowPassword(!showPassword); setFocusedField(input.id ?? null) }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-theme-3 transition-colors duration-200 cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </motion.button>
                    </motion.div>

                  )
                } else {
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
                }

              }

            })}
          </motion.div>
          <p className={twMerge("my-4 text-sm text-gray-600", !selectedOption && 'opacity-0')}>
            Has seleccionado: <span className="font-semibold text-blue-700">{selectedOption && selectedOption.label}</span>
            </p>
        </div>

        {/* Botón de Envío */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          type="submit"
          className="w-full bg-theme-3 text-white font-bold py-3 px-4 rounded-md shadow-lg hover:bg-theme-3 focus:outline-none focus:ring-2 focus:ring-theme-3 focus:ring-opacity-75 transition-colors duration-200 transform cursor-pointer"
        >
          Crear Usuario
        </motion.button>
      </form>
    </div>
  );
};

export { AddUser };