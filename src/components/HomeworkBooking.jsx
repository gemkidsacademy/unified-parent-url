import "./HomeworkBooking.css";

function HomeworkBooking({ parentData, onBack }) {
  const student = parentData?.students?.[0];

  const studentName = student?.name || "Student";

  // Temporary values.
  // These will later come from the backend.
  const homeworkTitle = "Homework Support";
  const weekNumber = 5;
  const sessionDate = "Saturday, September 12, 2026";

  return (
    <main className="homework-booking-page">

      {/* Academy Logo */}
      <div className="homework-academy-logo">
        <img
          src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
          alt="Gem Kids Academy"
        />
      </div>

      {/* Main Card */}
      <section className="homework-booking-card">

        {/* Back */}
        <button
          type="button"
          className="homework-back-button"
          onClick={onBack}
        >
          ← Back to dashboard
        </button>

        {/* Title */}
        <div className="homework-title-section">
          <h1>Homework Support</h1>

          <p>
            Confirm your child's attendance
          </p>
        </div>

        {/* Session Information */}
        <div className="homework-session-info">

          <div className="homework-info-row">
            <div>
              <span className="homework-info-label">
                Session
              </span>

              <strong>
                {homeworkTitle} — Week {weekNumber}
              </strong>
            </div>
          </div>

          <div className="homework-info-row">
            <div>
              <span className="homework-info-label">
                Date
              </span>

              <strong>
                {sessionDate}
              </strong>
            </div>
          </div>

          <div className="homework-info-row">
            <div>
              <span className="homework-info-label">
                Student
              </span>

              <strong className="student-name">
                {studentName}
              </strong>
            </div>
          </div>

        </div>

        {/* Attendance Question */}
        <div className="homework-attendance-section">

          <h2>
            Will {studentName} be attending
            Homework Support?
          </h2>

          <p className="attendance-subtitle">
            Please select an option below.
          </p>

          <div className="homework-actions">

            <button
              type="button"
              className="homework-attend-button"
              onClick={() => {
                console.log("Attendance: attending");
              }}
            >
              Yes, my child will attend
              <span className="button-arrow">→</span>
            </button>

            <button
              type="button"
              className="homework-not-attend-button"
              onClick={() => {
                console.log("Attendance: not attending");
              }}
            >
              No, my child will not attend
              <span className="button-arrow">→</span>
            </button>

          </div>

          {/* Existing Response */}
          <button
            type="button"
            className="homework-existing-response"
            onClick={() => {
              console.log("View/change response");
            }}
          >
            Already responded? View or change response
          </button>

        </div>

      </section>

      {/* Footer Message */}
      <p className="homework-footer-message">
        Secure. Trusted. Built for Gem Kids.
      </p>

    </main>
  );
}

export default HomeworkBooking;