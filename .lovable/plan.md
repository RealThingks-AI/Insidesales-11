

## Fix Action Item Status Display in Kanban History

### Problem
The previous code fix only affected **new** action item status logs. Existing logs in the database still contain the old format: `"Action item status changed: Open → Completed"`. These old messages are displayed as-is because the code at line 259 uses `details.message` directly when it exists.

### Solution
Two-pronged fix:

**1. Update display logic in `DealExpandedPanel.tsx`**
In the `mergedHistory` mapping (line 259), add logic to detect old-format messages and reformat them using the `action_item_title` from the same log details:

```typescript
// Line 257-264: mergedHistory mapping
const mappedLogs = manualAndStatusLogs.map((log) => {
  const details = log.details as any;
  let message = details?.message || parseChangeSummary(log.action, log.details);
  
  // Fix old-format action item messages: use title + new status
  if (details?.action_item_title && details?.field_changes?.status) {
    message = `${details.action_item_title} → ${details.field_changes.status.new}`;
  }
  
  return {
    id: log.id,
    message,
    user_id: log.user_id,
    created_at: log.created_at,
    isCompletedAction: false,
    originalLog: log
  };
});
```

This approach:
- Checks if the log has `action_item_title` and `field_changes.status` (both old and new format logs have these)
- Reconstructs the message as `"Title → NewStatus"` regardless of what was stored in `message`
- Works for both old records and new records
- No database migration needed

### File to Modify
- `src/components/DealExpandedPanel.tsx` - Update the `mergedHistory` mapping (lines 257-264)

