/**
 * Utilitas Kompresi Gambar & Penanganan Media Sisi Klien (Browser-side)
 * Memastikan foto beresolusi tinggi dikompres secara instan tanpa ketergantungan server.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "image/webp" | "image/jpeg";
}

/**
 * Mengompres file foto lokal pengguna menjadi WebP atau JPEG yang ringan dan tajam.
 */
export async function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1400,
    maxHeight = 1800,
    quality = 0.82,
    format = "image/webp",
  } = options;

  return new Promise((resolve, reject) => {
    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      reject(new Error("File bukan gambar yang valid"));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      // Hitung proporsi rasio penskalaan
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Gagal menginisialisasi canvas context"));
        return;
      }

      // Kualitas smoothing tinggi
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Konversi ke Data URL
      try {
        let resultDataUrl = canvas.toDataURL(format, quality);
        // Fallback ke JPEG jika browser tidak mendukung export WebP
        if (format === "image/webp" && resultDataUrl.startsWith("data:image/png")) {
          resultDataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(resultDataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}

/**
 * Membaca file video singkat atau audio menjadi Data URL lokal untuk preview langsung.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Gagal membaca file"));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
