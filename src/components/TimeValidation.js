import React, { useState, useEffect, useCallback } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { DateTime } from 'luxon';
import { combineDateAndTime } from '@/utils/dateTime';
import supabase from '@/utils/supabaseClient';

const TimeValidation = ({ date, time, isValidTime, setIsValidTime }) => {
  const [leadTime, setLeadTime] = useState({ hours: 0, minutes: 0 });
  const [offHours, setOffHours] = useState({
    start: '00:00:00',
    end: '00:00:00',
  });
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [message, setMessage] = useState('');
  const [bookingLimitMonths, setBookingLimitMonths] = useState(null);

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
        setBookingLimitMonths(data.misc_advance_booking_limit_months || null);
      }
    };

    fetchSettings();
  }, []);

  // Check if the selected date exceeds the allowed booking limit
  const checkIfDateExceedsLimit = useCallback(
    (selectedDate) => {
      if (bookingLimitMonths !== null) {
        const maxAllowedDate = DateTime.now().plus({
          months: bookingLimitMonths,
        });
        if (selectedDate > maxAllowedDate) {
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

  // Convert the lead time to milliseconds for easier comparison
  const convertLeadTimeToMilliseconds = useCallback(() => {
    const { hours, minutes } = leadTime;
    return hours * 3600000 + minutes * 60000; // Convert lead time to milliseconds
  }, [leadTime]);

  // Check if the selected time is within off-hours
  const checkIfTimeInOffHours = useCallback(
    (time) => {
      const selectedHour = time.getHours();
      const startHour = DateTime.fromFormat(offHours.start, 'HH:mm:ss').hour;
      const endHour = DateTime.fromFormat(offHours.end, 'HH:mm:ss').hour;

      if (startHour > endHour) {
        if (selectedHour >= startHour || selectedHour < endHour) {
          setMessage(
            `No bookings are available between ${offHours.start} and ${offHours.end}.`
          );
          return true;
        }
      } else if (selectedHour >= startHour && selectedHour < endHour) {
        setMessage(
          `No bookings are available between ${offHours.start} and ${offHours.end}.`
        );
        return true;
      }
      return false;
    },
    [offHours]
  );

  const validateTime = useCallback(
    async (selectedTime) => {
      setMessage(''); // Clear any previous messages

      if (!selectedTime || !date) {
        setMessage('Please select a valid date and time.');
        setIsValidTime(false);
        return;
      }

      // Convert date and time to Luxon DateTime if necessary
      const luxonDate = DateTime.fromJSDate(date);
      const combinedDateTime = combineDateAndTime(luxonDate, selectedTime);

      // Check if the date exceeds the booking limit first
      if (checkIfDateExceedsLimit(luxonDate)) {
        return; // Skip other checks if date exceeds the limit
      }

      const now = DateTime.now();

      // Check if the selected time is in the past
      if (combinedDateTime < now) {
        setMessage('You cannot select a time in the past.');
        setIsValidTime(false);
        return;
      }

      // Check if the selected time falls within off-hours
      if (checkIfTimeInOffHours(combinedDateTime.toJSDate())) {
        setIsValidTime(false);
        return;
      }

      // Check lead time if booking for today
      if (now.toISODate() === luxonDate.toISODate()) {
        const leadTimeInMilliseconds = convertLeadTimeToMilliseconds();
        const leadTimeLimit = now.plus({
          milliseconds: leadTimeInMilliseconds,
        });

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
      const startTime = combinedDateTime.toISO();
      const endTime = combinedDateTime.plus({ hours: 2 }).toISO();

      const requestBody = {
        timeMin: startTime,
        timeMax: endTime,
      };

      try {
        const response = await fetch(
          '/api/calendar/checkCalendarAvailability',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          }
        );

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
        <div className="mt-3 flex items-center">
          <FaSpinner className="mr-2 animate-spin" />
          <p>Checking availability...</p>
        </div>
      ) : (
        <p
          className={`text-md mt-3 ${isValidTime ? 'text-green-500' : 'text-red-500'}`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default TimeValidation;
