
import React from "react";

interface StarfieldBackgroundProps {
  theme: "light" | "dark";
}

const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({ theme }) => {
  const stars = Array.from({ length: 120 });

  if (theme === "dark") {
    return (
      <div className="absolute inset-0 bg-gray-900 overflow-hidden -z-10">
        {/* خلفية متدرجة */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-gray-900 to-black opacity-90"></div>

        {/* النجوم العادية */}
        {stars.map((_, i) => {
          const size = Math.random() * 2 + 1;
          const duration = Math.random() * 4 + 3;
          const delay = Math.random() * 6;
          return (
            <div
              key={i}
              className="absolute rounded-full bg-white opacity-80 twinkle"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}

        {/* نجوم شهاب */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`shooting-${i}`}
            className="absolute h-0.5 w-20 bg-gradient-to-r from-white to-transparent opacity-70 shooting-star"
            style={{
              top: `${Math.random() * 80}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          ></div>
        ))}
      </div>
    );
  }

  // Light mode background
  return (
    <div className="absolute inset-0 bg-sky-200 overflow-hidden -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 to-blue-300 opacity-90"></div>
      {/* سحب خفيفة للنهار */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`cloud-${i}`}
          className="absolute bg-white/60 rounded-full blur-2xl animate-cloud"
          style={{
            width: `${60 + Math.random() * 100}px`,
            height: `${20 + Math.random() * 40}px`,
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 100}%`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        ></div>
      ))}
    </div>
  );
};

export default StarfieldBackground;
