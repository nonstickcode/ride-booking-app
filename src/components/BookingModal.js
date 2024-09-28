'use client';

import { X } from 'lucide-react';
import BookingForm from '@/components/BookingForm';

export default function BookingModal({ onClose }) {
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

        <BookingForm closeModal={onClose} />
      </div>
    </div>
  );
}
