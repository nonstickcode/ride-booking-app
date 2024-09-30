import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FaBars, FaSignOutAlt, FaTimes } from 'react-icons/fa';

const HamburgerMenu = ({ openSignInModal, user, onSignOut }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSignOutAlert, setShowSignOutAlert] = useState(false); // State for sign-out alert

  const toggleMenu = () => {
    setShowMenu((prevState) => !prevState);
  };

  const handleSignIn = () => {
    setShowMenu(false);
    openSignInModal(); // Open the sign-in modal when the "Sign In" button is clicked
  };

  const handleSignOut = () => {
    setShowMenu(false);
    onSignOut(); // Trigger sign-out action

    // Show sign-out alert for 3 seconds
    setShowSignOutAlert(true);
    setTimeout(() => {
      setShowSignOutAlert(false);
    }, 3000);
  };

  return (
    <div className="absolute top-2 right-2 z-50">
      <Button
        className="p-2 text-white rounded-md bg-transparent hover:text-gray-400 hover:bg-transparent focus:outline-none"
        onClick={toggleMenu}
      >
        {showMenu ? <FaTimes size={36} /> : <FaBars size={36} />}
      </Button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-gray-700 shadow-lg">
          <ul className="py-2">
            {user ? (
              <>
                <li>
                  <a
                    href="#rides"
                    className="block px-4 py-2 text-lg text-white hover:bg-gray-600"
                  >
                    My Rides
                  </a>
                </li>
                <hr className="w-[92%] mx-auto my-1" />
                <li>
                  <a
                    href="#logout"
                    className="flex flex-row items-center px-4 py-2 text-lg text-white hover:bg-gray-600"
                    onClick={handleSignOut}
                  >
                    <FaSignOutAlt className="mr-2" /> Sign Out
                  </a>
                </li>
              </>
            ) : (
              <li>
                <a
                  href="#login"
                  className="block px-4 py-2 text-lg text-white hover:bg-gray-600"
                  onClick={handleSignIn}
                >
                  Sign In
                </a>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Sign-out alert banner */}
      {showSignOutAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 p-4 text-center text-white">
          Signed out successfully!
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;