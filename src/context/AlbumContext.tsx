import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  AlbumData,
  DEFAULT_ALBUM_DATA,
  CoverConfig,
  BookSettings,
  MotionSettings,
  BackgroundSettings,
  SheetConfig,
  StoryIntroConfig,
  AudioConfig,
  ClosingNoteConfig,
  PAGE_LAYOUT_PRESETS,
} from "../types/album";
import { decompressAlbumFromUrl } from "../utils/shareableLink";
import { loadAlbumFromCloud } from "../lib/supabase";

interface AlbumContextValue {
  album: AlbumData;
  isMobile: boolean;
  isRecipientMode: boolean;
  isAutoFlipping: boolean;
  // Aksi Update Sampul & Buku
  updateCovers: (covers: Partial<CoverConfig>) => void;
  updateBookSettings: (settings: Partial<BookSettings>) => void;
  updateMotionSettings: (motion: Partial<MotionSettings>) => void;
  updateBackgroundSettings: (bg: Partial<BackgroundSettings>) => void;
  // Aksi Manajer Halaman (Spreads)
  addSheet: (presetId?: string, atIndex?: number) => void;
  updateSheet: (id: string, sheet: Partial<SheetConfig>) => void;
  removeSheet: (id: string) => void;
  reorderSheets: (fromIndex: number, toIndex: number) => void;
  applyLayoutPresetToSheet: (sheetId: string, presetId: string) => void;
  // Aksi Narasi, Audio, dan Penutup
  updateStoryIntro: (intro: Partial<StoryIntroConfig>) => void;
  updateAudio: (audio: Partial<AudioConfig>) => void;
  updateClosingNote: (note: Partial<ClosingNoteConfig>) => void;
  // Aksi Kontrol Playback
  setIsAutoFlipping: (active: boolean) => void;
  toggleAutoFlip: () => void;
  resetToDefault: () => void;
  loadAlbum: (data: AlbumData) => void;
}

const AlbumContext = createContext<AlbumContextValue | null>(null);

export const AlbumProvider: React.FC<{
  initialData?: AlbumData;
  children: React.ReactNode;
}> = ({ initialData = DEFAULT_ALBUM_DATA, children }) => {
  const [album, setAlbum] = useState<AlbumData>(initialData);
  const [isRecipientMode, setIsRecipientMode] = useState<boolean>(false);
  const [isAutoFlipping, setIsAutoFlipping] = useState<boolean>(false);

  // Deteksi Tampilan Mobile Responsif (Width < 768px)
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Periksa URL hash (tautan penerima) atau draft tersimpan
  useEffect(() => {
    const checkUrlOrDraft = async () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash;

      if (hash.startsWith("#/view/")) {
        const decompressed = decompressAlbumFromUrl(hash);
        if (decompressed) {
          setAlbum(decompressed);
          setIsRecipientMode(true);
          return;
        }
      } else if (hash.startsWith("#/album/")) {
        const albumId = hash.replace("#/album/", "").trim();
        if (albumId) {
          const cloudData = await loadAlbumFromCloud(albumId);
          if (cloudData) {
            setAlbum(cloudData);
            setIsRecipientMode(true);
            return;
          }
        }
      }

      // Jika bukan mode penerima, muat draf lokal terakhir
      try {
        const savedDraft = localStorage.getItem("custom_memory_album_draft");
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed && Array.isArray(parsed.sheets) && parsed.covers) {
            setAlbum(parsed);
          }
        }
      } catch (err) {
        console.warn("Gagal membaca draft lokal:", err);
      }
    };

    checkUrlOrDraft();
  }, []);

  // Auto-save perubahan ke localStorage saat mengedit draf
  useEffect(() => {
    if (isRecipientMode) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("custom_memory_album_draft", JSON.stringify(album));
      } catch (err) {
        console.warn("Penyimpanan draf lokal penuh:", err);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [album, isRecipientMode]);

  // Update Sampul Buku
  const updateCovers = useCallback((covers: Partial<CoverConfig>) => {
    setAlbum((prev) => ({
      ...prev,
      covers: { ...prev.covers, ...covers },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Update Pengaturan Fisik Buku
  const updateBookSettings = useCallback((settings: Partial<BookSettings>) => {
    setAlbum((prev) => ({
      ...prev,
      book: { ...prev.book, ...settings },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Update Pengaturan Gerak & Fisika
  const updateMotionSettings = useCallback((motion: Partial<MotionSettings>) => {
    setAlbum((prev) => ({
      ...prev,
      motion: { ...prev.motion, ...motion },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Update Latar Belakang Kanvas
  const updateBackgroundSettings = useCallback((bg: Partial<BackgroundSettings>) => {
    setAlbum((prev) => ({
      ...prev,
      background: { ...prev.background, ...bg },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Tambah Lembaran Halaman Baru (Opsional dengan Preset Layout)
  const addSheet = useCallback(
    (presetId: string = "bleed-duo", atIndex?: number) => {
      const preset =
        PAGE_LAYOUT_PRESETS.find((p) => p.id === presetId) || PAGE_LAYOUT_PRESETS[0];

      const newSheetId = `leaf-${Date.now()}`;
      const newSheet: SheetConfig = {
        id: newSheetId,
        frontImageURL: "/images/page-01.jpg",
        frontVideoURL: preset.sampleFrontVideo || "",
        frontCaption: preset.defaultFrontCaption,
        frontFill: preset.frontFill,
        backImageURL: "/images/page-02.jpg",
        backVideoURL: preset.sampleBackVideo || "",
        backCaption: preset.defaultBackCaption,
        backFill: preset.backFill,
      };

      setAlbum((prev) => {
        const updated = [...prev.sheets];
        if (typeof atIndex === "number" && atIndex >= 0 && atIndex <= updated.length) {
          updated.splice(atIndex, 0, newSheet);
        } else {
          updated.push(newSheet);
        }
        return {
          ...prev,
          sheets: updated,
          updatedAt: new Date().toISOString(),
        };
      });
    },
    []
  );

  // Update Satu Lembaran Halaman
  const updateSheet = useCallback((id: string, sheetData: Partial<SheetConfig>) => {
    setAlbum((prev) => ({
      ...prev,
      sheets: prev.sheets.map((s) => (s.id === id ? { ...s, ...sheetData } : s)),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Hapus Satu Lembaran Halaman
  const removeSheet = useCallback((id: string) => {
    setAlbum((prev) => {
      if (prev.sheets.length <= 1) return prev; // Minimal simpan 1 lembaran
      return {
        ...prev,
        sheets: prev.sheets.filter((s) => s.id !== id),
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  // Geser Urutan Lembaran (Reorder)
  const reorderSheets = useCallback((fromIndex: number, toIndex: number) => {
    setAlbum((prev) => {
      if (
        fromIndex < 0 ||
        fromIndex >= prev.sheets.length ||
        toIndex < 0 ||
        toIndex >= prev.sheets.length ||
        fromIndex === toIndex
      ) {
        return prev;
      }
      const updated = [...prev.sheets];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return {
        ...prev,
        sheets: updated,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  // Terapkan Preset Layout ke Lembaran Tertentu
  const applyLayoutPresetToSheet = useCallback((sheetId: string, presetId: string) => {
    const preset = PAGE_LAYOUT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setAlbum((prev) => ({
      ...prev,
      sheets: prev.sheets.map((s) => {
        if (s.id !== sheetId) return s;
        return {
          ...s,
          frontFill: preset.frontFill,
          backFill: preset.backFill,
          frontVideoURL: preset.sampleFrontVideo !== undefined ? preset.sampleFrontVideo : s.frontVideoURL,
          backVideoURL: preset.sampleBackVideo !== undefined ? preset.sampleBackVideo : s.backVideoURL,
        };
      }),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Update Prolog Cerita (Story Intro)
  const updateStoryIntro = useCallback((intro: Partial<StoryIntroConfig>) => {
    setAlbum((prev) => ({
      ...prev,
      storyIntro: { ...prev.storyIntro, ...intro },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Update Musik Latar
  const updateAudio = useCallback((audio: Partial<AudioConfig>) => {
    setAlbum((prev) => ({
      ...prev,
      audio: { ...prev.audio, ...audio },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Update Catatan Penutup
  const updateClosingNote = useCallback((note: Partial<ClosingNoteConfig>) => {
    setAlbum((prev) => ({
      ...prev,
      closingNote: { ...prev.closingNote, ...note },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Toggle Autoplay
  const toggleAutoFlip = useCallback(() => {
    setIsAutoFlipping((prev) => !prev);
  }, []);

  // Reset ke Konfigurasi Bawaan
  const resetToDefault = useCallback(() => {
    setAlbum(DEFAULT_ALBUM_DATA);
    setIsAutoFlipping(false);
    try {
      localStorage.removeItem("custom_memory_album_draft");
    } catch (err) {
      console.warn("Gagal menghapus draf:", err);
    }
  }, []);

  // Muat Data Album Kustom
  const loadAlbum = useCallback((data: AlbumData) => {
    setAlbum(data);
    setIsAutoFlipping(false);
  }, []);

  const value = useMemo<AlbumContextValue>(
    () => ({
      album,
      isMobile,
      isRecipientMode,
      isAutoFlipping,
      updateCovers,
      updateBookSettings,
      updateMotionSettings,
      updateBackgroundSettings,
      addSheet,
      updateSheet,
      removeSheet,
      reorderSheets,
      applyLayoutPresetToSheet,
      updateStoryIntro,
      updateAudio,
      updateClosingNote,
      setIsAutoFlipping,
      toggleAutoFlip,
      resetToDefault,
      loadAlbum,
    }),
    [
      album,
      isMobile,
      isRecipientMode,
      isAutoFlipping,
      updateCovers,
      updateBookSettings,
      updateMotionSettings,
      updateBackgroundSettings,
      addSheet,
      updateSheet,
      removeSheet,
      reorderSheets,
      applyLayoutPresetToSheet,
      updateStoryIntro,
      updateAudio,
      updateClosingNote,
      toggleAutoFlip,
      resetToDefault,
      loadAlbum,
    ]
  );

  return <AlbumContext.Provider value={value}>{children}</AlbumContext.Provider>;
};

export const useAlbum = (): AlbumContextValue => {
  const context = useContext(AlbumContext);
  if (!context) {
    throw new Error("useAlbum must be used within an AlbumProvider");
  }
  return context;
};

export default AlbumContext;
