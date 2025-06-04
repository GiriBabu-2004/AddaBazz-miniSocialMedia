import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiAtSign, FiMail, FiLock, FiCalendar, FiEye, FiEyeOff } from 'react-icons/fi';
import Aurora from '../UI/Aurora'; // Adjust path if needed
import SpotlightCard from '../UI/SpotlightCard';
import GradientText from '../UI/GradientText';
import '../UI/Aurora.css';

const Index = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    age: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false); // new state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/auth/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('User created successfully! Please login.');
        setFormData({ name: '', username: '', age: '', email: '', password: '' });
        setShowPassword(false); // reset password visibility
      } else {
        setMessage(data.error || 'User already exists or error occurred.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error');
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const iconMap = {
    name: <FiUser className="text-blue-400 w-5 h-5" />,
    username: <FiAtSign className="text-blue-400 w-5 h-5" />,
    age: <FiCalendar className="text-blue-400 w-5 h-5" />,
    email: <FiMail className="text-blue-400 w-5 h-5" />,
    password: <FiLock className="text-blue-400 w-5 h-5" />,
  };

  // Animation variants for alert box
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

      {/* Animated Alert Box */}
      <AnimatePresence>
        {message && (
          <motion.div
            key="alert"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={alertVariants}
            transition={{ duration: 0.3 }}
            className={`fixed top-6 right-6 z-50 max-w-xs px-4 py-3 rounded-md shadow-lg text-white flex items-center justify-between space-x-4
            ${
              message.toLowerCase().includes('success')
                ? 'bg-green-600'
                : 'bg-red-600'
            }`}
            role="alert"
          >
            <p className="flex-grow">{message}</p>
            <button
              onClick={() => setMessage('')}
              className="text-white hover:text-gray-300 focus:outline-none"
              aria-label="Close alert"
            >
              &#10005;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <SpotlightCard
        className="custom-spotlight-card w-full max-w-md mx-auto p-8 z-10 shadow-xl hover:shadow-2xl transition-shadow duration-300 "
        spotlightColor="rgba(0, 229, 255, 0.2)"
      >
        <GradientText
          colors={['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa']}
          animationSpeed={3}
          showBorder={false}
          className="mb-8 text-center text-5xl font-extrabold"
        >
          <span className="p-2">𝘼𝙙𝙙𝙖𝘽𝙖𝙯𝙯 </span>
        </GradientText>

        <form onSubmit={handleSubmit} className="space-y-6">
          {['name', 'username', 'age', 'email', 'password'].map((field) => (
            <div key={field} className="relative">
              <label
                htmlFor={field}
                className="block text-white text-sm font-semibold mb-2"
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <div
                className={`flex items-center bg-gray-700 rounded-md border border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 px-3 py-2 transition duration-200 ${
                  field === 'password' ? 'pr-10' : ''
                }`}
              >
                <span className="mr-3">{iconMap[field]}</span>
                <input
                  type={
                    field === 'password'
                      ? showPassword
                        ? 'text'
                        : 'password'
                      : field === 'age'
                      ? 'number'
                      : 'text'
                  }
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required
                  autoComplete={
                    field === 'password'
                      ? 'new-password'
                      : field === 'email'
                      ? 'email'
                      : 'off'
                  }
                  className="bg-transparent text-white w-full focus:outline-none placeholder-gray-400"
                  placeholder={`Enter your ${field}`}
                />
                {field === 'password' && (
                  <button
                    type="button"
                    onClick={togglePassword}
                    className="absolute right-3 text-blue-300 hover:text-blue-500 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-5 h-5" />
                    ) : (
                      <FiEye className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <button
              type="submit"
              className="rounded-md bg-gradient-to-br from-blue-400 to-blue-700 px-6 py-3 text-lg text-zinc-50 ring-2 ring-blue-500/50 ring-offset-2 ring-offset-zinc-950 transition-all hover:scale-[1.02] hover:ring-transparent active:scale-[0.98] active:ring-blue-500/70 font-semibold"
            >
              Create User
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-white text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-blue-400 font-semibold hover:underline">
            Login
          </a>
        </div>
      </SpotlightCard>
    </div>
  );
};

export default Index;
