import React from 'react';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css'; // Import default styles

const TimePickerComponent = ({ time, setTime }) => {
  return (
    <div className="mb-6 flex w-full flex-col">
      <label className="mb-2 text-white">Select Time:</label>
      <TimePicker
        onChange={setTime}
        value={time}
        disableClock={true} // Disable the clock icon for simplicity
        className="w-full rounded-lg border border-gray-500 bg-gray-800 p-2 text-sm text-white"
        
      />
    </div>
  );
};

export default TimePickerComponent;
