import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker as MUITimePicker } from '@mui/x-date-pickers/TimePicker';
import addMonths from 'date-fns/addMonths';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { ClockIcon } from '@mui/x-date-pickers';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

// Custom DatePicker component
const DatePicker = ({ date, setDate }) => {
  // Calculate the max date (3 months from the current date)
  // TODO: Add 3 month limit to admin settings for driver preferences (this is how far out the calendar will allow booking selections / disables past 3 months with this setting of 3)
  const maxDate = addMonths(new Date(), 3);

  // Set the minimum date to today to prevent selecting past dates
  const minDate = new Date();

  return (
    <div className="mb-6 flex w-full flex-col">
      <label className="mb-2 text-white">Date:</label>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MUIDatePicker
          value={date}
          onChange={(newDate) => {
            setDate(newDate);
          }}
          disabled={false}
          showDaysOutsideCurrentMonth
          minDate={minDate}
          maxDate={maxDate}
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
    <div className="mb-4 flex w-full flex-col">
      <label className="mb-2 text-white">Time:</label>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MUITimePicker
          value={time}
          formatDensity="spacious"
          format="hh:mm a" // 12-hour format with AM/PM
          onChange={(newTime) => {
            setTime(newTime);
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
