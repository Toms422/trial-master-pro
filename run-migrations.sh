#!/bin/bash

# Database Migration Script for Supabase
# This script applies all SQL migrations to your Supabase PostgreSQL database

set -e  # Exit on first error

echo "🚀 Supabase Database Migration Script"
echo "====================================================================="
echo ""

# Database credentials
DB_PASSWORD="ecftkpisdzxhjgibogjq"
DB_HOST="db.ecftkpisdzxhjgibogjq.supabase.co"
DB_PORT="5432"
DB_USER="postgres"
DB_NAME="postgres"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "📡 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql not found"
    echo ""
    echo "Please install PostgreSQL client tools:"
    echo "  Ubuntu/Debian: sudo apt install postgresql-client"
    echo "  macOS: brew install postgresql"
    echo "  Windows: Download from https://www.postgresql.org/download/windows/"
    echo ""
    echo "Or use the Python script instead:"
    echo "  python3 apply-schema.py \"$DATABASE_URL\""
    exit 1
fi

echo "⏳ Connecting to database..."
echo ""

# Get migration files
MIGRATION_DIR="supabase/migrations"
MIGRATION_FILES=$(ls -1 $MIGRATION_DIR/*.sql | sort)

if [ -z "$MIGRATION_FILES" ]; then
    echo "❌ Error: No migration files found in $MIGRATION_DIR/"
    exit 1
fi

echo "📂 Found migrations:"
for file in $MIGRATION_FILES; do
    echo "   - $(basename $file)"
done
echo ""

# Apply migrations
ERROR_COUNT=0
SUCCESS_COUNT=0

for file in $MIGRATION_FILES; do
    filename=$(basename $file)
    echo "⏳ Applying: $filename"

    if psql "$DATABASE_URL" -f "$file" > /dev/null 2>&1; then
        echo "✅ Applied: $filename"
        ((SUCCESS_COUNT++))
    else
        echo "⚠️  Failed or already applied: $filename"
        ((ERROR_COUNT++))
    fi
    echo ""
done

echo "====================================================================="
echo "📊 Migration Summary:"
echo "   ✅ Successful: $SUCCESS_COUNT"
echo "   ⚠️  Skipped/Failed: $ERROR_COUNT"
echo ""

if [ $SUCCESS_COUNT -gt 0 ] || [ $ERROR_COUNT -gt 0 ]; then
    echo "✅ Schema migration process complete!"
    echo ""
    echo "Next steps:"
    echo "1. Assign admin role to your account:"
    echo "   psql \"$DATABASE_URL\" << EOF"
    echo "   INSERT INTO public.user_roles (user_id, role)"
    echo "   SELECT id, 'admin'"
    echo "   FROM auth.users"
    echo "   WHERE email = 'tomsalomon11@gmail.com'"
    echo "   ON CONFLICT (user_id, role) DO NOTHING;"
    echo "   EOF"
    echo ""
    echo "2. Test the application:"
    echo "   - Go to https://id-preview--18022a91-b474-404d-9ca6-bf0e26d48e54.lovable.app"
    echo "   - Create a trial day"
    echo "   - Add a participant"
    echo "   - Mark as arrived to generate QR code"
    echo "   - Test the check-in form"
    echo ""
else
    echo "❌ No migrations were applied"
    exit 1
fi
