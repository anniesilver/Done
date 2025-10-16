# Done - Git Version Control Strategy

**Project:** Done (React Native Task Manager)
**Developer:** Solo
**Repository:** GitHub (recommended) or GitLab

---

## 📋 Branching Strategy Overview

**Approach:** Hybrid Phase + Feature Branching

This strategy balances clarity (phase-based work) with flexibility (feature branches when needed) while staying simple for solo development.

---

## 🌳 Branch Structure

```
main (production - deployed)
  ↑
develop (integration - testing)
  ↑
  ├── phase-0-setup
  ├── phase-1-core-features
  │     ├── feature/auth (optional sub-features)
  │     ├── feature/task-crud
  │     └── feature/calendar
  ├── phase-2-offline
  │     ├── feature/offline-storage
  │     └── feature/sync-engine
  ├── phase-3-notifications
  │     └── feature/notification-service
  └── phase-4-polish
        ├── feature/animations
        └── feature/accessibility
```

---

## 🎯 Branch Purposes

### 1. `main` (Production Branch)
**Purpose:** Code that is deployed to production (web, iOS, Android)

**Rules:**
- ✅ Only merge from `develop` after thorough testing
- ✅ Always deployable
- ✅ Protected branch (no direct commits)
- ✅ Tag all releases (v1.0.0, v1.1.0, etc.)

**Merges into `main`:**
- After Phase 1 complete → Deploy web to Vercel
- After Phase 2 complete → Update web deployment
- After Phase 4 complete → Deploy iOS + Android

**Deployment:**
```bash
# Web deployment from main
git checkout main
npx expo export:web
vercel --prod

# Mobile deployment from main
eas build --platform ios --profile production
eas build --platform android --profile production
```

---

### 2. `develop` (Integration Branch)
**Purpose:** Integration and testing branch for completed phases

**Rules:**
- ✅ Merge phase branches here first
- ✅ Run tests before merging to `main`
- ✅ Can be unstable occasionally
- ✅ Latest working code lives here

**When to merge to `develop`:**
- When a phase is 100% complete
- All features in that phase tested
- Ready for integration testing

**Deployment:**
- Can deploy to staging/preview environment (Vercel preview)

---

### 3. Phase Branches (Long-Running)

**Branch names:**
- `phase-0-setup`
- `phase-1-core-features`
- `phase-2-offline`
- `phase-3-notifications`
- `phase-4-polish`

**Purpose:** Isolate work for each major phase

**Rules:**
- ✅ Create at start of phase
- ✅ All work for that phase happens here (or in feature branches off this)
- ✅ Commit frequently (every logical checkpoint)
- ✅ Merge to `develop` when phase complete
- ✅ Delete after successful merge to `develop`

**Lifecycle:**
```bash
# Start Phase 1
git checkout develop
git pull origin develop
git checkout -b phase-1-core-features

# Work on Phase 1...
# ... many commits ...

# Phase 1 complete
git checkout develop
git merge phase-1-core-features
git push origin develop

# Deploy to staging for testing
# If tests pass:
git checkout main
git merge develop
git tag -a v0.1.0 -m "Phase 1 complete - Core features (online-only)"
git push origin main --tags

# Delete phase branch (cleanup)
git branch -d phase-1-core-features
git push origin --delete phase-1-core-features
```

---

### 4. Feature Branches (Short-Lived, Optional)

**When to use:**
- Phase work is complex and you want to isolate a specific feature
- Experimenting with something risky
- Want to test a feature independently

**Examples:**
- `feature/auth-screens` (off `phase-1-core-features`)
- `feature/calendar-monthly-view` (off `phase-1-core-features`)
- `feature/sync-engine` (off `phase-2-offline`)

**Rules:**
- ✅ Branch off the relevant phase branch
- ✅ Merge back to phase branch when feature complete
- ✅ Delete after merge
- ✅ Short-lived (1-3 days max)

**Lifecycle:**
```bash
# Start feature within Phase 1
git checkout phase-1-core-features
git checkout -b feature/calendar-monthly-view

# Work on feature...
# ... commits ...

# Feature complete
git checkout phase-1-core-features
git merge feature/calendar-monthly-view

# Delete feature branch
git branch -d feature/calendar-monthly-view
```

**Note:** For solo dev, feature branches are optional. You can commit directly to phase branches if features are small.

---

## 📝 Commit Message Format

**Use Conventional Commits:** `<type>(<scope>): <description>`

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring (no functionality change)
- `style`: Code style changes (formatting, no logic change)
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling
- `perf`: Performance improvements

### Examples:
```bash
# Good commit messages
git commit -m "feat(auth): implement email/password login"
git commit -m "feat(tasks): add task creation form with validation"
git commit -m "fix(calendar): correct date calculation for monthly view"
git commit -m "refactor(stores): move task logic to separate store"
git commit -m "style(components): format TaskItem component"
git commit -m "docs(readme): add setup instructions"
git commit -m "chore(deps): upgrade expo to v50"

# Bad commit messages (avoid)
git commit -m "WIP"
git commit -m "fix stuff"
git commit -m "updated files"
git commit -m "changes"
```

### Commit Body (Optional but Recommended):
```bash
git commit -m "feat(offline): implement sync engine with retry logic

- FIFO queue processing
- Max 3 retry attempts per operation
- Replace temp IDs with server IDs after sync
- Status callbacks for UI feedback

Closes #12"
```

---

## 🔄 Workflow by Phase

### Phase 0: Project Setup

```bash
# Initial setup
mkdir done
cd done
git init
git checkout -b phase-0-setup

# Initial commit
git add .
git commit -m "chore(init): initialize Expo TypeScript project"

# Install dependencies
npm install
git add package.json package-lock.json
git commit -m "chore(deps): install core dependencies (expo, zustand, supabase)"

# Create folder structure
mkdir -p src/{config,types,stores,services,utils,hooks,components,screens,navigation}
git add src/
git commit -m "chore(structure): create project folder structure"

# Set up Supabase config
# ... create files ...
git add src/config/supabase.ts src/config/theme.ts .env.example
git commit -m "feat(config): configure Supabase and theme constants"

# Set up Git ignore
git add .gitignore
git commit -m "chore(git): configure .gitignore for React Native/Expo"

# Phase 0 complete - merge to develop
git checkout -b develop
git merge phase-0-setup
git push -u origin develop

# Create remote repository on GitHub
git remote add origin https://github.com/yourusername/done.git
git push -u origin develop

# Tag initial setup
git tag -a v0.0.1 -m "Phase 0 complete - Project setup"
git push origin --tags
```

---

### Phase 1: Core Features

```bash
# Start Phase 1
git checkout develop
git checkout -b phase-1-core-features

# 1.1 Authentication (8 hours)
git add src/stores/authStore.ts src/services/supabaseService.ts
git commit -m "feat(auth): implement auth store and Supabase service"

git add src/screens/auth/
git commit -m "feat(auth): create login and signup screens"

git add src/navigation/AuthNavigator.tsx
git commit -m "feat(auth): add auth navigation"

# Test auth...
git commit -m "fix(auth): correct email validation regex"

# 1.2 Data Stores (6 hours)
git add src/stores/taskStore.ts
git commit -m "feat(tasks): implement task store with CRUD actions"

git add src/stores/categoryStore.ts
git commit -m "feat(categories): implement category store"

git add src/stores/uiStore.ts src/stores/timerStore.ts
git commit -m "feat(stores): add UI and timer stores"

git add src/services/recurringTasks.ts src/utils/dateHelpers.ts
git commit -m "feat(tasks): add recurring task logic and date utilities"

# 1.3 UI Components (12 hours)
git add src/components/common/
git commit -m "feat(components): create common UI components (Button, Input, Card)"

git add src/components/task/TaskItem.tsx src/components/task/TaskList.tsx
git commit -m "feat(tasks): create TaskItem and TaskList components"

git add src/components/task/TaskForm.tsx
git commit -m "feat(tasks): create TaskForm with all fields"

git add src/components/category/
git commit -m "feat(categories): create category components"

git add src/components/calendar/
git commit -m "feat(calendar): create calendar components (grid, day, weekly)"

git add src/components/timer/
git commit -m "feat(timer): create timer components"

# 1.4 Screens (18 hours)
git add src/screens/main/TodayScreen.tsx
git commit -m "feat(views): implement Today screen with live clock"

git add src/screens/main/TasksScreen.tsx
git commit -m "feat(views): implement Tasks/List screen with category filtering"

git add src/screens/main/CalendarScreen.tsx
git commit -m "feat(views): implement Calendar screen with monthly and weekly views"

git add src/screens/modals/
git commit -m "feat(modals): create task detail and timer modals"

git add src/navigation/MainNavigator.tsx src/navigation/AppNavigator.tsx
git commit -m "feat(navigation): implement bottom tab navigation and app navigator"

# 1.5 Real-time (4 hours)
git add src/stores/taskStore.ts src/stores/categoryStore.ts
git commit -m "feat(realtime): add Supabase real-time subscriptions"

# 1.6 Recurring Tasks (2 hours)
git add src/stores/taskStore.ts
git commit -m "feat(tasks): implement recurring task instance creation on completion"

# Phase 1 complete - test everything
# ... testing ...

# Fix bugs found during testing
git commit -m "fix(calendar): correct task filtering for weekly view"
git commit -m "fix(tasks): prevent duplicate default categories"

# Merge to develop
git checkout develop
git merge phase-1-core-features

# Test on develop
# ... integration testing ...

# Deploy to main (first web deployment!)
git checkout main
git merge develop
git tag -a v0.1.0 -m "Phase 1 complete - Core features (online-only)

Features:
- Authentication (email/password)
- Task CRUD with recurring tasks
- Category management
- Three views (Today, Tasks, Calendar)
- Timer
- Real-time sync across devices

Deployed to: https://done-app.vercel.app"
git push origin main --tags

# Deploy web
npx expo export:web
vercel --prod

# Cleanup
git branch -d phase-1-core-features
git push origin --delete phase-1-core-features
```

---

### Phase 2: Offline Architecture

```bash
# Start Phase 2
git checkout develop
git pull origin develop
git checkout -b phase-2-offline

# 2.1 Offline Storage (8 hours)
git add src/services/offlineStorage.ts src/types/sync.ts
git commit -m "feat(offline): implement AsyncStorage service with queue"

# 2.2 Connectivity Manager (4 hours)
git add src/services/connectivityManager.ts src/hooks/useConnectivity.ts
git commit -m "feat(offline): add connectivity manager with NetInfo"

# 2.3 Sync Engine (8 hours)
git add src/services/syncEngine.ts src/stores/syncStore.ts
git commit -m "feat(offline): implement sync engine with FIFO queue and retry logic"

# Update stores for offline routing
git add src/stores/taskStore.ts src/stores/categoryStore.ts
git commit -m "feat(offline): add offline operation routing to stores"

# 2.4 UI Updates (4 hours)
git add src/components/sync/
git commit -m "feat(offline): add connectivity badge and sync button components"

git add src/screens/main/
git commit -m "feat(offline): integrate offline UI indicators in screens"

# Testing offline mode
git commit -m "fix(offline): correct temp ID replacement after sync"
git commit -m "fix(sync): handle network errors during online operations"

# Phase 2 complete
git checkout develop
git merge phase-2-offline

# Deploy update
git checkout main
git merge develop
git tag -a v0.2.0 -m "Phase 2 complete - Offline-first architecture"
git push origin main --tags

# Cleanup
git branch -d phase-2-offline
```

---

### Phase 3: Notifications

```bash
# Start Phase 3
git checkout develop
git checkout -b phase-3-notifications

# 3.1 Notification Service (8 hours)
git add src/services/notificationService.ts src/types/notification.ts
git commit -m "feat(notifications): implement notification service with expo-notifications"

# Update database schema (manual in Supabase, document in commit)
git add CHANGELOG.md
git commit -m "chore(db): add reminder_time column to tasks table

SQL executed:
ALTER TABLE tasks ADD COLUMN reminder_time TIMESTAMPTZ;
CREATE INDEX idx_tasks_reminder_time ON tasks(reminder_time);"

# 3.2 Integrate with CRUD (6 hours)
git add src/components/task/TaskForm.tsx src/components/task/TaskReminderSelector.tsx
git commit -m "feat(notifications): add reminder selector to task form"

git add src/stores/taskStore.ts
git commit -m "feat(notifications): schedule/cancel notifications on task CRUD"

# 3.3 Notification Actions (4 hours)
git add src/App.tsx
git commit -m "feat(notifications): add notification tap handlers and actions"

git add src/components/task/TaskItem.tsx
git commit -m "feat(notifications): add reminder indicator icon to tasks"

# 3.4 Background Handling (2 hours)
git add app.json
git commit -m "chore(notifications): configure background notification handling"

git commit -m "fix(notifications): deduplicate scheduled notifications"

# Phase 3 complete
git checkout develop
git merge phase-3-notifications

git checkout main
git merge develop
git tag -a v0.3.0 -m "Phase 3 complete - Notification reminders"
git push origin main --tags

git branch -d phase-3-notifications
```

---

### Phase 4: Polish & Deployment

```bash
# Start Phase 4
git checkout develop
git checkout -b phase-4-polish

# 4.1 Animations (6 hours)
git add package.json
git commit -m "chore(deps): add react-native-reanimated and expo-haptics"

git add src/components/
git commit -m "feat(animations): add fade/slide animations to modals and lists"

git commit -m "feat(animations): add haptic feedback to interactions"

# 4.2 Accessibility (4 hours)
git add src/components/ src/screens/
git commit -m "feat(a11y): add accessibility labels and hints to all interactive elements"

git commit -m "feat(a11y): improve keyboard navigation for web"

# 4.3 Error Handling (4 hours)
git add src/components/common/ErrorBoundary.tsx
git commit -m "feat(errors): add global error boundary"

git add src/stores/
git commit -m "feat(errors): improve error messages and retry mechanisms"

# 4.4 Testing (4 hours)
git add __tests__/
git commit -m "test: add unit tests for utils and services"

git commit -m "fix(calendar): resolve rendering issue with large task lists"
git commit -m "perf(tasks): optimize TaskList rendering with React.memo"

# 4.5 Final Polish
git commit -m "style: format code with Prettier"
git commit -m "docs: update README with setup instructions"

# Phase 4 complete
git checkout develop
git merge phase-4-polish

# Final production release
git checkout main
git merge develop
git tag -a v1.0.0 -m "Version 1.0.0 - Production Release

Complete feature set:
- Authentication
- Task management (CRUD, recurring)
- Category system
- Three views (Today, Tasks, Calendar)
- Timer
- Offline-first architecture
- Reminder notifications
- Real-time sync
- Polished animations and accessibility

Platforms: Web, iOS, Android"
git push origin main --tags

# Deploy all platforms
npx expo export:web && vercel --prod
eas build --platform ios --profile production
eas build --platform android --profile production
eas submit --platform ios
eas submit --platform android

git branch -d phase-4-polish
```

---

## 🔥 Hotfix Workflow

If critical bug found in production:

```bash
# Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-sync-bug

# Fix the bug
git add src/services/syncEngine.ts
git commit -m "fix(sync): resolve race condition in queue processing"

# Merge to main immediately
git checkout main
git merge hotfix/critical-sync-bug
git tag -a v1.0.1 -m "Hotfix: Critical sync bug"
git push origin main --tags

# Also merge to develop to keep in sync
git checkout develop
git merge hotfix/critical-sync-bug
git push origin develop

# Delete hotfix branch
git branch -d hotfix/critical-sync-bug

# Redeploy
vercel --prod
```

---

## 📌 Git Tags & Releases

### Semantic Versioning

Format: `vMAJOR.MINOR.PATCH`

**Examples:**
- `v0.0.1` - Phase 0 complete (setup)
- `v0.1.0` - Phase 1 complete (core features online)
- `v0.2.0` - Phase 2 complete (offline)
- `v0.3.0` - Phase 3 complete (notifications)
- `v1.0.0` - Production release
- `v1.0.1` - Hotfix
- `v1.1.0` - New feature (e.g., dark mode)
- `v2.0.0` - Breaking change (e.g., API redesign)

### Tagging Strategy

```bash
# Lightweight tag (simple)
git tag v0.1.0

# Annotated tag (recommended - includes message)
git tag -a v0.1.0 -m "Phase 1 complete - Core features"

# Tag with detailed description
git tag -a v1.0.0 -m "Version 1.0.0 - Production Release

Complete feature set:
- Authentication
- Task management (CRUD, recurring)
- Category system
- Three views (Today, Tasks, Calendar)
- Timer
- Offline-first architecture
- Reminder notifications
- Real-time sync
- Polished animations and accessibility

Deployed to:
- Web: https://done-app.vercel.app
- iOS: App Store (pending review)
- Android: Google Play (pending review)"

# Push tags
git push origin --tags

# Push specific tag
git push origin v1.0.0

# List all tags
git tag

# Show tag details
git show v1.0.0

# Delete tag (if mistake)
git tag -d v0.1.0
git push origin --delete v0.1.0
```

### GitHub Releases

After pushing tag, create GitHub release:
1. Go to repository → Releases → "Draft a new release"
2. Select tag
3. Add release notes
4. Attach build artifacts (APK, IPA) if needed
5. Publish

---

## 📦 .gitignore

Essential for React Native/Expo projects:

```bash
# Dependencies
node_modules/
.pnp
.pnp.js

# Expo
.expo/
.expo-shared/
dist/
web-build/

# Environment variables
.env
.env.local
.env.*.local

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
*.log

# Testing
coverage/

# Build artifacts
*.ipa
*.apk
*.aab

# Android
android/app/build/
android/.gradle/
android/local.properties

# iOS
ios/Pods/
ios/.xcode.cache/
ios/build/
*.pbxuser
*.mode1v3

# Temporary files
*.tmp
tmp/

# Supabase config (IMPORTANT - never commit credentials)
src/config/supabase.ts  # If hardcoded credentials
# Instead, use .env and commit .env.example
```

**Always commit `.env.example`:**
```bash
# .env.example (safe to commit)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 🚀 Deployment Branches

### Web Deployment (Vercel)

**Connected branches:**
- `main` → Production (https://done-app.com)
- `develop` → Preview (https://done-app-dev.vercel.app)
- Phase branches → Auto preview URLs

**Setup:**
```bash
# Install Vercel CLI
npm install -g vercel

# Link project
vercel link

# Configure environment variables in Vercel dashboard
# Then deploy from main
git checkout main
vercel --prod
```

### Mobile Deployment (EAS)

**Build from `main` only:**
```bash
# iOS production
git checkout main
eas build --platform ios --profile production

# Android production
git checkout main
eas build --platform android --profile production
```

**Preview builds from `develop`:**
```bash
git checkout develop
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

---

## 📊 Git Workflow Summary

| Phase | Branch | Merge To | Tag | Deploy |
|-------|--------|----------|-----|--------|
| Phase 0 | `phase-0-setup` | `develop` | `v0.0.1` | - |
| Phase 1 | `phase-1-core-features` | `develop` → `main` | `v0.1.0` | Web (Vercel) |
| Phase 2 | `phase-2-offline` | `develop` → `main` | `v0.2.0` | Web update |
| Phase 3 | `phase-3-notifications` | `develop` → `main` | `v0.3.0` | Web update |
| Phase 4 | `phase-4-polish` | `develop` → `main` | `v1.0.0` | Web + iOS + Android |
| Hotfix | `hotfix/*` | `main` + `develop` | `v1.0.1` | All platforms |

---

## ✅ Git Best Practices

### 1. Commit Frequently
- After completing a logical unit of work
- Don't wait until end of day
- Aim for 5-10 commits per day of work

### 2. Write Good Commit Messages
- Use conventional commits format
- First line: concise summary (50 chars)
- Body: detailed explanation if needed
- Reference issues: "Closes #12"

### 3. Keep Branches Up to Date
```bash
# Before starting work each day
git checkout develop
git pull origin develop
git checkout phase-1-core-features
git merge develop  # Or rebase if you prefer
```

### 4. Test Before Merging
- Run app on all platforms (iOS, Android, Web)
- No console errors
- All features working

### 5. Clean Up Old Branches
```bash
# List all branches
git branch -a

# Delete local branch
git branch -d phase-1-core-features

# Delete remote branch
git push origin --delete phase-1-core-features

# Prune remote branches that no longer exist
git fetch --prune
```

### 6. Use .gitignore Properly
- Never commit `node_modules/`
- Never commit `.env` with credentials
- Never commit build artifacts

### 7. Backup Regularly
- Push to GitHub daily
- GitHub protects against local data loss

---

## 🎯 Quick Reference

### Start New Phase
```bash
git checkout develop
git pull
git checkout -b phase-X-name
```

### Daily Work
```bash
# Make changes
git add .
git commit -m "feat(scope): description"
git push origin phase-X-name  # Backup to GitHub
```

### Complete Phase
```bash
git checkout develop
git merge phase-X-name
git push origin develop

# If ready for production
git checkout main
git merge develop
git tag -a vX.X.X -m "Description"
git push origin main --tags
```

### Hotfix
```bash
git checkout main
git checkout -b hotfix/bug-name
# Fix bug
git commit -m "fix(scope): description"
git checkout main
git merge hotfix/bug-name
git checkout develop
git merge hotfix/bug-name
git tag -a vX.X.X -m "Hotfix description"
git push origin main develop --tags
```

---

## 📝 Commit Log Example

After Phase 1, your `git log --oneline` should look like:

```
a1b2c3d (HEAD -> main, tag: v0.1.0, origin/main) Merge branch 'develop'
b2c3d4e (develop) Merge branch 'phase-1-core-features'
c3d4e5f feat(tasks): implement recurring task instance creation
d4e5f6g feat(realtime): add Supabase real-time subscriptions
e5f6g7h feat(navigation): implement bottom tab navigation
f6g7h8i feat(views): implement Calendar screen with monthly and weekly views
g7h8i9j feat(views): implement Tasks/List screen with category filtering
h8i9j0k feat(views): implement Today screen with live clock
i9j0k1l feat(timer): create timer components
j0k1l2m feat(calendar): create calendar components
k1l2m3n feat(categories): create category components
l2m3n4o feat(tasks): create TaskForm with all fields
m3n4o5p feat(tasks): create TaskItem and TaskList components
n4o5p6q feat(components): create common UI components
o5p6q7r feat(tasks): add recurring task logic and date utilities
p6q7r8s feat(stores): add UI and timer stores
q7r8s9t feat(categories): implement category store
r8s9t0u feat(tasks): implement task store with CRUD actions
s9t0u1v feat(auth): add auth navigation
t0u1v2w feat(auth): create login and signup screens
u1v2w3x feat(auth): implement auth store and Supabase service
v2w3x4y feat(config): configure Supabase and theme constants
w3x4y5z chore(structure): create project folder structure
x4y5z6a chore(deps): install core dependencies
y5z6a7b chore(init): initialize Expo TypeScript project
```

---

## 🚀 Ready to Initialize Git?

**Next steps:**

1. Create GitHub repository (private recommended)
2. Initialize local Git
3. Create initial commit
4. Push to GitHub
5. Start Phase 0

**Commands:**
```bash
cd taskflow
git init
git checkout -b phase-0-setup
git add .
git commit -m "chore(init): initial commit - TaskFlow codebase"
git remote add origin https://github.com/yourusername/done.git
git push -u origin phase-0-setup
```

Let me know when you're ready to start Phase 0! 🎯
