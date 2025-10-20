# DEADLINE - Developer Command Center

<div align="center">

![DEADLINE Banner](https://img.shields.io/badge/DEADLINE-Production%20Ready-success?style=for-the-badge)
[![Django](https://img.shields.io/badge/Django-5.1-092E20?style=flat&logo=django)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-57%2F57%20Passing-success?style=flat)]()

**A unified hub for managing development artifacts across multiple environments**

[Live Demo](#) • [Documentation](./CLAUDE.md) • [Deployment Guide](./DEPLOYMENT.md)

</div>

---

## 📋 Overview

DEADLINE is a full-stack developer command center that provides a centralized platform for managing:

- 🔐 **Environment Variables** - Secure storage with value masking
- 💬 **Code/AI Prompts** - Reusable snippets and templates
- 📚 **Documentation Links** - Organized reference library

**Built for developers, by developers** - with multi-workspace support, environment-aware organization (Dev/Staging/Prod), and Firebase authentication for secure access.

---

## ✨ Key Features

### 🏢 Workspace Management

- Multiple workspaces per user for different projects
- Environment-specific artifact organization
- Import/export functionality for backup and sharing
- Tag-based categorization and filtering

### 🔒 Security First

- Firebase authentication (Email/Password + Google OAuth)
- Workspace ownership isolation
- ENV_VAR value masking in list views
- Secure token-based API communication

### 🎨 Modern UI/UX

- Clean, responsive design with Tailwind CSS v4
- Dark mode support
- Real-time search and filtering
- Mobile-optimized interface

### ⚡ Performance

- Optimized API calls with shared state management
- Server-side rendering with Next.js 15
- PostgreSQL database with connection pooling
- CDN-delivered static assets via Vercel

---

## 🛠️ Tech Stack

### Backend

- **Framework**: Django 5.1 + Django REST Framework
- **Database**: PostgreSQL (SQLite for dev)
- **Authentication**: Firebase Admin SDK
- **API Docs**: drf-spectacular (OpenAPI 3)
- **Deployment**: Railway

### Frontend

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **Type Safety**: TypeScript 5
- **Authentication**: Firebase 12
- **Deployment**: Vercel

---

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL (optional for local dev)
- Firebase project with Authentication enabled

### Backend Setup

```bash
cd capstone-server

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Firebase credentials

# Run migrations
python manage.py migrate

# (Optional) Seed demo data
python manage.py seed_demo_data

# Start development server
python manage.py runserver
```

API will be available at: `http://127.0.0.1:8000/api/v1/`

### Frontend Setup

```bash
cd capstone-client

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Firebase config and API URL

# Start development server
npm run dev
```

App will be available at: `http://localhost:3000`

---

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Comprehensive architecture guide and development reference
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Step-by-step deployment instructions for Railway & Vercel
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** - Complete production readiness verification
- **[IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md)** - Detailed log of all enhancements and fixes

---

## 🧪 Testing

### Backend Tests

```bash
cd capstone-server
python manage.py test -v 2
```

**Status**: ✅ 57/57 tests passing

### Frontend Quality Gates

```bash
cd capstone-client
npm run lint        # ESLint (zero warnings enforced)
npm run typecheck   # TypeScript strict mode
npm run build       # Production build verification
```

**Status**: ✅ All checks passing

---

## 🏗️ Project Structure

```
deadline/
├── capstone-server/          # Django REST API backend
│   ├── deadline_api/         # Project settings & root config
│   ├── workspaces/           # Workspace models & endpoints
│   ├── artifacts/            # Artifact models & endpoints
│   └── auth_firebase/        # Firebase authentication
│
├── capstone-client/          # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Auth, Workspace)
│   │   ├── lib/             # API clients & utilities
│   │   └── types/           # TypeScript definitions
│   └── public/              # Static assets
│
└── Documentation files
```

---

## 🌟 Highlights for Recruiters

### Code Quality

- ✅ **Zero ESLint warnings** - Strict code quality enforcement
- ✅ **100% TypeScript coverage** - Full type safety
- ✅ **Comprehensive tests** - 57 backend tests, all passing
- ✅ **Clean architecture** - Separation of concerns, SOLID principles

### Modern Practices

- ✅ **Monorepo structure** - Organized codebase
- ✅ **API documentation** - OpenAPI 3 spec with Swagger UI
- ✅ **Environment management** - Proper secrets handling
- ✅ **Error boundaries** - Graceful error handling

### Production Ready

- ✅ **Deployment configs** - Railway & Vercel ready
- ✅ **Security headers** - XSS, CORS, CSP configured
- ✅ **Performance optimized** - API call reduction, caching strategy
- ✅ **Mobile responsive** - Works on all devices

### Demo Access

Try the live demo **without signup** - perfect for quick evaluation!

---

## 📸 Screenshots

<!-- Add screenshots of your app here -->

### Dashboard

![Dashboard Screenshot](docs/screenshots/dashboard.png)

### Workspace View

![Workspace Screenshot](docs/screenshots/workspace.png)

### Artifact Management

![Artifacts Screenshot](docs/screenshots/artifacts.png)

---

## 🚀 Deployment

### Production Deployment

This project is configured for deployment to:

- **Backend**: Railway (with PostgreSQL)
- **Frontend**: Vercel (with CDN)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Environment Variables

Refer to `.env.example` files in both `capstone-server` and `capstone-client` directories for required configuration.

---

## 🤝 Contributing

This is a portfolio project, but feedback and suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is part of a portfolio and is available for review and educational purposes.

---

## 👤 Author

**Omer Akben**

- Portfolio: [omerakben.com](https://omerakben.com)
- GitHub: [@omerakben](https://github.com/omerakben)
- LinkedIn: [linkedin.com/in/omerakben](https://linkedin.com/in/omerakben)

---

## 🙏 Acknowledgments

- Built as a capstone project demonstrating full-stack development skills
- Uses modern best practices for production-ready applications
- Implements enterprise-grade security and authentication patterns

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ for the developer community

</div>
