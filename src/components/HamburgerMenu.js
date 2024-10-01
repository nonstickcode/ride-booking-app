import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  FaBars,
  FaBell,
  FaCar,
  FaCog,
  FaSignOutAlt,
  FaTimes,
} from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import NotificationsModal from '@/components/NotificationsModal';
import MyRidesModal from '@/components/MyRidesModal';
import SettingsModal from '@/components/SettingsModal'; // Make sure this is correctly imported

const HamburgerMenu = ({ openSignInModal, onSignOut }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // Track which modal is open
  const menuRef = useRef(null);
  const { user, showAlert } = useAuth();

  const toggleMenu = () => {
    setShowMenu((prevState) => !prevState);
  };

  const handleModalOpen = (modalType) => {
    setActiveModal(modalType); // Open specific modal
    setShowMenu(false); // Close menu
  };

  const handleModalClose = () => {
    setActiveModal(null); // Close any open modal
  };

  const handleSignIn = () => {
    setShowMenu(false);
    openSignInModal();
  };

  const handleSignOut = () => {
    setShowMenu(false);
    onSignOut();
    showAlert('Signed out successfully!', 'error');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="absolute right-2 top-2 z-50 md:right-4 md:top-4">
      <Button onClick={toggleMenu} variant="hamburger" size="icon" title="Menu">
        {showMenu ? <FaTimes size={36} /> : <FaBars size={36} />}
      </Button>

      {showMenu && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-56 rounded-lg bg-gray-700 shadow-lg"
        >
          <ul className="py-2">
            {user ? (
              <>
                <li>
                  <a
                    href="#rides"
                    className="flex flex-row items-center px-4 py-2 text-lg text-white hover:bg-gray-600"
                    onClick={() => handleModalOpen('rides')}
                  >
                    <FaCar className="mr-2" /> My Rides
                  </a>
                </li>
                <li>
                  <a
                    href="#notifications"
                    className="flex flex-row items-center px-4 py-2 text-lg text-white hover:bg-gray-600"
                    onClick={() => handleModalOpen('notifications')}
                  >
                    <FaBell className="mr-2" /> Notifications
                  </a>
                </li>
                <li>
                  <a
                    href="#settings"
                    className="flex flex-row items-center px-4 py-2 text-lg text-white hover:bg-gray-600"
                    onClick={() => handleModalOpen('settings')} // Open settings modal
                  >
                    <FaCog className="mr-2" /> Settings
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

      {/* Conditionally render modals based on the active modal */}
      {activeModal === 'notifications' && (
        <NotificationsModal onClose={handleModalClose} />
      )}
      {activeModal === 'rides' && <MyRidesModal onClose={handleModalClose} />}
      {activeModal === 'settings' && (
        <SettingsModal onClose={handleModalClose} />
      )}
    </div>
  );
};

export default HamburgerMenu;
