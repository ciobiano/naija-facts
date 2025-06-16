# Naija Facts 🇳🇬

> **Nigeria's Premier Educational Platform** - Interactive learning platform for Nigerian culture, history, and constitution.

A comprehensive web application that provides engaging, interactive learning experiences about Nigerian heritage, constitutional knowledge, and cultural content. Built with modern web technologies and designed to make learning about Nigeria accessible and enjoyable.

## 🌟 Key Features

- **📚 Constitutional Mastery** - Deep dive into Nigeria's constitution with interactive guides, real-world examples, and expert explanations
- **🧠 Adaptive Learning** - AI-powered quizzes that adapt to your learning pace with detailed analytics and progress tracking
- **🏆 Gamified Experience** - Achievement system, leaderboards, and progress tracking to keep learners engaged
- **🎨 Cultural Content** - Rich multimedia content including images, audio, and cultural artifacts
- **👥 Community Learning** - User profiles, social features, and collaborative learning experiences
- **🔍 AI Search** - Intelligent search functionality powered by vector embeddings and modern NLP
- **📱 Responsive Design** - Beautiful, accessible interface that works seamlessly across all devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Modern, accessible UI components
- **Radix UI** - Headless UI primitives
- **Framer Motion** - Animation library

### Backend & Database
- **PostgreSQL** - Primary database
- **Prisma** - Type-safe database ORM
- **NextAuth.js** - Authentication solution
- **Supabase** - Backend-as-a-Service platform
- **Upstash Redis** - Caching and session management

### AI & Search
- **OpenAI** - AI-powered features
- **Google GenAI** - Additional AI capabilities
- **Pinecone** - Vector database for semantic search
- **LangChain** - AI application framework
- **Hugging Face** - Machine learning models

### File Management & Storage
- **UploadThing** - File upload service
- **Sharp** - Image processing

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 18 or higher)
- **pnpm** (recommended package manager)
- **PostgreSQL** database
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/naija-facts.git
   cd naija-facts
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/naija_facts"
   DIRECT_URL="postgresql://username:password@localhost:5432/naija_facts"
   
   # NextAuth.js
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # OAuth Providers (optional)
   GITHUB_ID="your-github-client-id"
   GITHUB_SECRET="your-github-client-secret"
   
   # AI Services
   OPENAI_API_KEY="your-openai-api-key"
   GOOGLE_API_KEY="your-google-ai-api-key"
   
   # Vector Database
   PINECONE_API_KEY="your-pinecone-api-key"
   PINECONE_ENVIRONMENT="your-pinecone-environment"
   
   # File Upload
   UPLOADTHING_SECRET="your-uploadthing-secret"
   UPLOADTHING_APP_ID="your-uploadthing-app-id"
   
   # Redis
   UPSTASH_REDIS_REST_URL="your-redis-url"
   UPSTASH_REDIS_REST_TOKEN="your-redis-token"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   pnpm db:generate
   
   # Run database migrations
   pnpm db:migrate:dev
   
   # Seed the database with initial data
   pnpm db:seed:prisma
   ```

5. **Generate embeddings (optional)**
   ```bash
   pnpm generate-embeddings
   ```

6. **Start the development server**
   ```bash
   pnpm dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📖 Usage

### For Learners
1. **Sign Up/Sign In** - Create an account or sign in with GitHub
2. **Take Quizzes** - Start with beginner-level quizzes and progress through different categories
3. **Study Constitution** - Explore the comprehensive constitutional documentation
4. **Track Progress** - Monitor your learning journey with detailed analytics
5. **Compete** - Check leaderboards and earn achievements

### For Developers
1. **API Routes** - Explore `/app/api` for backend functionality
2. **Components** - Reusable UI components in `/components`
3. **Database Schema** - Check `/prisma/schema.prisma` for data models
4. **Styles** - Tailwind configuration and custom styles

## 🗂️ Project Structure

```
naija-facts/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── quiz/              # Quiz functionality
│   ├── docs/              # Constitutional documentation
│   ├── profile/           # User profile management
│   └── cultural-content/  # Cultural media content
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn/UI components
│   ├── auth/             # Authentication components
│   └── contexts/         # React contexts
├── lib/                  # Utility libraries
│   ├── auth/             # Authentication utilities
│   ├── database/         # Database utilities
│   └── quiz/             # Quiz logic
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── types/                # TypeScript type definitions
└── utils/                # Helper functions
```

## 🧪 Available Scripts

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run ESLint

# Database
pnpm db:generate           # Generate Prisma client
pnpm db:migrate:dev        # Run development migrations
pnpm db:migrate:deploy     # Deploy migrations to production
pnpm db:seed:prisma        # Seed database with initial data
pnpm db:studio             # Open Prisma Studio
pnpm db:reset              # Reset database

# AI & Embeddings
pnpm generate-embeddings   # Generate vector embeddings for search
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Obiano Rafael**
- Email: [your-email@example.com](mailto:your-email@example.com)
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Nigerian Constitution and legal experts for content accuracy
- Open source community for the amazing tools and libraries
- Beta testers and early adopters for valuable feedback

## 📈 Stats

- **50K+** Quiz Attempts
- **15+** Constitutional Chapters
- **98%** Success Rate
- **10,000+** Active Learners

---

<div align="center">
  <p>Made with ❤️ for Nigeria 🇳🇬</p>
  <p>
    <a href="https://naija-facts.com">Website</a> •
    <a href="#-contributing">Contribute</a> •
    <a href="mailto:support@naija-facts.com">Support</a>
  </p>
</div>
