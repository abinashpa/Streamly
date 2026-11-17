# Streamly GraphQL API Documentation ⚡

Welcome to the **Streamly GraphQL API** reference guide. The GraphQL service acts as a high-performance **Backend-For-Frontend (BFF)** and **Data Aggregation Layer** built in **Go (Golang)**, aggregating data across `media-service`, `catalog-service`, `search-service`, and `user-service`.

---

## 📍 Service Endpoints

| Environment | URL | Protocol | Description |
| :--- | :--- | :--- | :--- |
| **API Gateway (Recommended)** | `http://localhost:8080/graphql` | HTTP POST | Unified entrypoint with CORS & reverse proxy |
| **API Gateway Playground** | `http://localhost:8080/graphql` | HTTP GET | In-browser interactive GraphQL Playground IDE |
| **Direct Service** | `http://localhost:8085/graphql` | HTTP POST | Direct GraphQL service port |
| **Direct Playground** | `http://localhost:8085/graphql` | HTTP GET | Direct browser playground |
| **Schema SDL** | [docs/schema.graphql](file:///Users/apple/Workspace/Streamly/docs/schema.graphql) | Text/SDL | Complete GraphQL Schema Definition Language |

---

## 🔐 Authentication

Public queries (like `feed`, `trending`, `media`, and `search`) do not require authentication.

For protected queries (such as `me`) and mutations, provide the JWT Bearer token obtained from `/api/v1/auth/login` in the standard `Authorization` header:

```http
Authorization: Bearer <your-jwt-token>
```

In **GraphQL Playground**, you can set this under the **"HTTP HEADERS"** tab in the bottom-left corner:
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📖 Queries Reference

### 1. `feed`
Fetches a paginated feed of media items. Cached in **Redis** with a 45-second TTL.

#### Arguments
- `type` (`MediaType`): Filter by `ALL`, `VIDEO`, `SHORT`, or `MUSIC` (Default: `ALL`)
- `page` (`Int`): Page number (Default: `1`)
- `limit` (`Int`): Items per page (Default: `20`, Max: `50`)

#### Query
```graphql
query GetVideoFeed {
  feed(type: VIDEO, page: 1, limit: 10) {
    id
    title
    description
    media_type
    duration
    stream_url
    thumbnail_url
    views
    likes
    uploader_name
    created_at
  }
}
```

#### Response
```json
{
  "data": {
    "feed": [
      {
        "id": "c1a9320e-6f81-4f11-9a40-3b4781423851",
        "title": "Big Buck Bunny - 4K Animated Film",
        "description": "The classic open-source 4K animation.",
        "media_type": "video",
        "duration": 596,
        "stream_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "thumbnail_url": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
        "views": 1520,
        "likes": 240,
        "uploader_name": "Blender Foundation",
        "created_at": "2026-11-14T04:20:00Z"
      }
    ]
  }
}
```

---

### 2. `trending`
Fetches top-ranked media sorted by popularity, view velocity, and likes. Cached in Redis for 60 seconds.

#### Arguments
- `type` (`MediaType`): `ALL`, `VIDEO`, `SHORT`, or `MUSIC` (Default: `ALL`)

#### Query
```graphql
query GetTrendingShorts {
  trending(type: SHORT) {
    id
    title
    artist
    views
    likes
    stream_url
    thumbnail_url
  }
}
```

---

### 3. `media` (with Nested Field Resolvers)
Retrieves a single media item by ID. Demonstrates **GraphQL Field Resolution**:
- **`comments`**: Resolves threaded discussion comments from `catalog-service`.
- **`uploader`**: Resolves the author's public channel profile from `user-service`.

#### Arguments
- `id` (`ID!`): Unique media UUID

#### Query
```graphql
query GetMediaWithChannelAndComments($id: ID!) {
  media(id: $id) {
    id
    title
    description
    media_type
    duration
    stream_url
    views
    likes
    uploader {
      id
      username
      display_name
      avatar_url
      bio
      subscribers
    }
    comments {
      id
      user_name
      user_avatar
      content
      likes
      created_at
    }
  }
}
```

#### Variables
```json
{
  "id": "c1a9320e-6f81-4f11-9a40-3b4781423851"
}
```

#### Response
```json
{
  "data": {
    "media": {
      "id": "c1a9320e-6f81-4f11-9a40-3b4781423851",
      "title": "Big Buck Bunny - 4K Animated Film",
      "description": "The classic open-source 4K animation.",
      "media_type": "video",
      "duration": 596,
      "stream_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "views": 1520,
      "likes": 240,
      "uploader": {
        "id": "usr_998127391",
        "username": "blender_official",
        "display_name": "Blender Foundation",
        "avatar_url": "https://api.dicebear.com/7.x/identicon/svg?seed=blender",
        "bio": "Official Blender Studio Open Projects channel.",
        "subscribers": 1450000
      },
      "comments": [
        {
          "id": "comm_1120489",
          "user_name": "CinemaFanatic",
          "user_avatar": "https://api.dicebear.com/7.x/identicon/svg?seed=CinemaFanatic",
          "content": "A timeless classic! Streaming in 4K looks ultra crisp.",
          "likes": 14,
          "created_at": "2026-11-14T04:22:10Z"
        }
      ]
    }
  }
}
```

---

### 4. `search`
Full-text search querying OpenSearch multi-match fields (`title^3`, `artist^2`, `tags^2`, `description`) with `AUTO` fuzziness.

#### Arguments
- `query` (`String!`): Search keywords
- `type` (`MediaType`): `ALL`, `VIDEO`, `SHORT`, or `MUSIC`
- `page` (`Int`): Page index (Default: 1)
- `limit` (`Int`): Results limit (Default: 20)

#### Query
```graphql
query SearchContent($query: String!) {
  search(query: $query, type: ALL, page: 1, limit: 10) {
    total
    took
    items {
      id
      title
      media_type
      artist
      duration
      views
    }
  }
}
```

---

### 5. `suggestions`
Fast as-you-type prefix suggestions powered by OpenSearch **Edge N-Gram analyzers**.

#### Arguments
- `query` (`String!`): Prefix string (e.g. `"lofi"`, `"elep"`)
- `limit` (`Int`): Maximum suggestions (Default: 6)

#### Query
```graphql
query GetLiveSuggestions {
  suggestions(query: "rain", limit: 4)
}
```

#### Response
```json
{
  "data": {
    "suggestions": [
      "Rain Heavy Ambient Beats",
      "Rainy Day in Shinjuku",
      "Rainbow Road Remix"
    ]
  }
}
```

---

### 6. `user` & `me`
Retrieves public creator channels or current session identity.

#### Query
```graphql
query GetCurrentUserAndCreator($creatorId: ID!) {
  me {
    id
    username
    email
    display_name
  }
  user(id: $creatorId) {
    id
    username
    display_name
    bio
    subscribers
  }
}
```

---

## ✏️ Mutations Reference

### 1. `recordView`
Atomically records a view using Redis atomic `INCR` and increments the view counter in PostgreSQL.

#### Mutation
```graphql
mutation IncrementView($mediaId: ID!) {
  recordView(mediaId: $mediaId) {
    id
    views
  }
}
```

#### Variables
```json
{
  "mediaId": "c1a9320e-6f81-4f11-9a40-3b4781423851"
}
```

---

### 2. `toggleLike`
Toggles like or unlike on a media item. Flushes catalog caches in Redis automatically.

#### Mutation
```graphql
mutation LikeMedia($mediaId: ID!, $userId: String!) {
  toggleLike(mediaId: $mediaId, userId: $userId) {
    liked
  }
}
```

#### Variables
```json
{
  "mediaId": "c1a9320e-6f81-4f11-9a40-3b4781423851",
  "userId": "usr_998127391"
}
```

---

### 3. `addComment`
Publishes a new comment to a media discussion thread.

#### Mutation
```graphql
mutation PostComment($mediaId: ID!, $content: String!, $userName: String) {
  addComment(mediaId: $mediaId, content: $content, userName: $userName) {
    id
    catalog_id
    user_name
    content
    likes
    created_at
  }
}
```

#### Variables
```json
{
  "mediaId": "c1a9320e-6f81-4f11-9a40-3b4781423851",
  "content": "The audio mixing in this song is phenomenal!",
  "userName": "Jordan Lee"
}
```

---

## 💻 Client Integration Examples

### 1. cURL
```bash
curl -X POST http://localhost:8080/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { feed(type: MUSIC, limit: 3) { id title artist duration } }"
  }'
```

### 2. TypeScript / JavaScript `fetch`
```typescript
interface MediaItem {
  id: string;
  title: string;
  artist?: string;
  views: number;
}

async function fetchTrendingMusic(): Promise<MediaItem[]> {
  const query = `
    query TrendingMusic {
      trending(type: MUSIC) {
        id
        title
        artist
        views
      }
    }
  `;

  const res = await fetch("http://localhost:8080/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const { data, errors } = await res.json();
  if (errors) {
    throw new Error(errors[0].message);
  }
  return data.trending;
}
```

### 3. Apollo Client Setup (React / Next.js)
```typescript
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

export const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:8080/graphql",
  cache: new InMemoryCache(),
});

export const GET_FEED_QUERY = gql`
  query GetFeed($type: MediaType, $page: Int) {
    feed(type: $type, page: $page) {
      id
      title
      thumbnail_url
      duration
      views
    }
  }
`;
```

---

## ⚡ Performance Architecture

1. **Redis Caching**: Top-level feed queries and trending lists resolve against Redis in $\mathcal{O}(1)$ time.
2. **OpenSearch Edge N-Gram Analyzers**: Autocomplete suggestions execute in sub-10ms latency using pre-computed prefix tokens.
3. **Independent Async Network Calls**: Service-to-service resolvers communicate over the isolated Docker bridge network (`streamly-net`), ensuring secure and fast internal resolution.
