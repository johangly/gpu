import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';
import { BookMarked } from 'lucide-react';
import toast from 'react-hot-toast';
import { Checkbox } from './ui/checkbox';
import { z } from 'zod';
import type { HorarioDia, HorarioFormData } from '../types';

// --- Esquemas de Validación con Zod ---
// Esquema para la validación de un solo día de horario
const horarioDiaSchema = z.object({
  dia_semana: z.number().min(1).max(7),
  hora_inicio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora de inicio inválido (HH:MM)"),
  hora_fin: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora de fin inválido (HH:MM)"),
}).refine(data => data.hora_inicio < data.hora_fin, {
  message: "La hora de fin debe ser posterior a la hora de inicio",
  path: ["hora_fin"],
});

// Esquema para la validación de todo el formulario
const horarioFormSchema = z.object({
  nombre_grupo: z.string().min(1, "Debes ingresar el nombre de grupo"),
  horarios: z.array(horarioDiaSchema).min(1, "Debes seleccionar al menos un día y su horario"),
});
interface AddGroupProps {
  onAddGroup: (data:HorarioFormData) => Promise<{ success: boolean; message?: string }>;
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
  // Estado para controlar qué días están activos y sus horas
  const [activeDays, setActiveDays] = useState<Map<number, { inicio: string, fin: string }>>(new Map());
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      
    
    const horariosParaEnviar: HorarioDia[] = Array.from(activeDays.entries()).map(([diaId, horas]) => ({
      dia_semana: diaId,
      hora_inicio: horas.inicio,
      hora_fin: horas.fin,
    }));

    const horarioFormData: HorarioFormData = {
      nombre_grupo: formData.nombre_grupo,
      horarios: horariosParaEnviar,
    };
    console.log('horarioFormData',horarioFormData)
    // Valida los datos del formulario con Zod
    horarioFormSchema.parse(horarioFormData);

    if (formData.nombre_grupo === '') {
      toast.error('El campo de nombre no puede estar vacio')
    }
    const response = await onAddGroup(horarioFormData);

    if (response.success === true) {
      setFormData({
        nombre_grupo: '',
      });
      setActiveDays(new Map());
      setFocusedField(null);
    }
    } catch (error) {
      console.log(error)
    }
  };

  // Maneja el cambio del checkbox de un día
  const handleDayToggle = (diaId: number, isChecked: boolean) => {
    setActiveDays(prev => {
      const newMap = new Map(prev);
      if (isChecked) {
        newMap.set(diaId, { inicio: '09:00', fin: '17:00' }); // Valores predeterminados
      } else {
        newMap.delete(diaId);
      }
      return newMap;
    });
  };
  
  // Maneja el cambio de hora de inicio o fin para un día
  const handleTimeChange = (diaId: number, field: 'inicio' | 'fin', value: string) => {
    setActiveDays(prev => {
      const newMap = new Map(prev);
      const currentDay = newMap.get(diaId);
      if (currentDay) {
        newMap.set(diaId, { ...currentDay, [field]: value });
      }
      return newMap;
    });
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
            <div>
              <h2 className="text-md font-semibold mb-4 text-gray-800 text-center">Horario</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {diasSemana.map((dia, index) => {
                  const diaId = index + 1;
                  const isDayActive = activeDays.has(diaId);
                  const currentHours = activeDays.get(diaId) || { inicio: '', fin: '' };

                  return (
                    <div key={diaId} className={twMerge("w-full pl-3 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none transition-all duration-300 text-slate-800 placeholder-slate-400", isDayActive ? 'border-theme-3 bg-theme-3/10' : '')}>
                      <div className="flex items-center mb-3">
                        <Checkbox
                          checked={isDayActive}
                          onCheckedChange={(checked) => handleDayToggle(diaId, Boolean(checked))}
                          id={`dia-${diaId}`}
                          className={twMerge("h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer", isDayActive ? 'bg-theme-3 text-white' : '')}
                        />
                        <label htmlFor={`dia-${diaId}`} className={twMerge("ml-3 text-lg font-medium text-slate-400 cursor-pointer", isDayActive ? 'text-theme-3' : '')}>
                          {dia}
                        </label>
                      </div>

                      <AnimatePresence>
                        {isDayActive && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col sm:flex-row gap-4 w-full max-w-full"
                          >
                            <div className="flex-1">
                              <label htmlFor={`inicio-${diaId}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Hora de Inicio:
                              </label>
                              <input
                                type="time"
                                id={`inicio-${diaId}`}
                                value={currentHours.inicio}
                                onChange={(e) => handleTimeChange(diaId, 'inicio', e.target.value)}
                                className={twMerge("w-full p-2 border-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm", isDayActive ? 'bg-white text-black border-theme-3' : '')}
                                required={isDayActive}
                              />
                            </div>
                            <div className="flex-1">
                              <label htmlFor={`fin-${diaId}`} className="block text-sm font-medium text-gray-700 mb-1">
                                Hora de Fin:
                              </label>
                              <input
                                type="time"
                                id={`fin-${diaId}`}
                                value={currentHours.fin}
                                onChange={(e) => handleTimeChange(diaId, 'fin', e.target.value)}
                                className={twMerge("w-full p-2 border-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm", isDayActive ? 'bg-white text-black border-theme-3' : '')}
                                required={isDayActive}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
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