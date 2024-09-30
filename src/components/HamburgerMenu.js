import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FaBars, FaSignOutAlt, FaSignInAlt, FaTimes } from 'react-icons/fa';
import supabase from '@/utils/supabaseClient';

const HamburgerMenu = ({ openSignInModal }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch user session from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user);
      }
    };
    fetchUser();
  }, []);

  const toggleMenu = () => {
    setShowMenu((prevState) => !prevState);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      setUser(null); // Clear the user state when logged out
    }
  };

  const handleSignIn = () => {
    setShowMenu(false);
    openSignInModal(); // Open the sign-in modal when the "Sign In" button is clicked
  };

  return (
    <div className="absolute top-4 right-4">
      <Button
        className="p-2 text-white rounded-md bg-transparent hover:text-gray-400 hover:bg-transparent focus:outline-none"
        onClick={toggleMenu}
      >
        {showMenu ? <FaTimes size={36} /> : <FaBars size={36} />}
      </Button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-gray-700 shadow-lg">
          <ul className="py-2">
            <li>
              <a
                href="#profile"
                className="block px-4 py-2 text-lg text-white hover:bg-gray-600"
              >
                Profile
              </a>
            </li>
            <li>
              <a
                href="#rides"
                className="block px-4 py-2 text-lg text-white hover:bg-gray-600"
              >
                My Rides
              </a>
            </li>
            <li>
              <a
                href="#settings"
                className="block px-4 py-2 text-lg text-white hover:bg-gray-600"
              >
                Settings
              </a>
            </li>
            <hr className="w-[92%] mx-auto my-1" />
            <li>
              {user ? (
                <a
                  href="#logout"
                  className="flex flex-row items-center px-4 py-2 text-lg text-white hover:bg-gray-600"
                  onClick={handleSignOut}
                >
                  <FaSignOutAlt className="mr-2" /> Sign Out
                </a>
              ) : (
                <a
                  href="#signin"
                  className="flex flex-row items-center px-4 py-2 text-lg text-white hover:bg-gray-600"
                  onClick={handleSignIn}
                >
                  <FaSignInAlt className="mr-2" /> Sign In
                </a>
              )}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;
