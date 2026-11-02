import React, { useState, useRef, useEffect } from "react";

interface FloatingActionToggleProps {
  onOpenSettings: () => void;
  onOpenShare: () => void;
}

export const FloatingActionToggle: React.FC<FloatingActionToggleProps> = ({
  onOpenSettings,
  onOpenShare,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    collapseTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 280);
  };

  const handleClickToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    };
  }, []);

  return (
    <div
      className="fixed bottom-6 left-6 z-40 select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`relative flex items-center backdrop-blur-md border border-white/20 shadow-lg text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
          isExpanded
            ? "w-[174px] h-10 rounded-full p-1 bg-black/60"
            : "w-10 h-10 rounded-full justify-center bg-black/40 hover:border-white/50 hover:bg-black/60 cursor-pointer active:scale-95"
        }`}
        onClick={!isExpanded ? handleClickToggle : undefined}
      >
        {!isExpanded ? (
          // State Collapsed: Tombol Bulat Minimalis dengan Ikon Pensil Putih
          <button
            type="button"
            aria-label="Buka Opsi Album"
            className="flex h-full w-full items-center justify-center text-white"
          >
            <svg
              className="h-4 w-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        ) : (
          // State Expanded: Segmented Pill Tab "Setting" & "Share"
          <div className="flex w-full items-center justify-between gap-1 animate-in fade-in duration-200">
            {/* Tab Kiri: Setting */}
            <button
              type="button"
              onClick={() => {
                onOpenSettings();
                setIsExpanded(false);
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 px-2.5 text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              <svg
                className="h-3.5 w-3.5 text-white/80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
              <span>Setting</span>
            </button>

            {/* Separator Halus */}
            <div className="h-4 w-[1px] bg-white/20 shrink-0" />

            {/* Tab Kanan: Share */}
            <button
              type="button"
              onClick={() => {
                onOpenShare();
                setIsExpanded(false);
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full py-1.5 px-2.5 text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              <svg
                className="h-3.5 w-3.5 text-white/80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span>Share</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingActionToggle;
