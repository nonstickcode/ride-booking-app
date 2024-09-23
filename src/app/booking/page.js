'use client';
import { useEffect } from 'react';
import BookingForm from '@/components/BookingForm';

export default function BookingPage() {
  useEffect(() => {
    const height = document.documentElement.scrollHeight;
    window.parent.postMessage({ iframeHeight: height }, '*');
  }, []);

  return (
    <div>
      <BookingForm />
    </div>
  );
}
