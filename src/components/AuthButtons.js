'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FaGoogle, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { Input } from './ui/input';
import supabase from '@/utils/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import validator from 'validator'; // Import validator for email validation

const AuthButtons = ({ onSignInSuccess }) => {
  const [signingInWithEmail, setSigningInWithEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false); // Track email validation
  const { showAlert, setUser } = useAuth();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
        showAlert('Signed in successfully!', 'success');
        onSignInSuccess(); // Call the success callback
      }
    };

    checkSession(); // Check session on component mount
  }, [onSignInSuccess, showAlert, setUser]);

  // Update email validation state when email changes
  useEffect(() => {
    setIsEmailValid(validator.isEmail(email)); // Use validator.js to validate email
  }, [email]);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      console.error('Error signing in:', error);
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
      console.log('Magic Link email sent successfully!');
    }
  };

  return (
    <>
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
            <p className="mb-4 font-semibold text-blue-500">
              Check your email for the sign-in link.
            </p>
          ) : (
            <Button
              onClick={handleEmailSignIn}
              disabled={!isEmailValid} // Disable the button if the email is invalid
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
            onClick={handleGoogleSignIn}
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
    </>
  );
};

export default AuthButtons;
