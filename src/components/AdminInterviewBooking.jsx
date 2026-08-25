import { useState } from "react";
import "./AdminInterviewBooking.css";
import TeacherAllocation from "./ParentTeacherInterviews/TeacherAllocation";
import InterviewReminders from "./ParentTeacherInterviews/InterviewReminders";
import EventHistory from "./ParentTeacherInterviews/EventHistory";

const parseTime = (time) => {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (hours < 1 || hours > 12 || minutes > 59) return null;

  if (hours === 12) hours = 0;
  if (period === "PM") hours += 12;

  return hours * 60 + minutes;
};

const formatTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")}`;
};

const teacherOptions = [
  { name: "Mrs Sarah Johnson", className: "Year 5" },
  { name: "Mrs Emily Williams", className: "Year 6" },
  { name: "Mr David Smith", className: "Year 4" },
];

const demoEvents = [
  {
    id: "term-4-2026",
    name: "Term 4 Parent–Teacher Interviews 2026",
    date: "11 December 2026",
    location: "Marsden Park Centre",
    status: "Draft",
    summary: { teachers: 2, students: 18, available: 10, booked: 0, notBooked: 18 },
  },
  {
    id: "term-3-2026",
    name: "Term 3 Parent–Teacher Interviews 2026",
    date: "18 September 2026",
    location: "Marsden Park Centre",
    status: "Published",
    summary: { teachers: 3, students: 24, available: 24, booked: 18, notBooked: 6 },
  },
  {
    id: "term-2-2026",
    name: "Term 2 Parent–Teacher Interviews 2026",
    date: "26 June 2026",
    location: "Marsden Park Centre",
    status: "Completed",
    summary: { teachers: 3, students: 22, available: 22, booked: 20, notBooked: 2 },
  },
  {
    id: "term-1-2026",
    name: "Term 1 Parent–Teacher Interviews 2026",
    date: "27 March 2026",
    location: "Marsden Park Centre",
    status: "Completed",
    summary: { teachers: 4, students: 30, available: 30, booked: 27, notBooked: 3 },
  },
];

const teacherStudentCounts = {
  "Mrs Sarah Johnson": 3,
  "Mrs Emily Williams": 0,
  "Mr David Smith": 0,
};

const demoBookings = [
  {
    teacher: "Mrs Sarah Johnson",
    className: "Year 5",
    student: "Oliver Brown",
    parent: "Emma Brown",
    status: "Booked",
    time: "6:00–6:10",
  },
  {
    teacher: "Mrs Sarah Johnson",
    className: "Year 5",
    student: "Ava Wilson",
    parent: "Daniel Wilson",
    status: "Booked",
    time: "6:15–6:25",
  },
  {
    teacher: "Mrs Sarah Johnson",
    className: "Year 5",
    student: "Noah Taylor",
    parent: "Sophie Taylor",
    status: "Not Booked",
    time: "6:30–6:40",
  },
  {
    teacher: "Mrs Emily Williams",
    className: "Year 6",
    student: "Mia Anderson",
    parent: "James Anderson",
    status: "Booked",
    time: "6:00–6:10",
  },
  {
    teacher: "Mrs Emily Williams",
    className: "Year 6",
    student: "Leo Martin",
    parent: "Rachel Martin",
    status: "Not Booked",
    time: "6:15–6:25",
  },
  {
    teacher: "Mr David Smith",
    className: "Year 4",
    student: "Isla Thompson",
    parent: "Mark Thompson",
    status: "Booked",
    time: "6:30–6:40",
  },
];

const initialInvitations = [
  {
    id: 1,
    student: "Oliver Brown",
    parent: "Emma Brown",
    teacher: "Mrs Sarah Johnson",
    className: "Selective",
    classYear: "Year 5",
    status: "Sent",
  },
  {
    id: 2,
    student: "Ava Wilson",
    parent: "Daniel Wilson",
    teacher: "Mrs Sarah Johnson",
    className: "Koalas",
    classYear: "Year 5",
    status: "Not Sent",
  },
  {
    id: 3,
    student: "Noah Taylor",
    parent: "Sophie Taylor",
    teacher: "Mrs Sarah Johnson",
    className: "Year 5A",
    classYear: "Year 5",
    status: "Not Sent",
  },
  {
    id: 4,
    student: "Mia Anderson",
    parent: "James Anderson",
    teacher: "Mrs Emily Williams",
    className: "Year 5B",
    classYear: "Year 5",
    status: "Sent",
  },
  {
    id: 5,
    student: "Leo Martin",
    parent: "Rachel Martin",
    teacher: "Mrs Emily Williams",
    className: "Selective",
    classYear: "Year 6",
    status: "Sent",
  },
  {
    id: 6,
    student: "Isla Thompson",
    parent: "Mark Thompson",
    teacher: "Mr David Smith",
    className: "Koalas",
    classYear: "Year 4",
    status: "Sent",
  },
];

const getGeneratedSlots = (startTime, endTime, slotDuration, gap) => {
  const startMinutes = parseTime(startTime);
  const endMinutes = parseTime(endTime);
  const durationMinutes = Number(slotDuration);
  const gapMinutes = Number(gap);
  const slots = [];

  if (
    startMinutes === null ||
    endMinutes === null ||
    durationMinutes <= 0 ||
    gapMinutes < 0
  ) {
    return slots;
  }

  for (
    let slotStart = startMinutes;
    slotStart + durationMinutes <= endMinutes;
    slotStart += durationMinutes + gapMinutes
  ) {
    slots.push(
      `${formatTime(slotStart)}–${formatTime(slotStart + durationMinutes)}`
    );
  }

  return slots;
};

function AdminInterviewBooking() {
  const interviewAdmin = (() => {
    try {
      return JSON.parse(localStorage.getItem("interviewAdminData") || "null") || {};
    } catch {
      return {};
    }
  })();
  const [teachers, setTeachers] = useState([
    {
      name: "Mrs Sarah Johnson",
      className: "Year 5",
      startTime: "6:00 PM",
      endTime: "7:00 PM",
      slotDuration: "10",
      gap: "5",
    },
  ]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [saveWarning, setSaveWarning] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    location: "",
  });
  const [activeTab, setActiveTab] = useState("setup");
  const [bookingFilters, setBookingFilters] = useState({
    event: "Term 3 Parent–Teacher Interviews 2026",
    teacher: "All",
    className: "All",
    status: "All",
    time: "All",
  });
  const [invitations, setInvitations] = useState(initialInvitations);
  const [selectedInvitationIds, setSelectedInvitationIds] = useState([]);
  const [invitationFilters, setInvitationFilters] = useState({
    event: "Term 3 Parent–Teacher Interviews 2026",
    className: "All",
    classYear: "All",
    status: "All",
  });
  const [invitationMessage, setInvitationMessage] = useState("");

  const selectTeacher = (teacherName) => {
    const teacher = teacherOptions.find((option) => option.name === teacherName);

    if (!teacher || teachers.some((currentTeacher) => currentTeacher.name === teacher.name)) {
      return;
    }

    setTeachers((currentTeachers) => [
      ...currentTeachers,
      {
        ...teacher,
        startTime: "6:00 PM",
        endTime: "7:00 PM",
        slotDuration: "10",
        gap: "5",
      },
    ]);
    setSelectedTeacher("");
    setIsSaved(false);
  };

  const updateTeacher = (teacherName, field, value) => {
    setTeachers((currentTeachers) =>
      currentTeachers.map((teacher) =>
        teacher.name === teacherName ? { ...teacher, [field]: value } : teacher
      )
    );
  };

  const availableSlots = teachers.reduce(
    (total, teacher) =>
      total + getGeneratedSlots(
        teacher.startTime,
        teacher.endTime,
        teacher.slotDuration,
        teacher.gap
      ).length,
    0
  );

  const teacherCapacity = teachers.map((teacher) => {
    const startMinutes = parseTime(teacher.startTime);
    const endMinutes = parseTime(teacher.endTime);
    const availableDuration =
      startMinutes !== null && endMinutes !== null
        ? Math.max(0, endMinutes - startMinutes)
        : 0;
    const bookingCycle = Number(teacher.slotDuration) + Number(teacher.gap);
    const generatedTeacherSlots = getGeneratedSlots(
      teacher.startTime,
      teacher.endTime,
      teacher.slotDuration,
      teacher.gap
    );
    const requiredSlots = teacherStudentCounts[teacher.name] || 0;

    return {
      ...teacher,
      availableDuration,
      bookingCycle,
      availableSlots: generatedTeacherSlots.length,
      requiredSlots,
      insufficient: generatedTeacherSlots.length < requiredSlots,
    };
  });

  const hasInsufficientCapacity = teacherCapacity.some(
    (teacher) => teacher.insufficient
  );

  const handleSaveEvent = () => {
    if (hasInsufficientCapacity) {
      setIsSaved(false);
      setSaveWarning("Event cannot be saved until every teacher has enough interview slots.");
      return;
    }

    setSaveWarning("");
    setIsSaved(true);
  };

  const selectedEvent = demoEvents.find((event) => event.id === selectedEventId);
  const eventSummary = selectedEvent?.summary || {
    teachers: 0,
    students: 0,
    available: 0,
    booked: 0,
    notBooked: 0,
  };

  const handleCreateNewEvent = () => {
    setIsCreatingEvent(true);
    setSelectedEventId("");
    setIsSaved(false);
    setSaveWarning("");
  };

  const handleSaveNewEvent = () => {
    handleSaveEvent();
    if (!hasInsufficientCapacity) {
      setIsCreatingEvent(false);
    }
  };

  const handleOpenEvent = (eventId) => {
    setSelectedEventId(eventId);
    setIsCreatingEvent(false);
    setIsSaved(false);
    setSaveWarning("");
  };

  const filteredBookings = demoBookings.filter((booking) =>
    (bookingFilters.teacher === "All" || booking.teacher === bookingFilters.teacher) &&
    (bookingFilters.className === "All" || booking.className === bookingFilters.className) &&
    (bookingFilters.status === "All" || booking.status === bookingFilters.status) &&
    (bookingFilters.time === "All" || booking.time === bookingFilters.time)
  );

  const updateBookingFilter = (field, value) => {
    setBookingFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }));
  };

  const filteredInvitations = invitations.filter((invitation) =>
    (invitationFilters.className === "All" || invitation.className === invitationFilters.className) &&
    (invitationFilters.classYear === "All" || invitation.classYear === invitationFilters.classYear) &&
    (invitationFilters.status === "All" || invitation.status === invitationFilters.status)
  );

  const toggleInvitation = (invitationId) => {
    setSelectedInvitationIds((currentIds) =>
      currentIds.includes(invitationId)
        ? currentIds.filter((id) => id !== invitationId)
        : [...currentIds, invitationId]
    );
    setInvitationMessage("");
  };

  const toggleAllInvitations = () => {
    const visibleIds = filteredInvitations.map((invitation) => invitation.id);
    const allVisibleSelected = visibleIds.length > 0 &&
      visibleIds.every((id) => selectedInvitationIds.includes(id));

    setSelectedInvitationIds((currentIds) =>
      allVisibleSelected
        ? currentIds.filter((id) => !visibleIds.includes(id))
        : [...new Set([...currentIds, ...visibleIds])]
    );
    setInvitationMessage("");
  };

  const sendInvitations = () => {
    const notSentIds = new Set(
      selectedInvitationIds.filter((id) =>
        invitations.some((invitation) => invitation.id === id && invitation.status === "Not Sent")
      )
    );

    if (notSentIds.size === 0) return;

    setInvitations((currentInvitations) =>
      currentInvitations.map((invitation) =>
        notSentIds.has(invitation.id)
          ? { ...invitation, status: "Sent" }
          : invitation
      )
    );
    setSelectedInvitationIds([]);
    setInvitationMessage("Interview invitations sent successfully.");
  };

  return (
    <div className="admin-interview-page">
      <header className="admin-interview-header">
        <div className="admin-interview-header-inner">
          <div className="admin-interview-brand">
            <img
              src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
              alt="Gem Kids Academy"
            />
          </div>
          <div>
            <span className="admin-eyebrow">Admin workspace</span>
            <h1>Parent–Teacher Interviews</h1>
            <p className="admin-identity">
              Center: {interviewAdmin.center_code || "—"} · Admin: {interviewAdmin.full_name || "—"}
            </p>
          </div>
        </div>
      </header>

      <nav className="admin-tabs" aria-label="Admin interview sections">
        {[
          ["setup", "Event Setup"],
          ["availability", "Teacher Availability"],
          ["allocation", "Teacher Allocation"],
          ["bookings", "Interview Bookings"],
          ["invitations", "Send Invitations"],
          ["reminders", "Reminders"],
          ["history", "Event History"],
        ].map(([tab, label]) => (
          <button
            type="button"
            key={tab}
            className={`admin-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
            aria-selected={activeTab === tab}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="admin-interview-main">
        {activeTab === "setup" && <>
        <section className="admin-existing-events-section">
          <div className="admin-section-heading">
            <div>
              <p className="admin-section-kicker">Demo data</p>
              <h2>Existing Events</h2>
            </div>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={handleCreateNewEvent}
            >
              + Create New Event
            </button>
          </div>
          <div className="existing-events-table-wrap">
            <table className="existing-events-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {demoEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{event.name}</td>
                    <td>{event.date}</td>
                    <td>{event.location}</td>
                    <td>
                      <span className={`event-status ${event.status.toLowerCase()}`}>
                        {event.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="open-event-button"
                        onClick={() => handleOpenEvent(event.id)}
                      >
                        Open Event
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {selectedEvent && !isCreatingEvent && (
          <section className="admin-event-section">
            <div className="selected-event-heading">
              <h2>{selectedEvent.name}</h2>
              <span className={`event-status ${selectedEvent.status.toLowerCase()}`}>
                {selectedEvent.status}
              </span>
            </div>
            <div className="event-fields">
              <label>
                <span>Date</span>
                <input type="text" value={selectedEvent.date} readOnly />
              </label>
              <label>
                <span>Location</span>
                <input type="text" value={selectedEvent.location} readOnly />
              </label>
            </div>
          </section>
        )}

        {isCreatingEvent && (
          <div className="new-event-modal-overlay">
            <section className="new-event-modal" role="dialog" aria-modal="true" aria-labelledby="new-event-title">
              <div className="new-event-modal-header">
                <h2 id="new-event-title">New Interview Event</h2>
                <button
                  type="button"
                  className="new-event-close-button"
                  onClick={() => setIsCreatingEvent(false)}
                  aria-label="Close new event form"
                >
                  ×
                </button>
              </div>
              <div className="event-fields new-event-fields">
                <label>
                  <span>Event Name</span>
                  <input
                    type="text"
                    value={newEvent.name}
                    onChange={(event) => setNewEvent({ ...newEvent, name: event.target.value })}
                    placeholder="Event name"
                  />
                </label>
                <label>
                  <span>Date</span>
                  <input
                    type="text"
                    value={newEvent.date}
                    onChange={(event) => setNewEvent({ ...newEvent, date: event.target.value })}
                    placeholder="Event date"
                  />
                </label>
                <label>
                  <span>Location</span>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(event) => setNewEvent({ ...newEvent, location: event.target.value })}
                    placeholder="Event location"
                  />
                </label>
              </div>
              <div className="new-event-modal-actions">
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={() => setIsCreatingEvent(false)}
                >
                  Cancel
                </button>
                <button type="button" className="admin-save-button" onClick={handleSaveNewEvent}>
                  Save Event
                </button>
              </div>
            </section>
          </div>
        )}

        <section className="admin-summary-section">
          <div className="admin-summary-heading">
            <h2>Event Summary</h2>
            <button type="button" className="admin-save-button" onClick={handleSaveEvent}>
              Save Event
            </button>
          </div>
          <div className="summary-grid">
            <div><strong>{eventSummary.teachers}</strong><span>Teachers</span></div>
            <div><strong>{eventSummary.students}</strong><span>Students</span></div>
            <div><strong>{eventSummary.available}</strong><span>Available</span></div>
            <div><strong>{eventSummary.booked}</strong><span>Booked</span></div>
            <div><strong>{eventSummary.notBooked}</strong><span>Not Booked</span></div>
          </div>
          {isSaved && <p className="save-message" role="status">Event setup saved</p>}
          {saveWarning && <p className="capacity-save-warning" role="alert">{saveWarning}</p>}
        </section>
        </>}

        {activeTab === "availability" && (
          <section className="admin-section">
            <div className="admin-section-heading">
              <h2>Teacher Availability</h2>
            </div>

            <div className="teacher-selection-row">
              <span>Add Teacher</span>
              <select
                value={selectedTeacher}
                onChange={(event) => {
                  setSelectedTeacher(event.target.value);
                  selectTeacher(event.target.value);
                }}
                disabled={teachers.length === teacherOptions.length}
                aria-label="Select a teacher"
              >
                <option value="">Select a teacher</option>
                {teacherOptions.map((option) => {
                  const isAlreadyAdded = teachers.some(
                    (teacher) => teacher.name === option.name
                  );

                  return (
                    <option
                      value={option.name}
                      key={option.name}
                      disabled={isAlreadyAdded}
                    >
                      {option.name} — {option.className}
                      {isAlreadyAdded ? " (already added)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="teacher-table-heading">
              <span>Teacher</span>
              <span>Class</span>
              <span>Availability</span>
            </div>
            {teacherCapacity.map((teacher, index) => (
              <div key={`${teacher.name}-${index}`}>
                <div className="teacher-row">
                  <strong>{teacher.name}</strong>
                  <span>{teacher.className}</span>
                  <span>{teacher.startTime} – {teacher.endTime}</span>
                </div>

                <div className="availability-settings">
                  {[
                    ["Start time", "startTime", "text"],
                    ["End time", "endTime", "text"],
                    ["Slot Duration", "slotDuration", "number"],
                    ["Gap", "gap", "number"],
                  ].map(([label, field, type]) => (
                    <label key={field}>
                      <span>{label}</span>
                      <input
                        type={type}
                        min={type === "number" ? (field === "gap" ? "0" : "1") : undefined}
                        value={teacher[field]}
                        onChange={(event) => updateTeacher(teacher.name, field, event.target.value)}
                      />
                    </label>
                  ))}
                </div>

                <div className="generated-slots">
                  <h3>Generated Slots</h3>
                  <div className="slot-chip-list">
                    {getGeneratedSlots(
                      teacher.startTime,
                      teacher.endTime,
                      teacher.slotDuration,
                      teacher.gap
                    ).map((slot) => (
                      <span className="slot-chip" key={slot}>{slot}</span>
                    ))}
                  </div>
                </div>

                <div className={`capacity-summary ${teacher.insufficient ? "insufficient" : "sufficient"}`}>
                  <span>Students assigned: {teacher.requiredSlots}</span>
                  <span>Available slots: {teacher.availableSlots}</span>
                  {teacher.insufficient ? (
                    <strong>
                      ⚠ Availability insufficient
                      <small>{teacher.requiredSlots - teacher.availableSlots} additional slots required.</small>
                    </strong>
                  ) : (
                    <strong>✓ Availability sufficient</strong>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {activeTab === "allocation" && <TeacherAllocation />}

        {activeTab === "bookings" && (
          <section className="admin-bookings-section">
            <div className="admin-section-heading">
              <div>
                <p className="admin-section-kicker">Demo view</p>
                <h2>Interview Bookings</h2>
              </div>
            </div>

            <div className="booking-filters">
              {[
                ["event", "Event", ["Term 3 Parent–Teacher Interviews 2026"]],
                ["teacher", "Teacher", ["All", ...teacherOptions.map((teacher) => teacher.name)]],
                ["className", "Class", ["All", "Year 4", "Year 5", "Year 6"]],
                ["status", "Booking Status", ["All", "Booked", "Not Booked"]],
                ["time", "Interview Time", ["All", ...[...new Set(demoBookings.map((booking) => booking.time))]]],
              ].map(([field, label, options]) => (
                <label key={field}>
                  <span>{label}</span>
                  <select
                    value={bookingFilters[field]}
                    onChange={(event) => updateBookingFilter(field, event.target.value)}
                  >
                    {options.map((option) => <option value={option} key={option}>{option}</option>)}
                  </select>
                </label>
              ))}
            </div>

            <div className="booking-summary">
              <span><strong>24</strong> Students</span>
              <span><strong>18</strong> Booked</span>
              <span><strong>6</strong> Not Booked</span>
            </div>

            <div className="booking-table-wrap">
              <table className="booking-table">
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Class</th>
                    <th>Student</th>
                    <th>Parent</th>
                    <th>Booking Status</th>
                    <th>Interview Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={`${booking.student}-${booking.time}`}>
                      <td>{booking.teacher}</td>
                      <td>{booking.className}</td>
                      <td>{booking.student}</td>
                      <td>{booking.parent}</td>
                      <td><span className={`booking-status ${booking.status === "Booked" ? "booked" : "not-booked"}`}>{booking.status}</span></td>
                      <td>{booking.time}</td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                    <tr><td colSpan="6" className="no-bookings">No matching bookings</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "invitations" && (
          <section className="admin-invitations-section">
            <div className="admin-section-heading">
              <div>
                <p className="admin-section-kicker">Demo view</p>
                <h2>Send Invitations</h2>
              </div>
            </div>

            <p className="invitation-info">
              Each parent will receive the booking link for their child's allocated teacher.
            </p>

            <div className="invitation-filters">
              {[
                ["event", "Event", ["Term 3 Parent–Teacher Interviews 2026"]],
                ["className", "Class Name", ["All", "Selective", "Koalas", "Year 5A", "Year 5B"]],
                ["classYear", "Class Year", ["All", "Year 4", "Year 5", "Year 6"]],
                ["status", "Invitation Status", ["All", "Not Sent", "Sent"]],
              ].map(([field, label, options]) => (
                <label key={field}>
                  <span>{label}</span>
                  <select
                    value={invitationFilters[field]}
                    onChange={(event) => {
                      setInvitationFilters((currentFilters) => ({
                        ...currentFilters,
                        [field]: event.target.value,
                      }));
                      setInvitationMessage("");
                    }}
                  >
                    {options.map((option) => (
                      <option value={option} key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <div className="invitation-actions">
              <label className="select-all-control">
                <input
                  type="checkbox"
                  checked={filteredInvitations.length > 0 && filteredInvitations.every((invitation) => selectedInvitationIds.includes(invitation.id))}
                  onChange={toggleAllInvitations}
                />
                <span>Select All</span>
              </label>
              <span className="selected-count">
                {selectedInvitationIds.length} {selectedInvitationIds.length === 1 ? "parent" : "parents"} selected
              </span>
              <button
                type="button"
                className="admin-save-button"
                onClick={sendInvitations}
                disabled={selectedInvitationIds.length === 0}
              >
                Send Invitations
              </button>
            </div>

            <div className="invitation-table-wrap">
              <table className="invitation-table">
                <thead>
                  <tr>
                    <th aria-label="Select parent"></th>
                    <th>Student</th>
                    <th>Parent</th>
                    <th>Class Name</th>
                    <th>Class Year</th>
                    <th>Invitation Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvitations.map((invitation) => (
                    <tr key={invitation.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedInvitationIds.includes(invitation.id)}
                          onChange={() => toggleInvitation(invitation.id)}
                          aria-label={`Select ${invitation.parent}`}
                        />
                      </td>
                      <td>{invitation.student}</td>
                      <td>{invitation.parent}</td>
                      <td>{invitation.className}</td>
                      <td>{invitation.classYear}</td>
                      <td>
                        <span className={`invitation-status ${invitation.status === "Sent" ? "sent" : "not-sent"}`}>
                          {invitation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredInvitations.length === 0 && (
                    <tr><td colSpan="6" className="no-bookings">No matching parents</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {invitationMessage && <p className="invitation-success" role="status">{invitationMessage}</p>}
          </section>
        )}

        {activeTab === "reminders" && <InterviewReminders />}

        {activeTab === "history" && <EventHistory />}
      </main>
    </div>
  );
}

export default AdminInterviewBooking;
