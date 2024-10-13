import { DateTime } from 'luxon';

/**
 * Combines the selected date from the DatePicker and the time (with timezone)
 * from the TimePicker into a single `timestamptz` format.
 *
 * @param {Date} date - The selected date object (date part only).
 * @param {Date} time - The selected time object (includes time and timezone).
 * @returns {string} - A string representing the combined date and time in ISO format with timezone.
 */
const combineDateAndTimeLuxon = (date, time) => {
  if (!date || !time) return null;

  // Create a Luxon DateTime for the date
  const dateOnly = DateTime.fromJSDate(date, { zone: 'local' });

  // Create a Luxon DateTime for the time, including its timezone
  const timeOnly = DateTime.fromJSDate(time, { zone: 'local' });

  // Combine the date and time, retaining the timezone from the time object
  const combinedDateTime = dateOnly.set({
    hour: timeOnly.hour,
    minute: timeOnly.minute,
    second: timeOnly.second,
    millisecond: timeOnly.millisecond,
  });

  // Return the combined date and time in `timestamptz` (ISO format with timezone)
  return combinedDateTime.toISO();
};

/**
 * Combines a time string (e.g., "22:00:00") with the home location's timezone.
 *
 * @param {string} time - The time string (e.g., "22:00:00").
 * @param {string} timezone - The timezone string (e.g., "America/Phoenix").
 * @returns {DateTime} - A Luxon DateTime object with the combined time and timezone.
 */
const combineTimeWithTimezone = (time, timezone) => {
  // Get the current date (today's date) in the specified timezone
  const now = DateTime.now().setZone(timezone);

  // Split the time string into hours, minutes, and seconds
  const [hours, minutes, seconds] = time.split(':').map(Number);

  // Combine the current date with the specified time
  const combinedTime = now.set({
    hour: hours,
    minute: minutes,
    second: seconds || 0, // Default to 0 seconds if not provided
  });

  // console.log(`combineTimeWithTimezone returns: ${combinedTime.toISO()}`);

  return combinedTime;
};

/**
 * Strips the date from a combined DateTime and only returns the time and timezone.
 *
 * @param {string} combinedDateTimeISO - The combined date and time in ISO format.
 * @returns {string} - A string representing only the time and timezone (in ISO format).
 */
const stripDateFromDateTime = (combinedDateTimeISO) => {
  const dateTime = DateTime.fromISO(combinedDateTimeISO);

  // Strip the date part and return only the time and timezone
  const timeOnly = dateTime.toFormat('HH:mm:ss ZZZ');

  // console.log(`stripDateFromDateTime returns: ${timeOnly}`);

  return timeOnly;
};

// Test cases to demonstrate the output
const date = new Date(2024, 9, 25); // Oct 25, 2024
const time = new Date(2024, 9, 12, 16, 20); // 4:20 PM, Oct 12, 2024
const timeoffStart = '22:00:00'; // 10 PM timeoff start
const timeoffEnd = '10:00:00'; // 10 AM timeoff end
const homeTimezone = 'America/Phoenix';

// Combine date and time using combineDateAndTimeLuxon
const combinedDateAndTime = combineDateAndTimeLuxon(date, time);

// Combine timeoff start with timezone
combineTimeWithTimezone(timeoffStart, homeTimezone);

// Combine timeoff end with timezone
combineTimeWithTimezone(timeoffEnd, homeTimezone);

// Strip the date from combinedDateAndTime to compare just time and timezone
stripDateFromDateTime(combinedDateAndTime);

export {
  combineDateAndTimeLuxon,
  combineTimeWithTimezone,
  stripDateFromDateTime,
};
