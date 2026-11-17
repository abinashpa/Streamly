"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Flame, Music2, Upload, Compass, History, ListMusic, FileCode2, Layers } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { label: "Home", href: "/", icon: Home },
    { label: "Shorts", href: "/shorts", icon: Flame },
    { label: "Music", href: "/music", icon: Music2 },
    { label: "Upload Studio", href: "/upload", icon: Upload },
  ];

  const exploreLinks = [
    { label: "Trending", href: "/?tab=trending", icon: Compass },
    { label: "Playlists", href: "/music", icon: ListMusic },
    { label: "Swagger Docs", href: "http://localhost:8080/docs", icon: FileCode2, external: true },
    { label: "GraphQL IDE", href: "http://localhost:8080/graphql", icon: Layers, external: true },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 bg-surface/50 border-r border-border p-3 space-y-6 flex-shrink-0">
      <div className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-neutral-400 hover:text-white hover:bg-surface"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-neutral-400"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="pt-4 border-t border-border/60">
        <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Explore
        </div>
        <div className="space-y-1">
          {exploreLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-white hover:bg-surface transition-all"
              >
                <Icon className="w-5 h-5 text-neutral-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-auto p-3.5 rounded-2xl bg-card border border-border/80">
        <div className="text-xs font-medium text-neutral-400">Streamly Microservices</div>
        <div className="mt-1 text-[11px] text-neutral-500 leading-relaxed">
          Go & Gin • Next.js & Prisma • Redis Cache • OpenSearch Engine
        </div>
      </div>
    </aside>
  );
}
