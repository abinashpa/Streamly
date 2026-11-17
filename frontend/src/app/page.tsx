"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Film, Flame, Music, Sparkles, TrendingUp, Compass, ArrowRight } from "lucide-react";
import { MediaItem } from "@/types";
import { fetchFeed, fetchTrending } from "@/lib/api";
import VideoCard from "@/components/VideoCard";
import ShortCard from "@/components/ShortCard";
import MusicCard from "@/components/MusicCard";

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [feedItems, setFeedItems] = useState<MediaItem[]>([]);
  const [trendingShorts, setTrendingShorts] = useState<MediaItem[]>([]);
  const [musicTracks, setMusicTracks] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await fetchFeed(activeFilter);
      setFeedItems(items);

      if (activeFilter === "all" || activeFilter === "short") {
        const shorts = await fetchFeed("short");
        setTrendingShorts(shorts);
      }
      if (activeFilter === "all" || activeFilter === "music") {
        const music = await fetchFeed("music");
        setMusicTracks(music);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterTabs = [
    { id: "all", label: "All Media", icon: Compass },
    { id: "video", label: "Videos", icon: Film },
    { id: "short", label: "Shorts", icon: Flame },
    { id: "music", label: "Music", icon: Music },
  ];

  const videoItems = feedItems.filter((i) => i.media_type === "video");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900/40 via-red-950/30 to-background border border-border p-6 md:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High Fidelity Streaming Engine</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Stream Videos, Shorts & Music in One Place
          </h1>
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
            Experience lightning-fast HTTP 206 chunked streaming powered by Go, OpenSearch search index, and Redis low-latency cache.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/upload"
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-full shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
            >
              Upload Content
            </Link>
            <Link
              href="/shorts"
              className="px-6 py-2.5 bg-surface hover:bg-card text-neutral-200 border border-border text-sm font-semibold rounded-full transition-all"
            >
              Watch Shorts
            </Link>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-white text-black shadow-md font-semibold"
                  : "bg-surface hover:bg-card text-neutral-300 border border-border"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-neutral-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Shorts Section (Visible on 'all' or 'short') */}
      {(activeFilter === "all" || activeFilter === "short") && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-primary" />
              <h2 className="text-lg md:text-xl font-bold text-white">Trending Shorts</h2>
            </div>
            <Link
              href="/shorts"
              className="text-xs md:text-sm text-neutral-400 hover:text-primary flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex space-x-4 overflow-x-auto pb-3 pt-1 scrollbar-thin">
            {trendingShorts.length > 0 ? (
              trendingShorts.map((short) => <ShortCard key={short.id} item={short} />)
            ) : (
              <div className="py-8 text-neutral-500 text-sm">
                No shorts uploaded yet. Upload a short video in the{" "}
                <Link href="/upload" className="text-primary underline">
                  Upload Studio
                </Link>
                !
              </div>
            )}
          </div>
        </section>
      )}

      {/* Music Section (Visible on 'all' or 'music') */}
      {(activeFilter === "all" || activeFilter === "music") && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Music className="w-5 h-5 text-secondary" />
              <h2 className="text-lg md:text-xl font-bold text-white">Popular Music</h2>
            </div>
            <Link
              href="/music"
              className="text-xs md:text-sm text-neutral-400 hover:text-secondary flex items-center space-x-1"
            >
              <span>Explore music</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {musicTracks.length > 0 ? (
              musicTracks.slice(0, 6).map((track) => (
                <MusicCard key={track.id} item={track} allTracks={musicTracks} />
              ))
            ) : (
              <div className="col-span-full py-6 text-neutral-500 text-sm">
                No music tracks uploaded yet. Upload music in the{" "}
                <Link href="/upload" className="text-secondary underline">
                  Upload Studio
                </Link>
                !
              </div>
            )}
          </div>
        </section>
      )}

      {/* Videos Section */}
      {(activeFilter === "all" || activeFilter === "video") && (
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <Film className="w-5 h-5 text-primary" />
            <h2 className="text-lg md:text-xl font-bold text-white">Recommended Videos</h2>
          </div>

          {videoItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-7">
              {videoItems.map((video) => (
                <VideoCard key={video.id} item={video} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center rounded-2xl bg-surface/50 border border-border">
              <Film className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <div className="text-base font-semibold text-neutral-300">No videos found</div>
              <p className="text-xs text-neutral-500 mt-1 mb-4">
                Be the first creator to publish a video on Streamly!
              </p>
              <Link
                href="/upload"
                className="px-5 py-2 bg-primary text-white text-xs font-semibold rounded-full shadow"
              >
                Upload Video
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
