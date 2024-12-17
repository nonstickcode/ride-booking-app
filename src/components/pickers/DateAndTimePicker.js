import React, { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker as MUITimePicker } from '@mui/x-date-pickers/TimePicker';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { ClockIcon } from '@mui/x-date-pickers';
import { addMonths } from 'date-fns';
import { combineDateAndTimeLuxon } from '@/utils/dateTimeUtilsLuxon';
import supabase from '@/utils/supabaseClient';

// Detect mobile devices
const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const DateAndTimePicker = ({ setCombinedDateTime }) => {
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  const minDate = new Date();

  useEffect(() => {
    const fetchMaxDate = async () => {
      const { data, error } = await supabase
        .from('AdminSettings')
        .select('misc_advance_booking_limit_months')
        .single();
      setMaxDate(!error && data ? addMonths(new Date(), data.misc_advance_booking_limit_months) : addMonths(new Date(), 3));
    };
    fetchMaxDate();
  }, []);

  useEffect(() => {
    if (date && time) {
      const combinedDateTime = combineDateAndTimeLuxon(date, time);
      setCombinedDateTime(combinedDateTime);
    }
  }, [date, time, setCombinedDateTime]);

  return (
    <div className="w-full">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="grid grid-cols-1 gap-0">
          {/* Date Picker */}
          <div className="mb-2 relative">
            <label className="mb-1 block cursor-default text-sm text-white">
              Date:
            </label>
            <input
              type="text"
              value={date ? date.toLocaleDateString() : ''}
              onFocus={(e) => {
                if (isMobile()) e.target.type = 'date'; // Open native date picker
              }}
              onBlur={(e) => (e.target.type = 'text')} // Revert input type to text
              onChange={(e) => setDate(new Date(e.target.value))}
              placeholder="Select a Date"
              className="w-full rounded-md border border-gray-500 bg-gray-800 p-2 text-white placeholder-gray-400"
            />
          </div>

          {/* Time Picker */}
          <div className="relative">
            <label className="mb-1 block cursor-default text-sm text-white">
              Time:
            </label>
            <input
              type="text"
              value={time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              onFocus={(e) => {
                if (isMobile()) e.target.type = 'time'; // Open native time picker
              }}
              onBlur={(e) => (e.target.type = 'text')} // Revert input type to text
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':');
                const newTime = new Date();
                newTime.setHours(hours, minutes, 0);
                setTime(newTime);
              }}
              placeholder="Select a Time"
              className="w-full rounded-md border border-gray-500 bg-gray-800 p-2 text-white placeholder-gray-400"
            />
          </div>
        </div>
      </LocalizationProvider>
    </div>
  );
};

export default DateAndTimePicker;
