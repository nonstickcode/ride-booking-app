import React from 'react';
import { Button } from '@/components/ui/button';

const ConfirmationAlert = ({
  title,
  message,
  onConfirm,
  onCancel,
  showCancel = false,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="rounded-lg border border-green-500 bg-gray-900 p-8 shadow-xl">
        <h2 className="mb-4 text-center text-2xl font-bold">{title}</h2>
        <p className="mb-6 text-center text-lg">{message}</p>
        <div className="flex justify-center gap-4">
          <Button onClick={onConfirm} variant="green" className="w-full">
            OK
          </Button>
          {showCancel && (
            <Button onClick={onCancel} variant="red" className="w-full">
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationAlert;
