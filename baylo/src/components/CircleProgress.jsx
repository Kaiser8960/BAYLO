import { motion } from 'framer-motion';

const CircleProgress = ({ max = 100, value = 0, current, total }) => {
  const percentage = (value / max) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-20 h-20 md:w-28 md:h-28 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="circleProgressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#112250" />
              <stop offset="100%" stopColor="#2952c3" />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#eee"
            strokeWidth="6"
            className="circle-progress-circle"
          />
          {/* Progress circle with gradient and dash pattern */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="url(#circleProgressGradient)"
            strokeWidth="6"
            strokeDasharray="4 1"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
            className="circle-progress-value"
          />
        </svg>
      </div>
      {/* Text below circle - centered */}
      {current !== undefined && total !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-2 w-full text-center"
        >
          <span
            className="circle-progress-text text-xs md:text-sm font-bold"
            style={{
              color: '#112250'
            }}
          >
            {current}/{total}
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default CircleProgress;

