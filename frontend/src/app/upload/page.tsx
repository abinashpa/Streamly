"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Film,
  Flame,
  Music,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { uploadMedia } from "@/lib/api";

type MediaTypeTab = "video" | "short" | "music";

export default function UploadPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<MediaTypeTab>("video");
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [artist, setArtist] = useState("");
  const [tags, setTags] = useState("");
  const [uploaderName, setUploaderName] = useState("Streamly Creator");
  const [duration, setDuration] = useState<number>(0);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setErrorMsg(null);

      // Auto-populate title if empty
      if (!title) {
        const cleanName = selected.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(cleanName);
      }

      // Try to determine duration using standard HTML5 Audio/Video element
      try {
        const objectUrl = URL.createObjectURL(selected);
        if (activeTab === "music") {
          const audio = new Audio(objectUrl);
          audio.onloadedmetadata = () => {
            setDuration(Math.round(audio.duration));
            URL.revokeObjectURL(objectUrl);
          };
        } else {
          const video = document.createElement("video");
          video.src = objectUrl;
          video.onloadedmetadata = () => {
            setDuration(Math.round(video.duration));
            URL.revokeObjectURL(objectUrl);
          };
        }
      } catch (err) {
        console.warn("Could not auto-determine duration:", err);
      }
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setThumbnail(selected);
      setThumbnailPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Please select a media file to upload");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Please enter a title");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title.trim());
    formData.append("media_type", activeTab);
    formData.append("description", description.trim());
    formData.append("artist", artist.trim());
    formData.append("tags", tags.trim());
    formData.append("uploader_name", uploaderName.trim());
    formData.append("duration", duration.toString());

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    const result = await uploadMedia(formData, (percent) => {
      setUploadProgress(percent);
    });

    setUploading(false);

    if (result.success && result.data?.media) {
      setSuccessMsg("Upload successful! Redirecting...");
      const newMedia = result.data.media;
      setTimeout(() => {
        if (newMedia.media_type === "short") {
          router.push(`/shorts?id=${newMedia.id}`);
        } else if (newMedia.media_type === "music") {
          router.push("/music");
        } else {
          router.push(`/watch/${newMedia.id}`);
        }
      }, 1500);
    } else {
      setErrorMsg(result.error || "An error occurred during upload");
    }
  };

  const tabConfigs = [
    { id: "video", label: "Video", icon: Film, accept: "video/mp4,video/webm,video/mov,video/mkv" },
    { id: "short", label: "Short Video", icon: Flame, accept: "video/mp4,video/webm,video/mov" },
    { id: "music", label: "Music", icon: Music, accept: "audio/mp3,audio/wav,audio/flac,audio/ogg,audio/mpeg" },
  ];

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">Upload Studio</h1>
        <p className="text-sm text-neutral-400">
          Publish high-performance streaming videos, vertical reels, and music tracks.
        </p>
      </div>

      {/* Media Type Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-surface border border-border">
        {tabConfigs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as MediaTypeTab);
                setFile(null);
              }}
              className={`flex items-center justify-center space-x-2 py-3 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md shadow-primary/25"
                  : "text-neutral-400 hover:text-white hover:bg-card"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
            file
              ? "border-primary/80 bg-primary/5"
              : "border-border hover:border-neutral-600 bg-surface/40 hover:bg-surface/70"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={tabConfigs.find((t) => t.id === activeTab)?.accept}
            onChange={handleFileChange}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="font-semibold text-white text-sm truncate max-w-md">
                {file.name}
              </div>
              <div className="text-xs text-neutral-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || activeTab}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="mt-2 text-xs text-neutral-400 hover:text-red-400 flex items-center space-x-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Choose another file</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <span className="font-semibold text-sm text-white">Click to select</span>
                <span className="text-sm text-neutral-400"> or drag and drop your {activeTab} file</span>
              </div>
              <p className="text-xs text-neutral-500">
                {activeTab === "music" ? "MP3, WAV, FLAC, OGG" : "MP4, WebM, MOV, MKV"} up to 500MB
              </p>
            </div>
          )}
        </div>

        {/* Thumbnail Selection */}
        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-background border border-border overflow-hidden flex items-center justify-center flex-shrink-0">
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-5 h-5 text-neutral-500" />
              )}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                {activeTab === "music" ? "Album Artwork" : "Custom Thumbnail"}
              </div>
              <div className="text-xs text-neutral-400">JPG, PNG, or WebP image</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => thumbInputRef.current?.click()}
            className="px-4 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold text-neutral-200 hover:text-white hover:bg-neutral-800 transition-all"
          >
            {thumbnail ? "Change" : "Browse"}
          </button>
          <input
            ref={thumbInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleThumbnailChange}
            className="hidden"
          />
        </div>

        {/* Metadata Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Title <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Enter ${activeTab} title...`}
              required
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all placeholder:text-neutral-500"
            />
          </div>

          {activeTab === "music" && (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Artist / Band Name
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Daft Punk, Hans Zimmer"
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all placeholder:text-neutral-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers what your content is about..."
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all placeholder:text-neutral-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="music, chill, remix, tutorial"
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all placeholder:text-neutral-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                Creator / Channel Name
              </label>
              <input
                type="text"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-all placeholder:text-neutral-500"
              />
            </div>
          </div>
        </div>

        {/* Progress Bar & Status messages */}
        {uploading && (
          <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
            <div className="flex justify-between text-xs text-neutral-300 font-semibold">
              <span className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Uploading & Indexing into OpenSearch...</span>
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-background rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800 text-red-200 text-sm flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-green-950/40 border border-green-800 text-green-200 text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary hover:opacity-95 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-xl shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing Upload...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-5 h-5" />
              <span>Publish to Streamly</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
