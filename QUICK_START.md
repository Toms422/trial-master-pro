# Quick Start - 5 Minutes to Local Development

**Get Trial Master Pro running in 5 minutes!**

---

## 🚀 Quick Setup (Copy & Paste)

### 1. Clone Repository
```bash
git clone https://github.com/Toms422/trial-master-pro.git
cd trial-master-pro
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create `.env.local`
Create a file named `.env.local` in the root directory:

```env
VITE_SUPABASE_URL=https://pqokxvlezvrpzavdmcjh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3N1cGFiYXNlLmlvIiwicmVmIjoicHFva3h2bGV6dnJwemF2ZG1jamgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDQ0NTU2OCwiZXhwIjoxODU4MjEyMzY4fQ.tV4k1P8H5m3X9Q2R7Z8A1B4C5D6E7F8G9H0I1J2K3
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Browser
```
http://localhost:5173
```

---

## 🔐 Login Credentials

**Admin Account:**
- Email: `admin@test.com`
- Password: `Test123!`

**Operator Account:**
- Email: `operator@test.com`
- Password: `Test123!`

---

## ✨ What You'll See

✅ Professional animations on every page
✅ Responsive design (works on mobile too)
✅ Hebrew/English interface
✅ Real-time data management
✅ Loading animations and visual feedback

---

## 📋 What Works Locally

| Feature | Status |
|---------|--------|
| Authentication | ✅ |
| Dashboard | ✅ |
| Trial Management | ✅ |
| Participant Management | ✅ |
| Check-in System | ✅ |
| Audit Logging | ✅ |
| Admin Controls | ✅ |
| Animations | ✅ |
| RTL (Hebrew) | ✅ |

---

## 🛠 Common Commands

```bash
# Start development (auto-reload on changes)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## ❓ Troubleshooting

### Port 5173 in use?
```bash
npm run dev -- --port 5174
```

### Dependencies error?
```bash
rm -rf node_modules
npm install
```

### Can't connect to Supabase?
- Check `.env.local` exists with correct keys
- Verify internet connection
- Restart `npm run dev`

---

## 📚 Full Documentation

- [LOCAL_SETUP.md](LOCAL_SETUP.md) - Detailed setup guide
- [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md) - Animation components
- [ANIMATIONS_COMPLETE.md](ANIMATIONS_COMPLETE.md) - Full animation system

---

**That's it! You're ready to develop! 🎉**

Edit files in `src/` and watch your changes live-reload in the browser.
