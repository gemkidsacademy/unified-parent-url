import React, { useEffect, useState } from "react";
import "./ManageTerm.css";

export default function ManageTerms({ loggedInUser, onBack }) {
  const server =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  // edit modal / inline edit state
  const [editingTermId, setEditingTermId] = useState(null);
  const [editForm, setEditForm] = useState({
    term_name: "",
    start_date: "",
    end_date: "",
  });

  const fetchTerms = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${server}/academic-terms-gamified/${loggedInUser.center_code}`
      );

      const data = await res.json();

      if (res.ok) {
        setTerms(data || []);
      } else {
        alert(data.detail || "Failed to load academic terms.");
      }
    } catch (err) {
      console.error(err);
      alert("Unable to fetch academic terms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedInUser?.center_code) {
      fetchTerms();
    }
  }, [loggedInUser]);

  const handleDelete = async (termId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this academic term?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `${server}/academic-term-gamified/${termId}?center_code=${loggedInUser.center_code}`,
        {
            method: "DELETE",
        }
        );

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Academic term deleted successfully.");
        fetchTerms();
      } else {
        alert(data.detail || "Failed to delete academic term.");
      }
    } catch (err) {
      console.error(err);
      alert("Unable to connect to the server.");
    }
  };

  const handleSetCurrent = async (termId) => {
    try {
      const res = await fetch(
        `${server}/academic-term-gamified/${termId}/set-current`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            center_code: loggedInUser.center_code,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Current academic term updated successfully.");
        fetchTerms();
      } else {
        alert(data.detail || "Failed to set current term.");
      }
    } catch (err) {
      console.error(err);
      alert("Unable to connect to the server.");
    }
  };

  const startEdit = (term) => {
    setEditingTermId(term.id);
    setEditForm({
      term_name: term.term_name || "",
      start_date: term.start_date || "",
      end_date: term.end_date || "",
    });
  };

  const cancelEdit = () => {
    setEditingTermId(null);
    setEditForm({
      term_name: "",
      start_date: "",
      end_date: "",
    });
  };

  const handleUpdate = async (termId) => {
    try {
      const res = await fetch(`${server}/academic-term-gamified/${termId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          center_code: loggedInUser.center_code,
          term_name: editForm.term_name,
          start_date: editForm.start_date,
          end_date: editForm.end_date,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Academic term updated successfully.");
        setEditingTermId(null);
        fetchTerms();
      } else {
        alert(data.detail || "Failed to update academic term.");
      }
    } catch (err) {
      console.error(err);
      alert("Unable to connect to the server.");
    }
  };

  return (
    <div className="manage-terms">
      <h2>Manage Academic Terms</h2>

      <p className="description">
        View all academic terms configured for this centre, edit their details,
        delete terms, and choose which one should be the current active term.
      </p>

      <div className="button-row top-actions">
        <button className="back-btn" onClick={onBack}>
          Back
        </button>
      </div>

      {loading ? (
        <p>Loading academic terms...</p>
      ) : terms.length === 0 ? (
        <div className="empty-state">
          No academic terms have been created yet.
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="terms-table">
            <thead>
              <tr>
                <th>Term Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Weeks</th>
                <th>Current Term</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {terms.map((term) => {
                const isEditing = editingTermId === term.id;

                return (
                  <tr key={term.id}>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.term_name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              term_name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        term.term_name
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editForm.start_date}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              start_date: e.target.value,
                            })
                          }
                        />
                      ) : (
                        term.start_date
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editForm.end_date}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              end_date: e.target.value,
                            })
                          }
                        />
                      ) : (
                        term.end_date
                      )}
                    </td>

                    <td>{term.number_of_weeks}</td>

                    <td>
                      {term.is_active ? (
                        <span className="status-badge active">
                          Current
                        </span>
                      ) : (
                        <span className="status-badge inactive">
                          No
                        </span>
                      )}
                    </td>

                    <td>
                      <div className="action-buttons">
                        {isEditing ? (
                          <>
                            <button
                              className="save-btn"
                              onClick={() => handleUpdate(term.id)}
                            >
                              Save
                            </button>

                            <button
                              className="cancel-btn"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="edit-btn"
                              onClick={() => startEdit(term)}
                            >
                              Edit
                            </button>

                            {!term.is_active && (
                              <button
                                className="current-btn"
                                onClick={() => handleSetCurrent(term.id)}
                              >
                                Set Current
                              </button>
                            )}

                            <button
                              className="delete-btn"
                              onClick={() => handleDelete(term.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      
    </div>
  );
}