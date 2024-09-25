'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import RideImage from '@/components/RideImage';
import BookingModal from '@/components/BookingModal';

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
    <div className="--font-oxygen flex flex-col items-center justify-center px-4 text-white" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      <Header />

      <main className="mt-10 flex flex-col items-center space-y-8">
        <RideImage />

        <Button
          className="mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-2xl font-semibold text-white shadow-lg transition hover:bg-gradient-to-l hover:from-blue-700 hover:to-blue-500"
          onClick={openBooking}
        >
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
