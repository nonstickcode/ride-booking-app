import React, { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker as MUITimePicker } from '@mui/x-date-pickers/TimePicker';
import addMonths from 'date-fns/addMonths';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { ClockIcon } from '@mui/x-date-pickers';
import supabase from '@/utils/supabaseClient';

// Function to fetch the admin location settings from the database
const getAdminSettings = async () => {
  let { data, error } = await supabase
    .from('AdminSettings')
    .select('misc_advance_booking_limit_months')
    .single(); // There is only one row in this table

  return { data, error };
};

// Custom DatePicker component
const DatePicker = ({ date, setDate }) => {
  const [maxDate, setMaxDate] = useState(null); // State for the maximum date

  // Set the minimum date to today to prevent selecting past dates
  const minDate = new Date();

  // Fetch the advance booking limit from admin settings on mount
  useEffect(() => {
    const fetchMaxDate = async () => {
      const { data, error } = await getAdminSettings();
      if (!error && data?.misc_advance_booking_limit_months) {
        // Use the value from the database (in months) to calculate the max date
        const monthsLimit = data.misc_advance_booking_limit_months;
        setMaxDate(addMonths(new Date(), monthsLimit));
      } else {
        // Fallback: if there's an error, use the default 3 months
        setMaxDate(addMonths(new Date(), 3));
      }
    };

    fetchMaxDate();
  }, []);

  // Return null if the maxDate has not been set yet
  if (!maxDate) {
    return null; // Optionally, you can show a loading spinner here
  }

  return (
    <div className="mb-2 flex w-full flex-col">
      <label className="mb-2 text-white">Date:</label>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MUIDatePicker
          value={date}
          onChange={(newDate) => {
            // Extract only the date part (ignoring time)
            const dateOnly = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
            console.log('Selected Date (Truncated):', dateOnly);
            setDate(dateOnly); // Pass the truncated date to the parent
          }}
          disabled={false}
          showDaysOutsideCurrentMonth
          minDate={minDate}
          maxDate={maxDate} // Dynamically set maxDate from the fetched value
          slots={{
            openPickerIcon: () => <CalendarMonthIcon className="h-5 w-5" />,
          }}
          slotProps={{
            textField: {
              placeholder: 'Select a Date',
              className: 'input-field',
              fullWidth: true,
            },
          }}
        />
      </LocalizationProvider>
    </div>
  );
};

// Custom TimePicker component
const TimePicker = ({ time, setTime }) => {
  return (
    <div className="mb-2 flex w-full flex-col">
      <label className="mb-2 text-white">Time:</label>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MUITimePicker
          value={time}
          formatDensity="spacious"
          format="hh:mm a" // 12-hour format with AM/PM
          onChange={(newTime) => {
            // Extract just the time and the timezone
            const timeOnly = {
              hours: newTime.getHours(),
              minutes: newTime.getMinutes(),
              timezoneOffset: newTime.getTimezoneOffset(),
            };
            console.log('Selected Time (Hours, Minutes, Timezone Offset):', timeOnly);
            setTime(newTime); // Pass the full time object to the parent for combining
          }}
          slots={{
            openPickerIcon: () => <ClockIcon className="h-5 w-5" />,
          }}
          slotProps={{
            textField: {
              placeholder: 'Select a Time',
              className: 'input-field',
              fullWidth: true,
            },
          }}
        />
      </LocalizationProvider>
    </div>
  );
};

export { DatePicker, TimePicker };
