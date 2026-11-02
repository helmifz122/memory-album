import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { AlbumData } from "../types/album";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabaseInstance: SupabaseClient | null = null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    supabaseAnonKey.length > 10
  );
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) return null;
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!);
  }
  return supabaseInstance;
};

export const saveAlbumToCloud = async (album: AlbumData): Promise<{ id: string; url: string } | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const albumId = album.id || `album_${Date.now()}`;
    const payload = {
      id: albumId,
      data: album,
      updated_at: new Date().toISOString(),
    };

    const { error } = await client
      .from("albums")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      console.warn("Supabase upsert gagal, beralih ke penyimpanan lokal/URL:", error.message);
      return null;
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const cloudUrl = `${origin}${pathname}#/album/${albumId}`;

    return { id: albumId, url: cloudUrl };
  } catch (err) {
    console.warn("Kesalahan koneksi Supabase:", err);
    return null;
  }
};

export const loadAlbumFromCloud = async (id: string): Promise<AlbumData | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("albums")
      .select("data")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.warn("Gagal memuat album dari Supabase:", error?.message);
      return null;
    }

    return data.data as AlbumData;
  } catch (err) {
    console.warn("Kesalahan mengambil album Supabase:", err);
    return null;
  }
};
