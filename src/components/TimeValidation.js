import React, { useState, useEffect, useCallback } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { combineDateAndTime } from '@/utils/dateUtils';
import supabase from '@/utils/supabaseClient';

const TimeValidation = ({
  date,
  time,
  isValidTime,  // needed here to show the red or green alerts for available or not
  setIsValidTime, // this is set here then read in booking modal to disable submit button until valid time and date set
}) => {
  const [leadTime, setLeadTime] = useState({ hours: 0, minutes: 0 });
  const [offHours, setOffHours] = useState({
    start: '00:00:00',
    end: '00:00:00',
  });
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch lead time and off-hours from the database
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('AdminSettings')
        .select('lead_time_hours, lead_time_minutes, timeoff_start_time, timeoff_end_time')
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
      }
    };

    fetchSettings();
  }, []);

  // Helper function to format off-hours range as a string
  const formatOffHours = useCallback((start, end) => {
    const formatHour = (hour) => {
      const period = hour >= 12 ? 'pm' : 'am';
      const hourFormatted = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${hourFormatted}${period}`;
    };
    return `No bookings are available between ${formatHour(start)} and ${formatHour(end)}.`;
  }, []);

  // Parse time from HH:MM:SS format to just hours
  const parseTime = useCallback((timeString) => {
    const [hours] = timeString.split(':').map(Number);
    return hours;
  }, []);

  // Check if the selected time is within off-hours
  const checkIfTimeInOffHours = useCallback((time) => {
    const selectedHour = time.getHours();
    const start = parseTime(offHours.start);
    const end = parseTime(offHours.end);

    if (start > end) {
      if (selectedHour >= start || selectedHour < end) {
        setMessage(formatOffHours(start, end));
        return true;
      }
    } else {
      if (selectedHour >= start && selectedHour < end) {
        setMessage(formatOffHours(start, end));
        return true;
      }
    }

    return false;
  }, [offHours, formatOffHours, parseTime]);

  // Convert lead time from hours and minutes to milliseconds
  const convertLeadTimeToMilliseconds = useCallback(() => {
    const { hours, minutes } = leadTime;
    return hours * 60 * 60 * 1000 + minutes * 60 * 1000;
  }, [leadTime]);

  // Validate the selected time
  const validateTime = useCallback(async (selectedTime) => {
    if (!selectedTime || !date) {
      setMessage('Please select a valid date and time.');
      setIsValidTime(false);
      return;
    }

    const combinedDateTime = combineDateAndTime(date, selectedTime);

    if (combinedDateTime < new Date()) {
      setMessage('You cannot select a time in the past.');
      setIsValidTime(false);
      return;
    }

    if (checkIfTimeInOffHours(combinedDateTime)) {
      setIsValidTime(false);
      return;
    }

    if (new Date().toDateString() === date.toDateString()) {
      const currentTime = new Date();
      const leadTimeInMilliseconds = convertLeadTimeToMilliseconds();
      const leadTimeLimit = new Date(currentTime.getTime() + leadTimeInMilliseconds);

      if (combinedDateTime < leadTimeLimit) {
        setMessage(`Please select a time at least ${leadTime.hours} hours and ${leadTime.minutes} minutes in advance.`);
        setIsValidTime(false);
        return;
      }
    }

    // Proceed with API check for availability if all prior checks pass
    setLoadingAvailability(true);
    const startTime = combinedDateTime.toISOString();
    const endTime = new Date(combinedDateTime.getTime() + 2 * 60 * 60 * 1000).toISOString();

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
  }, [checkIfTimeInOffHours, convertLeadTimeToMilliseconds, date, setIsValidTime]);

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
        <p className={`text-md mb-1 ${isValidTime ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default TimeValidation;
