import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import Aurora from '../UI/Aurora';
import SpotlightCard from '../UI/SpotlightCard';
import GradientText from '../UI/GradientText';
import '../UI/Aurora.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // new state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        navigate('/profile');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const alertVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center bg-gray-900">
      <Aurora
        colorStops={['#3A29FF', '#FF94B4', '#FF3232']}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />

      <AnimatePresence>
        {error && (
          <motion.div
            key="error-alert"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={alertVariants}
            transition={{ duration: 0.3 }}
            className="fixed top-6 right-6 z-50 max-w-xs px-4 py-3 rounded-md shadow-lg text-white bg-red-600 flex items-center justify-between space-x-4"
            role="alert"
          >
            <p className="flex-grow">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-white hover:text-gray-300 focus:outline-none"
              aria-label="Close alert"
            >
              &#10005;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <SpotlightCard
        className="custom-spotlight-card w-full max-w-md p-8 z-10 shadow-xl hover:shadow-2xl transition-shadow duration-300"
        spotlightColor="rgba(0, 229, 255, 0.2)"
      >
        <h2 className="text-5xl font-bold mb-8 text-center">
          <GradientText
            colors={['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa']}
            animationSpeed={3}
            showBorder={false}
            className="font-bold"
          >
            <span className="p-2">𝘼𝙙𝙙𝙖𝘽𝙖𝙯𝙯</span>
          </GradientText>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <div className="flex items-center bg-gray-700 rounded-md border border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 px-3 py-2 transition duration-200">
              <FiMail className="text-blue-400 w-5 h-5 mr-3" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="bg-transparent text-white w-full focus:outline-none placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <div className="flex items-center bg-gray-700 rounded-md border border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 px-3 py-2 transition duration-200">
              <FiLock className="text-blue-400 w-5 h-5 mr-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="bg-transparent text-white w-full focus:outline-none placeholder-gray-400"
              />
              <button
                type="button"
                onClick={togglePassword}
                className="text-blue-300 hover:text-blue-500 ml-2 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="rounded-md bg-gradient-to-br from-blue-400 to-blue-700 px-6 py-3 text-lg text-zinc-50 ring-2 ring-blue-500/50 ring-offset-2 ring-offset-zinc-950 transition-all hover:scale-[1.02] hover:ring-transparent active:scale-[0.98] active:ring-blue-500/70 font-semibold"
            >
              Login
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-white text-sm">
          Don&apos;t have an account?{' '}
          <a href="/" className="text-blue-400 font-semibold hover:underline">
            Create one
          </a>
        </div>
      </SpotlightCard>
    </div>
  );
};

export default Login;
