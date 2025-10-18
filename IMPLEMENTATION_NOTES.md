# Implementation Notes - Phase 1

**Last Updated:** October 18, 2024

This document tracks actual implementation details that differ from or add to the original plan.

---

## Database Schema - Actual Implementation

### Tasks Table
Using existing TaskFlow database with these columns:

```sql
-- Confirmed columns in use:
tasks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  due_date TIMESTAMPTZ,
  reminder_time TIMESTAMPTZ,  -- Added for Phase 3 (notifications)
  recurrence TEXT DEFAULT 'none',  -- 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  category_id INTEGER REFERENCES categories(id),
  duration INTEGER DEFAULT 0,  -- in minutes
  created_at TIMESTAMPTZ DEFAULT now()
)
```

**Note:** No new tables added. Using existing `tasks` and `categories` tables from TaskFlow.

---

## Key Implementation Differences

### 1. iOS Date/Time Picker - Complete Redesign

**Planned:** Use native iOS date/time spinner picker
**Actually Built:** Custom calendar-based modal picker

**Why Changed:**
- iOS native spinner had bugs showing empty past dates
- Numbers weren't visible in spinner wheels on some iOS versions
- User requested calendar interface (like Chinese calendar apps)

**Current Implementation:**
- Custom calendar grid (7x6 days)
- Month navigation (< October 2024 >)
- Integrated sections below calendar:
  - 🕐 **Time** - Spinner picker (works well for time only)
  - 🔔 **Reminder** - Multi-select checkbox list
  - ⏱️ **Duration** - Single select dropdown
  - 🔁 **Repeat** - Single select dropdown
- All sections expand/collapse on tap
- Scrollable options area (max 280px height)

**Files:**
- `src/components/tasks/TaskTimeSelector.tsx` - Complete rewrite
- `src/components/tasks/TaskForm.tsx` - Integration logic

---

### 2. Reminder System - Multi-Select UI with Single DB Storage

**Planned:** Single reminder time picker
**Actually Built:** Multi-select reminder UI + conversion logic

**How it Works:**

**UI:** Users can select multiple reminders:
- 5 minutes before
- 10 minutes before
- 30 minutes before
- 1 hour before
- 1 day before

**Database:** Only stores ONE `reminder_time` (earliest selected)

**Conversion Logic** (`TaskForm.tsx` lines 67-85):
```typescript
// If user selects ["10 min before", "1 hour before"]
// System calculates both times and saves the EARLIEST (1 hour before)
const calculateReminderTime = (reminders: string[], dueDate: Date) => {
  const reminderMinutes = {
    '5 minutes before': 5,
    '10 minutes before': 10,
    '30 minutes before': 30,
    '1 hour before': 60,
    '1 day before': 1440,
  };

  // Get earliest (largest number)
  const maxMinutes = Math.max(...reminders.map(r => reminderMinutes[r]));
  return new Date(dueDate.getTime() - maxMinutes * 60 * 1000);
};
```

**Phase 3 Note:** When implementing actual notifications, will need to schedule multiple notifications based on all selected reminders, not just the earliest one.

---

### 3. Recurrence/Repeat Handling

**UI String → Database Type Conversion:**

| UI Display | Database Value |
|------------|----------------|
| "None"     | 'none'         |
| "Daily"    | 'daily'        |
| "Weekly"   | 'weekly'       |
| "Monthly"  | 'monthly'      |
| "Yearly"   | 'yearly'       |

**Implementation** (`TaskForm.tsx` lines 55-64):
```typescript
const getRecurrence = (repeat: string): RecurrenceType => {
  switch (repeat.toLowerCase()) {
    case 'daily': return 'daily';
    case 'weekly': return 'weekly';
    case 'monthly': return 'monthly';
    case 'yearly': return 'yearly';
    default: return 'none';
  }
};
```

---

### 4. Duration Integration

**Planned:** Separate `TaskDurationSelector` component
**Actually Built:** Integrated into calendar modal

**Current Location:** Inside `TaskTimeSelector.tsx` modal, below reminder section

**Options:**
- No duration
- 15 min
- 30 min
- 45 min
- 1 hour
- 1.5 hours
- 2 hours

**Why Changed:** Better UX - all date/time/reminder/duration settings in one place

---

### 5. Task Form Optimization

**Changes:**
- Removed `ScrollView` wrapper (was causing VirtualizedList warning)
- Reduced spacing to fit in smaller modal
- Changed modal `presentationStyle` to `"formSheet"` for create/edit mode
- Display selected settings in a summary box below date selector

**Settings Display Format:**
```
┌─────────────────────────────────┐
│ 📅 Due: Oct 18, 2024 10:50 AM   │
│ ⏱️ Duration: 1h                 │
│ 🔔 Reminders: 10 min, 1 hour    │
│ 🔁 Repeat: Weekly               │
└─────────────────────────────────┘
```

---

## Components Architecture - As Built

### TaskTimeSelector
**Responsibility:** All date/time/reminder/duration/repeat selection

**Props:**
```typescript
{
  value: Date | null;
  onChange: (date: Date | null) => void;
  onReminderChange?: (reminders: string[]) => void;  // NEW
  onRepeatChange?: (repeat: string) => void;         // NEW
  onDurationChange?: (duration: number) => void;     // NEW
  reminderValue?: string[];                          // NEW
  repeatValue?: string;                              // NEW
  durationValue?: number;                            // NEW
}
```

**Platform Differences:**
- **iOS:** Custom calendar modal (described above)
- **Android:** Sequential native pickers (date → time)
- **Web:** HTML5 input controls (date + time)

### TaskForm
**Responsibility:** Task creation/editing with all properties

**New State:**
```typescript
const [reminderSettings, setReminderSettings] = useState<string[]>([]);
const [repeatSetting, setRepeatSetting] = useState<string>('None');
```

**Conversion Functions:**
- `calculateReminderTime()` - Multiple reminders → single Date
- `getRecurrence()` - UI string → RecurrenceType
- `getReminderSettingsFromTime()` - Date → UI strings (for edit mode)
- `getRepeatSettingFromRecurrence()` - RecurrenceType → UI string

---

## Bugs Fixed During Implementation

### 1. iOS Date Picker Issues
- ❌ **Bug:** Past dates showing as "Mon, Tue" without numbers
- ✅ **Fix:** Set `minimumDate` to start of today (00:00:00), not current moment

### 2. Time Picker Restrictions
- ❌ **Bug:** Couldn't select times before current time (even on future dates)
- ✅ **Fix:** `minimumDate` set to midnight, not current time

### 3. VirtualizedList Warning
- ❌ **Warning:** "VirtualizedLists should never be nested inside plain ScrollViews"
- ✅ **Fix:** Removed ScrollView from TaskForm (CategoryPicker FlatList was nested)

### 4. Modal Height Issues
- ❌ **Problem:** Empty space at bottom of modals
- ✅ **Fix:** Changed `presentationStyle` to `"formSheet"`, removed `flex: 1`, optimized spacing

---

## Files Modified Since Plan

### New/Major Rewrites:
- `src/components/tasks/TaskTimeSelector.tsx` - Complete custom calendar implementation
- `src/components/tasks/TaskForm.tsx` - Added conversion logic, removed ScrollView

### Modified:
- `src/screens/modals/TaskDetailModal.tsx` - Modal presentation style changes
- `.gitignore` - Added Claude settings and lighthouse reports

### Removed Components (Integrated):
- ~~TaskReminderSelector~~ - Now inside TaskTimeSelector
- ~~TaskDurationSelector~~ - Now inside TaskTimeSelector
- ~~TaskRecurrenceSelector~~ - Now inside TaskTimeSelector

**Note:** Phase 1 plan mentioned separate selectors (lines 276-279, 590-593), but we integrated everything for better UX.

---

## Phase 1 Status - Current Progress

### ✅ Completed:
1. Auth system (sign up, login, logout, session persistence)
2. Data stores (taskStore, categoryStore, authStore, uiStore, timerStore)
3. Supabase CRUD (tasks, categories)
4. All UI components (common, task, category, calendar, timer)
5. All 3 main screens (Today, Tasks, Calendar)
6. Bottom tab navigation
7. Task CRUD from all views
8. Category filtering
9. Recurring tasks
10. Timer functionality
11. Real-time Supabase subscriptions
12. **iOS date/time picker (custom calendar implementation)**
13. **Reminder/Duration/Repeat integration**
14. **Data conversion logic for database**

### 🚧 In Progress:
- None

### ⏸️ Deferred to Later Phases:
- Phase 2: Offline support (AsyncStorage, sync queue)
- Phase 3: Actual notifications (expo-notifications, scheduling)
- Phase 4: Polish, animations, deployment

---

## Next Steps

### Before Completing Phase 1:

**Testing Checklist:**
- [ ] Test all task CRUD operations with new reminder/repeat/duration
- [ ] Verify data saved correctly to Supabase
- [ ] Test on all platforms (iOS, Android, Web)
- [ ] Verify reminder conversion logic (multiple → single)
- [ ] Test edit mode (loading existing reminder/repeat values)
- [ ] Test calendar date selection (no past dates)
- [ ] Test all recurrence patterns (daily, weekly, monthly, yearly)

**Documentation:**
- [x] Update IMPLEMENTATION_NOTES.md (this file)
- [ ] Update DONE_PROJECT_PLAN_REVISED.md if needed
- [ ] Add screenshots to docs/ folder (optional)

**Git:**
- [x] Commit iOS date/time picker redesign
- [x] Update .gitignore
- [ ] Merge phase-1-core-features → develop (when complete)
- [ ] Tag release v0.1.0 (when deployed)

---

## Known Limitations

1. **Reminder UI vs Database Mismatch:**
   - UI shows multiple reminders selected
   - Database only stores earliest one
   - Will need multi-reminder support in Phase 3 for actual notifications

2. **iOS Custom Calendar:**
   - No swipe gestures for month navigation (only arrow buttons)
   - No week numbers
   - No holiday indicators
   - Could be enhanced in Phase 4 polish

3. **Duration Options:**
   - Fixed preset list (15min, 30min, 45min, 1h, 1.5h, 2h)
   - No custom duration input
   - Could add custom input in future

---

## Performance Notes

- Calendar renders ~42 days (6 weeks)
- Modal uses ScrollView for options (height-limited to 280px)
- No virtualization needed (small dataset)
- date-fns used for all date calculations (tree-shakeable)

---

## Dependencies Added

All from original plan, no new dependencies during implementation.

**Core:**
- zustand
- @supabase/supabase-js
- date-fns
- react-native-paper
- @react-navigation/*

---

**Document Version:** 1.0
**Last Commit:** `8fbafa6` - feat(tasks): redesign iOS date/time picker with integrated calendar modal
