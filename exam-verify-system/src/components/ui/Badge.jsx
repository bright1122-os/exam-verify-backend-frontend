import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle, AlertCircle, Info } from 'lucide-react';

const statusIcons = {
  success: CheckCircle2,
  pending: Clock,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const statusClasses = {
  success: 'badge-success',
  pending: 'badge-warning',
  error: 'badge-error',
  warning: 'badge-warning',
  info: 'badge-info',
};

export const Badge = ({ status = 'success', children, showIcon = true }) => {
  const Icon = statusIcons[status];
  const classes = statusClasses[status];

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={classes}
    >
      {showIcon && Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </motion.span>
  );
};
