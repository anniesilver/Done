# Done - Cross-Platform Task Management App
## Revised React Native Development Plan

**Last Updated:** October 16, 2025
**Status:** APPROVED - Ready for Implementation

---

## 📋 Executive Summary

**Project Name:** Done
**Previous Project:** TaskFlow (web-only, vanilla JavaScript)
**Technology Stack:** React Native + Expo (Managed) + Supabase + TypeScript
**Target Platforms:** iOS, Android, Web (React Native Web)
**Development Timeline:** Flexible (Solo development)
**Estimated Development Hours:** 100-130 hours

**Strategic Decision:** Complete rewrite in React Native to:
- Maintain single codebase for all platforms (web, iOS, Android)
- Eliminate 3x maintenance burden forever
- Achieve native performance and UX
- Future-proof architecture for rapid feature additions

---

## 🎯 Key Decisions (Approved)

### 1. Timer Enhancement ⏰
**Original:** Simple stopwatch timer
**Revised:** Full reminder system with pre-task notifications
- Set reminder time for tasks (e.g., "remind me 15 minutes before")
- Background notifications when app is closed
- Persistent notifications across app restarts
- "Snooze" and "Mark as Done" actions from notification

**Technical Implications:**
- Add `reminder_time` field to tasks table
- Implement expo-notifications
- Handle notification permissions
- Schedule/cancel notifications on task CRUD
- Background notification handling

### 2. Platform Priority 📱
**Testing & Optimization Order:** iOS → Android → Web
- All platforms will work from day 1 (React Native cross-platform)
- Focus testing efforts on iOS first
- Use iOS simulator as primary dev environment
- Android and web tested regularly but not blocking

### 3. Timeline ⏱️
**Approach:** Flexible, solo development
- No hard deadlines
- Work in sprints (complete one phase before moving to next)
- Focus on quality over speed
- Estimated: 10-13 weeks at 10 hours/week, or 5-7 weeks full-time

### 4. Technical Stack 🛠️
**Confirmed:**
- ✅ TypeScript (strict mode)
- ✅ Reuse TaskFlow Supabase project (same database, same credentials)
- ✅ Expo Managed Workflow (easier development, no native code initially)
- ✅ Zustand for state management
- ✅ React Native Paper for UI components

### 5. Phase Structure 📅
**Major Change:** Simplified phasing for solo development

**Phase 1:** Core Features (Online-Only)
- All 3 views: Today, Tasks, Calendar
- Full CRUD operations (direct Supabase calls)
- Authentication
- Basic timer
- **No offline sync yet** (deferred to Phase 2)

**Phase 2:** Offline-First Architecture
- AsyncStorage caching
- Operation queue
- Sync engine
- Connectivity management
- Graceful online/offline transitions

**Phase 3:** Notifications & Reminders
- Task reminders
- Pre-task notifications
- Background scheduling
- Notification actions

**Phase 4:** Polish & Deployment
- Animations
- Accessibility
- Performance optimization
- Testing
- **Deploy Web first** → iOS TestFlight → Android internal testing

---

## 🎨 Design System (Unchanged)

### Color Palette - Keeping TaskFlow Brand

**Primary Colors:**
```javascript
primary: {
  dark: '#1e3a5f',    // Dark blue (header background)
  main: '#2874a6',    // Medium blue (primary actions)
  light: '#5dade2',   // Light blue (accents)
  gradient: ['#1e3a5f', '#2874a6', '#5dade2'] // Header gradient
}

accent: {
  gold: '#f7dc6f',    // Time display highlight
}

semantic: {
  success: '#10b981', // Green - completed tasks
  warning: '#f59e0b', // Amber - due soon
  error: '#ef4444',   // Red - overdue
  info: '#06b6d4',    // Cyan - information
}

// Category Colors (same 10 colors as TaskFlow)
categories: [
  '#6366f1', // Indigo - Category 1
  '#8b5cf6', // Purple - Category 2
  '#ec4899', // Pink - Category 3
  '#f59e0b', // Amber - Category 4
  '#10b981', // Emerald - Category 5
  '#06b6d4', // Cyan - Category 6
  '#ef4444', // Red - Category 7
  '#f97316', // Orange - Category 8
  '#84cc16', // Lime - Category 9
  '#6366f1', // Indigo - Category 10
]

// UI Colors
ui: {
  background: '#ffffff',      // Pure white
  backgroundGradient: 'linear-gradient(135deg, #1e3a5f 0%, #2874a6 50%, #5dade2 100%)', // Body background
  surface: '#f9fafb',         // Light gray cards
  border: '#e5e7eb',          // Borders
  textPrimary: '#1f2937',     // Dark gray text
  textSecondary: '#6b7280',   // Medium gray text
  textDisabled: '#9ca3af',    // Light gray disabled
}
```

### Typography
- iOS: San Francisco (system default)
- Android: Roboto (system default)
- Web: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto

---

## 🗄️ Data Architecture Updates

### Supabase Schema Changes

**New: Add reminder_time to tasks table**

```sql
-- Add reminder_time column to existing tasks table
ALTER TABLE tasks ADD COLUMN reminder_time TIMESTAMPTZ;

-- Add index for efficient reminder queries
CREATE INDEX idx_tasks_reminder_time ON tasks(reminder_time)
  WHERE reminder_time IS NOT NULL AND completed = FALSE;

-- No other schema changes needed - reuse TaskFlow database
```

### Updated TypeScript Types

```typescript
// src/types/task.ts
export interface Task {
  id: number | string;
  text: string;
  completed: boolean;
  dueDate: Date | null;
  reminderTime: Date | null;  // NEW: When to send notification
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  categoryId: number | null;
  duration: number;  // in minutes
  userId: string;
  createdAt: Date;

  // Metadata for offline sync (Phase 2)
  _isTemporary?: boolean;
  _lastModified?: number;
}

// src/types/notification.ts
export interface ScheduledNotification {
  id: string;
  taskId: number | string;
  scheduledTime: Date;
  title: string;
  body: string;
  data: {
    taskId: number | string;
    action: 'reminder';
  };
}
```

---

## 📁 Updated Project Structure

```
done/
├── app.json                    # Expo configuration
├── package.json
├── tsconfig.json
├── .env                        # Supabase credentials (from TaskFlow)
├── .env.example
├── .gitignore
│
├── src/
│   ├── config/
│   │   ├── supabase.ts        # Reuse TaskFlow credentials
│   │   ├── theme.ts           # TaskFlow color scheme
│   │   └── constants.ts
│   │
│   ├── types/
│   │   ├── task.ts            # Task with reminderTime
│   │   ├── category.ts
│   │   ├── user.ts
│   │   ├── notification.ts    # NEW
│   │   └── sync.ts            # Phase 2
│   │
│   ├── stores/                 # Zustand stores
│   │   ├── authStore.ts
│   │   ├── taskStore.ts       # Phase 1: Direct Supabase calls
│   │   ├── categoryStore.ts
│   │   ├── uiStore.ts
│   │   ├── timerStore.ts
│   │   ├── notificationStore.ts  # Phase 3
│   │   └── syncStore.ts       # Phase 2
│   │
│   ├── services/
│   │   ├── supabaseService.ts      # CRUD operations
│   │   ├── notificationService.ts  # Phase 3: expo-notifications
│   │   ├── offlineStorage.ts       # Phase 2
│   │   ├── syncEngine.ts           # Phase 2
│   │   ├── connectivityManager.ts  # Phase 2
│   │   └── recurringTasks.ts
│   │
│   ├── utils/
│   │   ├── dateHelpers.ts
│   │   ├── validation.ts
│   │   ├── idGenerator.ts     # Phase 2
│   │   └── logger.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTasks.ts
│   │   ├── useCategories.ts
│   │   ├── useNotifications.ts    # Phase 3
│   │   ├── useSync.ts             # Phase 2
│   │   ├── useConnectivity.ts     # Phase 2
│   │   └── useTimer.ts
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── EmptyState.tsx
│   │   │
│   │   ├── task/
│   │   │   ├── TaskItem.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskForm.tsx              # With reminder picker
│   │   │   ├── TaskTimeSelector.tsx
│   │   │   ├── TaskReminderSelector.tsx  # NEW
│   │   │   ├── TaskDurationSelector.tsx
│   │   │   └── TaskRecurrenceSelector.tsx
│   │   │
│   │   ├── category/
│   │   │   ├── CategoryChip.tsx
│   │   │   ├── CategoryList.tsx
│   │   │   ├── CategoryForm.tsx
│   │   │   └── CategoryPicker.tsx
│   │   │
│   │   ├── calendar/
│   │   │   ├── CalendarGrid.tsx
│   │   │   ├── CalendarDay.tsx
│   │   │   ├── WeeklyView.tsx
│   │   │   └── CalendarHeader.tsx
│   │   │
│   │   ├── timer/
│   │   │   ├── TimerDisplay.tsx
│   │   │   ├── TimerControls.tsx
│   │   │   └── TimerPresets.tsx
│   │   │
│   │   └── sync/                     # Phase 2
│   │       ├── ConnectivityBadge.tsx
│   │       ├── SyncButton.tsx
│   │       └── SyncNotification.tsx
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignUpScreen.tsx
│   │   │   └── WelcomeScreen.tsx
│   │   │
│   │   ├── main/
│   │   │   ├── TodayScreen.tsx
│   │   │   ├── TasksScreen.tsx        # List view
│   │   │   ├── CalendarScreen.tsx
│   │   │   └── SettingsScreen.tsx     # Phase 4
│   │   │
│   │   └── modals/
│   │       ├── TaskDetailModal.tsx
│   │       ├── TimerModal.tsx
│   │       └── CategoryModal.tsx
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx          # Bottom tabs
│   │   └── linking.ts
│   │
│   └── App.tsx
│
├── assets/
│   ├── images/
│   │   └── logo.png                   # Reuse TaskFlow logo
│   └── sounds/
│       ├── timer-complete.mp3
│       └── notification.mp3           # Phase 3
│
└── __tests__/
    └── ... (Phase 4)
```

---

## 🚀 Revised Development Phases

### Phase 0: Project Setup (Week 1 - 6 hours)

**Goal:** Initialize project with Expo and configure environment

**Tasks:**
1. Initialize Expo TypeScript project:
   ```bash
   npx create-expo-app done --template expo-template-blank-typescript
   cd done
   ```

2. Install dependencies:
   ```bash
   # Core
   npm install zustand @supabase/supabase-js date-fns

   # Navigation
   npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
   npx expo install react-native-screens react-native-safe-area-context

   # UI Library
   npm install react-native-paper react-native-vector-icons

   # Storage (Phase 2, but install now)
   npx expo install @react-native-async-storage/async-storage

   # Connectivity (Phase 2, but install now)
   npx expo install @react-native-community/netinfo

   # Notifications (Phase 3, but install now)
   npx expo install expo-notifications
   ```

3. Configure TypeScript (strict mode):
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "resolveJsonModule": true
     }
   }
   ```

4. Create folder structure (as shown above)

5. Set up Supabase config (reuse TaskFlow):
   ```typescript
   // src/config/supabase.ts
   import { createClient } from '@supabase/supabase-js';
   import Constants from 'expo-constants';

   const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.SUPABASE_URL;
   const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.SUPABASE_ANON_KEY;

   export const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
   ```

6. Create `.env`:
   ```bash
   # Copy from TaskFlow config.js
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

7. Configure app.json:
   ```json
   {
     "expo": {
       "name": "Done",
       "slug": "done",
       "version": "1.0.0",
       "orientation": "portrait",
       "icon": "./assets/icon.png",
       "splash": {
         "image": "./assets/splash.png",
         "resizeMode": "contain",
         "backgroundColor": "#2874a6"
       },
       "platforms": ["ios", "android", "web"],
       "extra": {
         "supabaseUrl": process.env.SUPABASE_URL,
         "supabaseAnonKey": process.env.SUPABASE_ANON_KEY
       }
     }
   }
   ```

8. Create theme.ts with TaskFlow colors (shown above)

9. Set up ESLint + Prettier:
   ```bash
   npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier
   ```

10. Test run on web:
    ```bash
    npx expo start --web
    ```

**Deliverables:**
- ✅ Project runs on web
- ✅ Hot reload working
- ✅ Supabase connected (test with simple query)
- ✅ Folder structure created
- ✅ Theme configured
- ✅ Git repository initialized

**Time:** 6 hours

---

### Phase 1: Core Features (Online-Only) (Week 2-5 - 50 hours)

**Goal:** Build all core features with direct Supabase calls (no offline support yet)

#### 1.1 Authentication (8 hours)

**Tasks:**
- Create authStore (Zustand)
- Implement supabaseService auth methods:
  - signUp, signIn, signOut, getCurrentUser
- Build auth screens:
  - WelcomeScreen
  - LoginScreen (email/password form)
  - SignUpScreen (email/password/confirm form)
- Form validation (email format, password min length 6)
- Error handling
- AuthNavigator (stack)

**Deliverables:**
- ✅ Users can sign up, login, logout
- ✅ Session persists (Supabase handles this)
- ✅ Conditional navigation (logged in → Main, logged out → Auth)

**Files:**
- `stores/authStore.ts`
- `services/supabaseService.ts` (auth section)
- `screens/auth/*`
- `navigation/AuthNavigator.tsx`

**Test:**
- Sign up new account → should create in Supabase
- Login → should navigate to main app
- Close and reopen app → should stay logged in

---

#### 1.2 Data Stores & Supabase Service (6 hours)

**Tasks:**
- Create taskStore (Zustand):
  - State: tasks[], isLoading, error
  - Actions: fetchTasks, addTask, updateTask, deleteTask, toggleComplete
  - Filters: getTasksForDate, getTasksByCategory

- Create categoryStore (Zustand):
  - State: categories[], isLoading, error
  - Actions: fetchCategories, addCategory, deleteCategory
  - Default categories creation for new users

- Create uiStore (Zustand):
  - currentView: 'today' | 'tasks' | 'calendar'
  - selectedDate: Date
  - selectedCategory: number | null
  - calendarViewMode: 'month' | 'week'

- Create timerStore (Zustand):
  - minutes, seconds, isRunning, interval
  - Actions: start, pause, reset, setPreset

- Implement supabaseService CRUD:
  ```typescript
  // Tasks
  async getTasks(): Promise<Task[]>
  async addTask(task: Omit<Task, 'id'>): Promise<Task>
  async updateTask(id: number, updates: Partial<Task>): Promise<Task>
  async deleteTask(id: number): Promise<void>

  // Categories
  async getCategories(): Promise<Category[]>
  async addCategory(name: string, icon: string): Promise<Category>
  async deleteCategory(id: number): Promise<void>
  ```

- Recurring tasks utility:
  - calculateNextDueDate(task)
  - createRecurringInstance(task)

**Deliverables:**
- ✅ Stores functional with TypeScript types
- ✅ Supabase CRUD working
- ✅ Default categories created for new users

**Files:**
- `stores/taskStore.ts`
- `stores/categoryStore.ts`
- `stores/uiStore.ts`
- `stores/timerStore.ts`
- `services/supabaseService.ts` (complete)
- `services/recurringTasks.ts`
- `utils/dateHelpers.ts`

---

#### 1.3 UI Components (12 hours)

**Tasks:**

**Common Components:**
- Button (primary, secondary, danger variants)
- Input (text, email, password, with validation)
- Card (with shadow, TaskFlow styling)
- LoadingSpinner (blue gradient themed)
- EmptyState (with icon and message)

**Task Components:**
- TaskItem:
  - Checkbox (complete/incomplete)
  - Task text (strikethrough if completed)
  - Due date/time display
  - Category chip
  - Edit/Delete buttons
  - Reminder indicator icon (🔔 if reminderTime set)

- TaskList:
  - FlatList with TaskItem
  - Pull to refresh
  - Empty state
  - Loading state

- TaskForm:
  - Text input (required, validation)
  - Date picker (platform-specific)
  - Time selector (scrollable, 15-min intervals)
  - Reminder time selector (NEW - dropdown: "15 min before", "30 min before", "1 hour before", "Custom")
  - Duration selector (dropdown)
  - Recurrence selector (dropdown)
  - Category picker (dropdown with icons)
  - Save/Cancel buttons

- TaskTimeSelector:
  - Scrollable list of 15-minute intervals
  - Current time highlighted

- TaskReminderSelector (NEW):
  - Quick options: "No reminder", "At due time", "5 min before", "15 min before", "30 min before", "1 hour before", "1 day before", "Custom"
  - Custom: DateTimePicker for specific time

**Category Components:**
- CategoryChip:
  - Icon + name
  - Colored border (from categories array)
  - Tappable

- CategoryList:
  - Horizontal scroll
  - "All" chip + category chips
  - Active state

- CategoryForm:
  - Name input
  - Icon picker (emoji picker or predefined icons)

- CategoryPicker:
  - Dropdown/modal with categories
  - Shows icon + name

**Calendar Components:**
- CalendarGrid:
  - 7x6 grid (42 days)
  - Day headers (Sun-Sat)
  - Current month days highlighted
  - Previous/next month days grayed out
  - Task dots (colored by category, max 3 dots)
  - Selected date highlight
  - Today highlight

- CalendarDay:
  - Date number
  - Task dots
  - Tap handler

- WeeklyView:
  - 7 columns (days of week)
  - Tasks displayed inline with time
  - Scrollable vertically (hours) and horizontally (if needed)

- CalendarHeader:
  - Month/Year display (or Week range)
  - Prev/Next buttons
  - Mode toggle (Monthly/Weekly)

**Timer Components:**
- TimerDisplay:
  - Large MM:SS display
  - Tabular nums font
  - Color change when running (blue → green)

- TimerControls:
  - Start button (▶)
  - Pause button (⏸)
  - Reset button (↻)
  - Disabled states

- TimerPresets:
  - Preset buttons: 30min, 60min, 120min
  - Custom input (1-300 minutes)

**Deliverables:**
- ✅ All components functional
- ✅ TaskFlow color scheme applied
- ✅ Platform-specific pickers working
- ✅ Reminder selector UI complete (functionality in Phase 3)

**Files:**
- `components/common/*`
- `components/task/*`
- `components/category/*`
- `components/calendar/*`
- `components/timer/*`

---

#### 1.4 Screen Implementation - All 3 Views (18 hours)

**Tasks:**

**1. Today Screen (6 hours)**
- Header:
  - "Today's Tasks" title
  - Live date display (e.g., "Tue, Oct 16, 2024")
  - Live time display (e.g., "14:32:45", updates every second)
  - User email display
  - Logout button

- Content:
  - TaskList filtered to today's tasks only
  - Sort by due time (earliest first)
  - Group by hour if many tasks
  - Show time + duration for each task
  - Show reminder icon if set
  - Empty state: "No tasks scheduled for today 🎉"
  - Pull to refresh

- FAB (Floating Action Button):
  - + icon (bottom-right)
  - Opens TaskDetailModal with today pre-selected

**2. Tasks Screen / List View (6 hours)**
- Header:
  - "All Tasks" title
  - User email
  - Logout button

- Sidebar/Top:
  - CategoryList (horizontal scroll on mobile, sidebar on tablet/web)
  - "All" button (shows all tasks)
  - Category filter chips
  - Add category button (+)

- Content:
  - If category selected: filtered TaskList
  - If "All": TaskList grouped by category
  - Show category headers
  - "Uncategorized" section for tasks without category
  - Show due date if set
  - Show reminder icon if set
  - Empty state: "No tasks yet. Tap + to add one!"
  - Pull to refresh

- FAB: Add task

**3. Calendar Screen (6 hours)**
- Header:
  - Month/Year display (or Week range if weekly mode)
  - Prev/Next buttons (< >)
  - Mode toggle: Monthly | Weekly
  - User email
  - Logout button

- Monthly Mode:
  - CalendarGrid (main area)
  - Task dots on dates with tasks (colored by category)
  - Selected date highlight (blue border)
  - Today highlight (blue background)
  - Bottom panel (or side panel on tablet):
    - "Tasks for [selected date]"
    - TaskList for selected date
    - Empty state if no tasks

- Weekly Mode:
  - WeeklyView (7 columns)
  - Day headers with dates
  - Tasks displayed with time + duration
  - Horizontal scroll if needed
  - Vertical scroll (time slots)

- FAB: Add task (with selected date pre-filled)

**Navigation:**
- MainNavigator (Bottom Tabs):
  - Tab 1: ☀️ Today → TodayScreen
  - Tab 2: 📝 Tasks → TasksScreen
  - Tab 3: 📅 Calendar → CalendarScreen
  - Active tab highlighted (blue)

**Modals:**
- TaskDetailModal:
  - Full-screen modal (slide from bottom on iOS, fade on Android)
  - TaskForm inside
  - Title: "Add Task" or "Edit Task"
  - Close button (X)

- TimerModal:
  - Centered modal (smaller)
  - TimerDisplay + TimerControls + TimerPresets
  - Close button

- CategoryModal:
  - Centered modal
  - CategoryForm
  - Save/Cancel buttons

**Deliverables:**
- ✅ All 3 views functional
- ✅ Bottom tab navigation working
- ✅ Modals working
- ✅ Task CRUD working from all screens
- ✅ Category filtering working
- ✅ Calendar date selection working
- ✅ Timer modal working
- ✅ Live clock on Today screen

**Files:**
- `screens/main/TodayScreen.tsx`
- `screens/main/TasksScreen.tsx`
- `screens/main/CalendarScreen.tsx`
- `screens/modals/*`
- `navigation/MainNavigator.tsx`
- `navigation/AppNavigator.tsx`

**Test (All on iOS first, then Android, then Web):**
- Create task from each screen → appears in all views
- Edit task → updates everywhere
- Delete task → removes from all views
- Complete task → strikethrough, grayed out
- Filter by category → only shows that category
- Calendar date selection → shows tasks for that date
- Weekly view → shows all week's tasks
- Timer modal → starts/pauses/resets
- Pull to refresh → reloads from Supabase

---

#### 1.5 Real-Time Subscriptions (4 hours)

**Tasks:**
- Implement Supabase Realtime subscriptions in taskStore and categoryStore
- Listen for INSERT, UPDATE, DELETE events
- Update local state automatically
- Prevent duplicates (check if item already exists before adding)
- Unsubscribe on logout

**Code:**
```typescript
// In taskStore
useEffect(() => {
  if (!user) return;

  const subscription = supabase
    .channel('tasks-changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          set(state => ({
            tasks: [...state.tasks, payload.new as Task]
          }));
        } else if (payload.eventType === 'UPDATE') {
          set(state => ({
            tasks: state.tasks.map(t => t.id === payload.new.id ? payload.new as Task : t)
          }));
        } else if (payload.eventType === 'DELETE') {
          set(state => ({
            tasks: state.tasks.filter(t => t.id !== payload.old.id)
          }));
        }
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [user]);
```

**Deliverables:**
- ✅ Changes in one device appear in other devices/tabs instantly
- ✅ Multi-device sync working

**Test:**
- Open app on iOS and web simultaneously
- Create task on web → appears on iOS within 1 second
- Edit task on iOS → updates on web
- Delete task on web → removes from iOS

---

#### 1.6 Recurring Tasks (2 hours)

**Tasks:**
- Implement recurring task logic in taskStore
- When task marked complete:
  - If recurrence !== 'none', create new instance
  - Calculate next due date based on recurrence pattern
  - Keep original task completed, create new uncompleted instance
- Recurrence patterns:
  - Daily: +1 day
  - Weekly: +7 days
  - Monthly: +1 month (same day)

**Code:**
```typescript
// In taskStore
async toggleComplete(id: number | string) {
  const task = get().tasks.find(t => t.id === id);
  if (!task) return;

  const newCompleted = !task.completed;

  // Update task
  await supabaseService.updateTask(id, { completed: newCompleted });

  // If completing a recurring task, create next instance
  if (newCompleted && task.recurrence !== 'none') {
    const nextDueDate = calculateNextDueDate(task.dueDate, task.recurrence);
    const newTask = {
      ...task,
      id: undefined, // Let Supabase generate new ID
      completed: false,
      dueDate: nextDueDate,
      createdAt: undefined,
    };
    await get().addTask(newTask);
  }

  // Update local state
  set(state => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, completed: newCompleted } : t)
  }));
}
```

**Deliverables:**
- ✅ Completing recurring task creates new instance
- ✅ New instance has correct next due date

**Test:**
- Create daily recurring task for today
- Complete it → new instance created for tomorrow
- Complete weekly task → new instance in 7 days
- Complete monthly task → new instance next month

---

**Phase 1 Summary:**
- **Time:** 50 hours
- **Deliverables:** Fully functional app (online-only) with all 3 views, auth, CRUD, recurring tasks, timer
- **Deferred:** Offline support (Phase 2), Notifications (Phase 3)
- **Deploy:** Web to Vercel at end of Phase 1 for testing

---

### Phase 2: Offline-First Architecture (Week 6-8 - 24 hours)

**Goal:** Add offline support with AsyncStorage caching and sync queue

#### 2.1 Offline Storage Service (8 hours)

**Tasks:**
- Implement offlineStorage.ts:
  ```typescript
  // Save/load tasks
  async saveTasks(userId: string, tasks: Task[]): Promise<void>
  async loadTasks(userId: string): Promise<Task[]>

  // Save/load categories
  async saveCategories(userId: string, categories: Category[]): Promise<void>
  async loadCategories(userId: string): Promise<Category[]>

  // Sync queue
  async queueOperation(userId: string, operation: SyncOperation): Promise<void>
  async getQueue(userId: string): Promise<SyncOperation[]>
  async removeFromQueue(userId: string, operationId: string): Promise<void>
  async clearQueue(userId: string): Promise<void>

  // Temp ID management
  generateTempId(): string  // Format: temp_rn_${timestamp}_${random}
  isTempId(id: string | number): boolean
  ```

- Storage keys:
  ```
  done_${userId}_tasks
  done_${userId}_categories
  done_${userId}_sync_queue
  done_${userId}_last_sync
  ```

- Implement caching:
  - After successful Supabase fetch → save to AsyncStorage
  - On app start → load from cache first, then fetch from Supabase
  - Cache invalidation after sync

**Deliverables:**
- ✅ AsyncStorage operations working
- ✅ Queue persistence working
- ✅ Temp ID generation working

---

#### 2.2 Connectivity Manager (4 hours)

**Tasks:**
- Implement connectivityManager.ts using NetInfo:
  ```typescript
  import NetInfo from '@react-native-community/netinfo';

  class ConnectivityManager {
    private isOnline: boolean = true;
    private listeners: ((status: boolean) => void)[] = [];

    init() {
      NetInfo.addEventListener(state => {
        this.isOnline = state.isConnected ?? false;
        this.notifyListeners();
      });
    }

    getStatus(): boolean {
      return this.isOnline;
    }

    onChange(callback: (status: boolean) => void) {
      this.listeners.push(callback);
    }

    private notifyListeners() {
      this.listeners.forEach(cb => cb(this.isOnline));
    }
  }
  ```

- Create useConnectivity hook:
  ```typescript
  export function useConnectivity() {
    const [isOnline, setIsOnline] = useState(connectivityManager.getStatus());

    useEffect(() => {
      connectivityManager.onChange(setIsOnline);
    }, []);

    return isOnline;
  }
  ```

**Deliverables:**
- ✅ Real-time connectivity detection
- ✅ Hook for components to use

---

#### 2.3 Sync Engine (8 hours)

**Tasks:**
- Implement syncEngine.ts:
  ```typescript
  class SyncEngine {
    async syncAll(userId: string): Promise<SyncResult> {
      const queue = await offlineStorage.getQueue(userId);
      let synced = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const operation of queue) {
        try {
          await this.syncOperation(operation);
          await offlineStorage.removeFromQueue(userId, operation.id);
          synced++;
        } catch (error) {
          operation.retryCount++;
          if (operation.retryCount >= 3) {
            // Max retries reached, skip
            await offlineStorage.removeFromQueue(userId, operation.id);
            failed++;
            errors.push(`Failed to sync ${operation.entity} ${operation.operation}`);
          }
        }
      }

      return { success: failed === 0, synced, failed, errors };
    }

    async syncOperation(operation: SyncOperation): Promise<void> {
      switch (operation.operation) {
        case 'CREATE':
          if (operation.entity === 'task') {
            const result = await supabaseService.addTask(operation.data);
            // Replace temp ID with server ID in local cache
            if (offlineStorage.isTempId(operation.data.id)) {
              await offlineStorage.replaceTempId(operation.data.id, result.id);
            }
          }
          break;
        case 'UPDATE':
          // ...
          break;
        case 'DELETE':
          // ...
          break;
      }
    }
  }
  ```

- Update taskStore and categoryStore to queue operations when offline:
  ```typescript
  // In taskStore.addTask
  async addTask(task: Omit<Task, 'id'>) {
    const isOnline = connectivityManager.getStatus();

    if (isOnline) {
      try {
        const result = await supabaseService.addTask(task);
        set(state => ({ tasks: [...state.tasks, result] }));
        await offlineStorage.saveTasks(userId, get().tasks); // Cache
      } catch (error) {
        // Network error, fallback to offline
        const tempId = offlineStorage.generateTempId();
        const offlineTask = { ...task, id: tempId, _isTemporary: true };
        set(state => ({ tasks: [...state.tasks, offlineTask] }));
        await offlineStorage.saveTasks(userId, get().tasks);
        await offlineStorage.queueOperation(userId, {
          id: generateId(),
          operation: 'CREATE',
          entity: 'task',
          data: offlineTask,
          timestamp: Date.now(),
          retryCount: 0,
          maxRetries: 3,
        });
      }
    } else {
      // Offline mode
      const tempId = offlineStorage.generateTempId();
      const offlineTask = { ...task, id: tempId, _isTemporary: true };
      set(state => ({ tasks: [...state.tasks, offlineTask] }));
      await offlineStorage.saveTasks(userId, get().tasks);
      await offlineStorage.queueOperation(userId, {
        id: generateId(),
        operation: 'CREATE',
        entity: 'task',
        data: offlineTask,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: 3,
      });
    }
  }
  ```

**Deliverables:**
- ✅ Sync engine working
- ✅ Offline operations queued
- ✅ Auto-sync on reconnection

---

#### 2.4 UI Updates for Offline Mode (4 hours)

**Tasks:**
- Add ConnectivityBadge component to headers:
  - 🟢 Online / 🔴 Offline / 🟡 Syncing
  - Use useConnectivity hook

- Add SyncButton component:
  - Shows pending operation count: "🔄 Sync (N)"
  - Tap to manually trigger sync
  - Disabled when offline
  - Loading spinner during sync

- Add SyncNotification (toast):
  - "📴 Saved offline - will sync when online"
  - "📡 Syncing..."
  - "✅ Synced N changes"
  - "⚠️ Sync issues"

- Visual indicators for offline items:
  - Tasks with temp IDs show small indicator (e.g., "↻" icon)
  - Grayed out or slightly transparent

**Deliverables:**
- ✅ Connectivity badge visible
- ✅ Sync button functional
- ✅ User feedback for offline operations

---

**Phase 2 Summary:**
- **Time:** 24 hours
- **Deliverables:** Full offline support, sync queue, connectivity management
- **Test:** Enable airplane mode, create tasks, go back online → should sync automatically

---

### Phase 3: Notifications & Reminders (Week 9-10 - 20 hours)

**Goal:** Implement pre-task reminder notifications

#### 3.1 Notification Service (8 hours)

**Tasks:**
- Set up expo-notifications
- Request notification permissions (iOS/Android)
- Implement notificationService.ts:
  ```typescript
  import * as Notifications from 'expo-notifications';

  class NotificationService {
    async requestPermissions(): Promise<boolean> {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    }

    async scheduleTaskReminder(task: Task): Promise<string | null> {
      if (!task.reminderTime) return null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📝 Task Reminder',
          body: task.text,
          sound: true,
          data: { taskId: task.id, action: 'reminder' },
        },
        trigger: {
          date: task.reminderTime,
        },
      });

      return notificationId;
    }

    async cancelNotification(notificationId: string): Promise<void> {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }

    async cancelTaskReminders(taskId: number | string): Promise<void> {
      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
      const taskNotifications = allScheduled.filter(
        n => n.content.data?.taskId === taskId
      );
      for (const notification of taskNotifications) {
        await this.cancelNotification(notification.identifier);
      }
    }

    setupNotificationHandler() {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    }

    onNotificationTap(callback: (notification: Notifications.NotificationResponse) => void) {
      Notifications.addNotificationResponseReceivedListener(callback);
    }
  }
  ```

- Configure notification channels (Android):
  ```json
  // app.json
  {
    "expo": {
      "android": {
        "adaptiveIcon": {
          "foregroundImage": "./assets/adaptive-icon.png",
          "backgroundColor": "#2874a6"
        },
        "permissions": [
          "NOTIFICATIONS",
          "VIBRATE"
        ]
      },
      "ios": {
        "infoPlist": {
          "UIBackgroundModes": ["remote-notification"]
        }
      },
      "notification": {
        "icon": "./assets/notification-icon.png",
        "color": "#2874a6",
        "androidMode": "default",
        "androidCollapsedTitle": "Task Reminder"
      }
    }
  }
  ```

**Deliverables:**
- ✅ Permission request flow
- ✅ Notification scheduling working
- ✅ Notification cancellation working

---

#### 3.2 Integrate Notifications with Task CRUD (6 hours)

**Tasks:**
- Update TaskForm to include reminder selector:
  - Quick options dropdown
  - Shows "🔔 Remind me:" label
  - Options:
    - "No reminder"
    - "At due time"
    - "5 minutes before"
    - "15 minutes before"
    - "30 minutes before"
    - "1 hour before"
    - "1 day before"
    - "Custom" → opens DateTimePicker

- Calculate reminderTime based on selection:
  ```typescript
  function calculateReminderTime(dueDate: Date, offset: number): Date {
    return new Date(dueDate.getTime() - offset * 60 * 1000);
  }
  ```

- Update taskStore CRUD operations:
  ```typescript
  // In addTask
  async addTask(task: Omit<Task, 'id'>) {
    // ... existing code to save to Supabase/offline

    // Schedule notification
    if (task.reminderTime && task.reminderTime > new Date()) {
      await notificationService.scheduleTaskReminder(task);
    }
  }

  // In updateTask
  async updateTask(id: number | string, updates: Partial<Task>) {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;

    // Cancel existing notification
    await notificationService.cancelTaskReminders(id);

    // ... existing code to update in Supabase/offline

    // Reschedule if reminder changed
    const updatedTask = { ...task, ...updates };
    if (updatedTask.reminderTime && updatedTask.reminderTime > new Date()) {
      await notificationService.scheduleTaskReminder(updatedTask);
    }
  }

  // In deleteTask
  async deleteTask(id: number | string) {
    // Cancel notification
    await notificationService.cancelTaskReminders(id);

    // ... existing delete code
  }

  // In toggleComplete
  async toggleComplete(id: number | string) {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;

    // If completing, cancel reminder
    if (!task.completed) {
      await notificationService.cancelTaskReminders(id);
    }

    // ... existing complete logic
  }
  ```

**Deliverables:**
- ✅ Reminder selector in TaskForm
- ✅ Notifications scheduled on task create
- ✅ Notifications rescheduled on task edit
- ✅ Notifications cancelled on task delete/complete

---

#### 3.3 Notification Actions & Handlers (4 hours)

**Tasks:**
- Handle notification tap:
  - If app closed: Open app → navigate to Today or Tasks screen
  - If app open: Navigate to task detail (edit modal)

- Notification actions (iOS/Android buttons):
  - "Mark as Done" → complete task without opening app
  - "Snooze" → reschedule reminder for 10 minutes later
  - "View" → open app to task detail

- Implement in App.tsx:
  ```typescript
  useEffect(() => {
    // Request permissions on app start
    notificationService.requestPermissions();

    // Setup notification handler
    notificationService.setupNotificationHandler();

    // Handle notification tap
    notificationService.onNotificationTap((response) => {
      const taskId = response.notification.request.content.data?.taskId;

      if (response.actionIdentifier === 'markDone') {
        // Complete task
        taskStore.toggleComplete(taskId);
      } else if (response.actionIdentifier === 'snooze') {
        // Snooze for 10 minutes
        const task = taskStore.tasks.find(t => t.id === taskId);
        if (task && task.reminderTime) {
          const newReminderTime = new Date(task.reminderTime.getTime() + 10 * 60 * 1000);
          taskStore.updateTask(taskId, { reminderTime: newReminderTime });
        }
      } else {
        // Default tap - navigate to task
        navigation.navigate('TaskDetail', { taskId });
      }
    });
  }, []);
  ```

- Add notification indicator to TaskItem:
  - Show 🔔 icon if reminderTime is set
  - Show time until reminder (e.g., "in 30 min")

**Deliverables:**
- ✅ Notification tap opens app
- ✅ Notification actions working
- ✅ Reminder indicators in UI

---

#### 3.4 Background Notification Handling (2 hours)

**Tasks:**
- Configure expo-notifications for background:
  - Add background notification handler
  - Ensure notifications fire even when app is closed

- Test notification persistence:
  - Schedule notification
  - Close app completely
  - Wait for notification → should appear
  - Tap notification → app should open

- Handle edge cases:
  - Task deleted but notification still scheduled → cancel on app open
  - Task completed but notification still scheduled → cancel on app open
  - Multiple notifications for same task → deduplicate

**Deliverables:**
- ✅ Background notifications working
- ✅ Edge cases handled

---

**Phase 3 Summary:**
- **Time:** 20 hours
- **Deliverables:** Full reminder system with pre-task notifications
- **Test:** Create task with "15 min before" reminder → should receive notification 15 min before due time

---

### Phase 4: Polish & Deployment (Week 11-13 - 20 hours)

**Goal:** Polish UX, add animations, test thoroughly, and deploy

#### 4.1 Animations & Micro-Interactions (6 hours)

**Tasks:**
- Install react-native-reanimated:
  ```bash
  npx expo install react-native-reanimated
  ```

- Add animations:
  - Fade in/out for modals
  - Slide up for bottom sheets (iOS)
  - Checkbox toggle animation
  - Task completion animation (strikethrough + fade)
  - Pull-to-refresh animation
  - FAB bounce on press
  - List item swipe-to-delete (iOS/Android)

- Haptic feedback:
  ```bash
  npx expo install expo-haptics
  ```
  - Vibrate on task complete
  - Light tap on button press
  - Medium impact on delete

- Loading skeletons:
  - TaskList loading state (placeholder cards)
  - Calendar loading state (placeholder grid)

**Deliverables:**
- ✅ Smooth animations (60fps)
- ✅ Haptic feedback
- ✅ Loading skeletons

---

#### 4.2 Accessibility (4 hours)

**Tasks:**
- Add accessibility labels:
  ```tsx
  <TouchableOpacity
    accessibilityLabel="Mark task as complete"
    accessibilityHint="Double tap to toggle completion status"
    accessibilityRole="checkbox"
    accessibilityState={{ checked: task.completed }}
  >
  ```

- Screen reader testing (iOS VoiceOver, Android TalkBack)
- Keyboard navigation (web)
- Touch target sizes (min 44x44 on mobile)
- High contrast mode support
- Dynamic type support (iOS)

**Deliverables:**
- ✅ All interactive elements have labels
- ✅ Screen reader navigation works
- ✅ WCAG AA compliant

---

#### 4.3 Error Handling & Edge Cases (4 hours)

**Tasks:**
- Global error boundary:
  ```tsx
  class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    render() {
      if (this.state.hasError) {
        return <ErrorScreen onRetry={() => this.setState({ hasError: false })} />;
      }
      return this.props.children;
    }
  }
  ```

- User-friendly error messages:
  - Network error → "Can't connect. Check your internet."
  - Auth error → "Invalid email or password"
  - Validation error → "Task text is required"

- Retry mechanisms:
  - Retry button on error screens
  - Auto-retry for transient errors (max 3 times)

- Edge cases:
  - Empty states (no tasks, no categories)
  - First-time user experience
  - No internet on first launch (after auth)
  - Notification permission denied → graceful degradation

**Deliverables:**
- ✅ Error boundary working
- ✅ All edge cases handled
- ✅ User-friendly error messages

---

#### 4.4 Testing (4 hours)

**Tasks:**
- **Manual Testing Checklist:**
  - Auth: Sign up, login, logout, session persistence
  - Tasks: Create, read, update, delete, complete, recurring
  - Categories: Create, delete, filter
  - Views: Today, Tasks, Calendar (monthly + weekly)
  - Offline: Create/edit/delete offline, sync on reconnect
  - Notifications: Schedule, receive, tap, actions
  - Timer: Start, pause, reset, presets
  - Real-time: Multi-device sync

- **Device Testing:**
  - iOS: Simulator (iPhone 14 Pro) + Physical device
  - Android: Emulator (Pixel 7) + Physical device
  - Web: Chrome, Safari, Firefox

- **Performance Testing:**
  - Large task list (500+ tasks) → should render smoothly
  - Calendar with many tasks → should not lag
  - Memory leaks → use React DevTools Profiler

- **Unit Tests (Optional but recommended):**
  - Test utils (dateHelpers, validation)
  - Test services (supabaseService, offlineStorage)
  - Coverage: 50%+

**Deliverables:**
- ✅ All features tested on all platforms
- ✅ No critical bugs
- ✅ Performance acceptable

---

#### 4.5 Deployment (2 hours)

**Deploy Web First:**
1. Build web bundle:
   ```bash
   npx expo export:web
   ```

2. Deploy to Vercel:
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Deploy
   cd web-build
   vercel --prod
   ```

3. Configure environment variables in Vercel dashboard:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY

4. Custom domain (optional):
   - done-app.com

**Deploy iOS (Later - Phase 5):**
1. Set up EAS Build:
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```

2. Build for TestFlight:
   ```bash
   eas build --platform ios --profile preview
   ```

3. Submit to App Store Connect:
   ```bash
   eas submit --platform ios
   ```

**Deploy Android (Later - Phase 6):**
1. Build AAB:
   ```bash
   eas build --platform android --profile production
   ```

2. Submit to Google Play Console:
   ```bash
   eas submit --platform android
   ```

**Deliverables:**
- ✅ Web app live at done-app.com
- ✅ iOS TestFlight build (Phase 5)
- ✅ Android internal testing (Phase 6)

---

**Phase 4 Summary:**
- **Time:** 20 hours
- **Deliverables:** Polished app, tested, web deployed
- **Web Launch:** End of Week 13 🚀

---

## 📊 Revised Timeline Summary

| Phase | Description | Duration | Hours | Deliverables |
|-------|-------------|----------|-------|--------------|
| 0 | Project Setup | Week 1 | 6h | Project initialized, Supabase connected |
| 1 | Core Features (Online) | Week 2-5 | 50h | All 3 views, Auth, CRUD, Recurring, Timer |
| 2 | Offline Architecture | Week 6-8 | 24h | AsyncStorage, Sync queue, Connectivity |
| 3 | Notifications | Week 9-10 | 20h | Reminders, Background notifications |
| 4 | Polish & Deploy (Web) | Week 11-13 | 20h | Animations, Accessibility, Web launch |
| **Total** | **All Features** | **13 weeks** | **120h** | **Web + iOS + Android apps** |

**At 10 hours/week:** 12-13 weeks (3 months)
**At 20 hours/week:** 6-7 weeks (1.5 months)
**At 40 hours/week (full-time):** 3-4 weeks (1 month)

---

## ✅ Phase 1 Completion Checklist (Deploy Web)

Before deploying web at end of Phase 1, ensure:

**Functionality:**
- [ ] Auth: Sign up, login, logout working
- [ ] Default categories created for new users
- [ ] Today view: Shows today's tasks, live clock
- [ ] Tasks view: Category filtering, task grouping
- [ ] Calendar view: Monthly and weekly modes
- [ ] Task CRUD: Create, edit, delete from all views
- [ ] Task properties: Text, date, time, duration, recurrence, category, reminder (UI only)
- [ ] Category CRUD: Create, delete categories
- [ ] Recurring tasks: Completing creates next instance
- [ ] Timer: Start, pause, reset, presets
- [ ] Real-time: Multi-device sync
- [ ] Bottom tab navigation working
- [ ] All modals working

**UI/UX:**
- [ ] TaskFlow blue gradient theme applied
- [ ] Loading states on all screens
- [ ] Empty states with helpful messages
- [ ] Error states with error messages
- [ ] Pull to refresh on all lists

**Quality:**
- [ ] No console errors
- [ ] Works on iOS simulator
- [ ] Works on Android emulator
- [ ] Works on web (Chrome)
- [ ] Responsive design (mobile + tablet + desktop)

**Deployment:**
- [ ] Build web bundle successfully
- [ ] Deploy to Vercel
- [ ] Environment variables configured
- [ ] Custom domain working (optional)

---

## 🚀 Next Steps - Ready to Start?

**Phase 0 starts with:**

1. **Initialize Expo Project:**
   ```bash
   npx create-expo-app done --template expo-template-blank-typescript
   cd done
   ```

2. **Install Dependencies** (see Phase 0 for full list)

3. **Copy TaskFlow Supabase Credentials:**
   - From: `taskflow/config.js`
   - To: `done/.env`

4. **Add reminder_time to Supabase:**
   ```sql
   ALTER TABLE tasks ADD COLUMN reminder_time TIMESTAMPTZ;
   ```

5. **Create Folder Structure** (as outlined above)

6. **Run on Web:**
   ```bash
   npx expo start --web
   ```

---

## 📝 Changes from Original Plan

**Major Changes:**
1. ✅ Timer enhanced to full reminder system with notifications
2. ✅ All 3 views built in Phase 1 (not incrementally)
3. ✅ Offline support deferred to Phase 2 (simplified initial development)
4. ✅ Deploy web first, then mobile (faster iteration)
5. ✅ Phasing restructured for solo development

**Unchanged:**
- Color scheme (TaskFlow blue gradient)
- Technology stack (React Native + Expo + Supabase + TypeScript)
- Feature set (all TaskFlow features ported)
- Estimated hours (120 hours)

---

---

## 🔄 Git Version Control Strategy

**Full documentation:** See `GIT_STRATEGY.md` for complete Git workflow

### Branch Structure (Hybrid Phase + Feature Branching)

```
main (production - deployed)
  ↑
develop (integration - testing)
  ↑
  ├── phase-0-setup
  ├── phase-1-core-features
  ├── phase-2-offline
  ├── phase-3-notifications
  └── phase-4-polish
```

### Key Branches

**`main`** (Production)
- Only merge from `develop` after testing
- Always deployable
- Tag all releases (v0.1.0, v0.2.0, v1.0.0, etc.)
- Deploy web/mobile from here

**`develop`** (Integration)
- Merge completed phase branches here
- Run integration tests
- Can deploy to staging/preview

**Phase Branches** (Long-running)
- One per phase: `phase-0-setup`, `phase-1-core-features`, etc.
- All work for that phase happens here
- Merge to `develop` when phase complete
- Delete after successful merge

**Feature Branches** (Optional, short-lived)
- Branch off phase branches for complex features
- Example: `feature/calendar-monthly-view` off `phase-1-core-features`
- Merge back to phase branch when complete

### Commit Message Format

**Conventional Commits:** `<type>(<scope>): <description>`

**Types:** feat, fix, refactor, style, docs, test, chore, perf

**Examples:**
```bash
git commit -m "feat(auth): implement email/password login"
git commit -m "feat(tasks): add task creation form with validation"
git commit -m "fix(calendar): correct date calculation for monthly view"
git commit -m "refactor(stores): move task logic to separate store"
```

### Phase Workflow Example

```bash
# Start Phase 1
git checkout develop
git checkout -b phase-1-core-features

# Work on Phase 1 (many commits)
git commit -m "feat(auth): implement auth store"
git commit -m "feat(tasks): create TaskList component"
# ... more commits ...

# Phase 1 complete
git checkout develop
git merge phase-1-core-features

# Deploy to production
git checkout main
git merge develop
git tag -a v0.1.0 -m "Phase 1 complete - Core features"
git push origin main --tags

# Cleanup
git branch -d phase-1-core-features
```

### Tagging & Releases

- `v0.0.1` - Phase 0 (setup)
- `v0.1.0` - Phase 1 (core features online)
- `v0.2.0` - Phase 2 (offline)
- `v0.3.0` - Phase 3 (notifications)
- `v1.0.0` - Production release (all features)
- `v1.0.1` - Hotfix
- `v1.1.0` - New feature (post-MVP)

### Deployment from Git

**Web (Vercel):**
- `main` → https://done-app.com (production)
- `develop` → https://done-app-dev.vercel.app (preview)

**Mobile (EAS):**
- Build from `main` only for production
- Build from `develop` for TestFlight/internal testing

### Essential .gitignore

```bash
# Dependencies
node_modules/

# Expo
.expo/
web-build/

# Environment (NEVER commit)
.env

# OS
.DS_Store

# Build artifacts
*.ipa
*.apk
*.aab

# Always commit: .env.example
```

**See `GIT_STRATEGY.md` for:**
- Complete workflow by phase
- Hotfix procedures
- Branch management
- Advanced Git techniques
- Troubleshooting

---

## 💬 Let's Begin!

This revised plan is approved and ready for implementation. Should we start with Phase 0: Project Setup?

**I can help you:**
1. Initialize Git repository
2. Run the Expo initialization commands
3. Set up the folder structure
4. Configure Supabase
5. Create the theme file
6. Make initial commit

**Ready when you are! 🚀**
