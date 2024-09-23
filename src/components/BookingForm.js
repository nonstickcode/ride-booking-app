'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from './ui/input';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react'; // Added Clock icon for time
import { cn } from '@/lib/utils';

const BookingForm = () => {
  const [startDate, setStartDate] = useState(null);
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const bookingData = { date, time, name, email };
    console.log('Booking Data:', bookingData);
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-md bg-black p-6 shadow-lg">
      <h2 className="mb-8 text-center text-2xl text-white font-bold">Book a Ride</h2>
      <form onSubmit={handleSubmit}>
        {/* Date Picker */}
        <div className="mb-8 w-full">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal text-white',  // Added uniform font color
                  !date && 'text-gray-500' // Muted color when no date is selected
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2 bg-gray-800 rounded-md shadow-lg">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Picker with Popover */}
        <div className="mb-8 w-full">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full justify-start text-left font-normal text-white',  // Same style as date picker
                  !time && 'text-gray-500' // Muted color when no time is selected
                )}
              >
                <Clock className="mr-2 h-4 w-4" />
                {time ? time : <span>Select Time</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2 bg-gray-800 rounded-md shadow-lg">
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2 bg-white text-black rounded-md border"
                required
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Name Input */}
        <div className="mb-8">
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 bg-white text-black rounded-md border"
            placeholder="Enter your name"
            required
            aria-required="true"
          />
        </div>

        {/* Email Input */}
        <div className="mb-8">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 bg-white text-black rounded-md border"
            placeholder="Enter your email"
            required
            aria-required="true"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="mb-1 w-full rounded-md bg-blue-600 text-white transition hover:bg-blue-700 p-2 text-lg font-semibold"
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default BookingForm;
