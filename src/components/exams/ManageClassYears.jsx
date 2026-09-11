import React, { useState } from "react";
import "./ManageClassYears.css";

import AddClassYear from "./AddClassYear";
import EditClassYear from "./EditClassYear";
import ViewClassYears from "./ViewClassYears";
import DeleteClassYear from "./DeleteClassYear";

const ManageClassYears = ({ centerCode, onBack }) => {
  const [mode, setMode] = useState("menu");

  return (
    <div className="manage-class-years">

      <button
        type="button"
        className="manage-class-years-back-button"
        onClick={onBack}
      >
        ← Back to Exams
      </button>

      <h2>Manage Class Years</h2>

      {/* ================= MENU ================= */}

      {mode === "menu" && (
        <div className="user-actions-grid">

          <div
            className="action-card"
            onClick={() => setMode("add")}
          >
            <h3>Add Class Year</h3>
            <p>Create a new class year.</p>
          </div>

          <div
            className="action-card"
            onClick={() => setMode("edit")}
          >
            <h3>Edit Class Year</h3>
            <p>Modify an existing class year.</p>
          </div>

          <div
            className="action-card"
            onClick={() => setMode("view")}
          >
            <h3>View Class Years</h3>
            <p>Browse all configured class years.</p>
          </div>

          <div
            className="action-card danger"
            onClick={() => setMode("delete")}
          >
            <h3>Delete Class Year</h3>
            <p>Remove an existing class year.</p>
          </div>

        </div>
      )}

      {/* ================= ADD ================= */}

      {mode === "add" && (
        <AddClassYear
          centerCode={centerCode}
          onClose={() => setMode("menu")}
        />
      )}

      {/* ================= EDIT ================= */}

      {mode === "edit" && (
        <EditClassYear
          centerCode={centerCode}
          onClose={() => setMode("menu")}
        />
      )}

      {/* ================= VIEW ================= */}

      {mode === "view" && (
        <ViewClassYears
          centerCode={centerCode}
          onClose={() => setMode("menu")}
        />
      )}

      {/* ================= DELETE ================= */}

      {mode === "delete" && (
        <DeleteClassYear
          centerCode={centerCode}
          onClose={() => setMode("menu")}
        />
      )}

    </div>
  );
};

export default ManageClassYears;