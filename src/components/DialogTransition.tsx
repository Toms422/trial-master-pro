import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DialogTransitionProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

const DialogTransition: React.FC<DialogTransitionProps> = ({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
}) => {
  const dialogVariants = {
    initial: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
    },
  };

  const backdropVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <DialogContent asChild>
              <motion.div
                variants={dialogVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              >
                {title && (
                  <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                  </DialogHeader>
                )}
                {children}
              </motion.div>
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default DialogTransition;
