import { FC } from "react";

interface ProgressProps {
  value: number;
  className?: string;
}

const Progress: FC<ProgressProps> = ({ value, className }) => (
  <div className={`w-full bg-gray-200 rounded-full ${className}`}>
    <div
      className="bg-indigo-600 h-2 rounded-full"
      style={{ width: `${value}%` }}
    />
  </div>
);

export default Progress;
