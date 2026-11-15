import React, { useState, useEffect } from 'react';

const announcements = [
  "Discover our latest collection — Designed around you.",
  "Complimentary Shipping Across India on all Atelier Orders",
  "Tailored for Indian Proportions • Petite, Regular & Tall Inseams",
  "15-Day Thoughtful Exchanges & Zero-Pressure Home Trial",
];

export const AnnouncementBar: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % announcements.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-burgundy text-[#F8F4EC] py-2 px-4 text-center text-xs tracking-wider border-b border-gold/30 select-none transition-colors">
      <div className="max-w-4xl mx-auto flex items-center justify-center space-x-2.5">
        <span className="text-gold text-xs">🪷</span>
        <span
          key={index}
          className="font-medium text-[12px] sm:text-xs tracking-wide transition-opacity duration-400"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {announcements[index]}
        </span>
        <span className="text-gold text-xs">🪷</span>
      </div>
    </div>
  );
};
