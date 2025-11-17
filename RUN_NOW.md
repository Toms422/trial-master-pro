# 🚀 Run Database Setup NOW

Your database password has been configured. Everything is ready to go!

---

## Step 1: Run the Migration Script

On your local machine, navigate to the project and run:

### Option A: Python (Recommended)

```bash
cd ~/trial-master-pro
python3 apply-schema.py "postgresql://postgres:Tomsal979@db.ecftkpisdzxhjgibogjq.supabase.co:5432/postgres"
```

The script will:
1. ✅ Install `psycopg2` if needed
2. ✅ Apply all 4 SQL migrations in order
3. ✅ Show progress for each one
4. ✅ Display next steps

---

### Option B: Bash Script (If you have psql)

```bash
cd ~/trial-master-pro
bash run-migrations.sh
```

The script automatically uses your configured password.

---

### Option C: Manual in Supabase Dashboard

If you prefer to do it manually:

1. Go to: https://app.supabase.com/project/ecftkpisdzxhjgibogjq/sql/new
2. Create a new query
3. Copy and run the SQL from each file in order:
   - `supabase/migrations/20251116135511_24d3b4e7-9d00-4ccd-9453-c91321764224.sql`
   - `supabase/migrations/20251117110600_241a2e15-cf20-40f4-ad78-7b586ff26025.sql`
   - `supabase/migrations/20251117111009_75660304-713d-48e8-bef9-1ddd3a69bbc0.sql`
   - `supabase/migrations/20251117125953_add_anonymous_qr_access.sql`

---

## Step 2: After Migrations Complete

Run this SQL in Supabase SQL Editor to assign admin role:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'tomsalomon11@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

**Verify it worked:**
```sql
SELECT * FROM public.user_roles WHERE role = 'admin';
```

---

## Step 3: Test the Application

1. **Log in:** https://id-preview--18022a91-b474-404d-9ca6-bf0e26d48e54.lovable.app

2. **Create Trial Day:**
   - Click "Trial Days"
   - Click "Add Trial Day"
   - Fill in date, time, slots
   - Save

3. **Add Participant:**
   - Click "Participants"
   - Click "Add Participant"
   - Fill in name, phone, etc.
   - Save

4. **Generate QR Code:**
   - Find participant in list
   - Click "Mark as Arrived"
   - QR code will generate
   - Copy the link

5. **Test Check-In:**
   - Open QR code link in **private/incognito window**
   - Fill out form
   - Submit
   - You should see success message ✅

---

## Your Database Credentials

If you need them:

```
Host: db.ecftkpisdzxhjgibogjq.supabase.co
Port: 5432
User: postgres
Password: Tomsal979
Database: postgres
```

Full URL: `postgresql://postgres:Tomsal979@db.ecftkpisdzxhjgibogjq.supabase.co:5432/postgres`

---

## Migrations to be Applied

| File | Purpose |
|------|---------|
| 20251116135511 | Create all tables (user_roles, profiles, stations, trial_days, trial_day_stations, participants, audit_log) |
| 20251117110600 | Additional schema updates |
| 20251117111009 | Additional schema updates |
| 20251117125953 | QR code anonymous access policies |

---

## What Gets Created

### Tables
- `user_roles` - Role assignments
- `profiles` - User information
- `stations` - Trial stations
- `trial_days` - Trial schedules
- `trial_day_stations` - Assignments
- `participants` - Participant data + QR codes
- `audit_log` - Activity tracking

### Security
- Row Level Security (RLS) on all tables
- Role-based access control (admin, operator, qa_viewer)
- Anonymous access for QR code check-in
- Automatic timestamp updates
- Audit logging

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'psycopg2'"
```bash
pip install psycopg2-binary
```

### "connection to server failed" or "Network is unreachable"
- This script must be run on your local machine with internet access
- The current environment has network restrictions
- Run from your terminal instead: `python3 apply-schema.py "..."`

### "UNIQUE violation" or "already exists"
- This is normal if migrations already ran
- Script will skip them and continue

### Can't see tables in Supabase?
- Refresh browser (Ctrl+Shift+R)
- Check left sidebar for "All schemas"
- Wait a few seconds

---

## ✅ Everything is Ready!

All scripts are configured with your password. Just run the migration script on your local machine and you're done!

**Recommended:** Use Option A (Python) - it's the simplest and most reliable.

```bash
python3 apply-schema.py "postgresql://postgres:Tomsal979@db.ecftkpisdzxhjgibogjq.supabase.co:5432/postgres"
```

---

For more details, see:
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Comprehensive documentation
- [DATABASE_SETUP_QUICK_START.md](DATABASE_SETUP_QUICK_START.md) - Quick reference
