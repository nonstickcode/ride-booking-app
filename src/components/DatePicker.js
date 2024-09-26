import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // Import default styles

const DatePickerComponent = ({ date, setDate }) => {
  return (
    <div className="mb-6 flex w-full flex-col">
      <label className="mb-2 text-white">Select Date:</label>
      <DatePicker
        selected={date}
        onChange={setDate}
        dateFormat="MMMM d, yyyy"
        placeholderText="Pick a Date"
        className="w-full rounded-lg border border-gray-500 bg-gray-800 p-2 text-sm text-white"
        wrapperClassName="w-full" // Ensures the date picker takes full width
      />
    </div>
  );
};

export default DatePickerComponent;
