let months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

let days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const getDay = (timeStamp) => {
  let date = new Date(timeStamp);
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

export const getFullDay = (timeStamp) => {
  let date = new Date(timeStamp);

  return `${date.getDay()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const getDayName = (timestamp) => {
  const date = new Date(timestamp);
  return days[date.getDay()];
};
