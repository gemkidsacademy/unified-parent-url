import { useEffect, useState } from "react";
import "./InterviewReminders.css";

function InterviewReminders() {
  const centerCode = "MP001";

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const [oneDayBefore, setOneDayBefore] = useState(true);
  const [thirtyMinutesBefore, setThirtyMinutesBefore] = useState(true);

  const [showPreview, setShowPreview] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmedBookings, setConfirmedBookings] = useState(0);
  /*
   * Load Parent–Teacher Interview events
   */
  useEffect(() => {
  if (!selectedEventId) {
    setConfirmedBookings(0);
    return;
  }

  const loadBookings = async () => {
    try {
      setLoadingBookings(true);

      const response = await fetch(
        `http://localhost:8000/parent-teacher-interview/bookings?center_code=${centerCode}`
      );

      if (!response.ok) {
        throw new Error("Failed to load bookings");
      }

      const data = await response.json();

      const eventBookings = (data.bookings || []).filter(
        (booking) =>
          booking.event_id === selectedEventId &&
          booking.booking_status === "BOOKED"
      );

      setConfirmedBookings(eventBookings.length);
    } catch (error) {
      console.error("Error loading bookings:", error);
      setConfirmedBookings(0);
    } finally {
      setLoadingBookings(false);
    }
  };

  loadBookings();
}, [selectedEventId]);
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/parent-teacher-interview/events?center_code=${centerCode}`
        );

        if (!response.ok) {
          throw new Error("Failed to load events");
        }

        const data = await response.json();

        setEvents(data.events || []);

        if (data.events && data.events.length > 0) {
          setSelectedEventId(data.events[0].id);
        }
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, []);

  /*
   * Load reminder settings for selected event
   */
  useEffect(() => {
    if (!selectedEventId) {
      return;
    }

    const loadReminderSettings = async () => {
      try {
        setLoadingSettings(true);

        const response = await fetch(
          `http://localhost:8000/parent-teacher-interview/reminder-settings?center_code=${centerCode}&event_id=${selectedEventId}`
        );

        if (!response.ok) {
          throw new Error("Failed to load reminder settings");
        }

        const data = await response.json();

        setOneDayBefore(data.one_day_before_enabled);
        setThirtyMinutesBefore(data.thirty_minutes_before_enabled);
      } catch (error) {
        console.error("Error loading reminder settings:", error);
      } finally {
        setLoadingSettings(false);
      }
    };

    loadReminderSettings();
  }, [selectedEventId]);

  /*
   * Save reminder settings
   */
  const updateReminderSettings = async (
    nextOneDayBefore,
    nextThirtyMinutesBefore
  ) => {
    if (!selectedEventId) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "http://localhost:8000/parent-teacher-interview/reminder-settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            center_code: centerCode,
            event_id: selectedEventId,
            one_day_before_enabled: nextOneDayBefore,
            thirty_minutes_before_enabled: nextThirtyMinutesBefore,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save reminder settings");
      }

      const data = await response.json();

      setOneDayBefore(data.one_day_before_enabled);
      setThirtyMinutesBefore(data.thirty_minutes_before_enabled);
    } catch (error) {
      console.error("Error saving reminder settings:", error);
    } finally {
      setSaving(false);
    }
  };

  /*
   * Toggle 1 day reminder
   */
  const handleOneDayBeforeToggle = () => {
    const nextValue = !oneDayBefore;

    setOneDayBefore(nextValue);

    updateReminderSettings(
      nextValue,
      thirtyMinutesBefore
    );
  };

  /*
   * Toggle 30 minute reminder
   */
  const handleThirtyMinutesBeforeToggle = () => {
    const nextValue = !thirtyMinutesBefore;

    setThirtyMinutesBefore(nextValue);

    updateReminderSettings(
      oneDayBefore,
      nextValue
    );
  };

  return (
    <div className="interview-reminders-page">

      <div className="reminders-intro">
        <span className="reminders-eyebrow">
          DEMO VIEW
        </span>

        <h2>Interview Reminders</h2>

        <p>
          Automatically remind parents about their confirmed
          Parent–Teacher Interview bookings.
        </p>
      </div>

      <section className="reminders-card">

        <div className="reminders-event">
          <label>
            <span>Event</span>

            <select
              value={selectedEventId || ""}
              onChange={(event) =>
                setSelectedEventId(Number(event.target.value))
              }
              disabled={loadingEvents}
            >
              {loadingEvents ? (
                <option value="">
                  Loading events...
                </option>
              ) : events.length === 0 ? (
                <option value="">
                  No events available
                </option>
              ) : (
                events.map((event) => (
                  <option
                    key={event.id}
                    value={event.id}
                  >
                    {event.name}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>

        <div className="reminder-section">

          <h3>Reminder Schedule</h3>

          {loadingSettings ? (
            <p>Loading reminder settings...</p>
          ) : (
            <>
              <div className="reminder-option">

                <div>
                  <strong>1 Day Before</strong>

                  <p>
                    Send a reminder email one day before
                    the scheduled interview.
                  </p>
                </div>

                <button
                  type="button"
                  className={`reminder-toggle ${
                    oneDayBefore ? "active" : ""
                  }`}
                  onClick={handleOneDayBeforeToggle}
                  aria-pressed={oneDayBefore}
                  disabled={saving}
                >
                  <span></span>

                  {oneDayBefore
                    ? "Enabled"
                    : "Disabled"}
                </button>

              </div>

              <div className="reminder-option">

                <div>
                  <strong>30 Minutes Before</strong>

                  <p>
                    Send a reminder email 30 minutes before
                    the scheduled interview.
                  </p>
                </div>

                <button
                  type="button"
                  className={`reminder-toggle ${
                    thirtyMinutesBefore ? "active" : ""
                  }`}
                  onClick={handleThirtyMinutesBeforeToggle}
                  aria-pressed={thirtyMinutesBefore}
                  disabled={saving}
                >
                  <span></span>

                  {thirtyMinutesBefore
                    ? "Enabled"
                    : "Disabled"}
                </button>

              </div>
            </>
          )}

        </div>

        <div className="reminder-summary">

          <div>
            <strong>
              {loadingBookings ? "..." : confirmedBookings}
            </strong>
            <span>Confirmed Bookings</span>
          </div>
          <div>
            <strong>
              {oneDayBefore && thirtyMinutesBefore
                ? "2"
                : oneDayBefore || thirtyMinutesBefore
                ? "1"
                : "0"}
            </strong>

            <span>Reminder Types Enabled</span>
          </div>

          <div>
            <strong>
              {loadingBookings ? "..." : confirmedBookings}
            </strong>
            <span>Parents to Receive</span>
          </div>

        </div>

        <button
          type="button"
          className="preview-reminder-button"
          onClick={() => setShowPreview(true)}
        >
          Preview Reminder
        </button>

      </section>

      {showPreview && (
        <div
          className="reminder-preview-overlay"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="reminder-preview-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="preview-header">

              <div>
                <span>EMAIL PREVIEW</span>

                <h3>
                  Parent–Teacher Interview Reminder
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
              >
                ×
              </button>

            </div>

            <div className="preview-email">

              <p>Hi Emma,</p>

              <p>
                This is a reminder that Oliver Brown's
                Parent–Teacher Interview is tomorrow.
              </p>

              <div className="preview-details">

                <div>
                  <span>Student</span>
                  <strong>Oliver Brown</strong>
                </div>

                <div>
                  <span>Teacher</span>
                  <strong>Mrs Sarah Johnson</strong>
                </div>

                <div>
                  <span>Date</span>
                  <strong>
                    Friday, 18 September 2026
                  </strong>
                </div>

                <div>
                  <span>Time</span>
                  <strong>
                    6:45 PM – 6:55 PM
                  </strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>
                    Marsden Park Centre
                  </strong>
                </div>

              </div>

              <p>
                We look forward to seeing you.
              </p>

              <strong>
                Gem Kids Academy
              </strong>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default InterviewReminders;