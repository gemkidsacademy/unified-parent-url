import { useState } from "react";
import "./ParentDashboard.css";
import "./ParentTeacherInterviews.css";

function ParentTeacherInterviews({ parentData, onBack }) {
  const studentName = parentData?.students?.[0]?.name || "Oliver Brown";
  const studentClass = parentData?.students?.[0]?.className || "Year 5";
  const [selectedSlot, setSelectedSlot] = useState("");
  const [booking, setBooking] = useState(null);
  const [isChangingTime, setIsChangingTime] = useState(false);
  const [bookedSlots, setBookedSlots] = useState(new Set(["6:30 PM"]));
  const [showChangeConfirmation, setShowChangeConfirmation] = useState(false);

  const eventDetails = [
    ["Date", "Friday, 18 September 2026"],
    ["Location", "Marsden Park Centre"],
    ["Teacher", "Mrs Sarah Johnson"],
    ["Booking status", booking ? "Booked" : "Not booked"],
  ];

  const timeSlots = [
    { time: "6:00 PM", endTime: "6:10 PM", status: "Available" },
    { time: "6:15 PM", endTime: "6:25 PM", status: "Available" },
    { time: "6:30 PM", endTime: "6:40 PM", status: "Booked" },
    { time: "6:45 PM", endTime: "6:55 PM", status: "Available" },
  ];

  const getSlot = (time) => timeSlots.find((slot) => slot.time === time);
  const selectedSlotDetails = getSlot(selectedSlot);
  const otherAvailableSlots = timeSlots.filter(
    (slot) =>
      slot.status === "Available" &&
      !bookedSlots.has(slot.time) &&
      slot.time !== booking?.time
  );

  const confirmInterview = () => {
    if (!selectedSlotDetails) return;

    setBookedSlots((currentSlots) => new Set([...currentSlots, selectedSlotDetails.time]));
    setBooking({
      time: selectedSlotDetails.time,
      endTime: selectedSlotDetails.endTime,
    });
    setIsChangingTime(false);
  };

  const changeInterviewTime = () => {
    setSelectedSlot(booking.time);
    setIsChangingTime(true);
    setShowChangeConfirmation(false);
  };

  const confirmChange = () => {
    if (!booking || !selectedSlotDetails || selectedSlotDetails.time === booking.time) {
      return;
    }

    setBookedSlots((currentSlots) => {
      const updatedSlots = new Set(currentSlots);
      updatedSlots.delete(booking.time);
      updatedSlots.add(selectedSlotDetails.time);
      return updatedSlots;
    });
    setBooking(selectedSlotDetails);
    setSelectedSlot("");
    setIsChangingTime(false);
    setShowChangeConfirmation(false);
  };

  return (
    <div className="parent-dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div className="academy-brand">
            <img
              src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
              alt="Gem Kids Academy"
              className="academy-logo"
            />
          </div>

          <button type="button" className="logout-button" onClick={onBack}>
            <span className="logout-icon">←</span>
            Back to dashboard
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-welcome">
          <div className="welcome-left">
            <span className="welcome-wave">👩‍🏫</span>
            <div>
              <h1>Parent–Teacher Interviews</h1>
              <p>Choose a convenient time to meet your child's teacher.</p>
            </div>
          </div>
        </section>

        <section className="interview-panel">
          <div className="interview-event-heading">
            <div className="interview-event-icon">📅</div>
            <div>
              <span className="interview-eyebrow">Upcoming interview</span>
              <h2>Term 3 Parent–Teacher Interviews 2026</h2>
              <p>Student: {studentName} · {studentClass}</p>
            </div>
          </div>

          <dl className="interview-details">
            {eventDetails.map(([label, value]) => (
              <div className="interview-detail" key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          {!booking || isChangingTime ? (
            <div className="interview-slots">
              <h3>Choose an available time</h3>
              <div className="time-slot-list">
                {timeSlots.map((slot) => {
                  const isCurrentBooking = booking?.time === slot.time;
                  const isBooked = bookedSlots.has(slot.time) && !isCurrentBooking;
                  const isSelected = selectedSlot === slot.time;

                  return (
                    <button
                      type="button"
                      key={slot.time}
                      className={`time-slot ${isBooked ? "booked" : ""} ${
                        isSelected ? "selected" : ""
                      }`}
                      disabled={isBooked}
                      onClick={() => {
                        if (!isBooked) setSelectedSlot(slot.time);
                      }}
                    >
                      <span>{slot.time}</span>
                      <span className="slot-status">
                        {isCurrentBooking ? "Current booking" : isBooked ? "Booked" : slot.status}
                      </span>
                    </button>
                  );
                })}
              </div>

              {isChangingTime && otherAvailableSlots.length === 0 && (
                <p className="no-other-slots">
                  No other interview times are currently available. Your existing booking will remain unchanged.
                </p>
              )}

              {selectedSlotDetails && (
                <div className="interview-confirmation">
                  <div>
                    <span className="confirmation-label">Your selected time</span>
                    <strong>
                      {selectedSlotDetails.time} – {selectedSlotDetails.endTime}
                    </strong>
                  </div>
                  <button
                    type="button"
                    className="confirm-interview-button"
                    onClick={booking ? () => setShowChangeConfirmation(true) : confirmInterview}
                  >
                    Confirm Interview <span>→</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="existing-booking-view">
              <div className="interview-success" role="status">
                <strong>Interview booked successfully</strong>
                <div className="booking-confirmation-details">
                  <span>Student: {studentName}</span>
                  <span>Teacher: Mrs Sarah Johnson</span>
                  <span>Date: Friday, 18 September 2026</span>
                  <span>Time: {booking.time} – {booking.endTime}</span>
                  <span>Location: Marsden Park Centre</span>
                </div>
                <p>A confirmation email has been sent to you.</p>
              </div>

              <div className="booked-interview-card">
                <h3>Your interview is booked</h3>
                <dl>
                  <div><dt>Student</dt><dd>{studentName}</dd></div>
                  <div><dt>Teacher</dt><dd>Mrs Sarah Johnson</dd></div>
                  <div><dt>Date</dt><dd>Friday, 18 September 2026</dd></div>
                  <div><dt>Interview time</dt><dd>{booking.time} – {booking.endTime}</dd></div>
                  <div><dt>Location</dt><dd>Marsden Park Centre</dd></div>
                </dl>
                <button
                  type="button"
                  className="confirm-interview-button"
                  onClick={changeInterviewTime}
                >
                  Change Interview Time
                </button>
              </div>
            </div>
          )}
        </section>

        {showChangeConfirmation && (
          <div className="interview-change-modal-overlay">
            <div className="interview-change-modal" role="dialog" aria-modal="true">
              <button
                type="button"
                className="interview-change-modal-close"
                onClick={() => setShowChangeConfirmation(false)}
                aria-label="Close change confirmation"
              >
                ×
              </button>
              <span className="interview-eyebrow">Change interview time</span>
              <h2>Confirm your new interview time?</h2>
              <p>Your current booking will be released and the new time will be reserved.</p>
              <div className="interview-time-comparison">
                <span>Current: {booking?.time}</span>
                <span>New: {selectedSlotDetails?.time}</span>
              </div>
              <div className="interview-change-modal-actions">
                <button
                  type="button"
                  className="interview-cancel-button"
                  onClick={() => setShowChangeConfirmation(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="confirm-interview-button"
                  onClick={confirmChange}
                >
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          className="tool-button parent-teacher-button"
          onClick={onBack}
        >
          <span>Back to dashboard</span>
          <span>←</span>
        </button>
      </main>
    </div>
  );
}

export default ParentTeacherInterviews;
