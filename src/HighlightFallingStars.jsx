import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

export default function HighlightFallingStars({ active }) {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    if (!active) return;
    setStars(Array.from({ length: 30 }, (_, i) => ({ id: i, left: Math.random() * 100, delay: Math.random() * 0.6, duration: 2 + Math.random() * 2, size: 8 + Math.random() * 16 })));
    // let them run; cleanup not necessary
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-visible z-40">
      {stars.map(star => (
        <div key={star.id} className="absolute animate-fall" style={{ left: `${star.left}%`, animationDelay: `${star.delay}s`, animationDuration: `${star.duration}s`, top: '-40px' }}>
          <Star size={star.size} className="text-yellow-300 fill-yellow-300 drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 8px rgba(253, 224, 71, 0.8))' }} />
        </div>
      ))}
      <style>{`@keyframes fall { 0% { transform: translateY(-40px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(360deg); opacity: 0; } } .animate-fall { animation: fall linear forwards; }`}</style>
    </div>
  );
}
