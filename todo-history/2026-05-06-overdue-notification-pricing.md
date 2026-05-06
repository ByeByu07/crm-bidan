# Overdue Notification + Pricing Strategy

## Context
Overdue notifications are currently filtered out from the main scheduled list. 
Bidan needs to see patients who missed their scheduled follow-up to ensure no one falls through the cracks.

## Todo
- [ ] Re-enable overdue badge in NotificationCard (uncomment `isOverdue` logic)
- [ ] Add "Terlambat" visual indicator with distinct color/styling (e.g., orange badge)
- [ ] Create pricing tier to limit notification count (e.g., Free: 20/day, Pro: unlimited)
- [ ] Add overdue section/tab in notifications page (e.g., "Hari Ini" vs "Terlambat")
- [ ] Update `/api/dashboard/notifications` to include overdue in response (already computed as `overdueCount`)
- [ ] Add pricing page in settings for clinic admin to upgrade plan
- [ ] Implement usage tracking and soft limit enforcement

## Notes
- Current API already calculates `overdueCount` but doesn't return overdue items in a separate list
- Badge code is commented out in `NotificationCard.tsx` with `// TODO: Re-enable when overdue feature implemented`
