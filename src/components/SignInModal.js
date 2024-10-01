'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FaGoogle, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import {
  checkSession,
  handleGoogleSignIn,
  handleEmailSignIn,
  isValidEmail,
} from '@/utils/authUtils';

const SignInModal = ({ onClose, onSignInSuccess }) => {
  const [signingInWithEmail, setSigningInWithEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { showAlert, setUser } = useAuth();
  const [isEmailValid, setIsEmailValid] = useState(false);

  // Check if a session exists on load
  useEffect(() => {
    checkSession(setUser, showAlert, onSignInSuccess);
  }, [setUser, showAlert, onSignInSuccess]);

  // Update email validity when email changes
  useEffect(() => {
    setIsEmailValid(isValidEmail(email));
  }, [email]);

  // Handle Google sign-in
  const handleGoogleClick = async () => {
    const success = await handleGoogleSignIn();
    if (success) {
      onSignInSuccess();
    }
  };

  // Handle email sign-in
  const handleEmailClick = async () => {
    const success = await handleEmailSignIn(email);
    if (success) {
      setEmailSent(true);
    }
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
        <button
          onClick={onClose}
          className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center text-gray-400 transition hover:text-white"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-8">
          <div className="mx-auto mb-6 w-[80%] text-center text-xl font-bold text-white">
            Sign in to Book a Ride
          </div>

          {signingInWithEmail ? (
            <>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-6 w-full rounded-md border bg-white p-3 text-xl text-black"
                placeholder="Enter your email"
                required
              />
              {emailSent ? (
                <p className="text-md mb-6 text-center font-extrabold text-blue-500">
                  Check your email for the sign-in link.
                </p>
              ) : (
                <Button
                  onClick={handleEmailClick}
                  disabled={!isEmailValid}
                  className={`mb-6 w-full rounded-lg ${
                    isEmailValid ? 'bg-green-600' : 'bg-gray-400'
                  } p-3 text-lg font-semibold text-white shadow-md ${
                    isEmailValid ? 'hover:bg-green-700' : ''
                  }`}
                >
                  <FaEnvelope className="mr-2" /> Send Sign-in Link
                </Button>
              )}
              <Button
                onClick={() => setSigningInWithEmail(false)}
                className="mb-6 w-full rounded-lg bg-gray-600 p-3 text-lg font-semibold text-white shadow-md hover:bg-gray-700"
              >
                <FaArrowLeft className="mr-2" />
                Return to sign-in options
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleGoogleClick}
                className="mb-2 w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 p-3 text-lg text-white shadow-md transition hover:bg-gradient-to-l"
              >
                <FaGoogle className="mr-2" /> Sign in with Google
              </Button>
              <div className="my-2 flex items-center">
                <div className="flex-grow border-t border-gray-500"></div>
                <span className="mx-4 text-gray-400">or</span>
                <div className="flex-grow border-t border-gray-500"></div>
              </div>
              <Button
                onClick={() => setSigningInWithEmail(true)}
                className="my-2 w-full rounded-lg bg-gradient-to-r from-green-600 to-green-800 p-3 text-lg text-white shadow-md transition hover:bg-gradient-to-l"
              >
                <FaEnvelope className="mr-2" /> Sign in with Email
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
