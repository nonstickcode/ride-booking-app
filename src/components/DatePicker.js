import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';  // Import default styles

const DatePickerComponent = ({ date, setDate }) => {
  return (
    <div className="flex flex-col items-center w-full mb-6">
      {/* <label className="text-white mb-2">Select Date:</label> */}
      <DatePicker
        selected={date}
        onChange={setDate}
        dateFormat="MMMM d, yyyy"
        placeholderText="Pick a Date"
        className="text-center text-lg p-2 rounded-lg w-full border border-gray-500 bg-gray-800 text-white"
        wrapperClassName="w-full"  // Ensures the date picker takes full width
      />
    </div>
  );
};

export default DatePickerComponent;
