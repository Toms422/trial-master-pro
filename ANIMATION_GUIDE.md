# Animation & Motion Guide

This document outlines the professional animation system implemented throughout the Trial Master Pro application.

## Overview

The application features three phases of animation implementation:

### Phase 1: Quick Wins (Tailwind-based)
- Skeleton loaders for loading states
- Staggered entrance animations
- Hover effects on tables and cards
- Button scale feedback

### Phase 2: Advanced Framework (Framer Motion)
- Page transitions with fade and scale
- Dialog/modal animations
- Spring physics for natural motion
- All routes wrapped with automatic page animations

### Phase 3: Micro-interactions (Framer Motion Components)
- AnimatedBadge for status indicators
- AnimatedCounter for statistics
- AnimatedLoadingButton for async operations
- AnimatedInput for form fields
- DialogTransition for custom modals

---

## Available Animation Components

### PageTransition
Automatically animates page enter/exit with fade and scale effects.

**Usage:**
```tsx
import PageTransition from '@/components/PageTransition';

// Already applied globally in App.tsx
// All routes are wrapped with PageTransition
```

**Animation Profile:**
- Entrance: Fade in + scale up (0.3s)
- Exit: Fade out + scale down (0.3s)
- Easing: Ease-in-out

---

### DialogTransition
Enhanced dialog with spring animations and backdrop fade.

**Usage:**
```tsx
import DialogTransition from '@/components/DialogTransition';
import { Button } from '@/components/ui/button';

<DialogTransition
  open={isOpen}
  onOpenChange={setIsOpen}
  trigger={<Button>Open Dialog</Button>}
  title="Dialog Title"
  description="Optional description"
>
  <div>Dialog content goes here</div>
</DialogTransition>
```

**Animation Profile:**
- Scale: 0.95 → 1 (spring)
- Opacity: 0 → 1 (smooth)
- Damping: 20, Stiffness: 300

---

### AnimatedBadge
Badge component with entrance and hover animations.

**Usage:**
```tsx
import AnimatedBadge from '@/components/AnimatedBadge';

<AnimatedBadge variant="success">
  ✓ Completed
</AnimatedBadge>

<AnimatedBadge variant="warning">
  ⚠ Pending
</AnimatedBadge>
```

**Variants:**
- `success` - Green background
- `error` - Red background
- `warning` - Yellow background
- `info` - Blue background
- `default` - Gray background

**Animation Profile:**
- Entrance: Scale 0 → 1 (spring)
- Hover: Scale 1 → 1.05 (spring)

---

### AnimatedCounter
Smooth number animation from one value to another.

**Usage:**
```tsx
import AnimatedCounter from '@/components/AnimatedCounter';

<div className="text-4xl font-bold">
  <AnimatedCounter to={150} duration={2} prefix="סה\"כ: " suffix=" משתתפים" />
</div>
```

**Props:**
- `from` - Starting number (default: 0)
- `to` - Ending number (required)
- `duration` - Animation duration in seconds (default: 2)
- `prefix` - Text before number
- `suffix` - Text after number
- `className` - Additional CSS classes

---

### AnimatedLoadingButton
Button with animated loading state and spinner.

**Usage:**
```tsx
import AnimatedLoadingButton from '@/components/AnimatedLoadingButton';

const [isLoading, setIsLoading] = useState(false);

<AnimatedLoadingButton
  isLoading={isLoading}
  loadingText="טוען..."
  onClick={async () => {
    setIsLoading(true);
    await someAsyncOperation();
    setIsLoading(false);
  }}
>
  <Save className="w-4 h-4 ml-2" />
  Save
</AnimatedLoadingButton>
```

**Props:**
- `isLoading` - Show loading state
- `loadingText` - Text to show while loading
- `variant` - Button variant (default/destructive/outline/secondary/ghost/link)
- `size` - Button size (default/sm/lg/icon)
- All standard button props

**Animation Profile:**
- Spinner: 360° rotation (1s, infinite)
- Content fade: 0.2s
- Smooth state transitions

---

### AnimatedInput
Input field with animated label and focus effects.

**Usage:**
```tsx
import AnimatedInput from '@/components/AnimatedInput';
import { User } from 'lucide-react';

<AnimatedInput
  label="Full Name"
  placeholder="Enter your name"
  icon={<User className="w-4 h-4" />}
  error={errors.name}
/>
```

**Props:**
- `label` - Floating label text
- `error` - Error message to display
- `icon` - Icon element (left-aligned)
- `className` - Additional CSS classes
- All standard input props

**Animation Profile:**
- Label: Moves up on focus (0.2s)
- Underline: Scales from center (0.2s)
- Icon: Color changes on focus (0.2s)
- Error: Slides up with fade (0.2s)

---

## Animation Timing

All animations use consistent timing for cohesive feel:

| Component | Duration | Easing | Type |
|-----------|----------|--------|------|
| Page transitions | 300ms | ease-in-out | tween |
| Dialog entrance | spring | - | spring (damping: 20) |
| Badge entrance | spring | - | spring (damping: 15) |
| Input focus | 200ms | ease-in-out | tween |
| Loading spinner | 1000ms | linear | infinite |
| Counter animation | 2000ms (configurable) | ease-out | tween |

---

## Integration Examples

### Adding AnimatedBadge to Participants Page

Current status display:
```tsx
const getStatusBadge = (status: boolean, timestamp?: string) => {
  if (status) {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-600" />
        <span className="text-sm text-green-600">כן</span>
      </div>
    );
  }
  return <span className="text-sm text-gray-500">לא</span>;
};
```

Enhanced with AnimatedBadge:
```tsx
import AnimatedBadge from '@/components/AnimatedBadge';

const getStatusBadge = (status: boolean) => {
  return status ? (
    <AnimatedBadge variant="success">
      <CheckCircle className="w-3 h-3" />
      כן
    </AnimatedBadge>
  ) : (
    <AnimatedBadge variant="default">לא</AnimatedBadge>
  );
};
```

### Adding AnimatedLoadingButton to Forms

Current button:
```tsx
<Button onClick={handleSave} disabled={upsertMutation.isPending}>
  {upsertMutation.isPending ? "שומר..." : "שמור"}
</Button>
```

Enhanced with AnimatedLoadingButton:
```tsx
import AnimatedLoadingButton from '@/components/AnimatedLoadingButton';

<AnimatedLoadingButton
  isLoading={upsertMutation.isPending}
  loadingText="שומר..."
  onClick={handleSave}
>
  <Save className="w-4 h-4 ml-2" />
  שמור
</AnimatedLoadingButton>
```

---

## Performance Considerations

- All animations use GPU-accelerated transforms (opacity, scale, y-offset)
- Skeleton loaders use CSS animations (built-in `animate-pulse`)
- Page transitions (300ms) maintain 60fps smoothness
- Micro-interactions keep animations under 300ms for responsiveness
- Spring animations use optimal damping for natural feel without over-oscillation

---

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation for older browsers
- CSS animation fallback for critical loading states

---

## Future Enhancements

- Gesture-based animations for mobile (swipe transitions)
- Reduced motion media query support for accessibility
- Custom animation presets (fast/normal/slow)
- Animation performance monitoring

---

## Related Files

- `src/components/PageTransition.tsx` - Page route animations
- `src/components/DialogTransition.tsx` - Dialog animations
- `src/components/AnimatedBadge.tsx` - Status badge animations
- `src/components/AnimatedCounter.tsx` - Number counter animations
- `src/components/AnimatedLoadingButton.tsx` - Loading button animations
- `src/components/AnimatedInput.tsx` - Form input animations

---

**Last Updated:** November 17, 2025
**Framework:** Framer Motion v11.x
**Additional Library:** React, TypeScript, Tailwind CSS
