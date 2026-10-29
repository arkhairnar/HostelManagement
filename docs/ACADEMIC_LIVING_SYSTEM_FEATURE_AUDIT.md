# Academic Living System — Feature Inventory & Local Prototype Audit

**Purpose:** Review the existing application before designing the final database schema. This document separates what is present in the current source code from what is only planned or still needs verification.

**Project context:** KKWIEER Academic Living System / Hostel Management Portal.

## 1. Current implementation snapshot

- Frontend: React + TypeScript + Vite.
- UI: responsive dashboard layout, sidebar, top app bar, mobile navigation, icons and styled cards/forms.
- Supabase JS client and Supabase-related schema/function files are present.
- The current context loads/saves one shared `hostel_app_state` JSON document rather than normalized feature tables.
- The app intentionally starts with empty student, room, complaint, petition, leave, notification, and attendance arrays; it does not seed demo records.
- The login screen currently uses Supabase Auth. Student login also expects a matching student record. Rector login invokes the `validate-rector-code` Edge Function.
- Student profile photo is currently a local preview only; the UI explicitly says Storage upload will be connected later.
- Attendance UI simulates a verification delay and success state. Actual face liveness, geolocation, or biometric verification is not implemented by that screen.

## 2. Rector dashboard — features present in the UI/source

### 2.1 Overview dashboard
- Hostel overview / room overview.
- Room cards and room-level drill-down when room data is available.
- Search rooms.
- Filter rooms to show only rooms with issues.
- Filter/group issues by category: electricity, water/plumbing, furniture/fixtures, cleanliness, and other maintenance.
- Room issue counts and category summaries.
- Overview of active requests/petitions, new room problems/queries, and mess/kitchen issues.
- Navigation to detailed room information.

### 2.2 Room detail and maintenance
- View residents assigned to a room.
- Room information, resident information, attendance overview, and daily verified count areas.
- View active problems associated with a room.
- Assign maintenance staff to a reported problem.
- Add a resolution note and mark a problem resolved.
- View parent/contact information where present in the student record.

### 2.3 Student directory
- List of Students page.
- Add-student form with roll number, full name, registered email, phone number, gender, and academic year.
- Required-field checks, email format validation, duplicate roll-number/email checks.
- Empty state when there are no students.
- Intended student directory search/filtering and record management interface.
- Current Add Student implementation adds to React state, then relies on the shared-state persistence effect; it does **not** create a Supabase Auth user, send an invitation/temporary credential, or upload a student account through a server function.

### 2.4 Mess operations
- View mess complaints submitted by students.
- Track complaint status (New, In Progress, Resolved).
- Add/update a rector or kitchen note.
- Review the student's complaint and any attached photo URL when present.

### 2.5 Student petitions / active requests
- View requests/petitions raised by students.
- See petition category, description, support count, and status.
- Petition support threshold is set to 5 students.
- Rector decision actions include accepted, delayed, or denied.
- Add management/rector notes and record the response status.

### 2.6 Leave applications
- View leave applications and filter by All, Pending, Approved, and Rejected.
- View student, room, requested dates, reason, and parent phone.
- Record parent-contact/verification notes and mark parent contact as verified.
- Approve or reject leave applications and add rector remarks.
- View applied/reviewed timestamps and status.

### 2.7 Notifications
- Rector notification list/screen.
- Unread count badge in navigation.
- Mark one notification read or mark all as read (implemented in shared context).

## 3. Student dashboard — features present in the UI/source

### 3.1 Student home dashboard
- Student dashboard overview.
- Attendance status and overall attendance rate cards.
- Shortcuts/summary areas for mess, petitions/requests, room problems, and leave.
- Student-specific navigation and profile entry.

### 3.2 Mess complaints
- Submit a mess/food/kitchen complaint with title/details.
- Optional photo URL/attachment UI; current UI mentions JPG/PNG up to 5 MB.
- Success confirmation after submission.
- View complaint status and rector/mess supervisor response notes.

### 3.3 Hostel petitions / collective requests
- Browse existing petitions and their categories.
- Create a new request with title, description, and category.
- Categories include infrastructure, mess, cleanliness, library, security, and general hostel.
- Support a petition; support threshold is 5 students.
- View rector status/notes and request details.
- Petition details modal is present.

### 3.4 Room problems / maintenance reports
- Report room-related problems with category, title, and description.
- Categories include fan, light, cleanliness, water, furniture, electrical, plumbing, and other.
- View reported problem status and rector remarks.
- Current status model includes Pending, Assigned, and Resolved.

### 3.5 Attendance
- Attendance page with live-check-in visual area.
- Capture/verify button and animated verification/success states.
- Attendance rate, monthly overview, attendance history, and present/absent/leave status types.
- UI refers to selfie, face liveness, and hostel geotag, but source currently simulates verification with a timeout. It does not actually capture a camera frame, perform face matching/liveness, or validate geolocation.
- At least one statistic (for example, days present) is hard-coded in the UI and should be replaced with calculated database-backed values before production.

### 3.6 Leave applications
- Submit leave dates (from/to), reason, and parent phone.
- View own leave application statuses and rector remarks.
- Application model supports parent verification and review status.

### 3.7 My Profile
- View profile fields: name, roll number, email, phone, gender, academic year, course, room, bed, parent/guardian name, and parent phone.
- Choose a profile image and preview it locally.
- Enforces image size below 50 KB in the UI.
- Image is **not uploaded to Supabase Storage yet**, and the selected image is not persisted as a durable profile update.

### 3.8 Notifications
- Student notification list/screen.
- Student-targeted notification filtering in shared context.
- Unread count and mark-read/mark-all-read actions.

## 4. Shared shell and navigation

- Login/role selection screen for Student or Rector.
- Responsive top app bar, desktop sidebar, and mobile slide-out navigation/bottom navigation components.
- Tabs include Dashboard, Room Overview, Mess, Requests, Student List (rector), Leave Applications (rector), Attendance (student), Problems (student), Profile (student), and Notifications.
- App-level browser history handling exists for tab changes, but should be manually tested across desktop/mobile navigation and back/forward actions.
- A Visitor dashboard/component exists in source, although the current login UI presents Student and Rector options only. Decide whether Visitor is obsolete or should remain a future role.

## 5. Data types currently represented in the code

- Student profile: identity/contact, course/year, room/bed, parent contact, avatar, attendance rate, today's attendance.
- Room: room number, floor, block, capacity, resident IDs.
- Mess complaint: student, room, title/description, optional photo URL, status, timestamps, management notes.
- Petition: title/description/category, creator, supporter IDs/count, threshold, status, management notes, response time.
- Room problem: room/student, category, title/description, status, assigned staff, creation/resolution times, rector remarks.
- Leave application: student/room, dates, reason, parent phone/verification, status, review timestamps, management remarks.
- Attendance record: student, date, Present/Absent/Leave, time, optional photo preview.
- Notification: recipient type, optional student target, title/message/time/read state/type.

## 6. Current limitations and risks found by source inspection

### Critical before real student data
1. **Shared JSON state:** Most features are grouped into one `hostel_app_state` JSON record. This is not a suitable final structure for per-student and per-rector access control.
2. **Security policies:** Existing `supabase/schema.sql` describes broad demo-style access. Do not use it with real student personal data until policies are replaced and tested.
3. **No proper ownership boundary yet:** The in-memory model does not consistently record `created_by`/rector ownership for each student. Your intended rule (each rector manages only students they added) needs explicit ownership columns and RLS policies.
4. **Student account provisioning missing:** Add Student currently creates an application-level record; it does not create an Auth account or send the requested email with a Student ID and temporary login/activation details.
5. **Rector registration missing:** A full registration flow with a shared confidential rector code is not yet implemented end-to-end. The login page only invokes the existing validation Edge Function after Supabase password sign-in.
6. **Email delivery not configured by this frontend:** Invitation/temporary-password delivery needs a secure server-side function and configured email delivery provider.
7. **Profile image is local-only:** Storage upload and access policies are not wired up.
8. **Attendance verification is a simulation:** Camera capture, liveness, geofence validation, duplicate attendance prevention, and reliable attendance calculation need implementation or should be explicitly labelled as prototype simulation.
9. **Database readiness:** Current source expects the `hostel_app_state` table. If the table/policies are not configured in Supabase, data loading/saving can fail; this needs local test with browser console and Network panel.
10. **Hard-coded/sample UI values:** Inspect and replace static stats/labels with computed values. Empty data should show empty states, not misleading totals.
11. **Persistence error handling:** Most writes happen through a delayed shared-state upsert and errors are logged to console. The UI should surface failures and avoid showing a success state as if the database save is guaranteed.
12. **Temporary local preview:** The update in this ZIP adds development-only preview buttons to open both dashboards without sign-in. This is for local feature inspection only and must not be used as a security mechanism or deployed as an authentication replacement.

## 7. Feature status checklist

| Feature | UI/source exists | Connected to real normalized DB | Needs testing / work |
|---|---|---|---|
| Student/Rector role selection | Yes | N/A | Yes |
| Supabase password sign-in | Yes | Auth client present | Yes; requires actual Auth users/config |
| Rector code validation | Invocation exists | Edge Function file exists | Deploy/configure/test function and secret |
| Rector registration | No complete flow | No | Build after feature freeze |
| Add student form | Yes | Not normalized; shared state only | Ownership, Auth account creation, email |
| Student account activation/email | No complete flow | No | Build server-side flow and SMTP/provider |
| Room overview/detail | Yes | Shared state | Empty-state, data and interaction testing |
| Room allocation management | Partial/data structures only | No dedicated table | Define add/edit/allocation UX and rules |
| Mess complaints | Yes | Shared state | Validate submit/status/note/persistence |
| Petitions/support/voting | Yes | Shared state | Validate duplicate support, thresholds, ownership |
| Room problems/maintenance | Yes | Shared state | Validate assign/resolve/status persistence |
| Leave request/review | Yes | Shared state | Validate parent verification and decisions |
| Attendance | UI simulation | Shared state | Replace simulated verification; calculate stats |
| Profile image | Local preview | No Storage upload | Upload, persist path, enforce <50 KB |
| Notifications | Yes | Shared state | Verify recipient targeting and persistence |
| Role/record isolation | Not enforced adequately in current model | No safe per-record RLS yet | Critical before real data |
| Browser Back/Forward | History handling exists | N/A | Manual test all tabs and mobile menu |

## 8. Recommended testing plan before database redesign

Run the app locally and inspect each screen without signing in using the development-only preview buttons.

1. Rector preview: Dashboard, Room Overview, Mess Operations, Active Requests, Leave Applications, List of Students, Notifications, and room detail if room records exist.
2. Student preview: Dashboard, Mess complaint form, Requests/petitions, Room Problems, Attendance simulation, Leave application, My Profile/photo preview, Notifications.
3. Test desktop and narrow/mobile viewport layouts.
4. Test every button, form validation, filters, modal open/close, navigation, browser Back/Forward, and logout.
5. Open browser DevTools Console and Network; record runtime errors and failed Supabase calls.
6. Because the app starts with empty records, verify empty states. Do not create fake students just to make cards populated unless a separate, explicitly temporary fixture mode is approved.
7. For each action, classify it as: (a) UI-only, (b) updates React state, (c) persisted to current shared JSON table, or (d) fully backed by a secure feature-specific database/API. Most current actions are in category (b)/(c), not (d).

## 9. Proposed features to consider after the audit (not yet implemented)

### Rector / administration
- Rector registration with the single college-wide confidential code; code validated server-side on every rector login as requested.
- Unique rector username and secure password; recommend not using a mobile number as the password.
- Rector ownership scope so a rector can manage only the students they created.
- Secure Add Student workflow with generated Student ID, temporary credential or activation flow, and email delivery.
- Edit/deactivate student accounts; reset/reissue credentials; audit log for account and record changes.
- Room/block/floor/bed CRUD, capacity checks, allocation/deallocation, occupancy reports, and waitlist.
- Search, sort, filters, pagination, export, and printable student directory.
- Mess menu/calendar and announcements (if needed; current UI is complaint-oriented rather than a full menu planner).
- Maintenance assignment queue, staff directory, due dates, priority, SLA, and resolution history.
- Leave approval audit trail, gate-pass print/export, overlapping-date checks, emergency contact and parent-verification workflow.
- Attendance reports by student/date/month, late/absence flags, correction requests, and CSV export.
- Notification preferences, email delivery, read receipts, and announcement broadcast.
- Dashboard metrics computed from real records and date filters.

### Student
- Secure account activation, first-login password change, forgot-password flow, and profile completion.
- View assigned room/bed and hostel rules/contact directory.
- Complaint/request history with attachments and status timeline.
- Petition support with one-support-per-student enforcement and clear threshold progress.
- Leave status, downloadable/printable approved pass, and cancellation/withdrawal if policy allows.
- Attendance history, monthly breakdown, correction request, and clear explanation of any verification used.
- Notifications, read/unread state, and profile photo upload.

### Platform-wide
- Normalized relational schema and foreign keys.
- Per-role/per-record Row Level Security and server-side authorization.
- Secure Edge Functions for rector registration/code verification, account provisioning, and email delivery.
- Private Storage policies, image validation, file-size/type checks.
- Loading/error/success states, retry behavior, validation, and audit logging.
- Accessibility, responsive checks, consistent empty states, and automated tests.

## 10. Database design should follow feature decisions

Do not create the final feature tables until the feature list and access rules are approved. Then design the schema from the chosen workflows (likely profiles, rector accounts/ownership, students, hostel/rooms/beds/allocations, mess complaints, petitions/supports, room problems/maintenance assignments, leave applications/reviews, attendance records, notifications, and audit logs). Every table should have a clear owner, relationship, allowed actions, retention needs, and RLS policy.

## Change log — Rector Dashboard vs Room Overview (2026-10-25)

The rector landing Dashboard and Room Overview were visually/functionally overlapping. The local preview update separates their purpose:

### Dashboard
- Summary cards for registered students, rooms, available beds, pending leave applications, unresolved room issues, and unresolved mess issues.
- Quick navigation from each card to the relevant management section.
- “Add New Student” shortcut.
- Compact status preview of up to five rooms, showing occupied/capacity beds, open issues, and a status indicator.
- Recent activity summary derived from records already present in local application state (students, room problems, leave applications, mess complaints, and petitions).
- Empty states when no real records exist; no demo records are added.

### Room Overview
- Remains the detailed room-monitoring area, including room search, issue filters, category-focused inspection, room cards, and the existing room-detail drill-down.
- Heading and subtitle now describe detailed room management instead of calling this page the main dashboard.

### Validation note
- The frontend TypeScript check could not be run with the bundled `node_modules` in this environment because its executables point to Windows (`node.exe`). The project should be installed and tested locally on Windows with `npm install`, `npm run lint`, and `npm run build`.
- The standard lint command currently also reports TypeScript errors in the Deno/Supabase Edge Function source because the main frontend TypeScript configuration includes `supabase/functions`. Those existing environment/type-scope errors are separate from the dashboard UI change and should be handled by a dedicated Edge Function/Deno configuration.


## Authentication and database foundation update (2026-10-25)

The current implementation package adds a normalized Supabase schema and server-side authentication workflows. Rector registration uses a username, a strong password, and the single confidential college rector code. Rector login requires all three; the Edge Function checks that the signed-in account has the trusted `app_metadata.role = rector` claim before accepting the code. Student creation is routed through the `create-student` Edge Function, which creates the Auth account/profile/student row and emails a generated temporary password through Resend. Student roster and room data load from normalized tables.

The normalized schema includes `profiles`, `students`, `rooms`, `room_allocations`, `mess_complaints`, `petitions`, `petition_support`, `room_problems`, `leave_applications`, `attendance_records`, and `notifications`, with RLS policies and a private `hostel-profiles` bucket capped at 50 KB per file. No sample records are included.

**Integration boundary:** Mess complaints, petitions, leave, attendance, and notifications have database tables and baseline RLS policies, but their existing UI actions still need to be migrated from in-memory state to the corresponding tables. Do not treat those operations as cloud-persistent yet. See `supabase/SETUP_AUTH_AND_DATABASE.md` for deployment and configuration instructions.
