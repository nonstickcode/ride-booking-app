import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FaBars, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext'; // Import useAuth from context

const HamburgerMenu = ({ openSignInModal, onSignOut }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null); // Create a ref for the menu
  const { user, showAlert } = useAuth(); // Access user and showAlert from AuthContext

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

    // Trigger global sign-out alert using context
    showAlert('Signed out successfully!', 'error');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false); // Close the menu if clicked outside
      }
    };

    // Add event listener for clicks
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Cleanup the event listener when the component unmounts
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="absolute right-2 top-2 z-50">
      <Button
        className="rounded-md bg-transparent p-2 text-white hover:bg-transparent hover:text-gray-400 focus:outline-none"
        onClick={toggleMenu}
      >
        {showMenu ? <FaTimes size={36} /> : <FaBars size={36} />}
      </Button>

      {showMenu && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-56 rounded-lg bg-gray-700 shadow-lg"
        >
          <ul className="py-2">
            {user ? ( // Access user from AuthContext
              <>
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
                <hr className="mx-auto my-1 w-[92%]" />
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
    </div>
  );
};

export default HamburgerMenu;
