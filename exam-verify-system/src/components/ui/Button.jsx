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
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-heading font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';

  const variants = {
    primary: 'bg-terracotta text-parchment-DEFAULT hover:bg-terracotta-dark shadow-sm hover:shadow-md focus:ring-terracotta/40',
    secondary: 'bg-transparent border border-stone text-anthracite hover:bg-sand focus:ring-stone/40',
    ghost: 'bg-transparent text-terracotta hover:bg-terracotta-50 focus:ring-terracotta/20',
    success: 'px-6 py-3 bg-sage text-parchment rounded-lg shadow-sm hover:shadow-md active:scale-[0.97] focus:ring-sage/40',
    danger: 'px-6 py-3 bg-error text-parchment rounded-lg shadow-sm hover:shadow-md active:scale-[0.97] focus:ring-error/40',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-[15px]',
    lg: 'px-8 py-4 text-base',
  };

  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
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
