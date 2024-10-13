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
    <div className="mb-2 flex w-full flex-col">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="mb-2">
          <label className="mb-2 text-white">Date:</label>
          <MUIDatePicker
            value={date}
            onChange={(newDate) => {
              setDate(newDate); // Update the date state
              // console.log('Date picker: ', newDate); // Log the new date value
            }}
            minDate={new Date()}
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

          <hr className="my-4 border-gray-700" />

          <MUITimePicker
            value={time}
            onChange={(newTime) => {
              setTime(newTime); // Update the time state
              // console.log('Time picker: ', newTime); // Log the new time value
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
        </div>
      </LocalizationProvider>
    </div>
  );
};

export default DateAndTimePicker;
