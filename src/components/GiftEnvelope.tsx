import React, { useState } from "react";

interface GiftEnvelopeProps {
  recipientName?: string;
  senderName?: string;
  albumTitle: string;
  onOpen: () => void;
}

export const GiftEnvelope: React.FC<GiftEnvelopeProps> = ({
  recipientName,
  senderName,
  albumTitle,
  onOpen,
}) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenClick = () => {
    if (isOpening) return;
    setIsOpening(true);
    setTimeout(() => {
      onOpen();
    }, 500);
  };

  const displayTitle = recipientName ? `Untuk ${recipientName}` : "Sebuah Hadiah";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black select-none">
      {/* Kontainer Amplop Minimalis */}
      <div
        className={`relative w-full max-w-sm rounded-[24px] bg-[#f7f5ef] p-8 shadow-2xl border border-black/[0.08] text-center transition-all duration-500 ease-out transform ${
          isOpening ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
        }`}
      >
        {/* Garis Halus Dalam Amplop */}
        <div className="absolute inset-2.5 rounded-[18px] border border-dashed border-black/[0.05] pointer-events-none" />

        {/* Header Amplop */}
        <div className="space-y-1.5 mb-8">
          <h2 className="text-xl font-serif font-medium text-neutral-900 tracking-tight">
            {displayTitle}
          </h2>
          <p className="text-xs font-serif italic text-neutral-500 truncate max-w-[260px] mx-auto">
            {albumTitle || "Album Kenangan"}
          </p>
        </div>

        {/* Tombol Segel Hadiah / Love Button (Adaptasi Uiverse vinodjangid07) */}
        <div className="relative my-7 flex justify-center">
          <button
            type="button"
            onClick={handleOpenClick}
            aria-label="Buka Segel Hadiah"
            className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-transparent cursor-pointer transition-all duration-300 active:scale-95"
          >
            {/* Shape Utama Paling Belakang Bulat yang Berotasi 35deg saat Hover ala Uiverse */}
            <span className="absolute inset-0 rounded-full bg-[#181818] transition-transform duration-300 ease-out origin-bottom pointer-events-none -z-10 group-hover:rotate-[35deg] shadow-lg shadow-black/25 border border-black/10" />

            {/* Container Kaca Bulat dengan Efek Blur Putih (White Frosted Glass) */}
            <span className="relative flex h-full w-full items-center justify-center rounded-full border border-white/80 bg-white/50 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300 group-hover:bg-white/70 group-hover:border-white group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.18)]">
              {/* Ikon Love: Putih normal, bergeser ke Merah Solid saat Hover / Klik */}
              <svg
                className="h-8 w-8 text-white fill-white transition-all duration-300 group-hover:text-red-500 group-hover:fill-red-500 group-hover:scale-110 group-active:scale-95 group-active:text-red-600 group-active:fill-red-600 drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </span>
          </button>
        </div>

        {/* Kredit Pengirim */}
        {senderName && (
          <div className="mt-6">
            <p className="text-[11px] text-neutral-400 font-sans tracking-wide">
              Dari: <span className="text-neutral-600 font-medium">{senderName}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GiftEnvelope;
