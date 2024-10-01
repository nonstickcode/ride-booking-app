import supabase from '@/utils/supabaseClient';

// Function to check if user session exists
export const checkSession = async (setUser, showAlert, onSignInSuccess) => {
  const { data } = await supabase.auth.getSession();
  if (data?.session?.user) {
    setUser(data.session.user);
    showAlert('Signed in successfully!', 'success');
    onSignInSuccess();
  }
};

// Function to handle Google sign-in
export const handleGoogleSignIn = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) {
    console.error('Error signing in:', error);
    return false;
  }
  return true;
};

// Function to handle email sign-in
export const handleEmailSignIn = async (email) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) {
    console.error('Error sending magic link:', error);
    return false;
  }
  return true;
};

// Utility function to validate email
export const isValidEmail = (email) => {
  return email && validator.isEmail(email);
};
