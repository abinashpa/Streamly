"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { MediaItem } from "@/types";
import { getMediaStreamUrl } from "@/lib/api";

interface AudioPlayerContextType {
  currentTrack: MediaItem | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: MediaItem[];
  playTrack: (track: MediaItem, queueList?: MediaItem[]) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolumeLevel: (val: number) => void;
  playNext: () => void;
  playPrevious: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [queue, setQueue] = useState<MediaItem[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;

      const audio = audioRef.current;

      const onTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };
      const onLoadedMetadata = () => {
        setDuration(audio.duration || 0);
      };
      const onEnded = () => {
        playNext();
      };

      audio.addEventListener("timeupdate", onTimeUpdate);
      audio.addEventListener("loadedmetadata", onLoadedMetadata);
      audio.addEventListener("ended", onEnded);

      return () => {
        audio.pause();
        audio.removeEventListener("timeupdate", onTimeUpdate);
        audio.removeEventListener("loadedmetadata", onLoadedMetadata);
        audio.removeEventListener("ended", onEnded);
      };
    }
  }, []);

  const playTrack = (track: MediaItem, queueList?: MediaItem[]) => {
    if (!audioRef.current) return;

    if (queueList && queueList.length > 0) {
      setQueue(queueList);
    } else if (!queue.some((item) => item.id === track.id)) {
      setQueue((prev) => [...prev, track]);
    }

    setCurrentTrack(track);
    const streamUrl = getMediaStreamUrl(track.stream_url);
    audioRef.current.src = streamUrl;
    audioRef.current.load();
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.error("Audio playback error:", err);
        setIsPlaying(false);
      });
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const seek = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  };

  const setVolumeLevel = (val: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = val;
    setVolume(val);
  };

  const playNext = () => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex + 1 < queue.length) {
      playTrack(queue[currentIndex + 1]);
    } else if (queue.length > 0) {
      playTrack(queue[0]); // loop back to first
    }
  };

  const playPrevious = () => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    if (currentIndex > 0) {
      playTrack(queue[currentIndex - 1]);
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        queue,
        playTrack,
        togglePlay,
        seek,
        setVolumeLevel,
        playNext,
        playPrevious,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
}
