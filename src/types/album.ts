/**
 * Model Data Terpusat Platform Kustomisasi 3D Memory Album
 * Digunakan secara reaktif di seluruh Studio Editor, Kanvas 3D, dan Viewer Penerima Hadiah.
 */

export interface CoverConfig {
  frontImageURL: string;
  frontVideoURL?: string;
  backImageURL: string;
  backVideoURL?: string;
  title: string;
  color: string;
  titleColor: string;
}

export interface BookSettings {
  start: "cover" | "spread";
  size: number;
  aspect: number;
  radius: number;
  paper: string;
  shadow: number;
  spine: number;
  thickness: number;
  indicator: "dots" | "counter" | "none";
  indicatorColor: string;
}

export interface MotionSettings {
  speed: number;
  feel: number;
  curl: number;
  tilt: boolean;
  tiltAmount: number;
  autoplay: boolean;
  interval: number; // Durasi per lembar (detik)
}

export interface BackgroundSettings {
  color: string;
  imageURL?: string;
  videoURL?: string;
  opacity: number;
  tint: string;
  tintStrength: number;
}

export interface SheetConfig {
  id: string;
  frontImageURL: string;
  frontVideoURL?: string;
  frontCaption?: string;
  frontFill: "bleed" | "framed";
  backImageURL: string;
  backVideoURL?: string;
  backCaption?: string;
  backFill: "bleed" | "framed";
}

export interface StorySlot {
  text: string;
}

export interface StorySection {
  id: string;
  text: string;
  slots?: StorySlot[];
  readDuration?: number; // Jeda membaca per kalimat dalam milidetik
}

export interface StoryIntroConfig {
  enabled: boolean;
  initialDelay: number; // Jeda hening awal dalam milidetik (misal 3800ms)
  sections: StorySection[];
}

export interface AudioConfig {
  enabled: boolean;
  src: string;
  title: string;
  artist: string;
  defaultVolume: number;
  loop: boolean;
  autoPlay: boolean;
}

export interface ClosingNoteConfig {
  enabled: boolean;
  quote: string;
  author: string;
}

/**
 * Struktur Data Album Lengkap
 */
export interface AlbumData {
  id: string;
  title: string;
  covers: CoverConfig;
  book: BookSettings;
  motion: MotionSettings;
  background: BackgroundSettings;
  sheets: SheetConfig[];
  storyIntro: StoryIntroConfig;
  audio: AudioConfig;
  closingNote: ClosingNoteConfig;
  createdAt: string;
  updatedAt: string;
}

/**
 * Preset Layout Halaman untuk Tab 2 (Manajer Halaman)
 * Diekstraksi langsung dari variasi halaman yang sudah terbukti indah pada data bawaan.
 */
export interface PageLayoutPreset {
  id: string;
  name: string;
  description: string;
  frontFill: "bleed" | "framed";
  backFill: "bleed" | "framed";
  defaultFrontCaption: string;
  defaultBackCaption: string;
  sampleFrontVideo?: string;
  sampleBackVideo?: string;
}

export const PAGE_LAYOUT_PRESETS: PageLayoutPreset[] = [
  {
    id: "bleed-duo",
    name: "Full Bleed Foto Ganda",
    description: "Foto memenuhi seluruh permukaan kertas di kedua sisi halaman.",
    frontFill: "bleed",
    backFill: "bleed",
    defaultFrontCaption: "Momen Spesial",
    defaultBackCaption: "Kenangan Abadi",
  },
  {
    id: "video-front",
    name: "Video Depan + Foto Penuh Belakang",
    description: "Halaman depan memutar video bergerak halus dan belakang foto penuh.",
    frontFill: "bleed",
    backFill: "bleed",
    defaultFrontCaption: "Momen Bergerak (Video)",
    defaultBackCaption: "Senyuman Indah",
    sampleFrontVideo: "/videos/video-01.mp4",
  },
  {
    id: "framed-duo",
    name: "Foto Galeri Berbingkai",
    description: "Foto klasik berbingkai putih seperti karya pameran seni di kedua sisi.",
    frontFill: "framed",
    backFill: "framed",
    defaultFrontCaption: "Kisah Kita",
    defaultBackCaption: "Langkah Bersama",
  },
  {
    id: "video-back",
    name: "Foto Berbingkai + Video Belakang",
    description: "Foto berbingkai di sisi depan dan video bergerak di sisi belakang.",
    frontFill: "framed",
    backFill: "framed",
    defaultFrontCaption: "Pemandangan Hari Itu",
    defaultBackCaption: "Suasana Hangat (Video)",
    sampleBackVideo: "/videos/video-02.mp4",
  },
  {
    id: "mixed-bleed-framed",
    name: "Kombinasi Bleed & Berbingkai",
    description: "Sisi depan foto penuh tanpa tepi dan sisi belakang foto klasik berbingkai.",
    frontFill: "bleed",
    backFill: "framed",
    defaultFrontCaption: "Penuh Warna",
    defaultBackCaption: "Catatan Kenangan",
  },
];

/**
 * Preset Musik Latar Pilihan
 */
export interface AudioPreset {
  id: string;
  name: string;
  artist: string;
  src: string;
  tag: string;
}

export const AUDIO_PRESETS: AudioPreset[] = [
  {
    id: "piano-ambient",
    name: "Gymnopédie No. 1",
    artist: "Erik Satie (Kevin MacLeod)",
    src: "/audio/ambient-piano.mp3",
    tag: "Klasik Damai",
  },
];

/**
 * Konfigurasi Default Album Awal (High-Craft Preset)
 */
export const DEFAULT_ALBUM_DATA: AlbumData = {
  id: "default-memory-album",
  title: "Volume One",
  covers: {
    frontImageURL: "/images/cover.jpg",
    frontVideoURL: "",
    backImageURL: "",
    backVideoURL: "",
    title: "Volume One",
    color: "#26332d",
    titleColor: "#f4f1ea",
  },
  book: {
    start: "cover",
    size: 0.68,
    aspect: 0.76, // 1200 / 1500
    radius: 4,
    paper: "#fbfaf6",
    shadow: 0.6,
    spine: 0.55,
    thickness: 8,
    indicator: "none",
    indicatorColor: "rgba(23, 23, 23, 0.72)",
  },
  motion: {
    speed: 1,
    feel: 0.45,
    curl: 1,
    tilt: true,
    tiltAmount: 6,
    autoplay: false,
    interval: 8, // 8.000ms per lembar
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
      frontFill: "bleed",
      backImageURL: "/images/page-02.jpg",
      backVideoURL: "",
      backCaption: "Foto Pribadi 02",
      backFill: "bleed",
    },
    {
      id: "leaf-2",
      frontImageURL: "/images/page-03.jpg",
      frontVideoURL: "/videos/video-01.mp4",
      frontCaption: "Salt Flats (Video)",
      frontFill: "bleed",
      backImageURL: "/images/page-04.jpg",
      backVideoURL: "",
      backCaption: "Foto Pribadi 04",
      backFill: "bleed",
    },
    {
      id: "leaf-3",
      frontImageURL: "/images/page-05.jpg",
      frontVideoURL: "",
      frontCaption: "Foto Pribadi 05",
      frontFill: "bleed",
      backImageURL: "/images/page-06.jpg",
      backVideoURL: "",
      backCaption: "Foto Pribadi 06",
      backFill: "framed",
    },
    {
      id: "leaf-4",
      frontImageURL: "/images/page-07.jpg",
      frontVideoURL: "",
      frontCaption: "Foto Pribadi 07",
      frontFill: "framed",
      backImageURL: "/images/page-08.jpg",
      backVideoURL: "/videos/video-02.mp4",
      backCaption: "Fog Bank (Video)",
      backFill: "framed",
    },
    {
      id: "leaf-5",
      frontImageURL: "/images/page-09.jpg",
      frontVideoURL: "/videos/video-03.mp4",
      frontCaption: "Stone Steps (Video)",
      frontFill: "bleed",
      backImageURL: "/images/page-10.jpg",
      backVideoURL: "",
      backCaption: "Foto Pribadi 10",
      backFill: "bleed",
    },
    {
      id: "leaf-6",
      frontImageURL: "/images/page-11.jpg",
      frontVideoURL: "",
      frontCaption: "Foto Pribadi 11",
      frontFill: "bleed",
      backImageURL: "/images/page-12.jpg",
      backVideoURL: "",
      backCaption: "Foto Pribadi 12",
      backFill: "framed",
    },
  ],
  storyIntro: {
    enabled: true,
    initialDelay: 3800,
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
  },
  audio: {
    enabled: true,
    src: "/audio/ambient-piano.mp3",
    title: "Gymnopédie No. 1",
    artist: "Erik Satie",
    defaultVolume: 0.65,
    loop: true,
    autoPlay: true,
  },
  closingNote: {
    enabled: true,
    quote: "Terima kasih untuk selalu hadir dalam hidupku",
    author: "Hilmi",
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
