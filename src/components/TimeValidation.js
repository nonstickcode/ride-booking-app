import React, { useState, useEffect, useCallback } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { combineDateAndTime } from '@/utils/dateUtils';
import addMonths from 'date-fns/addMonths'; // Add this for date comparison
import supabase from '@/utils/supabaseClient';

// Custom TimeValidation component
const TimeValidation = ({ date, time, isValidTime, setIsValidTime }) => {
  const [leadTime, setLeadTime] = useState({ hours: 0, minutes: 0 });
  const [offHours, setOffHours] = useState({
    start: '00:00:00',
    end: '00:00:00',
  });
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [message, setMessage] = useState('');
  const [bookingLimitMonths, setBookingLimitMonths] = useState(null); // State to store booking limit in months

  // Fetch booking limit, lead time, and off-hours from the database
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('AdminSettings')
        .select(
          'lead_time_hours, lead_time_minutes, timeoff_start_time, timeoff_end_time, misc_advance_booking_limit_months'
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
        setBookingLimitMonths(data.misc_advance_booking_limit_months || null); // Fetch booking limit in months
      }
    };

    fetchSettings();
  }, []);

  // Check if the selected date is beyond the allowed booking limit
  const checkIfDateExceedsLimit = useCallback(
    (selectedDate) => {
      if (bookingLimitMonths !== null) {
        const maxAllowedDate = addMonths(new Date(), bookingLimitMonths); // Calculate max date
        if (selectedDate > maxAllowedDate) {
          const monthText = bookingLimitMonths === 1 ? 'month' : 'months';
          setMessage(
            `Bookings are not accepted more than ${bookingLimitMonths} ${monthText} in advance.`
          );
          setIsValidTime(false); // Mark time as invalid and stop further checks
          return true;
        }
      }
      return false;
    },
    [bookingLimitMonths, setIsValidTime]
  );

  // Parse time from HH:MM:SS format to just hours
  const parseTime = useCallback((timeString) => {
    const [hours] = timeString.split(':').map(Number);
    return hours;
  }, []);

  // Format hours for user display
  const formatTimeForDisplay = useCallback((hours) => {
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours} ${period}`;
  }, []);

  // Check if the selected time is within off-hours
  const checkIfTimeInOffHours = useCallback(
    (time) => {
      const selectedHour = time.getHours();
      const start = parseTime(offHours.start);
      const end = parseTime(offHours.end);

      const startDisplay = formatTimeForDisplay(start);
      const endDisplay = formatTimeForDisplay(end);

      if (start > end) {
        if (selectedHour >= start || selectedHour < end) {
          setMessage(
            `No bookings are available between ${startDisplay} and ${endDisplay}.`
          );
          return true;
        }
      } else {
        if (selectedHour >= start && selectedHour < end) {
          setMessage(
            `No bookings are available between ${startDisplay} and ${endDisplay}.`
          );
          return true;
        }
      }

      return false;
    },
    [offHours, parseTime, formatTimeForDisplay]
  );

  // Convert lead time from hours and minutes to milliseconds
  const convertLeadTimeToMilliseconds = useCallback(() => {
    const { hours, minutes } = leadTime;
    return hours * 60 * 60 * 1000 + minutes * 60 * 1000;
  }, [leadTime]);

  // Validate the selected time and date
  const validateTime = useCallback(
    async (selectedTime) => {
      setMessage(''); // Clear any previous messages

      if (!selectedTime || !date) {
        setMessage('Please select a valid date and time.');
        setIsValidTime(false);
        return;
      }

      const combinedDateTime = combineDateAndTime(date, selectedTime);

      // Check if the date exceeds the booking limit first
      if (checkIfDateExceedsLimit(date)) {
        return; // Skip other checks if date exceeds the limit
      }

      // Check if time is in the past
      if (combinedDateTime < new Date()) {
        setMessage('You cannot select a time in the past.');
        setIsValidTime(false);
        return;
      }

      // Check if time falls within off-hours
      if (checkIfTimeInOffHours(combinedDateTime)) {
        setIsValidTime(false);
        return;
      }

      // Check for lead time if booking for today
      if (new Date().toDateString() === date.toDateString()) {
        const currentTime = new Date();
        const leadTimeInMilliseconds = convertLeadTimeToMilliseconds();
        const leadTimeLimit = new Date(
          currentTime.getTime() + leadTimeInMilliseconds
        );

        if (combinedDateTime < leadTimeLimit) {
          setMessage(
            `The driver needs at least ${leadTime.hours} ${leadTime.hours === 1 ? 'hour' : 'hours'}${leadTime.minutes > 0 ? ` and ${leadTime.minutes} minutes` : ''} notice for a ride request. Please select a later time.`
          );

          setIsValidTime(false);
          return;
        }
      }

      // Proceed with API check for availability if all prior checks pass
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
          setMessage('This date and time is available.'); // TODO: i need to see how the calendar api is being checked time frame wise and see how im setting time to check for
          setIsValidTime(true);
        }
      } catch (error) {
        console.error('Error checking calendar availability:', error);
        setMessage('An error occurred. Please try again.');
        setIsValidTime(false);
      } finally {
        setLoadingAvailability(false);
      }
    },
    [
      checkIfDateExceedsLimit,
      checkIfTimeInOffHours,
      convertLeadTimeToMilliseconds,
      date,
      leadTime.hours,
      leadTime.minutes,
      setIsValidTime,
    ]
  );

  useEffect(() => {
    if (time && date) {
      validateTime(time);
    }
  }, [time, date, validateTime]);

  return (
    <div>
      {loadingAvailability ? (
        <div className="flex items-center">
          <FaSpinner className="mr-2 animate-spin" />
          <p>Checking availability...</p>
        </div>
      ) : (
        <p
          className={`text-md mb-1 ${isValidTime ? 'text-green-500' : 'text-red-500'}`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default TimeValidation;
