'use client';

import React from 'react';
import { X } from 'lucide-react';
import AuthButtons from '@/components/AuthButtons';

const SignInModal = ({ onClose, onSignInSuccess }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="relative w-[90vw] max-w-sm rounded-lg border border-gray-500 bg-black p-2 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center text-gray-400 transition hover:text-white"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="mx-auto mb-5 w-[80%] text-center text-2xl font-bold text-blue-500">
          Sign in to Book a Ride
        </div>

        {/* Pass onSignInSuccess to AuthButtons */}
        <AuthButtons onSignInSuccess={onSignInSuccess} />
      </div>
    </div>
  );
};

export default SignInModal;
