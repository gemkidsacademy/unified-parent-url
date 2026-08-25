import { useState } from "react";
import "./ParentTeacherInterviews.css";

const DEMO_EVENT = {
  name: "Term 3 Parent–Teacher Interviews 2026",
  date: "Wednesday, 16 September 2026",
  location: "Marsden Park Campus",

  student: {
    name: "Sarah Smith",
    className: "Year 5 – Selective",
  },

  teacher: {
    name: "Emily Johnson",
  },
};

const INITIAL_SLOTS = [
  {
    id: 1,
    time: "6:00 PM – 6:10 PM",
    status: "available",
  },
  {
    id: 2,
    time: "6:15 PM – 6:25 PM",
    status: "available",
  },
  {
    id: 3,
    time: "6:30 PM – 6:40 PM",
    status: "booked",
  },
  {
    id: 4,
    time: "6:45 PM – 6:55 PM",
    status: "available",
  },
];

function ParentTeacherInterviews({ onBack }) {
  const [slots, setSlots] = useState(INITIAL_SLOTS);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [booking, setBooking] = useState(null);
  const [showChangeConfirmation, setShowChangeConfirmation] =
    useState(false);

  const handleSelectSlot = (slot) => {
    if (slot.status === "booked") {
      return;
    }

    setSelectedSlot(slot);
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot) {
      return;
    }

    setSlots((currentSlots) =>
      currentSlots.map((slot) =>
        slot.id === selectedSlot.id
          ? { ...slot, status: "booked" }
          : slot
      )
    );

    setBooking(selectedSlot);
    setSelectedSlot(null);
  };

  const handleStartChangeBooking = () => {
    setSelectedSlot(null);
    setShowChangeConfirmation(false);
  };

  const handleConfirmChange = () => {
    if (!selectedSlot || !booking) {
      return;
    }

    setSlots((currentSlots) =>
      currentSlots.map((slot) => {
        if (slot.id === booking.id) {
          return {
            ...slot,
            status: "available",
          };
        }

        if (slot.id === selectedSlot.id) {
          return {
            ...slot,
            status: "booked",
          };
        }

        return slot;
      })
    );

    setBooking(selectedSlot);
    setSelectedSlot(null);
    setShowChangeConfirmation(false);
  };

  const availableSlots = slots.filter(
    (slot) => slot.status === "available"
  );

  return (
    <div className="pti-page">

      {/* HEADER */}
      <div className="pti-header">

        <button
          type="button"
          className="pti-back-button"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>

        <div className="pti-header-content">
          <div className="pti-header-icon">
            📅
          </div>

          <div>
            <h1>Parent–Teacher Interviews</h1>

            <p>
              Book and manage your upcoming interview
              with your teacher.
            </p>
          </div>
        </div>

      </div>

      {/* EVENT INFORMATION */}
      <section className="pti-event-card">

        <div className="pti-event-heading">
          <div>
            <span className="pti-label">
              INTERVIEW EVENT
            </span>

            <h2>{DEMO_EVENT.name}</h2>
          </div>

          {booking && (
            <div className="pti-booked-badge">
              ✓ Booking Confirmed
            </div>
          )}
        </div>

        <div className="pti-event-details">

          <div className="pti-detail">
            <span className="pti-detail-icon">📅</span>

            <div>
              <span className="pti-detail-label">
                Date
              </span>

              <strong>{DEMO_EVENT.date}</strong>
            </div>
          </div>

          <div className="pti-detail">
            <span className="pti-detail-icon">📍</span>

            <div>
              <span className="pti-detail-label">
                Location
              </span>

              <strong>{DEMO_EVENT.location}</strong>
            </div>
          </div>

        </div>

      </section>

      {/* STUDENT / TEACHER */}
      <section className="pti-people-grid">

        <div className="pti-person-card">

          <div className="pti-person-icon student">
            👨‍🎓
          </div>

          <div>
            <span className="pti-person-label">
              STUDENT
            </span>

            <h3>{DEMO_EVENT.student.name}</h3>

            <p>{DEMO_EVENT.student.className}</p>
          </div>

        </div>

        <div className="pti-person-card">

          <div className="pti-person-icon teacher">
            👩‍🏫
          </div>

          <div>
            <span className="pti-person-label">
              TEACHER
            </span>

            <h3>{DEMO_EVENT.teacher.name}</h3>

            <p>Your allocated teacher</p>
          </div>

        </div>

      </section>

      {/* EXISTING BOOKING */}
      {booking && (
        <section className="pti-current-booking">

          <div className="pti-success-icon">
            ✓
          </div>

          <div className="pti-current-booking-content">

            <span className="pti-label">
              YOUR CURRENT BOOKING
            </span>

            <h2>
              {booking.time}
            </h2>

            <p>
              Your interview with{" "}
              <strong>
                {DEMO_EVENT.teacher.name}
              </strong>{" "}
              is confirmed.
            </p>

          </div>

          <button
            type="button"
            className="pti-secondary-button"
            onClick={handleStartChangeBooking}
          >
            Change Booking
          </button>

        </section>
      )}

      {/* SLOT SELECTION */}
      <section className="pti-slots-section">

        <div className="pti-section-heading">

          <div>
            <span className="pti-label">
              {booking
                ? "CHANGE YOUR INTERVIEW TIME"
                : "SELECT YOUR INTERVIEW TIME"}
            </span>

            <h2>
              Available interview times
            </h2>
          </div>

          <div className="pti-slot-count">
            {availableSlots.length} available
          </div>

        </div>

        {booking && (
          <div className="pti-change-notice">
            <span>ℹ️</span>

            <p>
              Select a different available time.
              Your current booking will remain unchanged
              until you confirm the new time.
            </p>
          </div>
        )}

        <div className="pti-slots-grid">

          {slots.map((slot) => {

            const isCurrentBooking =
              booking?.id === slot.id;

            const isSelected =
              selectedSlot?.id === slot.id;

            const isBooked =
              slot.status === "booked" &&
              !isCurrentBooking;

            return (
              <button
                key={slot.id}
                type="button"
                className={[
                  "pti-slot",
                  isSelected ? "selected" : "",
                  isBooked ? "booked" : "",
                  isCurrentBooking
                    ? "current"
                    : "",
                ].join(" ")}
                disabled={isBooked}
                onClick={() =>
                  handleSelectSlot(slot)
                }
              >

                <span className="pti-slot-time">
                  {slot.time}
                </span>

                <span className="pti-slot-status">

                  {isCurrentBooking
                    ? "Current booking"
                    : isSelected
                    ? "✓ Selected"
                    : isBooked
                    ? "Booked"
                    : "Available"}

                </span>

              </button>
            );
          })}

        </div>

        {/* CONFIRM BUTTON */}
        {selectedSlot && !booking && (
          <div className="pti-action-area">

            <div>
              <span>
                Selected time
              </span>

              <strong>
                {selectedSlot.time}
              </strong>
            </div>

            <button
              type="button"
              className="pti-primary-button"
              onClick={handleConfirmBooking}
            >
              Confirm Interview →
            </button>

          </div>
        )}

        {/* CHANGE BUTTON */}
        {selectedSlot && booking && (
          <div className="pti-action-area">

            <div>
              <span>
                New interview time
              </span>

              <strong>
                {selectedSlot.time}
              </strong>
            </div>

            <button
              type="button"
              className="pti-primary-button"
              onClick={() =>
                setShowChangeConfirmation(true)
              }
            >
              Continue →
            </button>

          </div>
        )}

        {/* NO OTHER SLOT */}
        {booking && availableSlots.length === 0 && (
          <div className="pti-no-slots">

            <div className="pti-no-slots-icon">
              !
            </div>

            <div>
              <h3>
                No other interview times are available
              </h3>

              <p>
                Your existing booking will remain
                unchanged.
              </p>
            </div>

          </div>
        )}

      </section>

      {/* CHANGE CONFIRMATION MODAL */}
      {showChangeConfirmation && (
        <div className="pti-modal-overlay">

          <div className="pti-modal">

            <button
              type="button"
              className="pti-modal-close"
              onClick={() =>
                setShowChangeConfirmation(false)
              }
            >
              ×
            </button>

            <div className="pti-modal-icon">
              ↔
            </div>

            <h2>
              Change interview time?
            </h2>

            <p>
              Your current booking will be released
              and the new time will be reserved.
            </p>

            <div className="pti-time-comparison">

              <div>
                <span>
                  CURRENT BOOKING
                </span>

                <strong>
                  {booking?.time}
                </strong>
              </div>

              <div className="pti-arrow">
                →
              </div>

              <div>
                <span>
                  NEW BOOKING
                </span>

                <strong>
                  {selectedSlot?.time}
                </strong>
              </div>

            </div>

            <div className="pti-modal-actions">

              <button
                type="button"
                className="pti-cancel-button"
                onClick={() =>
                  setShowChangeConfirmation(false)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="pti-primary-button"
                onClick={handleConfirmChange}
              >
                Confirm Change
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default ParentTeacherInterviews;