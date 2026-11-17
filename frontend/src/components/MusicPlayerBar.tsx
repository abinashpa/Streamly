"use client";

import React, { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, Maximize2 } from "lucide-react";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { getMediaStreamUrl } from "@/lib/api";

function formatTime(secs: number): string {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function MusicPlayerBar() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlay,
    seek,
    setVolumeLevel,
    playNext,
    playPrevious,
  } = useAudioPlayer();

  const [prevVolume, setPrevVolume] = useState(0.8);

  if (!currentTrack) return null;

  const thumbnail = currentTrack.thumbnail_url?.startsWith("/")
    ? getMediaStreamUrl(currentTrack.thumbnail_url)
    : currentTrack.thumbnail_url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80";

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolumeLevel(0);
    } else {
      setVolumeLevel(prevVolume || 0.8);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-surface/95 backdrop-blur-lg border-t border-border z-50 flex items-center justify-between px-4 lg:px-8 shadow-2xl">
      {/* Track Info */}
      <div className="flex items-center space-x-3.5 w-1/4 min-w-[180px]">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-background border border-border flex-shrink-0 shadow-md">
          <img
            src={thumbnail}
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate hover:text-primary transition-colors cursor-pointer">
            {currentTrack.title}
          </div>
          <div className="text-xs text-neutral-400 truncate">
            {currentTrack.artist || currentTrack.uploader_name || "Unknown Artist"}
          </div>
        </div>
      </div>

      {/* Main Controls & Progress Bar */}
      <div className="flex flex-col items-center max-w-xl w-2/4 px-4">
        {/* Buttons */}
        <div className="flex items-center space-x-5 mb-1.5">
          <button
            onClick={playPrevious}
            className="text-neutral-400 hover:text-white transition-colors"
            title="Previous"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black ml-0.5" />
            )}
          </button>
          <button
            onClick={playNext}
            className="text-neutral-400 hover:text-white transition-colors"
            title="Next"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center space-x-3 text-xs text-neutral-400">
          <span className="w-10 text-right font-mono">{formatTime(currentTime)}</span>
          <div className="relative flex-1 flex items-center group">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-primary group-hover:h-1.5 transition-all"
            />
          </div>
          <span className="w-10 font-mono">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume & Extra */}
      <div className="flex items-center justify-end space-x-3 w-1/4">
        <button
          onClick={toggleMute}
          className="text-neutral-400 hover:text-white transition-colors"
          title="Mute/Unmute"
        >
          {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolumeLevel(Number(e.target.value))}
          className="w-20 lg:w-28 h-1 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
        />
      </div>
    </div>
  );
}
