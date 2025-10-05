
import React from "react";
import { motion } from "framer-motion";

interface RobotAssistantProps {
  message: string;
}

const RobotAssistant: React.FC<RobotAssistantProps> = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 15 }}
      className="fixed bottom-6 left-6 flex items-end gap-3 z-50"
    >
      {/* خلفية دوائر طاقة */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
        className="absolute w-32 h-32 -ml-4 -mb-4 rounded-full border-2 border-blue-400/30 dark:border-blue-600/30"
      ></motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
        className="absolute w-40 h-40 -ml-8 -mb-8 rounded-full border border-purple-400/20 dark:border-purple-600/20"
      ></motion.div>

      {/* جسم الروبوت */}
      <motion.div
        animate={{ rotate: [0, -4, 4, -4, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
        className="relative w-24 h-24 bg-gradient-to-br from-blue-300 via-indigo-400 to-blue-600 dark:from-blue-800 dark:via-indigo-700 dark:to-blue-900 rounded-full flex items-center justify-center border-4 border-white/60 dark:border-gray-700 shadow-[0_0_25px_rgba(59,130,246,0.6)] transform -scale-x-100"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 bg-gradient-to-tr from-indigo-200 to-blue-400 dark:from-blue-700 dark:to-indigo-900 rounded-full flex items-center justify-center shadow-inner"
        >
          <div className="w-8 h-8 bg-white dark:bg-gray-400 rounded-full flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-4 h-4 bg-gray-800 dark:bg-gray-200 rounded-full shadow-lg"
            ></motion.div>
          </div>
        </motion.div>
        {/* انتينا */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="absolute top-1 w-6 h-1 bg-yellow-300 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.9)]"
        ></motion.div>
      </motion.div>

      {/* رسالة المساعد */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mb-6 max-w-sm bg-gradient-to-br from-white/90 via-blue-50/80 to-indigo-100/80 dark:from-gray-900/90 dark:via-blue-900/70 dark:to-indigo-950/70 backdrop-blur-lg p-4 rounded-xl rounded-bl-none shadow-2xl border border-blue-300 dark:border-blue-600"
      >
        <motion.p
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="text-gray-900 dark:text-gray-100 text-lg font-bold drop-shadow-sm"
        >
          {message}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default RobotAssistant;
