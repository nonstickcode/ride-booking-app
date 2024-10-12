// utils/dateLuxon.js

import { DateTime } from 'luxon';

// Function to combine a date and time, ensuring it handles timezones correctly
export const combineDateAndTime = (selectedDate, selectedTime) => {
  if (!selectedDate || !selectedTime) return null;

  // Convert selectedDate and selectedTime into Luxon DateTime objects
  const date = DateTime.fromJSDate(selectedDate); // The date from DatePicker
  const time = DateTime.fromJSDate(selectedTime); // The time from TimePicker

  // Combine the date and time, preserving the timezone
  const combinedDateTime = date.set({
    hour: time.hour,
    minute: time.minute,
    second: 0, // Set seconds to 0
  });

  return combinedDateTime;
};

// Utility function to format the booking's date and time
export const formatDateTime = (isoString) => {
  if (!isoString) return { formattedDate: '', formattedTime: '' };

  const bookingDateTime = DateTime.fromISO(isoString);

  // Format the date as: Thu, Nov 28, 2024
  const formattedDate = bookingDateTime.toLocaleString({
    weekday: 'short', // Thu
    month: 'short', // Nov
    day: '2-digit', // 28
    year: 'numeric', // 2024
  });

  // Format the time as: 3:55 PM MST
  const formattedTime = bookingDateTime.toLocaleString({
    hour: 'numeric',
    minute: '2-digit',
    hour12: true, // AM/PM
    timeZoneName: 'short', // MST
  });

  return { formattedDate, formattedTime };
};

// Function to parse a date string and return a Luxon DateTime object
export const parseDateString = (dateString) => {
  try {
    return DateTime.fromISO(dateString);
  } catch (error) {
    console.error('Invalid date string:', dateString);
    return null;
  }
};
