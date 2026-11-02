import React, { useState, useEffect, useRef, useMemo, useContext } from "react";
import AlbumContext from "../context/AlbumContext";
import { AlbumData } from "../types/album";

/**
 * Konfigurasi album foto yang mudah diedit di baris paling atas.
 * Menggunakan aset asli dan proporsi presisi dari https://memoryalbum.framer.website/
 */
export const ALBUM_CONFIG = {
  covers: {
    frontImageURL: "/images/cover.jpg",
    frontVideoURL: "",
    backImageURL: "",
    backVideoURL: "",
    title: "Volume One",
    color: "#26332d",
    titleColor: "#f4f1ea",
  },
  closingNote: {
    enabled: true,
    quote: "Terima kasih untuk selalu hadir dalam hidupku",
    author: "Hilmi",
  },
  book: {
    start: "cover" as "cover" | "spread",
    size: 0.68,
    aspect: 0.76, // 1200 / 1500 (lebar / tinggi)
    radius: 4,
    paper: "#fbfaf6",
    shadow: 0.6,
    spine: 0.55,
    thickness: 8,
    indicator: "dots" as "dots" | "counter" | "none",
    indicatorColor: "rgba(23, 23, 23, 0.72)",
  },
  motion: {
    speed: 1,
    feel: 0.45,
    curl: 1,
    tilt: true,
    tiltAmount: 6,
    autoplay: false,
    interval: 8,
  },
  background: {
    color: "#e7e3da",
    imageURL: "",
    videoURL: "",
    opacity: 1,
    tint: "#000000",
    tintStrength: 0,
  },
  sheets: [
    {
      id: "leaf-1",
      frontImageURL: "/images/page-01.jpg",
      frontVideoURL: "",
      frontCaption: "Foto Pribadi 01",
      frontFill: "bleed" as "bleed" | "framed",
      backImageURL: "/images/page-02.jpg",
      backVideoURL: "",
      backCaption: "Foto Pribadi 02",
      backFill: "bleed" as "bleed" | "framed",
    },
    {
      id: "leaf-2",
      frontImageURL: "/images/page-03.jpg",
      frontVideoURL: "/videos/video-01.mp4", // Contoh video MP4 di halaman depan
      frontCaption: "Salt Flats (Video)",
      frontFill: "bleed" as "bleed" | "framed",
      backImageURL: "/images/page-04.jpg",
      backVideoURL: "",
      backCaption: "Foto Pribadi 04",
      backFill: "bleed" as "bleed" | "framed",
    },
    {
      id: "leaf-3",
      frontImageURL: "/images/page-05.jpg",
      frontVideoURL: "",
      frontCaption: "Foto Pribadi 05",
      frontFill: "bleed" as "bleed" | "framed",
      backImageURL: "/images/page-06.jpg",
      backVideoURL: "",
      backCaption: "Foto Pribadi 06",
      backFill: "framed" as "bleed" | "framed",
    },
    {
      id: "leaf-4",
      frontImageURL: "/images/page-07.jpg",
      frontVideoURL: "",
      frontCaption: "Foto Pribadi 07",
      frontFill: "framed" as "bleed" | "framed",
      backImageURL: "/images/page-08.jpg",
      backVideoURL: "/videos/video-02.mp4", // Contoh video MP4 di halaman belakang
      backCaption: "Fog Bank (Video)",
      backFill: "framed" as "bleed" | "framed",
    },
    {
      id: "leaf-5",
      frontImageURL: "/images/page-09.jpg",
      frontVideoURL: "/videos/video-03.mp4", // Contoh video MP4 di halaman depan
      frontCaption: "Stone Steps (Video)",
      frontFill: "bleed" as "bleed" | "framed",
      backImageURL: "/images/page-10.jpg",
      backVideoURL: "",
      backCaption: "Foto Pribadi 10",
      backFill: "bleed" as "bleed" | "framed",
    },
    {
      id: "leaf-6",
      frontImageURL: "/images/page-11.jpg",
      frontVideoURL: "",
      frontCaption: "Foto Pribadi 11",
      frontFill: "bleed" as "bleed" | "framed",
      backImageURL: "/images/page-12.jpg",
      backVideoURL: "",
      backCaption: "Foto Pribadi 12",
      backFill: "framed" as "bleed" | "framed",
    },
  ],
};

export type AlbumConfig = typeof ALBUM_CONFIG;

// Konstanta mesin 3D: 12 segmen silindris per lembar halaman
const SEGMENTS = 12;
const PAGE_STACK_COLLISION = 0.035;

const clamp = (val: number, min: number, max: number) =>
  val < min ? min : val > max ? max : val;
const numDef = (val: unknown, def: number) =>
  typeof val === "number" && isFinite(val) ? val : def;
const padTwo = (val: number) => (val < 10 ? `0${val}` : `${val}`);

export interface LeafFace {
  kind: "cover" | "rear" | "endpaper" | "photo" | "closing";
  img: string;
  video: string;
  caption: string;
  bleed: boolean;
  folio: number;
  closingNote?: {
    quote: string;
    author: string;
  };
}

export interface BookLeaf {
  board: boolean;
  front: LeafFace;
  back: LeafFace;
}

interface NodeRefs {
  root: HTMLDivElement | null;
  s: (HTMLDivElement | null)[];
  f: (HTMLDivElement | null)[];
  b: (HTMLDivElement | null)[];
}

interface DeckState {
  p: number[];
  v: number[];
  goal: number[];
  bend: number[];
  skew: number[];
  queue: { k: number; g: number; at: number }[];
  dragK: number;
  hoverK: number;
  hoverP: number;
  hoverV: number;
  tilt: number;
  tiltGoal: number;
  lastTouch: number;
  act: number[];
  right: number;
  left: number;
  key: string;
}

/**
 * Formula kurva pembengkokan lembar halaman pada 12 segmen silindris
 */
function computeBending(progress: number, bendFactor: number, angles: number[]) {
  const baseAngle = 180 * progress;
  const curlAngle = 78 * bendFactor * Math.sin(Math.PI * progress);
  for (let s = 0; s < SEGMENTS; s++) {
    const frac = (s + 1) / SEGMENTS;
    angles[s] = clamp(baseAngle + curlAngle * (Math.pow(frac, 1.7) - 0.36), 0, 180);
  }
  return angles;
}

function initDeckState(count: number, startSpread = 0): DeckState {
  const deck: DeckState = {
    p: [],
    v: [],
    goal: [],
    bend: [],
    skew: [],
    queue: [],
    dragK: -1,
    hoverK: -1,
    hoverP: 0,
    hoverV: 0,
    tilt: 0,
    tiltGoal: 0,
    lastTouch: 0,
    act: [],
    right: -1,
    left: -1,
    key: "",
  };
  resetDeckState(deck, count, startSpread);
  return deck;
}

function resetDeckState(deck: DeckState, count: number, spread?: number) {
  let s = spread;
  if (s === undefined) {
    s = 0;
    for (const g of deck.goal) s += g;
  }
  s = clamp(s, 0, count);
  deck.p = [];
  deck.v = [];
  deck.goal = [];
  deck.bend = [];
  deck.skew = [];
  for (let i = 0; i < count; i++) {
    const val = Number(i < s);
    deck.p.push(val);
    deck.goal.push(val);
    deck.v.push(0);
    deck.bend.push(0);
    deck.skew.push(0);
  }
  deck.queue = [];
  deck.dragK = -1;
  deck.hoverK = -1;
}

function evaluateDeck(deck: DeckState) {
  const len = deck.p.length;
  const act: number[] = [];
  let right = -1;
  let left = -1;
  let pos = 0;
  const isStationary = (idx: number) =>
    idx !== deck.dragK &&
    idx !== deck.hoverK &&
    (deck.p[idx] === 0 || deck.p[idx] === 1);

  for (let r = 0; r < len; r++) {
    pos += deck.goal[r];
    if (!isStationary(r)) act.push(r);
  }
  for (let r = 0; r < len; r++) {
    if (isStationary(r) && deck.p[r] === 0) {
      right = r;
      break;
    }
  }
  for (let r = len - 1; r >= 0; r--) {
    if (isStationary(r) && deck.p[r] === 1) {
      left = r;
      break;
    }
  }
  return {
    act,
    right,
    left,
    pos,
    key: `${act.join(",")}|${right}|${left}|${pos}|${len}`,
  };
}

/**
 * Komponen pemutar media: otomatis memutar video mp4 tanpa suara (muted, loop)
 * atau merender gambar responsif.
 */
const MediaView: React.FC<{
  side: LeafFace;
  play: boolean;
}> = ({ side, play }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = true;
    const p = vid.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {});
    }
    return () => {
      try {
        vid.pause();
      } catch {}
    };
  }, [side.video]);

  if (side.video && play) {
    return (
      <video
        ref={videoRef}
        src={side.video}
        poster={side.img || undefined}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
      />
    );
  }
  if (side.img) {
    return (
      <img
        src={side.img}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src.endsWith(".jpg")) {
            target.src = target.src.replace(/\.jpg$/, ".png");
          } else if (target.src.endsWith(".png")) {
            target.src = target.src.replace(/\.png$/, ".jpg");
          }
        }}
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
      />
    );
  }
  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full bg-gradient-to-br from-black/10 to-transparent" />
  );
};

/**
 * Halaman individual dengan tekstur kertas, endpaper, atau hardcover
 */
const PageFace: React.FC<{
  side: LeafFace;
  face: "front" | "back";
  look: {
    paper: string;
    cover: string;
    titleColor: string;
    radius: number;
    spine: number;
  };
  play: boolean;
}> = ({ side, face, look, play }) => {
  const isFront = face === "front";
  const rad = look.radius;
  const roundedStyle = isFront
    ? { borderRadius: `0 ${rad}px ${rad}px 0` }
    : { borderRadius: `${rad}px 0 0 ${rad}px` };

  // Hardcover depan atau belakang
  if (side.kind === "cover" || side.kind === "rear") {
    return (
      <div
        className="absolute inset-0 overflow-hidden box-border"
        style={{ ...roundedStyle, background: look.cover }}
      >
        {(side.img || side.video) && <MediaView side={side} play={play} />}
        {/* Gradasi bawah untuk kontras teks */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 46%, rgba(0,0,0,0.38) 100%)",
          }}
        />
        {/* Garis tekuk engsel hardcover */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(${
              isFront ? 90 : 270
            }deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 3%, rgba(0,0,0,0) 4.6%, rgba(0,0,0,0.22) 5.2%, rgba(255,255,255,0.14) 5.9%, rgba(255,255,255,0) 7.4%)`,
          }}
        />
        {side.caption && (
          <div
            className="absolute z-10 font-sans font-normal"
            style={{
              left: "13%",
              right: "9%",
              bottom: "9%",
              color: look.titleColor,
              fontSize: "calc(var(--ph) * 0.07)",
              lineHeight: 0.95,
              letterSpacing: "-0.045em",
            }}
          >
            {side.caption}
          </div>
        )}
      </div>
    );
  }

  // Catatan Penutup (Closing Note) di kertas lembaran baru sesudah lembar ke-12
  if (side.kind === "closing") {
    const spineAlpha = (val: number) => (val * look.spine).toFixed(3);
    const note = side.closingNote || {
      quote: "Terima kasih untuk selalu hadir dalam hidupku",
      author: "Hilmi",
    };

    return (
      <div
        className="absolute inset-0 overflow-hidden flex flex-col items-center justify-center p-8 sm:p-12 text-center select-none box-border"
        style={{ ...roundedStyle, background: look.paper }}
      >
        {/* Tekstur kertas hangat */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.7) 0%, rgba(0,0,0,0.03) 100%)",
          }}
        />

        {/* Gradasi spine buku di sisi engsel tengah */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(${
              isFront ? 90 : 270
            }deg, rgba(0,0,0,${spineAlpha(0.24)}) 0%, rgba(0,0,0,${spineAlpha(
              0.08
            )}) 3.5%, rgba(0,0,0,0) 10%)`,
          }}
        />

        {/* Kotak Kutipan Emosional */}
        <div className="relative z-10 max-w-[85%] flex flex-col items-center">
          <span className="font-serif text-3xl sm:text-5xl text-[#26332d]/30 leading-none select-none mb-1">
            &ldquo;
          </span>

          <blockquote className="font-serif italic text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed tracking-wide px-3 text-[#26332d]/90">
            {note.quote}
          </blockquote>

          <span className="font-serif text-3xl sm:text-5xl text-[#26332d]/30 leading-none select-none mt-1">
            &rdquo;
          </span>

          <div className="my-5 sm:my-6 h-[1px] w-14 bg-[#26332d]/20" />

          <cite className="font-sans not-italic text-xs sm:text-sm font-medium uppercase tracking-[0.22em] text-[#26332d]/70">
            {note.author}
          </cite>
        </div>
      </div>
    );
  }

  // Endpaper bercorak halus
  if (side.kind === "endpaper") {
    const spineAlpha = (val: number) => (val * look.spine).toFixed(3);
    return (
      <div
        className="absolute inset-0 overflow-hidden box-border"
        style={{ ...roundedStyle, background: look.cover }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 1px, rgba(255,255,255,0) 1px, rgba(255,255,255,0) 7px), linear-gradient(rgba(255,255,255,0.08), rgba(255,255,255,0.08))",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(${
              isFront ? 90 : 270
            }deg, rgba(0,0,0,${spineAlpha(0.34)}) 0%, rgba(0,0,0,${spineAlpha(
              0.12
            )}) 3.5%, rgba(0,0,0,0) 10%, rgba(255,255,255,${spineAlpha(
              0.12
            )}) 12%, rgba(255,255,255,0) 17%)`,
          }}
        />
      </div>
    );
  }

  // Halaman foto dalam (bleed atau framed)
  const spineAlpha = (val: number) => (val * look.spine).toFixed(3);
  const captionColor = side.bleed
    ? "rgba(255,255,255,0.92)"
    : "rgba(20,20,20,0.58)";

  return (
    <div
      className="absolute inset-0 overflow-hidden box-border"
      style={{ ...roundedStyle, background: look.paper }}
    >
      {side.bleed ? (
        <>
          <MediaView side={side} play={play} />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,0.42) 100%)",
            }}
          />
        </>
      ) : (
        <div
          className="absolute overflow-hidden"
          style={{
            top: "8%",
            left: "9%",
            right: "9%",
            bottom: "18%",
            borderRadius: rad * 0.25,
            background: "rgba(0,0,0,0.05)",
          }}
        >
          <MediaView side={side} play={play} />
        </div>
      )}

      {side.caption && (
        <div
          className="absolute z-10 truncate font-mono uppercase"
          style={{
            bottom: "8%",
            fontSize: "calc(var(--ph) * 0.021)",
            letterSpacing: "0.08em",
            color: captionColor,
            maxWidth: "62%",
            ...(isFront ? { left: "9%" } : { right: "9%", textAlign: "right" }),
          }}
        >
          {side.caption}
        </div>
      )}

      <div
        className="absolute z-10 font-mono text-[11px] uppercase tracking-wider"
        style={{
          bottom: "8%",
          fontSize: "calc(var(--ph) * 0.021)",
          color: captionColor,
          ...(isFront ? { right: "9%" } : { left: "9%" }),
        }}
      >
        {padTwo(side.folio)}
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `linear-gradient(${
            isFront ? 90 : 270
          }deg, rgba(0,0,0,${spineAlpha(0.34)}) 0%, rgba(0,0,0,${spineAlpha(
            0.12
          )}) 3.5%, rgba(0,0,0,0) 10%, rgba(255,255,255,${spineAlpha(
            0.12
          )}) 12%, rgba(255,255,255,0) 17%)`,
        }}
      />
    </div>
  );
};

export interface MemoryAlbumProps {
  config?: AlbumData | AlbumConfig;
  isAutoFlipping?: boolean;
  onAutoFlipEnd?: () => void;
}

export const MemoryAlbum: React.FC<MemoryAlbumProps> = ({
  config: propConfig,
  isAutoFlipping: propIsAutoFlipping,
  onAutoFlipEnd,
}) => {
  const albumCtx = useContext(AlbumContext);
  const config = (propConfig || albumCtx?.album || ALBUM_CONFIG) as unknown as AlbumConfig;
  const isAutoFlipping =
    propIsAutoFlipping !== undefined
      ? propIsAutoFlipping
      : albumCtx
      ? albumCtx.isAutoFlipping
      : false;

  const [windowMobile, setWindowMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = albumCtx ? albumCtx.isMobile : windowMobile;

  const rootRef = useRef<HTMLDivElement>(null);
  const nodesMap = useRef<Map<number, NodeRefs>>(new Map()).current;
  const castRRef = useRef<HTMLDivElement>(null);
  const castLRef = useRef<HTMLDivElement>(null);

  // Buat daftar lembaran buku lengkap (cover, isi, cover belakang)
  const leaves: BookLeaf[] = useMemo(() => {
    const list: BookLeaf[] = [
      {
        board: true,
        front: {
          kind: "cover",
          img: config.covers.frontImageURL,
          video: config.covers.frontVideoURL,
          caption: config.covers.title,
          bleed: true,
          folio: 0,
        },
        back: {
          kind: "endpaper",
          img: "",
          video: "",
          caption: "",
          bleed: false,
          folio: 0,
        },
      },
    ];

    config.sheets.forEach((sheet, idx) => {
      list.push({
        board: false,
        front: {
          kind: "photo",
          img: sheet.frontImageURL,
          video: sheet.frontVideoURL,
          caption: sheet.frontCaption,
          bleed: sheet.frontFill === "bleed",
          folio: idx * 2 + 1,
        },
        back: {
          kind: "photo",
          img: sheet.backImageURL,
          video: sheet.backVideoURL,
          caption: sheet.backCaption,
          bleed: sheet.backFill === "bleed",
          folio: idx * 2 + 2,
        },
      });
    });

    // Sampul Belakang Buku: Menampilkan Catatan Penutup (kertas) di sisi dalam (front) dan Cover Belakang di sisi luar (back)
    list.push({
      board: true,
      front: {
        kind: config.closingNote?.enabled ? "closing" : "endpaper",
        img: "",
        video: "",
        caption: "",
        bleed: false,
        folio: config.sheets.length * 2 + 1,
        closingNote: config.closingNote,
      },
      back: {
        kind: "rear",
        img: config.covers.backImageURL,
        video: config.covers.backVideoURL,
        caption: "",
        bleed: true,
        folio: 0,
      },
    });

    return list;
  }, [config]);

  const leafCount = leaves.length;
  const deckRef = useRef<DeckState | null>(null);
  if (!deckRef.current) {
    deckRef.current = initDeckState(
      leafCount,
      config.book.start === "spread" ? Math.min(2, leafCount - 1) : 0
    );
  }

  const [layoutInfo, setLayoutInfo] = useState(() => evaluateDeck(deckRef.current!));

  const look = useMemo(
    () => ({
      paper: config.book.paper,
      cover: config.covers.color,
      titleColor: config.covers.titleColor,
      radius: clamp(numDef(config.book.radius, 4), 0, 60),
      spine: clamp(numDef(config.book.spine, 0.55), 0, 1),
    }),
    [config]
  );

  const getNodeRef = (idx: number): NodeRefs => {
    let n = nodesMap.get(idx);
    if (!n) {
      n = { root: null, s: [], f: [], b: [] };
      nodesMap.set(idx, n);
    }
    return n;
  };

  // Engine Physics & Solver Loop
  const engine = useMemo(() => {
    let animFrame = 0;
    let lastTime = 0;
    let dragData: {
      id: number;
      side: number;
      x0: number;
      y0: number;
      u0: number;
      v0: number;
      live: boolean;
      leaf: number;
      uEdge: number;
      vp: number;
      t: number;
    } | null = null;
    const anglesBuf = Array(SEGMENTS).fill(0);

    const getDeck = () => deckRef.current!;
    const getTurned = () => {
      let sum = 0;
      for (const g of getDeck().goal) sum += g;
      return sum;
    };

    const setCursor = (cur: string) => {
      const root = rootRef.current;
      if (root && root.style.cursor !== cur) root.style.cursor = cur;
    };

    const getMotion = () => ({
      speed: clamp(numDef(config.motion.speed, 1), 0.2, 4),
      feel: clamp(numDef(config.motion.feel, 0.45), 0, 1),
      curl: clamp(numDef(config.motion.curl, 1), 0, 2),
    });

    const renderVisuals = () => {
      const root = rootRef.current;
      const deck = getDeck();
      if (!root || !deck) return;
      const len = deck.p.length;
      if (!len) return;

      const pFirst = deck.p[0];
      const pLast = deck.p[len - 1];

      root.style.setProperty("--off", (-0.5 * (1 - pFirst) + 0.5 * pLast).toFixed(4));
      root.style.setProperty("--lx", Math.max(0, -Math.cos(Math.PI * pFirst)).toFixed(4));
      root.style.setProperty("--rx", Math.max(0, Math.cos(Math.PI * pLast)).toFixed(4));
      root.style.setProperty("--tilt", `${deck.tilt.toFixed(3)}deg`);

      const shadow = clamp(numDef(config.book.shadow, 0.6), 0, 1);
      const { curl } = getMotion();
      const pFrontLight = (a: number) =>
        0.5 * shadow * (a <= 90 ? Math.pow(a / 90, 1.35) : 1);
      const mBackLight = (a: number) => pFrontLight(180 - a);

      for (const leafIdx of deck.act) {
        const node = nodesMap.get(leafIdx);
        if (!node || !node.root || !leaves[leafIdx]) continue;
        const p = deck.p[leafIdx];
        const isBoard = leaves[leafIdx].board;
        computeBending(p, deck.bend[leafIdx] * (isBoard ? 0.22 : 1), anglesBuf);

        const zPos = (p < 0.5 ? len - leafIdx : leafIdx + 1) * 0.35 + 0.6;
        const skewAngle =
          deck.skew[leafIdx] * 5 * curl * Math.sin(Math.PI * p) * (isBoard ? 0.3 : 1);
        node.root.style.transform = `translateZ(${zPos.toFixed(2)}px) skewY(${skewAngle.toFixed(3)}deg)`;

        let accumAngle = 0;
        for (let s = 0; s < SEGMENTS; s++) {
          const sliceEl = node.s[s];
          const delta = anglesBuf[s] - accumAngle;
          accumAngle = anglesBuf[s];
          if (sliceEl) {
            sliceEl.style.transform = `rotateY(${(-delta).toFixed(3)}deg)`;
          }

          const angPrev = s ? (anglesBuf[s - 1] + anglesBuf[s]) / 2 : anglesBuf[0];
          const angNext =
            s < SEGMENTS - 1 ? (anglesBuf[s] + anglesBuf[s + 1]) / 2 : anglesBuf[s];
          const diff = Math.abs(
            (s < SEGMENTS - 1 ? anglesBuf[s + 1] : anglesBuf[s]) -
              (s ? anglesBuf[s - 1] : anglesBuf[s])
          );

          const specular = `linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,${(
            Math.min(0.32, diff * 0.02) * shadow
          ).toFixed(3)}), rgba(255,255,255,0))`;

          const fEl = node.f[s];
          if (fEl) {
            fEl.style.background = `linear-gradient(90deg, rgba(0,0,0,${pFrontLight(
              angPrev
            ).toFixed(3)}), rgba(0,0,0,${pFrontLight(angNext).toFixed(
              3
            )})), ${specular}`;
          }

          const bEl = node.b[s];
          if (bEl) {
            bEl.style.background = `linear-gradient(90deg, rgba(0,0,0,${mBackLight(
              angNext
            ).toFixed(3)}), rgba(0,0,0,${mBackLight(angPrev).toFixed(
              3
            )})), ${specular}, linear-gradient(rgba(96,80,56,0.08), rgba(96,80,56,0.08))`;
          }
        }
      }

      // Hitung bayangan jatuh (cast shadow) pada halaman terbuka sebelah kiri & kanan
      const getCastInfo = (e: number) => {
        if (e < 0 || e >= len || deck.act.indexOf(e) < 0 || !leaves[e]) return null;
        computeBending(deck.p[e], deck.bend[e] * (leaves[e].board ? 0.22 : 1), anglesBuf);
        return {
          edgeCos: Math.cos((anglesBuf[SEGMENTS - 1] * Math.PI) / 180),
          alpha: (shadow * 0.5 * Math.pow(Math.sin(Math.PI * deck.p[e]), 0.6)).toFixed(3),
        };
      };

      if (castRRef.current) {
        let grad = "none";
        const info = deck.right >= 0 ? getCastInfo(deck.right - 1) : null;
        if (info && info.edgeCos > 0) {
          const pct = info.edgeCos * 100;
          grad = `linear-gradient(90deg, rgba(0,0,0,0) ${Math.max(
            0,
            pct - 1
          ).toFixed(2)}%, rgba(0,0,0,${info.alpha}) ${pct.toFixed(
            2
          )}%, rgba(0,0,0,0) ${Math.min(100, pct + 24).toFixed(2)}%)`;
        }
        castRRef.current.style.background = grad;
      }

      if (castLRef.current) {
        let grad = "none";
        const info = deck.left >= 0 ? getCastInfo(deck.left + 1) : null;
        if (info && info.edgeCos < 0) {
          const pct = (1 + info.edgeCos) * 100;
          grad = `linear-gradient(90deg, rgba(0,0,0,0) ${Math.max(
            0,
            pct - 24
          ).toFixed(2)}%, rgba(0,0,0,${info.alpha}) ${pct.toFixed(
            2
          )}%, rgba(0,0,0,0) ${Math.min(100, pct + 1).toFixed(2)}%)`;
        }
        castLRef.current.style.background = grad;
      }
    };

    const updateEvaluation = () => {
      const deck = getDeck();
      if (!deck) return;
      const res = evaluateDeck(deck);
      deck.act = res.act;
      deck.right = res.right;
      deck.left = res.left;
      if (res.key !== deck.key) {
        deck.key = res.key;
        setLayoutInfo(res);
      }
      renderVisuals();
    };

    const stopDragging = () => {
      const deck = getDeck();
      if (dragData && dragData.live && deck && dragData.leaf >= 0 && dragData.leaf < deck.p.length) {
        deck.goal[dragData.leaf] = Number(deck.p[dragData.leaf] > 0.5);
        deck.dragK = -1;
      }
      dragData = null;
      setCursor("");
    };

    const physicsStep = (timeNow: number) => {
      animFrame = 0;
      const deck = getDeck();
      const len = deck.p.length;
      const dt = Math.min(1 / 30, Math.max(1 / 240, (timeNow - lastTime) / 1000));
      lastTime = timeNow;

      const { speed, feel, curl } = getMotion();
      const omega = 95 * speed * speed * (1.2 - 0.55 * feel);
      const zeta = 2 * (0.9 - 0.32 * feel) * Math.sqrt(omega);

      // Antrian riffle halaman beruntun
      while (deck.queue.length && deck.queue[0].at <= timeNow) {
        const item = deck.queue.shift()!;
        deck.goal[item.k] = item.g;
        deck.v[item.k] += item.g ? 0.8 : -0.8;
      }

      let stillActive = deck.queue.length > 0;

      for (let i = 0; i < len; i++) {
        if (i === deck.dragK) continue;
        const targetP = i === deck.hoverK ? deck.hoverP : deck.goal[i];
        const accel = omega * (targetP - deck.p[i]) - zeta * deck.v[i];
        const nextV = deck.v[i] + accel * dt;
        let nextP = deck.p[i] + nextV * dt;

        if (nextP < 0) {
          nextP = 0;
          if (nextV < 0) deck.v[i] = -nextV * 0.18;
        } else if (nextP > 1) {
          nextP = 1;
          if (nextV > 0) deck.v[i] = -nextV * 0.18;
        } else {
          deck.v[i] = nextV;
        }
        deck.p[i] = nextP;
      }

      // Tabrakan tumpukan halaman agar tidak saling menembus
      for (let i = 0; i < len - 1; i++) {
        const bound =
          deck.p[i] >= 0.9995 ? 1 : Math.max(0, deck.p[i] - PAGE_STACK_COLLISION);
        if (deck.p[i + 1] > bound) {
          deck.p[i + 1] = bound;
          if (deck.v[i + 1] > deck.v[i]) deck.v[i + 1] = deck.v[i];
        }
      }

      for (let i = 0; i < len; i++) {
        const isDrag = i === deck.dragK;
        const isHover = i === deck.hoverK;
        const target = isHover ? deck.hoverP : deck.goal[i];
        let targetBend = 0;
        let targetSkew = 0;

        if (isDrag && dragData) {
          targetBend =
            curl * (dragData.side * 0.8 + clamp(dragData.vp * 0.25, -0.7, 0.7));
          targetSkew = dragData.v0;
        } else if (isHover) {
          targetBend = curl * 1.6 * (deck.hoverP < 0.5 ? 1 : -1);
          targetSkew = deck.hoverV;
        } else if (Math.abs(target - deck.p[i]) > 0.002) {
          targetBend = curl * (target > deck.p[i] ? 1 : -1);
        }

        deck.bend[i] += (targetBend - deck.bend[i]) * Math.min(1, dt * 9);
        deck.skew[i] += (targetSkew - deck.skew[i]) * Math.min(1, dt * 7);

        if (isDrag) {
          stillActive = true;
        } else if (
          Math.abs(target - deck.p[i]) < 0.0008 &&
          Math.abs(deck.v[i]) < 0.004
        ) {
          deck.p[i] = target;
          deck.v[i] = 0;
        } else {
          stillActive = true;
        }

        if (
          Math.abs(targetBend - deck.bend[i]) > 0.01 ||
          Math.abs(targetSkew - deck.skew[i]) > 0.01
        ) {
          stillActive = true;
        } else {
          deck.bend[i] = targetBend;
          deck.skew[i] = targetSkew;
        }
      }

      // Parallax 3D tilt
      const targetTilt = config.motion.tilt ? deck.tiltGoal : 0;
      deck.tilt += (targetTilt - deck.tilt) * Math.min(1, dt * 6);
      if (Math.abs(targetTilt - deck.tilt) > 0.02) {
        stillActive = true;
      } else {
        deck.tilt = targetTilt;
      }

      updateEvaluation();

      if (stillActive) {
        animFrame = requestAnimationFrame(physicsStep);
      }
    };

    const wakePhysics = () => {
      if (!animFrame) {
        lastTime = performance.now();
        animFrame = requestAnimationFrame(physicsStep);
      }
    };

    const parkPhysics = () => {
      if (animFrame) cancelAnimationFrame(animFrame);
      animFrame = 0;
      stopDragging();
      const deck = getDeck();
      if (deck) {
        deck.hoverK = -1;
        deck.tiltGoal = 0;
      }
    };

    const turnPage = (dir: number) => {
      const deck = getDeck();
      const len = deck.p.length;
      deck.queue.length = 0;
      deck.hoverK = -1;
      deck.lastTouch = performance.now();
      const currentPos = getTurned();
      let targetLeaf = -1;

      if (dir > 0 && currentPos < len) {
        targetLeaf = currentPos;
        deck.goal[targetLeaf] = 1;
        deck.v[targetLeaf] += 0.5;
      } else if (dir < 0 && currentPos > 0) {
        targetLeaf = currentPos - 1;
        deck.goal[targetLeaf] = 0;
        deck.v[targetLeaf] -= 0.5;
      }

      if (targetLeaf >= 0) {
        wakePhysics();
      }
    };

    const riffleToSpread = (targetSpread: number) => {
      const deck = getDeck();
      const len = deck.p.length;
      const target = clamp(Math.round(targetSpread), 0, len);
      deck.queue.length = 0;
      deck.hoverK = -1;
      deck.lastTouch = performance.now();

      const currentPos = getTurned();
      const stepDelay = 72 / getMotion().speed;
      const startT = performance.now();

      if (target > currentPos) {
        for (let i = currentPos; i < target; i++) {
          deck.queue.push({ k: i, g: 1, at: startT + (i - currentPos) * stepDelay });
        }
      } else {
        for (let i = currentPos - 1, step = 0; i >= target; i--, step++) {
          deck.queue.push({ k: i, g: 0, at: startT + step * stepDelay });
        }
      }
      wakePhysics();
    };

    const hitTest = (clientX: number, clientY: number) => {
      const root = rootRef.current;
      if (!root) return { u: 0, v: 0, side: 0, ty: 0 };
      const rect = root.getBoundingClientRect();
      const sz = clamp(numDef(config.book.size, 0.68), 0.2, 1);
      const asp = clamp(numDef(config.book.aspect, 0.76), 0.3, 2);
      const ph = Math.min(sz * rect.height, (sz * rect.width) / (2 * asp));
      const pw = ph * asp;
      const deck = getDeck();
      const len = deck.p.length;
      const off = -0.5 * (1 - deck.p[0]) + 0.5 * deck.p[len - 1];

      const midX = rect.left + rect.width / 2;
      const midY = rect.top + rect.height / 2;
      const u = (clientX - midX - off * pw) / pw;
      const v = (clientY - midY) / (ph / 2);
      let side = 0;
      if (Math.abs(v) <= 1) {
        if (u >= 0 && u <= 1 && deck.p[len - 1] < 0.5) side = 1;
        else if (u < 0 && u >= -1 && deck.p[0] > 0.5) side = -1;
      }
      return {
        u,
        v,
        side,
        ty: (clientY - midY) / Math.max(1, rect.height / 2),
      };
    };

    return {
      wake: wakePhysics,
      park: parkPhysics,
      paint: renderVisuals,
      refresh: updateEvaluation,
      turn: turnPage,
      riffleTo: riffleToSpread,
      turnedCount: getTurned,
      total: () => getDeck().p.length,
      idleFor: () => performance.now() - getDeck().lastTouch,
      dragging: () => Boolean(dragData && dragData.live),

      onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== undefined && e.button !== 0) return;
        const root = rootRef.current;
        if (!root) return;
        const hit = hitTest(e.clientX, e.clientY);
        getDeck().lastTouch = performance.now();
        if (hit.side) {
          dragData = {
            id: e.pointerId,
            side: hit.side,
            x0: e.clientX,
            y0: e.clientY,
            u0: hit.u,
            v0: clamp(hit.v, -1, 1),
            live: false,
            leaf: -1,
            uEdge: 0,
            vp: 0,
            t: performance.now(),
          };
          try {
            root.setPointerCapture(e.pointerId);
          } catch {}
        }
      },

      onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => {
        const root = rootRef.current;
        if (!root) return;
        const deck = getDeck();
        const len = deck.p.length;
        const hit = hitTest(e.clientX, e.clientY);
        deck.lastTouch = performance.now();

        // 3D Parallax tilt kursor mouse
        if (config.motion.tilt && e.pointerType === "mouse") {
          const tiltTarget =
            clamp(-hit.ty, -1, 1) * clamp(numDef(config.motion.tiltAmount, 6), 0, 30);
          if (Math.abs(tiltTarget - deck.tiltGoal) > 0.05) {
            deck.tiltGoal = tiltTarget;
            wakePhysics();
          }
        }

        // Penanganan Drag fisik interaktif
        if (dragData && dragData.id === e.pointerId) {
          if (!dragData.live) {
            if (Math.hypot(e.clientX - dragData.x0, e.clientY - dragData.y0) < 6)
              return;
            const currentPos = getTurned();
            const target = dragData.side > 0 ? currentPos : currentPos - 1;
            if (target < 0 || target >= len) {
              dragData = null;
              return;
            }
            deck.queue.length = 0;
            deck.hoverK = -1;
            dragData.live = true;
            dragData.leaf = target;
            dragData.uEdge = Math.cos(Math.PI * deck.p[target]);
            dragData.u0 = hit.u;
            dragData.t = performance.now();
            deck.dragK = target;
            setCursor("grabbing");
          }

          const target = dragData.leaf;
          const uClamped = clamp(dragData.uEdge + (hit.u - dragData.u0), -1, 1);
          const pAngle = Math.acos(uClamped) / Math.PI;
          const now = performance.now();
          const dt = Math.max(1, now - dragData.t) / 1000;
          dragData.vp =
            dragData.vp * 0.55 + ((pAngle - deck.p[target]) / dt) * 0.45;
          dragData.t = now;
          deck.p[target] = pAngle;
          deck.v[target] = dragData.vp;
          wakePhysics();
          return;
        }

        if (e.pointerType !== "mouse" || dragData) return;

        // Efek lekukan sudut (hover corner peel anticipation)
        const currentPos = getTurned();
        let hoverIdx = -1;
        let hoverGoal = 0;
        const isCornerVert = Math.abs(hit.v) > 0.5;

        if (hit.side > 0 && hit.u > 0.78 && isCornerVert && currentPos < len) {
          if (
            deck.hoverK === currentPos ||
            (deck.p[currentPos] === 0 && deck.goal[currentPos] === 0)
          ) {
            hoverIdx = currentPos;
            hoverGoal = 0.05;
          }
        } else if (
          hit.side < 0 &&
          hit.u < -0.78 &&
          isCornerVert &&
          currentPos > 0
        ) {
          if (
            deck.hoverK === currentPos - 1 ||
            (deck.p[currentPos - 1] === 1 && deck.goal[currentPos - 1] === 1)
          ) {
            hoverIdx = currentPos - 1;
            hoverGoal = 0.95;
          }
        }

        if (
          hoverIdx !== deck.hoverK ||
          (hoverIdx >= 0 && Math.abs(deck.hoverV - hit.v) > 0.05)
        ) {
          deck.hoverK = hoverIdx;
          deck.hoverP = hoverGoal;
          deck.hoverV = hoverIdx >= 0 ? clamp(hit.v, -1, 1) : 0;
          wakePhysics();
        }
        setCursor(hoverIdx >= 0 ? "grab" : hit.side ? "pointer" : "");
      },

      onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => {
        const root = rootRef.current;
        if (!dragData || dragData.id !== e.pointerId) return;
        try {
          if (root) root.releasePointerCapture(e.pointerId);
        } catch {}

        const deck = getDeck();
        const activeDrag = dragData;
        dragData = null;

        if (activeDrag.live) {
          const target = activeDrag.leaf;
          const p = deck.p[target];
          const vel = activeDrag.vp;
          if (activeDrag.side > 0) {
            deck.goal[target] = Number(vel > 1.1 || (p > 0.5 && vel > -1.1));
          } else {
            deck.goal[target] = vel < -1.1 || (p < 0.5 && vel < 1.1) ? 0 : 1;
          }
          deck.v[target] = clamp(vel, -6, 6);
          deck.dragK = -1;
          setCursor("");
          wakePhysics();
          return;
        }

        // Tap atau click sederhana
        const dist = Math.hypot(e.clientX - activeDrag.x0, e.clientY - activeDrag.y0);
        if (dist < 6) {
          turnPage(activeDrag.side);
        }
      },

      onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragData || dragData.id !== e.pointerId) return;
        const deck = getDeck();
        if (dragData.live) {
          deck.goal[dragData.leaf] = Number(deck.p[dragData.leaf] > 0.5);
          deck.dragK = -1;
        }
        dragData = null;
        setCursor("");
        wakePhysics();
      },

      onPointerLeave: () => {
        const deck = getDeck();
        if (!dragData || !dragData.live) {
          deck.hoverK = -1;
          deck.tiltGoal = 0;
          setCursor("");
          wakePhysics();
        }
      },

      onDoubleClick: (e: React.MouseEvent<HTMLDivElement>) => {
        if (!hitTest(e.clientX, e.clientY).side) {
          riffleToSpread(0);
        }
      },

      onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
        const total = getDeck().p.length;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") turnPage(1);
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") turnPage(-1);
        else if (e.key === "Home") riffleToSpread(0);
        else if (e.key === "End") riffleToSpread(total);
        else return;
        e.preventDefault();
      },
    };
  }, [config, leaves, look]);

  useEffect(() => {
    engine.paint();
    engine.refresh();
  }, [engine, leafCount]);

  const onAutoFlipEndRef = useRef(onAutoFlipEnd);
  onAutoFlipEndRef.current = onAutoFlipEnd;

  // Efek otomatis membuka lembaran per lembar secara berkala (8.000ms = 8 detik per lembar)
  const isAutoplay = Boolean(config.motion?.autoplay);
  useEffect(() => {
    if (!isAutoFlipping && !isAutoplay) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let initialTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const totalPages = engine.total();

    const step = () => {
      if (engine.dragging()) return;

      const current = engine.turnedCount();
      if (current >= totalPages) {
        if (intervalId) clearInterval(intervalId);
        onAutoFlipEndRef.current?.();
      } else {
        engine.turn(1);
      }
    };

    // Jika tombol otomatis ditekan saat buku sudah berada di akhir, buka kembali ke awal lalu mulai
    if (engine.turnedCount() >= totalPages) {
      engine.riffleTo(0);
      initialTimeoutId = setTimeout(() => {
        step();
        intervalId = setInterval(step, 8000);
      }, 1000);
    } else {
      // Reaksi langsung (400ms) saat ditekan agar lembar pertama langsung terbuka
      initialTimeoutId = setTimeout(() => {
        step();
        intervalId = setInterval(step, 8000);
      }, 400);
    }

    return () => {
      if (initialTimeoutId) clearTimeout(initialTimeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoFlipping, isAutoplay, engine]);

  // Ketebalan tumpukan lembaran (thickness block)
  const thickness = clamp(numDef(config.book.thickness, 8), 0, 40);
  const rightStationary =
    layoutInfo.right >= 0 && layoutInfo.right < leafCount ? layoutInfo.right : -1;
  const leftStationary =
    layoutInfo.left >= 0 && layoutInfo.left < leafCount ? layoutInfo.left : -1;

  const rightPagesRem = rightStationary >= 0 ? leafCount - rightStationary : 0;
  const leftPagesRem = leftStationary >= 0 ? leftStationary + 1 : 0;

  const renderStackEdge = (side: "left" | "right", count: number) => {
    if (count <= 0 || thickness <= 0) return null;
    const w = Math.max(1, (thickness * count) / leafCount);
    return (
      <div
        className="pointer-events-none absolute"
        style={{
          top: "calc(var(--ph) / -2)",
          height: "var(--ph)",
          width: `${w.toFixed(2)}px`,
          left: side === "right" ? "var(--pw)" : `calc(var(--pw) * -1 - ${w.toFixed(2)}px)`,
          background: `repeating-linear-gradient(90deg, ${look.paper} 0px, ${look.paper} 1px, rgba(0,0,0,0.18) 1px, rgba(0,0,0,0.18) 1.6px)`,
          borderRadius: side === "right" ? "0 3px 3px 0" : "3px 0 0 3px",
          boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.14)",
          boxSizing: "border-box",
        }}
      />
    );
  };

  const getBoardBox = (_isBoard?: boolean) => ({
    w: "var(--pw)",
    h: "var(--ph)",
    top: "calc(var(--ph) / -2)",
  });

  const getStationaryStyle = (_isBoard: boolean, side: "left" | "right") => {
    const box = getBoardBox();
    const shadowIntensity = (
      0.36 * clamp(numDef(config.book.shadow, 0.6), 0, 1)
    ).toFixed(3);
    const dropShadow = `0 calc(var(--ph) * 0.035) calc(var(--ph) * 0.09) rgba(0,0,0,${shadowIntensity})`;

    return {
      position: "absolute" as const,
      top: box.top,
      height: box.h,
      width: box.w,
      left: side === "right" ? 0 : `calc(${box.w} * -1)`,
      transform: "translateZ(0.2px)",
      boxShadow: dropShadow,
      boxSizing: "border-box" as const,
      borderRadius:
        side === "right"
          ? `0 ${look.radius}px ${look.radius}px 0`
          : `${look.radius}px 0 0 ${look.radius}px`,
    };
  };

  // Render 12 nested segments untuk lembaran bergerak
  const renderActiveLeaf = (leafIdx: number) => {
    const leaf = leaves[leafIdx];
    if (!leaf) return null;
    const n = getNodeRef(leafIdx);
    const box = getBoardBox();

    const sliceFaceStyle = {
      position: "absolute" as const,
      inset: 0,
      overflow: "hidden" as const,
      boxSizing: "border-box" as const,
      backfaceVisibility: "hidden" as const,
      WebkitBackfaceVisibility: "hidden" as const,
    };

    let innerContent: React.ReactNode = null;
    for (let s = SEGMENTS - 1; s >= 0; s--) {
      innerContent = (
        <div
          key={s}
          ref={(el) => {
            n.s[s] = el;
          }}
          style={{
            position: "absolute",
            top: 0,
            height: "100%",
            left: s === 0 ? 0 : `calc(var(--lw) / ${SEGMENTS})`,
            width: `calc(var(--lw) / ${SEGMENTS} + 0.7px)`,
            transformOrigin: "0 50%",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Muka Depan Segmen */}
          <div style={sliceFaceStyle}>
            <div
              style={{
                position: "absolute",
                top: 0,
                height: "100%",
                width: "var(--lw)",
                left: `calc(var(--lw) * ${(-s / SEGMENTS).toFixed(5)})`,
              }}
            >
              <PageFace side={leaf.front} face="front" look={look} play={false} />
            </div>
            <div
              ref={(el) => {
                n.f[s] = el;
              }}
              className="pointer-events-none absolute inset-0"
            />
          </div>

          {/* Muka Belakang Segmen (Rotate 180deg) */}
          <div
            style={{
              ...sliceFaceStyle,
              transform: "rotateY(180deg)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                height: "100%",
                width: "var(--lw)",
                left: `calc(var(--lw) * ${(-(SEGMENTS - 1 - s) / SEGMENTS).toFixed(5)})`,
              }}
            >
              <PageFace side={leaf.back} face="back" look={look} play={false} />
            </div>
            <div
              ref={(el) => {
                n.b[s] = el;
              }}
              className="pointer-events-none absolute inset-0"
            />
          </div>

          {innerContent}
        </div>
      );
    }

    return (
      <div
        key={`leaf-${leafIdx}`}
        ref={(el) => {
          n.root = el;
        }}
        style={
          {
            position: "absolute",
            left: 0,
            top: box.top,
            width: box.w,
            height: box.h,
            boxSizing: "border-box",
            transformStyle: "preserve-3d",
            transformOrigin: "0 50%",
            pointerEvents: "none",
            "--lw": box.w,
          } as React.CSSProperties
        }
      >
        {innerContent}
      </div>
    );
  };

  const sz = clamp(numDef(config.book.size, 0.68), 0.2, 1);
  const asp = clamp(numDef(config.book.aspect, 0.76), 0.3, 2);

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="region"
      aria-label="3D Memory Album"
      onPointerDown={engine.onPointerDown}
      onPointerMove={engine.onPointerMove}
      onPointerUp={engine.onPointerUp}
      onPointerCancel={engine.onPointerCancel}
      onPointerLeave={engine.onPointerLeave}
      onDoubleClick={engine.onDoubleClick}
      onKeyDown={engine.onKeyDown}
      className="relative flex h-screen w-screen select-none items-center justify-center overflow-hidden outline-none"
      style={
        {
          background: config.background.color,
          touchAction: "pan-y pinch-zoom",
          WebkitTapHighlightColor: "transparent",
          fontFamily: "Inter, system-ui, sans-serif",
          "--ph": isMobile
            ? "min(56vh, 66vw)"
            : `min(${(sz * 100).toFixed(3)}vh, ${(
                (sz * 100) /
                (2 * asp)
              ).toFixed(3)}vw)`,
          "--pw": `calc(var(--ph) * ${asp})`,
          "--rim": "0px",
        } as React.CSSProperties
      }
    >
      {/* 3D World Perspective Container */}
      <div
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
        style={{ perspective: "calc(var(--ph) * 3.2)" }}
      >
        <div
          className="relative"
          style={{
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
            transform:
              "translate3d(calc(var(--off) * var(--pw)), 0, 0) rotateX(var(--tilt))",
          }}
        >
          {/* Tumpukan Kertas Samping */}
          {renderStackEdge("left", leftPagesRem)}
          {renderStackEdge("right", rightPagesRem)}

          {/* Halaman Stasioner Kiri */}
          {leftStationary >= 0 && (
            <div
              style={getStationaryStyle(leaves[leftStationary].board, "left")}
            >
              <PageFace
                side={leaves[leftStationary].back}
                face="back"
                look={look}
                play={true}
              />
              <div
                ref={castLRef}
                className="pointer-events-none absolute inset-0"
              />
            </div>
          )}

          {/* Halaman Stasioner Kanan */}
          {rightStationary >= 0 && (
            <div
              style={getStationaryStyle(leaves[rightStationary].board, "right")}
            >
              <PageFace
                side={leaves[rightStationary].front}
                face="front"
                look={look}
                play={true}
              />
              <div
                ref={castRRef}
                className="pointer-events-none absolute inset-0"
              />
            </div>
          )}

          {/* Lembaran Bergerak (Bending 12-Segment Silindris) */}
          {layoutInfo.act.map(renderActiveLeaf)}
        </div>
      </div>
    </div>
  );
};

export default MemoryAlbum;
