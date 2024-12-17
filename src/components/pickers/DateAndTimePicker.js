import React, { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker as MUITimePicker } from '@mui/x-date-pickers/TimePicker';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { ClockIcon } from '@mui/x-date-pickers';
import { addMonths } from 'date-fns'; // Use date-fns for maxDate calculation
import { combineDateAndTimeLuxon } from '@/utils/dateTimeUtilsLuxon';
import supabase from '@/utils/supabaseClient';

// Function to fetch the admin location settings from the database
const getAdminSettings = async () => {
  let { data, error } = await supabase
    .from('AdminSettings')
    .select('misc_advance_booking_limit_months')
    .single(); // There is only one row in this table

  return { data, error };
};

// Custom combined Date and Time Picker component
const DateAndTimePicker = ({ setCombinedDateTime }) => {
  const [date, setDate] = useState(null); // State for the selected date
  const [time, setTime] = useState(null); // State for the selected time
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

  useEffect(() => {
    if (date && time) {
      // Combine the date and time and pass it to the parent component
      const combinedDateTime = combineDateAndTimeLuxon(date, time);
      setCombinedDateTime(combinedDateTime);
    }
  }, [date, time, setCombinedDateTime]);

  return (
    <div className="w-full">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="grid grid-cols-1 gap-0">
          {/* Date Picker */}
          <div className="mb-2">
            <span className="mb-1 block cursor-default text-sm text-white">
              Date:
            </span>

            <MUIDatePicker
              value={date}
              onChange={(newDate) => setDate(newDate)}
              minDate={minDate}
              maxDate={maxDate} // Dynamically set maxDate from the fetched value
              showDaysOutsideCurrentMonth={false}
              slots={{
                openPickerIcon: () => <CalendarMonthIcon className="h-5 w-5" />,
              }}
              slotProps={{
                textField: {
                  placeholder: 'Select a Date',
                  className: 'flex-grow text-sm',
                  fullWidth: true,
                },
              }}
            />
          </div>

          {/* Time Picker */}
          <div>
            <span className="mb-1 block cursor-default text-sm text-white">
              Time:
            </span>
            <MUITimePicker
              value={time}
              onChange={(newTime) => setTime(newTime)}
              slots={{
                openPickerIcon: () => <ClockIcon className="h-5 w-5" />,
              }}
              slotProps={{
                textField: {
                  placeholder: 'Select a Time',
                  className: 'flex-grow text-sm',
                  fullWidth: true,
                },
              }}
            />
          </div>
        </div>
      </LocalizationProvider>
    </div>
  );
};

export default DateAndTimePicker;
