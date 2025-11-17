# Audit Page Setup Guide

## Issue: Audit Page Shows Error or No Data

The Audit page (יומן ביקורת) requires users to have the **'admin' role** assigned in Supabase.

---

## Solution: Assign Admin Role to Your User

### Step 1: Go to Supabase Console

Open your Supabase project:
```
https://app.supabase.com/project/[your-project-id]/sql/new
```

Or:
1. Go to https://supabase.com
2. Sign in with your account
3. Open your Trial Master Pro project
4. Click **SQL Editor** on the left menu
5. Click **New Query**

---

### Step 2: Get Your User ID

Run this query to find your user ID:

```sql
SELECT id, email FROM auth.users;
```

This will show all users. Find your user and **copy the UUID** (the id column).

---

### Step 3: Assign Admin Role

Run this query, **replacing YOUR-UUID-HERE** with your actual user ID:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR-UUID-HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

**Example:**
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('a1b2c3d4-e5f6-4a5b-9c8d-e7f8a9b0c1d2', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

### Step 4: Verify It Works

Run this query to verify the role was added:

```sql
SELECT user_id, role FROM public.user_roles WHERE role = 'admin';
```

You should see your user ID and 'admin' role.

---

### Step 5: Test in Your App

1. Go back to your app: http://localhost:5173
2. Do a **hard refresh** (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
3. Click on **יומן ביקורת** (Audit)
4. You should now see the audit log page with all logged actions!

---

## Troubleshooting

### "I don't see any audit logs"

This is normal! Audit logs are only created when:
- A participant is created
- A participant is updated
- A participant is deleted
- A participant marks arrival
- A check-in form is submitted

Try:
1. Go to **Participants** page
2. Create a new participant
3. Go back to **Audit** page
4. You should see the "created" action logged

### "Still shows error message"

The error message says: **"אין לך הרשאות לצפות בלוג האודיט"** (You don't have permission to view the audit log)

This means:
- The admin role was NOT successfully assigned, OR
- You didn't do a hard refresh after assigning the role

Try:
1. Go back to Supabase SQL Editor
2. Run: `SELECT * FROM public.user_roles WHERE role = 'admin';`
3. Verify your user ID is there
4. If not, run the INSERT query again (from Step 3)
5. Do another hard refresh in your app (Ctrl+Shift+R)

### "White screen"

If you see a completely white screen:
1. Open browser console (F12)
2. Go to **Console** tab
3. Look for red error messages
4. Take a screenshot and check what the error says

---

## Quick SQL Cheat Sheet

### Check all users
```sql
SELECT email, id FROM auth.users;
```

### Check all roles assigned
```sql
SELECT user_id, role FROM public.user_roles;
```

### Check audit logs
```sql
SELECT * FROM public.audit_log LIMIT 10;
```

### Add operator role (for other users)
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER-UUID', 'operator')
ON CONFLICT (user_id, role) DO NOTHING;
```

### Add QA role (can view audit logs)
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER-UUID', 'qa_viewer')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## What Each Role Can Do

| Role | Can View Audit Log | Can Manage Participants | Can Manage Trial Days | Can Manage Stations |
|------|-------------------|------------------------|----------------------|-------------------|
| **admin** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **operator** | ❌ No | ✅ Yes | ❌ No | ❌ No |
| **qa_viewer** | ✅ Yes | ❌ No | ❌ No | ❌ No |

---

## Still Not Working?

If the audit page still doesn't work after these steps:

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Close and reopen your browser**
3. **Log out and log in again** to your account
4. **Hard refresh** (Ctrl+Shift+R)
5. **Check browser console** (F12) for errors

If you still see errors, please share:
- What error message appears?
- What do you see in the browser console (F12 → Console tab)?
- Are you logged in with admin@test.com?
- Did you successfully run the INSERT query in Supabase?

---

**The Audit page should now work! 🎉**
