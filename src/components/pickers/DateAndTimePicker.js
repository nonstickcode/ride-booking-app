import React, { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { addMonths } from 'date-fns';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import supabase from '@/utils/supabaseClient';
import { combineDateAndTimeLuxon } from '@/utils/dateTimeUtilsLuxon';

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const DateAndTimePicker = ({ setCombinedDateTime }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [maxDate, setMaxDate] = useState(null);
  const minDate = new Date();

  // Fetch maximum date from database
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

  // Combine date and time when both are set
  useEffect(() => {
    if (date && time) {
      const combinedDateTime = combineDateAndTimeLuxon(
        new Date(date),
        new Date(`1970-01-01T${time}`)
      );
      setCombinedDateTime(combinedDateTime);
    }
  }, [date, time, setCombinedDateTime]);

  return (
    <div className="w-full">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="grid grid-cols-1 gap-0">
          {/* Date Picker */}
          <div className="relative mb-4">
            <label className="mb-1 block text-sm text-white">Date:</label>
            <div className="relative">
              <input
                type="text"
                value={date}
                onFocus={(e) => isMobile() && (e.target.type = 'date')} // Show native picker on mobile
                onBlur={(e) => (e.target.type = 'text')}
                onChange={(e) => setDate(e.target.value)}
                min={minDate.toISOString().split('T')[0]}
                max={maxDate ? maxDate.toISOString().split('T')[0] : ''}
                placeholder="Select a Date"
                className="w-full rounded-md border border-gray-500 bg-gray-800 p-2 pl-10 text-white placeholder-gray-400"
              />
              <CalendarMonthIcon className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Time Picker */}
          <div className="relative">
            <label className="mb-1 block text-sm text-white">Time:</label>
            <div className="relative">
              <input
                type="text"
                value={time}
                onFocus={(e) => isMobile() && (e.target.type = 'time')} // Show native picker on mobile
                onBlur={(e) => (e.target.type = 'text')}
                onChange={(e) => setTime(e.target.value)}
                step="300" // 5-minute increments
                placeholder="Select a Time"
                className="w-full rounded-md border border-gray-500 bg-gray-800 p-2 pl-10 text-white placeholder-gray-400"
              />
              <AccessTimeIcon className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </LocalizationProvider>
    </div>
  );
};

export default DateAndTimePicker;
