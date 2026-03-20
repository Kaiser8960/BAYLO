import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-navy border-t-transparent rounded-full mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold text-navy">Baylo</h2>
        <p className="text-gray-600 mt-2">Loading...</p>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;
