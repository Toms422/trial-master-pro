import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface AnimatedLoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
}

const AnimatedLoadingButton = React.forwardRef<
  HTMLButtonElement,
  AnimatedLoadingButtonProps
>(
  (
    {
      isLoading = false,
      loadingText = 'טוען...',
      disabled,
      children,
      variant = 'default',
      size = 'default',
      ...props
    },
    ref
  ) => {
    const spinVariants = {
      rotate: {
        rotate: 360,
      },
    };

    const contentVariants = {
      visible: { opacity: 1, x: 0 },
      hidden: { opacity: 0, x: -10 },
    };

    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        variant={variant}
        size={size}
        className="relative"
        {...props}
      >
        <motion.div
          className="flex items-center gap-2"
          animate={isLoading ? 'hidden' : 'visible'}
          variants={contentVariants}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>

        {isLoading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              variants={spinVariants}
              animate="rotate"
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
          </motion.div>
        )}

        {isLoading && (
          <motion.span
            className="opacity-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            {loadingText}
          </motion.span>
        )}
      </Button>
    );
  }
);

AnimatedLoadingButton.displayName = 'AnimatedLoadingButton';

export default AnimatedLoadingButton;
