# Gem AI Notification Implementation Context

## Purpose

This document records the current frontend-only Gem AI parent notification demo. The implementation lets an authenticated admin manage notification records in browser storage and lets the parent login flow display currently active notifications before rendering the parent dashboard.

No notification backend API, database model, migration, or server-side acknowledgement system currently exists in this repository.

## 1. Files Involved

### Parent notification flow

| File | Purpose |
| --- | --- |
| `src/config/demoParentNotifications.js` | Defines the three initial demo notification records. These records seed browser storage when no stored notification configuration exists. |
| `src/utils/notificationStorage.js` | Owns the shared frontend data source. It reads and writes the `gem_ai_notifications` localStorage key and seeds it from the demo configuration when the key is absent. |
| `src/utils/getActiveNotifications.js` | Contains the pure date and `active`-flag filtering logic used before parent notification delivery. |
| `src/components/ParentNotificationModal.jsx` | Renders the parent-facing modal for `text`, `image`, and `text-image` display modes and exposes the acknowledgement callback. |
| `src/components/ParentNotificationModal.css` | Contains the parent modal overlay, content, image, button, responsive, and focus styling. |
| `src/components/EmailLogin.jsx` | Performs OTP verification. After a successful `/verify-otp` response, it calls the `onLoginSuccess` callback supplied by `App`. |
| `src/App.jsx` | Controls the successful parent-login transition. `handleLoginSuccess` loads stored notifications, filters active records, creates the in-memory queue, renders the modal while the queue is non-empty, and renders `ParentDashboard` afterward. It also defines the admin notification route. |
| `src/components/ParentDashboard.jsx` | Existing destination rendered after notification acknowledgement is complete. It contains links to parent tools but has no notification logic itself. |

### Admin notification demo

| File | Purpose |
| --- | --- |
| `src/components/AdminInterviewBooking.jsx` | Defines the top-level admin tabs. The `Unified` tab contains the single `Gem AI Notifications` card, which navigates to `/admin/notifications`. |
| `src/components/AdminNotificationManagement.jsx` | Implements the frontend-only notification list, filters, create/edit form, image selection, activation toggle, and preview. It reads and writes through `notificationStorage.js`. |
| `src/components/AdminNotificationManagement.css` | Styles the admin notification page, table, status badges, form modal, image picker, and responsive layout. |
| `src/components/InterviewAdminLogin.jsx` | Existing admin authentication UI. `App` applies this existing gate to both `/admin` and `/admin/notifications`. It is not notification-specific. |
| `src/App.jsx` | Routes `/admin/notifications` to `AdminNotificationManagement` after the existing admin login check. |

### Static image assets

| File | Frontend URL |
| --- | --- |
| `public/images/Image_Notification.png` | `/images/Image_Notification.png` |
| `public/images/imageTextNotificationimage.png` | `/images/imageTextNotificationimage.png` |

Vite serves files under `public/` from the site root, so `/images/...` URLs are used directly.

## 2. Demo Notification Data

The shared notification shape is:

```js
{
  id,
  title,
  text,
  image,
  displayMode,
  startDate,
  endDate,
  active,
}
```

Field meanings:

| Field | Current meaning |
| --- | --- |
| `id` | Stable notification identifier. Demo IDs are strings. New admin-created IDs use `gem-ai-notification-${Date.now()}`. |
| `title` | Heading shown in text-capable modes. |
| `text` | Body copy shown in text-capable modes. |
| `image` | Root-relative public image URL, or `null` for text-only notifications. |
| `displayMode` | One of `text`, `image`, or `text-image`. |
| `startDate` | Inclusive local start date in `YYYY-MM-DD` format. |
| `endDate` | Inclusive local end date in `YYYY-MM-DD` format. |
| `active` | Boolean administrative enable/disable flag. |

Display-mode behavior:

- `text`: renders title and text; does not render an image. Saving this mode forces `image` to `null`.
- `image`: renders the selected image only; title and text are not rendered by the parent modal.
- `text-image`: renders the image, title, and text.

Current seed records in `src/config/demoParentNotifications.js`:

| ID | Mode | Image | Active range | Active flag |
| --- | --- | --- | --- | --- |
| `gem-ai-parent-demo-1` | `text` | `null` | `2026-01-01` through `2026-12-31` | `true` |
| `gem-ai-parent-demo-2` | `image` | `/images/Image_Notification.png` | `2026-01-01` through `2026-12-31` | `true` |
| `gem-ai-parent-demo-3` | `text-image` | `/images/imageTextNotificationimage.png` | `2026-01-01` through `2026-12-31` | `true` |

The configuration file is seed data, not the ongoing runtime source after localStorage has been initialized. Existing stored data is not overwritten when the seed file changes.

## 3. Active Notification Logic

`getActiveNotifications(notifications, today = new Date())` performs delivery filtering.

1. It normalizes `today` to local midnight using the local year, month, and day.
2. It parses each `YYYY-MM-DD` boundary into a local `Date` with `new Date(year, month - 1, day)`.
3. It rejects a notification when `active` is false.
4. It includes a notification when:

```js
startDate <= currentDate && currentDate <= endDate
```

Both boundaries are inclusive. A notification is eligible for its entire start date and entire end date according to the browser's local calendar.

The active filter preserves array order. This order becomes the parent display order.

The admin list uses equivalent local-date comparisons in `getNotificationStatus`:

- `Inactive`: `active` is false, regardless of dates.
- `Upcoming`: active is true and today is before `startDate`.
- `Expired`: active is true and today is after `endDate`.
- `Active`: active is true and today is within the inclusive range.

## 4. Parent Login Flow

The successful flow is:

1. `EmailLogin.handleContinue` submits the OTP to `/verify-otp`.
2. A successful response calls `onLoginSuccess({ ...data, email: trimmedEmail })`.
3. `App` supplies `handleLoginSuccess` as that callback.
4. `App.handleLoginSuccess` stores existing parent login data under `parentData`, sets parent React state, calls `getStoredNotifications()`, filters the result through `getActiveNotifications()`, and stores the result in `pendingParentNotifications`.
5. If `parentData` exists and the pending queue is non-empty, `App` renders only `ParentNotificationModal` for the first queue item.
6. `ParentDashboard` is not rendered by this branch while notifications remain.
7. After the final item is acknowledged, the queue is empty and `App` renders `ParentDashboard`.

The notification source used during login is therefore:

```text
localStorage gem_ai_notifications
        |
getStoredNotifications()
        |
getActiveNotifications()
        |
pendingParentNotifications React state
        |
ParentNotificationModal
```

If `gem_ai_notifications` does not exist, `getStoredNotifications()` writes the demo configuration to that key and returns the demo records. If stored JSON is invalid or is not an array, the reader returns an empty array.

## 5. Modal Behavior

`ParentNotificationModal` receives:

- `notification`: the current notification object.
- `onAcknowledge`: the callback invoked by the acknowledgement button.

The acknowledgement button is labeled `Got It` and receives focus automatically.

The overlay has no click handler and the dialog has no close icon, Escape-key handler, timeout, or automatic dismissal. Clicking outside the modal therefore does not dismiss it.

For multiple active notifications:

1. `App` renders `pendingParentNotifications[0]`.
2. Clicking `Got It` calls `handleNotificationAcknowledge`.
3. The handler replaces the queue with `notifications.slice(1)`.
4. React renders the next first item.
5. When the final item is removed, the queue length becomes zero and the parent dashboard renders.

The parent cannot skip ahead through the queue using the notification UI.

## 6. Acknowledgement Behavior

Acknowledgement is stored only in `pendingParentNotifications`, which is React state inside `App`.

It is not stored in:

- `localStorage`
- `sessionStorage`
- cookies
- a database
- a backend API
- the notification objects themselves

No acknowledgement request is sent to a server. Logging out clears the pending queue. A later successful login rebuilds the queue from the current stored notification configuration and active-date filter, so eligible notifications appear again.

Note that notification configuration is persisted in localStorage; only acknowledgement is non-persistent.

## 7. Image Handling

The parent modal computes `showImage` when `displayMode` is `image` or `text-image` and `notification.image` is truthy. It renders:

```jsx
<img
  className="parent-notification-image"
  src={notification.image}
  alt=""
/>
```

The empty `alt` marks these configured banners as decorative to assistive technology. The CSS uses full available width, a 340px maximum height, and `object-fit: contain`.

Current exact paths and casing:

- Image-only: `/images/Image_Notification.png`
- Text plus image: `/images/imageTextNotificationimage.png`

The actual files are named `Image_Notification.png` and `imageTextNotificationimage.png`. These differ in case from `Image_notification.png` and `ImageTextNotificationimage.png`; code must preserve the actual casing for case-sensitive deployment environments.

The admin image picker currently offers these same two paths only. No upload or external image URL support exists.

## 8. Admin Dashboard Demo

The top-level tabs are defined in `AdminInterviewBooking.jsx` in this order:

1. `Unified`
2. `Parent Teacher Interview`

The `Unified` tab renders one existing-style overview card named `Gem AI Notifications`. Activating the card by click, Enter, or Space navigates to:

```text
/admin/notifications
```

`App` recognizes that path and applies the same existing `interviewAdminData` authentication check used for `/admin`. Authenticated admins see `AdminNotificationManagement`; otherwise they see `InterviewAdminLogin`.

The management page currently demonstrates:

- a table of all stored notifications
- status labels for Active, Inactive, Upcoming, and Expired
- All, Active, Upcoming, Expired, and Inactive filters
- creation of multiple notifications
- editing existing notifications
- `text`, `image`, and `text-image` mode selection
- mode-dependent title, text, and image controls
- selection from the two existing public images
- inclusive start/end date fields
- active/inactive configuration
- direct Activate/Deactivate actions from the list
- preview through the same `ParentNotificationModal`

Saving creates or updates a notification in localStorage. New IDs are generated from the current timestamp. Activate/Deactivate updates the same stored record's `active` property. Preview uses form state and does not save or activate anything by itself.

The admin demo and parent demo are connected to the same frontend source: `gem_ai_notifications`. An admin change in the same browser/origin is read by the parent flow on the next successful login. This remains frontend/mock persistence, not backend persistence.

## 9. Current Limitations

The notification system is currently browser-local and demo-only. It is not connected to:

- a notification backend API
- a notification database
- an admin notification database model
- real server-side admin-created notification records
- server-side image storage or uploads
- server-side acknowledgement records

Additional current constraints:

- Configuration is shared only within the same browser profile and origin. It does not synchronize across devices or users.
- All parent users in that browser read the same local notification array; there is no audience targeting.
- The seed configuration runs only when the storage key is absent. Seed updates do not migrate an existing stored array.
- Corrupt/non-array stored data produces an empty list rather than automatically restoring defaults.
- There is no delete action.
- There is no explicit ordering control; delivery follows array order, and new records are appended.
- There is no backend validation. The form provides browser-level required fields and a minimum end date, but stored records should not be treated as trusted data.
- The parent notification gate is established in the normal successful login-to-dashboard path. `App` handles direct `?view=chatbot` and `?view=gamified-quiz` routes earlier using stored `parentData`; those direct routes do not execute the normal notification queue check.

## 10. Future Backend Wiring

When real backend support is introduced, the primary replacement boundary is `src/utils/notificationStorage.js`.

Current behavior to replace:

- `getStoredNotifications()` reads/seeds `gem_ai_notifications` in localStorage.
- `saveStoredNotifications()` writes the complete array to localStorage.
- Admin create/edit/toggle operations manipulate that local array.

Suggested wiring approach based on the current architecture:

1. Replace the parent notification read with an API request that returns notifications visible to the authenticated parent.
2. Feed the returned array into the existing `getActiveNotifications()` function, unless the backend guarantees equivalent active/date filtering and the product chooses to trust server filtering.
3. Store the resulting array in the existing `pendingParentNotifications` state.
4. Keep `ParentNotificationModal`, display-mode behavior, queue order, and `handleNotificationAcknowledge` unchanged.
5. Replace admin localStorage reads/writes with list/create/update/activate/deactivate API calls while preserving the existing notification object shape in component state.
6. Replace static image selection only if server upload/media support is required; return a usable image URL in the same `image` field.

The backend should return these fields without requiring modal redesign:

- `id`
- `title`
- `text`
- `image`
- `displayMode`
- `startDate`
- `endDate`
- `active`

If backend naming uses snake_case, add one mapping at the API/data boundary rather than changing the modal or active filter throughout the UI.

The following frontend behavior should remain unchanged:

- inclusive date eligibility
- `active` flag enforcement
- three display modes
- sequential queue behavior
- explicit `Got It` acknowledgement
- no outside-click dismissal
- dashboard gating until the queue is empty
- non-persistent acknowledgement, unless product requirements explicitly change later

## 11. Proposed Future Backend Contract

This contract is a suggestion only. It does not currently exist.

### Parent notification list

```http
GET /notifications/parent/active
```

Proposed response:

```json
{
  "notifications": [
    {
      "id": "notification-123",
      "title": "Welcome to Gem AI",
      "text": "Gem AI is ready to support your child's learning journey.",
      "image": null,
      "displayMode": "text",
      "startDate": "2026-01-01",
      "endDate": "2026-12-31",
      "active": true
    },
    {
      "id": "notification-124",
      "title": "",
      "text": "",
      "image": "/media/notifications/banner-124.png",
      "displayMode": "image",
      "startDate": "2026-08-01",
      "endDate": "2026-09-30",
      "active": true
    }
  ]
}
```

Contract considerations:

- Return notifications in intended display order.
- Use ISO calendar dates in `YYYY-MM-DD` format.
- Define whether date filtering follows the center's timezone, the user's timezone, or server time.
- Keep `displayMode` values exactly `text`, `image`, and `text-image`, or map them at one frontend boundary.
- Return `image: null` when no image applies.
- Return a browser-accessible image URL when an image applies.
- Keep `active` boolean, even if the endpoint returns active records only, so the shared admin/parent shape remains stable.

Future admin endpoints would typically list, create, update, and toggle notification records, but no endpoint definitions are implemented or assumed by the current frontend.

## 12. Important Implementation Notes

- Storage key: `gem_ai_notifications`.
- Parent login data uses a separate existing `parentData` localStorage key. This is authentication/session behavior, not notification acknowledgement.
- Admin authentication uses the existing `interviewAdminData` localStorage key and existing login flow.
- Notification dates use `YYYY-MM-DD` and are deliberately parsed as local dates rather than `new Date("YYYY-MM-DD")`, avoiding UTC date shifts.
- Date validity is assumed. A future API boundary should validate required dates and supported modes.
- Delivery order is the stored array order.
- Admin preview uses the unsaved `editingNotification` object and the production parent modal component.
- Saving `text` mode forces `image` to `null`.
- Image-only mode may retain title/text values in stored data, but the parent modal does not render them.
- The modal image has empty alternative text. If future banners contain essential textual information only inside the image, accessibility requirements should define meaningful alternative content.
- `ParentNotificationModal` uses a fixed DOM ID, `parent-notification-title`. The current architecture renders one notification modal at a time, so no duplicate ID occurs.
- The modal has no explicit Escape-key interception. There is also no Escape-key close handler, so pressing Escape does not dismiss it under current code.
- Notification configuration changes become visible to the parent when `handleLoginSuccess` next reads storage. The parent queue is a snapshot and does not update live during an already-running acknowledgement sequence.
- Removing `gem_ai_notifications` manually causes the three demo records to be seeded again on the next read.
- This document describes the implementation as inspected on August 31, 2026.
