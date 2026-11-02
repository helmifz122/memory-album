import React, { useState, useEffect, useMemo, useRef } from "react";
import { StoryIntroConfig, StorySection, StorySlot } from "../types/album";

export type { StoryIntroConfig, StorySection, StorySlot };

/**
 * Konfigurasi narasi cerita pembuka (Story Intro).
 * Pengguna dapat mengubah atau menambah kalimat di sini.
 * Token [1], [2], dst. otomatis dirender menjadi kapsul putih solid dengan teks hitam tanpa ikon.
 */
export const INTRO_STORY_CONFIG: StoryIntroConfig = {
  enabled: true,
  initialDelay: 3800, // Jeda awal 3.8 detik agar alunan piano mulai terdengar sebelum teks pertama
  sections: [
    {
      id: "story-1",
      text: "Ada hari-hari istimewa yang ingin kita abadikan [1] di dalam ingatan.",
      slots: [{ text: "Selamanya" }],
      readDuration: 4200,
    },
    {
      id: "story-2",
      text: "Untuk semua tawa, perjalanan, dan [1] yang telah kita lalui bersama.",
      slots: [{ text: "Momen Indah" }],
      readDuration: 4400,
    },
    {
      id: "story-3",
      text: "Sebuah persembahan kecil untuk merayakan hadirnya [1] di hidup ini.",
      slots: [{ text: "Cerita Terbaik" }],
      readDuration: 4400,
    },
  ],
};

interface Token {
  type: "word" | "slot";
  content: string;
}

// Konfigurasi kecepatan animasi
const ENTER_DURATION = 1400;       // Durasi animasi masuk per kata (diperlambat 50% agar tampil sangat anggun)
const STAGGER_IN = 160;            // Jeda antar kata saat masuk (stagger diperlambat)
const EXIT_DURATION = 850;         // Durasi animasi keluar per kata
const STAGGER_OUT = 55;            // Jeda antar kata saat keluar
const FLASH_EXPAND_DURATION = 2000; // Durasi cahaya putih merebak dari titik tengah ke seluruh layar
const DISSOLVE_DURATION = 1600;    // Durasi transisi akhir dari cahaya putih ke buku 3D (diperlama 50%)
const DEFAULT_READ_DWELL = 4200;

export const StoryIntro: React.FC<{
  config?: StoryIntroConfig;
  onComplete: () => void;
}> = ({ config = INTRO_STORY_CONFIG, onComplete }) => {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [phase, setPhase] = useState<"initial-pause" | "entering" | "exiting" | "flash" | "dissolve" | "done">("initial-pause");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sections = config.sections;
  const currentSection = sections[sectionIndex];

  // Memecah teks menjadi token kata dan token slot [1], [2]
  const tokens: Token[] = useMemo(() => {
    if (!currentSection) return [];
    const rawTokens = currentSection.text.split(/(\[[0-9]+\]|\s+)/).filter(Boolean);
    const result: Token[] = [];

    rawTokens.forEach((tok) => {
      if (/^\s+$/.test(tok)) return;
      const slotMatch = tok.match(/^\[([0-9]+)\]$/);
      if (slotMatch) {
        const slotIdx = parseInt(slotMatch[1], 10) - 1;
        const slotData = currentSection.slots?.[slotIdx];
        result.push({
          type: "slot",
          content: slotData?.text || `Slot ${slotIdx + 1}`,
        });
      } else {
        result.push({
          type: "word",
          content: tok,
        });
      }
    });

    return result;
  }, [currentSection]);

  // Alur siklus hidup animasi: initial-pause -> entering -> jeda membaca -> exiting -> flash -> dissolve
  useEffect(() => {
    if (!config.enabled || sections.length === 0) {
      onComplete();
      return;
    }

    if (phase === "initial-pause") {
      // Jeda hening 3-5 detik saat pertama kali web dibuka agar musik bergaung lembut
      const initialDelay = config.initialDelay ?? 3800;
      timerRef.current = setTimeout(() => {
        setPhase("entering");
      }, initialDelay);
    } else if (phase === "entering") {
      // Waktu total untuk semua kata selesai muncul + jeda waktu membaca yang tenang
      const totalEnterTime = (tokens.length - 1) * STAGGER_IN + ENTER_DURATION;
      const readDwell = currentSection?.readDuration || DEFAULT_READ_DWELL;

      timerRef.current = setTimeout(() => {
        setPhase("exiting");
      }, totalEnterTime + readDwell);
    } else if (phase === "exiting") {
      // Waktu total untuk semua kata memudar keluar secara berurutan
      const totalExitTime = (tokens.length - 1) * STAGGER_OUT + EXIT_DURATION;

      timerRef.current = setTimeout(() => {
        if (sectionIndex < sections.length - 1) {
          setSectionIndex((prev) => prev + 1);
          setPhase("entering");
        } else {
          // Teks terakhir sudah 100% tuntas memudar, jeda hening sejenak sebelum cahaya muncul
          setPhase("flash");
        }
      }, totalExitTime + 200);
    } else if (phase === "flash") {
      // Cahaya mekar dari tengah secara perlahan menyinari seluruh layar
      timerRef.current = setTimeout(() => {
        setPhase("dissolve");
      }, FLASH_EXPAND_DURATION);
    } else if (phase === "dissolve") {
      // Cahaya putih memudar halus memperlihatkan album fisik 3D di baliknya
      timerRef.current = setTimeout(() => {
        setPhase("done");
        onComplete();
      }, DISSOLVE_DURATION);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, sectionIndex, tokens.length, currentSection, sections.length, config.enabled, config.initialDelay, onComplete]);

  const handleSkip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("dissolve");
    timerRef.current = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 700);
  };

  if (phase === "done") return null;

  const isTransitioningToBook = phase === "dissolve";
  const isFlashActive = phase === "flash" || phase === "dissolve";

  return (
    <div
      style={{
        transitionDuration: `${DISSOLVE_DURATION}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black transition-opacity select-none ${
        isTransitioningToBook ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
      }`}
    >
      {/* Definisi Keyframes CSS Terisolasi */}
      <style>{`
        @keyframes introWordRevealIn {
          0% {
            opacity: 0;
            filter: blur(14px);
            transform: translateY(28px);
          }
          100% {
            opacity: 1;
            filter: blur(0px);
            transform: translateY(0px);
          }
        }

        @keyframes introWordRevealOut {
          0% {
            opacity: 1;
            filter: blur(0px);
            transform: translateY(0px);
          }
          100% {
            opacity: 0;
            filter: blur(14px);
            transform: translateY(-22px);
          }
        }
      `}</style>

      {/* Tombol Lewati di pojok kanan atas */}
      {!isFlashActive && (
        <button
          type="button"
          onClick={handleSkip}
          aria-label="Lewati intro cerita"
          className="absolute top-6 right-6 z-20 rounded-full border border-white/20 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-widest text-white/70 backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-white/10 hover:text-white active:scale-[0.97]"
        >
          Lewati
        </button>
      )}

      {/* Kontainer Teks Narasi Terpusat: HANYA dirender saat entering/exiting, di-unmount saat pause awal dan flash */}
      {(phase === "entering" || phase === "exiting") && currentSection && (
        <div className="relative z-10 max-w-3xl px-6 text-center sm:px-12">
          <h1
            key={`section-${currentSection.id}`}
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3.5 font-space text-2xl font-normal leading-relaxed text-white sm:text-3xl md:text-4xl"
          >
            {tokens.map((token, idx) => {
              const isEntering = phase === "entering";

              const animName = isEntering ? "introWordRevealIn" : "introWordRevealOut";
              const animDuration = isEntering ? `${ENTER_DURATION}ms` : `${EXIT_DURATION}ms`;
              const animDelay = isEntering ? `${idx * STAGGER_IN}ms` : `${idx * STAGGER_OUT}ms`;

              const wordStyle: React.CSSProperties = {
                animation: `${animName} ${animDuration} cubic-bezier(0.16, 1, 0.3, 1) ${animDelay} both`,
                willChange: "transform, opacity, filter",
              };

              // Kapsul putih solid dengan teks hitam tanpa ikon
              if (token.type === "slot") {
                return (
                  <span
                    key={`slot-${idx}-${currentSection.id}`}
                    style={wordStyle}
                    className="inline-flex items-center rounded-full bg-white px-4 py-1 text-[0.82em] font-semibold tracking-normal text-black shadow-lg align-middle"
                  >
                    {token.content}
                  </span>
                );
              }

              // Teks kata biasa
              return (
                <span
                  key={`word-${idx}-${currentSection.id}`}
                  style={wordStyle}
                  className="inline-block"
                >
                  {token.content}
                </span>
              );
            })}
          </h1>
        </div>
      )}

      {/* Efek Kilatan Cahaya Putih dari Tengah Layar */}
      <div
        className={`pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden transition-opacity duration-300 ${
          isFlashActive ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          style={{
            transitionDuration: `${FLASH_EXPAND_DURATION}ms`,
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className={`h-40 w-40 rounded-full bg-white shadow-[0_0_160px_80px_#ffffff] transition-transform ${
            isFlashActive ? "scale-[45]" : "scale-0"
          }`}
        />
      </div>
    </div>
  );
};

export default StoryIntro;
