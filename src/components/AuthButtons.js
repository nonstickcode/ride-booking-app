'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FaGoogle, FaEnvelope } from 'react-icons/fa';
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
            className="mb-4 w-full rounded-md border bg-white p-3 text-black"
            placeholder="Enter your email"
            required
          />
          {emailSent ? (
            <p className="text-white">Check your email for the sign-in link.</p>
          ) : (
            <Button
              onClick={handleEmailSignIn}
              className="mb-6 w-full rounded-lg bg-gray-700 p-3 text-lg font-semibold text-white shadow-md hover:bg-gray-800"
            >
              <FaEnvelope className="mr-2" /> Send Sign-in Link
            </Button>
          )}
          <Button
            onClick={() => setSigningInWithEmail(false)}
            className="mb-6 w-full rounded-lg bg-gray-600 p-3 text-lg font-semibold text-white shadow-md hover:bg-gray-700"
          >
            Use Google Sign In
          </Button>
        </>
      ) : (
        <>
          <Button
            onClick={handleGoogleSignIn}
            className="mb-2 w-full rounded-lg bg-gray-700 p-3 text-lg font-semibold text-white shadow-md hover:bg-gray-800"
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
            className="my-2 w-full rounded-lg bg-gray-600 p-3 text-lg font-semibold text-white shadow-md hover:bg-gray-700"
          >
            <FaEnvelope className="mr-2" /> Sign in with Email
          </Button>
        </>
      )}
    </>
  );
};

export default AuthButtons;
