import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'default';
  className?: string;
}

const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const badgeVariants = {
    initial: {
      scale: 0,
      opacity: 0,
    },
    animate: {
      scale: 1,
      opacity: 1,
    },
    hover: {
      scale: 1.05,
    },
  };

  const variantStyles = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
  };

  return (
    <motion.div
      variants={badgeVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      transition={{ type: 'spring', damping: 15, stiffness: 300 }}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${variantStyles[variant]} ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedBadge;
