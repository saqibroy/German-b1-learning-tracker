# 🐛 Week Selection Bug Fix

## The Problem
When selecting Week 3 (or potentially other weeks) from the dropdown, the app crashed with a white screen and this error:

```
Uncaught TypeError: Cannot read properties of undefined (reading 'filter')
at App.jsx:1354:56
```

## Root Cause
The code was trying to access `.filter()` on `day.subtasks` without checking if `subtasks` exists. Some days in the data structure might not have the `subtasks` array defined, or it could be undefined during state transitions.

## Locations Fixed

### 1. **TasksView Component (Line 1354-1357)**
**Before:**
```javascript
const subtasksCompleted = day.subtasks.filter(s => s.completed).length;
const subtasksTotal = day.subtasks.length;
```

**After:**
```javascript
const subtasksCompleted = (day.subtasks || []).filter(s => s.completed).length;
const subtasksTotal = (day.subtasks || []).length;
```

### 2. **toggleSubtask Function (Line 856-862)**
**Before:**
```javascript
const newSubtasks = d.subtasks.map((sub, index) =>
    index === subtaskIndex ? { ...sub, completed: !sub.completed } : sub
);
const allSubtasksCompleted = newSubtasks.every(sub => sub.completed);
```

**After:**
```javascript
const subtasks = d.subtasks || [];
const newSubtasks = subtasks.map((sub, index) =>
    index === subtaskIndex ? { ...sub, completed: !sub.completed } : sub
);
const allSubtasksCompleted = newSubtasks.length > 0 && newSubtasks.every(sub => sub.completed);
```

### 3. **DayDetailView Component (Line 1076)**
**Before:**
```javascript
const { task, focus, level, lessonContent, subtasks, resources, notes } = dayData;
```

**After:**
```javascript
const { task, focus, level, lessonContent, subtasks = [], resources, notes } = dayData;
```

## The Fix
Added **defensive programming** with null coalescing:
- Used `(day.subtasks || [])` to provide an empty array fallback
- Added default parameter `subtasks = []` in destructuring
- Added length check before using `.every()` to prevent false positives

## Testing
After this fix:
1. ✅ Week 3 can be selected without errors
2. ✅ Days without subtasks will show 0% progress instead of crashing
3. ✅ All array methods (.filter, .map, .every) are safe from undefined errors
4. ✅ White screen issue resolved

## Why This Happened
The new `goetheB1CompleteData` structure is comprehensive, but during development or state transitions, some days might temporarily have undefined `subtasks`. Adding these safety checks ensures the app is robust against incomplete or partially loaded data.

## Prevention
Always use defensive programming when accessing nested properties or array methods:
- Use optional chaining: `day.subtasks?.filter()` 
- Use null coalescing: `day.subtasks || []`
- Add default parameters in destructuring: `{ subtasks = [] }`
