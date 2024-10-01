'use client';

import Image from 'next/image';

export default function RideImage() {
  return (
    <Image
      className="mb-4 transform rounded-lg"
      src="/images/jamies-escalade.jpeg"
      width={300}
      height={200}
      alt="Jamie's Escalade"
      priority
      style={{ width: 'auto', height: 'auto' }}
    />
  );
}
