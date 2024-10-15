'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/modifiedUI/button';

const MyRidesModal = ({ onClose }) => {
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
            My Rides
          </h2>

          <hr className="mb-4 border-gray-700" />

          {/* Upcoming Rides Section */}
          <div>
            <h3 className="text-lg font-semibold text-white">Upcoming Rides</h3>
            <div className="mt-2 text-gray-300">
              {/* Placeholder for upcoming rides */}
              No upcoming rides.
            </div>
          </div>

          <hr className="my-4 border-gray-700" />

          {/* Past Rides Section */}
          <div>
            <h3 className="text-lg font-semibold text-white">Past Rides</h3>
            <div className="mt-2 text-gray-300">
              {/* Placeholder for past rides */}
              No past rides.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRidesModal;
