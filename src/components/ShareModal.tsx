import React, { useState, useEffect } from "react";
import { useAlbum } from "../context/AlbumContext";
import {
  compressAlbumToUrl,
  generateQrCodeDataUrl,
  createWhatsAppShareUrl,
  createTelegramShareUrl,
} from "../utils/shareableLink";
import { isSupabaseConfigured, saveAlbumToCloud } from "../lib/supabase";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { album } = useAlbum();
  const [shareUrl, setShareUrl] = useState<string>("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [isSavingCloud, setIsSavingCloud] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const prepareShareLink = async () => {
      if (isSupabaseConfigured()) {
        setIsSavingCloud(true);
        const cloudResult = await saveAlbumToCloud(album);
        setIsSavingCloud(false);
        if (cloudResult && isMounted) {
          setShareUrl(cloudResult.url);
          const qr = await generateQrCodeDataUrl(cloudResult.url);
          if (isMounted) setQrCodeDataUrl(qr);
          return;
        }
      }

      const compressedUrl = compressAlbumToUrl(album);
      if (isMounted) {
        setShareUrl(compressedUrl);
        const qr = await generateQrCodeDataUrl(compressedUrl);
        if (isMounted) setQrCodeDataUrl(qr);
      }
    };

    prepareShareLink();

    return () => {
      isMounted = false;
    };
  }, [isOpen, album]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin tautan:", err);
    }
  };

  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) return;
    const a = document.createElement("a");
    a.href = qrCodeDataUrl;
    a.download = `qr-${album.covers.title.toLowerCase().replace(/\s+/g, "-") || "album"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div
        className="relative w-full max-w-[390px] rounded-[28px] bg-white p-7 shadow-2xl flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup (Silang) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* 1. Header: Judul Share Your Memory */}
        <h3 className="text-[22px] font-bold text-neutral-900 tracking-tight text-center mt-2 mb-6">
          Share Your Memory
        </h3>

        {/* Status Sinkronisasi Cloud (jika sedang memproses) */}
        {isSavingCloud && (
          <div className="mb-4 text-[11px] text-neutral-400 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Menyimpan ke cloud...
          </div>
        )}

        {/* 2. Album Link Input Field dengan Ikon Copy Transparan */}
        <div className="w-full flex items-center gap-2 rounded-2xl border border-neutral-200/90 bg-white px-3.5 py-2.5 shadow-sm mb-6">
          <svg
            className="h-4 w-4 text-neutral-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>

          <input
            type="text"
            readOnly
            value={shareUrl}
            placeholder="Membuat tautan..."
            className="flex-1 bg-transparent border-none text-xs text-neutral-600 truncate focus:outline-none select-all font-sans"
          />

          <button
            type="button"
            onClick={handleCopy}
            title={hasCopied ? "Tersalin!" : "Salin tautan"}
            aria-label="Salin tautan"
            className="shrink-0 p-1 text-neutral-500 hover:text-neutral-800 transition-colors rounded hover:bg-neutral-100/60"
          >
            {hasCopied ? (
              <svg
                className="h-4 w-4 text-emerald-600 animate-in zoom-in-75"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>
        </div>

        {/* 3. Tampilan QR Code Bersih dengan Tombol Unduh Ikon Melayang */}
        <div className="relative mb-6">
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-3.5 shadow-sm">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="QR Code"
                className="h-44 w-44 object-contain rounded-lg"
              />
            ) : (
              <div className="h-44 w-44 flex items-center justify-center text-xs text-neutral-400">
                Membuat QR...
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleDownloadQr}
            disabled={!qrCodeDataUrl}
            title="Unduh QR Code"
            aria-label="Unduh QR Code"
            className="absolute -bottom-2.5 -right-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white border border-neutral-200/90 shadow-md text-neutral-700 hover:text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
        </div>

        {/* 4. Social Sharing Lingkaran (WhatsApp & Telegram) */}
        <div className="w-full flex flex-col items-center mb-8">
          <span className="text-[13px] font-semibold text-neutral-800 text-center block mb-3.5">
            Share
          </span>
          <div className="flex items-center justify-center gap-4">
            {/* Tombol WhatsApp Bulat */}
            <a
              href={shareUrl ? createWhatsAppShareUrl(album.covers.title, shareUrl) : "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bagikan ke WhatsApp"
              title="WhatsApp"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm hover:scale-105 active:scale-95 transition-transform"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.41a8.17 8.17 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.3z" />
              </svg>
            </a>

            {/* Tombol Telegram Bulat */}
            <a
              href={shareUrl ? createTelegramShareUrl(album.covers.title, shareUrl) : "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bagikan ke Telegram"
              title="Telegram"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#229ED9] text-white shadow-sm hover:scale-105 active:scale-95 transition-transform"
            >
              <svg className="h-5 w-5 fill-current -ml-0.5" viewBox="0 0 24 24">
                <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.313 4.673c.458 0 .661-.21.917-.457l2.203-2.141 4.582 3.385c.845.466 1.454.226 1.664-.785l3.008-14.17c.308-1.236-.472-1.796-1.277-1.472z" />
              </svg>
            </a>
          </div>
        </div>

        {/* 5. Footer: Cek Dulu & Selesai */}
        <div className="w-full flex items-center justify-between">
          <a
            href={shareUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold text-neutral-800 hover:text-black transition-colors"
          >
            <svg
              className="h-4 w-4 text-neutral-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>Cek Dulu</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-neutral-100/90 hover:bg-neutral-200/90 text-neutral-800 text-xs font-semibold px-5 py-2.5 transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
