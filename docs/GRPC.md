# Streamly gRPC Microservices Inter-Service Communication 🚀

Streamly utilizes **gRPC (HTTP/2 + Protocol Buffers)** for high-throughput, low-latency **East-West inter-service communication** between backend microservices, while exposing HTTP/REST and GraphQL for North-South client access.

---

## 🏛️ gRPC Architecture & Ports

```mermaid
flowchart TD
    subgraph Clients ["Client Layer"]
        Browser["Next.js Web Client (:3000)"]
    end

    subgraph Gateways ["Public Ingress & Gateway Layer"]
        Gateway["Go API Gateway (:8080)"]
        GraphQL["Go GraphQL Service (:8085)"]
    end

    subgraph GRPCServices ["Backend Microservices (gRPC Enabled)"]
        MediaSvc["Media Service\nHTTP: :8081 (HTTP 206 Stream)\ngRPC: :50051"]
        CatalogSvc["Catalog Service\nHTTP: :8082\ngRPC: :50052"]
        SearchSvc["Search Service\nHTTP: :8083\ngRPC: :50053"]
        UserSvc["User Service\nHTTP: :8084\ngRPC: :50054"]
    end

    Browser -->|HTTP Range Requests| Gateway
    Gateway -->|HTTP 206 Streaming| MediaSvc
    Browser -->|GraphQL Queries| GraphQL

    %% gRPC Inter-Service Communication (East-West)
    GraphQL ==>|gRPC :50051 (GetMedia)| MediaSvc
    GraphQL ==>|gRPC :50052 (Feed/Trending/Comments)| CatalogSvc
    GraphQL ==>|gRPC :50053 (Search/Suggest)| SearchSvc
    GraphQL ==>|gRPC :50054 (GetUser)| UserSvc

    MediaSvc ==>|gRPC :50053 (IndexMedia)| SearchSvc
    CatalogSvc ==>|gRPC :50051 (ListMedia)| MediaSvc
    SearchSvc ==>|gRPC :50051 (ListMedia/Reindex)| MediaSvc
```

---

## 📡 gRPC Service Port Allocations

| Microservice | gRPC Port | HTTP Port | Primary gRPC Methods | Proto Definition |
| :--- | :--- | :--- | :--- | :--- |
| **`media-service`** | `:50051` | `:8081` | `GetMedia`, `ListMedia`, `DeleteMedia` | [proto/media/media.proto](file:///Users/apple/Workspace/Streamly/proto/media/media.proto) |
| **`catalog-service`** | `:50052` | `:8082` | `GetCatalogItem`, `GetFeed`, `GetTrending`, `RecordView`, `ToggleLike`, `GetComments`, `AddComment` | [proto/catalog/catalog.proto](file:///Users/apple/Workspace/Streamly/proto/catalog/catalog.proto) |
| **`search-service`** | `:50053` | `:8083` | `Search`, `Suggest`, `IndexMedia`, `DeleteIndex`, `ReindexAll` | [proto/search/search.proto](file:///Users/apple/Workspace/Streamly/proto/search/search.proto) |
| **`user-service`** | `:50054` | `:8084` | `GetUser`, `ValidateToken` | [proto/user/user.proto](file:///Users/apple/Workspace/Streamly/proto/user/user.proto) |

---

## 🔄 Dual-Stack Design (gRPC + HTTP)

Streamly implements a **Dual-Stack pattern** for optimal performance:
1. **HTTP/REST (Port 8081-8084)**:
   - Reserved for operations that require native browser support, specifically **RFC 7233 HTTP 206 Partial Content (Byte Range Requests)** so HTML5 video and audio players can seek forward/backward instantly.
   - Multipart file uploads up to 500MB via standard HTTP `multipart/form-data`.
2. **gRPC (Port 50051-50054)**:
   - Used for **100% of inter-service calls**:
     - When `media-service` processes an upload, it notifies `search-service` via `search.SearchService/IndexMedia` over binary HTTP/2 gRPC.
     - When `catalog-service` syncs content, it queries `media.MediaService/ListMedia` over gRPC.
     - When `graphql-service` resolves queries, mutations, or nested fields (`uploader`, `comments`), it calls the downstream microservices via gRPC stubs.

---

## 🛠️ Testing gRPC Endpoints with `grpcurl`

Install `grpcurl` or use Postman's gRPC client:

### 1. Query Media via gRPC (`:50051`)
```bash
grpcurl -plaintext -d '{"id": "c1a9320e-6f81-4f11-9a40-3b4781423851"}' \
  localhost:50051 media.MediaService/GetMedia
```

### 2. Query Feed from Catalog Service (`:50052`)
```bash
grpcurl -plaintext -d '{"media_type": "video", "page": 1, "limit": 5}' \
  localhost:50052 catalog.CatalogService/GetFeed
```

### 3. OpenSearch Autocomplete Suggestions via Search Service (`:50053`)
```bash
grpcurl -plaintext -d '{"query": "big", "limit": 5}' \
  localhost:50053 search.SearchService/Suggest
```

### 4. Fetch User Profile from User Service (`:50054`)
```bash
grpcurl -plaintext -d '{"id": "streamly_user"}' \
  localhost:50054 user.UserService/GetUser
```

---

## 📁 Protocol Buffer Schema Files

- **Media Proto**: [proto/media/media.proto](file:///Users/apple/Workspace/Streamly/proto/media/media.proto)
- **Catalog Proto**: [proto/catalog/catalog.proto](file:///Users/apple/Workspace/Streamly/proto/catalog/catalog.proto)
- **Search Proto**: [proto/search/search.proto](file:///Users/apple/Workspace/Streamly/proto/search/search.proto)
- **User Proto**: [proto/user/user.proto](file:///Users/apple/Workspace/Streamly/proto/user/user.proto)
