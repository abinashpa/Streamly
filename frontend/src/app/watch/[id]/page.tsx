"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ThumbsUp, Share2, Check, Eye, Calendar, Sparkles } from "lucide-react";
import { MediaItem } from "@/types";
import { fetchMediaDetails, recordMediaView, toggleMediaLike, fetchFeed, getMediaStreamUrl } from "@/lib/api";
import CommentsSection from "@/components/CommentsSection";
import VideoCard from "@/components/VideoCard";

export default function WatchPage() {
  const params = useParams();
  const id = params?.id as string;

  const [media, setMedia] = useState<MediaItem | null>(null);
  const [related, setRelated] = useState<MediaItem[]>([]);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (id) {
      loadMedia();
      recordMediaView(id);
    }
  }, [id]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await fetchMediaDetails(id);
      if (data) {
        setMedia(data);
        setLikesCount(data.likes || 0);
      }
      const feed = await fetchFeed("video");
      setRelated(feed.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    const newLikedState = await toggleMediaLike(id);
    setLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : Math.max(0, prev - 1)));
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!media) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white">Video not found</h2>
        <p className="text-neutral-400 mt-2">The video you are looking for does not exist or was removed.</p>
        <Link href="/" className="inline-block mt-4 px-4 py-2 bg-primary text-white rounded-xl">
          Back to Home
        </Link>
      </div>
    );
  }

  const streamSrc = getMediaStreamUrl(media.stream_url);

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Player & Details */}
      <div className="lg:col-span-2 space-y-4">
        {/* Video Player Box */}
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-border shadow-2xl">
          <video
            ref={videoRef}
            src={streamSrc}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          >
            Your browser does not support HTML5 video playback.
          </video>
        </div>

        {/* Video Metadata Header */}
        <div className="space-y-3">
          <h1 className="text-xl md:text-2xl font-bold text-white leading-snug">
            {media.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-border/80">
            {/* Channel info */}
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-full bg-surface border border-border overflow-hidden">
                <img
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${media.uploader_name || "streamly"}`}
                  alt="Uploader"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-semibold text-sm text-white">
                  {media.uploader_name || "Streamly Creator"}
                </div>
                <div className="text-xs text-neutral-400">Verified Creator</div>
              </div>
              <button className="ml-2 px-4 py-1.5 bg-white text-black text-xs font-semibold rounded-full hover:bg-neutral-200 transition-colors">
                Subscribe
              </button>
            </div>

            {/* Like & Share Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                  liked
                    ? "bg-primary/20 text-primary border-primary"
                    : "bg-surface hover:bg-card text-neutral-300 border-border"
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${liked ? "fill-primary" : ""}`} />
                <span>{likesCount}</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-surface hover:bg-card text-neutral-300 border border-border text-xs font-semibold transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Share"}</span>
              </button>
            </div>
          </div>

          {/* Description Card */}
          <div className="p-4 rounded-2xl bg-surface/70 border border-border space-y-2">
            <div className="flex items-center space-x-3 text-xs font-semibold text-neutral-400">
              <span className="flex items-center space-x-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{media.views || 0} views</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(media.created_at || Date.now()).toLocaleDateString()}</span>
              </span>
            </div>

            <p className="text-sm text-neutral-300 whitespace-pre-line leading-relaxed">
              {media.description || "No description provided."}
            </p>

            {media.tags && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {media.tags.split(",").map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-md bg-card text-[11px] font-medium text-primary border border-border"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comments */}
        <CommentsSection mediaId={media.id} />
      </div>

      {/* Sidebar: Related Videos */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Related Videos</span>
        </h3>
        <div className="space-y-4">
          {related.length > 0 ? (
            related.slice(0, 8).map((rel) => <VideoCard key={rel.id} item={rel} />)
          ) : (
            <div className="text-xs text-neutral-500 py-6">No related videos available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
