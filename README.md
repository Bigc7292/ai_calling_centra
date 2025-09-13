# 🚀 AI Calling Center Platform

A comprehensive AI-powered calling and communication platform built with modern web technologies, designed for enterprise and customer engagement use cases.

## 🎯 Project Overview

**AI Calling Center** is a centralized platform that leverages AI for automated calling operations with multi-tenant architecture support. The platform provides comprehensive analytics, contact management, and real-time monitoring capabilities.

### 🌟 Key Features

- **📊 Real-time Analytics Dashboard** - Monitor call performance, meeting bookings, and cost metrics
- **👥 Multi-tenant Architecture** - Secure isolation for multiple organizations
- **🤖 AI-Powered Automation** - Intelligent call routing and assistant management
- **📍 Geographic Visualization** - Interactive maps showing meeting locations
- **📈 Performance Monitoring** - Detailed KPIs for campaigns, assistants, and agents
- **🔐 Enterprise Authentication** - Secure user management with role-based access
- **🌍 Supabase MCP Integration** - Direct AI assistant database interaction

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Express.js with TypeScript (ESM)
- **Database**: Supabase (PostgreSQL-based)
- **Authentication**: Supabase Auth with JWT
- **Build System**: PNPM Workspaces (Monorepo)
- **Deployment**: Google Cloud Platform
- **AI Integration**: Supabase MCP Server

### Project Structure

```
ai_calling_centra/
├── 📱 apps/
│   └── frontend/          # Next.js frontend application
│       ├── src/app/       # App Router pages
│       ├── components/    # Reusable components
│       └── lib/          # Utilities and client configs
├── 🔧 services/
│   └── core-api/         # Express.js backend API
│       ├── src/routes/   # API route handlers
│       └── auth.ts       # Authentication middleware
├── 📦 packages/
│   ├── types/            # Shared TypeScript interfaces
│   ├── config/           # Shared configuration
│   └── ui/               # Shared UI components
├── 🗄️ supabase/
│   └── schema.sql        # Database schema and policies
├── 🤖 scripts/
│   ├── quick-setup.js    # User bootstrap script
│   └── setup-mcp.js      # MCP configuration script
└── 🔐 Security Files
    ├── .env.example      # Environment template
    ├── .gitignore        # Git exclusions
    └── mcp-config.json   # MCP client configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **PNPM** package manager
- **Supabase Account** with project created
- **Google Cloud Account** (for deployment)

### 1. Clone Repository

```bash
git clone https://github.com/your-username/ai-calling-center.git
cd ai-calling-center
```

### 2. Install Dependencies

```bash
# Enable corepack and setup pnpm
corepack enable
corepack prepare pnpm@latest --activate

# Install all dependencies
pnpm install
```

### 3. Environment Configuration

#### Root Environment (`.env`)

```bash
# Copy the example file
cp .env.example .env

# Edit with your Supabase credentials
nano .env
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role secret key
- `SUPABASE_ACCESS_TOKEN` - Personal access token for MCP

#### Frontend Environment (`apps/frontend/.env.local`)

```bash
# Copy the frontend example
cp apps/frontend/.env.example apps/frontend/.env.local

# Add your public Supabase keys
nano apps/frontend/.env.local
```

### 4. Database Setup

1. **Apply Schema**: Copy `supabase/schema.sql` and run it in your Supabase SQL Editor
2. **Configure RLS**: The schema includes Row Level Security policies
3. **Bootstrap User**: Run the setup script to create your admin user

```bash
# Start the services
pnpm dev:all

# In another terminal, bootstrap the admin user
node scripts/quick-setup.js
```

### 5. Development

```bash
# Start all services in development mode
pnpm dev:all
```

This will start:
- 🖥️ **Frontend**: http://localhost:3000
- 🔌 **API**: http://localhost:3001

## 🔧 Configuration

### Supabase MCP Integration

This project includes advanced AI integration through Supabase MCP (Model Context Protocol):

1. **Generate Personal Access Token**:
   - Visit: https://supabase.com/dashboard/account/tokens
   - Create token: "AI Assistant MCP Server"
   - Add to `.env`: `SUPABASE_ACCESS_TOKEN=your_token`

2. **Configure MCP Client**:
   - Use the provided `mcp-config.json` template
   - Works with Claude Desktop, Cursor, and other MCP clients

3. **Capabilities**:
   - Direct database querying through AI assistants
   - TypeScript type generation
   - Schema inspection and debugging
   - Read-only safety by default

### Google Cloud Deployment

The project is optimized for Google Cloud deployment:

```bash
# Build for production
pnpm build

# Deploy to Google Cloud
gcloud builds submit --config cloudbuild.yaml .
```

## 🎛️ Usage

### Admin Dashboard

Navigate to `/dashboard` to access:
- **Daily Activity Charts** - Call volume and meeting bookings
- **Campaign Performance** - ROI and cost analysis
- **Agent Leaderboards** - Performance rankings
- **Geographic Insights** - Meeting location mapping

### API Endpoints

The core API provides:

- `GET /analytics/daily` - Daily performance metrics
- `GET /analytics/campaigns` - Campaign KPIs
- `GET /analytics/agents` - Agent performance data
- `GET /contacts` - Contact management
- `POST /tenants/bootstrap` - User onboarding

### Authentication Flow

1. **Sign Up/Login** via Supabase Auth
2. **Tenant Assignment** through bootstrap process
3. **Role-based Access** (AGENT, ADMIN, OWNER)
4. **Secure API Access** with JWT validation

## 🔐 Security

### Environment Variables

**NEVER commit sensitive data!** All secrets are:
- ✅ Excluded via `.gitignore`
- ✅ Documented in `.env.example`
- ✅ Secured through Supabase RLS policies

### Access Control

- **Row Level Security** enforces tenant isolation
- **JWT Authentication** validates all API requests
- **Role-based Permissions** control feature access
- **MCP Read-only Mode** prevents accidental data modification

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch
3. **Follow** TypeScript best practices
4. **Test** all changes thoroughly
5. **Submit** a pull request

### Code Standards

- **TypeScript** strict mode enabled
- **ESLint** for code quality
- **Prettier** for formatting
- **Conventional Commits** for changelog

## 📚 Documentation

### Key Components

- **AuthGate** - Protected route wrapper
- **Dashboard** - Analytics visualization
- **MeetingGeoMap** - Geographic data display
- **Analytics Router** - API data aggregation

### Database Schema

The platform uses a multi-tenant PostgreSQL schema with:
- **Users & Profiles** - Identity management
- **Tenants & Members** - Organization structure
- **Contacts & Campaigns** - Business data
- **Analytics Views** - Performance aggregation

## 🚀 Deployment

### Google Cloud Platform

The project includes deployment configurations for:
- **Cloud Run** - Serverless container deployment
- **Cloud Build** - Automated CI/CD pipeline
- **Cloud SQL** - Managed database options

### Environment Variables for Production

Set these in your deployment environment:
- `SUPABASE_URL` - Production Supabase project
- `SUPABASE_SERVICE_ROLE_KEY` - Production service key
- `WEB_BASE_URL` - Your production domain
- `PORT` - Container port (defaults to 3001)

## 📞 Support

### Getting Help

- **Documentation**: Check this README and code comments
- **Issues**: Submit GitHub issues for bugs
- **Discussions**: Use GitHub Discussions for questions
- **MCP Integration**: See `mcp-github-oauth-setup.md` for troubleshooting

### Common Issues

1. **Build Failures**: Ensure all environment variables are set
2. **Auth Errors**: Verify Supabase credentials and RLS policies
3. **MCP Issues**: Check Personal Access Token validity
4. **Port Conflicts**: Default ports are 3000 (frontend) and 3001 (API)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** - Backend-as-a-Service platform
- **Next.js** - React framework
- **TypeScript** - Type safety
- **Recharts** - Data visualization
- **MCP Community** - AI integration protocol

---

**Built with ❤️ for enterprise communication solutions**

### 🏷️ Tags
`ai` `calling-center` `supabase` `nextjs` `typescript` `multi-tenant` `analytics` `mcp` `google-cloud`