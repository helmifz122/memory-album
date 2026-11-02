import React from "react";
import { useAlbum } from "../../context/AlbumContext";
import { MediaUploader } from "./MediaUploader";

const COVER_COLOR_PALETTES = [
  { name: "Forest Green", hex: "#26332d" },
  { name: "Deep Navy", hex: "#1a2634" },
  { name: "Burgundy", hex: "#3b1e28" },
  { name: "Warm Terracotta", hex: "#4a2d21" },
  { name: "Charcoal Slate", hex: "#22252a" },
  { name: "Warm Mocha", hex: "#382e2b" },
];

export const CoverTab: React.FC = () => {
  const { album, updateCovers } = useAlbum();
  const { covers } = album;

  return (
    <div className="space-y-6">
      {/* Judul Buku */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-black/60 mb-2">
          Judul Album
        </label>
        <input
          type="text"
          value={covers.title}
          onChange={(e) => updateCovers({ title: e.target.value })}
          placeholder="Masukkan judul album..."
          className="w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-sm font-medium text-black placeholder:text-black/30 focus:border-black/50 focus:outline-none transition-colors"
        />
      </div>

      {/* Pilihan Warna Sampul Hardcover */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-black/60 mb-2">
          Warna Sampul
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {COVER_COLOR_PALETTES.map((palette) => {
            const isSelected = covers.color.toLowerCase() === palette.hex.toLowerCase();
            return (
              <button
                key={palette.hex}
                type="button"
                onClick={() => updateCovers({ color: palette.hex })}
                className={`flex items-center gap-2 rounded-lg border p-2 text-left transition-all ${
                  isSelected
                    ? "border-black bg-black/5 shadow-sm"
                    : "border-black/10 hover:border-black/30 bg-white"
                }`}
              >
                <span
                  className="h-5 w-5 shrink-0 rounded-full border border-black/10 shadow-inner"
                  style={{ backgroundColor: palette.hex }}
                />
                <span className="text-xs font-medium text-black/80 truncate">
                  {palette.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Warna Teks Judul */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-black/60 mb-2">
          Warna Tipografi
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => updateCovers({ titleColor: "#f4f1ea" })}
            className={`flex-1 rounded-lg border py-2 px-3 text-xs font-medium transition-all flex items-center justify-center gap-2 ${
              covers.titleColor === "#f4f1ea"
                ? "border-black bg-black text-white"
                : "border-black/15 bg-white text-black hover:border-black/40"
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-[#f4f1ea] border border-black/20" />
            Ivory
          </button>
          <button
            type="button"
            onClick={() => updateCovers({ titleColor: "#171717" })}
            className={`flex-1 rounded-lg border py-2 px-3 text-xs font-medium transition-all flex items-center justify-center gap-2 ${
              covers.titleColor === "#171717"
                ? "border-black bg-black text-white"
                : "border-black/15 bg-white text-black hover:border-black/40"
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-[#171717] border border-white/20" />
            Charcoal
          </button>
        </div>
      </div>

      {/* Media Sampul Depan */}
      <MediaUploader
        label="Foto Sampul Depan"
        value={covers.frontImageURL || ""}
        onChange={(val) => updateCovers({ frontImageURL: val })}
        placeholder="/images/cover.jpg atau pilih file..."
      />

      {/* Media Sampul Belakang */}
      <MediaUploader
        label="Foto Sampul Belakang (Opsional)"
        value={covers.backImageURL || ""}
        onChange={(val) => updateCovers({ backImageURL: val })}
        placeholder="Pilih file atau biarkan polos..."
      />
    </div>
  );
};

export default CoverTab;
