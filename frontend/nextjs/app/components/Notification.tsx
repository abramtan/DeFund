import React from "react";

interface NotificationProps {
  isOpen: boolean; // Determines if the notification should be displayed
  message: string; // Notification text
  onClose: () => void; // Callback to close the notification
}

const Notification: React.FC<NotificationProps> = ({
  isOpen,
  message,
  onClose,
}) => {
  if (!isOpen) return null; // Render nothing if isOpen is false

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose} // Clicking the backdrop closes the notification
    >
      <div
        className="bg-white rounded-lg shadow-lg px-6 py-4 w-72 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the dialog from propagating
      >
        <p className="text-gray-800 text-center text-sm font-medium mb-4">
          {message}
        </p>
        <button
          onClick={onClose}
          className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default Notification;
