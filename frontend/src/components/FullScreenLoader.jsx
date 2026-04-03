import React from "react";

const FullScreenLoader = ({ text = "Hang on a sec..." }) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-primary animate-spin" />
        <p className="text-gray-700 font-medium">{text}</p>
      </div>
    </div>
  );
};

export default FullScreenLoader;
