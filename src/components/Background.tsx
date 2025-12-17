import React, { useRef, useEffect, useState } from 'react';

const Background: React.FC = () => {
  const forwardRef = useRef<HTMLVideoElement>(null);
  const reverseRef = useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = useState<'forward' | 'reverse'>('forward');
  const switchedRef = useRef(false);

  useEffect(() => {
    const forward = forwardRef.current;
    const reverse = reverseRef.current;
    if (!forward || !reverse) return;

    const handleForwardTimeUpdate = () => {
      const timeLeft = forward.duration - forward.currentTime;
      if (timeLeft <= 0.05 && !switchedRef.current) {
        switchedRef.current = true;
        setActiveVideo('reverse');
        reverse.currentTime = 0;
        reverse.play().catch(console.error);
      }
      if (timeLeft > 1) {
        switchedRef.current = false;
      }
    };

    const handleReverseTimeUpdate = () => {
      const timeLeft = reverse.duration - reverse.currentTime;
      if (timeLeft <= 0.05 && !switchedRef.current) {
        switchedRef.current = true;
        setActiveVideo('forward');
        forward.currentTime = 0;
        forward.play().catch(console.error);
      }
      if (timeLeft > 1) {
        switchedRef.current = false;
      }
    };

    forward.addEventListener('timeupdate', handleForwardTimeUpdate);
    reverse.addEventListener('timeupdate', handleReverseTimeUpdate);

    forward.play().catch(console.error);

    return () => {
      forward.removeEventListener('timeupdate', handleForwardTimeUpdate);
      reverse.removeEventListener('timeupdate', handleReverseTimeUpdate);
      forward.pause();
      reverse.pause();
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <video
        ref={forwardRef}
        className={`absolute inset-0 w-full h-full object-cover ${
          activeVideo === 'forward' ? 'z-10' : 'z-0'
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
          activeVideo === 'reverse' ? 'z-10' : 'z-0'
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