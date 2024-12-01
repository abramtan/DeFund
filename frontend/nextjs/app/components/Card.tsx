import { FC, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: FC<CardProps> = ({ children, className, onClick }) => (
  <div
    className={`p-4 bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

export default Card;
