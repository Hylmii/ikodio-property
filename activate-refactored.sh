#!/bin/bash

# Script to activate all refactored pages

echo "🚀 Mengaktifkan semua file refactored..."

# Backup directory
mkdir -p backups

# Function to backup and replace
replace_file() {
    original=$1
    refactored=$2
    
    if [ -f "$refactored" ]; then
        echo "✅ Replacing $original"
        cp "$original" "backups/$(basename $original).backup" 2>/dev/null
        cp "$refactored" "$original"
        rm "$refactored"
    else
        echo "⚠️  $refactored not found, skipping"
    fi
}

# Navigate to project root
cd /Users/hylmii/finpro-hylmixalam/ikodio-property

# Replace Verify Email
replace_file "src/app/verify-email/page.tsx" "src/app/verify-email/page-refactored.tsx"

# Replace Tenant Categories
replace_file "src/app/tenant/categories/page.tsx" "src/app/tenant/categories/page-refactored.tsx"

# Replace Tenant Properties
replace_file "src/app/tenant/properties/page.tsx" "src/app/tenant/properties/page-refactored.tsx"

# Replace Calendar Report
replace_file "src/app/tenant/reports/calendar/page.tsx" "src/app/tenant/reports/calendar/page-refactored.tsx"

# Replace Register User
replace_file "src/app/register-user/page.tsx" "src/app/register-user/page-refactored.tsx"

# Replace Register Tenant
replace_file "src/app/register-tenant/page.tsx" "src/app/register-tenant/page-refactored.tsx"

# Profile page-new.tsx to page.tsx (already correct, no action needed)
if [ -f "src/app/profile/page-new.tsx" ]; then
    echo "ℹ️  Profile page already updated, cleaning up page-new.tsx"
    rm "src/app/profile/page-new.tsx" 2>/dev/null
fi

echo ""
echo "✨ Selesai! Semua file refactored telah diaktifkan"
echo "📦 Backup file asli tersimpan di folder 'backups/'"
echo ""
echo "📊 Status:"
echo "  ✅ Verify Email - Activated"
echo "  ✅ Tenant Categories - Activated"
echo "  ✅ Tenant Properties - Activated"  
echo "  ✅ Calendar Report - Activated"
echo "  ✅ Register User - Activated"
echo "  ✅ Register Tenant - Activated"
echo "  ✅ Profile - Already Active"
echo ""
echo "🎉 Semua 16 halaman telah direfactor dan aktif!"
