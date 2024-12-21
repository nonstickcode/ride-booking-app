import React, { useState } from 'react';
import { Button } from '@/components/modifiedUI/button';
import { FaSpinner } from 'react-icons/fa';

const ConfirmationAlert = ({
  title,
  message,
  onConfirm,
  onCancel,
  showCancel = false,
  onLoadingComplete,
  isLoading = false,
}) => {
  const [loading, setLoading] = useState(isLoading);

  const handleConfirm = async () => {
    setLoading(true); // Set loading before the operation
    const result = await onConfirm(); // Assume onConfirm can now be async
    setLoading(false); // Reset loading after the operation
    if (onLoadingComplete) {
      onLoadingComplete(result); // Call the completion handler with the result
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="rounded-xl border border-green-500 bg-gray-900 p-8 shadow-xl sm:max-w-[80vw] md:max-w-[50vw] lg:max-w-[30vw] mx-auto">
        <h2 className="m-4 text-center text-2xl font-bold">{title}</h2>
        <p className="m-6 text-center text-lg">{message}</p>
        <div className="mx-8 flex justify-center gap-4">
          {showCancel && (
            <Button onClick={onCancel} variant="red" className="w-full">
              Cancel
            </Button>
          )}
          <Button
            onClick={handleConfirm}
            variant="green"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'OK'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationAlert;
