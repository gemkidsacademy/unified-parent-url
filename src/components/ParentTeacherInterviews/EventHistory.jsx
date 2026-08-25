import { useState } from "react";
import "./EventHistory.css";

const events = [
  {
    id: "term-3-2026",
    name: "Term 3 Parent–Teacher Interviews 2026",
    date: "18 September 2026",
    location: "Marsden Park Centre",
    teachers: 3,
    students: 24,
    booked: 18,
    notBooked: 6,
  },
  {
    id: "term-2-2026",
    name: "Term 2 Parent–Teacher Interviews 2026",
    date: "26 June 2026",
    location: "Marsden Park Centre",
    teachers: 3,
    students: 22,
    booked: 20,
    notBooked: 2,
  },
];

const historicalBookings = [
  {
    teacher: "Mrs Sarah Johnson",
    className: "Selective",
    student: "Oliver Brown",
    parent: "Emma Brown",
    status: "Booked",
    time: "6:45 PM – 6:55 PM",
  },
  {
    teacher: "Mrs Sarah Johnson",
    className: "Selective",
    student: "Sophie Wilson",
    parent: "James Wilson",
    status: "Booked",
    time: "6:00 PM – 6:10 PM",
  },
  {
    teacher: "Mrs Emily Williams",
    className: "Foundation",
    student: "Liam Taylor",
    parent: "Sarah Taylor",
    status: "Not Booked",
    time: "—",
  },
];

function EventHistory() {
  const [selectedEventId, setSelectedEventId] =
    useState(events[0].id);

  const selectedEvent =
    events.find((event) => event.id === selectedEventId) ||
    events[0];

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
            <strong>{selectedEvent.date}</strong>
          </div>

          <div>
            <span>Location</span>
            <strong>{selectedEvent.location}</strong>
          </div>

        </div>

        <div className="history-summary">

          <div>
            <strong>{selectedEvent.teachers}</strong>
            <span>Teachers</span>
          </div>

          <div>
            <strong>{selectedEvent.students}</strong>
            <span>Students</span>
          </div>

          <div>
            <strong>{selectedEvent.booked}</strong>
            <span>Booked</span>
          </div>

          <div>
            <strong>{selectedEvent.notBooked}</strong>
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
              key={`${booking.student}-${index}`}
            >
              <span>{booking.teacher}</span>
              <span>{booking.className}</span>
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

              <span>{booking.time}</span>
            </div>
          ))}

        </div>

      </section>

    </div>
  );
}

export default EventHistory;