# DEADLINE - Developer Command Center

[![Django](https://img.shields.io/badge/Django-5.1-092E20?style=flat&logo=django)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-64%2F64%20Passing-success?style=flat)]()
[![Railway](https://img.shields.io/badge/Deployed-Railway-blueviolet?style=flat&logo=railway)](https://deadline-production.up.railway.app)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat&logo=vercel)](https://deadline-demo.vercel.app)

**DEADLINE** is a full-stack developer command center that centralizes environment variables, reusable prompts, and documentation links across multiple workspaces and environments. Built with modern technologies and enterprise-grade security.

---

## Live Demo

- **Frontend:** [https://deadline-demo.vercel.app](https://deadline-demo.vercel.app)
- **Backend API:** [https://deadline-production.up.railway.app/api/v1/](https://deadline-production.up.railway.app/api/v1/)
- **API Docs:** [https://deadline-production.up.railway.app/api/v1/schema/](https://deadline-production.up.railway.app/api/v1/schema/)

![DEADLINE Dashboard](https://via.placeholder.com/1200x600/1a1b26/ffffff?text=DEADLINE+Dashboard+Screenshot)

---

## Key Features

### **Security First**

- **Firebase Authentication** (Email/Password + Google OAuth)
- **Workspace Isolation** - Users can only access their own data
- **Masked ENV Variables** - Values hidden by default with explicit reveal
- **Immutable Audit Logs** - Track every ENV_VAR reveal (user, IP, timestamp)
- **Rate Limiting** - 10 reveals/minute, 60 searches/hour per user

### **Workspace Management**

- **Multi-Workspace Support** - Organize projects separately
- **Environment Separation** - DEV, STAGING, PROD per workspace
- **Tagging & Search** - Quick artifact lookups
- **Import/Export** - Backup and share workspace data

### **Artifact Types**

- **ENV_VAR** - Secure environment variable storage
- **PROMPT** - Reusable engineering prompts and templates
- **DOC_LINK** - Centralized documentation hub

### **Developer Experience**

- **Responsive UI** - Built with Next.js 15 App Router + Tailwind CSS 4
- **Type-Safe** - Full TypeScript coverage
- **OpenAPI Docs** - Interactive API documentation with Swagger/ReDoc
- **Showcase Templates** - Pre-populated demo workspaces for quick start

---

## Tech Stack

### Backend

- **Django 5.1** + Django REST Framework
- **PostgreSQL** (Railway) / SQLite (local dev)
- **Firebase Admin SDK** for authentication
- **drf-spectacular** for OpenAPI/Swagger docs
- **Gunicorn** + **WhiteNoise** for production
- **Railway** deployment

### Frontend

- **Next.js 15** with App Router + React 19
- **TypeScript 5** - Strict mode enabled
- **Tailwind CSS 4** - Utility-first styling
- **Axios** - API client with interceptors
- **Firebase SDK** - Client-side authentication
- **Vercel** deployment

### DevOps & Tooling

- **Nixpacks** build system
- **GitHub Actions** CI/CD (optional)
- **ESLint** + **Prettier** code formatting
- **pytest** backend testing (64 tests passing)

---

## Documentation

Developer guides live in [`docs/development/`](./docs/development/):

- **[Getting Started](./docs/development/getting-started.md)** - Local development setup
- **[Testing Guide](./docs/development/testing.md)** - Quality gates and manual QA
- **[Architecture Overview](./docs/development/architecture.md)** - System design and patterns
- **[AI Guidelines](./docs/development/ai-guidelines.md)** - Collaboration practices for AI coding partners

## 🚀 Quick Start

### Prerequisites

- Python 3.12+ (backend)
- Node.js 20+ (frontend)
- Firebase project with Authentication enabled
- PostgreSQL (optional for local dev)

### Backend Setup

```bash
cd capstone-server
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Firebase credentials
python manage.py migrate
python manage.py runserver
```

**API:** <http://127.0.0.1:8000/api/v1/>

### Frontend Setup

```bash
cd capstone-client
npm install
cp .env.example .env.local
# Edit .env.local: NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
npm run dev
```

**App:** <http://localhost:3000>

> **Note:** Firebase config is fetched automatically from the backend's `/api/v1/auth/config/` endpoint.

---

## Testing

### Backend Tests

```bash
cd capstone-server
python manage.py test
```

**Result:** 64/64 tests passing

### Frontend Quality

```bash
cd capstone-client
npm run lint      # ESLint: 0 errors
npm run typecheck # TypeScript: 0 errors
npm run build     # Production build: Success
```

---

## Use Cases

- **Development Teams:** Centralize ENV variables across microservices
- **Engineering Onboarding:** Share reusable prompts and code templates
- **Documentation Hub:** Organize API docs, wikis, and guides
- **Multi-Environment Management:** Separate DEV/STAGING/PROD configurations
- **Audit Compliance:** Track access to sensitive environment variables

## Architecture

```
┌─────────────────┐      HTTPS/REST      ┌──────────────────┐
│                 │◄────────────────────►│                  │
│  Next.js 15     │                      │  Django 5.1 API  │
│  (Vercel)       │   Firebase Auth      │  (Railway)       │
│                 │◄────────────────────►│                  │
└─────────────────┘                      └──────────────────┘
        │                                         │
        │                                         ├─► PostgreSQL
        ▼                                         │
  ┌──────────┐                                    ├─► Firebase Admin SDK
  │ Firebase │◄───────────────────────────────────┘
  │   Auth   │         Token Verification
  └──────────┘
```

### Key Design Decisions

- **Monorepo Structure** - Shared root with separate client/server directories
- **Firebase for Auth** - Token-based authentication, no session management
- **Workspace Isolation** - All queries scoped to `owner_uid` from Firebase token
- **Dynamic Firebase Config** - Frontend fetches config from backend API (no duplication)
- **Audit Logging** - Immutable `ArtifactAccessLog` for compliance
- **Rate Limiting** - DRF throttling for reveal and search endpoints

---

## Screenshots

### Dashboard - Workspace Overview

![Dashboard](https://via.placeholder.com/800x500/1a1b26/ffffff?text=Dashboard+Screenshot)

### Workspace Detail - Artifact Management

![Workspace Detail](https://via.placeholder.com/800x500/1a1b26/ffffff?text=Workspace+Detail+Screenshot)

### API Documentation - Interactive Swagger UI

![API Docs](https://via.placeholder.com/800x500/1a1b26/ffffff?text=API+Documentation+Screenshot)

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow [Conventional Commits](https://www.conventionalcommits.org/)
- Write tests for new features (backend: 85%+ coverage goal)
- Run `npm run qa` (frontend) and `python manage.py test` (backend) before PR
- Update documentation for user-facing changes

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Omer Akben (Ozzy)**

- Website: [omerakben.com](https://omerakben.com)
- GitHub: [@omerakben](https://github.com/omerakben)
- LinkedIn: [linkedin.com/in/omerakben](https://linkedin.com/in/omerakben)

---

## Acknowledgments

- [Django](https://www.djangoproject.com/) - High-level Python web framework
- [Next.js](https://nextjs.org/) - React framework for production
- [Firebase](https://firebase.google.com/) - Authentication and real-time services
- [Railway](https://railway.app/) - Backend hosting and PostgreSQL
- [Vercel](https://vercel.com/) - Frontend hosting and edge network
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

## 📊 Project Status

- **Current Version:** 1.0.0
- **Status:** Production Ready
- **Last Updated:** October 24, 2025
- **Maintenance:** Active

---

## Links

- **Live Demo:** [https://deadline-demo.vercel.app](https://deadline-demo.vercel.app)
- **API Documentation:** [https://deadline-production.up.railway.app/api/v1/schema/](https://deadline-production.up.railway.app/api/v1/schema/)
- **Issue Tracker:** [GitHub Issues](https://github.com/omerakben/deadline/issues)
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)

---

**Built with ❤️ by Omer Akben**
