import React from "react";
import { useAlbum } from "../../context/AlbumContext";
import { StorySection } from "../../types/album";

export const NarrativeTab: React.FC = () => {
  const { album, updateStoryIntro, updateClosingNote } = useAlbum();
  const { storyIntro, closingNote } = album;

  const handleUpdateSectionText = (id: string, newText: string) => {
    const updated = storyIntro.sections.map((sec) =>
      sec.id === id ? { ...sec, text: newText } : sec
    );
    updateStoryIntro({ sections: updated });
  };

  const handleUpdateSectionSlot = (id: string, slotIndex: number, newSlotText: string) => {
    const updated = storyIntro.sections.map((sec) => {
      if (sec.id !== id) return sec;
      const slots = [...(sec.slots || [])];
      slots[slotIndex] = { text: newSlotText };
      return { ...sec, slots };
    });
    updateStoryIntro({ sections: updated });
  };

  const handleAddSection = () => {
    const newId = `story-${Date.now()}`;
    const newSection: StorySection = {
      id: newId,
      text: "Sebuah momen baru yang tertulis [1] untuk kita.",
      slots: [{ text: "Istimewa" }],
      readDuration: 4200,
    };
    updateStoryIntro({ sections: [...storyIntro.sections, newSection] });
  };

  const handleRemoveSection = (id: string) => {
    if (storyIntro.sections.length <= 1) return;
    updateStoryIntro({
      sections: storyIntro.sections.filter((s) => s.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Pengaturan Prolog Cerita Pembuka (Story Intro) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-black">Teks Pembuka</h4>
          <button
            type="button"
            onClick={() => updateStoryIntro({ enabled: !storyIntro.enabled })}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              storyIntro.enabled ? "bg-black" : "bg-black/20"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                storyIntro.enabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {storyIntro.enabled && (
          <div className="space-y-4 rounded-xl border border-black/10 bg-black/[0.02] p-3.5">
            {/* Slider Jeda Awal */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono uppercase text-black/50">
                  Jeda Awal
                </label>
                <span className="text-xs font-mono text-black/70">
                  {((storyIntro.initialDelay || 3800) / 1000).toFixed(1)}s
                </span>
              </div>
              <input
                type="range"
                min="2000"
                max="5000"
                step="200"
                value={storyIntro.initialDelay || 3800}
                onChange={(e) =>
                  updateStoryIntro({ initialDelay: parseInt(e.target.value, 10) })
                }
                className="w-full accent-black cursor-pointer"
              />
            </div>

            {/* Daftar Kalimat Intro */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-black/50">
                  Daftar Kalimat
                </span>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="text-xs font-mono font-medium text-black hover:underline"
                >
                  + Tambah
                </button>
              </div>

              {storyIntro.sections.map((section, idx) => (
                <div
                  key={section.id}
                  className="rounded-lg border border-black/10 bg-white p-3 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-black">
                      Kalimat {idx + 1}
                    </span>
                    <button
                      type="button"
                      disabled={storyIntro.sections.length <= 1}
                      onClick={() => handleRemoveSection(section.id)}
                      className="text-xs text-neutral-400 hover:text-red-600 disabled:opacity-20 transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={section.text}
                      onChange={(e) => handleUpdateSectionText(section.id, e.target.value)}
                      placeholder="Gunakan [1] untuk kapsul kata..."
                      className="w-full rounded border border-black/15 px-2.5 py-1.5 text-xs text-black"
                    />
                  </div>

                  {section.slots && section.slots.length > 0 && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[10px] font-mono uppercase text-black/40 shrink-0">
                        Kapsul [1]:
                      </span>
                      <input
                        type="text"
                        value={section.slots[0]?.text || ""}
                        onChange={(e) => handleUpdateSectionSlot(section.id, 0, e.target.value)}
                        placeholder="Contoh: Selamanya"
                        className="rounded border border-black/15 px-2 py-1 text-xs font-semibold text-black flex-1"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Pengaturan Lembar Catatan Penutup (Closing Note) */}
      <div className="border-t border-black/10 pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-black">Catatan Penutup</h4>
          <button
            type="button"
            onClick={() => updateClosingNote({ enabled: !closingNote.enabled })}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              closingNote.enabled ? "bg-black" : "bg-black/20"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                closingNote.enabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {closingNote.enabled && (
          <div className="space-y-3 rounded-xl border border-black/10 bg-black/[0.02] p-3.5">
            <div>
              <label className="block text-[11px] font-mono uppercase text-black/50 mb-1">
                Pesan Kutipan
              </label>
              <textarea
                rows={2}
                value={closingNote.quote}
                onChange={(e) => updateClosingNote({ quote: e.target.value })}
                placeholder="Tulis pesan atau ucapan..."
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs italic text-black placeholder:text-black/30 focus:border-black/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-black/50 mb-1">
                Nama Pengirim
              </label>
              <input
                type="text"
                value={closingNote.author}
                onChange={(e) => updateClosingNote({ author: e.target.value })}
                placeholder="Nama Anda..."
                className="w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-xs font-medium text-black placeholder:text-black/30 focus:border-black/50 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NarrativeTab;
