"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Upload, PlayCircle, Film, Music, Radio, X } from "lucide-react";
import { fetchSuggestions } from "@/lib/api";

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        const results = await fetchSuggestions(searchQuery.trim());
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const selectSuggestion = (s: string) => {
    setSearchQuery(s);
    setShowDropdown(false);
    router.push(`/search?q=${encodeURIComponent(s)}`);
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 lg:px-6 h-16 bg-background/95 backdrop-blur border-b border-border">
      {/* Brand Logo */}
      <div className="flex items-center space-x-6">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            <PlayCircle className="w-6 h-6 text-white fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-400 bg-clip-text text-transparent">
            Streamly
          </span>
        </Link>
      </div>

      {/* OpenSearch Search Bar */}
      <div ref={searchRef} className="relative flex-1 max-w-xl mx-4">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="Search videos, shorts, music, artists..."
            className="w-full bg-surface/80 border border-border text-white text-sm rounded-full pl-11 pr-10 py-2.5 focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/80 transition-all placeholder:text-neutral-500"
          />
          <Search className="absolute left-4 w-4 h-4 text-neutral-400" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setShowDropdown(false);
              }}
              className="absolute right-3 p-1 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Autocomplete Dropdown */}
        {showDropdown && (
          <div className="absolute top-12 left-0 right-0 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className="py-2">
              <div className="px-4 py-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Suggestions (OpenSearch)
              </div>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => selectSuggestion(s)}
                  className="w-full text-left px-4 py-2.5 text-sm text-neutral-200 hover:bg-card hover:text-primary flex items-center space-x-3 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3">
        <Link
          href="/upload"
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:opacity-95 text-white text-sm font-medium rounded-full shadow-md shadow-primary/25 transition-all hover:scale-105 active:scale-95"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload</span>
        </Link>

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden">
          <img
            src="https://api.dicebear.com/7.x/identicon/svg?seed=streamly_user"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
