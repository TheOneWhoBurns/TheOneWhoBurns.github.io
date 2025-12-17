import React, { useRef, useEffect, useState } from 'react';

const Background: React.FC = () => {
  const forwardRef = useRef<HTMLVideoElement>(null);
  const reverseRef = useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = useState<'forward' | 'reverse'>('forward');
  const [preloadNext, setPreloadNext] = useState(false);

  useEffect(() => {
    const forward = forwardRef.current;
    const reverse = reverseRef.current;
    if (!forward || !reverse) return;

    const handleForwardTimeUpdate = () => {
      if (forward.duration - forward.currentTime <= 1) {
        setPreloadNext(true);
      }
    };

    const handleReverseTimeUpdate = () => {
      if (reverse.duration - reverse.currentTime <= 1) {
        setPreloadNext(true);
      }
    };

    const handleForwardEnd = () => {
      setActiveVideo('reverse');
      setPreloadNext(false);
      reverse.currentTime = 0;
      reverse.play().catch(console.error);
    };

    const handleReverseEnd = () => {
      setActiveVideo('forward');
      setPreloadNext(false);
      forward.currentTime = 0;
      forward.play().catch(console.error);
    };

    forward.addEventListener('ended', handleForwardEnd);
    forward.addEventListener('timeupdate', handleForwardTimeUpdate);
    reverse.addEventListener('ended', handleReverseEnd);
    reverse.addEventListener('timeupdate', handleReverseTimeUpdate);

    forward.play().catch(console.error);

    return () => {
      forward.removeEventListener('ended', handleForwardEnd);
      forward.removeEventListener('timeupdate', handleForwardTimeUpdate);
      reverse.removeEventListener('ended', handleReverseEnd);
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
        } ${
          activeVideo === 'forward' || preloadNext ? 'block' : 'hidden'
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
        } ${
          activeVideo === 'reverse' || preloadNext ? 'block' : 'hidden'
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