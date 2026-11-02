import React, { useState, useRef } from "react";
import { compressImageFile, readFileAsDataUrl } from "../../utils/mediaCompression";

interface MediaUploaderProps {
  label: string;
  value: string;
  onChange: (newValue: string) => void;
  accept?: string;
  mediaType?: "image" | "video";
  placeholder?: string;
  helperText?: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  label,
  value,
  onChange,
  accept = "image/*",
  mediaType = "image",
  placeholder = "Pilih file atau masukkan URL...",
  helperText,
}) => {
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      if (mediaType === "image" && file.type.startsWith("image/")) {
        const compressedDataUrl = await compressImageFile(file, {
          maxWidth: 1400,
          quality: 0.82,
        });
        onChange(compressedDataUrl);
      } else {
        const dataUrl = await readFileAsDataUrl(file);
        onChange(dataUrl);
      }
    } catch (err) {
      console.error("Gagal memproses file media:", err);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono uppercase tracking-wider text-black/60">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[10px] font-mono text-black/40 hover:text-black hover:underline"
        >
          {showUrlInput ? "Mode Upload File" : "Mode Input URL"}
        </button>
      </div>

      {showUrlInput ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs font-mono text-black placeholder:text-black/30 focus:border-black/50 focus:outline-none"
        />
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`group relative flex items-center justify-between gap-3 rounded-lg border border-dashed p-2.5 transition-all cursor-pointer ${
            value
              ? "border-black/20 bg-black/[0.01] hover:border-black/40"
              : "border-black/15 bg-white hover:border-black/30 hover:bg-black/[0.01]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelected}
            className="hidden"
          />

          {/* Sisi Kiri: Thumbnail atau Ikon */}
          <div className="flex items-center gap-2.5 min-w-0">
            {value && mediaType === "image" ? (
              <img
                src={value}
                alt="Thumbnail"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.endsWith(".jpg")) {
                    target.src = target.src.replace(/\.jpg$/, ".png");
                  } else if (target.src.endsWith(".png")) {
                    target.src = target.src.replace(/\.png$/, ".jpg");
                  }
                }}
                className="h-10 w-8 shrink-0 rounded object-cover border border-black/10 shadow-sm"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-black/5 text-xs text-black/40 group-hover:bg-black/10 transition-colors">
                {mediaType === "video" ? "🎬" : "📷"}
              </div>
            )}

            <div className="min-w-0">
              <span className="block text-xs font-medium text-black truncate">
                {isCompressing
                  ? "Mengompresi file..."
                  : value
                  ? value.startsWith("data:")
                    ? "File lokal berhasil dimuat"
                    : value.split("/").pop() || "Media terpilih"
                  : mediaType === "video"
                  ? "Pilih file video MP4..."
                  : "Pilih foto dari perangkat..."}
              </span>
              <span className="block text-[10px] text-black/40 truncate">
                {isCompressing
                  ? "Mohon tunggu sebentar..."
                  : value
                  ? "Klik untuk ganti file"
                  : "Mendukung JPEG, PNG, WebP"}
              </span>
            </div>
          </div>

          {/* Sisi Kanan: Tombol Tindakan */}
          <div className="flex items-center gap-1.5 shrink-0">
            {value && (
              <button
                type="button"
                onClick={handleClear}
                title="Hapus media"
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-black/40 hover:bg-black/10 hover:text-black transition-colors"
              >
                ✕
              </button>
            )}
            <span className="rounded bg-black/5 px-2 py-1 text-[10px] font-mono font-medium text-black/70 group-hover:bg-black/10 transition-colors">
              Pilih
            </span>
          </div>
        </div>
      )}

      {helperText && (
        <p className="text-[10px] text-black/40">{helperText}</p>
      )}
    </div>
  );
};

export default MediaUploader;
