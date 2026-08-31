import { useEffect, useState } from "react";
import "./EventHistory.css";
import { API_BASE_URL } from "../../config/api";

const formatTime = (timeValue) => {
  if (!timeValue) return "—";

  const [hours, minutes] = timeValue.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";

  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${period}`;
};

const formatBookingTime = (startTime, endTime) => {
  if (!startTime || !endTime) return "—";

  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
};

function EventHistory() {
  const interviewAdmin = (() => {
    try {
      return JSON.parse(localStorage.getItem("interviewAdminData") || "null") || {};
    } catch {
      return {};
    }
  })();
  const centerCode = interviewAdmin.center_code || "";
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [historicalBookings, setHistoricalBookings] = useState([]);
  const [eventSummary, setEventSummary] = useState(null);

  useEffect(() => {
    const loadCompletedEvents = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/parent-teacher-interview/completed-events?center_code=${encodeURIComponent(centerCode)}`
        );

        if (!response.ok) {
          throw new Error(`Unable to load completed events (${response.status})`);
        }

        const data = await response.json();
        const completedEvents = data.events || [];

        setEvents(completedEvents);
        setSelectedEventId(completedEvents[0]?.id ?? "");
      } catch (error) {
        console.error("Unable to load completed interview events:", error);
        setEvents([]);
        setSelectedEventId("");
      }
    };

    loadCompletedEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setHistoricalBookings([]);
      return;
    }

    const loadHistoricalBookings = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/parent-teacher-interview/completed-events/${encodeURIComponent(selectedEventId)}/bookings?center_code=${encodeURIComponent(centerCode)}`
        );

        if (!response.ok) {
          throw new Error(`Unable to load historical bookings (${response.status})`);
        }

        const data = await response.json();

        setHistoricalBookings(data.bookings || []);
      } catch (error) {
        console.error("Unable to load historical bookings:", error);
        setHistoricalBookings([]);
      }
    };

    loadHistoricalBookings();
  }, [selectedEventId, centerCode]);

  useEffect(() => {
    if (!selectedEventId) {
      setEventSummary(null);
      return;
    }

    const loadEventSummary = async () => {
      try {
        console.log("[EVENT HISTORY] Loading summary", {
          selectedEventId,
          centerCode,
        });

        const summaryUrl =
          `${API_BASE_URL}/parent-teacher-interview/completed-events/${encodeURIComponent(selectedEventId)}/summary?center_code=${encodeURIComponent(centerCode)}`;

        console.log("[EVENT HISTORY] Summary URL:", summaryUrl);

        const response = await fetch(summaryUrl);

        console.log("[EVENT HISTORY] Summary response status:", response.status);

        if (!response.ok) {
          throw new Error(`Unable to load event summary (${response.status})`);
        }

        const data = await response.json();
        console.log("[EVENT HISTORY] Summary response data:", data);
        console.log("[EVENT HISTORY] Setting summary:", {
          teachers: data.teachers,
          students: data.students,
          booked: data.booked,
          not_booked: data.not_booked,
        });
        setEventSummary(data);
      } catch (error) {
        console.error("[EVENT HISTORY] Summary request failed:", error);
        setEventSummary(null);
      }
    };

    loadEventSummary();
  }, [selectedEventId, centerCode]);

  const selectedEvent =
    events.find((event) => String(event.id) === String(selectedEventId)) ||
    events[0] ||
    {};

  return (
    <div className="event-history-page">

      <div className="history-intro">
        <span className="history-eyebrow">
          DEMO VIEW
        </span>

        <h2>Event History</h2>

        <p>
          View previous Parent–Teacher Interview events
          and their historical booking records.
        </p>
      </div>

      <section className="history-card">

        <label className="history-event-select">
          <span>Select Event</span>

          <select
            value={selectedEventId}
            onChange={(event) =>
              setSelectedEventId(event.target.value)
            }
          >
            {events.map((event) => (
              <option
                key={event.id}
                value={event.id}
              >
                {event.name}
              </option>
            ))}
          </select>
        </label>

      </section>

      <section className="history-card">

        <div className="history-event-heading">
          <div>
            <span className="completed-badge">
              COMPLETED EVENT
            </span>

            <h3>{selectedEvent.name}</h3>
          </div>
        </div>

        <div className="history-details">

          <div>
            <span>Date</span>
            <strong>{selectedEvent.event_date}</strong>
          </div>

          <div>
            <span>Location</span>
            <strong>{selectedEvent.location}</strong>
          </div>

        </div>

        <div className="history-summary">

          <div>
            <strong>{eventSummary?.teachers}</strong>
            <span>Teachers</span>
          </div>

          <div>
            <strong>{eventSummary?.students}</strong>
            <span>Slots</span>
          </div>

          <div>
            <strong>{eventSummary?.booked}</strong>
            <span>Booked</span>
          </div>

          <div>
            <strong>{eventSummary?.not_booked}</strong>
            <span>Not Booked</span>
          </div>

        </div>

      </section>

      <section className="history-card">

        <div className="history-table-heading">
          <div>
            <h3>Historical Bookings</h3>
            <p>
              Booking information remains available after
              the event has been completed.
            </p>
          </div>
        </div>

        <div className="history-table">

          <div className="history-table-header">
            <span>Teacher</span>
            <span>Class</span>
            <span>Student</span>
            <span>Parent</span>
            <span>Status</span>
            <span>Interview Time</span>
          </div>

          {historicalBookings.map((booking, index) => (
            <div
              className="history-table-row"
              key={booking.booking_id ?? `${booking.student}-${index}`}
            >
              <span>{booking.teacher}</span>
              <span>{booking.class_name}</span>
              <span>{booking.student}</span>
              <span>{booking.parent}</span>

              <span>
                <span
                  className={`history-status ${
                    booking.status === "Booked"
                      ? "booked"
                      : "not-booked"
                  }`}
                >
                  {booking.status}
                </span>
              </span>

              <span>
                {formatBookingTime(booking.start_time, booking.end_time)}
              </span>
            </div>
          ))}

          {historicalBookings.length === 0 && (
            <div className="history-table-row">
              <span>No historical bookings found.</span>
            </div>
          )}

        </div>

      </section>

    </div>
  );
}

export default EventHistory;