import React, { useState } from 'react';
import { Button } from '@/components/modifiedUI/button';
import { FaSpinner } from 'react-icons/fa';

const ConfirmationAlert = ({
  title,
  message,
  onConfirm,
  onCancel,
  showCancel = false,
  onLoadingComplete, // New prop: function to call when loading completes
  isLoading = false, // New prop: control whether the alert is in loading state
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div
        className="w-full max-w-[95vw] rounded-xl border border-green-500 bg-gray-900 p-8 shadow-xl md:max-w-[410px]"
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
          maxWidth: '95vw',
        }}
      >
        <h2 className="mb-4 text-center text-2xl font-bold">{title}</h2>
        <p className="mb-6 text-center text-lg">{message}</p>
        <div className="flex justify-center gap-4">
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
