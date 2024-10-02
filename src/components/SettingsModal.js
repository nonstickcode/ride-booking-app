'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SettingsModal = ({ onClose }) => {
  const handleSaveSettings = () => {
    // TODO: Logic to save settings
    console.log('Settings saved');
  };

  return (
    <div
      className="modal-background fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="modal-container relative w-[90vw] max-w-sm p-2 shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the modal
      >
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="close"
          size="icon"
          className="absolute right-1 top-1"
          aria-label="Close"
          title="Close window"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Modal Content */}
        <div className="mx-auto w-full max-w-md p-8">
          <h2 className="mx-auto mb-4 text-center text-2xl font-bold text-white">
            Settings
          </h2>

          <hr className="mb-4 border-gray-700" />

          {/* Placeholder for future settings */}
          <div className="mb-4 text-center text-white">
            <p>Additional settings will be added here.</p>
          </div>

          <hr className="mb-4 border-gray-700" />

          {/* Save Button */}
          <Button
            onClick={handleSaveSettings}
            variant="green"
            size="md"
            className="w-full"
            title="Save Settings"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
