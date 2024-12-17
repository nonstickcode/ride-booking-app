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

// Function to detect mobile devices
const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const getAdminSettings = async () => {
  let { data, error } = await supabase
    .from('AdminSettings')
    .select('misc_advance_booking_limit_months')
    .single();
  return { data, error };
};

const DateAndTimePicker = ({ setCombinedDateTime }) => {
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  const minDate = new Date();

  useEffect(() => {
    const fetchMaxDate = async () => {
      const { data, error } = await getAdminSettings();
      if (!error && data?.misc_advance_booking_limit_months) {
        const monthsLimit = data.misc_advance_booking_limit_months;
        setMaxDate(addMonths(new Date(), monthsLimit));
      } else {
        setMaxDate(addMonths(new Date(), 3));
      }
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
          <div className="mb-2">
            <span className="mb-1 block cursor-default text-sm text-white">
              Date:
            </span>
            {isMobile() ? (
              <input
                type="date"
                value={date ? date.toISOString().split('T')[0] : ''}
                onChange={(e) => setDate(new Date(e.target.value))}
                min={minDate.toISOString().split('T')[0]}
                max={maxDate ? maxDate.toISOString().split('T')[0] : ''}
                className="w-full rounded-md border border-gray-500 bg-gray-800 p-2 text-white"
              />
            ) : (
              <MUIDatePicker
                value={date}
                onChange={(newDate) => setDate(newDate)}
                minDate={minDate}
                maxDate={maxDate}
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
            )}
          </div>

          {/* Time Picker */}
          <div>
            <span className="mb-1 block cursor-default text-sm text-white">
              Time:
            </span>
            {isMobile() ? (
              <input
                type="time"
                value={time ? time.toTimeString().split(' ')[0] : ''}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newTime = new Date();
                  newTime.setHours(hours, minutes, 0);
                  setTime(newTime);
                }}
                className="w-full rounded-md border border-gray-500 bg-gray-800 p-2 text-white"
              />
            ) : (
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
            )}
          </div>
        </div>
      </LocalizationProvider>
    </div>
  );
};

export default DateAndTimePicker;
