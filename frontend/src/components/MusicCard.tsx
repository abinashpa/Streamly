"use client";

import React from "react";
import { Play, Pause, Music } from "lucide-react";
import { MediaItem } from "@/types";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { getMediaStreamUrl } from "@/lib/api";

export default function MusicCard({ item, allTracks }: { item: MediaItem; allTracks?: MediaItem[] }) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioPlayer();
  const isCurrent = currentTrack?.id === item.id;

  const thumbnail = item.thumbnail_url?.startsWith("/")
    ? getMediaStreamUrl(item.thumbnail_url)
    : item.thumbnail_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80";

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(item, allTracks);
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group relative p-3.5 rounded-2xl bg-surface border transition-all cursor-pointer hover:bg-card ${
        isCurrent ? "border-primary shadow-lg shadow-primary/20" : "border-border hover:border-neutral-700"
      }`}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden bg-background mb-3">
        <img
          src={thumbnail}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Play Button Overlay */}
        <button
          onClick={handlePlayClick}
          className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-xl transition-all ${
            isCurrent && isPlaying
              ? "opacity-100 scale-100"
              : "opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-90"
          }`}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur text-[10px] font-semibold text-neutral-300 flex items-center space-x-1">
          <Music className="w-3 h-3 text-secondary" />
          <span>Track</span>
        </div>
      </div>

      <div className="min-w-0">
        <h4
          className={`text-sm font-semibold truncate transition-colors ${
            isCurrent ? "text-primary" : "text-white group-hover:text-primary"
          }`}
        >
          {item.title}
        </h4>
        <p className="text-xs text-neutral-400 mt-0.5 truncate">
          {item.artist || item.uploader_name || "Unknown Artist"}
        </p>
      </div>
    </div>
  );
}
