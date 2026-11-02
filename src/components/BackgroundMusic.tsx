import React, { useState, useEffect, useRef } from "react";

export interface BackgroundMusicProps {
  src?: string;
  autoPlay?: boolean;
  loop?: boolean;
  defaultVolume?: number;
}

export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  src = "/audio/ambient-piano.mp3",
  autoPlay = true,
  loop = true,
  defaultVolume = 0.65,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Inisialisasi audio dan penanganan kebijakan autoplay browser
  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = 0; // Mulai dari 0 untuk efek fade-in yang lembut
    audioRef.current = audio;

    const startPlaybackWithFadeIn = () => {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);

          // Ramping volume dari 0 ke defaultVolume dalam 2.5 detik
          const fadeDuration = 2500;
          const steps = 25;
          const stepTime = fadeDuration / steps;
          const volumeIncrement = defaultVolume / steps;

          let currentStep = 0;
          const fadeInterval = setInterval(() => {
            currentStep++;
            if (audioRef.current) {
              const nextVol = Math.min(defaultVolume, currentStep * volumeIncrement);
              audioRef.current.volume = nextVol;
            }
            if (currentStep >= steps) {
              clearInterval(fadeInterval);
            }
          }, stepTime);
        })
        .catch(() => {
          // Browser memblokir unmuted autoplay tanpa interaksi pengguna
          setIsPlaying(false);
        });
    };

    if (autoPlay) {
      startPlaybackWithFadeIn();
    }

    // Listener global: begitu pengguna mengetuk atau mengklik layar di mana saja, musik otomatis menyala
    const handleGlobalInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        startPlaybackWithFadeIn();
      }
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener("click", handleGlobalInteraction);
      window.removeEventListener("touchstart", handleGlobalInteraction);
      window.removeEventListener("keydown", handleGlobalInteraction);
    };

    window.addEventListener("click", handleGlobalInteraction, { passive: true });
    window.addEventListener("touchstart", handleGlobalInteraction, { passive: true });
    window.addEventListener("keydown", handleGlobalInteraction, { passive: true });

    return () => {
      cleanupListeners();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, [src, autoPlay, loop, defaultVolume]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.volume = defaultVolume;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {});
    }
  };

  return (
    <>
      {/* Tombol Musik Bulat di Sudut Kiri Atas Canvas (Hanya Spectrum / Ikon Bisu Tanpa Teks) */}
      <div className="fixed top-6 left-6 z-[60]">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Bisukan musik latar" : "Putar musik latar"}
          title={isPlaying ? "Musik: Aktif (Klik untuk bisukan)" : "Musik: Bisu (Klik untuk putar)"}
          className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-white/50 hover:bg-black/60 active:scale-95 text-white"
        >
          {isPlaying ? (
            // Spectrum animasi 3 bar saat musik aktif
            <div className="flex h-4 w-3.5 items-end justify-between gap-[2px]">
              <span className="w-[3px] rounded-full bg-white animate-[soundWave_1.1s_ease-in-out_infinite]" />
              <span className="w-[3px] rounded-full bg-white animate-[soundWave_0.8s_ease-in-out_infinite_0.2s]" />
              <span className="w-[3px] rounded-full bg-white animate-[soundWave_1.3s_ease-in-out_infinite_0.4s]" />
            </div>
          ) : (
            // Ikon Speaker Bisu saat nonaktif (tanpa teks)
            <svg
              className="h-4 w-4 text-white/70 transition-colors group-hover:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>
      </div>

      {/* Style Animasi Gelombang Equalizer */}
      <style>{`
        @keyframes soundWave {
          0%, 100% { height: 4px; }
          50% { height: 15px; }
        }
      `}</style>
    </>
  );
};

export default BackgroundMusic;
