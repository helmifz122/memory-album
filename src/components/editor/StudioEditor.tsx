import React, { useState } from "react";
import { useAlbum } from "../../context/AlbumContext";
import CoverTab from "./CoverTab";
import PagesTab from "./PagesTab";
import AtmosphereTab from "./AtmosphereTab";
import NarrativeTab from "./NarrativeTab";

type EditorTab = "cover" | "pages" | "atmosphere" | "narrative";

interface StudioEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShare: () => void;
}

export const StudioEditor: React.FC<StudioEditorProps> = ({ isOpen, onClose, onOpenShare }) => {
  const { isMobile, resetToDefault } = useAlbum();
  const [activeTab, setActiveTab] = useState<EditorTab>("cover");

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop redup transparan pada layar HP */}
      {isMobile && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] transition-opacity"
        />
      )}

      {/* Kontainer Panel Studio Editor */}
      <aside
        className={`fixed z-50 flex flex-col bg-white text-black shadow-2xl transition-all duration-300 ease-out border-black/10 ${
          isMobile
            ? "inset-x-0 bottom-0 max-h-[82vh] rounded-t-2xl border-t"
            : "top-0 left-0 bottom-0 w-[410px] border-r"
        }`}
      >
        {/* Header Editor */}
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-3.5 shrink-0">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-900">
            KUSTOMISASI
          </h2>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={resetToDefault}
              title="Reset ke pengaturan awal"
              className="rounded px-2 py-1 text-[11px] font-mono text-neutral-400 hover:text-neutral-800 transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup Studio Editor"
              className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-black/5 hover:text-neutral-800 transition-colors text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Bar Navigasi */}
        <div className="grid grid-cols-4 border-b border-black/10 bg-black/[0.02] p-1.5 shrink-0 gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab("cover")}
            className={`rounded-lg py-1.5 px-2 font-medium transition-all text-center truncate ${
              activeTab === "cover"
                ? "bg-white font-semibold text-black shadow-sm"
                : "text-black/50 hover:text-black"
            }`}
          >
            Sampul
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pages")}
            className={`rounded-lg py-1.5 px-2 font-medium transition-all text-center truncate ${
              activeTab === "pages"
                ? "bg-white font-semibold text-black shadow-sm"
                : "text-black/50 hover:text-black"
            }`}
          >
            Halaman
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("atmosphere")}
            className={`rounded-lg py-1.5 px-2 font-medium transition-all text-center truncate ${
              activeTab === "atmosphere"
                ? "bg-white font-semibold text-black shadow-sm"
                : "text-black/50 hover:text-black"
            }`}
          >
            Musik
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("narrative")}
            className={`rounded-lg py-1.5 px-2 font-medium transition-all text-center truncate ${
              activeTab === "narrative"
                ? "bg-white font-semibold text-black shadow-sm"
                : "text-black/50 hover:text-black"
            }`}
          >
            Prolog
          </button>
        </div>

        {/* Konten Tab Aktif (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-black/10">
          {activeTab === "cover" && <CoverTab />}
          {activeTab === "pages" && <PagesTab />}
          {activeTab === "atmosphere" && <AtmosphereTab />}
          {activeTab === "narrative" && <NarrativeTab />}
        </div>

        {/* Footer: Tombol Bagikan Album */}
        <div className="p-4 border-t border-black/10 bg-white shrink-0">
          <button
            type="button"
            onClick={onOpenShare}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md hover:bg-neutral-800 active:scale-95 transition-all"
          >
            <svg
              className="h-3.5 w-3.5"
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
            <span>Bagikan Album</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default StudioEditor;
