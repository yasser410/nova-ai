# 🌟 Nova AI Platform

**Enterprise-grade AI Platform with Multi-Agent Architecture, Voice Integration, and Extensible Tools**

Developed by: **الحاج ياسر (Hajj Yasser)**

## Overview

Nova is not just another chatbot. It's a production-ready AI platform featuring:

- 🤖 **Multi-Agent System** - 200+ extensible AI agents
- 🎙️ **Voice Engine** - Speech-to-Text, Text-to-Speech, Voice Cloning (with consent)
- 🔧 **Tool Registry** - 200+ extensible tools
- 🧠 **Memory System** - Conversation, User, Project, Long-term memory
- 🌐 **Multi-Provider Support** - OpenAI, Anthropic, Google Gemini, Ollama, Local Models
- 📱 **Cross-Platform** - Web (PWA), iOS, Android, macOS, Windows, Linux
- 🔐 **Enterprise Security** - Auth, Authorization, Rate Limiting, Sandboxing
- 🏗️ **Scalable Architecture** - REST API, WebSocket, MCP support

## Project Structure

```
nova-ai/
├── packages/
│   ├── types/              # Shared TypeScript types
│   ├── core/               # Nova Core Engine
│   ├── backend/            # Node.js API Server
│   └── frontend/           # React Web Application
├── docs/                   # Documentation
├── docker-compose.yml      # Local development setup
├── package.json            # Monorepo configuration
└── README.md
```

## Phase Timeline

- **Phase 1**: Nova Core + Chat + Provider Abstraction + Basic UI
- **Phase 2**: Agents + Tools + Memory System
- **Phase 3**: VoiceStudio Integration (STT, TTS, Voice Conversation)
- **Phase 4**: Translation + File Processing + OCR
- **Phase 5**: GitHub Agent + Coding Agent
- **Phase 6**: App Builder Agent
- **Phase 7**: Marketplace + Admin Panel + Projects
- **Phase 8**: PWA + Desktop + Mobile Packaging

## Getting Started

```bash
# Install dependencies
npm run setup

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Technologies

### Frontend
- React 18+ with TypeScript
- Next.js (optional for SSR)
- Tailwind CSS
- Zustand (State Management)
- React Query (Data Fetching)

### Backend
- Node.js with Express.js
- TypeScript
- PostgreSQL with Prisma ORM
- Redis (Caching & Queues)
- Docker & Docker Compose

### AI & Voice
- Provider Abstraction Layer
- OpenAI, Anthropic, Google Gemini APIs
- Ollama for Local Models
- VoiceStudio Adapter
- Web Audio API

## Features by Phase

### Phase 1 (Current)
- ✅ Nova Core architecture
- ✅ Provider abstraction (OpenAI, Anthropic, Gemini, Ollama)
- ✅ Basic chat interface
- ✅ Conversation memory
- ✅ Error handling & logging
- ✅ API structure

### Phase 2 (In Progress)
- 🔄 25 core agents
- 🔄 Tool registry system
- 🔄 Memory layer (conversation, user, project)
- 🔄 Agent marketplace UI

### Phase 3 (Planned)
- 📅 VoiceStudio integration
- 📅 Speech-to-Text
- 📅 Text-to-Speech
- 📅 Real-time voice conversation mode

### Phase 4 (Planned)
- 📅 Translation Agent
- 📅 PDF/Document processing
- 📅 OCR capabilities
- 📅 File upload & analysis

### Phase 5 (Planned)
- 📅 GitHub authentication & integration
- 📅 Repository analysis
- 📅 Code review capabilities
- 📅 Pull request generation

### Phase 6 (Planned)
- 📅 App Builder Agent
- 📅 Frontend generation
- 📅 Backend scaffolding
- 📅 Database schema creation

### Phase 7 (Planned)
- 📅 Agent Marketplace
- 📅 Tool Marketplace
- 📅 Admin Dashboard
- 📅 Project Management

### Phase 8 (Planned)
- 📅 PWA configuration
- 📅 Desktop app (Electron)
- 📅 Mobile apps (React Native)

## Development Status

| Component | Status | Notes |
|-----------|--------|-------|
| Nova Core | ✅ DONE | Provider abstraction, conversation handling |
| Backend API | ✅ DONE | REST endpoints, database schema |
| Frontend UI | 🔄 IN PROGRESS | Chat interface, basic layout |
| Agents System | 🔄 IN PROGRESS | Registry, execution engine |
| Voice Engine | ⏸️ BLOCKED | Awaiting VoiceStudio API documentation |
| GitHub Integration | ⏸️ BLOCKED | Awaiting OAuth setup |
| Admin Panel | ⏸️ BLOCKED | Awaiting Phase 7 |

## API Documentation

```
Base URL: http://localhost:3001/api

Endpoints:
POST   /chat              - Send message and get response
GET    /agents            - List available agents
GET    /tools             - List available tools
POST   /agents/:id/run    - Execute specific agent
POST   /tools/:id/run     - Execute specific tool
GET    /conversation/:id  - Get conversation history
DELETE /conversation/:id  - Clear conversation
POST   /memory/:type      - Save to memory
GET    /memory/:type      - Retrieve from memory
```

## Environment Variables

Create `.env.local`:

```env
# Backend
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/nova
REDIS_URL=redis://localhost:6379

# AI Providers
OPENAI_API_KEY=sk_...
ANTHROPIC_API_KEY=sk_...
GOOGLE_GEMINI_KEY=...
OLLAMA_BASE_URL=http://localhost:11434

# Voice
VOICESTUDIO_API_KEY=...
VOICESTUDIO_BASE_URL=...

# Security
JWT_SECRET=your_secret_key
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=15m

# Frontend
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## Security Features

- ✅ Input validation & sanitization
- ✅ Rate limiting per user/IP
- ✅ SSRF protection
- ✅ Sandboxed tool execution
- ✅ Secrets management (no API keys in frontend)
- ✅ JWT authentication
- ✅ Audit logging for sensitive operations
- ✅ CORS configuration

## Performance Targets

- API response time: < 200ms (excluding AI processing)
- Chat message processing: < 5s (with streaming)
- Voice recognition: < 2s
- Voice generation: < 3s
- UI load time: < 1.5s

## Contributing

This is currently a solo project by الحاج ياسر. For contributions, please open an issue first to discuss changes.

## License

MIT - See LICENSE file

## Support

For issues, feature requests, or questions, please open a GitHub issue.

---

**Made with ❤️ by الحاج ياسر**
