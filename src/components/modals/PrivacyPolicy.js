'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/modifiedUI/button';
import { motion } from 'framer-motion';

const PrivacyPolicyModal = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="modal-background fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="modal-container relative max-h-[90vh] w-[90vw] max-w-lg overflow-y-auto rounded-lg bg-gray-800 p-6 text-white shadow-lg"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="close"
          size="icon"
          className="absolute right-2 top-2"
          aria-label="Close"
          title="Close window"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Modal Content */}
        <h2 className="mb-4 pt-6 text-center text-3xl font-bold">
          Privacy Policy
        </h2>

        <div className="space-y-6 overflow-y-auto p-4 text-sm">
          {/* Introduction */}
          <p>
            Welcome to <strong>RydeBlk</strong>. This Privacy Policy explains
            how we collect, use, and protect your personal information when
            using our app and services.
          </p>

          {/* Information We Collect */}
          <h3 className="text-lg font-semibold">Information We Collect</h3>
          <ul className="list-inside list-disc space-y-1 pl-4">
            <li>Your email address for authentication</li>
            <li>Pickup and drop-off locations for booking rides</li>
            <li>
              Basic profile information (e.g., name) provided by Google OAuth
            </li>
            <li>
              Usage data, including IP address, device details, and session
              activity
            </li>
          </ul>

          {/* How We Use Your Information */}
          <h3 className="text-lg font-semibold">How We Use Your Information</h3>
          <p>We use the collected information to:</p>
          <ul className="list-inside list-disc space-y-1 pl-4">
            <li>Authenticate users securely</li>
            <li>Provide and improve ride-booking services</li>
            <li>Enhance app functionality and user experience</li>
            <li>Monitor usage patterns and resolve technical issues</li>
          </ul>

          {/* Data Protection */}
          <h3 className="text-lg font-semibold">Data Protection</h3>
          <p>
            Your data is stored securely using encryption methods. We use
            trusted third-party services, such as <strong>Supabase</strong>, to
            ensure data privacy and protection. Access to your data is
            restricted to authorized personnel only.
          </p>

          {/* No Data Sale or Misuse */}
          <h3 className="text-lg font-semibold">No Data Sale or Misuse</h3>
          <p>
            Your personal data is <strong>never sold</strong> or shared with
            unauthorized third parties. It is only used for essential app
            functionalities, such as user authentication and booking rides.
          </p>

          {/* Third-Party Services */}
          <h3 className="text-lg font-semibold">Third-Party Services</h3>
          <p>
            We rely on third-party providers like <strong>Supabase</strong> for
            authentication and secure data storage. Additionally, we may use{' '}
            <strong>Google Maps</strong> APIs for route calculations and
            location-based services.
          </p>

          {/* Data Retention */}
          <h3 className="text-lg font-semibold">Data Retention</h3>
          <p>
            Your data is retained only as long as necessary to fulfill the
            purposes outlined in this Privacy Policy. Once no longer needed, it
            will be securely deleted or anonymized.
          </p>

          {/* User Rights */}
          <h3 className="text-lg font-semibold">Your Rights</h3>
          <p>
            You have the right to access, update, or delete your personal
            information. To make such requests, please contact us at{' '}
            <a
              href="mailto:rydeblk@gmail.com"
              className="text-blue-400 underline"
            >
              rydeblk@gmail.com
            </a>
            .
          </p>

          {/* Cookies and Tracking */}
          <h3 className="text-lg font-semibold">Cookies and Tracking</h3>
          <p>
            We use cookies to enhance user experience, analyze traffic, and
            improve app performance. You can manage or disable cookies through
            your browser settings.
          </p>

          {/* Changes to Policy */}
          <h3 className="text-lg font-semibold">Changes to this Policy</h3>
          <p>
            We may update this Privacy Policy periodically. Any changes will be
            posted here with an updated &quot;Last Updated&quot; date. Please
            review this policy regularly to stay informed.
          </p>

          {/* Contact Us */}
          <h3 className="text-lg font-semibold">Contact Us</h3>
          <p>
            If you have any questions or concerns about this Privacy Policy,
            please contact us at:
          </p>
          <p>
            <a
              href="mailto:rydeblk@gmail.com"
              className="text-blue-400 underline"
            >
              rydeblk@gmail.com
            </a>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicyModal;
