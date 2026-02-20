
## Deal Related Section - 3 Improvements

### Current State
- 4 large dropdowns in a 2x2 grid, each taking full height with no selected state visibility
- Order: Budget Owner | Champion | Objector | Influencer
- When a contact is selected, the name shows inside the dropdown button but is truncated and hard to read
- The dropdowns are tall with lots of padding, making the section bulky

### Changes Required

**1. More Compact Layout**
- Reduce the section to a tighter inline layout
- Use a horizontal row-based design: label on the left, value/selector on the right
- Each row is only as tall as needed (~28px)
- Replace full-width dropdowns with compact inline selectors
- Render the section as 4 rows in a dense list, not a 2x2 grid of dropdowns

**2. Swap Objector ↔ Influencer**
- Current order: Budget Owner, Champion, Objector, Influencer
- New order: Budget Owner, Champion, Influencer, Objector
- Simple array reorder in the `stakeholders` array (lines 211-216)

**3. Selected Contact Shown as Visible Name Badge**
The DB stores a single UUID per role — so each role can have one contact. The problem is that once selected, the name is hidden inside a truncated dropdown button. The fix:
- When a contact IS selected: show their name as a small badge/chip with an `×` button to remove, next to the role label
- When no contact selected: show a compact `+ Add` button that opens the contact picker popover
- This makes selections immediately visible and easy to manage

### Visual Design (After)

```text
Deal Related
Budget Owner  [John Smith ×]
Champion      [+ Add]
Influencer    [Sarah Lee ×]
Objector      [+ Add]
```

Each row:
- Left: role label (text-[10px] muted)
- Right: Either a name chip with ×, or a small "+ Add" button that triggers the contact picker popover

### Technical Changes

**File: `src/components/DealExpandedPanel.tsx`**

**StakeholdersSection component (lines 178-248):**

1. Reorder the `stakeholders` array: Budget Owner → Champion → Influencer → Objector

2. Replace the 2x2 grid layout with a compact vertical list:

```tsx
<div className="px-2 pt-1.5 pb-1">
  <div className="flex items-center gap-1.5 mb-1.5">
    <Users className="h-3.5 w-3.5 text-muted-foreground" />
    <span className="text-[11px] font-bold text-muted-foreground">Deal Related</span>
  </div>
  <div className="space-y-1">
    {stakeholders.map(({ label, field, value, setValue }) => (
      <div key={field} className="flex items-center gap-2 min-h-[24px]">
        <span className="text-[10px] text-muted-foreground w-[90px] shrink-0">{label}</span>
        {value ? (
          <div className="flex items-center gap-1 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium max-w-[160px]">
              <span className="truncate">{contactNames[value] || "..."}</span>
              <X className="h-2.5 w-2.5 cursor-pointer opacity-60 hover:opacity-100 shrink-0" onClick={() => { setValue(""); handleStakeholderChange(field, null, ""); }} />
            </span>
          </div>
        ) : (
          <ContactSearchableDropdown
            value=""
            selectedContactId={undefined}
            onValueChange={() => {}}
            onContactSelect={(contact) => { setValue(contact.id); handleStakeholderChange(field, contact.id, contact.contact_name); }}
            placeholder={`+ Add ${label}`}
            className="h-6 text-[10px] border-dashed px-2 text-muted-foreground w-auto min-w-[100px]"
          />
        )}
      </div>
    ))}
  </div>
</div>
```

This design:
- Compact rows replace the 2x2 grid
- Selected contacts show as removable chips (name is fully visible, not truncated in a full-width button)
- Empty slots show a small "+ Add Role" dashed button that opens the picker
- The picker only appears when needed, keeping the UI clean

### Files to Modify
- `src/components/DealExpandedPanel.tsx` — Update `StakeholdersSection` component (lines 178-248)
