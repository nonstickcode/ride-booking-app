import { useState } from 'react';
import {
  FaBars,
  FaBell,
  FaCar,
  FaCog,
  FaSignOutAlt,
  FaSignInAlt,
} from 'react-icons/fa';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'; // Use Supabase session hooks
import NotificationsModal from '@/components/modals/NotificationsModal';
import MyRidesModal from '@/components/modals/MyRidesModal';
import SettingsModal from '@/components/modals/SettingsModal';
import AdminSettingsModal from '@/components/admin/AdminSettingsModal'; // New Admin Settings Modal import
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/modifiedUI/dropdown-menu';
import { Button } from '@/components/modifiedUI/button';

const HamburgerMenu = ({ openSignInModal, onSignOut, isAdmin }) => {
  const [activeModal, setActiveModal] = useState(null);

  // Supabase hooks to access session and perform auth operations
  const session = useSession();
  const supabase = useSupabaseClient();

  // Extract user from session
  const user = session?.user;

  const handleModalOpen = (modalType) => {
    setActiveModal(modalType); // Open specific modal
  };

  const handleModalClose = () => {
    setActiveModal(null); // Close any open modal
  };

  const handleSignIn = () => {
    openSignInModal();
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      onSignOut();
    }
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
        <DropdownMenuContent className="mr-4 mt-2 w-72 border border-gray-500 bg-gray-700 text-white shadow-lg">
          {user ? (
            <>
              <DropdownMenuLabel className="text-2xl font-bold text-white">
                {isAdmin ? 'Hi Jamie!' : 'My Account'}
              </DropdownMenuLabel>

              <DropdownMenuSeparator />
              {isAdmin ? (
                <DropdownMenuItem
                  onSelect={() => handleModalOpen('adminSettings')}
                  className="flex items-center"
                  title="Admin Settings"
                >
                  <FaCog className="mr-2" /> Admin Settings
                </DropdownMenuItem>
              ) : (
                <>
                  {/* Regular user menu */}
                  <DropdownMenuItem
                    onSelect={() => handleModalOpen('rides')}
                    className="flex items-center"
                    title="My Rides"
                  >
                    <FaCar className="mr-2" /> My Rides
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => handleModalOpen('notifications')}
                    className="flex items-center"
                    title="Notifications"
                  >
                    <FaBell className="mr-2" /> Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => handleModalOpen('settings')}
                    className="flex items-center"
                    title="Settings"
                  >
                    <FaCog className="mr-2" /> Settings
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleSignOut}
                className="flex items-center text-red-400"
                title="Sign-Out"
              >
                <FaSignOutAlt className="mr-2" /> Sign-Out
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem
              onSelect={handleSignIn}
              className="flex items-center text-green-400"
              title="Sign-In"
            >
              <FaSignInAlt className="mr-2" /> Sign-In
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
      {activeModal === 'adminSettings' && (
        <AdminSettingsModal onClose={handleModalClose} />
      )}
    </div>
  );
};

export default HamburgerMenu;
