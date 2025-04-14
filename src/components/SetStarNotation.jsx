import React, { useState, useMemo } from "react";
import starFull from "../icons/starFULL.png";
import starHalf from "../icons/starHalf.png";
import starEmpty from "../icons/starEmpty.png";

const SetStarNotation = ({ size = 24, onChange, className = "" }) => {
  const max = 5;
  const [note, setNote] = useState(0);

  const handleClick = (value) => {
    setNote(value);
    if (onChange) onChange(value);
  };

  const handleInputChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= max) {
      const rounded = Math.round(value * 2) / 2;
      setNote(rounded);
      if (onChange) onChange(rounded);
    }
  };

  const stars = useMemo(() => {
    return Array.from({ length: max }).map((_, i) => {
      const value = i + 1;
      const starSrc =
        note >= value
          ? starFull.src
          : note >= value - 0.5
          ? starHalf.src
          : starEmpty.src;

      return (
        <button
          key={i}
          onClick={() => handleClick(value)}
          className="p-0 m-0 border-none bg-transparent cursor-pointer"
        >
          <img
            src={starSrc}
            alt={`${value} étoiles`}
            width={size}
            height={size}
          />
        </button>
      );
    });
  }, [note, size]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex gap-1">{stars}</div>
      <input
        type="number"
        min="0"
        max="5"
        step="0.5"
        value={note}
        onChange={handleInputChange}
        className="w-16 border rounded px-1 py-0.5 text-sm"
      />
    </div>
  );
};

export default SetStarNotation;
