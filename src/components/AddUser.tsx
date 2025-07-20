import React, { useState } from 'react';
import type { Group } from '../types';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { User, Eye, EyeOff, Lock, IdCard, } from 'lucide-react';
// import scrollText from '../assets/scroll-text.png';
import { CustomSelectWithIcons } from './CustomSelect';
import type { OptionType } from './CustomSelect';

interface AddUserProps {
  groups: Group[];
  onAddUser: (user: { name: string; email: string; group: string }) => void;
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
        icon: User,
      },
      {
        id: 'apellido',
        label: 'Apellido',
        type: 'text',
        placeholder: 'Apellido',
        icon: User,
      }
    ]
  },
  {
    id: 'usuario',
    label: 'Usuario',
    type: 'text',
    placeholder: 'Usuario',
    icon: User,
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
  'all': 'User',
  'administrativo': 'ShieldUser',
  'docente': 'GraduationCap',
  'obrero': 'Hammer',
}

const AddUser: React.FC<AddUserProps> = ({ groups, onAddUser }) => {
  // const [name, setName] = useState('');
  // const [email, setEmail] = useState('');

  // Opciones de ejemplo con iconos
  const options: OptionType[] = [
    ...groups.map(group => ({
      value: group.id_name,
      label: group.nombre_grupo,
      icon: icons[group.id_name as keyof typeof icons] ? icons[group.id_name as keyof typeof icons] : undefined, // Asigna el icono si existe
    })),

    // { value: 'dashboard', label: 'Dashboard', icon: 'Home' },
    // { value: 'profile', label: 'Mi Perfil', icon: 'User' },
    // { value: 'settings', label: 'Configuración', icon: 'Settings' },
    // { value: 'messages', label: 'Mensajes', icon: 'Mail' },
    // { value: 'logout', label: 'Cerrar Sesión', icon: 'User' }, // Ejemplo de icono repetido
    // { value: 'no-icon', label: 'Sin Icono' }, // Opción sin icono
  ];
  console.log('AddUser options:', options);
  console.log('AddUser groups:', groups);
  console.log('administrativo:', icons['administrativo']);
  const [selectedOption, setSelectedOption] = useState<OptionType>(options[0]); // Inicializa con la primera opción o null

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

  // const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   setSelectedOption(e.target.value);
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // if (name && email && selectedOption) {
    onAddUser({ name: formData.nombre, email: formData.cedula, group: selectedOption.value });
    //   setName('');
    //   setEmail('');
    //   setSelectedOption('');
    // }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };



  // `cedula` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Número de cédula del empleado (identificador único)',
  //   `nombre` VARCHAR(100) NOT NULL,
  //     `apellido` VARCHAR(100) NOT NULL,
  //       `usuario` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Nombre de usuario para el inicio de sesión',
  //         `clave` VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada del empleado',
  //           `id_grupo` INT NOT NULL COMMENT 'Clave foránea que referencia al grupo al que pertenece el empleado',
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección del Select */}
        <div className='flex flex-col justify-center gap-y-5'>
          {/* <label className="block text-lg font-medium text-gray-700 flex flex-col">
            
            <span className='text-left mb-2'>Departamento</span>
            <select
              id="departamento"
              // value={selectedOption}
              // onChange={handleSelectChange}
              onFocus={() => setFocusedField('departamento')}
              onBlur={() => setFocusedField(null)}
              className={twMerge("w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none transition-all duration-300 text-slate-800 placeholder-slate-400", focusedField === 'departamento' ? 'border-purple-500 bg-white' : '')}
            >
              {groups.map((el) => {
                if (el.id_name !== 'all') {
                  return (
                    <option key={el.id_grupo} value={el.id_name}>
                      <img src={scrollText} alt="Scroll" className='w-5 h-5 text-black' />{el.nombre_grupo}
                    </option>
                  );
                }
                return null;
              })}
            </select>
          </label> */}
          <CustomSelectWithIcons
            options={options}
            selectedOption={selectedOption}
            onSelect={handleOptionChange}
            placeholder="Selecciona una opción..."
          // focusedField={focusedField}
          />
          <motion.div variants={itemVariants} className='flex flex-col gap-y-4'>
            {inputs.map((input) => {
              if (input.type === 'group' && Array.isArray(input.inputs)) {
                return (
                  <div className='flex gap-x-3'>
                    {input.inputs.map((subInput) => (
                      <motion.div key={subInput.id} className={twMerge("relative w-full")} animate={{ scale: focusedField === subInput.id ? 1.02 : 1 }}>
                        <div
                          className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${focusedField === subInput.id ? 'text-purple-600 scale-110' : 'text-slate-400'
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
                          className={twMerge("w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none transition-all duration-300 text-slate-800 placeholder-slate-400", focusedField === subInput.id ? 'border-purple-500 bg-white' : '')}
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
                        className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${focusedField === input.id ? 'text-purple-600 scale-110' : 'text-slate-400'
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
                        className={twMerge("w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none transition-all duration-300 text-slate-800 placeholder-slate-400", focusedField === input.id ? 'border-purple-500 bg-white' : '')}
                        placeholder={input.placeholder}
                        required
                      />
                      <motion.button
                        type="button"
                        onFocus={() => setFocusedField(input.id ?? null)}
                        onClick={() => { setShowPassword(!showPassword); setFocusedField(input.id ?? null) }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors duration-200 cursor-pointer"
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
                        className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${focusedField === input.id ? 'text-purple-600 scale-110' : 'text-slate-400'
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
                        className={twMerge("w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none transition-all duration-300 text-slate-800 placeholder-slate-400", focusedField === input.id ? 'border-purple-500 bg-white' : '')}
                        placeholder={input.placeholder}
                        required
                      />
                    </motion.div>
                  )
                }

              }

            })}
          </motion.div>
          {selectedOption && (
            <p className="mt-2 text-sm text-gray-600">
              {/* Has seleccionado: <span className="font-semibold text-blue-700">{selectedOption}</span> */}
            </p>
          )}
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors duration-200 transform hover:scale-105"
        >
          Enviar Formulario
        </button>
      </form>
    </div>
  );
};

export { AddUser };