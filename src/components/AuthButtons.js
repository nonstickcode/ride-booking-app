'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FaGoogle, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { Input } from './ui/input';

const AuthButtons = ({
  handleGoogleSignIn,
  handleEmailSignIn,
  signingInWithEmail,
  setSigningInWithEmail,
  email,
  setEmail,
  emailSent,
}) => {
  return (
    <>
      {signingInWithEmail ? (
        <>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-6 w-full text-xl rounded-md border bg-white p-3 text-black"
            placeholder="Enter your email"
            required
          />
          {emailSent ? (
            <p className="text-blue-500 font-semibold mb-4">Check your email for the sign-in link.</p>
          ) : (
            <Button
              onClick={handleEmailSignIn}
              className="mb-6 w-full rounded-lg bg-green-600 p-3 text-lg font-semibold text-white shadow-md hover:bg-green-700"
            >
              <FaEnvelope className="mr-2" /> Send Sign-in Link
            </Button>
          )}
          <Button
            onClick={() => setSigningInWithEmail(false)}
            className="mb-6 w-full rounded-lg bg-gray-600 p-3 text-lg font-semibold text-white shadow-md hover:bg-gray-700"
          >
            <FaArrowLeft className="mr-2" />Return to sign-in options
          </Button>
        </>
      ) : (
        <>
          <Button
            onClick={handleGoogleSignIn}
            className="mb-2 mt-3 w-full rounded-lg bg-blue-600 p-3 text-lg font-semibold text-white shadow-md hover:bg-blue-700"
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
            className="my-2 w-full rounded-lg bg-green-600 p-3 text-lg font-semibold text-white shadow-md hover:bg-green-700"
          >
            <FaEnvelope className="mr-2" /> Sign in with Email
          </Button>
        </>
      )}
    </>
  );
};

export default AuthButtons;
