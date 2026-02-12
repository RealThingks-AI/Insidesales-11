
## Fix Kanban View Change History Display

### Current Behavior
In the Deals Kanban view, the change history list shows action item status changes like:
- **"Action item status changed: Open → Completed"**

When you click to view details, it shows a full field changes table with "Old Value → New Value".

### Requirements
1. **In the list view** (Changes column in the table): Show only the action item name and new status
   - Current: "Action item status changed: Open → Completed"
   - Required: "Action item name → Completed"

2. **In the details modal**: Keep showing the full "Old Value → New Value" table (only visible when viewing details)

### Root Cause Analysis
Looking at `src/components/DealExpandedPanel.tsx`:

1. **Line 484** in `handleStatusChange()`: The message is created as `${item?.title} → ${status}` ✓ (Already correct format)
2. **Line 254** in `parseChangeSummary()`: This function runs `parseFieldChanges()` which generates "status: Open → Completed" summaries
3. **Line 570** in the history table: It displays `entry.message` which should contain the correctly formatted message

### The Problem
The issue is that **when manual logs are added**, the `parseChangeSummary()` function is being called on logs that have `action_item_title` set. This function runs `parseFieldChanges()` which returns "status: Old → New" format, overriding the simple message format we want.

The filter on **line 237** looks for `details?.action_item_title`, but the actual message in `details?.message` (set on line 484) is being ignored.

### Solution
Modify the logic to:

1. **In `parseChangeSummary()` function (lines 120-136)**:
   - Check if `details?.message` exists (manual action item log)
   - If it exists, return the message as-is (don't run parseFieldChanges)
   - Only parse field changes for automatic system logs

2. **In the history table display (line 570)**:
   - Keep displaying `entry.message` (no change needed, it will work once above is fixed)

3. **In the detail modal (lines 783-817)**:
   - Keep the full field changes table visible (no change needed)
   - Users will only see "Old Value → New Value" when they click the eye icon to view details

### Technical Changes

**File: `src/components/DealExpandedPanel.tsx`**

Change the `parseChangeSummary()` function (lines 120-136) to check for pre-formatted message first:

```typescript
const parseChangeSummary = (action: string, details: Record<string, unknown> | null): string => {
  if (!details || typeof details !== 'object') return action === 'create' ? 'Created deal' : action;

  // If there's already a formatted message (from manual action item logs), use it
  if (details.message && typeof details.message === 'string') {
    return details.message;
  }

  const changes = parseFieldChanges(details);
  if (changes.length === 0) return action === 'create' ? 'Created deal' : 'Updated';

  const stageChange = changes.find((c) => c.field === 'stage');
  if (stageChange) {
    return `${stageChange.oldValue} → ${stageChange.newValue}`;
  }

  const first = changes[0];
  if (changes.length === 1) {
    return `${first.field}: ${first.oldValue} → ${first.newValue}`;
  }
  return `${first.field} +${changes.length - 1}`;
};
```

### Visual Result After Fix

**Changes List (what users see):**
```
"Task Name → Completed"
"Another Task → In Progress"
```

**Details Modal (when clicking eye icon):**
```
Field Changes
Field    | Old Value    | New Value
---------|--------------|----------
status   | Open         | Completed
```

### Files to Modify
- `src/components/DealExpandedPanel.tsx` - Update `parseChangeSummary()` function

### Testing
- Open a deal in Kanban view
- Change an action item status
- Verify the Changes list shows: "Action item name → Status" (no old value)
- Click the eye icon to view details
- Verify the detail modal shows the full "Old Value → New Value" table
