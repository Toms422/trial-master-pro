import React from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

interface AnimatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const containerVariants = {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
    };

    const labelVariants = {
      initial: { fontSize: '1rem', opacity: 0.7 },
      focused: { fontSize: '0.875rem', opacity: 1, y: -24 },
    };

    const underlineVariants = {
      initial: { scaleX: 0 },
      focused: { scaleX: 1 },
    };

    const errorVariants = {
      initial: { opacity: 0, y: -10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
    };

    return (
      <motion.div
        className="relative w-full"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          {icon && (
            <motion.div
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              animate={{
                color: isFocused ? 'rgb(59, 130, 246)' : 'rgb(156, 163, 175)',
              }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}

          {label && (
            <motion.label
              className="absolute left-3 top-1/2 transform -translate-y-1/2 origin-left cursor-text text-gray-600 dark:text-gray-400 pointer-events-none"
              variants={labelVariants}
              animate={isFocused ? 'focused' : 'initial'}
              transition={{ duration: 0.2 }}
            >
              {label}
            </motion.label>
          )}

          <Input
            ref={ref}
            className={`${icon ? 'pl-10' : ''} transition-colors ${className}`}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
            variants={underlineVariants}
            animate={isFocused ? 'focused' : 'initial'}
            transition={{ duration: 0.2 }}
            style={{ originX: 0 }}
          />
        </div>

        {error && (
          <motion.p
            className="mt-2 text-sm text-red-500"
            variants={errorVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

AnimatedInput.displayName = 'AnimatedInput';

export default AnimatedInput;
