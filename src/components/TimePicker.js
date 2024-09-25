import React from 'react';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';  // Import default styles

const TimePickerComponent = ({ time, setTime }) => {
  return (
    <div className="flex flex-col items-center w-full mb-6">
      {/* <label className="text-white mb-2">Select Time:</label> */}
      <TimePicker
        onChange={setTime}
        value={time}
        disableClock={true}  // Disable the clock icon for simplicity
        className="text-center text-lg p-2 rounded-lg w-full border border-gray-500 bg-gray-800 text-white"
        clockClassName="hidden"  // Optional: Ensures clock is not rendered
      />
    </div>
  );
};

export default TimePickerComponent;
