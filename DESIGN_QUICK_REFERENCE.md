# Design System - Quick Reference

## Color Classes

```tailwind
/* Primary Colors */
blue-50, blue-100, ..., blue-600, blue-700
purple-50, ..., purple-600
emerald-50, ..., emerald-600
amber-50, ..., amber-600
red-50, ..., red-600

/* Slate (Text & Neutral) */
slate-50, slate-100, ..., slate-700, slate-900
```

## Gradient Usage

```tailwind
/* Button Gradients */
bg-gradient-to-r from-blue-600 to-indigo-600

/* Card Header Bars */
bg-gradient-to-r from-blue-500 to-blue-600  /* Stations */
bg-gradient-to-r from-purple-500 to-purple-600  /* Trial Days */
bg-gradient-to-r from-emerald-500 to-emerald-600  /* Participants */
bg-gradient-to-r from-amber-500 to-amber-600  /* Audit */
bg-gradient-to-r from-red-500 to-red-600  /* Admin */

/* Icon Gradients */
bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent
```

## Spacing System

```tailwind
/* Container */
max-w-7xl          /* Main container width */
mx-auto            /* Center container */

/* Horizontal Padding */
px-4               /* Mobile */
sm:px-6            /* Tablet and up */
lg:px-8            /* Large screens */

/* Vertical Padding */
py-8               /* Page sections */
md:py-12           /* Medium screens and up */

/* Card Internal */
p-8 md:p-12        /* Cards and containers */

/* Grid Gap */
gap-6              /* Grid items */
gap-4              /* Smaller gaps */
gap-3              /* Section gaps */
```

## Typography

```tailwind
/* Headings */
text-5xl font-bold text-slate-900              /* Page titles */
text-4xl md:text-5xl font-bold                 /* Large headings */
text-3xl font-bold text-slate-900              /* Section titles */
text-2xl font-bold                             /* Subsection titles */
text-xl text-slate-900                         /* Card titles */

/* Body Text */
text-base text-slate-900                       /* Main text */
text-sm text-slate-600                         /* Secondary text */
text-xs text-slate-500                         /* Help text */

/* Labels */
text-sm font-semibold text-slate-900           /* Form labels */
```

## Border Radius

```tailwind
rounded-2xl        /* Cards, dialogs */
rounded-xl         /* Sections, containers */
rounded-lg         /* Smaller elements */
```

## Shadows

```tailwind
shadow-sm          /* Subtle */
shadow-md          /* Default */
shadow-lg          /* Prominent */
shadow-xl          /* Strong */
shadow-2xl         /* Hover state */
```

## Common Components

### Button - Primary Action
```jsx
<Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all">
  Action
</Button>
```

### Button - Secondary Action
```jsx
<Button variant="outline" className="text-slate-700 hover:bg-slate-100">
  Secondary
</Button>
```

### Card
```jsx
<Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
  <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
  <CardHeader className="pb-3">
    {/* Content */}
  </CardHeader>
</Card>
```

### Form Input
```jsx
<Input
  className="mt-2 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
  placeholder="Enter value"
/>
```

### Form Label
```jsx
<Label className="text-slate-900 font-semibold flex items-center gap-1">
  🎂 Field Label
</Label>
```

### Error Message
```jsx
<p className="text-red-600 text-sm mt-2 font-medium">Error message</p>
```

### Alert Box
```jsx
<div className="flex items-start gap-3 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
  {/* Content */}
</div>
```

## Responsive Prefixes

```tailwind
/* Base = Mobile */
text-base                       /* Mobile size */
md:text-lg                      /* Tablet size (768px+) */
lg:text-xl                      /* Desktop size (1024px+) */

/* Grid Columns */
grid-cols-1                     /* Mobile: 1 column */
md:grid-cols-2                  /* Tablet: 2 columns */
lg:grid-cols-3                  /* Desktop: 3 columns */

/* Display */
hidden md:flex                  /* Hidden on mobile, visible on tablet+ */
md:hidden                       /* Hidden on tablet+, visible on mobile */
```

## Hover & Focus Effects

```tailwind
/* Hover Effects */
hover:shadow-2xl               /* Shadow increase */
hover:-translate-y-1           /* Lift up */
group-hover:scale-110          /* Icon scale */
hover:text-slate-900           /* Color change */
hover:bg-slate-100             /* Background change */

/* Focus Effects */
focus:border-blue-500          /* Border color */
focus:ring-blue-500            /* Ring color */
focus:outline-none             /* Remove outline */
```

## Transitions

```tailwind
transition-all                 /* Animate all properties */
transition-shadow              /* Animate shadow only */
transition-transform           /* Animate transform only */
duration-300                   /* 300ms duration */
duration-200                   /* 200ms duration */
```

## Feature Color Mapping

| Feature | Colors | Usage |
|---------|--------|-------|
| Stations | Blue 600 | bg-blue-600, bg-blue-50 |
| Trial Days | Purple 600 | bg-purple-600, bg-purple-50 |
| Participants | Emerald 600 | bg-emerald-600, bg-emerald-50 |
| Audit | Amber 600 | bg-amber-600, bg-amber-50 |
| Admin | Red 600 | bg-red-600, bg-red-50 |

## Common Patterns

### Page Title with Bar
```jsx
<div className="space-y-4">
  <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Title</h1>
  <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
</div>
```

### Gradient Background
```jsx
<div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
  {/* Content */}
</div>
```

### Card with Color Bar
```jsx
<Card className="border-0 shadow-md overflow-hidden">
  <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
  <CardHeader>
    {/* Content */}
  </CardHeader>
</Card>
```

## Browser DevTools Tips

1. **Check focus states:**
   - Press Tab to navigate
   - Should see blue ring around focused elements

2. **Check responsive design:**
   - DevTools > Device Toolbar (Ctrl+Shift+M)
   - Test at 375px, 768px, 1024px widths

3. **Check colors:**
   - Right-click element → Inspect
   - Check computed styles for Tailwind classes

4. **Check accessibility:**
   - DevTools > Lighthouse
   - Run accessibility audit

## Performance Notes

- All styling uses Tailwind CSS utility classes
- No external CSS files loaded for styling
- CSS is tree-shaken (unused styles removed)
- Minimal JavaScript for animations (uses CSS transitions)
- Images are optimized by Vite

## Future Enhancement Ideas

- [ ] Dark mode toggle
- [ ] Custom CSS animations library
- [ ] Themed components system
- [ ] Toast notification styling
- [ ] Modal/dialog theme variants
- [ ] Skeleton loading screens
- [ ] Animation library integration
- [ ] Font family customization

---

**Last Updated:** November 16, 2025
**Status:** Current & Production Ready

