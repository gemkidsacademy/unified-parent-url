import React, { useEffect, useState } from "react";
import "./ManageTermsList.css";

export default function ManageTermsList({ onBack, centerCode }) {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  const server = "https://krishbackend-production-9603.up.railway.app";

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${server}/list-current-terms-chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          center_code: centerCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to load terms.");
      }

      const data = await response.json();
      setTerms(data);
    } catch (err) {
      console.error(err);
      alert("Unable to load terms.");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (term) => {
    setEditingId(term.id);
    setEditedName(term.term_name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedName("");
  };

  const saveEdit = async (id) => {
    if (!editedName.trim()) {
      alert("Please enter a term name.");
      return;
    }

    try {
      const response = await fetch(`${server}/update-current-term-chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          center_code: centerCode,
          term_name: editedName,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to update term.");
      }

      cancelEditing();
      loadTerms();
    } catch (err) {
      console.error(err);
      alert("Unable to update term.");
    }
  };

  const setCurrent = async (id) => {
    if (!window.confirm("Make this the current term?")) return;

    try {
      const response = await fetch(`${server}/set-current-term-chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          center_code: centerCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to set current term.");
      }

      loadTerms();
    } catch (err) {
      console.error(err);
      alert("Unable to set current term.");
    }
  };

  const deleteTerm = async (id) => {
    if (!window.confirm("Delete this term?")) return;

    try {
      const response = await fetch(`${server}/delete-current-term-chatbot`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          center_code: centerCode,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to delete term.");
      }

      loadTerms();
    } catch (err) {
      console.error(err);
      alert("Unable to delete term.");
    }
  };

  return (
    <div className="manage-terms-page">

      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>

      <h2>Manage Academic Terms</h2>

      <p className="page-description">
        Edit, delete and choose the current academic term for this centre.
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-container">

          <table className="terms-table">

            <thead>
              <tr>
                <th>Term Name</th>
                <th>Current Term</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {terms.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No terms found.
                  </td>
                </tr>
              ) : (
                terms.map((term) => (
                  <tr key={term.id}>

                    <td>
                      {editingId === term.id ? (
                        <input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                          }}
                        />
                      ) : (
                        term.term_name
                      )}
                    </td>

                    <td>
                      {term.is_active ? (
                        <span className="status current">
                          Current
                        </span>
                      ) : (
                        <span className="status inactive">
                          No
                        </span>
                      )}
                    </td>

                    <td>

                      {editingId === term.id ? (
                        <>
                          <button
                            className="action-btn current-btn"
                            onClick={() => saveEdit(term.id)}
                          >
                            Save
                          </button>

                          <button
                            className="action-btn delete-btn"
                            onClick={cancelEditing}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="action-btn edit-btn"
                            onClick={() => startEditing(term)}
                          >
                            Edit
                          </button>

                          {!term.is_active && (
                            <button
                              className="action-btn current-btn"
                              onClick={() => setCurrent(term.id)}
                            >
                              Set Current
                            </button>
                          )}

                          <button
                            className="action-btn delete-btn"
                            onClick={() => deleteTerm(term.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}