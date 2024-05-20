import React from "react";

const NoDataMessage = ({ message }) => {
  return (
    <div className="w-full text-center p-4 rounded-full bg-grey/50 mt-4">
      <p>{message}</p>
    </div>
  );
};

export default NoDataMessage;
