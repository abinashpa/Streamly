import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import MusicPlayerBar from "@/components/MusicPlayerBar";
import { AudioPlayerProvider } from "@/context/AudioPlayerContext";

export const metadata: Metadata = {
  title: "Streamly | Stream Videos, Shorts & Music",
  description: "Next-generation decentralized streaming platform for Videos, Shorts, and Music.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-neutral-100 min-h-screen flex flex-col antialiased">
        <AudioPlayerProvider>
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto pb-24 px-4 md:px-8 py-6">
              {children}
            </main>
          </div>
          <MusicPlayerBar />
        </AudioPlayerProvider>
      </body>
    </html>
  );
}
