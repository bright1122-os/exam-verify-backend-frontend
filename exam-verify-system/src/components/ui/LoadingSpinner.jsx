import { motion } from 'framer-motion';

export const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className={`${sizes[size]} border-4 border-sand border-t-terracotta rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-stone font-heading font-medium"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};
