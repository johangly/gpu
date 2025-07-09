import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const FloatingParticles: React.FC = () => {
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
          className="absolute rounded-full bg-gradient-to-r from-purple-400/60 to-purple-600/30"
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
};

// Animated gradient orbs
const GradientOrbs: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large orb 1 */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(100, 0, 182, 0.5) 0%, rgba(132, 0, 177, 0.4) 50%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(163, 0, 171, 0.5) 0%, rgba(132, 0, 177, 0.4) 50%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(100, 0, 182, 0.6) 0%, rgba(163, 0, 171, 0.4) 60%, transparent 80%)',
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
};

// Geometric shapes animation
const GeometricShapes: React.FC = () => {
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
          className="absolute border border-purple-300/80"
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
};


const LoginForm: React.FC = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
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
      scale: 1.02,
      transition: { duration: 0.2 }
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
            linear-gradient(rgba(100, 0, 182, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 0, 182, 0.1) 1px, transparent 1px)
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
              <svg width="60" height="19" viewBox="0 0 571 179" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M89.5397 178.847C133.263 178.847 170.009 147.217 177.451 105.587L177.684 104.889L178.149 102.099C178.382 100.005 178.614 97.9122 178.614 95.8191C178.847 93.726 178.847 91.6328 178.847 89.3071V85.1208C178.614 80.702 178.149 76.5157 177.219 72.3295H86.5162V105.587H137.914C131.17 125.821 112.099 140.473 89.5397 140.473C61.1661 140.473 38.3741 117.681 38.3741 89.3071C38.3741 61.1661 61.1661 38.3742 89.5397 38.3742C102.098 38.3742 113.494 42.793 122.565 50.4678H170.009C155.59 20.4662 124.89 0 89.5397 0C40.0021 0 0 40.0021 0 89.3071C0 134.193 33.2576 171.637 76.2831 177.917C80.702 178.614 84.8883 178.847 89.5397 178.847Z" fill="#6400B6" />
                <path d="M327.763 4.18629C323.576 3.48857 319.39 3.02344 314.971 3.02344H231.711V175.823H270.085V118.378H314.971C348.229 118.378 375.207 93.9586 375.207 60.701C375.207 31.8622 354.741 9.53541 327.763 4.18629ZM270.085 85.1209V36.281H314.971C327.065 36.281 336.833 48.6073 336.833 60.701C336.833 70.9341 329.623 81.3997 320.088 84.1906C318.46 84.8883 316.599 85.1209 314.971 85.1209H270.085Z" fill="#8400B1" />
                <path d="M570.807 104.424V3.02344H532.433V104.424C532.433 124.193 516.386 140.008 497.082 140.008C477.547 140.008 461.732 124.193 461.499 104.657V3.02344H423.125V104.424C423.125 145.124 456.15 178.382 497.082 178.382C503.594 178.382 510.106 177.451 515.921 175.823C519.874 174.893 523.828 173.265 527.317 171.87C534.759 168.381 541.503 163.962 547.085 158.613C549.876 156.288 551.969 153.729 554.062 151.171C556.155 148.613 558.249 146.054 559.877 143.031C565.458 134.193 568.714 124.193 570.342 113.494C570.575 110.704 570.807 107.68 570.807 104.424Z" fill="#A300AB" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Sistema de Asistencia</h1>
            <p className="text-slate-600">Personal Universitario</p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-3xl shadow-xl p-8 border w-full border-slate-200/50"
          >
            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              {/* Username Field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
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
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <motion.div
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${focusedField === 'password' ? 'text-purple-600' : 'text-slate-400'
                      }`}
                    animate={{ scale: focusedField === 'password' ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Lock size={20} />
                  </motion.div>
                  <motion.input
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
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </motion.button>
                </div>
              </motion.div>

              {/* Login Button */}
              <motion.div variants={itemVariants} className="pt-4">
                <motion.button
                  type="submit"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-300"
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
                className="text-sm text-slate-500 hover:text-purple-600 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ¿Olvidaste tu contraseña?
              </motion.a>
            </motion.div>
          </motion.div>


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