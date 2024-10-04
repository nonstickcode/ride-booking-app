// utils/dateUtils.js

export const combineDateAndTime = (date, time) => {
  const combinedDate = new Date(date);
  combinedDate.setHours(time.getHours());
  combinedDate.setMinutes(time.getMinutes());
  combinedDate.setSeconds(time.getSeconds());
  return combinedDate;
};
