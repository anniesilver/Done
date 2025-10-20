# Test Suite Documentation

## Overview

This is the comprehensive test suite for the **Done** task management app (Phase 1). The tests cover all critical functionality including task CRUD operations, data conversion logic, recurring tasks, authentication, and Supabase integration.

## Test Coverage

### Test Files

#### **Unit Tests - Stores** (`/stores/`)
- `taskStore.test.ts` - Task state management (fetchTasks, addTask, updateTask, deleteTask, toggleComplete, filters)
- `categoryStore.test.ts` - Category state management (CRUD operations, default categories)
- `authStore.test.ts` - Authentication state (signUp, signIn, signOut, getCurrentUser)

#### **Unit Tests - Services** (`/services/`)
- `supabaseService.test.ts` - All Supabase CRUD operations
  - Auth service (sign up, sign in, sign out, get current user)
  - Task service (create, read, update, delete tasks)
  - Category service (create, read, delete categories)
  - Database row conversion (snake_case ↔ camelCase)

#### **Unit Tests - Utils** (`/utils/`)
- `recurringTasks.test.ts` - Recurring task logic
  - calculateNextDueDate (daily, weekly, monthly, yearly)
  - createRecurringInstance (preserves properties, calculates reminder offset)

#### **Unit Tests - Components** (`/components/`)
- `TaskForm.conversion.test.ts` - Critical data conversion logic
  - Reminder settings → reminder time (multiple selections → earliest time)
  - Repeat strings → RecurrenceType enum ('Daily' → 'daily')
  - Round-trip conversions for edit mode
  - Duration value handling (15, 30, 60, 90, 120 minutes)

#### **Integration Tests** (`/integration/`)
- `taskCRUD.integration.test.ts` - End-to-end task flows
  - Complete task lifecycle (create → update → delete)
  - Task creation with all properties
  - Recurring task completion (creates next instance)
  - Multi-store integration (tasks + categories)
  - Error handling and recovery

## Installation

Install test dependencies:

```bash
npm install --save-dev jest jest-expo @testing-library/react-native @testing-library/jest-native @types/jest react-test-renderer
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (re-runs on file changes)
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run tests with verbose output
```bash
npm run test:verbose
```

### Run specific test file
```bash
npm test taskStore.test.ts
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="should create a task"
```

## Test Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| Stores | 90%+ | ✅ |
| Services | 85%+ | ✅ |
| Utils | 95%+ | ✅ |
| Components (logic) | 80%+ | ✅ |
| **Overall** | **80%+** | **TBD** |

Run `npm run test:coverage` to see detailed coverage report.

## Key Test Scenarios

### 1. Task CRUD Operations
- Create task with all properties (dueDate, reminder, recurrence, category, duration)
- Update task (single field, multiple fields)
- Delete task
- Toggle completion
- Fetch tasks with filters

### 2. Data Conversion (Critical!)
According to `IMPLEMENTATION_NOTES.md`, these conversions are essential:

**Multiple Reminders → Single Database Time:**
```typescript
// UI: User selects ["10 min before", "1 hour before", "1 day before"]
// Database: Saves only earliest (1 day before = 1440 minutes)
```

**UI Strings → Database Enums:**
```typescript
// UI: "Daily", "Weekly", "Monthly", "Yearly"
// Database: 'daily', 'weekly', 'monthly', 'yearly'
```

**Duration Numbers:**
```typescript
// UI: 0, 15, 30, 45, 60, 90, 120 (minutes)
// Database: Stored as-is
```

### 3. Recurring Tasks
- Completing a daily task creates next instance (tomorrow)
- Completing a weekly task creates next instance (next week)
- Completing a monthly task creates next instance (next month, handles month-end correctly)
- Reminder time offset is preserved in new instances
- Non-recurring tasks do NOT create new instances

### 4. Authentication
- Sign up with email/password
- Sign in with valid credentials
- Sign in fails with invalid credentials
- Sign out clears user state
- Get current user (session persistence)

### 5. Category Management
- Create category
- Delete category
- Filter tasks by category
- Get uncategorized tasks (categoryId = null)

### 6. Error Handling
- Network errors during CRUD operations
- Invalid data (null, undefined)
- Database errors
- Recovery after error (retry)

## Mocking Strategy

### Supabase Client
The Supabase client is fully mocked in `__tests__/setup.ts`:
```typescript
jest.mock('../src/config/supabase', () => ({
  supabase: {
    auth: { /* mocked methods */ },
    from: jest.fn(() => ({ /* mocked query builder */ }))
  }
}));
```

### Auth Store
Auth store is mocked to provide a test user:
```typescript
(useAuthStore.getState as jest.Mock).mockReturnValue({
  user: createMockUser()
});
```

### Services
All Supabase services (taskService, categoryService, authService) are mocked in individual tests to control responses.

## Test Utilities

Located in `__tests__/utils/testHelpers.ts`:

- `createMockUser()` - Creates a mock User object
- `createMockTask()` - Creates a mock Task object with customizable properties
- `createMockCategory()` - Creates a mock Category object
- `createMockTasks(count)` - Creates multiple mock tasks
- `createMockCategories(count)` - Creates multiple mock categories
- `taskToDbRow()` - Converts Task to database row (mimics supabaseService)
- `dbRowToTask()` - Converts database row to Task
- `createTestDate()` - Helper for creating test dates
- `waitForAsync()` - Waits for async operations

## Writing New Tests

### Test Structure (AAA Pattern)
```typescript
it('should do something', async () => {
  // Arrange - Set up test data and mocks
  const mockTask = createMockTask({ id: 1, text: 'Test' });
  (taskService.createTask as jest.Mock).mockResolvedValue({
    task: mockTask,
    error: null
  });

  // Act - Execute the function under test
  await useTaskStore.getState().addTask({ text: 'Test' });

  // Assert - Verify the results
  expect(useTaskStore.getState().tasks).toHaveLength(1);
  expect(useTaskStore.getState().tasks[0].text).toBe('Test');
});
```

### Best Practices
1. **Use descriptive test names**: "should create task with all properties"
2. **Test one thing per test**: Don't combine multiple assertions for different behaviors
3. **Use mock helpers**: Don't create mock data inline
4. **Reset state before each test**: Use `beforeEach` hooks
5. **Test error cases**: Don't just test happy paths
6. **Test edge cases**: null, undefined, empty arrays, boundary values
7. **Use TypeScript**: Ensure type safety in tests

## Common Issues

### "Cannot find module" errors
Run `npm install` to ensure all test dependencies are installed.

### "ReferenceError: jest is not defined"
Make sure `jest.config.js` is in the project root.

### Tests fail with "Network request failed"
Ensure Supabase is properly mocked in `setup.ts`.

### "TypeError: Cannot read property 'getState' of undefined"
Store might not be properly imported. Check import paths.

## CI/CD Integration

To integrate with CI/CD pipelines:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --coverage
      - run: npm run test:coverage
```

## Next Steps (Phase 2+)

Future test additions:
- Offline mode tests (AsyncStorage, sync queue)
- Notification scheduling tests (expo-notifications)
- UI component rendering tests (React Native Testing Library)
- E2E tests with Detox or Maestro
- Performance tests
- Accessibility tests

## Questions?

For questions or issues with tests:
1. Check this README
2. Review existing test files for examples
3. Check `IMPLEMENTATION_NOTES.md` for implementation details
4. Review `DONE_PROJECT_PLAN_REVISED.md` for project context

---

**Last Updated:** October 19, 2024
**Phase:** 1 (Core Features - Online Only)
**Test Files:** 8
**Test Cases:** 100+
**Coverage Target:** 80%+
