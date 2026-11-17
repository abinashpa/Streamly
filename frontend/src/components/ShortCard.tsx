"use client";

import React from "react";
import Link from "next/link";
import { Flame, Play } from "lucide-react";
import { MediaItem } from "@/types";
import { getMediaStreamUrl } from "@/lib/api";

export default function ShortCard({ item }: { item: MediaItem }) {
  const thumbnail = item.thumbnail_url?.startsWith("/")
    ? getMediaStreamUrl(item.thumbnail_url)
    : item.thumbnail_url || "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80";

  return (
    <Link
      href={`/shorts?id=${item.id}`}
      className="group relative flex-shrink-0 w-44 md:w-52 aspect-[9/16] rounded-2xl overflow-hidden bg-surface border border-border group-hover:border-primary/60 transition-all shadow-lg group-hover:shadow-primary/20 cursor-pointer"
    >
      <img
        src={thumbnail}
        alt={item.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3.5">
        <div className="flex items-center space-x-1.5 mb-1.5 text-primary">
          <Flame className="w-4 h-4 fill-primary" />
          <span className="text-[11px] font-bold tracking-wide uppercase">Short</span>
        </div>
        <h4 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {item.title}
        </h4>
        <p className="text-xs text-neutral-400 mt-1 truncate">
          {item.views || 0} views
        </p>
      </div>

      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
      </div>
    </Link>
  );
}
