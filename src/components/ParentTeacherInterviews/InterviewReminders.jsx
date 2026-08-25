import { useState } from "react";
import "./InterviewReminders.css";

function InterviewReminders() {
  const [oneDayBefore, setOneDayBefore] = useState(true);
  const [thirtyMinutesBefore, setThirtyMinutesBefore] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

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

            <select defaultValue="term-3">
              <option value="term-3">
                Term 3 Parent–Teacher Interviews 2026
              </option>
            </select>
          </label>
        </div>

        <div className="reminder-section">

          <h3>Reminder Schedule</h3>

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
              onClick={() =>
                setOneDayBefore((current) => !current)
              }
              aria-pressed={oneDayBefore}
            >
              <span></span>
              {oneDayBefore ? "Enabled" : "Disabled"}
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
              onClick={() =>
                setThirtyMinutesBefore((current) => !current)
              }
              aria-pressed={thirtyMinutesBefore}
            >
              <span></span>
              {thirtyMinutesBefore ? "Enabled" : "Disabled"}
            </button>
          </div>

        </div>

        <div className="reminder-summary">

          <div>
            <strong>24</strong>
            <span>Confirmed Bookings</span>
          </div>

          <div>
            <strong>
              {oneDayBefore && thirtyMinutesBefore ? "2" : "1"}
            </strong>
            <span>Reminder Types Enabled</span>
          </div>

          <div>
            <strong>24</strong>
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
                <h3>Parent–Teacher Interview Reminder</h3>
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
                  <strong>Friday, 18 September 2026</strong>
                </div>

                <div>
                  <span>Time</span>
                  <strong>6:45 PM – 6:55 PM</strong>
                </div>

                <div>
                  <span>Location</span>
                  <strong>Marsden Park Centre</strong>
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