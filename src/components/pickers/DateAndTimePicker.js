import React, { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker as MUITimePicker } from '@mui/x-date-pickers/TimePicker';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { ClockIcon } from '@mui/x-date-pickers';
import { combineDateAndTimeLuxon } from '@/utils/dateTimeUtilsLuxon';

// Custom combined Date and Time Picker component
const DateAndTimePicker = ({ setCombinedDateTime }) => {
  const [date, setDate] = useState(null); // State for the selected date
  const [time, setTime] = useState(null); // State for the selected time

  useEffect(() => {
    if (date && time) {
      // Combine the date and time and pass it to the parent component
      const combinedDateTime = combineDateAndTimeLuxon(date, time);
      console.log('Combined DateTime in DateAndTimePicker:', combinedDateTime);
      setCombinedDateTime(combinedDateTime);
    }
  }, [date, time, setCombinedDateTime]);

  return (
    <div className="w-full">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="grid grid-cols-1 gap-0">
          {/* Date Picker */}
          <div className="mb-2">
            <span className="mb-2 block text-sm text-white">Date:</span>

            <MUIDatePicker
              value={date}
              onChange={(newDate) => setDate(newDate)}
              minDate={new Date()}
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

          <hr className="my-4 border-gray-700" />

          {/* Time Picker */}
          <div>
            <span className="mb-2 block text-sm text-white">Time:</span>
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
