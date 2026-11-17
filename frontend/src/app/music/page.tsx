"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Music, Play, Pause, Disc, Headphones, Sparkles, Clock, BarChart3 } from "lucide-react";
import { MediaItem } from "@/types";
import { fetchFeed, getMediaStreamUrl } from "@/lib/api";
import { useAudioPlayer } from "@/context/AudioPlayerContext";

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "3:30";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function MusicPage() {
  const [tracks, setTracks] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioPlayer();

  useEffect(() => {
    loadMusic();
  }, []);

  const loadMusic = async () => {
    setLoading(true);
    try {
      const data = await fetchFeed("music");
      setTracks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (track: MediaItem) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, tracks);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Music Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900/60 via-indigo-950/40 to-background border border-border p-6 md:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-secondary/20 border border-secondary/30 text-secondary text-xs font-semibold">
            <Disc className="w-3.5 h-3.5 animate-spin text-secondary" style={{ animationDuration: "6s" }} />
            <span>Lossless Audio Streaming</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Streamly Music
          </h1>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Listen to your favorite artists, stream background tracks seamlessly with HTTP 206 chunking, and create dynamic playlists.
          </p>
          <div className="pt-2 flex items-center space-x-3">
            {tracks.length > 0 && (
              <button
                onClick={() => playTrack(tracks[0], tracks)}
                className="flex items-center space-x-2 px-6 py-2.5 bg-secondary hover:bg-secondary-hover text-white text-sm font-semibold rounded-full shadow-lg shadow-secondary/30 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Play All</span>
              </button>
            )}
            <Link
              href="/upload"
              className="px-5 py-2.5 bg-surface hover:bg-card border border-border text-neutral-200 text-sm font-semibold rounded-full transition-all"
            >
              Upload Song
            </Link>
          </div>
        </div>

        <div className="w-44 h-44 md:w-56 md:h-56 rounded-2xl overflow-hidden bg-surface border border-border shadow-2xl flex-shrink-0 relative group">
          <img
            src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80"
            alt="Music cover"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Headphones className="w-12 h-12 text-white/80" />
          </div>
        </div>
      </div>

      {/* Top Tracks Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-secondary" />
            <h2 className="text-xl font-bold text-white">Popular Tracks</h2>
          </div>
          <span className="text-xs text-neutral-400">{tracks.length} tracks</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tracks.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-surface border border-border">
            <Music className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-neutral-300">No music uploaded yet</div>
            <p className="text-xs text-neutral-500 mt-1 mb-4">
              Upload MP3, WAV, or FLAC audio in the upload studio.
            </p>
            <Link
              href="/upload"
              className="px-4 py-2 bg-secondary text-white text-xs font-semibold rounded-full shadow"
            >
              Upload Music
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl bg-surface/70 border border-border overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-500 border-b border-border/60">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-6 md:col-span-5">Title & Artist</div>
              <div className="hidden md:block md:col-span-4">Album / Tags</div>
              <div className="col-span-5 md:col-span-2 text-right flex items-center justify-end space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Time</span>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/40">
              {tracks.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;
                const thumbnail = track.thumbnail_url?.startsWith("/")
                  ? getMediaStreamUrl(track.thumbnail_url)
                  : track.thumbnail_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80";

                return (
                  <div
                    key={track.id}
                    onClick={() => handleRowClick(track)}
                    className={`grid grid-cols-12 items-center px-5 py-3.5 text-sm cursor-pointer transition-colors group ${
                      isCurrent ? "bg-secondary/15 text-white" : "hover:bg-card text-neutral-300"
                    }`}
                  >
                    {/* Index / Play indicator */}
                    <div className="col-span-1 flex items-center justify-center">
                      {isCurrent && isPlaying ? (
                        <div className="w-4 h-4 flex items-center justify-center text-secondary">
                          <Pause className="w-4 h-4 fill-secondary" />
                        </div>
                      ) : (
                        <span className="group-hover:hidden text-xs text-neutral-500 font-mono">
                          {idx + 1}
                        </span>
                      )}
                      {(!isCurrent || !isPlaying) && (
                        <Play className="w-4 h-4 hidden group-hover:block text-white fill-white ml-0.5" />
                      )}
                    </div>

                    {/* Title + Thumbnail + Artist */}
                    <div className="col-span-6 md:col-span-5 flex items-center space-x-3 min-w-0 pr-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-background border border-border flex-shrink-0">
                        <img
                          src={thumbnail}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`font-semibold truncate text-sm ${
                            isCurrent ? "text-secondary" : "text-white group-hover:text-secondary"
                          }`}
                        >
                          {track.title}
                        </div>
                        <div className="text-xs text-neutral-400 truncate">
                          {track.artist || track.uploader_name || "Unknown Artist"}
                        </div>
                      </div>
                    </div>

                    {/* Tags / Album */}
                    <div className="hidden md:block md:col-span-4 text-xs text-neutral-400 truncate pr-4">
                      {track.tags ? track.tags : "Single"}
                    </div>

                    {/* Duration */}
                    <div className="col-span-5 md:col-span-2 text-right text-xs font-mono text-neutral-400">
                      {formatDuration(track.duration)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
