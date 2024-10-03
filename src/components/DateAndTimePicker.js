import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker as MUITimePicker } from '@mui/x-date-pickers/TimePicker';
import TextField from '@mui/material/TextField';
import addMonths from 'date-fns/addMonths';

// Custom DatePicker component
const DatePicker = ({ date, setDate }) => {

   // Calculate the max date (3 months from the current date)
   // TODO: Add an admin option to configure the max date dynamically (currently hardcoded to 3 months from the current date).
   const maxDate = addMonths(new Date(), 3);
   // Set the minimum date to today to prevent selecting past dates
  const minDate = new Date();

  return (
    <div className="mb-6 flex w-full flex-col">
      <label className="mb-2 text-white">Date:</label>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MUIDatePicker
          value={date}
          onChange={(newDate) => setDate(newDate)}
          disabled={false}
          showDaysOutsideCurrentMonth
          minDate={minDate}
          maxDate={maxDate} // Restrict to 3 months ahead
          renderInput={(params) => (
            // Use the centralized input-field class for consistent styling
            <TextField {...params} className="input-field" fullWidth />
          )}
        />
      </LocalizationProvider>
    </div>
  );
};

// Custom TimePicker component
const TimePicker = ({ time, setTime }) => {
  return (
    <div className="mb-6 flex w-full flex-col">
      <label className="mb-2 text-white">Time:</label>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MUITimePicker
          value={time}
          onChange={(newTime) => setTime(newTime)}
          renderInput={(params) => (
            // Use the centralized input-field class for consistent styling
            <TextField {...params} className="input-field" fullWidth />
          )}
        />
      </LocalizationProvider>
    </div>
  );
};

export { DatePicker, TimePicker };
