

## Revamp Security Audit Logs - Industry Standard

### Current Issues
1. **Details shown as raw JSON** - When clicking "View details", it dumps raw JSON which is unreadable
2. **No pagination** - Loads 1000 rows at once, no way to navigate pages
3. **No date range filter** - Can't filter logs by date
4. **Noisy data** - 10,000+ SESSION_START/SESSION_END entries drown out meaningful logs
5. **No detail modal** - Details expand inline as JSON, no structured view
6. **Column order not optimal** - Timestamp first instead of User-first grouping
7. **No severity indicators** - All actions look the same visually
8. **Statistics are basic** - Just 4 counters, no useful breakdown
9. **Export uses raw user IDs** - CSV exports user_id instead of names
10. **field_changes shows system fields** like `modified_at` which are noise

### Plan

#### 1. Restructured Column Layout
Reorder columns to a more logical flow:
- **Date/Time** - formatted as "Feb 10, 2026 4:04 PM"
- **User** - resolved display name with avatar initial
- **Activity** - colored badge (Created, Updated, Deleted, Login, Export, etc.)
- **Module** - Contacts, Deals, Leads, Tasks, etc.
- **Summary** - Human-readable one-line summary of what happened
- **Actions** - View Details button + Revert button (when applicable)

#### 2. Human-Readable Detail Panel (Dialog, not JSON)
Replace the inline JSON `<details>` with a proper **Dialog/Sheet** that shows:

**For UPDATE actions:**
- Record name (e.g., "Deal: HCP 3 In-House development")
- Table of field changes: Field Name | Previous Value | New Value
- Filter out noise fields: `modified_at`, `modified_by`, `created_at`, `created_by`, `id`
- Format field names: `customer_name` becomes "Customer Name"
- Format dates, booleans, nulls into readable text

**For CREATE actions:**
- Record name
- Key fields displayed as a definition list (Label: Value pairs)
- Skip null/empty fields
- Skip internal fields (id, created_at, etc.)

**For DELETE actions:**
- Record name
- Show what was deleted in a definition list

**For NOTE/EMAIL/MEETING/CALL actions:**
- Show the message content directly
- Show log type label

**For AUTH actions (LOGIN/LOGOUT):**
- Email, browser/device info, time

**For DATA_EXPORT/IMPORT:**
- Module, file name, record count, scope

#### 3. Add Pagination
- 50 rows per page
- Page navigation at the bottom
- Show "Showing 1-50 of 1,234 entries"

#### 4. Add Date Range Filter
- Date picker for "From" and "To" dates
- Quick presets: Today, Last 7 days, Last 30 days, This month

#### 5. Improved Filter Categories
- All Activities
- Record Changes (Create/Update/Delete)
- User Management (role changes, password, etc.)
- Authentication (Login/Logout only, exclude session noise)
- Data Import/Export
- Activities (Notes, Emails, Meetings, Calls)

#### 6. Smart Summary Column
Generate a human-readable one-liner for each log:
- UPDATE: "Updated Deal 'HCP 3' - changed status from In Progress to Completed"
- CREATE: "Created new Lead 'Deepak Dongare'"
- DELETE: "Deleted Contact 'John Smith'"
- NOTE: "Added note on Deal: 'dfdf'"
- EMAIL: "Logged email activity on Deal"
- SESSION_START: "Logged in"
- DATA_EXPORT: "Exported 48 deals as CSV"

#### 7. Improved Statistics Section
- Show breakdown by module (Deals, Leads, Contacts, Tasks)
- Show breakdown by user (who is most active)
- Time-based: "Today: X events | This week: Y events"

#### 8. Better Export
- Include resolved user names instead of UUIDs
- Include the human-readable summary column
- Proper CSV escaping

#### 9. Exclude Noise by Default
- Filter out SESSION_ACTIVE, SESSION_INACTIVE, SESSION_HEARTBEAT, WINDOW_BLUR, WINDOW_FOCUS, USER_ACTIVITY, SELECT, SENSITIVE_DATA_ACCESS, PAGE_NAVIGATION by default
- These are system-level events that clutter the admin view

### Technical Details

**Files to modify:**
- `src/components/settings/AuditLogsSettings.tsx` - Complete rewrite of the component

**New sub-components to create:**
- `src/components/settings/audit/AuditLogDetailDialog.tsx` - Structured detail view dialog
- `src/components/settings/audit/AuditLogFilters.tsx` - Date range + category filters
- `src/components/settings/audit/AuditLogStats.tsx` - Enhanced statistics section
- `src/components/settings/audit/auditLogUtils.ts` - Utility functions for formatting

**Key utility functions:**
- `formatFieldName(field)` - Converts `customer_name` to "Customer Name"
- `formatFieldValue(value)` - Formats dates, booleans, nulls, arrays
- `generateSummary(log)` - Creates human-readable one-liner
- `getExcludedActions()` - Returns list of noise actions to hide
- `filterInternalFields(data)` - Removes `id`, `created_at`, `modified_at`, etc.

**No database changes needed** - All improvements are UI-only on existing data.

