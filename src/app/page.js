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
        <h1 className="main-title mb-4 text-7xl font-extrabold tracking-wide lg:text-8xl">
          #RYDEBLK
        </h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-400 lg:text-5xl">
          With Jamie
        </h2>
        <p className="text-lg text-gray-400 lg:text-xl">
          Phoenix and Los Angeles
        </p>
      </header>

      <main className="mt-10 flex flex-col items-center space-y-8">
        <Image
          className="mb-4 transform rounded-lg border border-gray-400 shadow-2xl transition-transform hover:scale-105"
          src="/images/escalade.jpg"
          width={300}
          height={200}
          alt="Jamie's Escalade"
          priority
          style={{ width: 'auto', height: 'auto' }} // Ensures aspect ratio is maintained
        />

        <Button
          className="mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-2xl font-semibold text-white shadow-lg transition hover:bg-gradient-to-l hover:from-blue-700 hover:to-blue-500"
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
            className="relative w-[90vw] max-w-sm rounded-lg border border-gray-500 bg-black p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing on modal content click
          >
            {/* Close Button */}
            <button
              onClick={closeBooking}
              className="absolute right-2 top-2 text-gray-400 transition hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Booking Form */}
            <BookingForm />
          </div>
        </div>
      )}

      <footer className="mt-8 text-center">
        <p className="text-lg text-gray-400">or text 310-947-9464</p>
      </footer>
    </div>
  );
}
