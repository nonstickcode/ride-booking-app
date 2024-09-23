"use client";
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
    <div className="p-4 max-w-lg mx-auto bg-white shadow-md rounded-md">
      <h2 className="text-xl font-semibold mb-4">Book a Ride</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Date:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            className="w-full p-2 border rounded"
            minDate={new Date()}
            placeholderText="Select a date"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Time:</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Your Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter your name"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Your Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter your email"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
