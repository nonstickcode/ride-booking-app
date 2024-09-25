'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import BookingForm from '@/components/BookingForm';
import { X } from 'lucide-react';

export default function Home() {
  const [showModal, setShowModal] = useState(false);

  const openBooking = () => {
    setShowModal(true);
  };

  const closeBooking = (e) => {
    e.stopPropagation(); // Prevent closing modal when clicking inside the modal
    setShowModal(false);
  };

  return (
    <div className="--font-oxygen flex min-h-screen flex-col items-center justify-center bg-black px-4 text-white">
      <header className="text-center">
        <h1 className="main-title mb-2 text-6xl lg:text-7xl">#RYDEBLK</h1>
        <h1 className="mb-2 text-2xl font-semibold text-gray-300 lg:text-4xl">
          With Jamie
        </h1>
        <p className="text-xl text-gray-300 lg:text-2xl">
          Phoenix and Los Angeles
        </p>
      </header>

      <main className="mt-8 flex flex-col items-center space-y-6">
        <Image
          className="rounded-lg shadow-lg"
          src="/images/escalade.jpg"
          width={275}
          height={275}
          alt="Jamie's Escalade"
          priority
          style={{ width: 'auto', height: 'auto' }} // Ensures aspect ratio is maintained
        />

        <Button
          className="mt-6 rounded-md bg-blue-600 p-8 text-xl font-semibold text-white transition hover:bg-blue-700"
          onClick={openBooking}
        >
          Book Ride Now
        </Button>
      </main>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          onClick={closeBooking} // Click outside the modal to close it
        >
          <div
            className="relative w-[90vw] max-w-sm rounded-md border border-gray-300 bg-black p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()} // Prevent closing on modal content click
          >
            {/* Close Button */}
            <button
              onClick={closeBooking}
              className="absolute right-2 top-2 text-gray-300 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Booking Form */}
            <BookingForm />
          </div>
        </div>
      )}

      <footer className="mt-8 text-center">
        <p className="text-xl text-gray-300">or text 310-947-9464</p>
      </footer>
    </div>
  );
}
