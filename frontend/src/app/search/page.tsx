"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Film, Flame, Music, Sparkles } from "lucide-react";
import { MediaItem } from "@/types";
import { searchContent } from "@/lib/api";
import VideoCard from "@/components/VideoCard";
import ShortCard from "@/components/ShortCard";
import MusicCard from "@/components/MusicCard";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";

  const [activeType, setActiveType] = useState<string>("all");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, activeType]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const items = await searchContent(query, activeType);
      setResults(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { id: "all", label: "All Results" },
    { id: "video", label: "Videos", icon: Film },
    { id: "short", label: "Shorts", icon: Flame },
    { id: "music", label: "Music", icon: Music },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Search Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>OpenSearch Results</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">
          Results for <span className="text-primary">"{query}"</span>
        </h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {types.map((t) => {
          const isActive = activeType === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? "bg-white text-black shadow-md"
                  : "bg-surface hover:bg-card text-neutral-300 border border-border"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Results Body */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 bg-surface/40 rounded-3xl border border-border">
          <Search className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No results found for "{query}"</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
            Try checking for spelling errors or using different, more general keywords.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* If looking at all or videos */}
          {results.some((r) => r.media_type === "video") && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Film className="w-4 h-4 text-primary" />
                <span>Videos</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results
                  .filter((r) => r.media_type === "video")
                  .map((video) => (
                    <VideoCard key={video.id} item={video} />
                  ))}
              </div>
            </div>
          )}

          {/* If looking at all or shorts */}
          {results.some((r) => r.media_type === "short") && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Flame className="w-4 h-4 text-primary" />
                <span>Shorts</span>
              </h3>
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {results
                  .filter((r) => r.media_type === "short")
                  .map((short) => (
                    <ShortCard key={short.id} item={short} />
                  ))}
              </div>
            </div>
          )}

          {/* If looking at all or music */}
          {results.some((r) => r.media_type === "music") && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Music className="w-4 h-4 text-secondary" />
                <span>Music Tracks</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results
                  .filter((r) => r.media_type === "music")
                  .map((track) => (
                    <MusicCard key={track.id} item={track} />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
