import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "outline" | "ghost";
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant,
  className,
  ...props
}) => {
  let baseClasses = "px-4 py-2 rounded-lg font-medium transition";
  if (variant === "outline") {
    baseClasses += " border border-gray-300 text-gray-700 hover:bg-gray-100";
  } else if (variant === "ghost") {
    baseClasses += " bg-transparent text-gray-700 hover:bg-gray-100";
  }

  return (
    <button className={`${baseClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
