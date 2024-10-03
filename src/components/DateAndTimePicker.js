import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker as MUITimePicker } from '@mui/x-date-pickers/TimePicker';
import TextField from '@mui/material/TextField';

// Custom DatePicker component
const DatePicker = ({ date, setDate }) => {
  return (
    <div className="mb-6 flex w-full flex-col">
      <label className="mb-2 text-white">Date:</label>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MUIDatePicker
          value={date}
          onChange={(newDate) => setDate(newDate)}
          disabled={false}
          showDaysOutsideCurrentMonth
          
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
