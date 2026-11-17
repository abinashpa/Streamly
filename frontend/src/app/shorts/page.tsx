"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Flame,
  ThumbsUp,
  MessageCircle,
  Share2,
  ChevronUp,
  ChevronDown,
  Music,
  Check,
  Volume2,
  VolumeX,
} from "lucide-react";
import { MediaItem } from "@/types";
import { fetchFeed, recordMediaView, toggleMediaLike, getMediaStreamUrl } from "@/lib/api";

export default function ShortsPage() {
  const searchParams = useSearchParams();
  const requestedId = searchParams?.get("id");

  const [shorts, setShorts] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    loadShorts();
  }, []);

  const loadShorts = async () => {
    setLoading(true);
    try {
      const data = await fetchFeed("short");
      setShorts(data);

      if (data.length > 0) {
        const initialLikes: Record<string, number> = {};
        data.forEach((s) => {
          initialLikes[s.id] = s.likes || 0;
        });
        setLikeCounts(initialLikes);

        if (requestedId) {
          const idx = data.findIndex((s) => s.id === requestedId);
          if (idx !== -1) setCurrentIndex(idx);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentShort = shorts[currentIndex];

  useEffect(() => {
    if (currentShort) {
      recordMediaView(currentShort.id);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentIndex, currentShort]);

  const handleNext = () => {
    if (currentIndex + 1 < shorts.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleLike = async () => {
    if (!currentShort) return;
    const isNowLiked = await toggleMediaLike(currentShort.id);
    setLiked((prev) => ({ ...prev, [currentShort.id]: isNowLiked }));
    setLikeCounts((prev) => ({
      ...prev,
      [currentShort.id]: isNowLiked
        ? (prev[currentShort.id] || 0) + 1
        : Math.max(0, (prev[currentShort.id] || 1) - 1),
    }));
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && currentShort) {
      const shareUrl = `${window.location.origin}/shorts?id=${currentShort.id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="text-center py-24 max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto">
          <Flame className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Shorts Available</h2>
        <p className="text-sm text-neutral-400">
          Be the first creator to upload a short vertical reel to Streamly!
        </p>
        <Link
          href="/upload"
          className="inline-block px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-full shadow"
        >
          Upload Short
        </Link>
      </div>
    );
  }

  const streamSrc = getMediaStreamUrl(currentShort.stream_url);
  const isCurrentLiked = liked[currentShort.id] || false;
  const currentLikeCount = likeCounts[currentShort.id] || 0;

  return (
    <div className="flex items-center justify-center py-2 h-[calc(100vh-140px)]">
      <div className="relative flex items-center space-x-4 h-full max-h-[820px]">
        {/* Video Reel Container (9:16 Aspect) */}
        <div className="relative h-full aspect-[9/16] rounded-3xl overflow-hidden bg-black border border-border shadow-2xl flex items-center justify-center">
          <video
            ref={videoRef}
            src={streamSrc}
            autoPlay
            loop
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover"
          />

          {/* Volume toggle button top-right */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 backdrop-blur text-white hover:bg-black/80 transition-all z-20"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Bottom Info Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end space-y-2.5 z-10">
            {/* Creator info */}
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-surface border border-border overflow-hidden">
                <img
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${currentShort.uploader_name || "creator"}`}
                  alt="Creator"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">
                  @{currentShort.uploader_name || "StreamlyCreator"}
                </div>
              </div>
              <button className="px-3 py-1 bg-white text-black text-[11px] font-semibold rounded-full hover:bg-neutral-200 transition-colors ml-2">
                Follow
              </button>
            </div>

            {/* Title & Description */}
            <p className="text-xs md:text-sm text-neutral-100 font-medium line-clamp-2 leading-relaxed">
              {currentShort.title}
            </p>

            {/* Music track tag */}
            <div className="flex items-center space-x-2 text-xs text-neutral-300">
              <Music className="w-3.5 h-3.5 text-primary" />
              <span className="truncate">
                {currentShort.artist ? `${currentShort.artist} • Original Audio` : "Original Sound"}
              </span>
            </div>
          </div>
        </div>

        {/* Floating Side Action Buttons */}
        <div className="flex flex-col items-center space-y-5">
          {/* Like */}
          <button
            onClick={handleLike}
            className="flex flex-col items-center group"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isCurrentLiked
                  ? "bg-primary text-white scale-110"
                  : "bg-surface hover:bg-card text-neutral-300 border border-border"
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${isCurrentLiked ? "fill-white" : ""}`} />
            </div>
            <span className="text-[11px] font-semibold text-neutral-400 mt-1">
              {currentLikeCount}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex flex-col items-center group"
          >
            <div className="w-12 h-12 rounded-full bg-surface hover:bg-card border border-border flex items-center justify-center text-neutral-300 transition-all shadow-lg">
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
            </div>
            <span className="text-[11px] font-semibold text-neutral-400 mt-1">
              {copied ? "Copied" : "Share"}
            </span>
          </button>

          {/* Next / Previous Reel buttons */}
          <div className="pt-4 flex flex-col space-y-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-10 h-10 rounded-full bg-surface border border-border disabled:opacity-30 flex items-center justify-center text-white hover:bg-card transition-colors"
              title="Previous Short"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === shorts.length - 1}
              className="w-10 h-10 rounded-full bg-surface border border-border disabled:opacity-30 flex items-center justify-center text-white hover:bg-card transition-colors"
              title="Next Short"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
