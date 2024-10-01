'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FaCheck } from 'react-icons/fa';
import validator from 'validator';

const formatPhoneNumber = (value) => {
  // Only allow numbers to be input
  const cleaned = ('' + value).replace(/\D/g, '');

  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);

  if (match) {
    const formattedNumber = `${match[1] ? `(${match[1]}` : ''}${
      match[2] ? `) ${match[2]}` : ''
    }${match[3] ? `-${match[3]}` : ''}`;
    return formattedNumber;
  }

  return value;
};

const NotificationsModal = ({ onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(false); // For SMS checkbox
  const [emailOptIn, setEmailOptIn] = useState(true); // For Email checkbox (default)
  const [isPhoneValid, setIsPhoneValid] = useState(false); // State to track phone validity

  // Validate phone number using validator.js
  useEffect(() => {
    const rawPhoneNumber = phoneNumber.replace(/\D/g, '');
    setIsPhoneValid(validator.isMobilePhone(rawPhoneNumber, 'en-US')); // Validate US phone numbers
  }, [phoneNumber]);

  const handlePhoneNumberChange = (e) => {
    const input = e.target.value;
    setPhoneNumber(formatPhoneNumber(input)); // Format the phone number on input change
  };

  const handleSmsOptInChange = () => {
    setSmsOptIn(true);
    setEmailOptIn(false); // Uncheck Email if SMS is selected
  };

  const handleEmailOptInChange = () => {
    setEmailOptIn(true);
    setSmsOptIn(false); // Uncheck SMS if Email is selected
  };

  const handleSaveSettings = () => {
    if (smsOptIn && !isPhoneValid) return; // Prevent save if SMS is selected and phone number is invalid

    // Handle the save logic here (e.g., send to server or update state)
    console.log(`Phone: ${phoneNumber}, SMS Opt-In: ${smsOptIn}, Email Opt-In: ${emailOptIn}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="relative w-[90vw] max-w-sm rounded-lg border border-gray-500 bg-black p-2 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="close"
          size="icon"
          className="absolute right-1 top-1"
          aria-label="Close"
          title="Close window"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Modal Content */}
        <div className="mx-auto w-full max-w-md rounded-lg p-8 shadow-xl">
          <h2 className="mx-auto mb-4 text-center text-2xl font-bold text-white">
            Notifications
          </h2>

          <hr className="mb-4 border-gray-700" />

          {/* Email Opt-in Section */}
          <div className="mb-4">
            <label className="text-white">
              <input
                type="checkbox"
                className="mr-2 scale-125"
                checked={emailOptIn}
                onChange={handleEmailOptInChange}
              />
              Opt-in for Email Notifications (default)
            </label>
          </div>
          <hr className="mb-4 border-gray-700" />


          {/* SMS Opt-in Section */}
          <div className="mb-4">
            <label className="text-white">
              <input
                type="checkbox"
                className="mr-2 scale-125"
                checked={smsOptIn}
                onChange={handleSmsOptInChange}
              />
              Opt-in for SMS Notifications (optional)
            </label>
          </div>

          {/* <hr className="mb-4 border-gray-700" /> */}

          {/* Phone Number Input */}
          <div className="mb-6">
            <label
              className={`mb-2 block text-white ${emailOptIn ? 'text-gray-500' : ''}`}
              htmlFor="phoneNumber"
            >
              Phone Number {smsOptIn && <span className="text-red-500">*</span>}
            </label>
            <Input
              id="phoneNumber"
              type="text"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="(123) 456-7890"
              className={`w-full rounded-md border bg-gray-800 p-3 text-white ${emailOptIn ? 'bg-gray-600' : ''}`}
              disabled={emailOptIn} // Disable input if Email is selected
              style={emailOptIn ? { opacity: 0.5 } : {}} // Visually indicate disabled state
            />
            {!isPhoneValid && phoneNumber && !emailOptIn && (
              <p className="mt-2 text-sm text-red-500">
                Please enter a valid phone number
              </p>
            )}
          </div>
          {/* <hr className="mb-4 border-gray-700" /> */}

          {/* Legal Notice */}
          <div className="mb-4 text-sm">
            <p>
              By opting in for SMS, you agree to receive a one-time SMS
              confirmation for each booking request submitted through this app.
              Message and data rates may apply. If you select and save Email as
              your preferred notification method, you will no longer receive SMS
              notifications from RYDEBLK for future bookings.
            </p>
          </div>

          <hr className="mb-6 border-gray-700" />

          {/* Save Button */}
          <Button
            onClick={handleSaveSettings}
            disabled={smsOptIn && !isPhoneValid} // Disable if SMS is selected and phone is invalid
            variant="green"
            size="md"
            className="w-full"
            title="Save"
          >
            <FaCheck className="mr-2" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
