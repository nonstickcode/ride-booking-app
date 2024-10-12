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
