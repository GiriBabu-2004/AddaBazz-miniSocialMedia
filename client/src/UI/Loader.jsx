import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
      <motion.div
        className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 shadow-lg"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
          boxShadow: [
            "0 0 0px rgba(0,0,0,0)",
            "0 0 20px rgba(0,229,255,0.4)",
            "0 0 0px rgba(0,0,0,0)"
          ],
        }}
        transition={{
          duration: 1.6,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <motion.div
          className="absolute inset-2 rounded-full bg-gray-900 flex items-center justify-center"
          animate={{ rotate: [-360, 0] }}
          transition={{ duration: 2, ease: "linear", repeat: Infinity }}
        >
          <div className="w-6 h-6 bg-blue-300 rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Loader;
