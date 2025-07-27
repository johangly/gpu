import React, { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import logo from './assets/logo-group.svg';
import { toast } from 'react-hot-toast';

import type { Session } from './types';
// Extend the Window interface to include api


const FloatingParticles: React.FC = memo(() => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 8 + 2,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-theme-1/60 to-theme-3/30"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.initialX}%`,
            top: `${particle.initialY}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
});

// Envuelve el componente con React.memo
const GradientOrbs: React.FC = memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large orb 1 */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, var(--color-theme-3) 0%, var(--color-theme-3) 50%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -80, 60, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        initial={{ x: -100, y: -100 }}
      />

      {/* Large orb 2 */}
      <motion.div
        className="absolute w-80 h-80 rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, var(--color-theme-1) 0%, var(--color-theme-3) 50%, transparent 70%)',
          filter: 'blur(35px)',
          right: 0,
          top: '20%',
        }}
        animate={{
          x: [0, -120, 80, 0],
          y: [0, 100, -60, 0],
          scale: [0.8, 1.1, 0.9, 0.8],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />

      {/* Medium orb */}
      <motion.div
        className="absolute w-64 h-64 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, var(--color-theme-3) 0%, var(--color-theme-2) 60%, transparent 80%)',
          filter: 'blur(25px)',
          bottom: '10%',
          left: '20%',
        }}
        animate={{
          x: [0, 60, -40, 0],
          y: [0, -40, 20, 0],
          scale: [0.9, 1.3, 0.7, 0.9],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 10,
        }}
      />
    </div>
  );
});

// Envuelve el componente con React.memo
const GeometricShapes: React.FC = memo(() => {
  const shapes = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 20 + 10,
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
    rotation: Math.random() * 360,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 8,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute border border-theme-3/80"
          style={{
            width: shape.size,
            height: shape.size,
            left: `${shape.initialX}%`,
            top: `${shape.initialY}%`,
            borderRadius: shape.id % 3 === 0 ? '50%' : shape.id % 2 === 0 ? '0%' : '20%',
          }}
          animate={{
            rotate: [shape.rotation, shape.rotation + 360],
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            opacity: [0.1, 0.3, 0.1],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
});



const LoginForm: React.FC<{ setSession: React.Dispatch<React.SetStateAction<Session>> }> = ({ setSession }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
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
    console.log('enviando formulario')
    const authenticated = await window.api.login({username: formData.username, password: formData.password});

    // If authenticated is an object with token and user, update session
    if (authenticated && typeof authenticated === 'object' && 'token' in authenticated && 'user' in authenticated && authenticated.success === true) {
      console.log('inicio de sesion exitoso')
      toast.success('Inicio de sesión exitoso');
      setSession({
        token: authenticated.token,
        user: authenticated.user
      });
    } else {
      toast.error('Error al iniciar sesión: Credenciales incorrectas');
      console.log("ERROR al iniciar sesion:",authenticated)
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: () => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    })
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.15 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <div className='flex justify-center items-center'>
      {/* Animated Background Elements */}
      <FloatingParticles />
      <GradientOrbs />
      <GeometricShapes />

      {/* Animated grid pattern */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-theme-3) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-theme-1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '50px 50px', '0px 0px'],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div className=" flex-column items-center justify-center p-4 z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex"
        >
          {/* Logo Section */}
          <motion.div variants={itemVariants} className="text-center w-full p-10 flex flex-col items-center justify-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-lg mb-6">
              <img src={logo} alt="Logo" className="w-16 h-16" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Sistema de Asistencia</h1>
            <p className="text-slate-600">Personal Universitario</p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-3xl shadow-xl p-8 border w-full border-slate-200/50"
          >

            <h1 className="text-2xl font-bold text-slate-800 mb-4">Iniciar Sesión</h1>
            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              {/* Username Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="username" className="flex justify-center w-fit mx-auto text-sm font-semibold text-slate-700 mb-2">
                  Usuario
                </label>
                
                <motion.div className={twMerge("relative")} animate={{ scale: focusedField === 'username' ? 1.02: 1 }}>
                  <div
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${focusedField === 'username' ? 'text-purple-600 scale-110' : 'text-slate-400'
                      }`}
                  >
                    <User size={20}/>
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    className={twMerge("w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none transition-all duration-300 text-slate-800 placeholder-slate-400",focusedField === 'username' ? 'border-purple-500 bg-white' : '')}
                    placeholder="Ingrese su usuario"
                    required
                  />
                </motion.div>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="password" className="flex justify-center w-fit mx-auto text-sm font-semibold text-slate-700 mb-2">
                  Contraseña
                </label>
                <motion.div className={twMerge("relative")} animate={{ scale: focusedField === 'password' ? 1.02 : 1 }}>
                  <div
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${focusedField === 'password' ? 'text-purple-600 scale-110' : 'text-slate-400'
                      }`}
                  >
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-300 text-slate-800 placeholder-slate-400"
                    placeholder="Ingrese su contraseña"
                    required
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors duration-200 cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Login Button */}
              <motion.div variants={itemVariants} className="pt-4">
                <motion.button
                  type="submit"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full bg-gradient-to-r from-theme-1 to-theme-3 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300"
                >
                  <motion.span
                    className="flex items-center justify-center space-x-2"
                    initial={{ opacity: 1 }}
                    whileHover={{ opacity: 0.9 }}
                  >
                    <span>Ingresar</span>
                  </motion.span>
                </motion.button>
              </motion.div>
            </form>

            {/* Additional Options */}
            <motion.div variants={itemVariants} className="mt-6 text-center">
              <motion.a
                href="#"
                className="text-sm text-slate-500 hover:text-theme-3 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ¿Olvidaste tu contraseña?
              </motion.a>
            </motion.div>
          </motion.div>

          {/* <button className='p-3 bg-blue-300 m-2 rounded-2xl' onClick={() => { window.api.setTitle("Prueba") }}>Prueba</button> */}

        </motion.div>
        {/* Footer */}
        <motion.div variants={itemVariants} className="text-center mt-8">
          <p className="text-sm text-slate-500">
            © 2025 Universidad X. Todos los derechos reservados.
          </p>
        </motion.div>
      </div>
    </div>
    
  );
};

export { LoginForm };