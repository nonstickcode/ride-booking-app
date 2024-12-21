'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/modifiedUI/button';
import Link from 'next/link';

const SiteInformation = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex min-h-screen items-center justify-center bg-black p-6 text-white"
    >
      <div className="modal-container relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-gray-800 p-6 shadow-lg">
        {/* Header */}
        <h2 className="mb-6 text-center text-3xl font-bold">
          Site Information
        </h2>

        {/* Content */}
        <div className="space-y-6 text-sm">
          <p>
            Welcome to <strong>RYDEBLK</strong>. Here’s everything you need to
            know about our app and how it works.
          </p>

          {/* About the App */}
          <h3 className="text-lg font-semibold">About This App</h3>
          <p>
            RYDEBLK is a ride-booking platform designed to provide seamless and
            reliable transportation services. Our app allows users to book and
            manage rides effortlessly, while prioritizing convenience and safety.
          </p>

          {/* Why We Collect Your Information */}
          <h3 className="text-lg font-semibold">Why We Collect Your Information</h3>
          <p>We only collect basic account information such as your name, email, and profile avatar for the following purposes:</p>
          <ul className="list-inside list-disc space-y-1 pl-4">
            <li>To identify users and personalize the app experience</li>
            <li>To communicate important updates and confirmations about bookings</li>
            <li>To improve our services and ensure smooth operation</li>
          </ul>

          {/* Data Security */}
          <h3 className="text-lg font-semibold">Data Security</h3>
          <p>
            Your information is stored securely using encrypted systems and is used solely for the purposes outlined above. We do not utilize tracking cookies or analytics tools that monitor user behavior beyond the core functionality of the app.
          </p>

          {/* Contact */}
          <h3 className="text-lg font-semibold">Questions or Concerns?</h3>
          <p>
            If you have any questions or require further information, please
            feel free to reach out to us at{' '}
            <a
              href="mailto:rydeblk@gmail.com"
              className="text-blue-400 underline"
            >
              rydeblk@gmail.com
            </a>
            .
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-center">
          <Link href="/">
            <Button variant="blue" size="lg" className="mb-2 text-white">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default SiteInformation;
