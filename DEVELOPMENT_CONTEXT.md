# Unified Parent URL: Development Context

> Source-grounded snapshot of the repository as inspected on 31 August 2026. This document describes the implementation that exists in this repository; it does not prescribe a redesign. Where the source does not establish a fact, the text says **Not established from this repository.**

## 1. Project Overview

`unified-parent-url` is a single-page parent and center-administrator frontend for Gem Kids Academy. It brings several parent tools behind one parent email/OTP login and several administrative tools behind one center-admin login.

The parent experience currently provides:

- a parent dashboard;
- a Gem AI chatbot;
- a gamified quiz;
- a link to an external exam application;
- Homework Support attendance and time-slot booking; and
- Parent Teacher Interview (PTI) booking.

The administrator experience currently provides:

- browser-local Gem AI notification management;
- PTI event, availability, allocation, booking, invitation, reminder, and history views; and
- a Homework Portal containing configuration, automation, weekly attendance, and test-email modules.

### Architecture

- **Frontend:** React 19 functional components, React hooks, JavaScript/JSX, and Vite 8.
- **Navigation:** custom conditional rendering based on `window.location.pathname`, URL query parameters, and local component state. `react-router` is not installed.
- **State:** local React state with `useState`, `useEffect`, and occasional `useRef`. There is no global state library.
- **Authentication state:** browser `localStorage` plus props. There is no `AuthContext`, `useAuth`, authentication provider, or `src/auth/` directory.
- **HTTP:** browser `fetch`; Axios is not installed.
- **Styling:** global CSS files imported by components/pages. CSS Modules, CSS-in-JS, Tailwind, and a component library are not used.
- **Backend:** no backend source is contained in this repository. The frontend calls configured or hard-coded HTTP servers. Service error text calls the configured server a FastAPI server, and clients read `detail` error fields commonly returned by FastAPI, but backend framework implementation is **Not established from this repository.**
- **Database:** no schema, migration, ORM model, or database client exists here. Database technology and server-side relationships are **Not established from this repository.**

The main composition boundary is `src/App.jsx`. Parent tools are composed by `src/components/ParentDashboard.jsx`; admin tools are composed by `src/components/AdminInterviewBooking.jsx`.

## 2. Project Structure

| Path | Current responsibility |
| --- | --- |
| `index.html` | Vite HTML shell containing the root DOM mount point. |
| `src/main.jsx` | Creates the React root and renders `App` inside `StrictMode`. No provider wraps the app. |
| `src/App.jsx` | Manual route selection, parent/admin login gates, parent notification queue, and top-level rendering. |
| `src/index.css` | Small global reset/base stylesheet loaded by `main.jsx`. |
| `src/App.css` | Vite-derived app styles; it is not imported by the current `App.jsx`. |
| `src/components/` | Parent/admin screens and larger feature components. Most components import a same-named CSS file. |
| `src/components/ParentTeacherInterviews.jsx` | Active parent-facing, API-backed PTI booking component imported by `ParentDashboard`. |
| `src/components/ParentTeacherInterviews/` | Admin PTI submodules: teacher allocation, reminders, and event history. It also contains an older demo-only `ParentTeacherInterviews.jsx` that is not imported by the active dashboard. |
| `src/pages/` | Homework admin modules plus an apparently unused `WelcomePage.jsx`. These are components despite the `pages` name; no router maps URLs directly to them. |
| `src/services/` | Service wrappers for Homework Configuration, default slot timings, and automation. Other features call `fetch` directly from components. |
| `src/config/api.js` | Shared `VITE_API_BASE_URL` resolution for PTI, parent Homework Support, and admin login calls. |
| `src/config/demoParentNotifications.js` | Initial browser-local notification seed records. |
| `src/utils/notificationStorage.js` | Reads/writes the `gem_ai_notifications` localStorage key and seeds it when absent. |
| `src/utils/getActiveNotifications.js` | Pure active-flag and inclusive local-date filtering. |
| `src/HomeworkSupportAttendance.jsx` | Standalone attendance choice component. No current import was found; equivalent markup is implemented directly in `HomeworkBooking.jsx`. |
| `public/images/` | Notification images served by Vite at root-relative `/images/...` URLs. |
| `frontend/NOTIFICATION_IMPLEMENTATION_CONTEXT.md` | Existing focused notes for the frontend-only notification demo. It predates the Homework Portal tab documented here. |
| `vite.config.js` | Minimal Vite config with `@vitejs/plugin-react`; no proxy, aliases, or custom build settings. |
| `vercel.json` | Rewrites every deployment path to `/index.html` for SPA fallback. |
| `eslint.config.js` | Flat ESLint configuration used by `npm run lint`. |
| `package.json` | Dependencies and `dev`, `build`, `lint`, and `preview` scripts. |

`src/auth/` does not exist. There are no backend, API-server, database, migration, test, or route-definition directories.

## 3. Application Entry Point and Routing

```text
index.html
  -> src/main.jsx
      -> <StrictMode><App /></StrictMode>
          -> pathname/query checks
          -> admin login gate or parent/query view
          -> dashboard-level state selects major modules
```

### Route precedence and behavior

`App` evaluates routes in this order:

| Browser location | Gate | Rendered view |
| --- | --- | --- |
| `/admin` | `interviewAdminData` must exist in state/localStorage | `InterviewAdminLogin` or `AdminInterviewBooking` |
| `/admin/notifications` | same admin-data presence check | `InterviewAdminLogin` or `AdminNotificationManagement` |
| Any non-admin path with `?view=gamified-quiz` | `localStorage.parentData` must exist | `ChatbotGamifiedQuiz` |
| Any non-admin path with `?view=chatbot` | `localStorage.parentData` must exist | `DemoChatbot` |
| Any other path after a successful login with pending notifications | `parentData` React state exists | first `ParentNotificationModal` in the queue |
| Any other path after a successful login | `parentData` React state exists | `ParentDashboard` |
| Any other path without current parent state | none | `EmailLogin` |

There is no route table, router history subscription, 404 view, or redirect component. Unknown paths fall through to the parent login/dashboard flow. Query tools opened from `ParentDashboard` use `window.open()` and reconstruct the current origin/path with a `view` query value. Their Back callbacks call `window.close()`.

The parent session is not restored into `App` state from `localStorage` during a normal page reload. Stored parent data is read only by the chatbot/quiz query branches. Consequently, reloading the ordinary parent dashboard returns to `EmailLogin` even when `localStorage.parentData` exists.

Admin data is restored in the `interviewAdminData` state initializer, so `/admin` and `/admin/notifications` survive reloads while the localStorage item remains.

### Major module rendering

- `ParentDashboard` uses `showHomeworkBooking` and `showParentTeacherInterviews` booleans. A selected tool replaces the dashboard with `HomeworkBooking` or the active parent `ParentTeacherInterviews` component; `onBack` clears the corresponding boolean.
- `AdminInterviewBooking` uses one `activeTab` string for both top-level tabs and module views. Cards set this state to module-specific values, and Back buttons restore the parent overview value.
- `/admin/notifications` is a separate pathname rather than an `activeTab` module.

## 4. Authentication

### No context-based authentication

`AuthContext` and `useAuth` are not implemented. There is no auth provider in `main.jsx`, and no `src/auth/` directory. Future work must not assume those APIs exist.

### Parent email/OTP flow

`EmailLogin` maintains `email`, `otp`, `error`, `isLoading`, and `otpSent` locally.

1. The first form submission sends `POST /send-otp` with `{ "email": trimmedEmail }`.
2. A successful result reveals the OTP input.
3. The next submission sends `POST /verify-otp` with `{ "email": trimmedEmail, "otp": trimmedOtp }`.
4. On success, `EmailLogin` calls `onLoginSuccess({ ...data, email: trimmedEmail })`.
5. `App.handleLoginSuccess` stores that object as `localStorage.parentData`, sets `parentData`, and builds the active-notification queue.
6. `App.handleLogout` removes `parentData` and clears parent/notification state.

The verified shape consumed by the frontend is:

```js
{
  // all fields returned by /verify-otp are retained
  email: string, // explicitly added by EmailLogin
  student: {
    student_id: string | number,
    name: string,
    parent_email: string,
    class_name?: string,
    center_code?: string
  },
  admin?: {
    center_code?: string
  }
}
```

`student` and its listed fields are established by property reads throughout `ParentDashboard` and the PTI component. `parentData.admin.center_code` is a PTI fallback. Whether `/verify-otp` returns an access token, its name, expiry, or claims is **Not established from this repository.** Parent PTI and Homework calls do not send an Authorization header; they identify the parent through `center_code`, student data, or `parent_email` depending on the endpoint.

### Center-admin login flow

`InterviewAdminLogin` posts `{ username, password }` to `/interview-booking/admin/login`. It accepts either `data.interview_admin` or the whole response as the admin object, rejects any object whose `role` is not exactly `CENTER_ADMIN`, stores the accepted object as `localStorage.interviewAdminData`, and passes it to `App`.

Fields consumed from this object are:

```js
{
  role: "CENTER_ADMIN",
  center_code: string,
  full_name?: string,
  username?: string,
  access_token?: string
}
```

`role` and `center_code` are required by current behavior. `full_name` is displayed in the admin header, `username` is displayed by Test Email when present, and `access_token` conditionally creates a Bearer header in Homework services/Test Email. The complete server response, token format, claims, expiry, and refresh behavior are **Not established from this repository.**

The protected-route behavior is only a presence check for parsed localStorage data. `App` does not revalidate role/token on reload, expire a session, refresh tokens, or provide an admin logout action. PTI API calls do not attach the possible admin token. Homework Configuration, Automation, Default Slot Timing, and Test Email attach `Authorization: Bearer <access_token>` only when that field is present. Homework Weekly Dashboard does not attach it.

## 5. Multi-Tenant / Center Architecture

`center_code` is the frontend's repeated center identifier and the apparent tenant-scoping value. The repository demonstrates request scoping, but server-side authorization and isolation guarantees are **Not established from this repository.**

### Sources

- **Parent PTI:** `parentData.student.center_code`, falling back to `parentData.admin.center_code`, otherwise `""`.
- **Admin:** the accepted admin login object (`interviewAdminData.center_code`). `AdminInterviewBooking`, `TeacherAllocation`, and `EventHistory` reread this object from localStorage.
- **Homework admin pages:** `AdminInterviewBooking` passes the same object as `loggedInUser`; pages/services use `loggedInUser.center_code`.
- **PTI Reminders exception:** `InterviewReminders` hard-codes `const centerCode = "MP001"` and hard-codes `http://localhost:8000`, bypassing the authenticated center and shared API configuration.

### Propagation and requests

- Parent data flows `App -> ParentDashboard -> ParentTeacherInterviews` or `HomeworkBooking`.
- Admin data is not passed into `AdminInterviewBooking`; that component reads localStorage. It passes the resulting object to the four Homework modules as `loggedInUser`.
- PTI admin submodules generally reread localStorage rather than receiving a prop.
- Most PTI endpoints include `center_code` as a query parameter for reads/deletes and in JSON for creates/updates.
- Homework Configuration, default timings, and automation put an encoded center code in `/by-center/{centerCode}` paths. Configuration weeks use `/weeks/{centerCode}`.
- Homework Weekly Dashboard and Test Email use `center_code` query parameters; Test Email also includes it in its send body.
- Parent Homework endpoints send only `parent_email`, not `center_code`; any center derivation therefore occurs server-side if it occurs at all. **Not established from this repository.**
- Chatbot search sends student/class context but no `center_code`; quiz endpoints send parent email.
- Browser-local notifications are not center-scoped. All admins/parents using the same browser origin share one `gem_ai_notifications` array.

Every new center-owned frontend request should preserve the current center identifier at its established API boundary. This is necessary because current lists, writes, and dashboards otherwise have no frontend center discriminator. It does not replace backend authorization; backend enforcement is **Not established from this repository.**

## 6. Admin Dashboard Architecture

`AdminInterviewBooking` is both the PTI implementation and the unified admin shell. Its initial `activeTab` is `"parentTeacherInterview"`.

### Top-level tabs

The persistent header navigation contains exactly three top-level choices:

| `activeTab` | Label | Contents |
| --- | --- | --- |
| `unified` | Unified | One Gem AI Notifications card; navigates to `/admin/notifications`. |
| `parentTeacherInterview` | Parent Teacher Interview | Seven PTI module cards. |
| `homeworkPortal` | Homework Portal | Four Homework module cards. |

These values are top-level navigation. Module values below are not additional top-level tabs; they are detail screens reached from cards inside a top-level tab.

### PTI cards and module state

| Card | Detail `activeTab` | Rendered implementation |
| --- | --- | --- |
| Event Setup | `setup` | event setup JSX inside `AdminInterviewBooking` |
| Teacher Availability | `availability` | availability JSX inside `AdminInterviewBooking` |
| Teacher Allocation | `allocation` | `TeacherAllocation` |
| Interview Bookings | `bookings` | booking/filter JSX inside `AdminInterviewBooking` |
| Send Invitations | `invitations` | invitation/filter JSX inside `AdminInterviewBooking` |
| Reminders | `reminders` | `InterviewReminders` |
| Event History | `history` | `EventHistory` |

Each detail view has a Back button that sets `activeTab` to `parentTeacherInterview`. Event Setup additionally calls `window.history.pushState({}, "", "/admin-interview-booking")`; `App` does not recognize that pathname as an admin route after a reload. This is state navigation with an inconsistent history mutation, not a registered route.

### Homework Portal cards and module state

| Card | Detail `activeTab` | Component |
| --- | --- | --- |
| Homework Configuration | `homeworkConfiguration` | `HomeworkConfiguration` |
| Homework Automation | `homeworkAutomation` | `HomeworkAutomation` |
| Homework Weekly Dashboard | `homeworkWeeklyDashboard` | `HomeworkWeeklyDashboard` |
| Test Email | `homeworkTestEmail` | `TestEmail` |

Each component receives `loggedInUser={interviewAdmin}` and is preceded by a Back button that restores `homeworkPortal`. This card-inside-tab model is the current extension pattern: a related future Homework feature should normally be another card/module under `homeworkPortal`, not a fourth top-level tab.

## 7. Parent Teacher Interview Module

### Integration and components

- Parent entry: `ParentDashboard` card -> `showParentTeacherInterviews=true` -> `src/components/ParentTeacherInterviews.jsx`.
- Admin entry: top-level `parentTeacherInterview` tab -> module cards in `AdminInterviewBooking`.
- Admin extracted submodules: `TeacherAllocation`, `InterviewReminders`, and `EventHistory`.
- `src/components/ParentTeacherInterviews/ParentTeacherInterviews.jsx` is a separate hard-coded demo implementation and is not used by the active import.

### Parent booking state and flow

The active component derives student identity and center from `parentData`, then loads:

1. center events;
2. center bookings; and
3. slots for the first event on/after today, falling back to the first returned event.

Important state includes `events`, `slots`, `existingBookings`, `selectedSlot`, `booking`, `isChangingTime`, `showChangeConfirmation`, `loading`, and `error`. Available choices are slots with `is_available === true`. Existing center bookings with `booking_status === "BOOKED"` contribute booked slot IDs for the selected event.

Confirming posts `{ center_code, event_id, slot_id, teacher_id, student_id, parent_email }`, creates a local `booking` object from the response plus displayed slot data, and reloads center bookings. The success view displays student, first-slot teacher name, event date/location, and selected time.

The current “Change Interview Time” UI does not send an update request: `confirmChange` only closes the confirmation flag. No active parent component call to `PUT /bookings/{id}` or `DELETE /bookings/{id}` exists. An existing server booking loaded on mount populates `existingBookings` but is not converted into the local `booking` state, so the success/current-booking view is only established after booking in the current component session.

### Admin behavior

- **Event Setup:** list, select, create, edit, and delete events. Save payload contains center, name, date, and location.
- **Teacher Availability:** select an event and teachers, set available flag, start/end, slot duration, and gap. The UI generates slot previews client-side. Save sends one teacher record at a time.
- **Capacity preview:** computes generated slots per selected teacher, but `requiredSlots` is fixed at `0`, so insufficient-capacity blocking cannot currently activate from real demand.
- **Teacher Allocation:** loads classes, class years, teachers, and allocations; creates/updates/deletes teacher/class/year associations. It states that active students/parents in a class are linked automatically, but the implementation of that server relationship is **Not established from this repository.**
- **Bookings:** loads bookings and allocations, derives display rows, and filters by event, teacher, class, status, and time. The time predicate only accepts the `All` value. Synthetic unbooked allocation rows have no start/end and are then removed by `visibleBookingRows`, so the displayed table effectively excludes them.
- **Invitations:** requires an event, loads invitations, supports class/year/status filters and multi-selection, then posts selected student IDs for that event.
- **Reminders:** selects an event, counts confirmed bookings, previews reminder text, and toggles one-day/thirty-minute settings. It is currently fixed to center `MP001` and localhost.
- **History:** loads completed events, per-event bookings, and summary data using the stored admin center.

### Visible data relationships

Frontend payloads establish identifiers among center, event, teacher, slot, student, class, class year, booking, invitation, and allocation records. The schema, foreign keys, cascade rules, transaction behavior, uniqueness, race handling, and database engine are **Not established from this repository.**

## 8. Homework Support Module

### Parent-facing Homework Support

`ParentDashboard` renders `HomeworkBooking` when `showHomeworkBooking` is true. It passes `parentData`; this flow relies on the top-level `email` added during OTP verification rather than `student.parent_email`.

`HomeworkBooking` uses these flow states:

```text
initial -> attendance
attendance -> selecting_time_slot -> confirmation
attendance -> saved non-attendance message
initial -> existing_booking (when dashboard says ATTENDING with a selected slot)
```

On mount it posts `{ parent_email }` to the parent dashboard endpoint. For an existing attending response it fetches available slots again to find `selected_time_slot_id`. “Will attend” loads slots; confirmation posts `ATTENDING` plus the selected ID. “Will not attend” posts `NOT_ATTENDING` and `null`. The component displays server-provided `student_name`, `title`, `week_number`, and `session_date`, with hard-coded display fallbacks when absent.

No parent Authorization header or `center_code` is sent. Capacity and booking cutoff are not evaluated in the frontend; enforcement by the backend is **Not established from this repository.**

`src/HomeworkSupportAttendance.jsx` implements an extracted yes/no control but is not used; the active component duplicates that UI inline.

### Homework Configuration

`HomeworkConfiguration` loads configuration and default timings concurrently through services. Its state covers academic terms, selected term, available/selected weeks, sessions, slots, booking cutoff, expanded panels, defaults, and loading/error/saved states.

Verified configuration model consumed by the component/service:

```js
{
  center_code,
  academic_terms: [{ id, term_name, is_active, /* other server fields */ }],
  selected_term: { id, /* other server fields */ } | null,
  available_weeks: [{ week_number, week_label, session_day, session_date }],
  selected_sessions: [{ week_number, week_label, session_day, session_date }],
  time_slots: [{
    id,
    week_number,
    start_time,
    end_time,
    capacity,
    booking_count?,
    uses_default_timing?,
    default_slot_index?
  }],
  booking_cutoff: { day, time }
}
```

The admin can select an active term, fetch its weeks, add one/all weeks, remove sessions, add custom slots, apply configured default slots per week, edit times through `window.prompt`, set capacity, and set one cutoff day/time for all selected weeks. New selected weeks intentionally receive no automatic slots. A slot with `booking_count > 0` cannot be removed in the UI.

Save validation requires each slot to have week/start/end and numeric capacity of at least 1. The update payload contains `term_id`, `selected_weeks: [{week_number}]`, normalized time slots, and `booking_cutoff`.

### Default slot timings

Defaults are center-specific ordered `{ start_time, end_time, slot_order }` records. The page can add/remove/edit and save them, validates complete values and end-after-start, and can apply a default by index to a week. The service sorts by `slot_order` and supplies missing order values.

### Homework Automation

`HomeworkAutomation` loads and edits:

```js
{
  enabled: boolean,
  invitation_day: string,
  invitation_time: string,
  term: string,
  schedules: [{ week, session, invitation, status }]
}
```

Only `enabled`, `invitation_day`, and `invitation_time` are sent on update. `term` and `schedules` are server-produced display data. Unsaved changes are detected by JSON-string comparison against the last saved settings. The frontend does not run a scheduler; actual scheduling/delivery implementation is **Not established from this repository.**

### Homework Weekly Dashboard

The page first gets center weeks, selects `current_week_number`, then requests responses for the selected week. It displays:

- summary counts: total, attending, not attending, no response;
- per-slot `start_time`, `end_time`, `booked`, `capacity`, and `is_full`; and
- students with `student_id`, `student_name`, `response`, and `time_slot`.

The student filter supports `ALL`, `ATTENDING`, `NOT_ATTENDING`, and `NO_RESPONSE`. There are unused local mutation functions referencing an undefined `setStudents`; they are not connected to rendered controls. Requests include `center_code` but no Bearer header.

### Test Email

The page loads center classes, then students for a chosen class. It supports email-prefix search, individual/all selection, and sends selected IDs to `/homework/test-email/send` with `{ center_code, student_ids }`. It conditionally attaches the admin Bearer token. Class results may be strings or `{ class_name, student_count }` objects; student objects are consumed as `{ student_id, student_name, parent_email }`. The send response is consumed as `{ message?, results?: [] }`; exact result item fields are **Not established from this repository.**

### Homework Portal navigation

The four Homework cards are modules inside the `Homework Portal` top-level tab. They are not URL routes and are not top-level admin tabs. Each switches `activeTab`, receives the same `loggedInUser`, and returns to the card grid via `setActiveTab("homeworkPortal")`.

## 9. Services and API Layer

### Base URL handling

1. `src/config/api.js` exports `VITE_API_BASE_URL || "http://127.0.0.1:8000"`.
2. `EmailLogin.jsx` independently defines `VITE_API_BASE_URL || "http://localhost:8000"`.
3. Homework services, Weekly Dashboard, and Test Email use trimmed `VITE_API_URL`. Services reject an empty value; the two pages concatenate it directly, producing same-origin relative paths when empty.
4. Chatbot/quiz components use hard-coded Railway server roots.
5. `InterviewReminders` uses hard-coded `http://localhost:8000`.

Both configured Vite values represent an HTTP server root. They do **not** include `/api` or another API prefix in the checked-in configuration; code appends complete paths such as `/parent-teacher-interview/...` and `/homework/...`.

### Service responsibilities

| Service | Responsibility and handling |
| --- | --- |
| `homeworkConfigurationService.jsx` | Builds center configuration/weeks URLs; conditionally adds Bearer auth; reads JSON; throws `detail`, `message`, or status fallback; normalizes nested/direct configuration and week response variants. |
| `homeworkDefaultSlotTimingService.jsx` | Gets/updates center default timings; same auth/error pattern; accepts nested/direct arrays, sorts by order, normalizes missing order. |
| `homeworkAutomationService.js` | Gets/updates center automation; same auth/error pattern; normalizes nested response variants. |

Most component-level calls parse JSON and check `response.ok`, but behavior varies: some silently return/clear data, some display errors, and many log errors. There is no centralized client, timeout, retry, abort strategy, 401 handling, or response schema validation.

### Verified endpoint reference

`{base}` below means the source-specific base described above.

| Feature | Method | Endpoint | Verified request | Verified response use/purpose |
| --- | --- | --- | --- | --- |
| Parent auth | POST | `/send-otp` | JSON `{email}` | success/error; send OTP |
| Parent auth | POST | `/verify-otp` | JSON `{email, otp}` | complete object retained; `student` consumed |
| Admin auth | POST | `/interview-booking/admin/login` | JSON `{username, password}` | `interview_admin` or direct object |
| PTI events | GET | `/parent-teacher-interview/events` | query `center_code` | `{events: []}` |
| PTI events | POST | `/parent-teacher-interview/events` | JSON `{center_code,name,event_date,location}` | success object not otherwise depended upon |
| PTI events | PUT | `/parent-teacher-interview/events/{eventId}` | same JSON | success object not otherwise depended upon |
| PTI events | DELETE | `/parent-teacher-interview/events/{eventId}` | query `center_code` | success/error then reload |
| PTI teachers | GET | `/parent-teacher-interview/teachers` | query `center_code` | `{teachers:[{id,full_name,...}]}` |
| PTI slots | GET | `/parent-teacher-interview/slots` | query `center_code,event_id` | `{slots:[{id,teacher_id,teacher_name,start_time,end_time,is_available,...}]}` |
| PTI availability | GET | `/parent-teacher-interview/teacher-availability` | query `center_code,event_id` | `{availability:[]}` with availability/time/duration/gap fields |
| PTI availability | POST | `/parent-teacher-interview/teacher-availability` | JSON `{center_code,event_id,teacher_id,is_available,start_time,end_time,slot_duration,gap}` | save success/error |
| PTI classes | GET | `/parent-teacher-interview/classes` | query `center_code`, optional `teacher_id` | `{classes:[]}` |
| PTI class years | GET | `/parent-teacher-interview/class-years` | query `center_code,class_name` | `{class_years:[{id,year_name,...}]}` |
| PTI allocations | GET | `/parent-teacher-interview/teacher-allocations` | query `center_code` | `{allocations:[]}` |
| PTI allocations | POST | `/parent-teacher-interview/teacher-allocations` | JSON `{center_code,teacher_id,class_id,class_year_id}` | `allocation_id` consumed |
| PTI allocations | PUT | `/parent-teacher-interview/teacher-allocations/{allocationId}` | same JSON | success/error |
| PTI allocations | DELETE | `/parent-teacher-interview/teacher-allocations/{allocationId}` | query `center_code` | success/error |
| PTI bookings | GET | `/parent-teacher-interview/bookings` | query `center_code` | `{bookings:[]}` |
| PTI bookings | POST | `/parent-teacher-interview/bookings` | JSON `{center_code,event_id,slot_id,teacher_id,student_id,parent_email}` | IDs used to create local booking state |
| PTI invitations | GET | `/parent-teacher-interview/invitations` | query `center_code,event_id` | `{invitations:[]}` mapped to display rows |
| PTI invitations | POST | `/parent-teacher-interview/send-invitations` | JSON `{center_code,event_id,student_ids}` | `sent_count` displayed |
| PTI history | GET | `/parent-teacher-interview/completed-events` | query `center_code` | `{events:[]}` |
| PTI history | GET | `/parent-teacher-interview/completed-events/{eventId}/bookings` | query `center_code` | `{bookings:[]}` |
| PTI history | GET | `/parent-teacher-interview/completed-events/{eventId}/summary` | query `center_code` | `teachers`, `students`, `booked`, `not_booked` displayed |
| PTI reminders | GET | `/parent-teacher-interview/reminder-settings` | query hard-coded `center_code,event_id` | two enabled flags |
| PTI reminders | PUT | `/parent-teacher-interview/reminder-settings` | JSON `{center_code,event_id,one_day_before_enabled,thirty_minutes_before_enabled}` | updated flags |
| Parent Homework | POST | `/homework-support/parent/dashboard` | JSON `{parent_email}` | response, slot ID, student/title/week/date |
| Parent Homework | POST | `/homework-support/parent/time-slots` | JSON `{parent_email}` | `{time_slots:[]}` |
| Parent Homework | POST | `/homework-support/parent/response` | JSON `{parent_email,response,selected_time_slot_id}` | success/error |
| Homework config | GET | `/homework/configuration/by-center/{centerCode}` | optional Bearer | normalized configuration |
| Homework config | PUT | `/homework/configuration/by-center/{centerCode}` | optional Bearer; config JSON | normalized configuration |
| Homework weeks | GET | `/homework/configuration/weeks/{centerCode}` | query `term_id`; optional Bearer | `{weeks:[]}` or nested variant |
| Homework defaults | GET | `/homework/configuration/default-slot-timings/by-center/{centerCode}` | optional Bearer | timings array/nested variant |
| Homework defaults | PUT | same path | optional Bearer; `{default_slot_timings}` | timings array/nested variant |
| Homework automation | GET | `/homework/automation/by-center/{centerCode}` | optional Bearer | automation object/nested variant |
| Homework automation | PUT | same path | optional Bearer; `{enabled,invitation_day,invitation_time}` | automation object/nested variant |
| Homework dashboard | GET | `/homework-support/admin/weeks` | query `center_code` | `weeks`, `current_week_number` |
| Homework dashboard | GET | `/homework-support/admin/responses` | query `center_code,week_number` | summary, slots, students, session date |
| Homework email | GET | `/homework-support/admin/classes` | query `center_code`; optional Bearer | `{classes:[]}` |
| Homework email | GET | `/homework-support/admin/students` | query `center_code,class_name`; optional Bearer | `{students:[]}` |
| Homework email | POST | `/homework/test-email/send` | optional Bearer; JSON `{center_code,student_ids}` | `message`, `results` |
| Chat context | POST | `/chatbot/parent-context` | JSON `{email}` | student name/class context |
| Chat welcome | POST | `/welcome-quote` | no body | `quote`, `author` |
| Chat search | GET | `/search` | query `query,reasoning,user_id,conversation_uuid,class_name` | text parsed by chatbot |
| Chat audio | POST | `/chatbot/audio` | JSON `{message_id}` | audio blob |
| Quiz welcome | POST | `/parent/gamified-welcome-quote` | JSON `{parent_email}` | quote display data |
| Quiz current | POST | `/parent/current-gamified-quiz` | JSON `{parent_email}` | quiz/question data consumed by component |
| Quiz answer | POST | `/parent/submit-quiz-answer` | JSON `{parent_email,question_index,selected_option}` | completion/review/next-state data |

No endpoint documentation or backend OpenAPI file is checked in; fields beyond those read or written by this frontend are **Not established from this repository.**

## 10. Environment and Deployment Configuration

The inspected workspace contains `.env.local` and `.env.production`.

| File/variable | Current role |
| --- | --- |
| `.env.local`: `VITE_API_BASE_URL` | Local root for shared PTI/admin login/parent Homework calls. |
| `.env.local`: `VITE_API_URL` | Local root for Homework services, Weekly Dashboard, and Test Email. |
| `.env.production`: `VITE_API_BASE_URL` | Production Railway root for shared calls. |

No secret values are required by the frontend variables; they are public client-side server URLs. `.env.production` does not define `VITE_API_URL`, so production behavior for Homework service modules depends on deployment-injected configuration. Without it, services throw a configuration error, while Weekly Dashboard/Test Email call relative same-origin paths.

`VITE_API_BASE_URL` and `VITE_API_URL` are server roots, not roots that already contain an API prefix. There is no Vite development proxy. `vite.config.js` enables only the React plugin.

`vercel.json` rewrites all paths to `index.html`. This supports direct loading of `/admin` and `/admin/notifications` at the frontend host but does not proxy API calls.

Package scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite development server. |
| `npm run build` | Create the production Vite bundle. |
| `npm run lint` | Run ESLint over the project. |
| `npm run preview` | Serve the built bundle locally. |

## 11. CSS and UI Architecture

- `src/index.css` supplies global box sizing, body margin/minimum width/minimum height, and font smoothing/base font choices.
- Components/pages normally import a sibling stylesheet, for example `HomeworkBooking.jsx` -> `HomeworkBooking.css` and `HomeworkConfiguration.jsx` -> `HomeworkConfiguration.css`.
- All class names are global. Scoping depends on descriptive prefixes such as `admin-`, `homework-`, `weekly-`, `test-email-`, `pti-`, `interview-`, and `parent-notification-`.
- Shared-looking class names such as `homework-card`, `homework-notice`, `configuration-footer`, and `login-error` occur across Homework CSS files, but there is no formal shared design-system stylesheet.
- The admin overview uses clickable `<article role="button">` cards with click plus Enter/Space handlers. Detail modules use ordinary buttons, forms, panels/cards, tables, filters, status labels, and loading/error text.
- Responsive layout is implemented through media queries in feature stylesheets. The main admin and parent card grids use CSS Grid.
- UI icons are primarily emoji/text glyphs; there is no icon package.
- Academy branding uses a hard-coded external image URL in several components. Notification assets are local public images.
- Some active UI uses inline styles, especially portions of `HomeworkBooking` and `EmailLogin`.

Future modules should follow the nearest feature's prefixed class naming and dedicated imported CSS file, reuse existing admin card/detail patterns, include explicit loading/error/empty states, and avoid introducing globally generic class names that can collide with existing styles.

## 12. Backend Integration Boundaries

This repository contains only the frontend. What can be established:

- Calls use JSON over HTTP except chatbot audio, which returns a blob, and chatbot search, which is read as text before parsing/handling.
- JSON calls set `Content-Type: application/json` even for many GET requests.
- Homework service/Test Email calls conditionally support a Bearer token.
- Most other calls do not authenticate with a header and rely on submitted identifiers.
- Error handlers commonly expect a string `detail`, then sometimes `message`, then a status-based fallback.
- The frontend expects cross-origin access to configured/hard-coded Railway servers during deployed use.

CORS policy/configuration is **Not established from this repository.** FastAPI route implementation, dependency injection, authorization checks, background jobs, email provider, database transactions, schema validation, and center-level enforcement are **Not established from this repository.**

Frontend-only notifications are the exception to HTTP integration: configuration lives in `localStorage.gem_ai_notifications`; acknowledgement is only an in-memory queue and is rebuilt on every successful parent login.

## 13. Current Feature Inventory

```text
Authentication
|-- Parent email and OTP login
|-- Parent localStorage record and logout
`-- CENTER_ADMIN username/password login and localStorage record

Parent Dashboard
|-- Gem AI Chatbot
|-- Gamified Quiz
|-- External Exam Module link
|-- Homework Booking
`-- Parent Teacher Interview booking

Unified Admin
`-- Gem AI Notifications (frontend-only localStorage CRUD/preview)

Parent Teacher Interview Admin
|-- Event Setup
|-- Teacher Availability and slot preview
|-- Teacher Allocation
|-- Interview Bookings and filters
|-- Send Invitations
|-- Reminder Settings
`-- Event History

Homework Portal
|-- Homework Configuration
|   |-- Terms and weeks
|   |-- Weekly slots and capacities
|   |-- Booking cutoff
|   `-- Default slot timings
|-- Homework Automation
|-- Homework Weekly Dashboard
`-- Test Email
```

## 14. Important Implementation Patterns

1. **Keep top-level navigation separate from feature cards.** The admin shell has three top-level tabs. PTI/Homework capabilities are cards that change `activeTab` to an internal detail value. Preserving this avoids unnecessary top-level navigation growth.
2. **Propagate the accepted admin object to Homework modules.** The four modules expect `loggedInUser`, derive `center_code`, and may derive `access_token`. Omitting it causes configuration/service errors or unscoped requests.
3. **Scope center-owned API calls.** Existing PTI/Homework admin requests consistently include a center path/query/body field, except the documented Reminders defect. A missing code currently becomes an error in Homework services but may become an empty PTI query.
4. **Use the correct existing API-base family.** Shared PTI/parent flow uses `VITE_API_BASE_URL`; the newer Homework admin service layer uses `VITE_API_URL`. This inconsistency is technical debt, but a feature must account for it until deliberately unified.
5. **Put reusable Homework API transformations in services.** Configuration/default/automation services centralize URL validation, conditional auth, response normalization, and error extraction. Complex new Homework APIs should use a comparable boundary instead of embedding all parsing in a visual component.
6. **Use local state and explicit async UI states.** Current modules track loading, error, saving, and success locally. New work should preserve visible pending/failure behavior because there is no global request layer or error boundary.
7. **Follow card-to-detail Back behavior.** Homework and PTI module details restore their owning overview value. This is the mechanism that makes card modules feel nested despite the single `activeTab` variable.
8. **Map API naming at the boundary.** Existing code often consumes snake_case server fields and occasionally maps them to display-friendly objects. New mapping should stay in a service/load function rather than spread aliases through JSX.
9. **Pair feature JSX with dedicated prefixed CSS.** Global class scope makes naming discipline important to prevent unrelated feature regressions.
10. **Treat localStorage as current persistence, not proof of authorization.** It restores admin UI access and notification data, but only the backend can enforce credentials/tenancy. That enforcement is not visible here.

## 15. Known Limitations / Technical Debt

Each item below is an observation, not required architecture.

- **Known limitation / technical debt:** no `AuthContext`/`useAuth`, centralized session service, expiry handling, refresh, admin logout, or route guard abstraction.
- **Known limitation / technical debt:** ordinary parent state is not restored after reload, while chatbot/quiz and admin state are restored from localStorage.
- **Known limitation / technical debt:** manual route checks have no 404 handling, and Event Setup pushes `/admin-interview-booking`, a pathname `App` does not route as admin after reload.
- **Known limitation / technical debt:** API roots are fragmented across two environment variable names, two different local fallbacks, hard-coded Railway URLs, and hard-coded localhost in Reminders.
- **Known limitation / technical debt:** `.env.production` has no repository-defined `VITE_API_URL`, which the recently added Homework admin modules require.
- **Known limitation / technical debt:** `InterviewReminders` is hard-coded to center `MP001`, violating the otherwise authenticated center flow.
- **Known limitation / technical debt:** Bearer authentication is conditional and inconsistent; Weekly Dashboard and PTI admin calls do not use it.
- **Known limitation / technical debt:** notification configuration is browser-local, shared across centers/users on the origin, has no backend sync, and acknowledgements are not persisted.
- **Known limitation / technical debt:** the active parent PTI change-booking confirmation does not persist an update, and loaded existing bookings do not initialize the local success view.
- **Known limitation / technical debt:** PTI capacity validation compares generated slots to `requiredSlots = 0` and therefore does not represent actual allocation demand.
- **Known limitation / technical debt:** synthetic Not Booked rows are generated and then filtered out because they have no times; the booking time filter has no implemented matching beyond `All`.
- **Known limitation / technical debt:** Homework parent UI does not evaluate capacity/cutoff locally and displays raw time values in places. Backend enforcement is unknown.
- **Known limitation / technical debt:** Weekly Dashboard includes unused mutation functions referencing undefined `setStudents`; no rendered action calls them.
- **Known limitation / technical debt:** unused/duplicate surfaces include `src/HomeworkSupportAttendance.jsx`, `src/pages/WelcomePage.jsx`, `src/App.css`, and the demo `src/components/ParentTeacherInterviews/ParentTeacherInterviews.jsx`.
- **Known limitation / technical debt:** extensive debug `console.log` calls remain, some logging parent/student context and API response data.
- **Known limitation / technical debt:** no TypeScript, runtime prop validation, API schema validation, automated tests, or error boundary is present.
- **Known limitation / technical debt:** error handling and response parsing vary by component; some failed calls silently clear data.
- **Known limitation / technical debt:** README remains the default Vite template and does not document application setup/API requirements.
- **Known limitation / technical debt:** several components hard-code the external academy logo URL, making rendering dependent on a third-party origin.

## 16. How to Add a New Feature Safely

1. Identify the user and ownership boundary: parent dashboard, Unified admin, PTI admin, or Homework Portal.
2. For admin work, decide whether it belongs under one of the three existing top-level tabs. Prefer a card/module within that tab when it is part of that domain.
3. Add a module-specific `activeTab` value and overview card in `AdminInterviewBooking` only when using the existing admin shell; add a Back action that restores the owning overview value.
4. For a parent feature, add a dashboard card and local selection state in `ParentDashboard`, following the replacement-view plus `onBack` pattern unless a real route is intentionally introduced project-wide.
5. Pass existing identity data explicitly. Homework admin components need `loggedInUser`; parent components need `parentData`. Do not assume `useAuth` exists.
6. Determine center ownership before writing API code. Carry `center_code` in the exact query/path/body position required by the verified backend contract and fail visibly when required identity is missing.
7. Choose the current API boundary deliberately: use or extend a service for multi-call/normalized Homework behavior; use `src/config/api.js` where the feature belongs to the existing shared API family. Do not add another hard-coded server root.
8. Add conditional Bearer auth where the endpoint contract requires it, using `loggedInUser.access_token`; do not claim token enforcement unless verified with the backend.
9. Normalize response variants and extract `detail`/`message` errors at the request boundary. Track loading, error, saving, empty, and success states in the component.
10. Add a dedicated, prefixed CSS file or extend the owning feature stylesheet narrowly. Reuse the existing card/detail/table/form visual structure and keyboard handling.
11. Check the feature on both fresh and restored localStorage states, with missing center/token, empty data, failed HTTP responses, and cross-center test accounts where a backend environment permits.
12. Verify every new endpoint path, method, payload, query parameter, response field, and auth header against source/backend behavior; update this document when the implementation changes.
13. Run `npm run lint` and `npm run build`. Add focused tests if a test framework is introduced; none exists today.

## Current Development Status

The repository currently has a working React/Vite composition for parent OTP entry, the parent tool dashboard, chatbot/quiz entry points, parent PTI booking, a broad PTI admin workspace, and browser-local notification management. The admin shell now exposes three top-level areas: Unified, Parent Teacher Interview, and Homework Portal.

Homework Support is the most recently integrated feature group visible in the current tree. Parent attendance/booking is connected to `/homework-support/parent/*`; the Homework Portal contains Configuration, Automation, Weekly Dashboard, and Test Email cards and renders each as an in-dashboard module with the logged-in admin object. Configuration includes selected terms/weeks, custom/default slots, capacities, and cutoff settings; Automation displays server-produced schedules; Weekly Dashboard displays week responses/capacity; Test Email selects center classes/students and triggers a manual send.

The integration is substantial but still shows active-development edges: two API environment variable families, missing production `VITE_API_URL` in the repository environment file, conditional/inconsistent token use, unused Homework helper code, and no automated tests. Backend code, database implementation, scheduler/email internals, and server-side tenant enforcement are **Not established from this repository.**