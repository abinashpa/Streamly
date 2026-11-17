import axios from "axios";
import { MediaItem, CommentItem, UserProfile } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Attach JWT token from localStorage if present
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("streamly_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Feed & Catalog
export async function fetchFeed(type: string = "all", page: number = 1): Promise<MediaItem[]> {
  try {
    const res = await apiClient.get("/api/v1/catalog/feed", {
      params: { type: type === "all" ? "" : type, page, limit: 24 },
    });
    return res.data.items || [];
  } catch (error) {
    console.error("fetchFeed error:", error);
    return [];
  }
}

export async function fetchTrending(type: string = "all"): Promise<MediaItem[]> {
  try {
    const res = await apiClient.get("/api/v1/catalog/trending", {
      params: { type: type === "all" ? "" : type },
    });
    return res.data.items || [];
  } catch (error) {
    console.error("fetchTrending error:", error);
    return [];
  }
}

export async function fetchMediaDetails(id: string): Promise<MediaItem | null> {
  try {
    const res = await apiClient.get(`/api/v1/catalog/media/${id}`);
    return res.data;
  } catch {
    // Fallback to media-service if catalog not yet synced
    try {
      const res = await apiClient.get(`/api/v1/media/${id}`);
      return res.data;
    } catch (err) {
      console.error("fetchMediaDetails error:", err);
      return null;
    }
  }
}

export async function recordMediaView(id: string): Promise<void> {
  try {
    await apiClient.post(`/api/v1/catalog/media/${id}/view`);
  } catch (err) {
    console.error("recordMediaView error:", err);
  }
}

export async function toggleMediaLike(id: string, userId: string = "anon-user"): Promise<boolean> {
  try {
    const res = await apiClient.post(`/api/v1/catalog/media/${id}/like`, { user_id: userId });
    return res.data.liked;
  } catch (err) {
    console.error("toggleMediaLike error:", err);
    return false;
  }
}

// Comments
export async function fetchComments(id: string): Promise<CommentItem[]> {
  try {
    const res = await apiClient.get(`/api/v1/catalog/media/${id}/comments`);
    return res.data.comments || [];
  } catch (err) {
    console.error("fetchComments error:", err);
    return [];
  }
}

export async function postComment(
  id: string,
  content: string,
  userName: string = "Streamly User"
): Promise<CommentItem | null> {
  try {
    const res = await apiClient.post(`/api/v1/catalog/media/${id}/comments`, {
      content,
      user_name: userName,
    });
    return res.data.comment;
  } catch (err) {
    console.error("postComment error:", err);
    return null;
  }
}

// Search (OpenSearch)
export async function searchContent(query: string, type: string = "all"): Promise<MediaItem[]> {
  try {
    const res = await apiClient.get("/api/v1/search", {
      params: { q: query, type: type === "all" ? "" : type, limit: 30 },
    });
    return res.data.items || [];
  } catch (err) {
    console.error("searchContent error:", err);
    return [];
  }
}

export async function fetchSuggestions(query: string): Promise<string[]> {
  if (!query || query.trim().length === 0) return [];
  try {
    const res = await apiClient.get("/api/v1/search/suggest", {
      params: { q: query },
    });
    return res.data.suggestions || [];
  } catch (err) {
    console.error("fetchSuggestions error:", err);
    return [];
  }
}

// Upload
export async function uploadMedia(
  formData: FormData,
  onProgress?: (percent: number) => void
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await apiClient.post("/api/v1/media/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    // Also sync to catalog immediately
    const media = res.data.media;
    if (media) {
      try {
        await apiClient.post("/api/v1/catalog/sync", {
          media_id: media.id,
          title: media.title,
          description: media.description,
          media_type: media.media_type,
          artist: media.artist,
          duration: media.duration,
          stream_url: media.stream_url,
          thumbnail_url: media.thumbnail_url,
          uploader_id: media.uploader_id,
          uploader_name: media.uploader_name,
          tags: media.tags,
        });
      } catch (syncErr) {
        console.warn("Catalog sync failed:", syncErr);
      }
    }

    return { success: true, data: res.data };
  } catch (error: any) {
    console.error("uploadMedia error:", error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || "Upload failed",
    };
  }
}

// Helper to construct full stream URL
export function getMediaStreamUrl(streamUrlPath: string): string {
  if (!streamUrlPath) return "";
  if (streamUrlPath.startsWith("http://") || streamUrlPath.startsWith("https://")) {
    return streamUrlPath;
  }
  const cleanPath = streamUrlPath.startsWith("/") ? streamUrlPath : `/${streamUrlPath}`;
  return `${API_BASE}${cleanPath}`;
}
