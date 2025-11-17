# Database Setup - Quick Start

**Your Database Credentials:**
```
postgresql://postgres:ecftkpisdzxhjgibogjq@db.ecftkpisdzxhjgibogjq.supabase.co:5432/postgres
```

---

## Quick Setup (Choose One Option)

### Option A: Python Script (Easiest - Recommended)

Run on your local machine:

```bash
cd ~/trial-master-pro
python3 apply-schema.py "postgresql://postgres:ecftkpisdzxhjgibogjq@db.ecftkpisdzxhjgibogjq.supabase.co:5432/postgres"
```

**Automatic features:**
- ✅ Installs psycopg2 if needed
- ✅ Applies all migrations in order
- ✅ Shows progress
- ✅ Provides next steps

---

### Option B: Bash Script (If you have psql)

```bash
cd ~/trial-master-pro
bash run-migrations.sh
```

**Requirements:**
- PostgreSQL client tools (`psql` command)

---

### Option C: Supabase Dashboard (Manual)

1. Go to: https://app.supabase.com/project/ecftkpisdzxhjgibogjq/sql/new
2. Create new query
3. Copy all SQL from: `supabase/migrations/20251116135511_*.sql`
4. Paste into editor
5. Click "Run"
6. Repeat steps 2-5 for:
   - `supabase/migrations/20251117110600_*.sql`
   - `supabase/migrations/20251117111009_*.sql`
   - `supabase/migrations/20251117125953_add_anonymous_qr_access.sql`

---

## After Schema is Created

### 1. Assign Admin Role

Run in Supabase SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'tomsalomon11@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

### 2. Test the Application

1. Log in: https://id-preview--18022a91-b474-404d-9ca6-bf0e26d48e54.lovable.app
2. Create a trial day
3. Add a participant
4. Click "Mark as Arrived" to generate QR code
5. Copy the QR code link
6. Open in **private/incognito window** (no login)
7. Fill out the check-in form
8. Submit and verify success message

---

## Tables Created

- `user_roles` - User role assignments
- `profiles` - User information
- `stations` - Trial stations
- `trial_days` - Trial schedules
- `trial_day_stations` - Station assignments
- `participants` - Participant data with QR codes
- `audit_log` - Activity tracking

---

## Troubleshooting

**"ModuleNotFoundError: No module named 'psycopg2'"**
- The script will auto-install it, or run: `pip install psycopg2-binary`

**"Network is unreachable"**
- Make sure you have internet access
- Check that Supabase server is accessible

**"UNIQUE violation on user_roles"**
- This is normal if admin role already exists
- Script will continue successfully

**Can't see tables in Supabase?**
- Refresh browser (F5 or Ctrl+Shift+R)
- Check left sidebar for "All schemas"
- Wait a few seconds for tables to appear

---

## More Information

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for comprehensive documentation including:
- Database schema diagram
- Security policies
- Role-based access control
- Detailed troubleshooting
- Migration file descriptions

---

**Status:** Database automation scripts ready ✅
**Next Step:** Run migration script (Option A recommended)
