import React, { useRef, useEffect } from 'react';

const Background: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set playback rate to 0.25x (quarter speed)
    video.playbackRate = 0.25;

    // Handle video end event to play in reverse
    const handleVideoEnd = () => {
      // When video reaches the end, play in reverse by going backwards
      video.currentTime = video.duration;
      video.playbackRate = -0.25; // Negative for reverse playback
      video.play();
    };

    // Handle when playing in reverse reaches the beginning
    const handleTimeUpdate = () => {
      if (video.currentTime <= 0 && video.playbackRate < 0) {
        // When reverse playback reaches start, play forward again
        video.currentTime = 0;
        video.playbackRate = 0.25;
        video.play();
      }
    };

    video.addEventListener('ended', handleVideoEnd);
    video.addEventListener('timeupdate', handleTimeUpdate);

    // Start playing the video
    video.play().catch(console.error);

    return () => {
      video.removeEventListener('ended', handleVideoEnd);
      video.removeEventListener('timeupdate', handleTimeUpdate);
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