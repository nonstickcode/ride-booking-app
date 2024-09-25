'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Correct import for the Next.js App Router
import { Button } from '@/components/ui/button';
import BookingForm from '@/components/BookingForm';
import { X } from 'lucide-react';

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Check if the booking modal is open before sign-in and open the modal after sign in complete if needed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isBooking = localStorage.getItem('isBooking'); // Check if user was booking before sign-in
      if (isBooking === 'true') {
        setShowModal(true);
        localStorage.removeItem('isBooking'); // Clear the flag after modal is opened
      }
    }
  }, []);

  const openBooking = () => {
    setShowModal(true);
    localStorage.setItem('isBooking', 'true'); // Set flag that user is in the process of booking
  };

  const closeBooking = (e) => {
    e.stopPropagation(); // Prevent closing modal when clicking inside the modal
    setShowModal(false);
  };

  return (
    <div
      className="--font-oxygen flex flex-col items-center justify-center bg-black px-4 text-white"
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }} // Set the dynamic viewport height
    >
      <header className="text-center">
        <h1 className="main-title mb-4 text-7xl lg:text-8xl font-extrabold tracking-wide">
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
          className="rounded-lg border mb-4 border-gray-400 shadow-2xl transition-transform transform hover:scale-105"
          src="/images/escalade.jpg"
          width={300}
          height={200}
          alt="Jamie's Escalade"
          priority
          style={{ width: 'auto', height: 'auto' }}
        />

        <Button
          className="mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-2xl font-semibold text-white shadow-lg transition hover:bg-gradient-to-l hover:from-blue-700 hover:to-blue-500"
          onClick={openBooking}
        >
          Book Ride Now
        </Button>
      </main>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          onClick={closeBooking}
        >
          <div
            className="relative w-[90vw] max-w-sm rounded-lg border border-gray-500 bg-black p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeBooking}
              className="absolute right-2 top-2 text-gray-400 hover:text-white transition"
            >
              <X className="h-6 w-6" />
            </button>

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
