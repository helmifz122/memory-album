import React, { useState } from "react";
import { useAlbum } from "../../context/AlbumContext";
import { PAGE_LAYOUT_PRESETS } from "../../types/album";
import { MediaUploader } from "./MediaUploader";

export const PagesTab: React.FC = () => {
  const {
    album,
    addSheet,
    updateSheet,
    removeSheet,
    reorderSheets,
    applyLayoutPresetToSheet,
  } = useAlbum();
  const { sheets } = album;

  const [expandedSheetId, setExpandedSheetId] = useState<string | null>(
    sheets[0]?.id || null
  );
  const [selectedPresetForNew, setSelectedPresetForNew] = useState<string>("bleed-duo");

  return (
    <div className="space-y-6">
      {/* Tombol Tambah Lembaran Baru dengan Preset Layout */}
      <div className="rounded-xl border border-black/10 bg-black/[0.02] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-black/60">
            Tambah Lembar
          </span>
          <span className="text-[11px] font-mono text-black/40">
            {sheets.length} Lembar ({sheets.length * 2} Hal.)
          </span>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedPresetForNew}
            onChange={(e) => setSelectedPresetForNew(e.target.value)}
            className="flex-1 rounded-lg border border-black/15 bg-white px-3 py-2 text-xs font-medium text-black focus:border-black/50 focus:outline-none"
          >
            {PAGE_LAYOUT_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => addSheet(selectedPresetForNew)}
            className="rounded-lg bg-black px-4 py-2 text-xs font-medium text-white transition-all hover:bg-neutral-800 active:scale-95 shrink-0"
          >
            + Tambah
          </button>
        </div>
      </div>

      {/* Daftar Lembaran Halaman */}
      <div className="space-y-3">
        {sheets.map((sheet, index) => {
          const isExpanded = expandedSheetId === sheet.id;
          const frontPageNum = String(index * 2 + 1).padStart(2, "0");
          const backPageNum = String(index * 2 + 2).padStart(2, "0");
          const sheetNum = String(index + 1).padStart(2, "0");

          return (
            <div
              key={sheet.id}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? "border-black/25 bg-white shadow-sm"
                  : "border-black/10 bg-white hover:border-black/20"
              }`}
            >
              {/* Header Kartu Lembaran */}
              <div
                className="flex items-center justify-between p-3.5 cursor-pointer select-none"
                onClick={() => setExpandedSheetId(isExpanded ? null : sheet.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-black/5 font-mono text-xs font-semibold text-black/70">
                    {sheetNum}
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold text-black">
                      Lembar {sheetNum} (Hal. {frontPageNum} & {backPageNum})
                    </h4>
                    <p className="text-[11px] text-black/40 truncate max-w-[180px]">
                      {sheet.frontCaption || "Tanpa judul"} / {sheet.backCaption || "Tanpa judul"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {/* Geser Urutan Naik */}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => reorderSheets(index, index - 1)}
                    title="Geser ke atas"
                    className="flex h-7 w-7 items-center justify-center rounded border border-black/10 text-black/60 hover:bg-black/5 disabled:opacity-20 transition-colors"
                  >
                    ↑
                  </button>
                  {/* Geser Urutan Turun */}
                  <button
                    type="button"
                    disabled={index === sheets.length - 1}
                    onClick={() => reorderSheets(index, index + 1)}
                    title="Geser ke bawah"
                    className="flex h-7 w-7 items-center justify-center rounded border border-black/10 text-black/60 hover:bg-black/5 disabled:opacity-20 transition-colors"
                  >
                    ↓
                  </button>
                  {/* Hapus Lembar */}
                  <button
                    type="button"
                    disabled={sheets.length <= 1}
                    onClick={() => removeSheet(sheet.id)}
                    title="Hapus lembar"
                    className="flex h-7 w-7 items-center justify-center rounded border border-black/10 text-neutral-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-20 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Detail Editor Lembaran Saat Terbuka */}
              {isExpanded && (
                <div className="border-t border-black/10 p-4 space-y-4 bg-black/[0.01]">
                  {/* Pilihan Cepat Preset Layout untuk Lembar Ini */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-black/50 mb-1.5">
                      Preset Layout
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PAGE_LAYOUT_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyLayoutPresetToSheet(sheet.id, preset.id)}
                          className="rounded border border-black/10 bg-white p-2 text-left hover:border-black/30 transition-colors"
                        >
                          <span className="block text-xs font-medium text-black truncate">
                            {preset.name}
                          </span>
                          <span className="block text-[10px] text-black/40 truncate">
                            {preset.frontFill} / {preset.backFill}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sisi Depan (Halaman Ganjil) */}
                  <div className="rounded-lg border border-black/10 bg-white p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-black">
                        Sisi Depan (Hal. {frontPageNum})
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateSheet(sheet.id, { frontFill: "bleed" })}
                          className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                            sheet.frontFill === "bleed"
                              ? "bg-black text-white"
                              : "bg-black/5 text-black/60"
                          }`}
                        >
                          Bleed
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSheet(sheet.id, { frontFill: "framed" })}
                          className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                            sheet.frontFill === "framed"
                              ? "bg-black text-white"
                              : "bg-black/5 text-black/60"
                          }`}
                        >
                          Framed
                        </button>
                      </div>
                    </div>

                    <MediaUploader
                      label="Foto"
                      value={sheet.frontImageURL}
                      onChange={(val) => updateSheet(sheet.id, { frontImageURL: val })}
                      placeholder="/images/page-01.jpg"
                    />

                    <MediaUploader
                      label="Video (Opsional)"
                      value={sheet.frontVideoURL || ""}
                      onChange={(val) => updateSheet(sheet.id, { frontVideoURL: val })}
                      accept="video/mp4,video/*"
                      mediaType="video"
                      placeholder="/videos/video-01.mp4"
                    />

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-black/40 mb-1">
                        Caption
                      </label>
                      <input
                        type="text"
                        value={sheet.frontCaption || ""}
                        onChange={(e) => updateSheet(sheet.id, { frontCaption: e.target.value })}
                        placeholder="Tulis caption singkat..."
                        className="w-full rounded border border-black/15 bg-white px-2.5 py-1.5 text-xs text-black placeholder:text-black/30 focus:border-black/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Sisi Belakang (Halaman Genap) */}
                  <div className="rounded-lg border border-black/10 bg-white p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-black">
                        Sisi Belakang (Hal. {backPageNum})
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateSheet(sheet.id, { backFill: "bleed" })}
                          className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                            sheet.backFill === "bleed"
                              ? "bg-black text-white"
                              : "bg-black/5 text-black/60"
                          }`}
                        >
                          Bleed
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSheet(sheet.id, { backFill: "framed" })}
                          className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                            sheet.backFill === "framed"
                              ? "bg-black text-white"
                              : "bg-black/5 text-black/60"
                          }`}
                        >
                          Framed
                        </button>
                      </div>
                    </div>

                    <MediaUploader
                      label="Foto"
                      value={sheet.backImageURL}
                      onChange={(val) => updateSheet(sheet.id, { backImageURL: val })}
                      placeholder="/images/page-02.jpg"
                    />

                    <MediaUploader
                      label="Video (Opsional)"
                      value={sheet.backVideoURL || ""}
                      onChange={(val) => updateSheet(sheet.id, { backVideoURL: val })}
                      accept="video/mp4,video/*"
                      mediaType="video"
                      placeholder="/videos/video-02.mp4"
                    />

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-black/40 mb-1">
                        Caption
                      </label>
                      <input
                        type="text"
                        value={sheet.backCaption || ""}
                        onChange={(e) => updateSheet(sheet.id, { backCaption: e.target.value })}
                        placeholder="Tulis caption singkat..."
                        className="w-full rounded border border-black/15 bg-white px-2.5 py-1.5 text-xs text-black placeholder:text-black/30 focus:border-black/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PagesTab;
