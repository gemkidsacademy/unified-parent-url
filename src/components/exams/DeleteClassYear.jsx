import React, { useEffect, useState } from "react";
import "./ManageClassYears.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const DeleteClassYear = ({ centerCode, onClose }) => {
  const [classYears, setClassYears] = useState([]);

  useEffect(() => {
    loadClassYears();
  }, []);

  const loadClassYears = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/class-years-exam-module?center_code=${encodeURIComponent(centerCode)}`
      );

      if (!response.ok) {
        throw new Error("Failed to load class years");
      }

      const data = await response.json();
      setClassYears(data);
    } catch (err) {
      console.error(err);
      alert("Unable to load class years.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this class year?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/delete-class-years-exam-module/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete class year");
      }

      alert("Class year deleted successfully.");

      loadClassYears();
    } catch (err) {
      console.error(err);
      alert("Unable to delete class year.");
    }
  };

  return (
    <div className="manage-class-years">

      <h2>Delete Class Year</h2>

      <div className="form-card">

        <table className="class-year-table">

          <thead>
            <tr>
              <th>Class</th>
              <th>Year</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {classYears.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No class years found.
                </td>
              </tr>
            ) : (
              classYears.map((row) => (
                <tr key={row.id}>
                  <td>{row.class_name}</td>
                  <td>{row.year_name}</td>
                  <td>
                    <button
                      className="danger"
                      onClick={() => handleDelete(row.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}

          </tbody>

        </table>

        <div style={{ marginTop: "20px" }}>
          <button onClick={onClose}>
            Back
          </button>
        </div>

      </div>

    </div>
  );
};

export default DeleteClassYear;