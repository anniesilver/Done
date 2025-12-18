# Calendar Import Overlap Handling - Implementation Plan

## Overview
Implement comprehensive overlap detection and visualization for iPhone calendar imports. ALL events are imported (non-blocking), conflicts are detected post-import, users are alerted with actionable information, and overlapping tasks render side-by-side in the timeline view.

## User Requirements Summary
1. Import ALL calendar events, even if they overlap
2. After import, show alert with conflicting task list + link to timeline
3. Check overlaps across entire 30-day import range (not just same day)
4. Render overlapping tasks side-by-side: 2 conflicts = 50% width each, 3 = 33% each, etc.

## Current State
- ✅ Overlap detection utility exists (`timeSlotValidation.ts`)
- ✅ Validation works in TaskForm (manual task creation)
- ❌ Calendar import doesn't validate overlaps
- ❌ Timeline doesn't handle visual overlap rendering
- ❌ No post-import conflict reporting

---

## Implementation Steps

### Phase 1: Data Layer - Date Range Task Retrieval
**File:** `src/stores/taskStore.ts`

Add method to get tasks within a date range (needed for 30-day overlap detection):

```typescript
// Add to TaskStore interface (~line 27)
getTasksForDateRange: (startDate: Date, endDate: Date) => Task[];

// Implementation (~line 200)
getTasksForDateRange: (startDate: Date, endDate: Date) => {
  const tasks = get().tasks;
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return tasks.filter((task) => {
    if (!task.dueDate || !task.duration || task.duration === 0) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate >= start && taskDate <= end;
  });
},
```

### Phase 2: Post-Import Overlap Detection
**Files:** `src/services/calendarImportService.ts`, `src/stores/calendarSyncStore.ts`

**Step 2a: Enhance Data Structure**

Update `CalendarSyncResult` interface in `calendarImportService.ts`:

```typescript
export interface CalendarSyncResult {
  success: boolean;
  eventsImported: number;
  tasksCreated: CreateTaskInput[];
  errors: string[];
  // NEW FIELDS:
  conflictCount: number;
  conflictingTasks: Array<{
    taskText: string;
    dueDate: Date;
    duration: number;
    conflictsWith: string[]; // Names of tasks it overlaps with
  }>;
}
```

**Step 2b: Add Overlap Detection Logic**

In `calendarSyncStore.ts`, after tasks are created (line ~223 in `syncCalendars`, similar for `quickSync`):

```typescript
// Import at top
import { getOverlappingTasks } from '../utils/timeSlotValidation';

// After line 223 (after all tasks created):
// Detect overlaps
const startDate = new Date();
const endDate = new Date();
endDate.setDate(endDate.getDate() + daysAhead);

const tasksInRange = taskStore.getTasksForDateRange(startDate, endDate);

const conflictingTasks = [];
for (const taskInput of result.tasksCreated) {
  if (!taskInput.dueDate || !taskInput.duration || taskInput.duration === 0) continue;

  const newTaskSlot = {
    start: new Date(taskInput.dueDate),
    end: new Date(new Date(taskInput.dueDate).getTime() + taskInput.duration * 60000)
  };

  const overlaps = getOverlappingTasks(newTaskSlot, tasksInRange);
  const conflicts = overlaps.filter(t => t.text !== taskInput.text);

  if (conflicts.length > 0) {
    conflictingTasks.push({
      taskText: taskInput.text,
      dueDate: taskInput.dueDate,
      duration: taskInput.duration,
      conflictsWith: conflicts.map(c => c.text)
    });
  }
}

result.conflictCount = conflictingTasks.length;
result.conflictingTasks = conflictingTasks;
```

### Phase 3: User Alert with Conflict Report
**File:** `src/screens/settings/CalendarSyncScreen.tsx`

Update `handleSync()` and `handleQuickSync()` methods:

```typescript
// Add navigation prop to component
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export function CalendarSyncScreen({
  navigation
}: {
  navigation: NativeStackNavigationProp<any>
}) {

// In handleSync (line ~90):
const handleSync = async () => {
  if (selectedCalendarIds.length === 0) {
    Alert.alert('No Calendars Selected', 'Please select at least one calendar.');
    return;
  }

  const result = await syncCalendars(30);

  if (result.success) {
    if (result.conflictCount > 0) {
      const maxShow = 5;
      const conflictList = result.conflictingTasks
        .slice(0, maxShow)
        .map(c => `• ${c.taskText}\n  Conflicts with: ${c.conflictsWith.join(', ')}`)
        .join('\n\n');

      const moreText = result.conflictingTasks.length > maxShow
        ? `\n\n...and ${result.conflictingTasks.length - maxShow} more`
        : '';

      Alert.alert(
        'Sync Complete with Conflicts',
        `Imported ${result.eventsImported} event(s).\n\n` +
        `${result.conflictCount} task(s) have time conflicts:\n\n` +
        conflictList + moreText,
        [
          { text: 'Dismiss', style: 'cancel' },
          {
            text: 'View Timeline',
            onPress: () => navigation.navigate('Calendar', { initialView: 'timeline' })
          }
        ]
      );
    } else {
      Alert.alert('Sync Complete', `Imported ${result.eventsImported} event(s).`);
    }
  } else {
    Alert.alert('Sync Failed', result.errors.join('\n'));
  }
};
```

### Phase 4: Timeline Visual Overlap - Side-by-Side Rendering
**File:** `src/components/calendar/TimelineView.tsx`

This is the most complex part. Key additions:

**Step 4a: Add Interfaces**

```typescript
interface OverlapGroup {
  tasks: Task[];
  startTime: number;
  endTime: number;
}

interface TaskLayoutInfo {
  task: Task;
  column: number;
  totalColumns: number;
  width: number;  // percentage
  left: number;   // percentage
}
```

**Step 4b: Build Overlap Groups Algorithm**

Groups tasks that overlap with each other:

```typescript
const buildOverlapGroups = (tasks: Task[]): OverlapGroup[] => {
  const sortedTasks = [...tasks].sort((a, b) =>
    new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
  );

  const groups: OverlapGroup[] = [];

  for (const task of sortedTasks) {
    const taskStart = new Date(task.dueDate!);
    const taskEnd = new Date(taskStart.getTime() + task.duration * 60000);

    let addedToGroup = false;
    for (const group of groups) {
      const groupStart = new Date(group.startTime);
      const groupEnd = new Date(group.endTime);

      if (hasOverlap(
        { start: taskStart, end: taskEnd },
        { start: groupStart, end: groupEnd }
      )) {
        group.tasks.push(task);
        group.startTime = Math.min(group.startTime, taskStart.getTime());
        group.endTime = Math.max(group.endTime, taskEnd.getTime());
        addedToGroup = true;
        break;
      }
    }

    if (!addedToGroup) {
      groups.push({
        tasks: [task],
        startTime: taskStart.getTime(),
        endTime: taskEnd.getTime()
      });
    }
  }

  return groups;
};
```

**Step 4c: Assign Columns Algorithm**

Assigns each overlapping task to a column (side-by-side positioning):

```typescript
const assignColumns = (group: OverlapGroup): TaskLayoutInfo[] => {
  const layoutInfos: TaskLayoutInfo[] = [];
  const columns: Task[][] = [];

  const sortedTasks = [...group.tasks].sort((a, b) =>
    new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
  );

  for (const task of sortedTasks) {
    const taskStart = new Date(task.dueDate!);
    const taskEnd = new Date(taskStart.getTime() + task.duration * 60000);

    let assignedColumn = -1;
    for (let col = 0; col < columns.length; col++) {
      const canFit = columns[col].every(existingTask => {
        const existingStart = new Date(existingTask.dueDate!);
        const existingEnd = new Date(existingStart.getTime() + existingTask.duration * 60000);

        return !hasOverlap(
          { start: taskStart, end: taskEnd },
          { start: existingStart, end: existingEnd }
        );
      });

      if (canFit) {
        assignedColumn = col;
        break;
      }
    }

    if (assignedColumn === -1) {
      assignedColumn = columns.length;
      columns.push([]);
    }

    columns[assignedColumn].push(task);
  }

  const totalColumns = columns.length;
  const widthPercent = 100 / totalColumns;

  for (let col = 0; col < columns.length; col++) {
    for (const task of columns[col]) {
      layoutInfos.push({
        task,
        column: col,
        totalColumns,
        width: widthPercent,
        left: col * widthPercent
      });
    }
  }

  return layoutInfos;
};
```

**Step 4d: Update Rendering**

```typescript
// Import hasOverlap
import { hasOverlap } from '../../utils/timeSlotValidation';

// In main render logic (line ~257):
const timelineTasks = tasks.filter(t => t.dueDate && t.duration > 0);

// Build layout map
const overlapGroups = buildOverlapGroups(timelineTasks);
const taskLayoutMap = new Map<number | string, TaskLayoutInfo>();

for (const group of overlapGroups) {
  if (group.tasks.length > 1) {
    const layouts = assignColumns(group);
    layouts.forEach(layout => {
      taskLayoutMap.set(layout.task.id, layout);
    });
  }
}

// Update renderTaskBlock signature
const renderTaskBlock = (task: Task, layoutInfo?: TaskLayoutInfo) => {
  // ... existing code ...

  // Update container style:
  <View
    style={[
      styles.taskBlockContainer,
      {
        top: position,
        height,
        width: layoutInfo ? undefined : TASK_COLUMN_WIDTH,
        left: layoutInfo ? undefined : spacing.sm,
        right: layoutInfo ? undefined : spacing.sm,
      },
      layoutInfo && {
        width: `${layoutInfo.width}%`,
        left: `${layoutInfo.left}%`,
        right: undefined,
      }
    ]}
  >
```

```typescript
// Render with layout info
return (
  <View style={styles.tasksColumn}>
    {timelineTasks.map(task =>
      renderTaskBlock(task, taskLayoutMap.get(task.id))
    )}
  </View>
);
```

**Step 4e: Update Styles**

Remove fixed left/right from `taskBlockContainer` style:

```typescript
taskBlockContainer: {
  position: 'absolute',
  // REMOVE: left: spacing.sm,
  // REMOVE: right: spacing.sm,
},
```

---

## Critical Files to Modify

1. **src/stores/taskStore.ts** - Add `getTasksForDateRange()` method
2. **src/services/calendarImportService.ts** - Update `CalendarSyncResult` interface
3. **src/stores/calendarSyncStore.ts** - Add overlap detection logic after import
4. **src/screens/settings/CalendarSyncScreen.tsx** - Show conflict alert with navigation
5. **src/components/calendar/TimelineView.tsx** - Implement side-by-side rendering (~150-200 new lines)

---

## Key Edge Cases Handled

1. **Three or more overlaps** - Algorithm assigns to 3+ columns automatically
2. **Cascading overlaps** (A↔B, B↔C, not A↔C) - Group expansion handles transitive overlaps
3. **Zero duration tasks** - Filtered out from overlap detection and timeline
4. **Same-time start/end** - hasOverlap uses `start1 < end2` (no overlap if end1 == start2)
5. **Very short tasks** - MIN_TASK_HEIGHT already enforced
6. **No conflicts** - Shows simple success message, no timeline navigation

---

## Testing Checklist

- [ ] Import calendar with no overlaps → success message
- [ ] Import with 2 overlapping events → alert shows 2 conflicts
- [ ] Import with 10+ conflicts → alert shows first 5 + "and X more"
- [ ] "View Timeline" navigation works
- [ ] Timeline shows 2 overlapping tasks at 50% width each
- [ ] Timeline shows 3 overlapping tasks at 33% width each
- [ ] Cascading overlaps (A↔B, B↔C) render correctly
- [ ] Tasks still tappable/swipeable when overlapping
- [ ] Conflict with existing non-imported task detected

---

## Implementation Time Estimate

**8-12 hours** for experienced React Native developer

**Risk Level:** Medium (complex layout algorithm, but well-defined)

**User Impact:** High (significantly improves calendar sync UX)
