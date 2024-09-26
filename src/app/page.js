'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import RideImage from '@/components/RideImage';
import BookingModal from '@/components/BookingModal';
import { FaCheckCircle } from 'react-icons/fa';

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isBooking = localStorage.getItem('isBooking');

      if (isBooking === 'true') {
        setShowModal(true);
        localStorage.removeItem('isBooking');
      }

      setLoading(false);
    }
  }, []);

  const openBooking = () => {
    setShowModal(true);
    localStorage.setItem('isBooking', 'true');
  };

  const closeBooking = (e) => {
    e.stopPropagation();
    setShowModal(false);
  };

  if (loading) {
    return null;
  }

  return (
    <div
      className="--font-oxygen flex flex-col items-center justify-center px-4 text-white"
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      <Header />

      <main className="mt-10 flex flex-col items-center space-y-8">
        <RideImage />

        <Button
          className="mb-6 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-lg text-white shadow-md transition hover:bg-gradient-to-l"
          onClick={openBooking}
        >
          <FaCheckCircle className="mr-2" />
          Book Ride Now
        </Button>
      </main>

      {showModal && <BookingModal onClose={closeBooking} />}

      <footer className="mt-8 text-center">
        <p className="text-lg text-gray-200">or text 310-947-9464</p>
      </footer>
    </div>
  );
}
