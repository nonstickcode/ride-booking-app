'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FaGoogle, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import supabase from '@/utils/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import validator from 'validator';

const SignInModal = ({ onClose, onSignInSuccess }) => {
  const [signingInWithEmail, setSigningInWithEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { showAlert, setUser } = useAuth();
  const [isEmailValid, setIsEmailValid] = useState(false);

  // Check if a session exists on load
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
        showAlert('Signed in successfully!', 'success');
        onSignInSuccess();
      }
    };

    checkSession();
  }, [setUser, showAlert, onSignInSuccess]);

  // Update email validity when email changes
  useEffect(() => {
    setIsEmailValid(validator.isEmail(email));
  }, [email]);

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
  
      // Log actual critical errors only
      if (error) {
        console.error('Error signing in with Google:', error.message || error);
        return false;
      }
  
      // Supabase's OAuth often redirects, so treat data as a success if present
      if (data) {
        console.log('Google OAuth sign-in initiated.');
        return true;
      }
  
      // Return success if no critical errors occur
      return true;
    } catch (criticalError) {
      // Catch any unexpected critical errors
      console.error('Critical error during Google sign-in:', criticalError);
      return false;
    }
  };
  


  // Handle email sign-in
  const handleEmailSignIn = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error('Error sending magic link:', error);
    } else {
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
                  onClick={handleEmailSignIn}
                  disabled={!isEmailValid}
                  variant={isEmailValid ? 'default' : 'default'}
                  size="lg"
                  className="mb-6 bg-green-700 w-full"
                >
                  <FaEnvelope className="mr-2" /> Send Sign-in Link
                </Button>
              )}
              <Button
                onClick={() => setSigningInWithEmail(false)}
                variant="default"
                size="default"
                className="mb-6 bg-gray-500 w-full"
              >
                <FaArrowLeft className="mr-2" />
                Return to sign-in options
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleGoogleSignIn}
                variant="default"
                size="default"
                className="mb-2 bg-blue-700 w-full"
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
                variant="default"
                size="default"
                className="my-2 bg-gray-500 w-full"
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
