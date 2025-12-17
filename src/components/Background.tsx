import React, { useRef, useEffect, useState } from 'react';

const Background: React.FC = () => {
  const forwardRef = useRef<HTMLVideoElement>(null);
  const reverseRef = useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = useState<'forward' | 'reverse'>('forward');

  useEffect(() => {
    const forward = forwardRef.current;
    const reverse = reverseRef.current;
    if (!forward || !reverse) return;

    const handleForwardEnd = () => {
      setActiveVideo('reverse');
      reverse.currentTime = 0;
      reverse.play().catch(console.error);
    };

    const handleReverseEnd = () => {
      setActiveVideo('forward');
      forward.currentTime = 0;
      forward.play().catch(console.error);
    };

    forward.addEventListener('ended', handleForwardEnd);
    reverse.addEventListener('ended', handleReverseEnd);

    forward.play().catch(console.error);

    return () => {
      forward.removeEventListener('ended', handleForwardEnd);
      reverse.removeEventListener('ended', handleReverseEnd);
      forward.pause();
      reverse.pause();
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <video
        ref={forwardRef}
        className={`absolute inset-0 w-full h-full object-cover ${
          activeVideo === 'forward' ? 'block' : 'hidden'
        }`}
        muted
        playsInline
        preload="auto"
      >
        <source src="/Gradient_BG.mp4" type="video/mp4" />
      </video>
      <video
        ref={reverseRef}
        className={`absolute inset-0 w-full h-full object-cover ${
          activeVideo === 'reverse' ? 'block' : 'hidden'
        }`}
        muted
        playsInline
        preload="auto"
      >
        <source src="/Gradient_BG_reverse.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

export default Background;