

## Audit Logging Gaps & Improvements — Full CRM Analysis

### Summary

After deep-diving into every module's CRUD operations and comparing them against audit log calls, here are all the gaps and bugs found:

---

### Critical Bugs (Actions NOT Logged at All)

**1. `useActionItems.tsx` — Zero audit logging**
The main Action Items hook (`src/hooks/useActionItems.tsx`) handles create, update, delete, bulk update status, and bulk delete — **none of these operations call `useCRUDAudit`**. This is the central hook used by the Action Items page (`ActionItemModal.tsx` calls `createActionItem`/`updateActionItem`). So any action item created/edited/deleted from the **Action Items page** is invisible in the audit log.

- `createMutation` (line 124) — no `logCreate`
- `updateMutation` (line 193) — no `logUpdate` with old/new values
- `deleteMutation` (line 250) — no `logDelete`
- `bulkUpdateStatusMutation` (line 295) — no `logBulkUpdate`
- `bulkDeleteMutation` (line 345) — no `logBulkDelete`

**2. `useSecureDeals.tsx` — `updateDeal()` missing audit log**
The `updateDeal` function (line 51) fetches `existingDeal` for audit but **never calls `logUpdate`**. The deal update succeeds but no audit record is created. Only `deleteDeal` logs properly.

**3. `useSecureContacts.tsx` — `createContact()` and `updateContact()` missing audit**
- `createContact` (line 61) — no `logCreate` call
- `updateContact` (line 94) — no `logUpdate` call with old/new data

**4. `DealExpandedPanel.tsx` — `handleCreateContact()` (line 441) creates a contact inline but never logs it**
When a user creates a new contact from the deal panel stakeholder picker, no audit is recorded.

**5. `DealExpandedPanel.tsx` — Action item creation logs with empty ID**
Line 814: `await logCreate('action_items', '', {...})` — the record ID is always an empty string because the insert doesn't return the ID to the caller.

---

### Medium Issues (Partial/Inconsistent Logging)

**6. Dual code paths for deals — inconsistent logging**
Deal updates happen in two places:
- `DealsPage.tsx` → `handleDealUpdate()` (line 72) — **has** `logUpdate` ✓
- `useSecureDeals.tsx` → `updateDeal()` — **missing** `logUpdate` ✗

If `useSecureDeals` is ever used, updates won't be logged.

**7. `ContactModal.tsx` logs create/update, but `ContactTable.tsx` `handleConvertToLead` only logs the lead creation, not the contact status change**
When converting a contact to a lead, the contact itself isn't updated, but the lead creation is logged. Minor gap.

**8. Bulk operations on Leads page — missing**
`LeadTable.tsx` has no bulk delete handler with audit logging. Individual deletes are logged (line 260), but there's no bulk delete path shown.

**9. `useSecureDeals` and `useSecureContacts` hooks exist but aren't imported anywhere**
These hooks contain security-enhanced CRUD operations but are dead code — actual operations happen in page-level components directly. This means the security logging in these hooks is never executed.

---

### Improvements to Implement

**Priority 1 — Fix critical missing audit calls:**

| File | Operation | Fix |
|------|-----------|-----|
| `useActionItems.tsx` | create/update/delete/bulk | Add `useCRUDAudit` calls in `onSuccess` of each mutation, passing old data from `onMutate` context |
| `useSecureDeals.tsx` | `updateDeal` | Add `logUpdate('deals', id, updates, existingDeal)` after successful update |
| `useSecureContacts.tsx` | `createContact`, `updateContact` | Add `logCreate`/`logUpdate` after successful operations |
| `DealExpandedPanel.tsx` | `handleCreateContact` | Add `logCreate('contacts', data.id, ...)` after insert |
| `DealExpandedPanel.tsx` | action item create | Capture returned ID from insert and pass to `logCreate` |

**Priority 2 — Consistency improvements:**

| Issue | Fix |
|-------|-----|
| Dead hooks (`useSecureDeals`, `useSecureContacts`) | Either wire them into the UI or remove them to avoid confusion |
| `logUpdate` old data inconsistency | Some callers pass full old record, others pass only changed fields — standardize to always pass the full old record |
| Missing `record_name` in some logs | Ensure all log calls include the human-readable name (deal_name, contact_name, etc.) in details for better readability in Audit Logs UI |

**Priority 3 — Enhanced audit detail:**

| Enhancement | Description |
|-------------|-------------|
| Stage changes | Deal stage moves via `DealForm.tsx` call `onSave` which goes to `DealsPage.handleDealUpdate` — this works but doesn't distinguish "stage change" from regular field edits. Add a `change_type: 'stage_change'` flag. |
| Import operations | CSV imports via `useImportExport`/`useDealsImportExport` should log `BULK_CREATE` with record count — verify these hooks call audit |

### Files to Modify
1. `src/hooks/useActionItems.tsx` — Add audit logging to all 5 mutations
2. `src/hooks/useSecureDeals.tsx` — Add `logUpdate` call in `updateDeal`
3. `src/hooks/useSecureContacts.tsx` — Add `logCreate`/`logUpdate` calls
4. `src/components/DealExpandedPanel.tsx` — Fix empty ID in action item create log, add log for inline contact creation

