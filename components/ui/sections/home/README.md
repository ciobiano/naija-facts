# Modern Landing Page Components

This directory contains modern, glassmorphic landing page components for Naija Facts inspired by TechBlitz design patterns.

## Components

### `modern-landing.tsx`
A complete, single-file glassmorphic landing page with:

**Design Features:**
- ✨ Dark theme with futuristic glassmorphic elements
- 🌟 Animated floating orbs and gradient backgrounds
- 📱 Fully responsive design (mobile-first approach)
- 🎨 Nigerian-themed color palette (naija-green, cultural-gold, etc.)
- 🖱️ Mouse-tracking floating panels
- 🎭 Smooth Framer Motion animations
- 💎 Backdrop blur effects and transparency layers

**Key Sections:**
1. **Hero Section** - Large gradient text with status badge
2. **CTA Buttons** - Primary and secondary action buttons
3. **Central Glass Panel** - Main feature showcase with hover effects
4. **Floating Glass Panels** - 4 animated panels showing metrics
5. **Feature Cards** - 3 glassmorphic cards highlighting key features
6. **Stats Row** - Key statistics with hover animations

## Usage

### Option 1: Replace existing home page
```tsx
// app/page.tsx
import ModernLanding from "@/components/ui/sections/home/modern-landing";

export default function HomePage() {
  return <ModernLanding />;
}
```

### Option 2: Demo route (already created)
Visit `/demo-landing` to see the component in action.

### Option 3: Integration with existing layout
```tsx
// app/layout.tsx or specific page
import ModernLanding from "@/components/ui/sections/home/modern-landing";
import Navbar from "@/components/ui/sections/nav";
import Footer from "@/components/ui/sections/footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <ModernLanding />
      <Footer />
    </>
  );
}
```

## Customization

### Colors
The component uses your existing Tailwind color palette:
- `naija-green-*` - Primary green colors
- `cultural-gold` - Accent gold color
- `cultural-*` - Other cultural colors (bronze, terracotta, indigo)

### Content
Easily customize:
- Headlines and descriptions
- CTA button text and links
- Feature card content
- Stats numbers and labels
- Floating panel metrics

### Animations
Built with Framer Motion for smooth animations:
- Staggered entrance animations
- Mouse-tracking floating panels
- Hover effects and micro-interactions
- Responsive spring physics

## Dependencies

Ensure these are installed:
```json
{
  "framer-motion": "^10.x.x",
  "lucide-react": "^0.x.x",
  "@tailwindcss/typography": "^0.x.x"
}
```

## Browser Support

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Backdrop-blur support required for glassmorphic effects
- ✅ CSS Grid and Flexbox support
- ⚠️ Graceful degradation for older browsers

## Performance Notes

- Uses Next.js optimizations
- Implements proper loading states
- Optimized animations with `will-change`
- Efficient event listeners with cleanup
- Responsive image handling

## TechBlitz Inspirations Applied

1. **Clean, Modern Aesthetic** - Minimalist dark theme
2. **Glassmorphic Design** - Frosted glass panels with backdrop blur
3. **Interactive Elements** - Mouse tracking and hover states
4. **Smooth Animations** - Entrance animations and micro-interactions
5. **Performance Focus** - Optimized for fast loading
6. **Mobile-First** - Responsive design principles
7. **Visual Hierarchy** - Clear content organization 