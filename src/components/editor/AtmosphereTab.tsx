import React from "react";
import { useAlbum } from "../../context/AlbumContext";
import { AUDIO_PRESETS } from "../../types/album";

const CANVAS_BACKGROUNDS = [
  { name: "Warm Beige", hex: "#e7e3da" },
  { name: "Deep Charcoal", hex: "#1c1e21" },
  { name: "Soft Linen", hex: "#dfdbd3" },
  { name: "Muted Olive", hex: "#dadcd5" },
  { name: "Pale Rose", hex: "#eadae2" },
];

export const AtmosphereTab: React.FC = () => {
  const { album, updateBackgroundSettings, updateAudio } = useAlbum();
  const { background, audio } = album;

  return (
    <div className="space-y-6">
      {/* Warna Latar Belakang Kanvas */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-black/60 mb-2">
          Warna Latar
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CANVAS_BACKGROUNDS.map((bg) => {
            const isSelected = background.color.toLowerCase() === bg.hex.toLowerCase();
            return (
              <button
                key={bg.hex}
                type="button"
                onClick={() => updateBackgroundSettings({ color: bg.hex })}
                className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all ${
                  isSelected
                    ? "border-black bg-black/5 shadow-sm"
                    : "border-black/10 hover:border-black/30 bg-white"
                }`}
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-full border border-black/10 shadow-inner"
                  style={{ backgroundColor: bg.hex }}
                />
                <span className="text-xs font-medium text-black/80 truncate">
                  {bg.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kontrol Musik Latar (BGM) */}
      <div className="border-t border-black/10 pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-black">Musik Latar</h4>
          <button
            type="button"
            onClick={() => updateAudio({ enabled: !audio.enabled })}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              audio.enabled ? "bg-black" : "bg-black/20"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                audio.enabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {audio.enabled && (
          <div className="space-y-4 rounded-xl border border-black/10 bg-black/[0.02] p-3.5">
            {/* Pilihan Preset Musik */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-black/50 mb-1.5">
                Pilihan Instrumen
              </label>
              <div className="space-y-1.5">
                {AUDIO_PRESETS.map((preset) => {
                  const isSelected = audio.src === preset.src;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        updateAudio({
                          src: preset.src,
                          title: preset.name,
                          artist: preset.artist,
                        })
                      }
                      className={`w-full flex items-center justify-between rounded-lg border p-2.5 text-left transition-all ${
                        isSelected
                          ? "border-black bg-white shadow-sm font-semibold"
                          : "border-black/10 bg-white/60 hover:bg-white"
                      }`}
                    >
                      <div>
                        <span className="block text-xs text-black">
                          {preset.name}
                        </span>
                        <span className="block text-[10px] text-black/40">
                          {preset.artist}
                        </span>
                      </div>
                      <span className="rounded bg-black/5 px-2 py-0.5 text-[10px] font-mono text-black/60">
                        {preset.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* URL File Audio Kustom */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-black/50 mb-1">
                URL Audio Custom
              </label>
              <input
                type="text"
                value={audio.src}
                onChange={(e) => updateAudio({ src: e.target.value })}
                placeholder="/audio/ambient-piano.mp3 atau https://..."
                className="w-full rounded border border-black/15 bg-white px-2.5 py-1.5 font-mono text-xs text-black"
              />
            </div>

            {/* Slider Pengatur Volume */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono uppercase text-black/50">
                  Volume
                </label>
                <span className="text-xs font-mono text-black/70">
                  {Math.round(audio.defaultVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audio.defaultVolume}
                onChange={(e) =>
                  updateAudio({ defaultVolume: parseFloat(e.target.value) })
                }
                className="w-full accent-black cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AtmosphereTab;
