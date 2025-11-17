# Supabase Database Setup Guide

**Status:** Ready to apply database schema to Supabase

Your database credentials have been identified:
- **Database URL:** `postgresql://postgres:ecftkpisdzxhjgibogjq@db.ecftkpisdzxhjgibogjq.supabase.co:5432/postgres`
- **Project ID:** `ecftkpisdzxhjgibogjq`
- **User:** `tomsalomon11@gmail.com`

---

## Option 1: Use Python Script (Recommended)

Run the migration script locally on your machine:

```bash
cd /home/tom/trial-master-pro
python3 apply-schema.py "postgresql://postgres:ecftkpisdzxhjgibogjq@db.ecftkpisdzxhjgibogjq.supabase.co:5432/postgres"
```

**Requirements:**
- Python 3.x installed
- Internet access to Supabase server
- `psycopg2` (will auto-install if missing)

**What it does:**
1. Reads all SQL migration files from `supabase/migrations/`
2. Applies them in order to your Supabase PostgreSQL database
3. Shows progress for each migration
4. Provides next steps after completion

---

## Option 2: Use Supabase Dashboard (Manual)

If you prefer to apply the schema manually through the Supabase UI:

1. **Go to SQL Editor:** https://app.supabase.com/project/ecftkpisdzxhjgibogjq/sql/new

2. **Create a new query** by clicking "New query"

3. **Copy and paste ALL of this SQL** (in order):

### Migration 1: Initial Schema
```sql
-- See: supabase/migrations/20251116135511_24d3b4e7-9d00-4ccd-9453-c91321764224.sql
```

### Migration 2: Add Anonymous QR Access
```sql
-- See: supabase/migrations/20251117125953_add_anonymous_qr_access.sql
```

4. **Click "Run"** (or press Ctrl+Enter)

5. **Verify success:** You should see "Query executed successfully"

---

## Option 3: Use Command Line (psql)

If you have PostgreSQL client tools installed:

```bash
cd /home/tom/trial-master-pro

# Set database URL
export DATABASE_URL="postgresql://postgres:ecftkpisdzxhjgibogjq@db.ecftkpisdzxhjgibogjq.supabase.co:5432/postgres"

# Run all migrations
for file in supabase/migrations/*.sql; do
  echo "Applying: $file"
  psql "$DATABASE_URL" -f "$file"
done
```

---

## Migration Files

The following SQL migration files will be applied (in order):

### 1. `20251116135511_24d3b4e7-9d00-4ccd-9453-c91321764224.sql` (Main Schema)
- Creates enum type for roles (admin, operator, qa_viewer)
- Creates all tables:
  - `user_roles` - User role assignments
  - `profiles` - User profiles
  - `stations` - Trial stations
  - `trial_days` - Trial schedule
  - `trial_day_stations` - Junction table
  - `participants` - Participant data with QR codes
  - `audit_log` - Activity logging
- Enables RLS on all tables
- Creates security functions and policies
- Creates triggers for automatic timestamps

### 2. `20251117110600_241a2e15-cf20-40f4-ad78-7b586ff26025.sql`
- Additional schema updates

### 3. `20251117111009_75660304-713d-48e8-bef9-1ddd3a69bbc0.sql`
- Additional schema updates

### 4. `20251117125953_add_anonymous_qr_access.sql` (QR Code Fix)
- Adds RLS policies for anonymous users to access QR code check-in
- Enables public check-in form access while maintaining security

---

## Next Steps After Applying Schema

### Step 1: Assign Admin Role

After the schema is created, assign the admin role to your user account.

**In Supabase SQL Editor**, run:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'tomsalomon11@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

**Verify it worked:**
```sql
SELECT user_id, role, created_at
FROM public.user_roles
WHERE role = 'admin';
```

### Step 2: Test the Application

1. **Log in** to the application at: https://id-preview--18022a91-b474-404d-9ca6-bf0e26d48e54.lovable.app

2. **Create a Trial Day:**
   - Click "Trial Days" in sidebar
   - Click "Add Trial Day"
   - Fill in the form (date, start time, end time, slots)
   - Click "Create"

3. **Add Participants:**
   - Click "Participants" in sidebar
   - Click "Add Participant"
   - Fill in participant details (name, phone, etc.)
   - Click "Add"

4. **Generate QR Code:**
   - Find the participant in the list
   - Click "Mark as Arrived" button
   - A QR code will be generated

5. **Test Check-In Form:**
   - Copy the QR code link or scan the QR code
   - Open it in a **private/incognito window** (no authentication)
   - The check-in form should load
   - Fill out the form and submit
   - You should see a success message

---

## Database Schema Overview

### Tables Created

```
┌─────────────────────────────────────────────────────────┐
│ AUTHENTICATION & USERS                                  │
├─────────────────────────────────────────────────────────┤
│ auth.users (built-in Supabase table)                   │
│ ├─ id: UUID                                             │
│ ├─ email: TEXT                                          │
│ └─ raw_user_meta_data: JSONB                           │
│                                                         │
│ profiles (linked to auth.users)                         │
│ ├─ id: UUID (references auth.users)                    │
│ ├─ full_name: TEXT                                     │
│ ├─ phone: TEXT                                         │
│ └─ timestamps                                           │
│                                                         │
│ user_roles (role assignments)                          │
│ ├─ id: UUID                                             │
│ ├─ user_id: UUID (references auth.users)               │
│ ├─ role: ENUM (admin, operator, qa_viewer)             │
│ └─ created_at                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ TRIAL MANAGEMENT                                        │
├─────────────────────────────────────────────────────────┤
│ stations                                                │
│ ├─ id: UUID                                             │
│ ├─ name: TEXT                                           │
│ ├─ capacity: INTEGER                                    │
│ ├─ description: TEXT                                    │
│ └─ timestamps                                           │
│                                                         │
│ trial_days                                              │
│ ├─ id: UUID                                             │
│ ├─ date: DATE                                           │
│ ├─ start_time: TIME                                     │
│ ├─ end_time: TIME                                       │
│ ├─ available_slots: INTEGER                             │
│ ├─ notes: TEXT                                          │
│ └─ timestamps                                           │
│                                                         │
│ trial_day_stations (junction table)                     │
│ ├─ id: UUID                                             │
│ ├─ trial_day_id: UUID (references trial_days)          │
│ ├─ station_id: UUID (references stations)              │
│ └─ unique(trial_day_id, station_id)                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ PARTICIPANT DATA                                        │
├─────────────────────────────────────────────────────────┤
│ participants                                            │
│ ├─ id: UUID                                             │
│ ├─ trial_day_id: UUID (references trial_days)          │
│ ├─ full_name: TEXT                                      │
│ ├─ phone: TEXT                                          │
│ ├─ ARRIVAL TRACKING                                    │
│ │  ├─ arrived: BOOLEAN (default false)                │
│ │  └─ arrived_at: TIMESTAMPTZ                         │
│ ├─ FORM COMPLETION                                     │
│ │  ├─ form_completed: BOOLEAN (default false)         │
│ │  └─ form_completed_at: TIMESTAMPTZ                  │
│ ├─ TRIAL COMPLETION                                    │
│ │  ├─ trial_completed: BOOLEAN (default false)        │
│ │  └─ trial_completed_at: TIMESTAMPTZ                 │
│ ├─ QR CODE (for check-in)                             │
│ │  └─ qr_code: TEXT (UUID)                            │
│ ├─ PERSONAL DATA                                       │
│ │  ├─ age: INTEGER                                     │
│ │  ├─ birth_date: DATE                                 │
│ │  ├─ weight_kg: DECIMAL(5,2)                         │
│ │  ├─ height_cm: DECIMAL(5,2)                         │
│ │  ├─ gender: TEXT                                     │
│ │  ├─ skin_color: TEXT                                │
│ │  ├─ allergies: TEXT                                 │
│ │  ├─ notes: TEXT                                      │
│ │  └─ digital_signature: TEXT                         │
│ ├─ ASSIGNMENT                                          │
│ │  └─ station_id: UUID (references stations)          │
│ └─ timestamps                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ AUDIT & LOGGING                                         │
├─────────────────────────────────────────────────────────┤
│ audit_log                                               │
│ ├─ id: UUID                                             │
│ ├─ user_id: UUID (references auth.users)               │
│ ├─ action: TEXT (created, updated, deleted, etc.)      │
│ ├─ table_name: TEXT (which table was modified)         │
│ ├─ record_id: UUID (which record was modified)         │
│ ├─ changes: JSONB (what changed)                       │
│ └─ created_at                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Security Features

### Row Level Security (RLS)
All tables have RLS enabled with policies based on user roles:

- **Admin** (`admin` role):
  - Full access to all tables
  - Can manage users, roles, stations, trial days, participants
  - Can view audit logs

- **Operator** (`operator` role):
  - Can view and manage participants
  - Can view trial days and stations
  - Can log activities

- **QA Viewer** (`qa_viewer` role):
  - Read-only access to audit logs
  - Can view trial data for quality assurance

- **Anonymous** (public check-in):
  - Can view participants that have a QR code
  - Can update participants that have a QR code
  - Can view trial days and stations (for context)
  - Cannot access any other data

### Automatic Features
- **Timestamps:** All tables automatically update `created_at` and `updated_at`
- **User Creation:** New users automatically get a profile created
- **Role Functions:** Security definer function checks user roles securely

---

## Troubleshooting

### "Query failed: relation already exists"
**Cause:** One of the migrations was already applied
**Solution:** This is normal - the script will skip it and continue

### "connection to server failed"
**Cause:** Network connectivity issue
**Solution:**
1. Check your internet connection
2. Verify database URL is correct
3. Check that your IP is whitelisted in Supabase (if using IP restrictions)

### "permission denied for schema public"
**Cause:** Insufficient database permissions
**Solution:** Ensure you're using the `postgres` user (superuser)

### Still can't see tables in Supabase dashboard?
**Solution:**
1. Refresh the Supabase dashboard (F5)
2. Hard refresh (Ctrl+Shift+R)
3. Clear browser cache
4. Check "All schemas" in the left sidebar

---

## Support

For questions or issues:
1. Check the migration files in `supabase/migrations/`
2. Review the RLS policies in the Supabase dashboard
3. Check the application logs in the browser console (F12)
4. Review the documentation files:
   - [DESIGN_IMPROVEMENTS.md](DESIGN_IMPROVEMENTS.md)
   - [QR_CODE_FIX.md](QR_CODE_FIX.md)

---

**Next Action:** Run the Python script or manually apply the SQL in Supabase dashboard
