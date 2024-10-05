import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { combineDateAndTime } from '@/utils/dateUtils';

const TimeValidation = ({
  date,
  time,
  leadTime,
  offTimeStart,
  offTimeEnd,
  isTimeTooSoon,
  setIsTimeTooSoon,
  isTimeInOffRange,
  setIsTimeInOffRange,
  isTimeUnavailable,
  setIsTimeUnavailable,
  loadingAvailability,
  setLoadingAvailability,
}) => {
  const [hasCheckedAvailability, setHasCheckedAvailability] = useState(false);
  const [isOffHours, setIsOffHours] = useState(false);
  const [formattedOffHours, setFormattedOffHours] = useState('');

  // Helper function to format off-hours range as a string
  const formatOffHours = (start, end) => {
    const formatHour = (hour) => {
      const period = hour >= 12 ? 'pm' : 'am';
      const hourFormatted = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${hourFormatted}${period}`;
    };
    return `No bookings are available between ${formatHour(start)} and ${formatHour(end)}.`;
  };

  // Check if the selected time is within off-hours and set the flag and message
  const checkIfTimeInOffHours = (time) => {
    const hours = time.getHours();
    const isOffHours =
      offTimeStart > offTimeEnd
        ? hours >= offTimeStart || hours < offTimeEnd
        : hours >= offTimeStart && hours < offTimeEnd;

    setIsOffHours(isOffHours); // Set the off-hours flag
    setFormattedOffHours(formatOffHours(offTimeStart, offTimeEnd)); // Set the formatted off-hours message
    return isOffHours;
  };

  // Validate the selected time based on lead time and Google Calendar availability
  const validateTime = async (selectedTime) => {
    if (!selectedTime || !date) {
      console.error('Time or date is missing');
      return;
    }

    // Reset validation flags
    setIsTimeTooSoon(false);
    setIsTimeInOffRange(false);
    setIsTimeUnavailable(false);
    setIsOffHours(false); // Reset the off-hours flag

    const combinedDateTime = combineDateAndTime(date, selectedTime);

    // Check if time is in off-hours
    const inOffHours = checkIfTimeInOffHours(combinedDateTime);
    if (inOffHours) {
      setIsTimeInOffRange(true); // Disable submit button due to off-hours
      return; // No further checks if in off-hours
    }

    // Check if the selected time is too soon (less than the lead time)
    if (new Date().toDateString() === date.toDateString()) {
      const currentTime = new Date();
      const leadTimeLimit = new Date(currentTime.getTime() + leadTime);
      if (combinedDateTime < leadTimeLimit) {
        setIsTimeTooSoon(true);
        return; // No further checks if time is too soon
      }
    }

    // Proceed with API check for availability if no prior warnings
    setLoadingAvailability(true);

    const startTime = combinedDateTime.toISOString();
    const endTime = new Date(
      combinedDateTime.getTime() + 2 * 60 * 60 * 1000
    ).toISOString();

    const requestBody = {
      timeMin: startTime,
      timeMax: endTime,
    };

    try {
      const response = await fetch('/api/checkCalendarAvailability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from API:', response.status, errorText);
        setIsTimeUnavailable(true);
        return;
      }

      const jsonResponse = await response.json();
      const busySlots = jsonResponse.busySlots || [];
      setIsTimeUnavailable(busySlots.length > 0);
    } catch (error) {
      console.error('Error checking calendar availability:', error);
      setIsTimeUnavailable(true);
    } finally {
      setLoadingAvailability(false);
      setHasCheckedAvailability(true);
    }
  };

  // Ensure that validation only runs once when time or date changes
  useEffect(() => {
    if (time && date) {
      validateTime(time);
    }
  }, [time, date]);

  return (
    <div>
      {/* Warning for off-hours */}
      {isOffHours && (
        <p className="text-red-500">
          {formattedOffHours} {/* Display the formatted off-hours message */}
        </p>
      )}

      {/* Too soon warning */}
      {isTimeTooSoon && (
        <p className="text-red-500">
          The selected time is too soon. Please select a time at least{' '}
          {leadTime / (60 * 60 * 1000)} hours in advance.
        </p>
      )}

      {/* Loading spinner for availability check */}
      {loadingAvailability && !isOffHours && !isTimeTooSoon && (
        <div className="flex items-center">
          <FaSpinner className="mr-2 animate-spin" />
          <p>Checking availability...</p>
        </div>
      )}

      {/* Availability check result messages */}
      {!loadingAvailability &&
        hasCheckedAvailability &&
        !isTimeUnavailable &&
        !isOffHours &&
        !isTimeTooSoon && (
          <p className="text-md mb-1 text-green-500">
            This Date and Time is currently available.
          </p>
        )}
      {!loadingAvailability &&
        hasCheckedAvailability &&
        isTimeUnavailable &&
        !isOffHours &&
        !isTimeTooSoon && (
          <p className="text-md mb-1 text-red-500">
            This Date and Time is currently not available. Please choose another
            Date or Time or both.
          </p>
        )}
    </div>
  );
};

export default TimeValidation;
