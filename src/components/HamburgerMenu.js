import { useState } from 'react';
import {
  FaBars,
  FaBell,
  FaCar,
  FaCog,
  FaSignOutAlt,
  FaTimes,
  FaSignInAlt, // Import for Sign In icon
} from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import NotificationsModal from '@/components/NotificationsModal';
import MyRidesModal from '@/components/MyRidesModal';
import SettingsModal from '@/components/SettingsModal';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const HamburgerMenu = ({ openSignInModal, onSignOut }) => {
  const [activeModal, setActiveModal] = useState(null);
  const { user, showAlert } = useAuth();

  const handleModalOpen = (modalType) => {
    setActiveModal(modalType); // Open specific modal
  };

  const handleModalClose = () => {
    setActiveModal(null); // Close any open modal
  };

  const handleSignIn = () => {
    openSignInModal();
  };

  const handleSignOut = () => {
    onSignOut();
    showAlert('Signed out successfully!', 'error');
  };

  return (
    <div className="absolute right-2 top-2 z-50 md:right-4 md:top-4">
      <DropdownMenu>
        {/* Trigger button */}
        <DropdownMenuTrigger asChild>
          <Button variant="hamburger" size="icon" title="Menu">
            <FaBars size={36} />
          </Button>
        </DropdownMenuTrigger>

        {/* Dropdown menu content */}
        <DropdownMenuContent
          className="mt-2 w-72 bg-gray-700 text-white border border-gray-500 shadow-lg"
        >
          {user ? (
            <>
              <DropdownMenuLabel className="text-white font-bold text-2xl">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => handleModalOpen('rides')}
                className="flex items-center"
              >
                <FaCar className="mr-2" /> My Rides
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleModalOpen('notifications')}
                className="flex items-center"
              >
                <FaBell className="mr-2" /> Notifications
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleModalOpen('settings')}
                className="flex items-center"
              >
                <FaCog className="mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleSignOut}
                className="flex items-center text-red-400"
              >
                <FaSignOutAlt className="mr-2 " /> Sign Out
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem
              onSelect={handleSignIn}
              className="flex items-center text-green-400"
            >
              <FaSignInAlt className="mr-2" /> Sign In
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
