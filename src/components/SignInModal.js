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

      if (error) {
        console.error('Error signing in with Google:', error.message || error);
        return false;
      }

      if (data) {
        console.log('Google OAuth sign-in initiated.');
        return true;
      }

      return true;
    } catch (criticalError) {
      console.error('Critical error during Google sign-in:', criticalError);
      return false;
    }
  };

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
      className="modal-background fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="modal-container relative w-[90vw] max-w-sm p-2 shadow-xl"
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

        <div className="p-8">
          <div className="mx-auto mb-6 w-[80%] text-center text-xl font-bold text-white">
            Sign-In to Book a Ride
          </div>

          {signingInWithEmail ? (
            <>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field mb-6 w-full"
                placeholder="Enter your email"
                required
              />
              {emailSent ? (
                <p className="text-md mb-6 text-center font-extrabold text-blue-500">
                  Check your email for the Sign-In link.
                </p>
              ) : (
                <Button
                  onClick={handleEmailSignIn}
                  disabled={!isEmailValid}
                  variant="green"
                  size="md"
                  className="mb-6"
                  title="Send Sign-in Link"
                >
                  <FaEnvelope className="mr-2" /> Send Sign-In Link
                </Button>
              )}
              <Button
                onClick={() => setSigningInWithEmail(false)}
                variant="gray"
                size="md"
                className="mb-6"
                title="Return to sign-in options"
              >
                <FaArrowLeft className="mr-2" />
                Return to Sign-In options
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleGoogleSignIn}
                variant="blue"
                size="md"
                className="mb-2"
                title="Sign in with Google"
              >
                <FaGoogle className="mr-2" /> Sign-In with Google
              </Button>
              <div className="my-2 flex items-center">
                <div className="flex-grow border-t border-gray-500"></div>
                <span className="mx-4 text-gray-400">or</span>
                <div className="flex-grow border-t border-gray-500"></div>
              </div>
              <Button
                onClick={() => setSigningInWithEmail(true)}
                variant="gray"
                size="md"
                className="my-2"
                title="Sign in with Email"
              >
                <FaEnvelope className="mr-2" /> Sign-In with Email
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
