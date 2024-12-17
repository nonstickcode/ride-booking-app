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
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
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
      const combinedDateTime = combineDateAndTimeLuxon(
        new Date(date),
        new Date(`1970-01-01T${time}:00`)
      );
      setCombinedDateTime(combinedDateTime);
    }
  }, [date, time, setCombinedDateTime]);

  return (
    <div className="w-full">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="grid grid-cols-1 gap-0">
          {/* Date Picker */}
          <div className="mb-2">
            <label className="mb-1 block cursor-default text-sm text-white">
              Date:
            </label>
            {isMobile() ? (
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={minDate.toISOString().split('T')[0]}
                max={maxDate ? maxDate.toISOString().split('T')[0] : ''}
                placeholder="Select a Date"
                className="w-full rounded-md border border-gray-500 bg-gray-800 p-2 text-white placeholder-gray-400 text-left"
              />
            ) : (
              <MUIDatePicker
                value={date ? new Date(date) : null}
                onChange={(newDate) => {
                  setDate(newDate?.toISOString().split('T')[0]);
                }}
                minDate={minDate}
                maxDate={maxDate}
                slots={{
                  openPickerIcon: () => (
                    <CalendarMonthIcon className="h-5 w-5" />
                  ),
                }}
                slotProps={{
                  textField: {
                    placeholder: 'Select a Date',
                    InputLabelProps: { shrink: false }, // Prevent stacked labels
                    className:
                      'flex-grow text-sm text-white placeholder-gray-400 text-left',
                    fullWidth: true,
                  },
                }}
              />
            )}
          </div>

          {/* Time Picker */}
          <div>
            <label className="mb-1 block cursor-default text-sm text-white">
              Time:
            </label>
            {isMobile() ? (
              <input
                type="time"
                step="300" // 5-minute increments
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Select a Time"
                className="w-full rounded-md border border-gray-500 bg-gray-800 p-2 text-white placeholder-gray-400 text-left"
              />
            ) : (
              <MUITimePicker
                value={time ? new Date(`1970-01-01T${time}:00`) : null}
                onChange={(newTime) => {
                  if (newTime) {
                    const formattedTime = newTime
                      .toISOString()
                      .split('T')[1]
                      .substring(0, 5);
                    setTime(formattedTime);
                  }
                }}
                minutesStep={5} // Limit to 5-minute increments
                slots={{
                  openPickerIcon: () => <ClockIcon className="h-5 w-5" />,
                }}
                slotProps={{
                  textField: {
                    placeholder: 'Select a Time',
                    InputLabelProps: { shrink: false }, // Prevent stacked labels
                    className:
                      'flex-grow text-sm text-white placeholder-gray-400 text-left',
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
