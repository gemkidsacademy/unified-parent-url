import { useEffect, useState } from "react";
import "./AdminInterviewBooking.css";
import { API_BASE_URL } from "../config/api";
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

const toApiTime = (timeValue) => {
  const totalMinutes = parseTime(timeValue);

  if (totalMinutes === null) {
    return null;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
};

const formatAvailabilityTime = (timeValue) => {
  const [hours, minutes] = timeValue.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";

  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${period}`;
};

const formatTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")}`;
};

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

const getEventStatus = (eventDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(`${eventDate}T00:00:00`);

  return date >= today ? "Upcoming" : "Completed";
};

function AdminInterviewBooking() {
  const interviewAdmin = (() => {
    try {
      return JSON.parse(localStorage.getItem("interviewAdminData") || "null") || {};
    } catch {
      return {};
    }
  })();
  const [teachers, setTeachers] = useState([]);
  const [expandedTeacherIds, setExpandedTeacherIds] = useState(new Set());
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [saveWarning, setSaveWarning] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [availabilityEventId, setAvailabilityEventId] = useState("");
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");
  const [isEditingEvent, setIsEditingEvent] = useState(false);
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
  const [invitations, setInvitations] = useState([]);
  const [selectedInvitationIds, setSelectedInvitationIds] = useState([]);
  const [invitationFilters, setInvitationFilters] = useState({
    event: "Term 3 Parent–Teacher Interviews 2026",
    className: "All",
    classYear: "All",
    status: "All",
  });
  const [invitationMessage, setInvitationMessage] = useState("");

  const loadEvents = async () => {
    setEventsLoading(true);
    setEventsError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/parent-teacher-interview/events?center_code=${encodeURIComponent(interviewAdmin.center_code || "")}`
      );

      if (!response.ok) {
        throw new Error(`Unable to load events (${response.status})`);
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      setEventsError(error.message || "Unable to load events.");
    } finally {
      setEventsLoading(false);
    }
  };

  const loadTeacherOptions = async () => {
    const response = await fetch(
      `${API_BASE_URL}/parent-teacher-interview/teachers?center_code=${encodeURIComponent(interviewAdmin.center_code || "")}`
    );

    if (!response.ok) return;

    const data = await response.json();
    setTeacherOptions(data.teachers || []);
  };

  const loadTeacherAvailability = async () => {
    if (!availabilityEventId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/parent-teacher-interview/teacher-availability?center_code=${encodeURIComponent(interviewAdmin.center_code || "")}&event_id=${availabilityEventId}`
      );

      if (!response.ok) {
        throw new Error(`Unable to load teacher availability (${response.status})`);
      }

      const data = await response.json();
      const availability = data.availability || [];

      setTeachers((currentTeachers) =>
        currentTeachers.map((teacher) => {
          const savedAvailability = availability.find(
            (record) =>
              Number(record.event_id) === Number(availabilityEventId) &&
              Number(record.teacher_id) === Number(teacher.id)
          );

          if (!savedAvailability) {
            return {
              ...teacher,
              isAvailable: true,
              startTime: "6:00 PM",
              endTime: "7:00 PM",
              slotDuration: "10",
              gap: "5",
            };
          }

          if (!savedAvailability.is_available) {
            return {
              ...teacher,
              isAvailable: false,
              startTime: "6:00 PM",
              endTime: "7:00 PM",
              slotDuration: "10",
              gap: "5",
            };
          }

          return {
            ...teacher,
            isAvailable: true,
            startTime: formatAvailabilityTime(savedAvailability.start_time),
            endTime: formatAvailabilityTime(savedAvailability.end_time),
            slotDuration: String(savedAvailability.slot_duration_minutes),
            gap: String(savedAvailability.gap_minutes),
          };
        })
      );
      setIsSaved(false);
      setSaveWarning("");
    } catch (error) {
      setIsSaved(false);
      setSaveWarning(error.message || "Unable to load teacher availability.");
    }
  };

  useEffect(() => {
    loadEvents();
    loadTeacherOptions();
  }, []);

  useEffect(() => {
    loadTeacherAvailability();
  }, [availabilityEventId]);

  const selectTeacher = (teacherId) => {
    const teacher = teacherOptions.find(
      (option) => String(option.id) === String(teacherId)
    );

    if (!teacher || teachers.some((currentTeacher) => currentTeacher.id === teacher.id)) {
      return;
    }

    setTeachers((currentTeachers) => [
      ...currentTeachers,
      {
        id: teacher.id,
        name: teacher.full_name,
        className: "—",
        isAvailable: true,
        startTime: "6:00 PM",
        endTime: "7:00 PM",
        slotDuration: "10",
        gap: "5",
      },
    ]);
    setExpandedTeacherIds((currentIds) => new Set([...currentIds, teacher.id]));
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

  const toggleTeacher = (teacherId) => {
    setExpandedTeacherIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(teacherId)) {
        nextIds.delete(teacherId);
      } else {
        nextIds.add(teacherId);
      }

      return nextIds;
    });
  };

  const handleSaveAvailability = async (teacher) => {
    if (!availabilityEventId || !teacher?.id) {
      setIsSaved(false);
      setSaveWarning("Please select an event and teacher before saving availability.");
      return;
    }

    const startTime = toApiTime(teacher.startTime);
    const endTime = toApiTime(teacher.endTime);

    if (!startTime || !endTime) {
      setIsSaved(false);
      setSaveWarning("Please enter valid start and end times.");
      return;
    }

    setSaveWarning("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/parent-teacher-interview/teacher-availability`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            center_code: interviewAdmin.center_code,
            event_id: Number(availabilityEventId),
            teacher_id: Number(teacher.id),
            is_available: teacher.isAvailable,
            start_time: teacher.isAvailable ? startTime : null,
            end_time: teacher.isAvailable ? endTime : null,
            slot_duration: teacher.isAvailable
              ? Number(teacher.slotDuration)
              : null,
            gap: teacher.isAvailable
              ? Number(teacher.gap)
              : null,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to save teacher availability.");
      }

      setIsSaved(true);
    } catch (error) {
      setIsSaved(false);
      setSaveWarning(error.message || "Failed to save teacher availability.");
    }
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
    const generatedTeacherSlots = teacher.isAvailable
      ? getGeneratedSlots(
          teacher.startTime,
          teacher.endTime,
          teacher.slotDuration,
          teacher.gap
        )
      : [];
    const requiredSlots = 0;

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

const handleSaveEvent = async () => {

  console.log("SAVE EVENT CLICKED");
  console.log("isEditingEvent:", isEditingEvent);
  console.log("selectedEventId:", selectedEventId);
  console.log("newEvent:", newEvent);

  if (hasInsufficientCapacity) {
    console.log("SAVE BLOCKED: insufficient capacity");

    setIsSaved(false);
    setSaveWarning(
      "Event cannot be saved until every teacher has enough interview slots."
    );
    return;
  }

  console.log("SAVE PASSED CAPACITY CHECK");

  setSaveWarning("");

  try {
    const isEditing = isEditingEvent && selectedEventId;

    const url = isEditing
      ? `${API_BASE_URL}/parent-teacher-interview/events/${selectedEventId}`
      : `${API_BASE_URL}/parent-teacher-interview/events`;

    const response = await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        center_code: interviewAdmin.center_code,
        name: newEvent.name,
        event_date: newEvent.date,
        location: newEvent.location,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail ||
          (isEditing
            ? "Failed to update interview event."
            : "Failed to save interview event.")
      );
    }

    setIsSaved(true);

    await loadEvents();

    // Close the edit/create modal after successful save.
    setIsEditingEvent(false);
    setIsCreatingEvent(false);
    setSelectedEventId(null);

  } catch (error) {
    console.error(
      isEditingEvent
        ? "Failed to update Parent Teacher Interview event:"
        : "Failed to save Parent Teacher Interview event:",
      error
    );

    setIsSaved(false);
    setSaveWarning(
      error.message ||
        (isEditingEvent
          ? "Failed to update interview event."
          : "Failed to save interview event.")
    );
  }
};
  const selectedEvent = events.find((event) => event.id === selectedEventId);
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

  const handleEditEvent = (eventId) => {
    const event = events.find(
      (currentEvent) => currentEvent.id === eventId
    );

    if (!event) return;

    setSelectedEventId(eventId);

    setNewEvent({
      name: event.name,
      date: event.event_date,
      location: event.location,
    });

    setIsEditingEvent(true);
    setIsCreatingEvent(false);
  };

  const handleDeleteEvent = async (eventId) => {
    setSaveWarning("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/parent-teacher-interview/events/${eventId}?center_code=${encodeURIComponent(interviewAdmin.center_code || "")}`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete interview event.");
      }

      await loadEvents();
    } catch (error) {
      setSaveWarning(error.message || "Failed to delete interview event.");
    }
  };

  const filteredBookings = [];

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

  const handleOpenEventSetup = () => {
    window.history.pushState({}, "", "/admin-interview-booking");
    setActiveTab("setup");
  };

  const handleOpenTeacherAvailability = () => {
    setActiveTab("availability");
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
          ["parentTeacherInterview", "Parent Teacher Interview"],
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
        {activeTab === "parentTeacherInterview" && (
          <div className="admin-overview-grid">
            <article
              role="button"
              tabIndex="0"
              className="admin-page-intro admin-overview-card admin-event-setup-card"
              onClick={handleOpenEventSetup}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleOpenEventSetup();
                }
              }}
            >
              <div className="admin-overview-icon" aria-hidden="true">
                📅
              </div>

              <div className="admin-event-setup-content">
                <h2>Event Setup</h2>
                <p>Create and manage interview events.</p>

                <span className="admin-overview-action">
                  Open Event Setup →
                </span>
              </div>
            </article>
            <article
              role="button"
              tabIndex="0"
              className="admin-page-intro admin-overview-card"
              onClick={handleOpenTeacherAvailability}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleOpenTeacherAvailability();
                }
              }}
            >
              <div className="admin-overview-icon" aria-hidden="true">
                🕒
              </div>

              <div className="admin-event-setup-content">
                <h2>Teacher Availability</h2>
                <p>Set each teacher&apos;s available interview times and generate booking slots.</p>

                <span className="admin-overview-action">
                  Open Teacher Availability →
                </span>
              </div>
            </article>
            <article
              role="button"
              tabIndex="0"
              className="admin-page-intro admin-overview-card"
              onClick={() => setActiveTab("allocation")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveTab("allocation");
                }
              }}
            >
              <div className="admin-overview-icon" aria-hidden="true">
                👥
              </div>

              <div className="admin-event-setup-content">
                <h2>Teacher Allocation</h2>
                <p>Assign teachers to classes and automatically link them to students and parents.</p>

                <span className="admin-overview-action">
                  Open Teacher Allocation →
                </span>
              </div>
            </article>
            <article
              role="button"
              tabIndex="0"
              className="admin-page-intro admin-overview-card"
              onClick={() => setActiveTab("bookings")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveTab("bookings");
                }
              }}
            >
              <div className="admin-overview-icon" aria-hidden="true">
                📋
              </div>

              <div className="admin-event-setup-content">
                <h2>Interview Bookings</h2>
                <p>View and manage parent–teacher interview bookings.</p>

                <span className="admin-overview-action">
                  Open Interview Bookings →
                </span>
              </div>
            </article>
            <article
              role="button"
              tabIndex="0"
              className="admin-page-intro admin-overview-card"
              onClick={() => setActiveTab("invitations")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveTab("invitations");
                }
              }}
            >
              <div className="admin-overview-icon" aria-hidden="true">
                ✉️
              </div>

              <div className="admin-event-setup-content">
                <h2>Send Invitations</h2>
                <p>Send booking invitations to parents for their child&apos;s teacher.</p>

                <span className="admin-overview-action">
                  Open Send Invitations →
                </span>
              </div>
            </article>
            <article
              role="button"
              tabIndex="0"
              className="admin-page-intro admin-overview-card"
              onClick={() => setActiveTab("reminders")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveTab("reminders");
                }
              }}
            >
              <div className="admin-overview-icon" aria-hidden="true">
                🔔
              </div>

              <div className="admin-event-setup-content">
                <h2>Reminders</h2>
                <p>Manage automatic interview reminder notifications.</p>

                <span className="admin-overview-action">
                  Open Reminders →
                </span>
              </div>
            </article>
            <article
              role="button"
              tabIndex="0"
              className="admin-page-intro admin-overview-card"
              onClick={() => setActiveTab("history")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveTab("history");
                }
              }}
            >
              <div className="admin-overview-icon" aria-hidden="true">
                🗂️
              </div>

              <div className="admin-event-setup-content">
                <h2>Event History</h2>
                <p>View previous interview events and their historical booking records.</p>

                <span className="admin-overview-action">
                  Open Event History →
                </span>
              </div>
            </article>
          </div>
        )}

        {activeTab === "setup" && <>
        <button
          type="button"
          className="admin-secondary-button"
          onClick={() => setActiveTab("parentTeacherInterview")}
        >
          ← Back to Parent Teacher Interview
        </button>
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
            {eventsLoading && <p role="status">Loading events...</p>}
            {eventsError && <p role="alert">{eventsError}</p>}
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
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.name}</td>
                    <td>{event.event_date}</td>
                    <td>{event.location}</td>
                    <td>
                      <span className={`event-status ${getEventStatus(event.event_date).toLowerCase()}`}>
                        {getEventStatus(event.event_date)}
                      </span>
                    </td>
                    <td>
                      <div className="event-action-buttons">
                        <button
                          type="button"
                          className="open-event-button"
                          onClick={() => handleOpenEvent(event.id)}
                        >
                          Open Event
                        </button>

                        {getEventStatus(event.event_date) !== "Completed" && (
                          <>
                            <button
                              type="button"
                              className="event-edit-button"
                              onClick={() => handleEditEvent(event.id)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="event-delete-button"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
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
              <span className={`event-status ${getEventStatus(selectedEvent.event_date).toLowerCase()}`}>
                {getEventStatus(selectedEvent.event_date)}
              </span>
            </div>
            <div className="event-fields">
              <label>
                <span>Date</span>
                <input type="text" value={selectedEvent.event_date} readOnly />
              </label>
              <label>
                <span>Location</span>
                <input type="text" value={selectedEvent.location} readOnly />
              </label>
            </div>
          </section>
        )}

        {(isCreatingEvent || isEditingEvent) && (
          <div className="new-event-modal-overlay">
            <section className="new-event-modal" role="dialog" aria-modal="true" aria-labelledby="new-event-title">
              <div className="new-event-modal-header">
                <h2 id="new-event-title">
                  {isEditingEvent ? "Edit Interview Event" : "New Interview Event"}
                </h2>
                <button
                  type="button"
                  className="new-event-close-button"
                  onClick={() => {
                    setIsCreatingEvent(false);
                    setIsEditingEvent(false);
                  }}
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
                    type="date"
                    value={newEvent.date}
                    onChange={(event) =>
                      setNewEvent({ ...newEvent, date: event.target.value })
                    }
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
                  onClick={() => {
                    setIsCreatingEvent(false);
                    setIsEditingEvent(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="admin-save-button"
                  onClick={isEditingEvent ? handleSaveEvent : handleSaveNewEvent}
                >
                  {isEditingEvent ? "Save Changes" : "Save Event"}
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
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => setActiveTab("parentTeacherInterview")}
            >
              ← Back to Parent Teacher Interview
            </button>
            <div className="admin-section-heading">
              <h2>Teacher Availability</h2>
            </div>

            <div className="teacher-selection-row">
              <span>Interview Event</span>
              <select
                value={availabilityEventId}
                onChange={(event) => setAvailabilityEventId(event.target.value)}
                aria-label="Select an interview event"
              >
                <option value="">Select an interview event</option>
                {events.map((event) => (
                  <option value={event.id} key={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="teacher-selection-row">
              <span>Add Teacher</span>
              <select
                value={selectedTeacher}
                onChange={(event) => {
                  setSelectedTeacher(event.target.value);
                  selectTeacher(event.target.value);
                }}
                aria-label="Select a teacher"
              >
                <option value="">Select a teacher</option>
                {teacherOptions.map((teacher) => {
                  const isAlreadyAdded = teachers.some(
                    (currentTeacher) => currentTeacher.id === teacher.id
                  );

                  return (
                    <option
                      value={teacher.id}
                      key={teacher.id}
                      disabled={isAlreadyAdded}
                    >
                      {teacher.full_name}
                    </option>
                  );
                })}
              </select>
            </div>

            {teacherCapacity.map((teacher) => {
              const isExpanded = expandedTeacherIds.has(teacher.id);

              return (
              <div className="teacher-card" key={teacher.id}>
                <button
                  type="button"
                  className="teacher-row teacher-accordion-header"
                  aria-expanded={isExpanded}
                  onClick={() => toggleTeacher(teacher.id)}
                >
                  <span className="teacher-person-icon" aria-hidden="true">👤</span>
                  <strong>{teacher.name}</strong>
                  <span>
                    {teacher.isAvailable
                      ? `${teacher.startTime} – ${teacher.endTime}`
                      : "Unavailable"}
                  </span>
                  <span className="teacher-accordion-indicator" aria-hidden="true">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </button>

                {isExpanded && <div className="teacher-availability-content">
                <div className="teacher-availability-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={!teacher.isAvailable}
                      onChange={(event) =>
                        updateTeacher(
                          teacher.name,
                          "isAvailable",
                          !event.target.checked
                        )
                      }
                    />
                    <span>Teacher is unavailable</span>
                  </label>
                </div>

                {teacher.isAvailable && (
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
                )}

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

                <button
                  type="button"
                  className="admin-save-button"
                  onClick={() => handleSaveAvailability(teacher)}
                >
                  Save Availability
                </button>

                {isSaved && <p className="save-message" role="status">Availability saved</p>}
                {saveWarning && <p className="capacity-save-warning" role="alert">{saveWarning}</p>}

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
                </div>}
              </div>
              );
            })}
          </section>
        )}

        {activeTab === "allocation" && (
          <>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={() => setActiveTab("parentTeacherInterview")}
            >
              ← Back to Parent Teacher Interview
            </button>
            <TeacherAllocation />
          </>
        )}

        {activeTab === "bookings" && (
          <>
          <button
            type="button"
            className="admin-secondary-button"
            onClick={() => setActiveTab("parentTeacherInterview")}
          >
            ← Back to Parent Teacher Interview
          </button>
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
                ["teacher", "Teacher", ["All"]],
                ["className", "Class", ["All", "Year 4", "Year 5", "Year 6"]],
                ["status", "Booking Status", ["All", "Booked", "Not Booked"]],
                ["time", "Interview Time", ["All"]],
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
              <span><strong>0</strong> Students</span>
              <span><strong>0</strong> Booked</span>
              <span><strong>0</strong> Not Booked</span>
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
          </>
        )}

        {activeTab === "invitations" && (
          <>
          <button
            type="button"
            className="admin-secondary-button"
            onClick={() => setActiveTab("parentTeacherInterview")}
          >
            ← Back to Parent Teacher Interview
          </button>
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
          </>
        )}

        {activeTab === "reminders" && (
          <>
          <button
            type="button"
            className="admin-secondary-button"
            onClick={() => setActiveTab("parentTeacherInterview")}
          >
            ← Back to Parent Teacher Interview
          </button>
          <InterviewReminders />
          </>
        )}

        {activeTab === "history" && (
          <>
          <button
            type="button"
            className="admin-secondary-button"
            onClick={() => setActiveTab("parentTeacherInterview")}
          >
            ← Back to Parent Teacher Interview
          </button>
          <EventHistory />
          </>
        )}
      </main>
    </div>
  );
}

export default AdminInterviewBooking;
