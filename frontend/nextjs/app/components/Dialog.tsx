import { FC, ReactNode, MouseEvent } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Dialog: FC<DialogProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const handleClickBackdrop = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleClickBackdrop}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Dialog;
