# Local Development Setup Guide

**Trial Master Pro - Local Development**

This guide walks you through setting up and running the Trial Master Pro application on your local machine.

---

## Prerequisites

Before you start, make sure you have the following installed:

### Required Software
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **A code editor** (VSCode recommended) - [Download](https://code.visualstudio.com/)

### Verify Installation
```bash
node --version      # Should show v16+
npm --version       # Should show 8+
git --version       # Should show 2.x+
```

---

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Toms422/trial-master-pro.git

# Navigate to project directory
cd trial-master-pro
```

---

## Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# This will take 2-3 minutes and install:
# - React 18
# - Tailwind CSS
# - Framer Motion
# - Supabase client
# - And 470+ other packages
```

---

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

### Option A: Using Existing Credentials
If you have existing Supabase credentials, create `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anonymous-key-here
```

### Option B: Setting Up New Supabase Project

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up with GitHub
   - Create a new project

2. **Get Your Credentials**
   - Open your Supabase project
   - Click "Settings" → "API"
   - Copy:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **Anon (public) Key** → `VITE_SUPABASE_ANON_KEY`

3. **Create `.env.local`**
```env
VITE_SUPABASE_URL=https://pqokxvlezvrpzavdmcjh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Apply Database Schema**
   - See `DATABASE_SCHEMA.sql` in the repo
   - Copy the SQL commands
   - Paste into Supabase SQL Editor
   - Run to create tables and policies

---

## Step 4: Start Development Server

```bash
# Start the local development server
npm run dev

# Output will show:
# VITE v5.4.19  ready in 285 ms
#
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

---

## Step 5: Open in Browser

Open your browser and go to:
```
http://localhost:5173
```

You should see the Trial Master Pro login page.

---

## Default Test Credentials

You can use these test accounts to log in:

### Admin Account
- **Email:** admin@test.com
- **Password:** Test123!

### Operator Account
- **Email:** operator@test.com
- **Password:** Test123!

**Note:** These accounts must be created in your Supabase project first.

---

## Available Development Commands

```bash
# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code (check for errors)
npm run lint

# Type check with TypeScript
npm run type-check
```

---

## Project Structure

```
trial-master-pro/
├── src/
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Stations.tsx
│   │   ├── TrialDays.tsx
│   │   ├── Participants.tsx
│   │   ├── CheckIn.tsx
│   │   ├── Audit.tsx
│   │   ├── Admin.tsx
│   │   └── Auth.tsx
│   ├── components/         # Reusable components
│   │   ├── PageTransition.tsx      # Page animations
│   │   ├── AnimatedBadge.tsx       # Status badges
│   │   ├── AnimatedCounter.tsx     # Number counters
│   │   ├── AnimatedLoadingButton.tsx # Loading buttons
│   │   ├── AnimatedInput.tsx       # Form inputs
│   │   └── ui/             # UI components
│   ├── hooks/              # Custom React hooks
│   │   └── useAuditLog.ts
│   ├── contexts/           # React Context
│   │   └── AuthContext.tsx
│   ├── integrations/       # External integrations
│   │   └── supabase/       # Supabase client
│   ├── lib/                # Utility functions
│   └── App.tsx             # Main app component
├── public/                 # Static assets
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
├── package.json            # Dependencies
└── .env.local              # Environment variables (create this)
```

---

## Key Features Available Locally

### ✅ Authentication
- Sign in / Sign up
- Role-based access (Admin, Operator)
- Password validation

### ✅ Dashboard
- Quick stats and metrics
- Activity feed
- Navigation cards

### ✅ Trial Management
- Create/edit trial days
- Manage participants
- Track arrivals

### ✅ Stations
- Create/edit test stations
- Set capacity limits
- Add descriptions

### ✅ Check-in System
- QR code generation
- Mobile form submission
- Data collection

### ✅ Audit Log
- Track all system actions
- Filter by user/date/action
- Export reports

### ✅ Animations
- Page transitions (all routes)
- Skeleton loaders (data loading)
- Button animations (interactions)
- Badge animations (status indicators)
- Number counters (statistics)

---

## Troubleshooting

### Port 5173 Already in Use
```bash
# Use a different port
npm run dev -- --port 5174
```

### Node Modules Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading
```bash
# Make sure file is named exactly: .env.local
# And restart the dev server
npm run dev
```

### Database Connection Error
```
Error: Failed to connect to Supabase
```

**Solution:**
1. Check `.env.local` has correct credentials
2. Verify Supabase project is active
3. Check internet connection
4. Restart dev server: `npm run dev`

### Build Warnings about Bundle Size
```
Some chunks are larger than 500 kB
```

**This is expected and acceptable.** It's just a warning. The app runs fine.

---

## Development Tips

### Hot Module Reload
- Edit any file and save
- Browser auto-refreshes with changes
- State is preserved during reloads

### React DevTools
- Install [React DevTools](https://react-devtools-tutorial.vercel.app/)
- Debug component state and props
- Profile performance

### TypeScript Benefits
- Full type checking in IDE
- Autocomplete suggestions
- Catch errors before running

### Browser DevTools
- Press F12 to open
- Check Network tab for API calls
- View Console for errors/logs

---

## Environment Setup Examples

### For Development (with local Supabase)
```env
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key
```

### For Testing (with staging Supabase)
```env
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-staging-anon-key
```

---

## Next Steps

Once running locally:

1. **Explore the app** - Navigate through all pages
2. **Test features** - Create trial days, add participants
3. **Check animations** - Notice all transitions and loading effects
4. **Review code** - Open files in your editor
5. **Make changes** - Edit code and see hot reload
6. **Run build** - Test production build: `npm run build`

---

## Common Development Tasks

### Add a New Page
1. Create file: `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add PageTransition wrapper
4. Import and use components

### Add Animation
1. Import Framer Motion: `import { motion } from 'framer-motion'`
2. Wrap component with `<motion.div>`
3. Add animation variants
4. Use `initial`, `animate`, `exit` props

### Connect to API
1. Use `supabase` from `@/integrations/supabase/client`
2. Call `.from('table_name')` to query
3. Handle errors in try/catch
4. Use React Query for caching

---

## Performance Tips

- **DevTools Lighthouse** - Test performance
- **Network tab** - Check API response times
- **React Profiler** - Identify slow components
- **Bundle analyzer** - Check dependency sizes

---

## Getting Help

### Documentation Files
- [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md) - Animation components
- [ANIMATIONS_COMPLETE.md](ANIMATIONS_COMPLETE.md) - Full animation system
- [DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql) - Database structure
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Feature overview

### Code Comments
- Most files have inline documentation
- Check component prop types with TypeScript
- Hover over types in IDE for definitions

### Git History
```bash
# See all commits and changes
git log --oneline

# See what changed in a commit
git show <commit-hash>

# See changes since last commit
git diff
```

---

## Production Deployment

When ready to deploy:

```bash
# Build optimized production version
npm run build

# This creates:
# - dist/index.html (main page)
# - dist/assets/ (optimized JS/CSS)

# Ready to deploy to:
# - Vercel
# - Netlify
# - GitHub Pages
# - Any static hosting
```

---

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review error messages carefully
3. Check `.env.local` configuration
4. Look at browser console (F12)
5. Check Supabase dashboard for errors

---

**Last Updated:** November 17, 2025
**Version:** 1.0.0
**Status:** Production Ready
