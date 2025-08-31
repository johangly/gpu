import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';

// --- Tipado con TypeScript (conceptual, ya que el entorno de inmersiva es JS) ---


// --- Componente React ---
const HorarioForm = () => {

  // Estado para mensajes de error de validación
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);
  // Estado para el mensaje de éxito
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Días de la semana para mapear la interfaz


  // Simula la carga de grupos al montar el componente
  useEffect(() => {
    // En una aplicación real, harías una llamada a tu API aquí

  }, []);

  // Maneja el cambio de selección del grupo
  const handleGrupoChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGrupoId(Number(event.target.value) || null);
    setErrors([]); // Limpia errores al cambiar de grupo
    setSuccessMessage(null); // Limpia mensaje de éxito
    setActiveDays(new Map()); // Reinicia los horarios seleccionados
  };





  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container max-w-lg mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg"
      >
       


      </motion.div>
    </div>
  );
};

export default HorarioForm;
