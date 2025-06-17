# Contributing to Naija Facts 🇳🇬

Thank you for your interest in contributing to Naija Facts! This guide will help you get started with contributing to our Nigerian cultural heritage education platform.

## 🌟 Ways to Contribute

- **🐛 Bug Reports** - Help us identify and fix issues
- **✨ Feature Requests** - Suggest new features or improvements
- **💻 Code Contributions** - Implement new features or fix bugs
- **📚 Documentation** - Improve our docs and guides
- **🎨 Design** - UI/UX improvements and cultural design elements
- **📝 Content** - Cultural facts, quiz questions, and educational content
- **🌍 Localization** - Help us support more Nigerian languages

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Git
- Basic knowledge of React, Next.js, and TypeScript
- Familiarity with Nigerian culture and heritage (for content contributions)

### Setup Development Environment

1. **Fork and clone the repository**
```bash
git clone https://github.com/ciobiano/naija-facts.git
cd naija-facts
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Configure your environment variables
```

4. **Set up the database**
```bash
pnpm db:push
pnpm db:seed
```

5. **Start development server**
```bash
pnpm dev
```

## 📋 Project Status & Areas for Contribution

### ✅ **Completed Systems** (Maintenance & Enhancement)
- **Authentication System** - OAuth, profile management, security
- **Quiz System** - Adaptive difficulty, progress tracking
- **Cultural Content Management** - Upload, gallery, search
- **Mobile-First Design** - Responsive UI components

### 🚧 **Areas Needing Contribution**

#### **High Priority**
1. **Gamification System** 
   - Achievement badges and certificates
   - Leaderboards and competitions
   - Progress milestones and rewards

2. **Content Seeding**
   - Nigerian cultural facts and trivia
   - Constitutional knowledge base
   - Historical events and figures
   - Regional cultural variations

3. **Internationalization (i18n)**
   - Yoruba language support
   - Igbo language support
   - Hausa language support
   - Fulani and other Nigerian languages

#### **Medium Priority**
4. **Admin Dashboard**
   - Content moderation tools
   - User management
   - Analytics and insights
   - System monitoring

5. **AI Integration**
   - Intelligent content recommendations
   - Adaptive learning paths
   - Automated question generation
   - Cultural context explanations

6. **Social Features**
   - User communities and groups
   - Content sharing and discussions
   - Collaborative learning
   - Cultural exchange forums

## 🛠️ Development Guidelines

### **Code Standards**

#### **TypeScript**
- Use strict TypeScript configuration
- Define proper types and interfaces
- Avoid `any` types when possible
- Use type guards for runtime checks

```typescript
// ✅ Good
interface CulturalContent {
  id: string;
  title: string;
  region: NigerianRegion;
  uploadedAt: Date;
}

// ❌ Avoid
const content: any = { id: 1, title: "Title" };
```

#### **React Components**
- Use functional components with hooks
- Implement proper error boundaries
- Follow the composition pattern
- Use Suspense for data loading

```tsx
// ✅ Good
export function CulturalGallery({ region }: CulturalGalleryProps) {
  const { data, isLoading, error } = useSWR(`/api/cultural-content/${region}`);
  
  return (
    <LoadingContent loading={isLoading} error={error}>
      {data && <GalleryGrid images={data.images} />}
    </LoadingContent>
  );
}
```

#### **Styling**
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Implement Nigerian cultural design elements
- Ensure WCAG 2.1 accessibility compliance

```tsx
// ✅ Good - Mobile-first, accessible, cultural colors
<Card className="w-full sm:w-1/2 lg:w-1/3 bg-green-50 border-green-200 focus:ring-green-500">
  <CardHeader className="sr-only">Cultural Content</CardHeader>
  <CardContent className="p-4">
    {/* Content */}
  </CardContent>
</Card>
```

#### **API Routes**
- Implement proper error handling
- Use Zod for request validation
- Follow REST conventions
- Add rate limiting for public endpoints

```typescript
// ✅ Good
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = CulturalContentSchema.parse(body);
    
    const content = await createCulturalContent(validatedData);
    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

### **Database Guidelines**

#### **Prisma Schema**
- Use descriptive model names
- Implement proper relationships
- Add indexes for performance
- Include metadata fields

```prisma
// ✅ Good
model CulturalImage {
  id          String   @id @default(cuid())
  title       String
  region      String
  description String?
  uploadedBy  String
  viewCount   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  profile     Profile  @relation(fields: [uploadedBy], references: [id])
  downloads   CulturalImageDownload[]
  
  @@index([region])
  @@index([createdAt])
}
```

### **Cultural Content Guidelines**

#### **Content Standards**
- **Accuracy** - Verify all cultural and historical facts
- **Respectfulness** - Honor all Nigerian cultures and traditions
- **Inclusivity** - Represent diverse Nigerian communities
- **Educational Value** - Focus on learning outcomes

#### **Quiz Content**
- Multiple difficulty levels (beginner, intermediate, advanced)
- Various question types (multiple choice, true/false, short answer)
- Detailed explanations for answers
- Cultural context and background information

```typescript
// ✅ Good quiz question structure
const question: QuizQuestion = {
  id: "culture-001",
  chapter: "traditional-festivals",
  difficulty: "intermediate",
  type: "multiple-choice",
  question: "Which festival is celebrated by the Yoruba people to honor the river goddess?",
  options: [
    "Osun-Osogbo Festival",
    "New Yam Festival",
    "Durbar Festival",
    "Calabar Carnival"
  ],
  correctAnswer: 0,
  explanation: "The Osun-Osogbo Festival is celebrated annually in Osogbo to honor the river goddess Osun, showcasing Yoruba culture and traditions.",
  culturalContext: "This UNESCO World Heritage festival demonstrates the spiritual connection between Yoruba people and nature.",
  region: "Southwest",
  tags: ["yoruba", "festival", "tradition", "osun"]
};
```

## 🔄 Contribution Workflow

### **1. Choose an Issue**
- Check our [GitHub Issues](https://github.com/ciobiano/naija-facts/issues)
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to express interest

### **2. Create a Branch**
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### **3. Make Changes**
- Follow our coding standards
- Write comprehensive tests
- Update documentation if needed
- Test thoroughly on different screen sizes

### **4. Commit Guidelines**
We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat(quiz): add adaptive difficulty algorithm"

# Bug fixes
git commit -m "fix(auth): resolve OAuth callback error"

# Documentation
git commit -m "docs(api): update authentication endpoints"

# Cultural content
git commit -m "content(quiz): add Igbo cultural questions"

# UI improvements
git commit -m "ui(gallery): improve mobile responsiveness"
```

### **5. Pull Request Process**

#### **Before Submitting**
- [ ] Run tests: `pnpm test`
- [ ] Run linting: `pnpm lint`
- [ ] Check types: `pnpm type-check`
- [ ] Test on mobile devices
- [ ] Verify accessibility compliance

#### **PR Template**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Cultural content addition
- [ ] Performance improvement

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Mobile testing completed

## Cultural Accuracy
- [ ] Facts verified with reliable sources
- [ ] Content reviewed for cultural sensitivity
- [ ] Inclusive representation maintained

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows project guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

### **6. Review Process**
- Maintainers will review your PR
- Address feedback promptly
- Make requested changes
- Maintain open communication

## 🎯 Specific Contribution Areas

### **Cultural Content Contributions**

#### **Quiz Questions**
We need quiz questions covering:
- **Nigerian History** - Independence, civil war, democracy
- **Cultural Traditions** - Festivals, ceremonies, customs
- **Languages** - Major languages and dialects
- **Geography** - States, capitals, landmarks
- **Constitution** - Governance, rights, laws
- **Notable Figures** - Leaders, activists, artists

#### **Cultural Images**
- Traditional clothing and accessories
- Architectural landmarks
- Cultural artifacts and art
- Festival celebrations
- Regional landscapes

### **Technical Contributions**

#### **Gamification System**
```typescript
// Example achievement system structure
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'quiz' | 'cultural' | 'social' | 'learning';
  requirements: AchievementRequirement[];
  reward: {
    points: number;
    badge: string;
    certificate?: string;
  };
}
```

#### **Internationalization**
```typescript
// Translation structure
interface Translations {
  common: {
    welcome: string;
    loading: string;
    error: string;
  };
  quiz: {
    startQuiz: string;
    nextQuestion: string;
    submitAnswer: string;
  };
  cultural: {
    uploadImage: string;
    selectRegion: string;
    addDescription: string;
  };
}
```

## 🧪 Testing Guidelines

### **Unit Tests**
```typescript
// Component testing example
import { render, screen } from '@testing-library/react';
import { CulturalGallery } from '@/components/cultural/CulturalGallery';

describe('CulturalGallery', () => {
  it('renders images correctly', () => {
    const mockImages = [
      { id: '1', title: 'Lagos Cityscape', region: 'Southwest' }
    ];
    
    render(<CulturalGallery images={mockImages} />);
    expect(screen.getByText('Lagos Cityscape')).toBeInTheDocument();
  });
});
```

### **Integration Tests**
- Test API endpoints with realistic data
- Verify database operations
- Test authentication flows
- Validate file upload processes

### **E2E Tests**
- Complete user journeys
- Quiz-taking experience
- Cultural content upload flow
- Mobile user experience

## 📚 Resources

### **Nigerian Culture & History**
- [National Museum of Nigeria](http://nationalmuseum.gov.ng/)
- [Centre for Black Culture and International Understanding](http://www.cbciu.org/)
- [Nigerian Cultural Studies](https://www.nigerianculturalstudies.com/)

### **Development Resources**
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)

### **Accessibility Guidelines**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Accessibility Initiative](https://www.w3.org/WAI/)

## 💬 Community

- **GitHub Discussions** - General discussions and questions
- **Issues** - Bug reports and feature requests
- **Discord** - Real-time community chat (coming soon)

## 📄 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## 🏆 Recognition

Contributors are recognized in:
- README.md contributors section
- Monthly contributor highlights
- Special badges in the application
- Certificate of contribution

## ❓ Questions?

- **General Questions** - Open a GitHub Discussion
- **Bug Reports** - Create a GitHub Issue
- **Security Issues** - Email security@naijafacts.com
- **Cultural Content** - Email content@naijafacts.com

---

**Thank you for helping preserve and share Nigerian cultural heritage! 🇳🇬** 