// utils/dateLuxon.js

import { DateTime } from 'luxon';

export const combineDateAndTime = (selectedDate, selectedTime) => {
  if (
    !selectedDate ||
    !selectedTime ||
    typeof selectedTime.hours !== 'number' ||
    typeof selectedTime.minutes !== 'number'
  ) {
    console.error('Date or time is missing or incorrectly formatted.');
    return null;
  }

  console.log('Selected Date:', selectedDate);
  console.log('Selected Time:', selectedTime);

  // Create a Luxon DateTime object from the selected date
  const date = DateTime.fromJSDate(selectedDate); // Base date object

  // Handle the timezone offset, converting it to a timezone string for Luxon
  const timezone = `UTC${selectedTime.timezoneOffset >= 0 ? '-' : '+'}${Math.abs(selectedTime.timezoneOffset) / 60}`;

  // Combine date and time
  const combinedDateTime = date
    .set({
      hour: selectedTime.hours,
      minute: selectedTime.minutes,
      second: 0,
    })
    .setZone(timezone);

  console.log('Combined DateTime:', combinedDateTime.toISO()); // Log ISO format

  return combinedDateTime.isValid ? combinedDateTime : null;
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

// Function to get timezone abbreviation from the full timezone string
export const getTimezoneAbbreviation = (timezone) => {
  if (!timezone) return '';

  const dt = DateTime.now().setZone(timezone);

  // Use toLocaleString to get the 3-letter abbreviation (e.g., "EST", "PST")
  return dt.toLocaleString({ timeZoneName: 'short' }).split(' ').pop();
};
