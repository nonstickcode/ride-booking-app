// context/BookingValidationContext.js
import { createContext, useContext, useState } from 'react';

const BookingValidationContext = createContext();

export const BookingValidationProvider = ({ children }) => {
  const [isTimeTooSoon, setIsTimeTooSoon] = useState(false);
  const [isTimeInOffRange, setIsTimeInOffRange] = useState(false);
  const [isTimeUnavailable, setIsTimeUnavailable] = useState(false);

  return (
    <BookingValidationContext.Provider
      value={{
        isTimeTooSoon,
        setIsTimeTooSoon,
        isTimeInOffRange,
        setIsTimeInOffRange,
        isTimeUnavailable,
        setIsTimeUnavailable,
      }}
    >
      {children}
    </BookingValidationContext.Provider>
  );
};

// Hook to use the booking validation context
export const useBookingValidation = () => useContext(BookingValidationContext);
