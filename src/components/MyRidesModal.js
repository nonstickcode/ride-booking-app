'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MyRidesModal = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="relative w-[90vw] max-w-sm rounded-lg border border-gray-500 bg-black p-2 shadow-xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
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
        <div className="mx-auto w-full max-w-md rounded-lg p-8 shadow-xl">
          <h2 className="mx-auto mb-4 text-center text-2xl font-bold text-white">
            My Rides
          </h2>

          <hr className="mb-4 border-gray-700" />

          {/* Upcoming Rides Section */}
          <div>
            <h3 className="text-lg font-semibold text-white">Upcoming Rides</h3>
            <div className="mt-2 text-gray-300">
              {/* Blank for now */}
              No upcoming rides.
            </div>
          </div>

          <hr className="my-4 border-gray-700" />

          {/* Past Rides Section */}
          <div>
            <h3 className="text-lg font-semibold text-white">Past Rides</h3>
            <div className="mt-2 text-gray-300">
              {/* Blank for now */}
              No past rides.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRidesModal;
