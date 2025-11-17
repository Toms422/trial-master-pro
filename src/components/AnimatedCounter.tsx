import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from = 0,
  to,
  duration = 2,
  className = '',
  suffix = '',
  prefix = '',
}) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startValue = from;
    const increment = (to - from) / (duration * 60); // 60fps
    const timer = setInterval(() => {
      startValue += increment;
      if (startValue >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(Math.floor(startValue));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [from, to, duration]);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}
      {count}
      {suffix}
    </motion.div>
  );
};

export default AnimatedCounter;
