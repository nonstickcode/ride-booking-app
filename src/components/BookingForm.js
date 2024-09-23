'use client';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from './ui/button';

const BookingForm = () => {
  const [startDate, setStartDate] = useState(null);
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Send data to backend or API route
    const bookingData = { startDate, time, name, email };
    console.log('Booking Data:', bookingData);
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-md bg-black text-white p-6 shadow-lg">
      <h2 className="mb-4 text-center text-2xl font-semibold">Book a Ride</h2>
      <form onSubmit={handleSubmit}>
        {/* Date Picker */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium" htmlFor="date">
            Select Date:
          </label>
          <DatePicker
            id="date"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            className="w-full rounded border p-2"
            minDate={new Date()}
            placeholderText="Select a date"
            required
          />
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
          className="w-full mt-4 rounded-md bg-blue-600 text-white transition hover:bg-blue-700"
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default BookingForm;
