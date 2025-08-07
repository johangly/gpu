import React, { useState } from 'react';
import type { SessionGroup, User, SelectedUserType } from '../types';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { User as UserIcon, Eye, EyeOff, Lock, IdCard, CircleUserRound, IdCardLanyard, type LucideIcon } from 'lucide-react';
import { CustomSelectWithIcons } from './CustomSelect';
import type { OptionType } from './CustomSelect';
import type { editUserProps } from '../types';
import toast from 'react-hot-toast';
import validarCedula from '../utils/validarCedula';

interface EditUserProps {
  groups: SessionGroup[];
  onEditUser: (user: editUserProps) => Promise<{ success: boolean; message?: string }>;
  selectedUser: SelectedUserType;
}

const inputs = [
  {
    id: 'grupo',
    label: 'Nombre y Apellido',
    type: 'group',
    placeholder: '',
    icon: UserIcon,
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

const EditUser: React.FC<EditUserProps> = ({ groups, onEditUser, selectedUser }) => {

  // Opciones de ejemplo con iconos
  const options: OptionType[] = [
    ...groups.map(group => ({
      id: group.id_grupo,
      value: group.id_grupo,
      label: group.nombre_grupo,
      icon: icons[group.id_grupo as keyof typeof icons] ? icons[group.id_grupo as keyof typeof icons] : undefined, // Asigna el icono si existe
    })),
  ];

  const [selectedOption, setSelectedOption] = useState<OptionType | null>(options.find(option => option.id === selectedUser.grupo.id_grupo) || null); // Inicializa con la primera opción o null

  const [formData, setFormData] = useState<User & { clave?: string | '' }>({
    id_empleado: selectedUser ? selectedUser.id_empleado : 0,
    cedula: selectedUser ? selectedUser.cedula : '',
    nombre: selectedUser ? selectedUser.nombre : '',
    apellido: selectedUser ? selectedUser.apellido : '',
    usuario: selectedUser ? selectedUser.usuario : '',
    clave: '',
    activo: selectedUser ? selectedUser.activo : true,
    grupo: {
      id_grupo: selectedOption ? selectedOption.id : 0,
      nombre_grupo: selectedOption ? selectedOption.label : '',
      creado_en: selectedUser.grupo.creado_en,
      actualizado_en: selectedUser.grupo.actualizado_en,
    }
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Función para manejar el cambio de opción
  const handleOptionChange = (option: OptionType) => {
    setSelectedOption(option);
    console.log('Opción seleccionada:', option);
  };

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
    
    if (selectedUser && Number(selectedUser.id_empleado) !== 0) {
      const response = await onEditUser({
        id_empleado: selectedUser ? selectedUser.id_empleado : 0,
        cedula: formData.cedula,
        nombre: formData.nombre,
        apellido: formData.apellido,
        usuario: formData.usuario,
        clave: formData.clave,
        activo: formData.activo,
        grupo: {
          id_grupo: selectedOption ? selectedOption.id : 0,
          nombre_grupo: selectedOption ? selectedOption.label : '',
          creado_en: selectedUser.grupo.creado_en,
          actualizado_en: selectedUser.grupo.actualizado_en,
        },
      });

      if (response.success === true) {
        setFormData({
          id_empleado: 0,
          cedula: '',
          nombre: '',
          apellido: '',
          usuario: '',
          clave: '',
          activo: true,
          grupo: {
            id_grupo: 0,
            nombre_grupo: '',
            creado_en: '',
            actualizado_en: '',
          }
        });
        setSelectedOption(null);
        setFocusedField(null);
      }
      // You can handle post-submit logic here if needed
      console.log('EditUser response:', response);
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
  console.log('EditUser formData:', formData);
  console.log('EditUser selectedOption:', selectedOption);
  console.log('EditUser inputs:', inputs);
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
            {/* {inputs.map((input) => {
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

            })} */}
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
          <p className={twMerge("my-4 text-sm text-gray-600", !selectedOption && 'opacity-0')}>
            El grupo seleccionado es: <span className="font-semibold text-blue-700">{selectedOption && selectedOption.value}</span>
          </p>
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
  inputs?: InputConfig[]; // Opcional para inputs agrupados
}

const InputGroup: React.FC<{
  inputConfig: InputConfig;
  formData: User & { clave?: string | '' };
  focusedField: string | null;
  setFocusedField: (id: string | null) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ inputConfig, formData, focusedField, setFocusedField, handleInputChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  // Si el input es de tipo "group", renderiza un div con los sub-inputs
  if (inputConfig.inputs && inputConfig.type === 'group') {
    return (
      <div className='flex gap-x-3'>
        {inputConfig.inputs.map((subInput) => (
          <motion.div
            key={subInput.id}
            className={twMerge("relative w-full")}
            animate={{ scale: focusedField === subInput.id ? 1.02 : 1 }}
          >
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
              // Corrección: Convertir el valor a string para evitar errores de tipo
              value={String(formData[subInput.id as keyof typeof formData] || '')}
              onChange={handleInputChange}
              onFocus={() => setFocusedField(subInput.id)}
              onBlur={() => setFocusedField(null)}
              className={twMerge("w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none transition-all duration-300 text-slate-800 placeholder:text-slate-400 placeholder:font-regular", focusedField === subInput.id ? 'border-theme-3 bg-white' : '')}
              placeholder={subInput.placeholder}
              required
            />
          </motion.div>
        ))}
      </div>
    );
  }

  // Si el input es de tipo "password", renderiza con el botón de toggle
  if (inputConfig.type === 'password') {
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
          type={showPassword ? 'text' : 'password'}
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
        <motion.button
          type="button"
          onFocus={() => setFocusedField(inputConfig.id)}
          onClick={() => { setShowPassword(!showPassword); setFocusedField(inputConfig.id) }}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-theme-3 transition-colors duration-200 cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </motion.button>
      </motion.div>
    );
  }

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


export { EditUser };