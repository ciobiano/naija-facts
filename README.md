# Naija Facts 🇳🇬

A modern, mobile-first educational platform celebrating Nigerian cultural heritage through interactive quizzes and community-contributed content.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

## ✨ Features

### 🎯 **Adaptive Quiz System** ✅ **COMPLETE**
- **Chapter-based navigation** with progress tracking
- **Multiple question types**: Multiple choice, true/false, short answer
- **AI-powered adaptive difficulty** that adjusts to user performance
- **Real-time feedback** with detailed explanations
- **Comprehensive analytics** and performance insights
- **Cross-device progress persistence**
- **Offline capability** for mobile users

### 🏛️ **Cultural Content Management** ✅ **COMPLETE**
- **Image gallery** with responsive grid/list views
- **Upload system** with drag-and-drop interface and UploadThing integration
- **Cloud storage** with CDN optimization
- **Advanced search & filtering** by region, date, views, and keywords
- **Download & sharing** capabilities with usage analytics
- **Metadata extraction** and management
- **Complete API routes** for CRUD operations

### 🔐 **Authentication & User Management** ✅ **COMPLETE**
- **Email/password authentication** with secure registration
- **OAuth integration** (Google, GitHub)
- **Comprehensive profile management** dashboard
- **Session management** with security best practices
- **Rate limiting** and CSRF protection
- **Account lockout** protection
- **Email verification** and password reset flows

### 🎨 **Mobile-First Design** ✅ **COMPLETE**
- **Responsive design** optimized for all device sizes
- **Nigerian cultural aesthetics** with custom design system
- **WCAG 2.1 accessibility** compliance
- **Progressive Web App** features
- **Touch-optimized** interactions
- **Performance-optimized** animations

### 🚀 **Performance & Infrastructure** ✅ **COMPLETE**
- **Next.js 15** with React 18
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL
- **Redis caching** for performance
- **Comprehensive middleware** for security and rate limiting
- **3G network optimization**

## 🏗️ **Tech Stack**

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - High-quality component library
- **Framer Motion** - Smooth animations
- **SWR** - Data fetching and caching

### **Backend**
- **Next.js API Routes** - Server-side logic
- **Prisma ORM** - Database operations
- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **NextAuth.js** - Authentication
- **UploadThing** - File upload and storage

### **Infrastructure**
- **Vercel** - Deployment platform
- **Vercel Postgres** - Managed database
- **Vercel Redis** - Managed cache
- **UploadThing** - File storage and CDN

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and pnpm
- PostgreSQL database
- Redis instance (optional, for caching)

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/your-username/naija-facts.git
cd naija-facts
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Configure the following required variables:
```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
GITHUB_ID="your-github-app-id"
GITHUB_SECRET="your-github-app-secret"

# File Upload
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Redis (optional, for caching)
REDIS_URL="redis://..."
```

4. **Set up the database**
```bash
pnpm db:push
pnpm db:seed
```

5. **Start the development server**
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 **Project Structure**

```
naija-facts/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── cultural-content/  # Cultural gallery
│   ├── profile/           # User profile management
│   └── quiz/              # Quiz system
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn UI components
│   ├── auth/             # Authentication components
│   └── sections/         # Page-specific sections
├── hooks/                 # Custom React hooks
├── lib/                  # Utility functions and configurations
│   ├── auth/             # Authentication utilities
│   ├── database/         # Database queries
│   └── upload/           # File upload utilities
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── styles/               # Global styles
└── types/                # TypeScript type definitions
```

## 🧪 **Testing**

```bash
# Run unit tests
pnpm test

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## 📦 **Database**

The project uses Prisma with PostgreSQL. Key models include:

- **Profile** - User accounts and profile information
- **Quiz** - Quiz definitions and metadata
- **Question** - Quiz questions with multiple types
- **UserProgress** - Progress tracking and analytics
- **CulturalImage** - Cultural content management
- **Achievement** - Gamification system

### **Database Commands**
```bash
# Generate Prisma client
pnpm db:generate

# Push schema changes
pnpm db:push

# Run migrations
pnpm db:migrate

# Seed the database
pnpm db:seed

# Reset database
pnpm db:reset
```

## 🔧 **Development**

### **Code Quality**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Husky** - Git hooks

### **Scripts**
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run linter
pnpm type-check   # TypeScript checking
pnpm db:studio    # Open Prisma Studio
```

## 🚀 **Deployment**

### **Vercel (Recommended)**

1. **Connect your repository** to Vercel
2. **Configure environment variables** in the Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### **Environment Variables for Production**
Ensure all required environment variables are set:
- Database connection strings
- Authentication secrets
- File upload configurations
- Redis connection (optional)

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Process**
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Code Standards**
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add tests for new features
- Follow the existing project structure

## 📋 **Project Status**

### **✅ Completed Features**
- [x] Project foundation and infrastructure
- [x] Database schema and models
- [x] Complete authentication system
- [x] Adaptive quiz system
- [x] Cultural content management
- [x] Mobile-first responsive design
- [x] Performance optimization

### **🚧 In Progress**
- [ ] Gamification system
- [ ] Internationalization (i18n)
- [ ] AI integration for enhanced learning
- [ ] Admin dashboard
- [ ] Content seeding

### **📝 Planned Features**
- [ ] Multi-language support (6 languages)
- [ ] Advanced analytics dashboard
- [ ] Social features and sharing
- [ ] Offline-first capabilities
- [ ] Mobile app versions

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 **Support**

- **Documentation**: [docs.naijafacts.com](https://docs.naijafacts.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/naija-facts/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/naija-facts/discussions)

## 🙏 **Acknowledgments**

- Nigerian cultural heritage communities
- Open source contributors
- Educational technology advocates
- The Next.js and React communities

---

**Built with ❤️ for Nigerian education and cultural preservation**
