'use client';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
    <div className="mx-auto max-w-lg rounded-md bg-white p-4 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Book a Ride</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Select Date:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            className="w-full rounded border p-2"
            minDate={new Date()}
            placeholderText="Select a date"
          />
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Select Time:</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded border p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Your Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border p-2"
            placeholder="Enter your name"
            required
          />
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium">Your Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border p-2"
            placeholder="Enter your email"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 py-2 text-white transition hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
