import LZString from "lz-string";
import QRCode from "qrcode";
import { AlbumData } from "../types/album";

export const compressAlbumToUrl = (album: AlbumData): string => {
  try {
    const jsonStr = JSON.stringify(album);
    const compressed = LZString.compressToEncodedURIComponent(jsonStr);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    return `${origin}${pathname}#/view/${compressed}`;
  } catch (err) {
    console.error("Gagal mengompresi data album:", err);
    return "";
  }
};

export const decompressAlbumFromUrl = (hashOrUrl: string): AlbumData | null => {
  try {
    const marker = "#/view/";
    const index = hashOrUrl.indexOf(marker);
    if (index === -1) return null;

    const payload = hashOrUrl.substring(index + marker.length);
    if (!payload) return null;

    const decompressed = LZString.decompressFromEncodedURIComponent(payload);
    if (!decompressed) return null;

    const parsed = JSON.parse(decompressed);
    if (parsed && Array.isArray(parsed.sheets) && parsed.covers) {
      return parsed as AlbumData;
    }
    return null;
  } catch (err) {
    console.error("Gagal mendekompresi data album:", err);
    return null;
  }
};

export const generateQrCodeDataUrl = async (url: string): Promise<string> => {
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: 320,
      margin: 2,
      color: {
        dark: "#111111",
        light: "#ffffff",
      },
    });
    return dataUrl;
  } catch (err) {
    console.error("Gagal membuat QR Code:", err);
    return "";
  }
};

export const createWhatsAppShareUrl = (title: string, shareUrl: string): string => {
  const message = `Halo! Aku baru saja membuatkan album kenangan virtual khusus untukmu: "${title}". Buka tautan ini untuk membacanya:\n\n${shareUrl}`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
};

export const createTelegramShareUrl = (title: string, shareUrl: string): string => {
  const message = `Album Kenangan Virtual: ${title}`;
  return `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`;
};
