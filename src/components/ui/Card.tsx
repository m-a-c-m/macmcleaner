import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  glowing?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-6' };

const glowingStyle = {
  boxShadow: '0 0 35px rgba(0,212,255,0.18), 0 0 70px rgba(201,64,240,0.08)',
  borderColor: 'rgba(0,212,255,0.2)',
};

export function Card({ children, className = '', glowing, onClick, padding = 'md' }: CardProps) {
  const base = `bg-surface border border-border rounded-xl ${paddings[padding]} ${className}`;

  if (onClick) {
    return (
      <motion.div
        onClick={onClick}
        whileHover={{
          borderColor: 'rgba(0,212,255,0.4)',
          backgroundColor: '#13131e',
          boxShadow: '0 0 20px rgba(0,212,255,0.12)',
        }}
        transition={{ duration: 0.15 }}
        className={`${base} cursor-pointer shadow-card`}
        style={glowing ? glowingStyle : {}}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      className={`${base} shadow-card`}
      style={glowing ? glowingStyle : {}}
    >
      {children}
    </div>
  );
}
