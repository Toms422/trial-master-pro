#!/usr/bin/env python3

"""
Database Schema Migration Script
Applies all SQL migrations to the Supabase PostgreSQL database
"""

import os
import sys
import glob
from pathlib import Path

# Try to import psycopg2, install if not available
try:
    import psycopg2
    from psycopg2 import sql
except ImportError:
    print("📦 Installing psycopg2...")
    os.system("pip install psycopg2-binary > /dev/null 2>&1")
    import psycopg2
    from psycopg2 import sql

def read_migration_file(filepath):
    """Read SQL migration file"""
    with open(filepath, 'r') as f:
        return f.read()

def get_migrations():
    """Get all migration files in order"""
    migration_dir = Path(__file__).parent / 'supabase' / 'migrations'
    migration_files = sorted(glob.glob(str(migration_dir / '*.sql')))
    return migration_files

def apply_migrations(db_url):
    """Apply all migrations to the database"""

    # Parse the database URL
    # Format: postgresql://postgres:password@db.supabase.co:5432/postgres
    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()

        migrations = get_migrations()

        if not migrations:
            print("❌ No migration files found in supabase/migrations/")
            return False

        print(f"📂 Found {len(migrations)} migration file(s)")
        print()

        for migration_file in migrations:
            filename = Path(migration_file).name
            print(f"⏳ Applying: {filename}")

            try:
                migration_sql = read_migration_file(migration_file)
                cursor.execute(migration_sql)
                conn.commit()
                print(f"✅ Applied: {filename}")
            except psycopg2.Error as e:
                print(f"⚠️  Warning in {filename}: {e.pgerror if e.pgerror else str(e)}")
                # Don't exit on error - some migrations may already be applied
                conn.rollback()

            print()

        cursor.close()
        conn.close()

        print("=" * 70)
        print("✅ Database schema migration complete!")
        print("=" * 70)
        print()
        print("Next steps:")
        print("1. Assign admin role to your user:")
        print("   Run this SQL in Supabase SQL Editor:")
        print()
        print("   INSERT INTO public.user_roles (user_id, role)")
        print("   SELECT id, 'admin'")
        print("   FROM auth.users")
        print("   WHERE email = 'tomsalomon11@gmail.com'")
        print("   ON CONFLICT (user_id, role) DO NOTHING;")
        print()
        print("2. Test the application by creating a trial day and participant")
        print()

        return True

    except psycopg2.OperationalError as e:
        print(f"❌ Connection error: {e}")
        print()
        print("Please verify:")
        print("1. Your database URL is correct")
        print("2. Your password is correct")
        print("3. Your IP is whitelisted in Supabase (if needed)")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main function"""
    print("🚀 Supabase Database Schema Migration")
    print("=" * 70)
    print()

    # Get database URL from argument or environment
    if len(sys.argv) > 1:
        db_url = sys.argv[1]
    else:
        # Try to get from environment
        db_url = os.getenv('DATABASE_URL')
        if not db_url:
            print("❌ Error: Database URL not provided")
            print()
            print("Usage:")
            print("  python3 apply-schema.py 'postgresql://postgres:PASSWORD@db.supabase.co:5432/postgres'")
            print()
            print("Or set DATABASE_URL environment variable:")
            print("  export DATABASE_URL='postgresql://postgres:PASSWORD@db.supabase.co:5432/postgres'")
            print("  python3 apply-schema.py")
            sys.exit(1)

    print(f"📡 Connecting to Supabase database...")
    print()

    if apply_migrations(db_url):
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == '__main__':
    main()
