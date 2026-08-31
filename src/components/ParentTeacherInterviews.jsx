import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
import "./ParentDashboard.css";
import "./ParentTeacherInterviews.css";

// Picks the first event that hasn't happened yet, falling back to the
// first event returned when every event is in the past (or none is).
const findCurrentEvent = (eventsList) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    eventsList.find((event) => {
      if (!event?.event_date) return false;
      return new Date(`${event.event_date}T00:00:00`) >= today;
    }) ||
    eventsList[0] ||
    null
  );
};

const formatSlotTime = (timeValue) => {
  const [hours, minutes] = String(timeValue || "")
    .split(":")
    .map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return "";
  }

  const period = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${period}`;
};

function ParentTeacherInterviews({ parentData, onBack }) {
  const student = parentData?.student || null;

  const studentName = student?.name || "Not available";
  const studentClass = student?.class_name || "Not available";

  const studentId = student?.student_id || "";
  const parentEmail = student?.parent_email || "";

  const centerCode =
    student?.center_code ||
    parentData?.admin?.center_code ||
    "";

  console.log("PTI parentData:", parentData);
  console.log("PTI student:", student);
  console.log("PTI student center_code:", centerCode);
  console.log("PTI student_id:", studentId);
  console.log("PTI parent_email:", parentEmail);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(null);
  const [isChangingTime, setIsChangingTime] = useState(false);
  
  const [showChangeConfirmation, setShowChangeConfirmation] = useState(false);

  const [events, setEvents] = useState([]);
  // Not yet read in JSX — wired up for the teacher-allocation/time-slot step.
  // eslint-disable-next-line no-unused-vars
  const [slots, setSlots] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [existingBookings, setExistingBookings] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");
  
  useEffect(() => {
    console.log("PTI parentData:", parentData);
    console.log("PTI student:", parentData?.student);
    console.log(
      "PTI student center_code:",
      parentData?.student?.center_code
    );
    console.log(
      "PTI student_id:",
      parentData?.student?.student_id
    );
    console.log(
      "PTI parent_email:",
      parentData?.student?.parent_email
    );
  }, [parentData]);
  const currentEvent = findCurrentEvent(events);

  const bookedSlotIds = new Set(
    existingBookings
      .filter(
        (item) =>
          item.event_id === currentEvent?.id &&
          item.booking_status === "BOOKED"
      )
      .map((item) => item.slot_id)
  );

  
  useEffect(() => {
    let isCancelled = false;

    const loadInterviewData = async () => {
      console.log("PTI centerCode:", centerCode);

      if (!centerCode) {
        setLoading(false);
        setError("Missing center code for this student.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const eventsUrl = `${API_BASE_URL}/parent-teacher-interview/events?center_code=${encodeURIComponent(centerCode)}`;
        console.log("PTI events URL:", eventsUrl);

        const eventsResponse = await fetch(eventsUrl);

        if (!eventsResponse.ok) {
          throw new Error(`Unable to load events (${eventsResponse.status})`);
        }

        const eventsData = await eventsResponse.json();
        console.log("PTI events response:", eventsData);

        const loadedEvents = eventsData.events || [];
        console.log("PTI loaded events:", loadedEvents);

        if (isCancelled) return;
        setEvents(loadedEvents);

        const bookingsUrl = `${API_BASE_URL}/parent-teacher-interview/bookings?center_code=${encodeURIComponent(centerCode)}`;
        console.log("PTI bookings URL:", bookingsUrl);

        const bookingsResponse = await fetch(bookingsUrl);

        if (!bookingsResponse.ok) {
          throw new Error(`Unable to load bookings (${bookingsResponse.status})`);
        }

        const bookingsData = await bookingsResponse.json();
        console.log("PTI bookings response:", bookingsData);

        if (isCancelled) return;
        setExistingBookings(bookingsData.bookings || []);

        const selectedEvent = findCurrentEvent(loadedEvents);
        console.log("PTI selected event:", selectedEvent);

        if (selectedEvent?.id) {
          const availabilityUrl = `${API_BASE_URL}/parent-teacher-interview/slots?center_code=${encodeURIComponent(centerCode)}&event_id=${selectedEvent.id}`;
          console.log("PTI availability URL:", availabilityUrl);

          const availabilityResponse = await fetch(availabilityUrl);

          if (!availabilityResponse.ok) {
            throw new Error(
              `Unable to load teacher availability (${availabilityResponse.status})`
            );
          }

          const availabilityData = await availabilityResponse.json();
          console.log("PTI availability response:", availabilityData);

          if (isCancelled) return;
          setSlots(availabilityData.slots || []);
        } else {
          setSlots([]);
        }
      } catch (loadError) {
        console.error("PTI load error:", loadError);
        if (!isCancelled) {
          setError(loadError.message || "Unable to load interview data.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadInterviewData();

    return () => {
      isCancelled = true;
    };
  }, [centerCode]);

  useEffect(() => {
    console.log("PTI events:", events);
    console.log("PTI currentEvent:", currentEvent);
    console.log("PTI slots:", slots);
    console.log("PTI existingBookings:", existingBookings);
    console.log("PTI booking:", booking);
    console.log("PTI centerCode:", centerCode);
  }, [events, currentEvent, slots, existingBookings, booking, centerCode]);

  const eventDetails = [
    ["Date", currentEvent?.event_date || "Not available"],
    ["Location", currentEvent?.location || "Not available"],
    [
      "Teacher",
      slots.length > 0
        ? slots[0].teacher_name || "Not available"
        : "Not available",
    ],
    ["Booking status", booking ? "Booked" : "Not booked"],
  ];

  const timeSlots = slots
    .filter((slot) => slot.is_available === true)
    .map((slot) => ({
      id: slot.id,
      teacherId: slot.teacher_id,
      time: `${formatSlotTime(slot.start_time)} – ${formatSlotTime(
        slot.end_time
      )}`,
      status: "Available",
    }));

  const getSlot = (slotId) => timeSlots.find((slot) => slot.id === slotId);
  const selectedSlotDetails = getSlot(selectedSlot);
  const otherAvailableSlots = timeSlots.filter(
  (slot) =>
    slot.status === "Available" &&
    !bookedSlotIds.has(slot.id) &&
    slot.time !== booking?.time
);

  const confirmInterview = async () => {
  if (!selectedSlotDetails || !currentEvent?.id) {
    console.error("[PTI BOOKING] Missing booking selection", {
      eventId: currentEvent?.id,
      slotId: selectedSlotDetails?.id,
    });
    return;
  }

  const student = parentData?.student;

  if (!student?.student_id) {
    console.error("[PTI BOOKING] Missing student information", {
      studentId: student?.student_id,
      parentEmail: student?.parent_email,
    });
    setError("Student information is missing. Please log in as a parent.");
    return;
  }

  try {
    setError("");

    const bookingUrl = `${API_BASE_URL}/parent-teacher-interview/bookings`;
    const bookingPayload = {
      center_code: centerCode,
      event_id: currentEvent.id,
      slot_id: selectedSlotDetails.id,
      teacher_id: selectedSlotDetails.teacherId,
      student_id: student.student_id,
      parent_email: student.parent_email,
    };

    console.log("[PTI BOOKING] Creating booking", {
      eventId: currentEvent.id,
      slotId: selectedSlotDetails.id,
      teacherId: selectedSlotDetails.teacherId,
      studentId: student.student_id,
      centerCode,
      requestUrl: bookingUrl,
      requestPayload: bookingPayload,
    });

    const response = await fetch(bookingUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingPayload),
    });

    console.log("[PTI BOOKING] Response status:", response.status);

    const data = await response.json();

    console.log("[PTI BOOKING] Response body:", data);

    if (!response.ok) {
      throw new Error(
        data.detail || `Unable to book interview (${response.status})`
      );
    }

    setBooking({
      id: data.booking_id,
      eventId: data.event_id,
      slotId: data.slot_id,
      teacherId: data.teacher_id,
      studentId: data.student_id,
      time: selectedSlotDetails.time,
      teacherName: eventDetails.find(
        ([label]) => label === "Teacher"
      )?.[1],
    });

    setSelectedSlot(null);
    setIsChangingTime(false);

    const bookingsResponse = await fetch(
      `${API_BASE_URL}/parent-teacher-interview/bookings?center_code=${encodeURIComponent(
        centerCode
      )}`
    );

    if (bookingsResponse.ok) {
      const bookingsData = await bookingsResponse.json();
      setExistingBookings(bookingsData.bookings || []);
    }
  } catch (bookingError) {
    console.error("PTI booking error:", bookingError);
    setError(bookingError.message || "Unable to book interview.");
  }
};

  const changeInterviewTime = () => {
    setSelectedSlot(booking.slotId);
    setIsChangingTime(true);
    setShowChangeConfirmation(false);
  };

  const confirmChange = () => {
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
              <h2>{currentEvent?.name || "No upcoming interview event"}</h2>
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
                  const isCurrentBooking = booking?.slotId === slot.id;
                  const isBooked = bookedSlotIds.has(slot.id) && !isCurrentBooking;
                  const isSelected = selectedSlot === slot.id;

                  return (
                    <button
                      type="button"
                      key={slot.id}
                      className={`time-slot ${isBooked ? "booked" : ""} ${
                        isSelected ? "selected" : ""
                      }`}
                      disabled={isBooked}
                      onClick={() => {
                        if (!isBooked) setSelectedSlot(slot.id);
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
                      {selectedSlotDetails.time}
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
                  <span>
                    Teacher: {booking?.teacherName || "Not available"}
                  </span>
                  <span>
                    Date: {currentEvent?.event_date || "Not available"}
                  </span>
                  <span>
                    Time: {booking?.time}
                  </span>
                  <span>
                    Location: {currentEvent?.location || "Not available"}
                  </span>
                </div>
                <p>A confirmation email has been sent to you.</p>
              </div>

              <div className="booked-interview-card">
                <h3>Your interview is booked</h3>
                <dl>
                  <div>
                    <dt>Student</dt>
                    <dd>{studentName}</dd>
                  </div>

                  <div>
                    <dt>Teacher</dt>
                    <dd>{booking?.teacherName || "Not available"}</dd>
                  </div>

                  <div>
                    <dt>Date</dt>
                    <dd>{currentEvent?.event_date || "Not available"}</dd>
                  </div>

                  <div>
                    <dt>Interview time</dt>
                    <dd>
                      {booking?.time}
                    </dd>
                  </div>

                  <div>
                    <dt>Location</dt>
                    <dd>{currentEvent?.location || "Not available"}</dd>
                  </div>
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
