#!/bin/bash

# Admin Setup Script for Comedy Connect
# This script helps you set up your admin access

echo "🔧 Comedy Connect Admin Setup"
echo "============================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating one..."
    touch .env
fi

# Get admin email
echo "Please enter your admin email address:"
read -p "Email: " admin_email

if [ -z "$admin_email" ]; then
    echo "❌ Email is required. Exiting."
    exit 1
fi

# Check if ADMIN_EMAIL already exists in .env
if grep -q "ADMIN_EMAIL=" .env; then
    echo "📝 ADMIN_EMAIL already exists in .env. Updating it..."
    sed -i '' "s/ADMIN_EMAIL=.*/ADMIN_EMAIL=$admin_email/" .env
else
    echo "📝 Adding ADMIN_EMAIL to .env..."
    echo "ADMIN_EMAIL=$admin_email" >> .env
fi

echo ""
echo "✅ Admin setup completed!"
echo ""
echo "Next steps:"
echo "1. Make sure you have a user account with this email: $admin_email"
echo "2. Set your user role to 'ADMIN' in the database"
echo "3. Restart your development server"
echo ""
echo "To set yourself as admin in the database, run:"
echo "npx prisma studio"
echo "Then find your user and set role to 'ADMIN'"
echo ""
echo "Or run the SQL directly:"
echo "UPDATE \"User\" SET role = 'ADMIN' WHERE email = '$admin_email';"
