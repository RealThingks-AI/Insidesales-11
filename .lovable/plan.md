

## Campaign Workflow — Comprehensive Improvement Plan

This is a large-scale feature set spanning the entire campaign module. I recommend implementing it in **3 phases** to keep things manageable and testable.

---

### Phase 1: Improve Existing MART Sections (Audience, Timing, Region)

**1. Audience Section Redesign (`CampaignMARTAudience.tsx`)**
Current state: basic tag inputs and checkboxes in a flat 2-column grid. No visual hierarchy.

Changes:
- Redesign as a structured form with clear sections: "Who" (job titles, seniority, departments) and "Where" (industries, company sizes)
- Add a live audience summary card showing selected criteria count
- Add "Persona" concept: save named audience profiles (e.g. "Enterprise Decision Makers") that combine multiple criteria
- Better empty state with guided prompts
- Add validation feedback when criteria are incomplete

**2. Timing Section Enhancement (`CampaignMARTTiming.tsx`)**
Current state: shows start/end dates and a progress bar with a free-text note.

Changes:
- Add **Timing Windows**: define specific date ranges within the campaign where outreach is active (e.g., "Pre-Diwali Push: Oct 15 - Nov 10", "Black Friday Week: Nov 25 - Dec 1")
- Each window has: name, start date, end date, priority level, and notes
- Visual timeline showing windows on a horizontal bar
- Auto-flag when current date falls within a timing window
- Display campaign start/end dates inline (editable)
- New DB: Add `campaign_timing_windows` table (campaign_id, window_name, start_date, end_date, priority, notes)

**3. Region — Already functional**, minor UI polish only (display region names instead of raw JSON in Overview)

---

### Phase 2: Outreach Section Overhaul

**Current state**: Simple log-based system — manually log Email/Call/LinkedIn with text fields. No actual email sending, no threading, no delivery tracking.

**4. Email Sending from Outreach**
- Add "Send Email" button per campaign contact (uses campaign email templates)
- Template picker with variable substitution ({contact_name}, {company_name}, etc.)
- Send via Azure Email edge function (already configured with `AZURE_SENDER_EMAIL`)
- Track delivery status: Sent → Delivered → Bounced
- Store sent emails in `campaign_communications` with `email_status`

**5. Email Threading**
- Add `thread_id` and `parent_id` columns to `campaign_communications`
- When a reply is received (webhook or manual log), link it to the original email thread
- Display threaded view in the Outreach section — expandable conversation threads grouped by contact
- Reply button to continue the thread

**6. LinkedIn & Call Enhancements**
- LinkedIn: Connection Request → Accepted → Message Sent → Replied flow tracking
- Call: Log call with duration, outcome, next steps; link to phone script used
- Both: Add "Create Task" button per outreach entry to create a follow-up action item linked to the campaign contact

**7. Campaign Tasks from Outreach**
- "Create Task" button on each contact row in Outreach
- Pre-fills: contact name, campaign context, suggested follow-up
- Links to `action_items` with `module_type: 'campaigns'`

---

### Phase 3: Analytics Enhancement

**8. Enhanced Analytics (`CampaignAnalytics.tsx`)**
- Add email delivery metrics: sent vs delivered vs bounced vs replied
- Response rate by channel (Email/Call/LinkedIn)
- Contact engagement score (composite of all touchpoints)
- Best time-of-day/day-of-week analysis for responses
- ROI calculation: deal value generated vs effort invested
- Export analytics as CSV

---

### Database Changes Required

```sql
-- Timing windows for seasonal/event-based campaigns
CREATE TABLE campaign_timing_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  window_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  priority TEXT DEFAULT 'Normal',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Email threading support
ALTER TABLE campaign_communications
  ADD COLUMN thread_id UUID,
  ADD COLUMN parent_id UUID REFERENCES campaign_communications(id),
  ADD COLUMN message_id TEXT,
  ADD COLUMN delivery_status TEXT DEFAULT 'pending',
  ADD COLUMN sent_via TEXT DEFAULT 'manual',
  ADD COLUMN template_id UUID REFERENCES campaign_email_templates(id);
```

### Files to Create/Modify

**Phase 1:**
- `src/components/campaigns/CampaignMARTAudience.tsx` — Full redesign
- `src/components/campaigns/CampaignMARTTiming.tsx` — Add timing windows UI
- Migration: `campaign_timing_windows` table
- `src/hooks/useCampaigns.tsx` — Add timing windows query

**Phase 2:**
- `src/components/campaigns/CampaignCommunications.tsx` — Major overhaul: email sending, threading, task creation
- `src/components/campaigns/EmailComposeModal.tsx` — New: compose email with template
- `src/components/campaigns/EmailThreadView.tsx` — New: threaded conversation display
- Migration: Add columns to `campaign_communications`
- Edge function: `send-campaign-email/index.ts` — Send emails via Azure

**Phase 3:**
- `src/components/campaigns/CampaignAnalytics.tsx` — Enhanced metrics and charts
- `src/components/campaigns/CampaignOverview.tsx` — Update overview stats

---

### Recommendation

Given the scope, I suggest starting with **Phase 1** (Audience UI redesign + Timing windows + Region polish) as it's self-contained and immediately improves the MART strategy workflow. Shall I proceed with Phase 1, or would you prefer a different starting point?

