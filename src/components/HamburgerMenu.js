import { useState } from 'react';
import {
  FaBars,
  FaBell,
  FaCar,
  FaCog,
  FaSignOutAlt,
  FaSignInAlt,
} from 'react-icons/fa';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'; // Supabase hooks
import NotificationsModal from '@/components/modals/NotificationsModal';
import MyRidesModal from '@/components/modals/MyRidesModal';
import SettingsModal from '@/components/modals/SettingsModal';
import AdminSettingsModal from '@/components/admin/AdminSettingsModal';
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

  const session = useSession();
  const supabase = useSupabaseClient();
  const user = session?.user;

  const handleModalOpen = (modalType) => {
    setActiveModal(modalType);
  };

  const handleModalClose = () => {
    setActiveModal(null);
  };

  const handleSignIn = () => {
    openSignInModal();
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) onSignOut();
  };

  return (
    <div className="">
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
                >
                  <FaCog className="mr-2" /> Admin Settings
                </DropdownMenuItem>
              ) : (
                <>
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
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleSignOut}
                className="flex items-center text-red-400"
              >
                <FaSignOutAlt className="mr-2" /> Sign-Out
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem
                onSelect={handleSignIn}
                className="flex items-center text-green-400"
              >
                <FaSignInAlt className="mr-2" /> Sign-In
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Conditionally render modals */}
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
