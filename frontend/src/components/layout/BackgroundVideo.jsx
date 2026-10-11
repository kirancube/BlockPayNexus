import React, { useRef, useEffect } from "react";

export function BackgroundVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const startOnInteraction = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(() => {});
          }
          window.removeEventListener("click", startOnInteraction);
          window.removeEventListener("keydown", startOnInteraction);
          window.removeEventListener("touchstart", startOnInteraction);
        };
        window.addEventListener("click", startOnInteraction, { once: true });
        window.addEventListener("keydown", startOnInteraction, { once: true });
        window.addEventListener("touchstart", startOnInteraction, { once: true });
      });
    }
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* 1080p Ambient Video Loop */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover scale-105 transition-opacity duration-1000 opacity-65"
        src="/background-video.mp4"
      />

      {/* AERIS Precision Vignette & High-Contrast Tint Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/80 via-[#080808]/65 to-[#080808]/85" />
      <div className="absolute inset-0 bg-aeris-grid opacity-20 pointer-events-none" />
    </div>
  );
}
