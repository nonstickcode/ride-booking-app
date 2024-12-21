'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/modifiedUI/button';
import Link from 'next/link';

const PrivacyPolicy = () => {
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
        <h2 className="mb-6 text-center text-3xl font-bold">Privacy Policy</h2>

        {/* Content */}
        <div className="space-y-6 text-sm">
          <p>
            Welcome to <strong>RYDEBLK</strong>. This Privacy Policy explains
            how we collect, use, and protect your personal information when
            using our app and services.
          </p>

          {/* Information We Collect */}
          <h3 className="text-lg font-semibold">Information We Collect</h3>
          <ul className="list-inside list-disc space-y-1 pl-4">
            <li>Your email address for authentication</li>
            <li>Pickup and drop-off locations for booking rides</li>
            <li>
              Basic profile information (e.g., name, avatar) provided through
              Google OAuth
            </li>
          </ul>

          {/* How We Use Your Information */}
          <h3 className="text-lg font-semibold">How We Use Your Information</h3>
          <p>We use the collected information to:</p>
          <ul className="list-inside list-disc space-y-1 pl-4">
            <li>Authenticate users securely</li>
            <li>Provide and manage ride-booking services</li>
            <li>Communicate booking confirmations and updates</li>
          </ul>

          {/* Data Protection */}
          <h3 className="text-lg font-semibold">Data Protection</h3>
          <p>
            Your data is stored securely using encrypted methods to ensure
            privacy and protection. Access to your information is limited to
            authorized personnel for essential operations.
          </p>

          {/* No Data Sale */}
          <h3 className="text-lg font-semibold">No Data Sale or Misuse</h3>
          <p>
            Your personal data is <strong>never sold</strong> or shared with
            unauthorized third parties. It is solely used for essential
            functionalities, such as user identification and ride bookings.
          </p>

          {/* Cookies and Tracking */}
          <h3 className="text-lg font-semibold">Cookies and Tracking</h3>
          <p>
            We do not use tracking cookies or analytics tools beyond what is
            necessary for core functionality. Your privacy is a priority, and no
            unnecessary data tracking is conducted.
          </p>

          {/* User Rights */}
          <h3 className="text-lg font-semibold">Your Rights</h3>
          <p>
            You have the right to access, update, or delete your personal
            information. If you wish to make such requests, please contact us at{' '}
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

export default PrivacyPolicy;
