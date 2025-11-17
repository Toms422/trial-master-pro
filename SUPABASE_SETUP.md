# Supabase Setup Guide - Create New Project

If your old Supabase project no longer exists, you can create a new one and connect it to the Trial Master Pro application.

---

## Step 1: Create a New Supabase Project

### 1.1 Go to Supabase Console
- Open https://supabase.com
- Sign in with your account (or create one if you don't have it)
- Click **"New Project"** button

### 1.2 Fill in Project Details
- **Project Name**: `trial-master-pro` (or any name you prefer)
- **Database Password**: Create a strong password (save it somewhere safe)
- **Region**: Choose the region closest to you (e.g., `eu-west-1` for Europe, `us-east-1` for US)
- Click **"Create new project"**

Wait 2-3 minutes for the project to be created...

### 1.3 Get Your Credentials
Once the project is created:
1. Click on your project name
2. Click **"Settings"** (⚙️ icon) on the left sidebar
3. Click **"API"** under Settings
4. Copy these two values:
   - **Project URL** (starts with `https://`)
   - **Anon (public) Key** (long string starting with `eyJ...`)

Save these values - you'll need them next!

---

## Step 2: Update Your Application Configuration

### 2.1 Open Your .env.local File
In the Trial Master Pro folder, open `.env.local` file and update it:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
```

**Example:**
```env
VITE_SUPABASE_URL=https://xyzabcdef123456.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3N1cGFiYXNlLmlvIn0.abc123...
```

---

## Step 3: Apply Database Schema

### 3.1 Go to Supabase SQL Editor
1. Open your Supabase project
2. Click **"SQL Editor"** on the left sidebar
3. Click **"New Query"**

### 3.2 Copy the Database Schema
All the SQL is in: `supabase/migrations/20251116135511_24d3b4e7-9d00-4ccd-9453-c91321764224.sql`

You have two options:

**Option A: Copy the entire SQL file**
1. Open the SQL migration file in your code editor
2. Copy all the SQL code
3. Paste it into Supabase SQL Editor
4. Click **"Execute"** or press **Ctrl+Enter**

**Option B: Use Supabase CLI (Advanced)**
If you have Node.js installed:
```bash
npm install -g supabase
supabase link --project-ref YOUR-PROJECT-ID
supabase db push
```

---

## Step 4: Set Up User Roles

### 4.1 Get Your User ID
Run this SQL query in Supabase SQL Editor:

```sql
SELECT id, email FROM auth.users;
```

This will show all users. If you haven't created any users yet, you'll need to:
1. Go back to your app: http://localhost:5173
2. Sign up with an email address (e.g., admin@test.com)
3. Come back and run the query again to get your user ID

### 4.2 Assign Admin Role
Once you have your user ID, run this query (replace `YOUR-UUID` with your actual ID):

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR-UUID', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## Step 5: Update Connection in Your App

### 5.1 Restart Development Server
```bash
npm run dev
```

The dev server should automatically pick up the new `.env.local` values.

If it doesn't work:
1. Stop the dev server (Ctrl+C)
2. Close your browser
3. Run `npm run dev` again
4. Open http://localhost:5173 in a fresh browser window

### 5.2 Test the Connection
1. Try to sign up with a new account
2. If it works, you're connected! ✅
3. Navigate to **יומן ביקורת** (Audit page)
4. If you see the audit logs, everything is working!

---

## Complete Setup Checklist

- [ ] Created new Supabase project at https://supabase.com
- [ ] Saved Project URL and Anon Key
- [ ] Updated `.env.local` file with new credentials
- [ ] Applied database schema via SQL Editor
- [ ] Created a user account (signed up in the app)
- [ ] Assigned admin role to your user
- [ ] Restarted dev server (`npm run dev`)
- [ ] Can see the app and log in
- [ ] Can access Audit page with audit logs visible

---

## Troubleshooting

### "Cannot POST /auth/v1/signup"
- Your Supabase URL is incorrect in `.env.local`
- Fix: Copy the correct URL from Supabase Settings > API

### "Anon key is invalid"
- Your Anon Key is incorrect in `.env.local`
- Fix: Copy the correct key from Supabase Settings > API
- Restart dev server after updating

### "Relation does not exist"
- The SQL schema wasn't applied to your new project
- Fix: Go back to Step 3 and run all the SQL commands

### "Permission denied"
- Your user doesn't have the admin role assigned
- Fix: Go back to Step 4.2 and make sure you ran the INSERT query

### "Still seeing old project errors"
1. Delete `.env.local`
2. Create a new `.env.local` with correct credentials
3. Stop dev server (Ctrl+C)
4. Run `npm run dev` again

---

## Quick Reference

**Supabase Console**: https://app.supabase.com
**Your Project**: https://app.supabase.com/projects
**SQL Editor**: https://app.supabase.com/project/[project-id]/sql/new

**Environment Variables Location**: `.env.local` (in project root)

**Dev Server**: `npm run dev`
**App URL**: http://localhost:5173

---

## What's Created in the New Project

The database schema includes:
- ✅ Users & Authentication (via Supabase Auth)
- ✅ User Roles table (for permissions)
- ✅ Profiles table (user information)
- ✅ Stations table (test stations)
- ✅ Trial Days table (test schedules)
- ✅ Participants table (trial participants)
- ✅ Audit Log table (action tracking)
- ✅ Row Level Security policies (data protection)

All tables are automatically created when you run the SQL schema.

---

## Next Steps

Once your new Supabase project is connected:

1. **Create a test user** - Sign up with admin@test.com
2. **Assign roles** - Make yourself an admin
3. **Create test data** - Add stations, trial days, participants
4. **Test features** - Verify all pages work
5. **Check audit logs** - See if actions are being logged

---

## Still Having Issues?

If something doesn't work:

1. **Check browser console** (F12 → Console tab)
   - Look for error messages
   - They usually tell you what's wrong

2. **Check .env.local** file
   - Make sure it has correct credentials
   - Make sure there are no typos

3. **Check Supabase project**
   - Make sure the project exists and is active
   - Go to https://app.supabase.com/projects
   - Your project should be in the list

4. **Clear everything and start over**
   - Delete `.env.local`
   - Stop dev server (Ctrl+C)
   - Create new `.env.local`
   - Run `npm run dev` again

---

**You now have a fresh Supabase project connected to Trial Master Pro! 🎉**
