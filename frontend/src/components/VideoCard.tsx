"use client";

import React from "react";
import Link from "next/link";
import { MediaItem } from "@/types";
import { getMediaStreamUrl } from "@/lib/api";

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function formatViews(views?: number): string {
  if (!views) return "0 views";
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
  return `${views} views`;
}

export default function VideoCard({ item }: { item: MediaItem }) {
  const thumbnail = item.thumbnail_url?.startsWith("/")
    ? getMediaStreamUrl(item.thumbnail_url)
    : item.thumbnail_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80";

  return (
    <div className="group flex flex-col space-y-3 cursor-pointer">
      {/* Thumbnail */}
      <Link
        href={`/watch/${item.id}`}
        className="relative aspect-video rounded-2xl overflow-hidden bg-surface border border-border group-hover:border-primary/50 transition-all shadow-md group-hover:shadow-primary/20"
      >
        <img
          src={thumbnail}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {item.duration > 0 && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-md bg-black/80 text-white backdrop-blur">
            {formatDuration(item.duration)}
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex space-x-3 items-start px-0.5">
        <div className="w-9 h-9 rounded-full bg-surface border border-border overflow-hidden flex-shrink-0">
          <img
            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${item.uploader_name || "streamly"}`}
            alt={item.uploader_name || "Creator"}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <Link href={`/watch/${item.id}`}>
            <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {item.title}
            </h3>
          </Link>
          <p className="text-xs text-neutral-400 mt-1 truncate">
            {item.uploader_name || "Streamly Creator"}
          </p>
          <div className="flex items-center space-x-2 text-[11px] text-neutral-500 mt-0.5">
            <span>{formatViews(item.views)}</span>
            <span>•</span>
            <span>{new Date(item.created_at || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
