# Local Setup Checklist

Use this checklist to ensure you've completed all steps to run Trial Master Pro locally.

---

## ✅ Prerequisites

- [ ] **Node.js installed** (v16 or higher)
  - Check: `node --version` should show v16+
  - Download: https://nodejs.org

- [ ] **npm installed** (comes with Node.js)
  - Check: `npm --version` should show 8+

- [ ] **Git installed**
  - Check: `git --version` should show 2.x+
  - Download: https://git-scm.com

- [ ] **Code editor installed** (VSCode recommended)
  - Download: https://code.visualstudio.com

---

## ✅ Repository Setup

- [ ] **Clone repository**
  ```bash
  git clone https://github.com/Toms422/trial-master-pro.git
  cd trial-master-pro
  ```

- [ ] **Verify clone successful**
  - Check that `.git` folder exists
  - Check that `package.json` exists

---

## ✅ Dependency Installation

- [ ] **Install npm packages**
  ```bash
  npm install
  ```

- [ ] **Verify installation**
  - Check that `node_modules` folder was created
  - Check that folder is several GB in size (~500MB min)

---

## ✅ Environment Configuration

- [ ] **Create `.env.local` file**
  - Location: Root directory (same folder as `package.json`)
  - File name: `.env.local` (exactly!)

- [ ] **Add Supabase credentials**
  ```env
  VITE_SUPABASE_URL=https://pqokxvlezvrpzavdmcjh.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3N1cGFiYXNlLmlvIiwicmVmIjoicHFva3h2bGV6dnJwemF2ZG1jamgiLCJyb2xlIjoiYW9uIiwiaWF0IjoxNzAwNDQ1NTY4LCJleHAiOjE4NTgyMTIzNjh9.tV4k1P8H5m3X9Q2R7Z8A1B4C5D6E7F8G9H0I1J2K3
  ```

- [ ] **Verify file was saved**
  - Check file exists and contains both environment variables

---

## ✅ Start Development Server

- [ ] **Run development server**
  ```bash
  npm run dev
  ```

- [ ] **Verify server started successfully**
  - Should see: `✓ VITE v5.4.19  ready in XXX ms`
  - Should see: `✓ Local: http://localhost:5173/`
  - Should see: `✓ press h to show help`

- [ ] **No errors in terminal**
  - Check that terminal shows no red error messages

---

## ✅ Browser Access

- [ ] **Open browser to local server**
  ```
  http://localhost:5173
  ```

- [ ] **See login page**
  - Should see "מערכת ניהול נסיינים" (Trial Master Pro in Hebrew)
  - Should see login form with email/password fields
  - Should see "התחברות" (Sign In) and "הרשמה" (Sign Up) tabs

- [ ] **Verify animations work**
  - Card should fade in smoothly when page loads
  - Watch for smooth transitions

---

## ✅ Test Login

- [ ] **Login with admin account**
  - Email: `admin@test.com`
  - Password: `Test123!`
  - Should be logged in successfully

- [ ] **See dashboard**
  - Should see dashboard with cards
  - Should see "נסיינים פעילים" (Active participants) counter
  - Should see animated counter counting from 0→100+

---

## ✅ Test Navigation

- [ ] **Test page transitions**
  - Click "עמדות ניסוי" (Stations)
  - Watch page fade in smoothly

- [ ] **Navigate to other pages**
  - [ ] Dashboard
  - [ ] Stations
  - [ ] Trial Days
  - [ ] Participants
  - [ ] Audit
  - [ ] Admin

- [ ] **All pages load without errors**
  - Check browser console (F12) - should have no red errors

---

## ✅ Test Features

- [ ] **Create a station**
  - Go to Stations page
  - Click "עמדת ניסוי חדשה" (New Station)
  - Fill in details
  - Click save button (watch loading animation)

- [ ] **See animation feedback**
  - Button should show spinner while saving
  - Should see success toast notification

- [ ] **Create a trial day**
  - Go to Trial Days page
  - Create a new trial day
  - Set a date and time

- [ ] **Add participants**
  - Go to Participants page
  - Select a trial day
  - Click "נסיין חדש" (New Participant)
  - Fill in details
  - Save

---

## ✅ Test Animations

- [ ] **Skeleton loaders**
  - Participants page should show skeleton table when loading
  - Audit page should show skeleton filters

- [ ] **Page transitions**
  - Navigate between pages
  - Should see smooth fade-in animation

- [ ] **Button animations**
  - Hover over buttons
  - Should see scale effect
  - Should see shadow effect

- [ ] **Badge animations**
  - Go to Participants page
  - Should see animated badges for status

- [ ] **Counter animations**
  - Go to Dashboard
  - Should see numbers counting from 0 to their values

---

## ✅ Test Hot Reload

- [ ] **Edit a file**
  - Open `src/pages/Dashboard.tsx`
  - Make a small change (e.g., change text color)
  - Save file

- [ ] **See changes immediately**
  - Browser should auto-refresh
  - Your change should be visible
  - Page should stay open (no full reload)

---

## ✅ Code Editor Setup

- [ ] **Open project in editor**
  ```bash
  code .
  ```

- [ ] **Install VS Code extensions** (recommended)
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin

- [ ] **See TypeScript support**
  - Hover over code elements
  - Should see type information

---

## ✅ Documentation Review

- [ ] **Read QUICK_START.md**
  - Check you understand the steps

- [ ] **Skim LOCAL_SETUP.md**
  - Understand project structure
  - Know how to troubleshoot issues

- [ ] **Review ANIMATION_GUIDE.md**
  - Understand available animation components

---

## ✅ Troubleshooting (if needed)

- [ ] **If port 5173 is in use:**
  ```bash
  npm run dev -- --port 5174
  ```

- [ ] **If modules not found:**
  ```bash
  rm -rf node_modules
  npm install
  npm run dev
  ```

- [ ] **If Supabase connection fails:**
  - Check `.env.local` file exists
  - Check credentials are correct
  - Check internet connection
  - Restart: `npm run dev`

- [ ] **If animations don't show:**
  - Check browser console (F12)
  - Try hard refresh (Ctrl+Shift+R)
  - Check build is latest

---

## ✅ Final Verification

- [ ] **Build passes without errors**
  ```bash
  npm run build
  ```
  - Should show: `✓ built in X.XXs`
  - No red error messages

- [ ] **No TypeScript errors**
  ```bash
  npm run type-check
  ```
  - Should show: 0 errors

- [ ] **All files sync to GitHub**
  ```bash
  git status
  ```
  - Should show: `nothing to commit, working tree clean`

---

## 🎉 You're All Set!

If you've checked all boxes above, you have successfully set up Trial Master Pro locally!

### Next Steps:
1. Explore the application
2. Create some test data
3. Examine the code in `src/`
4. Make changes and see hot reload
5. Review the animation components
6. Start building new features!

### Useful Links:
- React docs: https://react.dev
- Tailwind docs: https://tailwindcss.com
- Framer Motion: https://framer.com/motion
- Supabase docs: https://supabase.com/docs

### Questions?
See LOCAL_SETUP.md troubleshooting section or check the code comments.

---

**Happy Coding! 🚀**
