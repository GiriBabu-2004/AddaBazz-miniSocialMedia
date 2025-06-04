import { motion } from "framer-motion";
import { FaSignOutAlt } from "react-icons/fa";

const LogoutButton = ({ handleLogout }) => {
  return (
    <motion.button
      onClick={handleLogout}
      whileTap={{ scale: 0.9, rotateX: 15 }}
      whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(255, 0, 0, 0.3)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-md active:shadow-inner
      text-sm sm:text-base md:text-lg"
    >
      <FaSignOutAlt className="text-xl" />
      <span>Logout</span>
    </motion.button>
  );
};

export default LogoutButton;
