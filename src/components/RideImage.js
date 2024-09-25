'use client';

import Image from 'next/image';

export default function RideImage() {
  return (
    <Image
      className="rounded-lg border mb-4 transition-transform transform hover:scale-105"
      src="/images/escalade.jpg"
      width={300}
      height={200}
      alt="Jamie's Escalade"
      priority
      style={{ width: 'auto', height: 'auto' }}
    />
  );
}
