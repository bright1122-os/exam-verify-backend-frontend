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
    whileHover: { y: -2 },
    transition: { duration: 0.15 },
  } : {};

  return (
    <Wrapper
      className={`bg-white border border-parchment-dark rounded-lg p-6 ${hover ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      {...hoverProps}
      {...props}
    >
      {children}
    </Wrapper>
  );
};
