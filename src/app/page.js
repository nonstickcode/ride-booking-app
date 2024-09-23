'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [iframeHeight, setIframeHeight] = useState('420px'); // Default height

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.iframeHeight) {
        setIframeHeight(`${event.data.iframeHeight}px`);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const [showIframe, setShowIframe] = useState(false);

  const openBooking = () => {
    setShowIframe(true);
  };

  const closeBooking = () => {
    setShowIframe(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-white">
      <header className="text-center">
        <h1 className="mb-2 text-5xl font-semibold lg:text-7xl">#RYDEBLK</h1>
        <h1 className="mb-2 text-3xl font-semibold lg:text-5xl">WITH JAMIE</h1>
        <p className="text-xl lg:text-2xl">Phoenix and Los Angeles</p>
      </header>

      <main className="mt-8 flex flex-col items-center space-y-6">
        <Image
          className="rounded-lg shadow-lg"
          src="/images/escalade.jpg"
          width={350}
          height={350}
          alt="escalade"
        />

        <Button
          className="mt-6 rounded-md bg-blue-600 p-8 text-xl font-semibold text-white transition hover:bg-blue-700"
          onClick={openBooking}
        >
          Book Ride Now
        </Button>
      </main>

      {showIframe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
          onClick={closeBooking}
        >
          <iframe
            src="/booking"
            className="w-full max-w-[90%] rounded-2xl border md:max-w-96"
            title="Book a Ride"
            style={{
              height: iframeHeight,
              backgroundColor: 'transparent',
              overflow: 'hidden', // Disable iframe scroll
            }}
            scrolling="no" // Deprecated but may help in some browsers
          />
        </div>
      )}

      <footer className="mt-8 text-center">
        <p className="text-lg">or text 310-947-9464</p>
      </footer>
    </div>
  );
}
