# Manual Testing Checklist - Phase 1

**Testing Date:** October 19, 2025
**Branch:** phase-1-core-features
**Platforms:** Web, iOS, Android

---

## 🌐 Platform 1: Web Testing

### Environment Setup
- [ ] App starts successfully on `http://localhost:8081` or `http://localhost:19006`
- [ ] No console errors on load
- [ ] Browser: Chrome (primary), Safari (secondary)

### 1. Authentication Flow
- [ ] **Sign Up**
  - [ ] Navigate to sign up screen
  - [ ] Enter email, password, confirm password
  - [ ] Submit form
  - [ ] Verify user is created in Supabase
  - [ ] Verify navigation to main app
  - [ ] Verify default categories are created

- [ ] **Sign Out**
  - [ ] Click logout button
  - [ ] Verify navigation to auth screen
  - [ ] Verify session cleared

- [ ] **Sign In**
  - [ ] Enter existing credentials
  - [ ] Submit form
  - [ ] Verify navigation to main app
  - [ ] Verify tasks and categories load

- [ ] **Session Persistence**
  - [ ] Sign in
  - [ ] Close browser tab
  - [ ] Reopen app
  - [ ] Verify still logged in

### 2. Today Screen
- [ ] **Header**
  - [ ] Live date displays correctly (e.g., "Sat, Oct 19, 2025")
  - [ ] Live time updates every second
  - [ ] User email displays
  - [ ] Logout button visible

- [ ] **Task List**
  - [ ] Shows only today's tasks
  - [ ] Tasks sorted by time (earliest first)
  - [ ] Empty state shows when no tasks
  - [ ] Pull to refresh works
  - [ ] Loading state shows during fetch

- [ ] **FAB (Add Task Button)**
  - [ ] FAB visible in bottom-right
  - [ ] Click opens TaskDetailModal
  - [ ] Today's date pre-selected

### 3. Tasks Screen (List View)
- [ ] **Category Filter**
  - [ ] Category chips display horizontally
  - [ ] "All" button shows all tasks
  - [ ] Click category filters tasks
  - [ ] Active category highlighted
  - [ ] Add category button (+) works

- [ ] **Task List**
  - [ ] All tasks display when "All" selected
  - [ ] Tasks grouped by category
  - [ ] "Uncategorized" section for tasks without category
  - [ ] Pull to refresh works

- [ ] **Category Management**
  - [ ] Click "+" opens category modal
  - [ ] Create new category (name + icon/emoji)
  - [ ] Category appears in list
  - [ ] Delete category removes it

### 4. Calendar Screen
- [ ] **Calendar Header**
  - [ ] Month/Year displays (e.g., "October 2025")
  - [ ] Previous/Next buttons change month
  - [ ] Mode toggle: Monthly | Weekly

- [ ] **Monthly View**
  - [ ] 7x6 grid displays (42 days)
  - [ ] Day headers (Sun-Sat) visible
  - [ ] Current month days highlighted
  - [ ] Previous/next month days grayed out
  - [ ] Today highlighted with blue background
  - [ ] Task dots appear on dates with tasks
  - [ ] Click date selects it (blue border)
  - [ ] Selected date shows tasks in bottom panel

- [ ] **Weekly View**
  - [ ] 7 columns (days of week) display
  - [ ] Day headers with dates
  - [ ] Tasks display with time + duration
  - [ ] Scrollable vertically (time slots)
  - [ ] Scrollable horizontally if needed

### 5. Task Creation & Editing
- [ ] **Create Task**
  - [ ] FAB opens TaskDetailModal
  - [ ] Modal title: "Add Task"
  - [ ] Task text input required
  - [ ] Click date selector opens date/time picker

- [ ] **Date/Time Picker (Web)**
  - [ ] HTML5 date input appears
  - [ ] HTML5 time input appears
  - [ ] Selected date/time displays in summary

- [ ] **Reminder Selector**
  - [ ] Multiple reminders selectable (checkboxes)
  - [ ] Options: "5 min", "10 min", "30 min", "1 hour", "1 day before"
  - [ ] Selected reminders display in summary
  - [ ] **VERIFY**: UI shows multiple, but DB stores earliest

- [ ] **Duration Selector**
  - [ ] Dropdown with options: "No duration", "15 min", "30 min", "45 min", "1h", "1.5h", "2h"
  - [ ] Selected duration displays in summary

- [ ] **Repeat Selector**
  - [ ] Dropdown with options: "None", "Daily", "Weekly", "Monthly", "Yearly"
  - [ ] Selected repeat displays in summary

- [ ] **Category Picker**
  - [ ] Dropdown shows all categories
  - [ ] Select category
  - [ ] Selected category displays

- [ ] **Save Task**
  - [ ] Click "Save" button
  - [ ] Modal closes
  - [ ] Task appears in all relevant views (Today/Tasks/Calendar)
  - [ ] Task saves to Supabase (check database)

- [ ] **Edit Task**
  - [ ] Click existing task
  - [ ] Modal opens with all fields populated
  - [ ] Modal title: "Edit Task"
  - [ ] Change text, date, reminder, etc.
  - [ ] Save changes
  - [ ] Task updates in all views

- [ ] **Delete Task**
  - [ ] Open task for editing
  - [ ] Click "Delete" button
  - [ ] Task removed from all views
  - [ ] Task removed from Supabase

### 6. Task Completion
- [ ] **Complete Task**
  - [ ] Click checkbox on task
  - [ ] Task text gets strikethrough
  - [ ] Task grayed out
  - [ ] Completed status updates in Supabase

- [ ] **Uncomplete Task**
  - [ ] Click checkbox on completed task
  - [ ] Strikethrough removed
  - [ ] Task returns to normal appearance

- [ ] **Complete Recurring Task**
  - [ ] Create recurring task (daily/weekly/monthly)
  - [ ] Complete it
  - [ ] Verify new instance created with next due date
  - [ ] Verify reminder preserved with correct offset
  - [ ] Verify original task marked completed

### 7. Timer (if implemented)
- [ ] Timer modal opens
- [ ] Start/pause/reset buttons work
- [ ] Preset buttons work (30min, 60min, 120min)
- [ ] Timer counts down correctly
- [ ] Timer persists across screens

### 8. Real-Time Sync (Web)
- [ ] Open app in two browser tabs
- [ ] Create task in Tab 1
- [ ] Verify task appears in Tab 2 within 1 second
- [ ] Edit task in Tab 2
- [ ] Verify changes appear in Tab 1
- [ ] Delete task in Tab 1
- [ ] Verify task removed from Tab 2

### 9. Data Verification
- [ ] **Check Supabase Database**
  - [ ] Open Supabase dashboard
  - [ ] Navigate to tasks table
  - [ ] Verify reminder_time is stored as single value (earliest)
  - [ ] Verify recurrence is stored correctly ('daily', 'weekly', etc.)
  - [ ] Verify due_date is stored correctly
  - [ ] Verify category_id is set
  - [ ] Verify duration is stored in minutes

---

## 📱 Platform 2: iOS Simulator Testing

### Environment Setup
- [ ] iOS Simulator launches successfully
- [ ] App installs and opens
- [ ] No crash on startup

### iOS-Specific Features

#### 1. Custom Calendar Date Picker
- [ ] **Calendar Modal (iOS Custom)**
  - [ ] Opens when clicking date selector
  - [ ] Shows custom calendar grid (not native spinner)
  - [ ] Month navigation arrows (< October 2025 >)
  - [ ] 7x6 grid with day numbers visible
  - [ ] Today highlighted
  - [ ] Previous/next month dates grayed
  - [ ] Click date selects it

- [ ] **Integrated Sections Below Calendar**
  - [ ] 🕐 **Time** section
    - [ ] Tap to expand/collapse
    - [ ] Shows spinner picker for time (this should work)
    - [ ] Time visible and selectable

  - [ ] 🔔 **Reminder** section
    - [ ] Tap to expand/collapse
    - [ ] Shows checkbox list (multi-select)
    - [ ] Can select multiple reminders
    - [ ] Selected items have checkmarks

  - [ ] ⏱️ **Duration** section
    - [ ] Tap to expand/collapse
    - [ ] Shows dropdown/picker
    - [ ] Single selection works

  - [ ] 🔁 **Repeat** section
    - [ ] Tap to expand/collapse
    - [ ] Shows dropdown/picker
    - [ ] Single selection works

- [ ] **Scrollable Options Area**
  - [ ] Max height 280px
  - [ ] Scrolls when sections expanded
  - [ ] All options accessible

- [ ] **No Past Dates**
  - [ ] Try to select yesterday's date
  - [ ] Verify past dates are disabled or not selectable

#### 2. Navigation Gestures
- [ ] Swipe back gesture works
- [ ] Bottom tab navigation smooth
- [ ] Modal slide-up animation
- [ ] Modal dismiss gesture (swipe down)

#### 3. Touch Interactions
- [ ] Touch targets at least 44x44 points
- [ ] Buttons respond to touch
- [ ] Pull-to-refresh gesture smooth
- [ ] Haptic feedback (if implemented)

#### 4. Safe Area Handling
- [ ] Content not hidden by notch
- [ ] Bottom tabs not hidden by home indicator
- [ ] Content scrolls properly

#### 5. Run Same Core Tests as Web
- [ ] Authentication flow
- [ ] Task CRUD
- [ ] Category filtering
- [ ] Calendar navigation
- [ ] Real-time sync (2 simulators if possible)

---

## 🤖 Platform 3: Android Emulator Testing

### Environment Setup
- [ ] Android Emulator launches successfully
- [ ] App installs and opens
- [ ] No crash on startup

### Android-Specific Features

#### 1. Date/Time Picker
- [ ] **Android Native Pickers**
  - [ ] Click date selector opens Android date picker
  - [ ] Date picker shows calendar view
  - [ ] Can select date
  - [ ] Click time selector opens Android time picker
  - [ ] Time picker shows clock/number input
  - [ ] Can select time

- [ ] **Reminder/Duration/Repeat**
  - [ ] Reminder selector works (multi-select or dropdowns)
  - [ ] Duration dropdown works
  - [ ] Repeat dropdown works

#### 2. Navigation
- [ ] Hardware back button works
- [ ] Bottom navigation works
- [ ] Modal animations smooth
- [ ] No navigation bugs

#### 3. Material Design
- [ ] Buttons use Material ripple effect
- [ ] Cards have proper elevation
- [ ] Inputs follow Material guidelines

#### 4. Status Bar
- [ ] Status bar color correct
- [ ] Icons visible
- [ ] No overlap with content

#### 5. Run Same Core Tests as Web
- [ ] Authentication flow
- [ ] Task CRUD
- [ ] Category filtering
- [ ] Calendar navigation
- [ ] Real-time sync

---

## 🌐 Cross-Platform Testing

### Test Real-Time Sync Across All 3 Platforms
- [ ] **Setup**: Open app on Web, iOS simulator, and Android emulator simultaneously
- [ ] **Test 1**: Create task on Web → appears on iOS and Android
- [ ] **Test 2**: Edit task on iOS → updates on Web and Android
- [ ] **Test 3**: Delete task on Android → removes from Web and iOS
- [ ] **Test 4**: Complete recurring task on Web → new instance appears on all platforms

### Consistency Checks
- [ ] **Visual**: UI looks consistent across platforms (within platform guidelines)
- [ ] **Data**: Same data appears on all platforms
- [ ] **Behavior**: Core functionality works the same way

---

## 🐛 Bug Tracking

### Web Issues
| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
|       |          |        |       |

### iOS Issues
| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
|       |          |        |       |

### Android Issues
| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
|       |          |        |       |

### Cross-Platform Issues
| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
|       |          |        |       |

---

## ✅ Sign-Off

### Web
- **Tested By:**
- **Date:**
- **Status:** ⬜ Pass / ⬜ Pass with Issues / ⬜ Fail
- **Notes:**

### iOS
- **Tested By:**
- **Date:**
- **Status:** ⬜ Pass / ⬜ Pass with Issues / ⬜ Fail
- **Notes:**

### Android
- **Tested By:**
- **Date:**
- **Status:** ⬜ Pass / ⬜ Pass with Issues / ⬜ Fail
- **Notes:**

---

## 📋 Summary

**Total Tests:** ~100+
**Platforms:** Web, iOS, Android
**Critical Areas:** Auth, Task CRUD, Date Picker, Real-Time Sync
**Automated Tests:** ✅ 149 passing
**Manual Tests:** ⬜ In Progress

---

**Next Steps After Manual Testing:**
1. Document all bugs found
2. Fix critical/high-priority bugs
3. Re-test affected areas
4. Mark Phase 1 as complete
5. Merge to develop branch
6. Deploy to production
