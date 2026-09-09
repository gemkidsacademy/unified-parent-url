import React, { useEffect, useState } from "react";

export default function ChatbotConversationsAdmin({ centerCode, onBack }) {
  const [conversations, setConversations] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    date: "",
    student_id: "",
  });

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);

  const server = "https://krishbackend-production-9603.up.railway.app";

  // ------------------ Fetch conversations ------------------
  const fetchConversations = async (overrideFilters = null) => {
    try {
      setLoading(true);
      setError("");

      const activeFilters = overrideFilters || filters;
      const params = new URLSearchParams();

      if (centerCode) {
          params.append("center_code", centerCode);
      }
      if (activeFilters.date) {
        params.append("date", activeFilters.date);
      }

      if (activeFilters.student_id) {
        params.append("student_id", activeFilters.student_id);
      }

      const url = `${server}/admin/chatbot/conversations?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations (${response.status})`);
      }

      const data = await response.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching chatbot conversations:", err);
      setError("Failed to load chatbot conversations.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Fetch student ids for selected date ------------------
  const fetchStudentsForDate = async (selectedDate) => {
    if (!selectedDate) {
      setStudentOptions([]);
      return;
    }

    try {
      const response = await fetch(
        `${server}/admin/chatbot/conversation-students?date=${encodeURIComponent(selectedDate)}&center_code=${encodeURIComponent(centerCode)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch students for date (${response.status})`);
      }

      const data = await response.json();
      setStudentOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching student ids for selected date:", err);
      setStudentOptions([]);
    }
  };

  // ------------------ Load all conversations on first render ------------------
  useEffect(() => {
    if (!centerCode) return;

    fetchConversations();
  }, [centerCode]);

  // ------------------ Handle filter changes ------------------
  const handleFilterChange = async (e) => {
    const { name, value } = e.target;

    if (name === "date") {
      const updatedFilters = {
        date: value,
        student_id: "",
      };

      setFilters(updatedFilters);
      await fetchStudentsForDate(value);
      return;
    }

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ------------------ Apply filters ------------------
  const handleApplyFilters = () => {
    fetchConversations();
  };

  // ------------------ Clear filters + reload all conversations ------------------
  const handleClearFilters = () => {
    const cleared = {
      date: "",
      student_id: "",
    };

    setFilters(cleared);
    setStudentOptions([]);
    fetchConversations(cleared);
  };

  // ------------------ View one conversation ------------------
  const handleViewConversation = async (conversationId) => {
    try {
      setLoadingConversation(true);
      setSelectedConversation(null);
      setConversationMessages([]);
      setShowConversationModal(true);

      const response = await fetch(
        `${server}/admin/chatbot/conversations/${conversationId}/messages?center_code=${encodeURIComponent(centerCode)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch conversation messages (${response.status})`);
      }

      const data = await response.json();
      setSelectedConversation(data.conversation || null);
      setConversationMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (err) {
      console.error("Error fetching conversation messages:", err);
      setSelectedConversation(null);
      setConversationMessages([]);
    } finally {
      setLoadingConversation(false);
    }
  };

  const closeConversationModal = () => {
    setShowConversationModal(false);
    setSelectedConversation(null);
    setConversationMessages([]);
  };

  // ------------------ Format date/time ------------------
  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  return (
    <div style={{ padding: "1rem" }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "9px 16px",
          marginBottom: "20px",
          border: "1px solid #d6d9e8",
          borderRadius: "8px",
          background: "#ffffff",
          color: "#4f46e5",
          fontSize: "14px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)",
        }}
      >
        ← Back to Chatbot
      </button>

      <h2 style={{ marginBottom: "1rem" }}>Chatbot Conversations</h2>

      {/* ------------------ Filters ------------------ */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "1rem",
          alignItems: "flex-end",
        }}
      >
        {/* Date */}
        <div>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 600 }}>
            Date
          </label>
          <input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            style={{
              padding: "8px 10px",
              minWidth: "220px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Student ID */}
        <div>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 600 }}>
            Student ID
          </label>
          <select
            name="student_id"
            value={filters.student_id}
            onChange={handleFilterChange}
            disabled={!filters.date}
            style={{
              padding: "8px 10px",
              minWidth: "240px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: !filters.date ? "#f5f5f5" : "#fff",
            }}
          >
            <option value="">Select student</option>
            {studentOptions.map((student) => (
              <option key={student.student_id} value={student.student_id}>
                {student.student_id}
                {student.student_name ? ` - ${student.student_name}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <button
          onClick={handleApplyFilters}
          style={primaryButtonStyle}
        >
          Apply Filters
        </button>

        <button
          onClick={handleClearFilters}
          style={secondaryButtonStyle}
        >
          Clear
        </button>
      </div>

      {/* ------------------ States ------------------ */}
      {loading && <p>Loading chatbot conversations...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && conversations.length === 0 && (
        <p>No chatbot conversations found.</p>
      )}

      {/* ------------------ Table ------------------ */}
      {!loading && !error && conversations.length > 0 && (
        <div
          style={{
            maxHeight: "65vh",
            overflowY: "auto",
            overflowX: "auto",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            background: "#fff",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Student ID</th>
                <th style={thStyle}>Student Name</th>
                
                <th style={thStyle}>Class</th>
                <th style={thStyle}>Year</th>
                <th style={thStyle}>Centre</th>
                <th style={thStyle}>Messages</th>
                <th style={thStyle}>Started At</th>
                <th style={thStyle}>Last Message</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((convo) => (
                <tr key={convo.id}>
                  <td style={tdStyle}>{convo.id}</td>
                  <td style={tdStyle}>{convo.student_id || "-"}</td>
                  <td style={tdStyle}>{convo.student_name || "-"}</td>
                  
                  <td style={tdStyle}>{convo.class_name || "-"}</td>
                  <td style={tdStyle}>{convo.student_year || "-"}</td>
                  <td style={tdStyle}>{convo.center_name || "-"}</td>
                  <td style={tdStyle}>{convo.message_count ?? 0}</td>
                  <td style={tdStyle}>{formatDateTime(convo.started_at)}</td>
                  <td style={tdStyle}>{formatDateTime(convo.last_message_at)}</td>
                  <td style={tdStyle}>{convo.status || "-"}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleViewConversation(convo.id)}
                      style={viewButtonStyle}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ------------------ Conversation Modal ------------------ */}
      {showConversationModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0 }}>Conversation Details</h3>
              <button onClick={closeConversationModal} style={closeButtonStyle}>
                ✕
              </button>
            </div>

            {loadingConversation ? (
              <p>Loading conversation...</p>
            ) : (
              <>
                {selectedConversation && (
                  <div style={conversationMetaStyle}>
                    <p><strong>Student ID:</strong> {selectedConversation.student_id || "-"}</p>
                    <p><strong>Student Name:</strong> {selectedConversation.student_name || "-"}</p>
                    
                    <p><strong>Class:</strong> {selectedConversation.class_name || "-"}</p>
                    <p><strong>Started At:</strong> {formatDateTime(selectedConversation.started_at)}</p>
                    <p><strong>Last Message:</strong> {formatDateTime(selectedConversation.last_message_at)}</p>
                  </div>
                )}

                <div style={messagesContainerStyle}>
                  {conversationMessages.length === 0 ? (
                    <p>No messages found for this conversation.</p>
                  ) : (
                    conversationMessages.map((msg) => (
                      <div
                        key={msg.id}
                        style={{
                          ...messageBubbleStyle,
                          alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                          background: msg.role === "user" ? "#ff6a1a" : "#f5e6dc",
                          color: msg.role === "user" ? "#fff" : "#111",
                        }}
                      >
                        <div style={{ fontWeight: 700, marginBottom: "6px" }}>
                          {msg.role === "user"
                            ? "User"
                            : msg.source_name || "Assistant"}
                        </div>

                        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                          {msg.message_text || "-"}
                        </div>

                        {msg.pdf_name && (
                          <div style={{ marginTop: "8px", fontSize: "13px" }}>
                            <strong>PDF:</strong> {msg.pdf_name}
                            {msg.pdf_page ? ` (Page ${msg.pdf_page})` : ""}
                          </div>
                        )}

                        {Array.isArray(msg.response_links) && msg.response_links.length > 0 && (
                          <div style={{ marginTop: "8px" }}>
                            {msg.response_links.map((link, idx) => (
                              <div key={idx}>
                                <a
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: msg.role === "user" ? "#fff" : "#2563eb" }}
                                >
                                  Open PDF Link {idx + 1}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ marginTop: "8px", fontSize: "12px", opacity: 0.8 }}>
                          {formatDateTime(msg.created_at)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "1px solid #ddd",
  fontSize: "14px",
  whiteSpace: "nowrap",
  position: "sticky",
  top: 0,
  background: "#f5f5f5",
  zIndex: 1,
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee",
  fontSize: "14px",
  verticalAlign: "top",
};

const primaryButtonStyle = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  background: "#4f46e5",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButtonStyle = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  background: "#fff",
  color: "#333",
  cursor: "pointer",
  fontWeight: 600,
};

const viewButtonStyle = {
  padding: "8px 14px",
  borderRadius: "8px",
  border: "none",
  background: "#0f766e",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modalContentStyle = {
  width: "90%",
  maxWidth: "1100px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: "14px",
  padding: "1rem",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
};

const closeButtonStyle = {
  border: "none",
  background: "transparent",
  fontSize: "22px",
  cursor: "pointer",
};

const conversationMetaStyle = {
  background: "#f8f8f8",
  padding: "12px",
  borderRadius: "10px",
  marginBottom: "1rem",
};

const messagesContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const messageBubbleStyle = {
  maxWidth: "80%",
  padding: "12px",
  borderRadius: "12px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};