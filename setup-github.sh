#!/bin/bash
# GitHub Repository Setup Script
# Run this after creating your repository on GitHub

echo "🚀 Setting up GitHub repository for MTG Card Shop..."

# Replace YOUR_USERNAME with your actual GitHub username
GITHUB_USERNAME="YOUR_USERNAME"
REPO_NAME="mtg-card-shop"

echo "📝 Please update the GITHUB_USERNAME variable in this script with your actual GitHub username"
echo "Current username: $GITHUB_USERNAME"

if [ "$GITHUB_USERNAME" = "YOUR_USERNAME" ]; then
    echo "⚠️  Please edit this script and replace YOUR_USERNAME with your actual GitHub username"
    echo "Then run the script again"
    exit 1
fi

# Add remote origin
echo "🔗 Adding remote origin..."
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

# Verify remote was added
echo "✅ Remote origin added:"
git remote -v

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

echo "🎉 Repository successfully pushed to GitHub!"
echo "🌐 Your repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "🤝 To collaborate with your partner:"
echo "1. Go to your repository on GitHub"
echo "2. Click 'Settings' tab"
echo "3. Click 'Manage access' or 'Collaborators'"
echo "4. Click 'Add people'"
echo "5. Enter your partner's GitHub username"
echo "6. Choose permission level (Write access recommended)"
echo "7. Send invitation"