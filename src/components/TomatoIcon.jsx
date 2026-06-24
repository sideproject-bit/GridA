import React from "react";

export default function TomatoIcon({ size = 24, color = "currentColor", style, className }) {
  const s = size;
  return (
    <svg
      width={s} height={s} viewBox="0 0 24 24"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      style={style} className={className}
    >
      {/* Stem */}
      <path d="M12 3.5 C12 3.5 12 2 13.5 1.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      {/* Left leaf */}
      <path d="M12 3.5 C10.5 2.8 9 3.5 9.5 5" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      {/* Right leaf */}
      <path d="M12 3.5 C13.5 2.8 15 3.5 14.5 5" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none" />
      {/* Tomato body */}
      <circle cx="12" cy="13.5" r="8.5" fill={color} opacity="0.18" />
      <circle cx="12" cy="13.5" r="8.5" stroke={color} strokeWidth="1.5" />
      {/* Clock hour hand (pointing up-right ~10 o'clock) */}
      <line x1="12" y1="13.5" x2="9.5" y2="10.2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Clock minute hand (pointing right ~3 o'clock) */}
      <line x1="12" y1="13.5" x2="15.8" y2="13.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Center dot */}
      <circle cx="12" cy="13.5" r="0.9" fill={color} />
    </svg>
  );
}
