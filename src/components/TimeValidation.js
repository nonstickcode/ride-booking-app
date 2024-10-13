import React, { useState, useEffect, useCallback } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { DateTime } from 'luxon';
import { combineTimeWithTimezone } from '@/utils/dateTimeUtilsLuxon';
import { getTimezoneAbbreviation } from '@/utils/dateLuxon';
import supabase from '@/utils/supabaseClient';

const TimeValidation = ({
  combinedDateAndTime, // The combined date and time in ISO format
  isValidTime,
  setIsValidTime,
}) => {
  const [leadTime, setLeadTime] = useState({ hours: 0, minutes: 0 });
  const [offHours, setOffHours] = useState({
    start: '00:00:00',
    end: '00:00:00',
  });
  const [homeTimeZone, setHomeTimeZone] = useState('');
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [message, setMessage] = useState('');
  const [bookingLimitMonths, setBookingLimitMonths] = useState(null);

  // Fetch settings from the database (e.g., lead time, off-hours, timezone)
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('AdminSettings')
        .select(
          'lead_time_hours, lead_time_minutes, timeoff_start_time, timeoff_end_time, misc_advance_booking_limit_months, home_location_timezone'
        )
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching settings from AdminSettings:', error);
        return;
      }

      if (data) {
        setLeadTime({
          hours: data.lead_time_hours,
          minutes: data.lead_time_minutes,
        });
        setOffHours({
          start: data.timeoff_start_time,
          end: data.timeoff_end_time,
        });
        setBookingLimitMonths(data.misc_advance_booking_limit_months || null);
        setHomeTimeZone(data.home_location_timezone);
      }
    };

    fetchSettings();
  }, []);

  // Check if the selected date exceeds the booking limit
  const checkIfDateExceedsLimit = useCallback(
    (selectedDateTime) => {
      if (bookingLimitMonths !== null) {
        const maxAllowedDate = DateTime.now().plus({
          months: bookingLimitMonths,
        });

        if (selectedDateTime > maxAllowedDate) {
          const monthText = bookingLimitMonths === 1 ? 'month' : 'months';
          setMessage(
            `Bookings are not accepted more than ${bookingLimitMonths} ${monthText} in advance.`
          );
          setIsValidTime(false);
          return true;
        }
      }
      return false;
    },
    [bookingLimitMonths, setIsValidTime]
  );

  // Convert the lead time to a Luxon Duration for easier comparison
  const convertLeadTimeToDuration = useCallback(() => {
    const { hours, minutes } = leadTime;
    return { hours, minutes };
  }, [leadTime]);

  // Check if the selected time is within off-hours
  const checkIfTimeInOffHours = useCallback(
    (selectedDateTime) => {
      const timeoffStartWithTZ = combineTimeWithTimezone(
        offHours.start,
        homeTimeZone
      ).set({ year: 0, month: 0, day: 0 });
      const timeoffEndWithTZ = combineTimeWithTimezone(
        offHours.end,
        homeTimeZone
      ).set({ year: 0, month: 0, day: 0 });

      const selectedTimeOnly = selectedDateTime.set({
        year: 0,
        month: 0,
        day: 0,
      });

      // Helper function to format time
      const formatTime = (time) => {
        return time.minute === 0
          ? time.toFormat('h a') // No minutes, just hour and AM/PM
          : time.toFormat('h:mm a'); // Include minutes and AM/PM
      };

      const startDisplay = formatTime(timeoffStartWithTZ);
      const endDisplay = formatTime(timeoffEndWithTZ);

      // Use getTimezoneAbbreviation to get the 3-letter timezone abbreviation
      const timeZoneAbbreviation = getTimezoneAbbreviation(homeTimeZone);

      if (timeoffStartWithTZ > timeoffEndWithTZ) {
        // Overnight shift (start time is later in the day, end time is in the morning)
        if (
          selectedTimeOnly >= timeoffStartWithTZ ||
          selectedTimeOnly < timeoffEndWithTZ
        ) {
          setMessage(
            `No bookings are available between ${startDisplay} and ${endDisplay} (${timeZoneAbbreviation}).`
          );
          return true;
        }
      } else {
        // Regular off-hours (start time earlier than end time on the same day)
        if (
          selectedTimeOnly >= timeoffStartWithTZ &&
          selectedTimeOnly < timeoffEndWithTZ
        ) {
          setMessage(
            `No bookings are available between ${startDisplay} and ${endDisplay} (${timeZoneAbbreviation}).`
          );
          return true;
        }
      }
      return false;
    },
    [offHours, homeTimeZone]
  );

  // Main time validation logic
  const validateTime = useCallback(async () => {
    setMessage(''); // Clear any previous messages

    if (!combinedDateAndTime) {
      setMessage('Please select a valid date and time.');
      setIsValidTime(false);
      return;
    }

    const selectedDateTime = DateTime.fromISO(combinedDateAndTime);

    // Check if date exceeds booking limit
    if (checkIfDateExceedsLimit(selectedDateTime)) {
      return;
    }

    const now = DateTime.now();

    // Check if the selected time is in the past
    if (selectedDateTime < now) {
      setMessage('You cannot select a time in the past.');
      setIsValidTime(false);
      return;
    }

    // Check if the time is within off-hours
    if (checkIfTimeInOffHours(selectedDateTime)) {
      setIsValidTime(false);
      return;
    }

    // Check lead time if booking for today
    if (now.toISODate() === selectedDateTime.toISODate()) {
      const leadTimeDuration = convertLeadTimeToDuration();
      const leadTimeLimit = now.plus(leadTimeDuration);

      if (selectedDateTime < leadTimeLimit) {
        setMessage(
          `The driver needs at least ${leadTime.hours} ${
            leadTime.hours === 1 ? 'hour' : 'hours'
          }${leadTime.minutes > 0 ? ` and ${leadTime.minutes} minutes` : ''} notice for a ride request. Please select a later time.`
        );
        setIsValidTime(false);
        return;
      }
    }

    // Check calendar availability
    setLoadingAvailability(true);
    const startTime = selectedDateTime.toISO();
    const endTime = selectedDateTime.plus({ hours: 2 }).toISO();

    console.log('API check times:', { startTime, endTime });

    const requestBody = {
      timeMin: startTime,
      timeMax: endTime,
    };

    try {
      const response = await fetch('/api/calendar/checkCalendarAvailability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        setMessage('This time is unavailable. Please choose another time.');
        setIsValidTime(false);
        return;
      }

      const jsonResponse = await response.json();
      const busySlots = jsonResponse.busySlots || [];
      if (busySlots.length > 0) {
        setMessage('This time is unavailable. Please choose another time.');
        setIsValidTime(false);
      } else {
        setMessage('This date and time is available.');
        setIsValidTime(true);
      }
    } catch (error) {
      console.error('Error checking calendar availability:', error);
      setMessage('An error occurred. Please try again.');
      setIsValidTime(false);
    } finally {
      setLoadingAvailability(false);
    }
  }, [
    checkIfDateExceedsLimit,
    checkIfTimeInOffHours,
    convertLeadTimeToDuration,
    combinedDateAndTime,
    leadTime.hours,
    leadTime.minutes,
    setIsValidTime,
  ]);

  // Validate the time whenever `combinedDateAndTime` changes
  useEffect(() => {
    if (combinedDateAndTime) {
      validateTime(); // Run validation when combinedDateAndTime is set
    }
  }, [combinedDateAndTime, validateTime]);

  return (
    <div>
      {loadingAvailability ? (
        <div className="mt-3 flex items-center">
          <FaSpinner className="mr-2 animate-spin" />
          <p>Checking availability...</p>
        </div>
      ) : (
        <p
          className={`text-md mt-3 ${
            isValidTime ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default TimeValidation;
