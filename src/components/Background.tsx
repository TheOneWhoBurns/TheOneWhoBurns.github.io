import React, { useRef, useEffect } from 'react';

const Background: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isReversing = false;
    let animationId: number | null = null;
    let lastTime = 0;

    const stepBackward = (currentTime: number) => {
      if (!video || !isReversing) return;

      if (lastTime === 0) lastTime = currentTime;
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      video.currentTime -= delta;

      if (video.currentTime <= 0) {
        video.currentTime = 0;
        isReversing = false;
        lastTime = 0;
        video.play().catch(console.error);
        return;
      }

      animationId = requestAnimationFrame(stepBackward);
    };

    const handleVideoEnd = () => {
      isReversing = true;
      video.pause();
      animationId = requestAnimationFrame(stepBackward);
    };

    video.addEventListener('ended', handleVideoEnd);
    video.play().catch(console.error);

    return () => {
      video.removeEventListener('ended', handleVideoEnd);
      if (animationId) cancelAnimationFrame(animationId);
      video.pause();
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        muted
        loop={false} // We handle looping manually with reverse
        playsInline
        preload="auto"
      >
        <source src="/Gradient_BG.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Background;