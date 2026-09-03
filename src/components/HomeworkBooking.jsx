import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
import "./HomeworkBooking.css";
function HomeworkBooking({ parentData, onBack }) {
  // Main data state
  const [bookingData, setBookingData] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [error, setError] = useState(null);

  // Flow state
  const [flowState, setFlowState] = useState("initial");
  // "initial", "attendance", "selecting_time_slot",
  // "not_attending", "confirmation", "existing_booking"
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [existingBookingSlot, setExistingBookingSlot] = useState(null);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notAttendingSaved, setNotAttendingSaved] = useState(false);

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchBookingData = async () => {
      if (!parentData?.email) {
        setError(
          "Parent email is missing. Please return to the dashboard and log in again."
        );
        setLoadingDashboard(false);
        return;
      }

      try {
        setLoadingDashboard(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/homework-support/parent/dashboard`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              parent_email: parentData.email,
            }),
          }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              "Unable to load Homework Support information. Please try again."
          );
        }

        setBookingData(data);

        if (
          data.response === "ATTENDING" &&
          data.selected_time_slot_id
        ) {
          const slotsResponse = await fetch(
            `${API_BASE_URL}/homework-support/parent/time-slots`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                parent_email: parentData.email,
              }),
            }
          );

          if (slotsResponse.ok) {
            const slotsData = await slotsResponse.json();

            const bookedSlot = (slotsData.time_slots || []).find(
              (slot) =>
                slot.id === data.selected_time_slot_id
            );

            setExistingBookingSlot(bookedSlot || null);
          } else {
            setExistingBookingSlot(null);
          }

          setFlowState("existing_booking");
        } else {
          setFlowState("attendance");
        }
      } catch (err) {
        console.error(
          "Error fetching homework booking data:",
          err
        );

        setError(
          err.message ||
            "Unable to load Homework Support information. Please try again."
        );
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchBookingData();
  }, [parentData?.email]);

  // Handler for "No, will not attend"
  const handleNotAttending = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/homework-support/parent/response`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            parent_email: parentData?.email,
            response: "NOT_ATTENDING",
            selected_time_slot_id: null,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || "Unable to submit your response."
        );
      }

      const data = await response.json();

      console.log(
        "Homework Support NOT_ATTENDING response submitted:",
        data
      );

      setNotAttendingSaved(true);

    } catch (err) {
      console.error(
        "Error submitting NOT_ATTENDING response:",
        err
      );
      setError(
        err.message || "Unable to submit your response."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Handler for "Yes, will attend" - fetch time slots
  const handleWillAttend = async () => {
    try {
      setLoadingTimeSlots(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/homework-support/parent/time-slots`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            parent_email: parentData?.email,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData?.detail || "Unable to load available time slots. Please try again."
        );
      }

      const data = await response.json();
      setTimeSlots(data.time_slots || []);
      setFlowState("selecting_time_slot");
    } catch (err) {
      console.error("Error fetching time slots:", err);
      setError(
        err.message || "Unable to load available time slots. Please try again."
      );
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  // Handler for confirming booking with selected time slot
  const handleConfirmBooking = async () => {
    if (!selectedSlotId) {
      setError("Please select a time slot.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/homework-support/parent/response`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            parent_email: parentData?.email,
            response: "ATTENDING",
            selected_time_slot_id: selectedSlotId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData?.detail || "Unable to confirm booking. Please try again."
        );
      }

      // Update bookingData with the new response
      setBookingData((prev) => ({
        ...prev,
        response: "ATTENDING",
        selected_time_slot_id: selectedSlotId,
      }));

      setFlowState("confirmation");
    } catch (err) {
      console.error("Error confirming booking:", err);
      setError(
        err.message || "Unable to confirm booking. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Get the selected time slot details for display
  const getSelectedSlotDetails = () => {
    return timeSlots.find((slot) => slot.id === selectedSlotId);
  };

  const studentName = bookingData?.student_name || "Student";
  const homeworkTitle = bookingData?.title || "Homework Support";
  const weekNumber = bookingData?.week_number || 5;
  const sessionDate = bookingData?.session_date || "Saturday, September 12, 2026";

  return (
    <main
      className="homework-booking-page"
      style={{
        width: "100%",
        height: "100dvh",
        maxHeight: "100dvh",
        overflowY: "scroll",
        overflowX: "hidden",
        boxSizing: "border-box",
        flex: "1 1 auto",
        minHeight: 0,
        scrollbarWidth: "auto",
        scrollbarColor: "#666 #e5e7eb",
      }}
    >

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

        {/* Loading Dashboard State */}
        {loadingDashboard && (
          <div className="homework-loading">
            <p>Loading Homework Support...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loadingDashboard && (
          <div className="homework-error">
            <p>{error}</p>
          </div>
        )}

        {/* Content - Only show when not loading and no error */}
        {!loadingDashboard && !error && bookingData && (
          <>
            {/* ===== EXISTING BOOKING ===== */}
            {flowState === "existing_booking" && (
              <div className="homework-response-confirmation">
                <div className="confirmation-header">
                  <h2>Booking Confirmed</h2>
                </div>

                <div className="confirmation-message">
                  <p className="thank-you">
                    Your Homework Support booking is already confirmed.
                  </p>

                  <p className="confirmation-text">
                    {studentName} is booked for Homework Support this week.
                  </p>
                </div>

                <div className="confirmation-details">
                  <div className="homework-info-row">
                    <span className="homework-info-label">
                      Session
                    </span>

                    <strong>
                      {homeworkTitle}
                    </strong>
                  </div>

                  <div className="homework-info-row">
                    <span className="homework-info-label">
                      Date
                    </span>

                    <strong>
                      {sessionDate}
                    </strong>
                  </div>

                  <div className="homework-info-row">
                    <span className="homework-info-label">
                      Time
                    </span>

                    <strong>
                      {existingBookingSlot
                        ? `${existingBookingSlot.start_time} - ${existingBookingSlot.end_time}`
                        : "Booking time unavailable"}
                    </strong>
                  </div>

                  <div className="homework-info-row">
                    <span className="homework-info-label">
                      Student
                    </span>

                    <strong className="student-name">
                      {studentName}
                    </strong>
                  </div>
                </div>

                <div className="confirmation-actions">
                  <button
                    type="button"
                    className="homework-back-link"
                    onClick={onBack}
                  >
                    ← Back to dashboard
                  </button>
                </div>
              </div>
            )}

            {/* ===== ATTENDANCE SCREEN ===== */}
            {notAttendingSaved ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "45px 25px",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 18px",
                    color: "#30206d",
                    fontSize: "26px",
                  }}
                >
                  Response Saved
                </h2>

                <p
                  style={{
                    margin: "0 0 12px",
                    color: "#147f78",
                    fontSize: "18px",
                    fontWeight: "600",
                  }}
                >
                  Your response has been saved successfully.
                </p>

                <p
                  style={{
                    margin: "0 0 28px",
                    color: "#57526d",
                    fontSize: "15px",
                    lineHeight: "1.5",
                  }}
                >
                  You have indicated that {studentName} will not attend
                  Homework Support this week.
                </p>

                <button
                  type="button"
                  className="homework-back-link"
                  onClick={() => setNotAttendingSaved(false)}
                >
                  Change response
                </button>

                <br />

                <button
                  type="button"
                  className="homework-back-link"
                  onClick={onBack}
                  style={{ marginTop: "16px" }}
                >
                  ← Back to dashboard
                </button>
              </div>
            ) : (
              flowState === "attendance" && (
                <>
                <div className="homework-title-section">
                  <h1>Homework Support</h1>
                  <p>Confirm your child's attendance</p>
                </div>

                <div className="homework-session-info">
                  <div className="homework-info-row">
                    <div>
                      <span className="homework-info-label">Session</span>
                      <strong>
                        {homeworkTitle} 
                      </strong>
                    </div>
                  </div>

                  <div className="homework-info-row">
                    <div>
                      <span className="homework-info-label">Date</span>
                      <strong>{sessionDate}</strong>
                    </div>
                  </div>

                  <div className="homework-info-row">
                    <div>
                      <span className="homework-info-label">Student</span>
                      <strong className="student-name">{studentName}</strong>
                    </div>
                  </div>
                </div>

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
                      onClick={handleWillAttend}
                      disabled={submitting}
                    >
                      Yes, my child will attend
                      <span className="button-arrow">→</span>
                    </button>

                    <button
                      type="button"
                      className="homework-not-attend-button"
                      onClick={handleNotAttending}
                      disabled={submitting}
                    >
                      {submitting
                        ? "Submitting..."
                        : "No, my child will not attend"}
                      <span className="button-arrow">→</span>
                    </button>
                  </div>
                </div>
                </>
              )
            )}

            {/* ===== TIME SLOT SELECTION SCREEN ===== */}
            {flowState === "selecting_time_slot" && (
              <>
                <div className="homework-title-section">
                  <h1>Homework Support</h1>
                  <p>Select a time slot</p>
                </div>

                {loadingTimeSlots && (
                  <div className="homework-loading">
                    <p>Loading available times...</p>
                  </div>
                )}

                {!loadingTimeSlots && timeSlots.length > 0 && (
                  <>
                    <div className="homework-session-info">
                      <div className="homework-info-row">
                        <div>
                          <span className="homework-info-label">Session</span>
                          <strong>
                            {homeworkTitle}
                          </strong>
                        </div>
                      </div>

                      <div className="homework-info-row">
                        <div>
                          <span className="homework-info-label">Date</span>
                          <strong>{sessionDate}</strong>
                        </div>
                      </div>

                      <div className="homework-info-row">
                        <div>
                          <span className="homework-info-label">Student</span>
                          <strong className="student-name">{studentName}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="homework-time-slots-section">
                      <h2>Available Time Slots</h2>

                      <div className="homework-time-slots-list">
                        {timeSlots.map((slot) => {
                          const isDisabled = slot.available_places <= 0;
                          const isSelected = selectedSlotId === slot.id;

                          return (
                            <button
                              key={slot.id}
                              type="button"
                              className={`homework-time-slot-button ${
                                isSelected ? "selected" : ""
                              } ${isDisabled ? "disabled" : ""}`}
                              onClick={() => {
                                if (!isDisabled) {
                                  setSelectedSlotId(slot.id);
                                }
                              }}
                              disabled={isDisabled}
                            >
                              <div className="slot-time">
                                {slot.start_time} - {slot.end_time}
                              </div>
                              <div className="slot-capacity">
                                {slot.available_places > 0
                                  ? `${slot.available_places} place${
                                      slot.available_places !== 1 ? "s" : ""
                                    } available`
                                  : "Fully booked"}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="homework-confirm-booking">
                        <button
                          type="button"
                          className="homework-confirm-button"
                          onClick={handleConfirmBooking}
                          disabled={!selectedSlotId || submitting}
                        >
                          {submitting ? "Confirming Booking..." : "Confirm Booking"}
                          <span className="button-arrow">→</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {!loadingTimeSlots && timeSlots.length === 0 && (
                  <div className="homework-no-slots">
                    <p>No available time slots at this time.</p>
                    <button
                      type="button"
                      className="homework-back-link"
                      onClick={() => setFlowState("attendance")}
                    >
                      ← Back to attendance options
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ===== ATTENDING CONFIRMATION ===== */}
            {flowState === "confirmation" && bookingData?.response === "ATTENDING" && (
              <div className="homework-response-confirmation">
                <div className="confirmation-header">
                  <h2>Booking Confirmed</h2>
                </div>

                <div className="confirmation-message">
                  <p className="thank-you">Thank you for confirming attendance.</p>

                  <p className="confirmation-text">
                    {studentName} is booked for Homework Support this week.
                  </p>

                  <p className="submission-status">
                    Your booking has been confirmed successfully.
                  </p>
                </div>

                <div className="confirmation-details">
                  <div className="homework-info-row">
                    <span className="homework-info-label">Session</span>
                    <strong>
                      {homeworkTitle} 
                    </strong>
                  </div>
                  <div className="homework-info-row">
                    <span className="homework-info-label">Date</span>
                    <strong>{sessionDate}</strong>
                  </div>
                </div>

                <div className="confirmation-actions">
                  <button
                    type="button"
                    className="homework-back-link"
                    onClick={onBack}
                  >
                    ← Back to dashboard
                  </button>
                </div>
              </div>
            )}
          </>
        )}

      </section>

      {/* Footer Message */}
      <p className="homework-footer-message">
        Secure. Trusted. Built for Gem Kids.
      </p>

    </main>
  );
}

export default HomeworkBooking;