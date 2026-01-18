# 🚀 ContactShip Mini

**A scalable, production-ready NestJS microservice for intelligent lead management.**

ContactShip Mini is a backend microservice built with **clean architecture principles**, designed to handle lead management with AI-powered enrichment and automated synchronization. It demonstrates best practices in modern Node.js development, including asynchronous processing, caching strategies, and resilient job handling.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **Manual Lead Management** | Full CRUD operations for leads with validation |
| **Automated Sync** | Cron-based synchronization from Random User API with deduplication |
| **AI-Powered Summarization** | GPT-4o-mini integration for lead insights and next-action suggestions |
| **Redis Caching** | Cache-aside pattern for optimized read performance |
| **Async Job Processing** | BullMQ queues for handling long-running operations |
| **API Key Security** | Global authentication guard with flexible key extraction |

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ContactShip Mini                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │   Leads      │    │   Sync       │    │   OpenAI             │  │
│  │   Module     │    │   Module     │    │   Module             │  │
│  │              │    │              │    │                      │  │
│  │ • Controller │    │ • Cron Jobs  │    │ • GPT-4o-mini        │  │
│  │ • Service    │    │ • Scheduler  │    │ • Lead Summarization │  │
│  │ • DTOs       │    │              │    │                      │  │
│  └──────┬───────┘    └──────┬───────┘    └──────────┬───────────┘  │
│         │                   │                       │              │
│         └───────────────────┴───────────────────────┘              │
│                             │                                      │
│  ┌──────────────────────────┴──────────────────────────────────┐   │
│  │                    Leads Queue Module                        │   │
│  │                                                              │   │
│  │  ┌─────────────────┐    ┌─────────────────────────────────┐ │   │
│  │  │ Queue Service   │───▶│ Processor (WorkerHost)          │ │   │
│  │  │ • addCreateJob  │    │ • handleCreateLead              │ │   │
│  │  │ • addSummarize  │    │ • handleSummarizeLead           │ │   │
│  │  │ • getJobStatus  │    │ • Retry with exponential backoff│ │   │
│  │  └─────────────────┘    └─────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                       Infrastructure Layer                          │
│                                                                     │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────┐    │
│  │   PostgreSQL   │  │     Redis      │  │   Random User API  │    │
│  │   (Supabase)   │  │                │  │                    │    │
│  │                │  │ • Cache Store  │  │ • External Sync    │    │
│  │ • Prisma ORM   │  │ • Job Broker   │  │ • Lead Import      │    │
│  └────────────────┘  └────────────────┘  └────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Architecture Decisions

#### 🔄 Asynchronous AI Processing
The `POST /leads/:id/summarize` endpoint uses **BullMQ** to handle OpenAI requests asynchronously. This prevents HTTP timeouts on long-running AI operations and ensures the API remains responsive. Clients receive a `202 Accepted` response with a `jobId` for status tracking.

#### 💾 Cache-Aside Pattern
`GET /leads/:id` implements a **cache-aside strategy** with Redis:
1. Check Redis cache first
2. On cache miss, query PostgreSQL
3. Store result in cache with 60-second TTL

This reduces database load and improves response times for frequently accessed leads.

#### 📦 Modular Design
- **LeadsModule**: Core business logic for lead CRUD operations
- **SyncModule**: Integration logic for external API synchronization
- **LeadsQueueModule**: Job processing infrastructure
- **OpenAIModule**: AI integration layer

This separation ensures maintainability and allows independent scaling of components.

#### 🛡️ Resiliency
- **BullMQ retries** with exponential backoff (3 attempts, starting at 1s)
- **Sync logging** for audit trail and failure tracking
- **Graceful error handling** with proper status transitions

---

## 📋 Prerequisites

- **Node.js** >= 18.x
- **pnpm** (recommended) or npm
- **PostgreSQL** database (Supabase recommended)
- **Redis** instance (local or cloud)
- **OpenAI API key**

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/contactship-mini.git
cd contactship-mini
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Redis
REDIS_URL="redis://localhost:6379"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# API Security
API_KEY="your-secure-api-key"

# Server
PORT=3000
```

### 4. Run Prisma migrations

```bash
pnpm prisma migrate dev
```

### 5. Generate Prisma client

```bash
pnpm prisma generate
```

### 6. Start the development server

```bash
pnpm run start:dev
```

The server will be available at `http://localhost:3000`.

---

## 📖 API Reference

> 📘 **Interactive API docs available at:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)  
> Click "Authorize" and enter your API key to test endpoints directly.

All endpoints require the `x-api-key` header for authentication.

### Leads Endpoints

| Method | Endpoint | Description | Notes |
|--------|----------|-------------|-------|
| `POST` | `/leads` | Create a new lead | **Async** - Returns `jobId` |
| `GET` | `/leads` | List all leads | Supports `skip` & `take` pagination |
| `GET` | `/leads/:id` | Get lead by ID | **Cached** (60s TTL) |
| `DELETE` | `/leads/:id` | Delete a lead | — |

### AI Summarization

| Method | Endpoint | Description | Notes |
|--------|----------|-------------|-------|
| `POST` | `/leads/:id/summarize` | Queue AI summarization | **Async** - Returns `202 Accepted` with `jobId` |
| `GET` | `/leads/jobs/:jobId` | Check job status | Returns `state`, `progress`, `returnvalue` |

### Synchronization

| Method | Endpoint | Description | Notes |
|--------|----------|-------------|-------|
| `POST` | `/leads/sync` | Trigger manual sync | Optional `?count=N` parameter |
| `GET` | `/leads/sync/logs` | Get sync history | Optional `?limit=N` parameter |

### Request Examples

```bash
# Create a lead (async)
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"firstName": "John", "lastName": "Doe", "email": "john@example.com"}'

# AI Summarize a lead
curl -X POST http://localhost:3000/leads/{id}/summarize \
  -H "x-api-key: your-api-key"

# Check job status
curl http://localhost:3000/leads/jobs/{jobId} \
  -H "x-api-key: your-api-key"
```

---

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection URL |
| `OPENAI_API_KEY` | ✅ | OpenAI API key for GPT-4o-mini | (the model could be simply changed by customizing the `OpenAIService`)
| `API_KEY` | ✅ | API key for endpoint authentication |
| `PORT` | ❌ | Server port (default: 3000) |

---

## 🧠 Technical Challenges & Solutions

### Challenge: Long-Running AI Requests

**Problem**: OpenAI API calls can take 2-10+ seconds, causing HTTP timeouts and blocking the event loop.

**Solution**: Implemented **BullMQ job queues** to process AI requests asynchronously:
- Client receives immediate `202 Accepted` response
- Job is processed in the background by a worker
- Client can poll `/leads/jobs/:jobId` for status updates
- Lead's `aiStatus` field tracks progress (`PROCESSING` → `COMPLETED` | `FAILED`)

### Challenge: Duplicate Leads from External Sync

**Problem**: Periodic sync from Random User API could create duplicate leads.

**Solution**: Implemented a **deduplication strategy** using:
- `externalId` field with `@unique` constraint for API-sourced leads
- Prisma `upsert` operation that updates existing records instead of creating duplicates
- Source tracking (`MANUAL` vs `RANDOM_USER_API`) for data lineage

### Challenge: Database Load from Frequent Reads

**Problem**: `GET /leads/:id` could cause excessive database queries.

**Solution**: Implemented **Redis cache-aside pattern**:
- NestJS `CacheInterceptor` checks Redis first
- Cache TTL of 60 seconds balances freshness and performance
- Global cache configuration via `CacheModule.registerAsync()`

---

## 📁 Project Structure

```
src/
├── common/
│   ├── decorators/       # Custom decorators (@Public)
│   ├── guards/           # API key authentication guard
│   └── interceptors/     # Logging interceptor
├── leads/
│   ├── dto/              # CreateLeadDto, UpdateLeadDto
│   ├── entities/         # Lead entity
│   ├── leads.controller.ts
│   ├── leads.service.ts
│   └── leads.module.ts
├── leads-queue/
│   ├── leads.processor.ts
│   ├── leads-queue.service.ts
│   └── leads-queue.module.ts
├── openai/
│   ├── openai.service.ts
│   └── openai.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── random-user/
│   ├── interfaces/       # RandomUser API response types
│   ├── random-user.service.ts
│   └── random-user.module.ts
├── sync/
│   ├── sync.service.ts   # Cron job handler
│   └── sync.module.ts
├── app.module.ts
└── main.ts
```


## 📜 Scripts

| Script | Description |
|--------|-------------|
| `pnpm run start:dev` | Start in development mode with hot reload |
| `pnpm run start:prod` | Start production build |
| `pnpm run build` | Build the application |
| `pnpm run lint` | Run ESLint |
| `pnpm run format` | Format code with Prettier |
| `pnpm prisma studio` | Open Prisma database GUI |


## 👤 Author

Wenceslao Cápolo. Using NestJS, Prisma, and modern TypeScript practices.
