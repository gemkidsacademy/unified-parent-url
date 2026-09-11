import React, { useEffect, useState } from "react";
import "./ManageClassYears.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const ViewClassYears = ({ centerCode, onClose }) => {
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

  return (
    <div className="manage-class-years">

      <h2>View Class Years</h2>

      <div className="form-card">

        <table className="class-year-table">

          <thead>
            <tr>
              <th>Class</th>
              <th>Year</th>
            </tr>
          </thead>

          <tbody>

            {classYears.length === 0 ? (
              <tr>
                <td
                  colSpan="2"
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

export default ViewClassYears;