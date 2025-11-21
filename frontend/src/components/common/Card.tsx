import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className, onClick }: CardProps) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
