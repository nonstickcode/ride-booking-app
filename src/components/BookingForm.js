'use client';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from './ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const BookingForm = () => {
  const [startDate, setStartDate] = useState(null);
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send data to backend or API route
    const bookingData = { startDate, time, name, email };
    console.log('Booking Data:', bookingData);
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-md bg-black p-6  shadow-lg">
      <h2 className="mb-4 text-center text-2xl text-white font-semibold">Book a Ride</h2>
      <form onSubmit={handleSubmit}>
        {/* Date Picker */}
        <div className="mb-4 w-full">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[280px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Picker */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium" htmlFor="time">
            Select Time:
          </label>
          <input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded border p-2"
            required
          />
        </div>

        {/* Name Input */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium" htmlFor="name">
            Your Name:
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border p-2"
            placeholder="Enter your name"
            required
            aria-required="true"
          />
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium" htmlFor="email">
            Your Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-2"
            placeholder="Enter your email"
            required
            aria-required="true"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="mt-4 w-full rounded-md bg-blue-600 text-white transition hover:bg-blue-700"
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default BookingForm;
