#!/usr/bin/env bash
set -e

GATEWAY_URL=${1:-"http://localhost:8080"}

echo "=========================================="
echo " Seeding Streamly with Sample Media Data   "
echo " Target API Gateway: $GATEWAY_URL         "
echo "=========================================="

echo "Waiting for Streamly services to be healthy..."
until curl -s "$GATEWAY_URL/health" | grep -q "ok"; do
  echo "Waiting for API Gateway at $GATEWAY_URL..."
  sleep 3
done

echo "API Gateway is active!"

# Seed Sample Video 1
curl -s -X POST "$GATEWAY_URL/api/v1/catalog/sync" \
  -H "Content-Type: application/json" \
  -d '{
    "media_id": "c1a9320e-6f81-4f11-9a40-3b4781423851",
    "title": "Big Buck Bunny - 4K Animated Film",
    "description": "The classic open-source 4K animation featuring Big Buck Bunny and forest critters.",
    "media_type": "video",
    "duration": 596,
    "stream_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "thumbnail_url": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
    "uploader_name": "Blender Foundation",
    "tags": "animation,4k,blender,movie"
  }' > /dev/null

# Seed Sample Video 2
curl -s -X POST "$GATEWAY_URL/api/v1/catalog/sync" \
  -H "Content-Type: application/json" \
  -d '{
    "media_id": "c1a9320e-6f81-4f11-9a40-3b4781423852",
    "title": "Elephant Dream - Open Movie Project",
    "description": "The worlds first open movie production created entirely with open source 3D tools.",
    "media_type": "video",
    "duration": 653,
    "stream_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "thumbnail_url": "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80",
    "uploader_name": "Orange Open Movie",
    "tags": "scifi,cgi,3d,film"
  }' > /dev/null

# Seed Sample Video 3
curl -s -X POST "$GATEWAY_URL/api/v1/catalog/sync" \
  -H "Content-Type: application/json" \
  -d '{
    "media_id": "c1a9320e-6f81-4f11-9a40-3b4781423853",
    "title": "Tears of Steel - Sci-Fi VFX Showcase",
    "description": "Exploration of dystopian future Amsterdam featuring robotic combat and VFX compositing.",
    "media_type": "video",
    "duration": 734,
    "stream_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "thumbnail_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    "uploader_name": "Mango Open VFX",
    "tags": "vfx,robotics,scifi,amsterdam"
  }' > /dev/null

# Seed Short 1
curl -s -X POST "$GATEWAY_URL/api/v1/catalog/sync" \
  -H "Content-Type: application/json" \
  -d '{
    "media_id": "c1a9320e-6f81-4f11-9a40-3b4781423854",
    "title": "Subway Surfers Trickshot Compilation 🔥",
    "description": "Insane high score run and parkour stunts in vertical format! #shorts #gaming",
    "media_type": "short",
    "duration": 45,
    "stream_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "thumbnail_url": "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80",
    "uploader_name": "GamingPro",
    "tags": "shorts,gaming,viral,trickshot"
  }' > /dev/null

# Seed Short 2
curl -s -X POST "$GATEWAY_URL/api/v1/catalog/sync" \
  -H "Content-Type: application/json" \
  -d '{
    "media_id": "c1a9320e-6f81-4f11-9a40-3b4781423855",
    "title": "Cyberpunk Neon Tokyo Night Walk 🏙️",
    "description": "Rainy neon vibes in Shinjuku alleys with retro synth sound.",
    "media_type": "short",
    "duration": 30,
    "stream_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "thumbnail_url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    "uploader_name": "NeonTraveler",
    "tags": "tokyo,neon,aesthetic,shorts"
  }' > /dev/null

# Seed Music Track 1
curl -s -X POST "$GATEWAY_URL/api/v1/catalog/sync" \
  -H "Content-Type: application/json" \
  -d '{
    "media_id": "c1a9320e-6f81-4f11-9a40-3b4781423856",
    "title": "Midnight Chill Beats to Relax & Code to",
    "description": "Smooth lo-fi chillhop production with vinyl crackle and ambient piano.",
    "media_type": "music",
    "artist": "Lofi Dreamer",
    "duration": 210,
    "stream_url": "https://actions.google.com/sounds/v1/weather/rain_heavy.ogg",
    "thumbnail_url": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80",
    "uploader_name": "LofiRecords",
    "tags": "lofi,chill,beats,relax"
  }' > /dev/null

# Seed Music Track 2
curl -s -X POST "$GATEWAY_URL/api/v1/catalog/sync" \
  -H "Content-Type: application/json" \
  -d '{
    "media_id": "c1a9320e-6f81-4f11-9a40-3b4781423857",
    "title": "Synthesizer Sunset",
    "description": "Upbeat 80s retrowave synth track with driving bassline and analog drums.",
    "media_type": "music",
    "artist": "Outrun 1984",
    "duration": 245,
    "stream_url": "https://actions.google.com/sounds/v1/scifi/ambience_creepy_metallic.ogg",
    "thumbnail_url": "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
    "uploader_name": "RetroWave",
    "tags": "synthwave,retrowave,80s,electronic"
  }' > /dev/null

# Index into OpenSearch
echo "Indexing sample data into OpenSearch..."
curl -s -X POST "$GATEWAY_URL/api/v1/search/index" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "c1a9320e-6f81-4f11-9a40-3b4781423851",
    "title": "Big Buck Bunny - 4K Animated Film",
    "description": "The classic open-source 4K animation featuring Big Buck Bunny.",
    "media_type": "video",
    "duration": 596,
    "stream_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "thumbnail_url": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
    "uploader_name": "Blender Foundation",
    "tags": "animation,4k,blender,movie"
  }' > /dev/null

curl -s -X POST "$GATEWAY_URL/api/v1/search/index" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "c1a9320e-6f81-4f11-9a40-3b4781423854",
    "title": "Subway Surfers Trickshot Compilation 🔥",
    "description": "Insane high score run and parkour stunts in vertical format!",
    "media_type": "short",
    "duration": 45,
    "stream_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "thumbnail_url": "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80",
    "uploader_name": "GamingPro",
    "tags": "shorts,gaming,viral,trickshot"
  }' > /dev/null

curl -s -X POST "$GATEWAY_URL/api/v1/search/index" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "c1a9320e-6f81-4f11-9a40-3b4781423856",
    "title": "Midnight Chill Beats to Relax & Code to",
    "description": "Smooth lo-fi chillhop production with vinyl crackle.",
    "media_type": "music",
    "artist": "Lofi Dreamer",
    "duration": 210,
    "stream_url": "https://actions.google.com/sounds/v1/weather/rain_heavy.ogg",
    "thumbnail_url": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80",
    "uploader_name": "LofiRecords",
    "tags": "lofi,chill,beats,relax"
  }' > /dev/null

echo "=========================================="
echo " Seeding completed successfully!          "
echo " Streamly is ready to stream at:          "
echo " Frontend:    http://localhost:3000       "
echo " API Gateway: http://localhost:8080       "
echo "=========================================="
