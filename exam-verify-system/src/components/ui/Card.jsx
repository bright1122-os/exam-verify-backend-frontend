import { motion } from 'framer-motion';

export const Card = ({
  children,
  hover = false,
  className = '',
  onClick,
  ...props
}) => {
  const Wrapper = hover ? motion.div : 'div';

  const hoverProps = hover ? {
    whileHover: { y: -4 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  } : {};

  return (
    <Wrapper
      className={`bg-white border border-slate-100 rounded-2xl p-6 shadow-premium transition-shadow duration-500 ${hover ? 'cursor-pointer hover:shadow-premium-hover' : ''} ${className}`}
      onClick={onClick}
      {...hoverProps}
      {...props}
    >
      {children}
    </Wrapper>
  );
};
