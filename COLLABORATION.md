# 🤝 Collaboration Guide

## Setting up GitHub Repository

### Step 1: Create Repository on GitHub
1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon → **"New repository"**
3. **Repository name:** `mtg-card-shop`
4. **Description:** `Multi-game trading card shop with admin dashboard - MTG, Yu-Gi-Oh!, Pokémon support`
5. Choose **Public** or **Private**
6. **DO NOT** check "Add a README file" (we already have one)
7. Click **"Create repository"**

### Step 2: Connect Local Repository
1. **Edit the setup script:**
   ```bash
   nano setup-github.sh
   # Replace YOUR_USERNAME with your actual GitHub username
   ```

2. **Run the setup script:**
   ```bash
   ./setup-github.sh
   ```

### Step 3: Add Your Partner as Collaborator
1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. Click **"Manage access"** or **"Collaborators"**
4. Click **"Add people"**
5. Enter your partner's GitHub username
6. Choose **"Write"** access (recommended for development)
7. Click **"Add [username] to this repository"**
8. Your partner will receive an email invitation

## 👥 Collaboration Workflow

### For You (Repository Owner)
```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main
```

### For Your Partner
```bash
# First time setup
git clone https://github.com/YOUR_USERNAME/mtg-card-shop.git
cd mtg-card-shop
pnpm install

# Daily workflow
git pull origin main          # Get latest changes
# Make your changes
git add .
git commit -m "Your changes"
git push origin main          # Push changes
```

### Branch-based Workflow (Recommended for bigger features)
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push feature branch
git push origin feature/new-feature

# Create Pull Request on GitHub
# After review and approval, merge to main
```

## 🛠 Development Setup for Your Partner

### 1. Prerequisites
```bash
# Install Node.js 18+ and pnpm
npm install -g pnpm
```

### 2. Clone and Setup
```bash
git clone https://github.com/YOUR_USERNAME/mtg-card-shop.git
cd mtg-card-shop
pnpm install
```

### 3. Database Setup
```bash
# Create database (MySQL required)
# Update .env file with database credentials

# Run migrations
pnpm db:push

# Create admin users
node server/create-admin-users.mjs

# Add sample data (optional)
node server/add-sample-cards.mjs
```

### 4. Environment Variables
Create `.env` file:
```env
DATABASE_URL="mysql://user:password@localhost:3306/mtg_cards"
OAUTH_SERVER_URL="http://localhost:3000"
NODE_ENV="development"
```

### 5. Start Development
```bash
pnpm dev
# App will be available at http://localhost:3000
```

## 🔄 Keeping Code in Sync

### Before Starting Work
```bash
git pull origin main
```

### After Making Changes
```bash
git add .
git commit -m "Descriptive commit message"
git push origin main
```

### If There Are Conflicts
```bash
git pull origin main
# Resolve conflicts in your editor
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

## 📋 Best Practices

### Commit Messages
- Use clear, descriptive messages
- Start with verb: "Add", "Fix", "Update", "Remove"
- Examples:
  - ✅ "Add Pokemon card search functionality"
  - ✅ "Fix authentication bug in admin dashboard"
  - ❌ "updates"
  - ❌ "fix stuff"

### Code Organization
- Create feature branches for big changes
- Test your code before pushing
- Update documentation when needed
- Follow the existing code style

### Communication
- Use GitHub Issues for bug reports and feature requests
- Comment on complex code sections
- Review each other's Pull Requests
- Communicate major changes before implementing

## 🚀 Quick Commands Reference

```bash
# Daily workflow
git status                    # Check current status
git pull origin main         # Get latest changes
git add .                    # Stage all changes
git commit -m "message"      # Commit changes
git push origin main         # Push to GitHub

# Branch workflow
git checkout -b feature-name # Create new branch
git checkout main           # Switch to main branch
git merge feature-name      # Merge branch to main
git branch -d feature-name  # Delete branch

# Useful commands
git log --oneline           # See commit history
git diff                    # See changes
git reset --hard HEAD      # Discard all changes
```

## 🆘 Troubleshooting

### Common Issues
1. **Permission denied**: Make sure you're added as collaborator
2. **Merge conflicts**: Pull latest changes and resolve conflicts
3. **Database issues**: Ensure MySQL is running and .env is correct
4. **Port conflicts**: Change port in package.json if needed

### Getting Help
- Check the README.md for full setup instructions
- Review the CHANGELOG.md for recent changes
- Create GitHub Issues for bugs or questions
- Use GitHub Discussions for general questions

---

**Happy coding! 🎉**