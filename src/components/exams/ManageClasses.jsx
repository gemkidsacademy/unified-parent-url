import React, { useState } from "react";
import "./ManageClasses.css";

import AddClassForm from "./AddClassForm";
import ViewClasses from "./ViewClasses";
import EditClassForm from "./EditClassForm";
import DeleteClass from "./DeleteClass";

const ManageClasses = ({ centerCode, onBack }) => {
  const [mode, setMode] = useState("menu");

  if (mode === "add") {
    return (
      <AddClassForm
        centerCode={centerCode}
        onClose={() => setMode("menu")}
      />
    );
  }

  if (mode === "view") {
    return (
      <ViewClasses
        centerCode={centerCode}
        onClose={() => setMode("menu")}
      />
    );
  }

  if (mode === "edit") {
    return (
      <EditClassForm
        centerCode={centerCode}
        onClose={() => setMode("menu")}
      />
    );
  }

  if (mode === "delete") {
    return (
      <DeleteClass
        centerCode={centerCode}
        onClose={() => setMode("menu")}
      />
    );
  }

  return (
    <div className="manage-classes-page">

      <button
        type="button"
        className="manage-classes-back-button"
        onClick={onBack}
      >
        ← Back to Exams
      </button>

      <div className="manage-classes-header">
        <h1>Manage Classes</h1>
        <p>
          Create, view, edit and remove classes for your centre.
        </p>
      </div>

      <div className="manage-classes-grid">

        <article
          className="manage-class-card"
          onClick={() => setMode("add")}
          role="button"
          tabIndex="0"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setMode("add");
            }
          }}
        >
          <div className="manage-class-icon">+</div>

          <h2>Add Class</h2>

          <p>
            Create a new class for your centre.
          </p>

          <span className="manage-class-action">
            Add Class →
          </span>
        </article>

        <article
          className="manage-class-card"
          onClick={() => setMode("view")}
          role="button"
          tabIndex="0"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setMode("view");
            }
          }}
        >
          <div className="manage-class-icon">☰</div>

          <h2>View Classes</h2>

          <p>
            Browse and manage existing classes.
          </p>

          <span className="manage-class-action">
            View Classes →
          </span>
        </article>

        <article
          className="manage-class-card"
          onClick={() => setMode("edit")}
          role="button"
          tabIndex="0"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setMode("edit");
            }
          }}
        >
          <div className="manage-class-icon">✎</div>

          <h2>Edit Class</h2>

          <p>
            Modify existing class information.
          </p>

          <span className="manage-class-action">
            Edit Class →
          </span>
        </article>

        <article
          className="manage-class-card"
          onClick={() => setMode("delete")}
          role="button"
          tabIndex="0"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setMode("delete");
            }
          }}
        >
          <div className="manage-class-icon">−</div>

          <h2>Delete Class</h2>

          <p>
            Remove an existing class from your centre.
          </p>

          <span className="manage-class-action delete-action">
            Delete Class →
          </span>
        </article>

      </div>
    </div>
  );
};

export default ManageClasses;