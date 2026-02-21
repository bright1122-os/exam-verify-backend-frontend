import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-body font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1';

  const variants = {
    primary: 'bg-primary text-white hover:shadow-lg hover:shadow-primary/20 focus:ring-primary/40',
    secondary: 'bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-300/40',
    ghost: 'bg-transparent text-primary hover:bg-primary/5 focus:ring-primary/20',
    success: 'bg-success text-white hover:shadow-lg hover:shadow-success/20 focus:ring-success/40',
    danger: 'bg-red-500 text-white hover:shadow-lg hover:shadow-red-500/20 focus:ring-red-500/40',
  };

  const sizes = {
    sm: 'px-4 py-2 text-body-sm',
    md: 'px-6 py-3 text-body-sm',
    lg: 'px-8 py-4 text-body-md',
  };

  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'}
    ${className}
  `;

  return (
    <motion.button
      whileHover={!disabled && !loading ? { y: -1 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5" />}
          {children}
        </>
      )}
    </motion.button>
  );
};
